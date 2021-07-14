import { Table, Entity } from 'dynamodb-toolbox';

const IncidentTable= new Table({
  name: 'Incident',

  partitionKey: 'incident_id',
});

const Incident = new Entity({
    name: 'Incident',
  
    attributes: {
        incident_id: { type: 'string', alias: 'incident_id' },
        slack_ts: { type: 'string', alias: 'slack_ts' }
      },
  
    table: IncidentTable
  })

export default Incident 
 