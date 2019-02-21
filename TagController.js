/**
* Tag Controller
* @author :: Zapbuild
* @description :: To manage tags
*/

module.exports = {
	/**
	* @method : list
	* @author : Zapbuild
	* @description : Listing of all tags
	* @return : [json]
	*/
	list: function (req, res) {
		var data = req.params.all();
		var conditions = {};
		var result = {};

		var options = {
			sort: 'id DESC',
			conditions: conditions,
			populateit: []
		};

		if(data.limit != undefined){
			options.recordsPerPage = data.limit;
			PaginateService.paginate(Tags, req, options, function(tags, page, totalPages, pageRecords, totalRecords) {
				result.records = tags;
				result.pagination = { page:page,total_pages:totalPages,page_records:pageRecords,total_records:totalRecords
				};
				var message = 'TAGS_FOUND';
				if(!tags.length){
					message = 'TAGS_NOT_FOUND';
				}
				return Utils.result(req, res, 'SUCCESS', message, result);
			});

		} else {
			Tags.find(conditions).sort('name asc').exec(function (err, tags) {
				if (err || !tags) {
					result.records = [];
					return Utils.result(req, res, 'SUCCESS', 'TAGS_NOT_FOUND',result);
				}
				result.records = tags;
				var message = 'TAGS_FOUND';
				if(!tags.length){
					message = 'TAGS_NOT_FOUND';
				}
				return Utils.result(req, res, 'SUCCESS', message, result)
			});
		}
	},
	/**
	* @method : detail
	* @author : Zapbuild
	* @parameters: id
	* @description : Details of tag
	* @return : [json]
	*/
	detail: function (req, res) {
		var data = req.params.all();
		if(data.id != undefined && parseInt(data.id)){
			Tags.findOne({id:parseInt(data.id)}).exec(function (err, tagFound) {
				if (err || !tagFound) {
					return Utils.result(req, res, 'NOT_FOUND', 'TAG_NOT_FOUND');
				}
				return Utils.result(req, res, 'SUCCESS', 'TAG_FOUND', tagFound);
			});
		} else {
			return Utils.result(req, res, 'BAD_REQUEST', 'MISSING_PARAMS');
		}
	},
	/**
	* @method : add
	* @author : Zapbuild
	* @description : add new tag
	* @parameters: name
	* @return : [json]
	*/
	add: function (req, res) {
		var data = req.params.all();
		if(data.name == undefined || data.name.trim() == '' ){
			return Utils.result(req, res, 'BAD_REQUEST', 'MISSING_PARAMS');
		} else {
			var tagName = data.name.trim();
			Tags.find({
				name: { 'contains' : tagName}
			}).exec(function(err, tagFound) {
				if(tagFound.length){
					return Utils.result(req, res, 'RECORD_ALREADY_EXISTS', 'TAG_ALREADY_EXISTS');
				} else {
					Tags.create({
						name: tagName
					}).exec(function (err, newTag) {
						if (err) {
							return Utils.result(req, res, 'SERVER_ERROR', 'TAG_NOT_CREATED');
						}
						return Utils.result(req, res, 'RECORD_CREATED', 'TAG_CREATED', newTag);
					});
				}
			});
		}
	},
	/**
	* @method : edit
	* @author : Zapbuild
	* @description : update tag details
	* @parameters: id, name
	* @return : [json]
	*/
	edit: function (req, res) {
		var data = req.params.all();
		if(data.id != undefined && parseInt(data.id) && data.name != undefined && data.name.trim() != ''){
			var tagName = data.name.trim();
			Tags.findOne({name:{ 'contains' : tagName},id:{'not':data.id}}).exec(function (err, tagFound) {
				if(tagFound == undefined){
					Tags.update({
						id: parseInt(data.id)
					},{
						name: tagName
					}).exec(function (err, updatedTag) {
						if (err) {
							return Utils.result(req, res, 'SERVER_ERROR', 'TAG_NOT_UPDATED');
						}
						return Utils.result(req, res, 'SUCCESS', 'TAG_UPDATED', updatedTag);
					});
				} else {
					return Utils.result(req, res, 'RECORD_ALREADY_EXISTS', 'TAG_ALREADY_EXISTS');
				}
			});
		} else {
			return Utils.result(req, res, 'BAD_REQUEST', 'MISSING_PARAMS');
		}
	},
	/**
	* @method : delete
	* @author : Zapbuild
	* @parameters: id
	* @description : Delete tag
	* @return : [json]
	*/
	delete: function (req, res) {
		var data = req.params.all();
		if(data.id != undefined && parseInt(data.id)){
			Tags.findOne({id:parseInt(data.id)}).exec(function (err, tagFound) {
				if(tagFound){
					Tags.destroy({id:tagFound.id}).then(function(deletedItem){
						return Utils.result(req, res, 'SUCCESS', 'TAG_DELETED', deletedItem);
					}).catch(function(err){
						return Utils.result(req, res, 'SERVER_ERROR', 'TAG_NOT_DELETED');
					});
				} else {
					return Utils.result(req, res, 'NOT_FOUND', 'TAG_NOT_FOUND');
				}
			});
		} else {
			return Utils.result(req, res, 'BAD_REQUEST', 'MISSING_PARAMS');
		}
	}
};
