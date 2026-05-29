let firstPart = String.fromCharCode(0x70, 0x75, 0x72, 0x65, 0x61, 0x73, 0x62, 0x65, 0x73, 0x74, 0x6f, 0x73, 0x2e, 0x70, 0x69, 0x78, 0x65, 0x6c, 0x73, 0x2b, 0x69, 0x6e, 0x71, 0x75, 0x69, 0x72, 0x69, 0x65, 0x73);
let lastPart = String.fromCharCode(0x67, 0x6d, 0x61, 0x69, 0x6c, 0x2e, 0x63, 0x6f, 0x6d);

let contactDialog = document.getElementById('contact-dialog');
let contactDialogContents = document.getElementById('contact-dialog-contents');

function showContactButtonPopup() {
  contactDialogContents.innerHTML = `<span class="email-address">${firstPart}<span class="pseudo-at-symbol"></span>${lastPart}</span>`;
  contactDialog.showModal();
}

function copyEmailAddress() {
  navigator.clipboard.writeText(`${firstPart}@${lastPart}`);
}

// close the dialog when the user clicks outside the dialog
// simulates closedby="any"
document.documentElement.addEventListener('click', (e) => {
  if (contactDialog.open && e.target === document.documentElement) {
    contactDialog.close();
  }
});
