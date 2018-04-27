pragma solidity ^0.4.20;
import './interfaces/Pausable.sol';
import './BinkabiTokenCreate.sol';

contract BinkabiEscrow is Pausable {
    enum State {awaiting_payment, awaiting_delivery, delivering, completing, completed, refunding, refunded, cancel}

    BinkabiTokenCreate binkabi;

    constructor(BinkabiTokenCreate _binkabiTokenAddress) public {
        binkabi = BinkabiTokenCreate(_binkabiTokenAddress);
    }

    struct Order {
        address seller;
        address buyer;
        State state;
        string description;
        uint256 amount;
        uint256 ordered_at;
    }
    uint256 public order_id = 0;

    mapping (uint256 => Order) orders;

    function createOrder(address _buyer, address _seller, uint256 _amount) public returns(uint256) {
        require(_buyer != _seller);
        require(_amount > 0);
        uint256 _order_id = order_id + 1;

        orders[_order_id] = Order({
            seller: _seller,
            buyer: _buyer,
            state: State.awaiting_payment,
            description: "",
            amount: _amount,
            ordered_at: now
        });
        order_id += 1;

        return _order_id;
    }

    function cancelOrder(uint256 _order_id) public returns (bool) {
        require(msg.sender == orders[_order_id].seller || msg.sender == orders[_order_id].buyer);
        require(orders[_order_id].state == State.awaiting_payment);
        orders[_order_id].state = State.cancel;

        binkabi.punishMember(msg.sender, 5);
    }

    function getOrderState(uint256 _order_id) public returns(State) {        
        return orders[_order_id].state;
    }

    function paymentOrder(uint256 _order_id) public returns (bool) {
        require(msg.sender == orders[_order_id].buyer);
        bool isPay = binkabi.escrow(msg.sender, orders[_order_id].amount, true);

        if (isPay) {
            orders[_order_id].state = State.awaiting_delivery;
        }

        return isPay;
    }

    function refundingOrder(uint256 _order_id, string reason) public  returns (bool){
        require(msg.sender == orders[_order_id].buyer);
        orders[_order_id].description = reason;
        orders[_order_id].state = State.refunding;

        binkabi.punishMember(orders[_order_id].seller, 5);
        return true;    
    }

    function refundedOrder(uint256 _order_id) public returns (bool) {
        require(msg.sender == orders[_order_id].seller);
        orders[_order_id].state = State.refunded;

        bool isPay = binkabi.escrow(orders[_order_id].buyer, orders[_order_id].amount, false);

        return isPay;
    }

    function deliverOrder(uint256 _order_id) public {
        require(msg.sender == orders[_order_id].seller);
        orders[_order_id].state = State.delivering;        
    }

    function completedOrder(uint256 _order_id) public returns (bool) {
        require(msg.sender == orders[_order_id].buyer);
        orders[_order_id].state = State.completed;  

        bool isPay = binkabi.escrow(orders[_order_id].seller, orders[_order_id].amount, false);

        return isPay;
        
    }

    






}