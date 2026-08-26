const UTRSession = {
    setPaid: function(status) {
        localStorage.setItem('userPaidStatus', status);
    },
    isPaid: function() {
        return localStorage.getItem('userPaidStatus') === 'true';
    },
    clear: function() {
        localStorage.removeItem('userPaidStatus');
    }
};