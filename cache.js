class Cache {
    constructor(data, ttl) {
        this.data = data;
        this.ttl = ttl;
        this.lastUpdate = Date.now();
    }

    isValid() {
        return Date.now() - this.lastUpdate < this.ttl
    }

    getData() {
        if(this.isValid()){
            return this.data;
        } else {
            return null;
        }
    }

    getTimeLeftSec() {
        return (this.ttl - (Date.now() - this.lastUpdate))/1000;
    }
    
    getTimeLeftMin() {
        return (this.ttl - (Date.now() - this.lastUpdate))/60000;
    }

    setData(data) {
        this.data = data;
        this.lastUpdate = Date.now();
    }
}

module.exports = Cache;