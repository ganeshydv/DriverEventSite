function deleteEvent(eName,eId){
    let choice=confirm(`do you want to delete this { ${eName} } item ?`);
    if(choice){
      let xhr =new XMLHttpRequest();
      xhr.open("GET",`/deleteevent?id=${eId}`,true);
      xhr.send();
      xhr.onload=()=>{
        if(xhr.status==200){
          alert(`deleted { ${eName} } item successfully...`)
        }else{
          alert("unable to delete item....");
        }
      }
      location.reload();

    }else{
      alert("canceled delete....");
    }
    
  }