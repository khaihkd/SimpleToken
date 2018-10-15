pragma solidity ^0.4.20;
import './interfaces/Pausable.sol';
import './PrivateToken.sol';

contract TokenEscrow is Pausable {
    enum State {awaiting_payment, awaiting_delivery, delivering, completed, refunding, refunded, cancel}

    PrivateToken privateToken;
    address public privateTokenTokenAddress;

    constructor(PrivateToken _privateTokenTokenAddress) public {
        privateToken = PrivateToken(_privateTokenTokenAddress);
        privateTokenTokenAddress = _privateTokenTokenAddress;
    }

    struct Order {
        address seller;
        address buyer;
        State state;
        bool payment_buyer;
        bool payment_seller;
        string[] docs_buyer;
        string[] docs_seller;
        uint256 amount_buyer;
        uint256 amount_seller;
        uint256 ordered_at;
    }
    uint256 public order_id = 0;
    uint256[] public order_waiting;
    string[] empty_arr;

    mapping (uint256 => Order) orders;

    function createOrder(address _buyer, address _seller, uint256 _amount_buyer, uint256 _amount_seller) public returns(uint256) {
        require(_buyer != _seller);
        require(_amount_buyer > 0 && _amount_seller > 0);
        uint256 _order_id = order_id + 1;

        orders[_order_id] = Order({
            seller: _seller,
            buyer: _buyer,
            state: State.awaiting_payment,
            payment_buyer: false,
            payment_seller: false,
            docs_buyer: empty_arr,
            docs_seller: empty_arr,
            amount_buyer: _amount_buyer,
            amount_seller: _amount_seller,
            ordered_at: now
        });
        order_id += 1;
        order_waiting.push(_order_id);

        return _order_id;
    }

    function getBuyerOrder(uint256 _order_id) public view returns(address) {
        address _buyer = orders[_order_id].buyer;
        return _buyer;
    }

    function getSellerOrder(uint256 _order_id) public view returns(address) {
        address _seller = orders[_order_id].seller;
        return _seller;
    }  

    function cancelOrder(uint256 _order_id, address _from, uint256 _refund_buyer, uint256 _refund_seller) public {        
        require(orders[_order_id].seller == _from || orders[_order_id].buyer == _from);
        orders[_order_id].state = State.cancel;

        if (_refund_buyer > 0 || _refund_seller > 0){
            privateToken.escrow(orders[_order_id].buyer, orders[_order_id].seller, _refund_buyer, _refund_seller);
        }
        
    }

    function getOrderState(uint256 _order_id) public view returns(State) {        
        return orders[_order_id].state;
    }

    function updatePayment(address _from, uint256 _amount) public {
        require(msg.sender == privateTokenTokenAddress);
        for (uint256 i = 0; i < order_waiting.length; i++) {
            if (orders[order_waiting[i]].buyer == _from && orders[order_waiting[i]].amount_buyer == _amount){
                orders[order_waiting[i]].payment_buyer = true;
                if (orders[order_waiting[i]].payment_seller == true){
                    orders[order_waiting[i]].state = State.awaiting_delivery;
                    delete order_waiting[i];
                }
                break;
            } else if (orders[order_waiting[i]].buyer == _from && orders[order_waiting[i]].amount_buyer == _amount){
                orders[order_waiting[i]].payment_buyer = true;
                if (orders[order_waiting[i]].payment_seller == true){
                    orders[order_waiting[i]].state = State.awaiting_delivery;
                    delete order_waiting[i];
                }
                break;
            }
        }
    }

    function refundingOrder(address _from, uint256 _order_id, string _hash) public {
        require(_from == orders[_order_id].buyer);
        orders[_order_id].state = State.refunding;
        orders[_order_id].docs_buyer.push(_hash);

    }

    function refundedOrder(address _from, uint256 _order_id, uint256 _amount_buyer, uint256 _amount_seller) public returns (bool) {
        require(_from == orders[_order_id].seller);
        orders[_order_id].state = State.refunded;
        privateToken.escrow(orders[_order_id].buyer, _from, _amount_buyer, _amount_seller);
    }

    function deliverOrder(address _from, uint256 _order_id, string _hash) public {
        require(_from == orders[_order_id].seller);
        orders[_order_id].state = State.delivering;   
        orders[_order_id].docs_seller.push(_hash);
    }

    function completedOrder(address _from, uint256 _order_id, string _hash, uint256 _amount_buyer, uint256 _amount_seller) public returns (bool) {
        require(_from == orders[_order_id].buyer);
        orders[_order_id].state = State.completed;          
        orders[_order_id].docs_buyer.push(_hash);

        privateToken.escrow(orders[_order_id].buyer, _from, _amount_buyer, _amount_seller);
    }

    function uploadDocument(address _from, uint256 _order_id, string _hash) public {
        require(_from == orders[_order_id].buyer || _from == orders[_order_id].seller);

        if (_from == orders[_order_id].buyer){
            orders[_order_id].docs_buyer.push(_hash);
        } else if (_from == orders[_order_id].seller) {
            orders[_order_id].docs_seller.push(_hash);
        }
    }

    






}