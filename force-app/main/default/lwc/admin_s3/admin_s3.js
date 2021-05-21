
class AdminS3 {
    _s3;

    _bucket;

    // Used so that I can make the minimal amount of queries needed, when this is set to true then in renderedCallback it will make queries
    _active;


    constructor(s3) {
        this._s3 = s3;

        if(s3) {
            this._active = true;
        }else {
            this._active = false;

            console.log('S3 passed to AdminS3 constructor is Falsy');
        }

        this._bucket = 'admin-snapshots';
    }


    // See _active above
    isActive() {
        return this._active;
    }

    // See _active above
    activate() {
        this._active = true;
    }

    // See _active above
    deactivate() {
        this._active = false;
    }


    // If all goes well it will return True, otherwise False, and then I can use that to let the User know whats going on
    putSnapshot(key, body) {
        // The _active approach is providing a safeguard to minimize the number of requests made to Amazon as much as possible
        if(this._active) {
            // Make sure to include / in the Key when you call this
            if(key) {
                return new Promise((resolve, reject) => {
                    this._s3.putObject(
                        {
                            Bucket: this._bucket,

                            Body: body,

                            ContentType: 'application/pdf',
    
                            Key: key
                        },
    
                        (err, data) => {
                            if(err) {
                                console.log('Error with S3 request to put object . . .');
                                console.log(err.body ? err.body.message : err.message);
                                console.log('. . .');
    
                                reject(err);
                            }else {
                                resolve(true);
                            }
                        }
                    );
                });
            }else {
                console.error('Invalid S3 Key, currently a Falsy value');
            }
        }else {
            console.log('Cannot add folder to S3, because S3 is not active');
        }


        return result;
    }
}


export { AdminS3 };
