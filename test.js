// var thing = 'missing';
// var messages = {
//   'missing': 'Some fields were missing or not properly completed',
//   'save': 'Unable to save the form information'
// };

// console.log(messages[thing]);

function valid(people) {
  if (!people || !people.length) { return false; }

  var valid = true;
  people.forEach(function (person) {
    if (!person
      || !(typeof person.name === 'string')
      || !(typeof person.phone === 'string')
      || !person.phone.match(/^\+1[\d]{10}$/)) {
      valid = false;
    }
  });
  return valid;
}

console.log(
  valid([
    {
      phone: '+12679925122'
    }
  ])
);
