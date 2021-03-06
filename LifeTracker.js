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
    "submit .new-task": function (event) {
    // This function is called when the new task form is submitted

    var text = event.target.text.value;
    var quadrants = event.target.id;
console.log(event.target);

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
      event.preventDefault();
      var quadrants = $(event.target).data('quadid');
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked, quadrants);
    },

    "click .delete": function (event) {
      console.log("delete");
      event.preventDefault();
      var quadrants = $(event.target).data('quadid');
      Meteor.call("deleteTask", this._id, quadrants);
    },
    "click .toggle-private": function (event) {
      event.preventDefault();
      var quadrants = $(event.target).data('quadid');
      Meteor.call("setPrivate", this._id, ! this.private, quadrants);
    },
    "submit .edit-form": function (event) {
console.log('edit form');
      event.preventDefault();
      var quadrants = $(event.target).data('quadid');
console.log(event.target);
      var newText = event.target.text.value;
      Meteor.call("editTask", this._id, newText, quadrants);
    }

  });

  Template.quadrant.helpers({
    getQuadrantOne: function(){
      if (Session.get("hideCompleted")) {
        return QuadrantOne.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      }
      return QuadrantOne.find({}, {sort: {createdAt: -1}});
    },

    getQuadrantTwo: function(){
      if (Session.get("hideCompleted")) {
        return QuadrantTwo.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      }
      return QuadrantTwo.find({}, {sort: {createdAt: -1}});
    },

    getQuadrantThree: function(){
      if (Session.get("hideCompleted")) {
        return QuadrantThree.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      }
      return QuadrantThree.find({}, {sort: {createdAt: -1}});
    },

    getQuadrantFour: function(){
      if (Session.get("hideCompleted")) {
        return QuadrantFour.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      }
      return QuadrantFour.find({}, {sort: {createdAt: -1}});
    },

    isEqual: function(var1, var2) {
      return var1 === var2;
    },

    incompleteCount: function (quadrants) {
      if (quadrants == "1"){
        return QuadrantOne.find({checked: {$ne: true}}).count();
      } else if (quadrants == "2") {
        return QuadrantTwo.find({checked: {$ne: true}}).count();
      } else if (quadrants == "3") {
        return QuadrantThree.find({checked: {$ne: true}}).count();
      } else if (quadrants == "4") {
        return QuadrantFour.find({checked: {$ne: true}}).count();
      }
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
  },

  editTask: function (taskId, newText, quadrants) {
console.log(taskId, quadrants);
    var task;
    if (quadrants == "1"){
      task = QuadrantOne.findOne(taskId);
    } else if (quadrants == "2"){
      task = QuadrantTwo.findOne(taskId);
    } else if (quadrants == "3"){
      task = QuadrantThree.findOne(taskId);
    } else if (quadrants == "4"){
      task = QuadrantFour.findOne(taskI);
    }
console.log(task);
    var quadId = task.quadId;
    if (task.owner !== Meteor.userId()){
      throw new Metor.Error("not-authorized");
    }

    if (quadrants == "1"){
      QuadrantOne.update(taskId, { $set: { text: newText }});
    } else if (quadrants == "2") {
      QuadrantTwo.update(taskId, { $set: { text: newText }});
    } else if (quadrants == "3") {
      QuadrantThree.update(taskId, { $set: { text: newText }});
    } else if (quadrants == "4") {
      QuadrantFour.update(taskId, { $set: { text: newText }});
    }
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
