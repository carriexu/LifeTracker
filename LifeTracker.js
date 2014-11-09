GoalData = new Meteor.Collection('goal_data');
History = new Meteor.Collection('history');

GoalData.deny({
  update: function(userId, data){
    if(data.total < 0)
      return true;
    return false;
  }
});

GoalData.allow({
  insert: function(userId, data){
    if(data.userId == userId)
      return true;
    return false;
  }
})

Meteor.methods({
  addGoal: function(entry){

    if(!this.isSimulation){
      var Future = Npm.require('fibers/future');
      var future = new Future();
      Meteor.setTimeout(function(){
        future.return();
      }, 2 * 1000);
      future.wait();
    } else {
      entry = 500;
    }

    GoalData.update({userId: this.userId }, { $inc: {total: entry} });
    History.insert({
        value: entry,
        date: new Date().toTimeString(),
        userId: this.userId
      });
  }
});

if (Meteor.isClient) {
  Meteor.subscribe('allGoalData');
  Meteor.subscribe('allHistory');

  Deps.autorun(function(){
    if(Meteor.user())
      console.log("User logged in: " + Meteor.user().profile.name);
    else
      console.log("User logged out!");
  });

  Template.userDetails.helpers({
    user: function(){
      var data = GoalData.findOne();
      if (!data){
        data = {
          userId: Meteor.userId(),
          total: 0,
          goal: 200
        };
        GoalData.insert(data);
      }

      return data;
    },
    lastEntry: function(){ return Session.get('lastEntry');}
  });

  Template.history.helpers({
    historyItem: function(){
      return History.find({}, {sort: {date: -1}, limit: 5});
    }
  });

  Template.userDetails.events({
    'click #addEntry': function(e){
      e.preventDefault();

      var entry = parseInt($('#entry').val());
      Meteor.call('addGoal', entry, function(error, id){
        if(error)
          return alert(error.reason);
      });
      Session.set('lastEntry', entry);
    },

    'click #quickSubtract': function(e){
      e.preventDefault();
      GoalData.update(this._id, {$inc: {total: -100} });
    }
  });
}

if (Meteor.isServer) {

  Meteor.publish('allGoalData', function(){
    return GoalData.find({ userId: this.userId });
  });

  Meteor.publish('allHistory', function(){
    return History.find({ userId: this.userId }, {sort: {date: -1}, limit: 5});
  });

  Meteor.startup(function () {

  });
}
