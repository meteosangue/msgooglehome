'use strict';

const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');

const app = dialogflow({debug: true});
const myrequest = require('sync-request');
const standard_intro='Il sangue del gruppo ';
const standard_intro2='I gruppi sanguigni '
const standard_end=' è in stato di ';
const standard_end2=' sono in stato di ';

const welcome_message = "Ciao ! Per sapere le scorte di sangue in Italia, puoi dirmi: stato del sangue";


app.intent('Default Welcome Intent', (conv) => {
    
    conv.ask(welcome_message);
});

app.intent('Stato Sangue', (conv) => {
    
    var resp = myrequest('GET', 'https://meteosangue.lotrek.net/api/bloodgroups/');
    const jsonResp = JSON.parse(resp.getBody('utf8'));
    
    var myresp='';
    var group='';
    var cFragile=0;cUrgent=0;cStable=0;
    var fragile='',urgent='';
    for (i=0;i<jsonResp.length;i++)
    {
      group=jsonResp[i].groupid;
      group=group.replace('O','0');
      group=group.replace('+',' positivo ');
      group=group.replace('-',' negativo ');
      switch(jsonResp[i].status) {
        case 'F':
          fragile = fragile + ' ' + group;
          cFragile++;
          break;
        case 'U':
          urgent = urgent + ' ' + group;
          cUrgent++;
          break;
        default:          
          cStable++;
          break;

      }
      
    }
    if (cUrgent===1) {
        myresp=standard_intro+urgent+standard_end+' urgenza. ';
      }  
      else if (cUrgent>1) {
        myresp=standard_intro2+urgent+standard_end2+' urgenza. ';
      }
    
      if (cFragile===1) {
        myresp=myresp+standard_intro+fragile+standard_end+' fragilità. '; 
      }  
      else if (cFragile>1) {
        myresp=myresp+standard_intro2+fragile+standard_end2+' fragilità. ';
      }
  
      if (cStable>=1) myresp=myresp+ ' Per tutti gli altri gruppi sanguigni la scorta è sufficiente';
  
    conv.close(myresp);
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);