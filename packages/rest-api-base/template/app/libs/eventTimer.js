const events = require('events');

class EventTimer extends events.EventEmitter {
  constructor(timeout, f){
    super();
    this.timeout = timeout;
    this.run = f.bind(this);
    const self = this;
    this.addListener('loop', async function () {
      function waitTimer() {
        setTimeout(function () {
          self.emit('loop');
        }, self.timeout);
      }
      if (typeof self.run === 'function') {
        const _run = f.apply(this, [waitTimer]);
        if (_run instanceof Promise) {
          _run.then(()=> waitTimer())
            .catch(()=> waitTimer());
        }
      }
    })
  }

  start() {
    this.emit('loop');
  }
}

exports = module.exports = {
  EventTimer,
  getEventTimer: function (timeout, f) {
    return new EventTimer(timeout, f);
  }
}