const userForm = document.getElementById('userForm');
const quantityInput = document.getElementById('quantityInput');
const messageElement = document.getElementById('messageElement');
const outputContainer = document.getElementById('outputContainer');
const nameSelector = document.getElementById('nameSelector');

let userData = [];

function showMessage(text) {
  messageElement.textContent = text;
  messageElement.classList.toggle('d-none', !text);
}

function updateDisplay() {
  outputContainer.innerHTML = '';
  const selectedNameType = nameSelector.value;
  userData.forEach(item => {
    outputContainer.innerHTML += `
      <div class="row text-center user-row">
        <div class="col">${item.name[selectedNameType]}</div>
        <div class="col">${item.gender}</div>
        <div class="col">${item.email}</div>
        <div class="col">${item.location.country}</div>
      </div>`;
  });
}

async function fetchUsers() {
  const count = parseInt(quantityInput.value, 10);
  if (isNaN(count) || count < 1 || count > 1000) {
    showMessage("Enter a number between 1 and 1000.");
    return;
  }
  showMessage('');
  quantityInput.disabled = true;
  quantityInput.placeholder = "Loading...";
  try {
    const response = await fetch(`https://randomuser.me/api/?results=${count}`);
    const result = await response.json();
    userData = result.results;
    updateDisplay();
  } catch {
    showMessage("Failed to fetch users.");
  } finally {
    quantityInput.disabled = false;
    quantityInput.placeholder = "Enter number of random users";
  }
}

userForm.addEventListener('submit', function(e) {
  e.preventDefault();
  fetchUsers();
});

nameSelector.addEventListener('change', updateDisplay);