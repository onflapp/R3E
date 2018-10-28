class DropBoxResourceContentWriter implements ContentWriter {
	protected dbx;
	protected filePath: string;
	protected buffer = [];

	constructor(dbx: any, filePath: string) {
		this.dbx = dbx;
		this.filePath = filePath;
	}

	public start(ctype: string) {}

	public write(data: any) {
		this.buffer.push(data);
	}

	public error(error: Error) {
		console.log(error);
	}

	public end(callback: any) {
		let self = this;
		let offset = 0;
		let fileid = null;

		let finish = function() {
			self.dbx.filesUploadSessionFinish({
					cursor: {
						session_id: fileid.session_id,
						offset: offset
					},
					commit: {
						path: self.filePath,
						mode: 'overwrite'
					}
				})
				.then(function(response) {
					if (callback) callback();
				})
				.catch(function(err) {
					console.log(err);
					if (callback) callback();
				});
		};

		let store_chunk = function(data) {
			self.dbx.filesUploadSessionAppend({
					contents: data,
					offset: offset,
					session_id: fileid.session_id
				})
				.then(function(response) {
					if (data.length) offset += data.length;
					else if (data.byteLength) offset += data.byteLength;

					if (self.buffer.length > 0) store_chunk(self.buffer.shift());
					else finish();
				})
				.catch(function(err) {
					console.log(err);
					if (callback) callback();
				});
		};

		this.dbx.filesUploadSessionStart({
				contents: null,
				close: false
			})
			.then(function(response) {
				fileid = response;
				store_chunk(self.buffer.shift());
			})
			.catch(function(err) {
				console.log(err);
			});
	}
}

class DropBoxResource extends StoredResource {
	protected dbx: any;

	constructor(dbx: any, name? : string, base? : string) {
		super(name ? name : '', base ? base : '');

		this.dbx = dbx;
	}

	protected makeNewResource(name: string) {
		let path = this.getStoragePath();
		return new DropBoxResource(this.dbx, name, path);
	}

	protected getMetadataPath(nm ? : string): string {
		if (nm) {
			return this.basePath + '/.' + nm + '.metadata.json';
		}
		else if (this.isDirectory) {
			return this.getStoragePath('.metadata.json');
		}
		else {
			let dirname = Utils.filename_dir(this.basePath);
			let name = Utils.filename(this.basePath);

			return dirname + '/.' + name + '.metadata.json';
		}
	}

	protected storeProperties(callback) {
		let self = this;
		let path = this.getMetadataPath();

		this.dbx.filesUpload({
				contents: JSON.stringify(self.values),
				path: path,
				mute: true,
				mode: 'overwrite'
			})
			.then(function(response) {
				callback();
			})
			.catch(function(error) {
				callback(null);
			});
	}


	protected loadProperties(callback) {
		let path = this.getStoragePath();
		let self = this;
		let load_metadata = function(callback) {
			let metadata = self.getMetadataPath();
			self.dbx.filesDownload({
					path: metadata
				})
				.then(function(data) {
					let reader = new FileReader();
					reader.onload = function(event) {
						let txt = reader.result;
            try { 
              self.values = JSON.parse(txt);
            } 
            catch (ignore) {};
						callback(true);
					};
					reader.readAsText(data.fileBlob);
				})
				.catch(function(error) {
					callback(true);
				});
		};

		if (path) {
			self.dbx.filesGetMetadata({
					path: path
				})
				.then(function(response) {
					if (response['.tag'] === 'file') self.isDirectory = false;
					else self.isDirectory = true;

					load_metadata(callback);
				})
				.catch(function(error) {
					callback(false);
				});
		}
		else {
			callback(true);
		}
	}

	public removeChildResource(name: string, callback) {
		let path = this.getStoragePath(name);
		this.dbx.filesDelete({
				path: path
			})
			.then(function(response) {
				callback();
			})
			.catch(function(error) {
				callback(null);
			});
	}

	public storeChildrenNames(callback) {
		callback();
	}

	protected ensurePathExists(path: string, callback) {
		let self = this;
		self.dbx.filesCreateFolder({
				path: path
			})
			.then(function() {
				callback(true);
			})
			.catch(function(error) {
        if (error.status === 409) callback(true);
        else callback(false);
			});
	}

	public loadChildrenNames(callback: ChildrenNamesCallback) {
		let self = this;
		let path = this.getStoragePath();
		let rv = [];
		self.dbx.filesListFolder({
				path: path
			})
			.then(function(response) {

				for (let i = 0; i < response.entries.length; i++) {
					let item = response.entries[i];
					let name = item.name;
					if (name.charAt(0) === '.') continue;


					rv.push(name);
				}
				callback(rv);
			})
			.catch(function(error) {
				callback(null);
			});
	}

	public getWriter(): ContentWriter {
		if (this.isDirectory) {
			this.isDirectory = false;
		}

		return new DropBoxResourceContentWriter(this.dbx, this.basePath);
	}

	public read(writer: ContentWriter, callback: any) {
		if (this.isDirectory) {
			writer.end(callback);
		}
		else {
			let path = this.getStoragePath();
			let ct = this.getContentType();

			this.dbx.filesDownload({
					path: path
				})
				.then(function(data) {
					let reader = new FileReader();
					reader.onload = function(event) {
						writer.start(ct);
						writer.write(reader.result);
						writer.end(callback);
					};
					reader.readAsArrayBuffer(data.fileBlob);
				})
				.catch(function(error) {
					writer.end(callback);
				});
		}
	}
}
