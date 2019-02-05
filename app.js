var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // Calculate percentage
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
        this.percentage = -1;
    }
  };
  // Return percentage
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };


  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal =  function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum = sum + cur.value;
    });
    data.totals[type] = sum;
  };


  var data = {
    allItems: {
        exp: [],
        inc: []
    },
    totals: {
        exp: 0,
        inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;
            
      // [1 2 3 4 5], next ID = 6
      // [1 2 4 6 8], next ID = 9
      // ID = last ID + 1
      
      // Create new ID
      if (data.allItems[type].length > 0) {
          ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
          ID = 0;
      }
      

      // Create new item based on 'inc' or 'exp' type
      if (type === 'exp'){
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }
      // Push it to our data structure
      data.allItems[type].push(newItem);

      // Return the new item so it can be used else where
      return newItem;
    },

    deleteItem: function(type, id) {
      // Return all ids in use as an array
      var ids, index;
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });     
      // retrieve index of the element we want to remove
      index = ids.indexOf(id);
      // Splice index 
      if (index !== -1) {
        data.allItems[type].splice(index, 1)
      }
    },

    calculateBudget : function() {
        // Calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');
        // Calculate the budget:income - expenses
        data.budget = data.totals.inc - data.totals.exp;
        // Calculate the percentage of the income that we spent
        if (data.totals.inc > 0) {
          data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
          data.percentage = -1;
        }     
    },

    calculatePercentages: function() {
            
      /* Example Logic:
      a=20
      b=10
      c=40
      income = 100
      a=20/100=20%
      b=10/100=10%
      c=40/100=40%
      */
      // Loop through expense array
      data.allItems.exp.forEach(function(cur) {
          cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
          return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
      return{
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp:  data.totals.exp,
        percentage: data.percentage
      }
    },
    testing: function() {
      console.log(data);
      // console.log(ID);
    }
  };

})(); // Extra () invokes the function


var UIController = (function() {

  // This Object allows us to name our UI elements once and call them later
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    num = Math.abs(num);
    // Add 2 Decimal spaces
    num = num.toFixed(2);
    // Split number at decimal
    numSplit = num.split('.');

    int = numSplit[0];
    // place comma in the right position if necessary
    if (int.length > 3) {
        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
    }

    dec = numSplit[1];
    
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
        callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return { // Return information as an Object
        type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // Use parseFloat to convert string to number
      }
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;
      // Create HTML string with placeholder text
      
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      
      // Replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      
      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID) {
      // Select Parent Node first than remove child      
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;
      
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      
      fieldsArr = Array.prototype.slice.call(fields);
      
      fieldsArr.forEach(function(current, index, array) {
          current.value = "";
      });
      
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type ='exp';

      document.querySelector(DOMstrings.budgetLabel).textContent =  formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent =  formatNumber(obj.totalExp, 'exp');
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages) {        
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); 
      nodeListForEach(fields, function(current, index) {
          if (percentages[index] > 0) {
              current.textContent = percentages[index] + '%';
          } else {
              current.textContent = '---';
          }
      });
    },

    displayMonth: function() {
      var now, months, month, year;
      
      now = new Date();
      // var christmas = new Date(2016, 11, 25);
      // convert month number to month name 
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    // UX - toggle red color to input fields on change
    changedType: function() {
            
      var fields = document.querySelectorAll(
          DOMstrings.inputType + ',' +
          DOMstrings.inputDescription + ',' +
          DOMstrings.inputValue);
      
      nodeListForEach(fields, function(cur) {
          cur.classList.toggle('red-focus'); 
      });
      // toggle Red class to button
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
      
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  }

})(); // Extra () invokes the function

// GLOBAL APP CONTROLLER
// Using this module to talk to other modules and rename them within
var appController = (function(budgetCtrl, UICtrl) { // Rename modules within

    var setupEventListeners = function() {
      var DOM = UICtrl.getDOMstrings();

      // Fire ctrlAddItem function when user click add button
      document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

      // Fire ctrlAddItem function when user click Enter key
      document.addEventListener('keypress', function(event) {
        if (event.keyCode === 13 || event.which === 13){
          ctrlAddItem();
        }
      });
      // Fire ctrlDeleteItem function when clicked
      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
      // Fire changedType function on change
      document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {       
      // 1. Calculate the budget
      budgetCtrl.calculateBudget();
      // 2. Return the budget
      var budget = budgetCtrl.getBudget();
      // 3. Display the budget on the UI
      UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
      // 1. Calculate percentages
      budgetCtrl.calculatePercentages();
      // 2. Read percentages from the budget controller
      var percentages = budgetCtrl.getPercentages();
      // 3. Update the UI with the new percentages
      UICtrl.displayPercentages(percentages);
    };


    var ctrlAddItem = function() {
      var input, newItem;
      // 1. Get Field Input Data
      input = UICtrl.getInput();

      if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // 3. add the item to the UI
        UICtrl.addListItem(newItem, input.type);
        // 4. clear the fields
        UICtrl.clearFields();
        // 5. Calculate and update budget
        updateBudget();
        // 6. Calculate and update percentages
        updatePercentages();
      }
    };

    var ctrlDeleteItem = function(event) {
      var itemID, splitID, type, ID;

      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
      if (itemID) {
          // Split the id name
          splitID = itemID.split('-');
          type = splitID[0];
          ID = parseInt(splitID[1]); // parst string to number

          // 1. delete the item from the data structure
          budgetCtrl.deleteItem(type, ID);
          
          // 2. Delete the item from the UI
          UICtrl.deleteListItem(itemID);
          
          // 3. Update and show the new budget
          updateBudget();
          
          // 4. Calculate and update percentages
          updatePercentages();

      }
    };

    return {
      init: function() {
          console.log('Application has started.');
          UICtrl.displayMonth();
          UICtrl.displayBudget({
              budget: 0,
              totalInc: 0,
              totalExp: 0,
              percentage: -1
          });
          setupEventListeners();
      }
    };

})(budgetController, UIController); // Invoke other modules so that we can rename above

appController.init();