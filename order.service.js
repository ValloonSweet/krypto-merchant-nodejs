const orders = [];

function addOrder(order) {
    orders.push(order);
    return order;
}

function getOrders() {
    return orders;
}

function getOrderById(orderId) {
    return orders.find(order => order.orderId === orderId);
}

module.exports = {
    addOrder,
    getOrders,
    getOrderById
}; 