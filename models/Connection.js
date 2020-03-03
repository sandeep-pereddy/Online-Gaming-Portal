class Connection{
  constructor(con_Id, con_Name,con_topic,details,location,date,time){
    this.connectionID=con_Id;
    this.connectionName=con_Name;
    this.connectionTopic=con_topic;
    this.details=details;
    this.location=location
    this.date= date;
    this.time= time;
  }
}
module.exports = Connection;
