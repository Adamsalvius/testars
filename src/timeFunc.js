export const getTime = () => {
    const timern = new Date();
    const date =
      timern.getFullYear() + "/" + (timern.getMonth() + 1) + "/" + timern.getDate();
    const time =
      timern.getHours() + ":" + timern.getMinutes() + ":" + timern.getSeconds();
    const dateTime = date + " " + time;
    return dateTime;
  };
  
  