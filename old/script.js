// connect submit button to the handler
let btn = document.getElementById("intenceForm");
btn.addEventListener('submit', (e) => {
    e.preventDefault();

    url = 'https://script.google.com/macros/s/AKfycbxMWnwUOUa-1sF6FIDGx1Z3nuHJJ3SwHK8loaYrc14y_LT0Ami6N1hOj06dD4Nxvxge/exec?' + new URLSearchParams({
        name:document.getElementById("name").value,
        contact:document.getElementById("contact").value,
        intence:document.getElementById("intence").value,
        date:document.getElementById("dtpick").value,
        ispaid:document.getElementById("ispaid").value,
        whowrite:document.getElementById("whowrite").value});

  
    fetch(url)
        .then(response => response.text())
        .then((text) => {
            alert(text);
        });
});

function getData() {
    fetch("https://jsonplaceholder.typicode.com/users")
        .then(response => response.json())
        .then(json => {
            
            // Create a variable to store HTML
            // let li = `<tr><th>Name</th><th>Email</th></tr>`;
        
            // // Loop through each data and add a table row
            // json.forEach(user => {
            //     li += `<tr>
            //         <td>${user.name} </td>
            //         <td>${user.email}</td>         
            //     </tr>`;
            // });
    
        // Display result
        document.getElementById("users").innerHTML = `${json}`;
    });
}

function postData() {
    // e.preventDefault();
    // url = 'https://script.google.com/macros/s/AKfycbxMWnwUOUa-1sF6FIDGx1Z3nuHJJ3SwHK8loaYrc14y_LT0Ami6N1hOj06dD4Nxvxge/exec?' + new URLSearchParams({
    //     name:document.getElementById("name").value,
    //     contact:document.getElementById("contact").value,
    //     intence:document.getElementById("intence").value,
    //     date:document.getElementById("date").value,
    //     ispaid:document.getElementById("ispaid").value,
    //     whowrite:document.getElementById("whowrite").value});

    // url2 = 'https://script.google.com/macros/s/AKfycbxMWnwUOUa-1sF6FIDGx1Z3nuHJJ3SwHK8loaYrc14y_LT0Ami6N1hOj06dD4Nxvxge/exec?name=wef&contact=qwqwfqf&intence=ZZZZZ&date=2001-09-09&ispaid=on&whowrite=sdfefwef';
    
    // $.ajax({
    //     url: url2,
    //     type: "GET",
    //     success: function (data) {
    //       console.log(data);
    //     }
    //   });
    fetch("https://jsonplaceholder.typicode.com/users")
   
    // Converting received data to JSON
    .then(response => response.json())
    .then(json => {
  
        // Create a variable to store HTML
        let li = `<tr><th>Name</th><th>Email</th></tr>`;
       
        // Loop through each data and add a table row
        json.forEach(user => {
            li += `<tr>
                <td>${user.name} </td>
                <td>${user.email}</td>         
            </tr>`;
        });
  
    // Display result
    // document.getElementById("users").innerHTML = li;
    alert(li)
});
}