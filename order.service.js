const orders = [];

function addOrder(order) {
    order.status = 'pending';
    orders.push(order);
    return order;
}

function getOrders() {
    return orders;
}

function getOrderById(orderId) {
    return orders.find(order => order.orderId === orderId);
}

function updateOrderStatus(orderId, status) {
    const order = orders.find(order => order.orderId === orderId);
    if (order) {
        order.status = status;
        return true;
    }
    return false;
}

module.exports = {
    addOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
}; 