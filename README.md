node s3logitor { howToRun } { targetBucket }  

Where
      howToRun: can be 'check', 'set', 'help'
  targetBucket: When howToRun is 'set' its the logging target bucket (where logs will be stored)

Examples
  Check all buckets for logging status
    node s3logitor check
      Bucket list:
      mycompany-bucketa: enabled -> mycompany-s3-logs-region1
      mycompany-bucketb: no logging
      mycompany-bucketc: no logging
      enabled: 1
      disabled: 2
      total: 3
  Set all logs without loging to point to a specific bucket
    node s3logitor set mycompany-s3-logs-region2
      {}
      {}
      {}

Notes
  Buckets are region specific.  This will try to add all buckets to the given targetBucket.
  This will cause out of region buckets to throw errors (unable to set, non destructive).
  Simply run multiple times for each region to set log from all the regions.