const HiddenSession = {
    setUser: function(userString) {
        localStorage.setItem('registeredUserData', userString);
    },
    getUser: function() {
        return localStorage.getItem('registeredUserData');
    },
    clear: function() {
        localStorage.removeItem('registeredUserData');
    }
};