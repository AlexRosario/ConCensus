

export const myHeaders = {
	"Content-Type": "application/json",
};



// Define your requests object
export const Requests = {
  getCongressMembers: (zipcode: string) => {
    const url = `/api/getall_mems.php?zip=${zipcode}&output=json`;
    
    return fetch(url, {
      method: "GET",
      headers: myHeaders,
    })
      .then((response) => {
        return response.json();
      })
   
  },
  register: (username: string, password: string, zipcode:string) => {
    const url = "http://localhost:3000/users";

    return fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ "username": username, "password": password, "zipcode": zipcode }),

      
    })
      .then((response) => {
        
        console.log("Response received:", response);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
       
        return response.json();
      })
     
  }
};