// GoalData = new Meteor.Collection('goal_data');
// // GoalData = new Meteor.Collection('goal_data');
// // GoalData = new Meteor.Collection('goal_data');
// // GoalData = new Meteor.Collection('goal_data');

// History = new Meteor.Collection('history');

// GoalData.deny({
//   update: function(userId, data){
//     if(data.total < 0)
//       return true;
//     return false;
//   }
// });

// GoalData.allow({
//   insert: function(userId, data){
//     if(data.userId == userId)
//       return true;
//     return false;
//   }
// })

// Meteor.methods({
//   addGoal: function(entry){

//     // if(!this.isSimulation){
//     //   var Future = Npm.require('fibers/future');
//     //   var future = new Future();
//     //   Meteor.setTimeout(function(){
//     //     future.return();
//     //   }, 2 * 1000);
//     //   future.wait();
//     // } else {
//     //   entry = 500;
//     // }

//     GoalData.update({userId: this.userId }, { $inc: {total: entry} });
//     History.insert({
//         value: entry,
//         date: new Date().toTimeString(),
//         userId: this.userId
//       });
//   }
// });

// if (Meteor.isClient) {
//   Meteor.subscribe('allGoalData');
//   Meteor.subscribe('allHistory');

//   Deps.autorun(function(){
//     if(Meteor.user())
//       console.log("User logged in: " + Meteor.user().profile.name);
//     else
//       console.log("User logged out!");
//   });

//   Template.userDetails.helpers({
//     user: function(){
//       var data = GoalData.findOne();
//       if (!data){
//         data = {
//           userId: Meteor.userId(),
//           // total: 0,
//           // goal: 200
//         };
//         GoalData.insert(data);
//       }

//       return data;
//     },
//     lastEntry: function(){ return Session.get('lastEntry');}
//   });

//   Template.history.helpers({
//     historyItem: function(){
//       return History.find({}, {sort: {date: -1}, limit: 5});
//     }
//   });

//   Template.userDetails.events({
//     'click #addEntry': function(e){
//       e.preventDefault();

//       var entry = parseInt($('#entry').val());
//       Meteor.call('addGoal', entry, function(error, id){
//         if(error)
//           return alert(error.reason);
//       });
//       Session.set('lastEntry', entry);
//     },

//     'click #quickSubtract': function(e){
//       e.preventDefault();
//       GoalData.update(this._id, {$inc: {total: -100} });
//     }
//   });
// }

// if (Meteor.isServer) {

//   Meteor.publish('allGoalData', function(){
//     return GoalData.find({ userId: this.userId });
//   });

//   Meteor.publish('allHistory', function(){
//     return History.find({ userId: this.userId }, {sort: {date: -1}});
//   });

//   Meteor.startup(function () {

//   });
// }

// simple-todos.js
QuadrantOne = new Mongo.Collection("quadrantOne");
QuadrantTwo = new Mongo.Collection("quadrantTwo");
QuadrantThree = new Mongo.Collection("quadrantThree");
QuadrantFour = new Mongo.Collection("quadrantFour");

if (Meteor.isClient) {
  Meteor.subscribe("q1");
  Meteor.subscribe("q2");
  Meteor.subscribe("q3");
  Meteor.subscribe("q4");

  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  Template.body.events({
    "submit form": function (event) {
    // This function is called when the new task form is submitted

    var text = event.target.text.value;
    var quadrants = event.target.id;

    Meteor.call("addTask", text, quadrants);

    // Clear form
    event.target.text.value = "";

    // Prevent default form submit
    return false;
  },

  "change .hide-completed input": function (event) {
    Session.set("hideCompleted", event.target.checked);
  }
});
  Template.task.events({

    "click .toggle-checked": function (event) {
      var quadrants = $(event.target).data('quadid');
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked, quadrants);
    },
    "click .delete": function (event) {
      var quadrants = $(event.target).data('quadid');
      Meteor.call("deleteTask", this._id, quadrants);
    },
    "click .toggle-private": function () {
      var quadrants = $(event.target).data('quadid');
      Meteor.call("setPrivate", this._id, ! this.private, quadrants);
    }
  });

  Template.quadrant.helpers({
    getQuadrantOne: function(){
      console.log(QuadrantOne.find({}, {sort: {createdAt: -1}}));
      return QuadrantOne.find({}, {sort: {createdAt: -1}});
    },

    getQuadrantTwo: function(){
      return QuadrantTwo.find({}, {sort: {createdAt: -1}});
    },

    getQuadrantThree: function(){
      return QuadrantThree.find({}, {sort: {createdAt: -1}});
    },

    getQuadrantFour: function(){
      return QuadrantFour.find({}, {sort: {createdAt: -1}});
    },

    isEqual: function(var1, var2) {
      return var1 === var2;
    }
  });


  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addTask: function (text, quadrants) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
console.log("adding task");
console.log(text, quadrants);

    var data = {
        text: text,
        createdAt: new Date(),
        owner: Meteor.userId(),
        username: Meteor.user().username,
        quadId: quadrants
    };

    if (quadrants == "1" ){
      QuadrantOne.insert(data);
    } else if (quadrants == "2"){
      QuadrantTwo.insert(data);
    } else if (quadrants == "3"){
      QuadrantThree.insert(data);
    } else if (quadrants == "4"){
      QuadrantFour.insert(data);
    }
  },

  deleteTask: function (taskId, quadrants) {
    var task;
    if (quadrants == "1" ){
      task = QuadrantOne.findOne(taskId);
    } else if (quadrants == "2" ){
      task = QuadrantTwo.findOne(taskId);
    } else if (quadrants == "3" ){
      task = QuadrantThree.findOne(taskId);
    } else if (quadrants == "4" ){
      task = QuadrantFour.findOne(taskId);
    }

    var quadId = task.quadId;

    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }

    if (quadrants == "1" ){
      QuadrantOne.remove(taskId);
    } else if (quadrants == "2"){
      QuadrantTwo.remove(taskId);
    } else if (quadrants == "3"){
      QuadrantThree.remove(taskId);
    } else if (quadrants == "4"){
      QuadrantFour.remove(taskId);
    }
    // Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked, quadrants) {
    // var task = Tasks.findOne(taskId);
    var task;
    if (quadrants == "1" ){
      task = QuadrantOne.findOne(taskId);
    } else if (quadrants == "2" ){
      task = QuadrantTwo.findOne(taskId);
    } else if (quadrants == "3" ){
      task = QuadrantThree.findOne(taskId);
    } else if (quadrants == "4" ){
      task = QuadrantFour.findOne(taskId);
    }

    var quadId = task.quadId;

    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }

    if (quadrants == "1" ){
      QuadrantOne.update(taskId, { $set: { checked: setChecked} });
    } else if (quadrants == "2"){
      QuadrantTwo.update(taskId, { $set: { checked: setChecked} });
    } else if (quadrants == "3"){
      QuadrantThree.update(taskId, { $set: { checked: setChecked} });
    } else if (quadrants == "4"){
      QuadrantFour.update(taskId, { $set: { checked: setChecked} });
    }
    // Tasks.update(taskId, { $set: { checked: setChecked} });
  },
  setPrivate: function (taskId, setToPrivate, quadrants) {
    // var task = Tasks.findOne(taskId);

    var task;
    if (quadrants == "1" ){
      task = QuadrantOne.findOne(taskId);
    } else if (quadrants == "2" ){
      task = QuadrantTwo.findOne(taskId);
    } else if (quadrants == "3" ){
      task = QuadrantThree.findOne(taskId);
    } else if (quadrants == "4" ){
      task = QuadrantFour.findOne(taskId);
    }

    var quadId = task.quadId;

    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    if (quadrants == "1" ){
      QuadrantOne.update(taskId, { $set: { private: setToPrivate } });
    } else if (quadrants == "2"){
      QuadrantTwo.update(taskId, { $set: { private: setToPrivate } });
    } else if (quadrants == "3"){
      QuadrantThree.update(taskId, { $set: { private: setToPrivate } });
    } else if (quadrants == "4"){
      QuadrantFour.update(taskId, { $set: { private: setToPrivate } });
    }

    // Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});

if (Meteor.isServer) {
  Meteor.publish("q1", function () {
    return QuadrantOne.find({
      $or: [
      { private: {$ne: true} },
      { owner: this.userId }
      ]
    });
  });

  Meteor.publish("q2", function () {
    return QuadrantTwo.find({
      $or: [
      { private: {$ne: true} },
      { owner: this.userId }
      ]
    });
  });

  Meteor.publish("q3", function () {
    return QuadrantThree.find({
      $or: [
      { private: {$ne: true} },
      { owner: this.userId }
      ]
    });
  });

  Meteor.publish("q4", function () {
    return QuadrantFour.find({
      $or: [
      { private: {$ne: true} },
      { owner: this.userId }
      ]
    });
  });
}
