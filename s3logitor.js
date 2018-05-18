// Load the SDK for JavaScript
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-west-2'});

// Create S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});

var audit_enabled = 0
var audit_disabled = 0
var totalBuckets = -1

var howToRun = process.argv[2]

if (howToRun === "check") {
  getLogging()
} else if (howToRun === "set") {
  if (process.argv[3] !== undefined) {
    setLogging(process.argv[3])
  } else {
    console.log ("When using set you must specifiy a bucket name as the 2nd argument")
  }
} else if (howToRun === "help") {
  help()
} else {
  console.log ("Must set an argument for how to run { 'check' | 'set' | 'help' }")
}

function help () {
  console.log ("node s3logitor { howToRun } { targetBucket }")
  console.log ()
  console.log ("Where")
  console.log ("      howToRun: can be 'check', 'set', 'help'")
  console.log ("  targetBucket: When howToRun is 'set' its the logging target bucket (where logs will be stored)")
  console.log ()
  console.log ("Examples")
  console.log ("Check all buckets for logging status")
  console.log ("  node s3logitor check")
  console.log ("    Bucket List:")
  console.log ("    mycompany-bucketa: enabled -> mycompany-s3-logs-region1")
  console.log ("    mycompany-bucketb: no logging")
  console.log ("    mycompany-bucketc: no logging")
  console.log ("    enabled: 1")
  console.log ("    disabled: 2")
  console.log ("    total: 3")
  console.log ("Set all logs without loging to point to a specific bucket")
  console.log ("  node s3logitor set mycompany-s3-logs-region2")
  console.log ("    {}")
  console.log ("    {}")
  console.log ("    {}")
  console.log ()
  console.log ("Notes")
  console.log ("  Buckets are region specific.  This will try to add all buckets to the given targetBucket.")
  console.log ("  This will cause out of region buckets to throw errors (unable to set, non destructive).")
  console.log ("  Simply run multiple times for each region to set log from all the regions.")
}

function getLogging () {
  // Call S3 to list current buckets
  s3.listBuckets(function(err, data) {
     if (err) {
        console.log("Error", err)
     } else {
        totalBuckets = data.Buckets.length
        console.log("Bucket List:")
        for (let i = 0; i < totalBuckets; i++) {
          let bucketName = JSON.parse(JSON.stringify(data.Buckets[i])).Name

          s3.getBucketLogging({"Bucket":bucketName}, function(err, data) {
            if (err) {
              console.log (err, err.stack)
            } else {
              if (data.LoggingEnabled) {
                console.log (bucketName + ": enabled -> " + data.LoggingEnabled.TargetBucket)
                audit_enabled++
              } else {
                console.log (bucketName + ": no logging")
                audit_disabled++
              }
              if (audit_enabled + audit_disabled == totalBuckets) {
                console.log ("enabled: " + audit_enabled)
                console.log ("disabled: " + audit_disabled)
                console.log ("total: " + totalBuckets)
              }
            }
          })
        }
     }
  })
}

function setLogging (targetName) {
  // Call S3 to list current buckets
  s3.listBuckets(function(err, data) {
     if (err) {
        console.log("Error", err)
     } else {
        totalBuckets = data.Buckets.length
        console.log("Bucket List:")
        for (let i = 0; i < totalBuckets; i++) {
          let bucketName = JSON.parse(JSON.stringify(data.Buckets[i])).Name

          s3.getBucketLogging({"Bucket":bucketName}, function(err, data) {
            if (err) {
              console.log (err, err.stack)
            } else {
              if (data.LoggingEnabled)
                console.log (bucketName + ": enabled -> " + data.LoggingEnabled.TargetBucket)
              else {
                console.log (bucketName + ": no logging")
                var params = {
                  Bucket: bucketName, 
                  BucketLoggingStatus: {
                   LoggingEnabled: {
                    TargetBucket: targetName, 
                    TargetPrefix: bucketName + "/"
                   }
                  }
                 }
                 s3.putBucketLogging(params, function(err, data) {
                   if (err) {
                     console.log (err, err.stack)
                   } else {
                     console.log (data)
                   }
                 })
              }
            }
          })
        }
     }
  })
}