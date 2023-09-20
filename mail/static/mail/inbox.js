document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  document.querySelector('#submit-button').addEventListener('click', send_email);
  

  load_mailbox('inbox');
});

function compose_email(email) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  if(arguments.length === 1) {
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-recipients').disabled = true;
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    document.querySelector('#compose-subject').disabled = true;
    document.querySelector('#compose-body').placeholder = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  }
  else {
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }

}

function send_email() {
  if (document.querySelector('#compose-recipients').value === '') {
    return alert('Recipitents field cannot be empty');
  }

  const recipients = document.querySelector('#compose-recipients').value.split(", ")
  const subject = document.querySelector('#compose-subject').value
  const body = document.querySelector('#compose-body').value

  recipients.forEach(recipient => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipient,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent');
    });
  })
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  const inbox = document.querySelector('#emails-view');
  inbox.innerHTML = '';

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
      console.log(emails);
      document.querySelector("#emails-view").innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`
      emails.forEach(email => {
        let e_div = document.createElement('div');
        e_div.classList.add('e_divs');
        e_div.innerHTML = `<h6>${email.sender}</h6> <div>${email.subject}</div> <div>${email.timestamp}</div>` 
        let color = email.read ? '#E0E0E0' : 'white';
        e_div.style.backgroundColor = color;
      
        e_div.addEventListener('click', () => view_email(email.id))
        e_div.addEventListener('mouseover', () => {
          e_div.style.backgroundColor = "#C0C0C0"
        })
        e_div.addEventListener('mouseout', () => {
          e_div.style.backgroundColor = color
        })
        
        inbox.append(e_div)
      })
    // ... do something else with emails ...
    });
  }

  function view_email(email_id) {

    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    const view = document.querySelector('#email-view');
    clear_email(view);

    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })

    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
    // Print email
      console.log(email);
      const user = document.querySelector('#user-email').textContent;
      fill_email(view, email);

      let button = view.querySelector('#archive-button');
      let reply_button = view.querySelector('#reply-button');
      if(email.sender != user) {
        reply_button.style.display = 'block';
        reply_button.addEventListener('click', () => compose_email(email));
        if(email.archived == true) {
          button.innerHTML = "un-archive";
          button.addEventListener('click', () => unarchive(email.id));
        }
        else if(email.archived == false) {
          button.innerHTML = "archive";
          button.addEventListener('click', () => archive(email.id));
        }
    // ... do something else with email ...
        } else {button.style.display = 'none';}
      });
    
  }

  function archive(email_id) {
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    location.reload();
  }

  function unarchive(email_id) {
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    location.reload();
  }

  function clear_email(view) {
    view.querySelector('#sender').innerHTML = '';
    view.querySelector('#subject').innerHTML = '';
    view.querySelector('#recipient').innerHTML = '';
    view.querySelector('#timestamp').innerHTML = '';
    view.querySelector('#body').innerHTML = '';
    view.querySelector('#archive-button').innerHTML = '';
    view.querySelector('#archive-button').style.display = 'block';
  }

  function fill_email(view, email) {
    view.querySelector('#sender').innerHTML = email.sender;
    view.querySelector('#subject').innerHTML = email.subject;
    view.querySelector('#recipient').innerHTML = email.recipients;
    view.querySelector('#timestamp').innerHTML = email.timestamp;
    view.querySelector('#body').innerHTML = email.body;
    view.querySelector('#reply-button').style.display = 'none';
  }