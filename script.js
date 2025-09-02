const userForm = document.getElementById('userForm');
const quantityInput = document.getElementById('quantityInput');
const messageElement = document.getElementById('messageElement');
const outputContainer = document.getElementById('outputContainer');
const nameSelector = document.getElementById('nameSelector');

let userData = [];
let currentIndex = null; // for modal

function showMessage(text) { // error msg
    messageElement.textContent = text;
    messageElement.classList.toggle('d-none', !text);
}

function updateDisplay() { // user list table
    outputContainer.innerHTML = '';
    const selectedNameType = nameSelector.value;
    userData.forEach((item, index) => {
        outputContainer.innerHTML += `
        <div class="row text-center user-row" data-index="${index}">
        <div class="col">${item.name[selectedNameType]}</div>
        <div class="col">${item.gender}</div>
        <div class="col">${item.email}</div>
        <div class="col">${item.location.country}</div>
        </div>`;
    });

    document.querySelectorAll('.user-row').forEach(row => { // modal double click
        row.addEventListener('dblclick', () => {
            currentIndex = row.getAttribute('data-index');
            openModal(userData[currentIndex]);
        });
    });
}

function openModal(user) { // modal user info
    document.getElementById('modalPicture').src = user.picture.large;
    document.getElementById('modalName').textContent =
    `${user.name.title} ${user.name.first} ${user.name.last}`;
    document.getElementById('modalAddress').textContent =
    `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
    document.getElementById('modalEmail').textContent = user.email;
    document.getElementById('modalPhone').textContent = user.phone;
    document.getElementById('modalCell').textContent = user.cell;
    document.getElementById('modalDob').textContent = new Date(user.dob.date).toLocaleDateString();
    document.getElementById('modalGender').textContent = user.gender;

    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
}

document.getElementById('deleteUser').addEventListener('click', () => { // delete
    if (currentIndex !== null) {
        userData.splice(currentIndex, 1);
        updateDisplay();
        bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
    }
});

document.querySelectorAll('.edit-pill').forEach(btn => { // edit btn for each info
    btn.addEventListener('click', () => {
        if (currentIndex === null) return;
        const field = btn.getAttribute('data-field');
        const user = userData[currentIndex];

        let currentVal = "";
        if (field === "name") {
            currentVal = `${user.name.title} ${user.name.first} ${user.name.last}`;
        } else if (field === "address") {
            currentVal = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
        } else if (field === "dob") {
            currentVal = new Date(user.dob.date).toISOString().split("T")[0]; // YYYY-MM-DD
        } else {
            currentVal = user[field];
        }

        if (field === "name") { // just for name
            const newVal = prompt(`Edit ${field}:`, currentVal);
            if (!newVal) return;
            const parts = newVal.split(" ");
            user.name.title = parts[0] || user.name.title; // mr/ms
            user.name.first = parts[1] || user.name.first; 
            user.name.last = parts[2] || user.name.last;
        } else if (field === "address") { // edit address 1 by 1
            const newStreetNumber = prompt("Edit Street Number:", user.location.street.number);
            if (newStreetNumber) user.location.street.number = newStreetNumber;

            const newStreetName = prompt("Edit Street Name:", user.location.street.name);
            if (newStreetName) user.location.street.name = newStreetName;

            const newCity = prompt("Edit City:", user.location.city);
            if (newCity) user.location.city = newCity;

            const newState = prompt("Edit State:", user.location.state);
            if (newState) user.location.state = newState;

            const newCountry = prompt("Edit Country:", user.location.country);
            if (newCountry) user.location.country = newCountry;

            const newPostcode = prompt("Edit Postcode:", user.location.postcode);
            if (newPostcode) user.location.postcode = newPostcode;

        } else if (field === "dob") { // dob w/ check
            const newVal = prompt("Edit Date of Birth (YYYY-MM-DD):", currentVal);
            if (!newVal) return;

            const parsedDate = new Date(newVal);
            if (!isNaN(parsedDate.getTime())) {
                user.dob.date = parsedDate.toISOString(); // store date
            } else {
                alert("Invalid date. Please enter in YYYY-MM-DD format.");
            }
        } else { // others
            const newVal = prompt(`Edit ${field}:`, currentVal);
            if (!newVal) return;
            user[field] = newVal;
        }

        updateDisplay();
        openModal(user);
    });
});

async function fetchUsers() { // api stuff
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

userForm.addEventListener('submit', function(e) { // send req
    e.preventDefault();
    fetchUsers();
});

nameSelector.addEventListener('change', updateDisplay); // first or last name pick

// Fix: ensure modal backdrop is always cleaned up
const userModalEl = document.getElementById('userModal'); // fix for modal when closing
userModalEl.addEventListener('hidden.bs.modal', () => {
    document.body.classList.remove('modal-open');
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(b => b.remove());
});
