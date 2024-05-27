/**
 * @namespace Websoft.WT.Component.ContinuousFeedback
*/

/**
 * @typedef {number} integer
*/
/**
 * @typedef {number} int
*/
/**
 * @typedef {number} real
*/
/**
 * @typedef {number} bigint
*/
/**
 * @typedef {date} datetime
*/
/**
 * @typedef {boolean} bool
*/

/**
 * @typedef {Object} oPaging
 * @property {boolean} MANUAL
 * @property {?int} INDEX
 * @property {?int} SIZE
 * @property {?int} TOTAL
*/
/**
 * @typedef {Object} oSort
 * @property {?string} FIELD
 * @property {?string} DIRECTION
*/
/**
 * @typedef {Object} oSimpleFilterElem
 * @property {string|string[]} id
 * @property {string} type
 * @property {string|string[]} value
*/
/**
 * @typedef {Object} oCollectionParam
 * @property {?oPaging} paging
 * @property {?oSort} sort
 * @property {?string[]} distincts
 * @property {?oSimpleFilterElem[]} filters
 * @property {?string} fulltext
*/
/**
 * @typedef {Object} oSimpleEntriesElem
 * @property {string} name
 * @property {string} value
*/
/**
 * @typedef {Object} oFormField
 * @property {string} name
 * @property {string} label
 * @property {string} type
 * @property {string} value
 * @property {?oSimpleEntriesElem[]} entries
 * @property {?string} validation
 * @property {boolean} mandatory
 * @property {integer} column
*/
/**
 * @typedef {Object} oSimpleResult
 * @property {number} error
 * @property {string} errorText
*/
/**
 * @typedef {Object} oSimpleResultCount
 * @property {number} error
 * @property {string} errorText
 * @property {number} count
*/



/**
 * @function getReportFeedbackResult
 * @memberof Websoft.WT.Component.ContinuousFeedback
 * @author IG
 * @description Получение отчета по результатам оценки
 * @param {Object} oReportFeedbackResult - Объект отчета
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {bigint} sApplicationID - ID приложения
 * @returns {oSimpleResult}
 */

function getReportFeedbackResult(oReportFeedbackResult, curUserID, sApplicationID){
	oResult = new Object();
	oResult.error = 0;
	oResult.feedback_results = [];
	oResult.columns = [];

	var arrXQueryConditions = [];
	var sXQueryQual = '';

	var teApplication = tools_app.get_application('websoft_continuous_feedback');

	arrResponseTypeIDs = ArrayMerge(ParseJson(teApplication.wvars.GetOptChildByKey( 'response_types' ).value.Value), "This.response_type_id", ",").split(",");
	// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ arrResponseTypeIDs ]]);

	if(ArrayOptFirstElem(arrResponseTypeIDs) != undefined)
	{
		arrXQueryConditions.push("MatchSome($elem/id, (" + ArrayMerge( arrResponseTypeIDs, "This", "," ) + "))");
	}

	sXQueryConditions = ArrayCount( arrXQueryConditions ) > 0 ? ' where ' + ArrayMerge( arrXQueryConditions, 'This', ' and ' ) : '';
	sQuery = 'for $elem in response_types ' + sXQueryConditions +' return $elem';

	arrObjectTypes = ArrayExtract(tools.xquery( sQuery ), "This.object_type", "This.object_type != undefined")
	// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ arrObjectTypes ]]);

	arrXQueryConditions = [];

	arrXQueryConditions.push( "MatchSome($elem/status, ('done')) and $elem/basic_score > 0" );
	if(ArrayOptFirstElem(arrObjectTypes) != undefined)
	{
		arrXQueryConditions.push( "MatchSome($elem/type, (" + ArrayMerge( arrObjectTypes, "XQueryLiteral(This)", "," ) + "))" );
	} else {
		arrXQueryConditions.push( "MatchSome($elem/type, ('collaborator', 'lector', 'project_participant'))" );
	}

	_person_ids_array = [];
	if ( oReportFeedbackResult.parent_object_id.HasValue )
	{
		if ( oReportFeedbackResult.hier_sub_select )
			_person_ids_array = tools.get_sub_person_ids_by_subdivision_id( oReportFeedbackResult.parent_object_id );
		else
			_person_ids_array = ArrayExtract( XQuery( "for $elem in subs where $elem/parent_id = " + oReportFeedbackResult.parent_object_id + " and $elem/type = 'position' and $elem/basic_collaborator_id != null() return $elem" ), "basic_collaborator_id" );
	}

	/* 
		filter response_type_id 
	*/
	if ( oReportFeedbackResult.response_type_id.HasValue )
	{
		arrXQueryConditions.push("MatchSome($elem/response_type_id, (" + oReportFeedbackResult.response_type_id + "))");
	} else {
		arrXQueryConditions.push("MatchSome($elem/response_type_id, (" + ArrayMerge( arrResponseTypeIDs, "OptInt(This)", "," ) + "))");
	}

	sXQueryConditions = ArrayCount( arrXQueryConditions ) > 0 ? ' where ' + ArrayMerge( arrXQueryConditions, 'This', ' and ' ) : '';
	sQuery = 'for $elem in responses ' + sXQueryConditions +' order by $elem/object_name return $elem';
	// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ sQuery ]]);

	arrResponses = tools.xquery( sQuery );
	// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ ArraySelectAll(arrResponses) ]]);

	if(ArrayOptFirstElem(arrResponses) != undefined)
	{
		_responses = [];

		_child = {};
		for(oResponse in arrResponses)
		{
			_child = {
				id: oResponse.id.Value,
				type: oResponse.type.Value,
				response_type_id: oResponse.response_type_id.Value,
				basic_score: oResponse.basic_score.Value,
			};

			if(oResponse.type.Value == "collaborator")
			{
				// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ oResponse ]]);
				_child.person_id = oResponse.object_id.Value;
				_child.person_fullname = oResponse.object_name.Value;
			}
			if(oResponse.type.Value == "project_participant")
			{
				sQuery = "for $elem in project_participants where MatchSome($elem/id, (" + oResponse.object_id.Value + ")) return $elem";
				// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ sQuery ]]);

				arrProjectParticipant = tools.xquery( sQuery );
				if(ArrayOptFirstElem(arrProjectParticipant) != undefined)
				{
					oProjectParticipant = ArrayOptFirstElem(arrProjectParticipant);

					_child.person_id = oProjectParticipant.object_id.Value,
					_child.person_fullname = oProjectParticipant.person_fullname.Value
				}
			}
			if(oResponse.type.Value == "lector")
			{
				oLector = ArrayOptFirstElem(tools.xquery( 'for $elem in lectors where MatchSome( $elem/id, ( ' + OptInt(oResponse.object_id.Value) + ' ) ) return $elem' ));

				if(ArrayOptFirstElem(oLector) != undefined)
				{
					switch(oLector.type)
					{
						case "collaborator":
							_child.person_id = oLector.person_id.Value;
							_child.person_fullname = oLector.lector_fullname.Value;
							break;
						case "invitee":
							_child.type = "invitee";
							_child.person_id = oLector.id.Value;
							_child.person_fullname = oLector.lector_fullname.Value;
							break;
					}
					// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ _lector_array ]]);
				}
			}
			_responses.push(_child);
		}
		// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ _responses ]]);
	}

	if(ArrayOptFirstElem(_person_ids_array) != undefined)
	{
		_arr = [];

		for(_person_id in _person_ids_array)
		{
			for(_response in _responses)
			{
				if(_response.person_id == _person_id)
				{
					_arr.push(_response);
				}
			}
		}
		_responses = _arr;
		// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ _responses ]]);
	}

	_rows = [];
	if(ArrayOptFirstElem(_responses) != undefined)
	{
		arrPerson = ArraySelectDistinct(_responses, 'This.person_id', 'This');
		// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ arrPerson ]]);

		if(ArrayOptFirstElem(arrPerson) != undefined)
		{
			
			for(oPerson in arrPerson)
			{
				_row_child = {};

				switch(oPerson.type)
				{
					case "invitee":
						// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ oPerson ]]);
						_row_child = {
							id: oPerson.person_id,
							person_id: oPerson.person_id,
							person_fullname: oPerson.person_fullname,
							person_position_name: "",
							person_subdivision_name: "",
							person_org_name: "",
						}
						break;
					default:
						// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ oPerson ]]);
						oCollaborator = ArrayOptFirstElem(tools.xquery( 'for $elem in collaborators where MatchSome( $elem/id, ( ' + OptInt(oPerson.person_id) + ' ) ) return $elem' ));
						if(oCollaborator != undefined)
						{
							_row_child = {
								id: oCollaborator.id.Value,
								person_id: oCollaborator.id.Value,
								person_fullname: oCollaborator.fullname.Value,
								person_position_name: oCollaborator.position_name.Value,
								person_subdivision_name: oCollaborator.position_parent_name.Value,
								person_org_name: oCollaborator.org_name.Value,
							}
						}
						break;
				}

				_rows.push(_row_child);
				// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ EncodeJson(_row) ]]);
			}
		}
	}

	// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ ArrayCount(_rows) ]]);

	if(ArrayOptFirstElem(_rows) != undefined)
	{
		for(_row in _rows)
		{
			_response_types = [];

			// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ _row ]]);

			arrResponseType = ArraySelect(_responses, "This.person_id == _row.person_id");
			arrResponseTypeIDs = ArraySelectDistinct(ArrayExtract(_responses, "This.response_type_id"), 'This' );

			// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ arrResponseType ]]);

			for(iResponseTypeID in arrResponseTypeIDs)
			{
				_basic_count = 0;
				// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ _count ]]);
				
				_tmp = ArraySelect(arrResponseType, "This.response_type_id == iResponseTypeID");
				_basic_count = ArrayCount(_tmp);
				_basic_score_sum = ArraySum(_tmp, "basic_score");

				_result = 0;
				if(_basic_count > 0)
					_result = StrRealFixed((_basic_score_sum / _basic_count), 2);

				_response_types.push({
					id: iResponseTypeID,
					task_count: _basic_count,
					assessment_count: _result
				});
			}

			_row.response_types = _response_types;

			oResult.feedback_results.push(_row);
		}

		// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ oResult.feedback_results ]]);
	}

	arrResponseTypeIDs

	sQuery = "for $elem in response_types where MatchSome($elem/id, (" + ArrayMerge(arrResponseTypeIDs, "OptInt(This)", ",") + ")) return $elem";
	_response_types_columns = tools.xquery(sQuery);
	// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ ArraySelectAll(_response_types_columns) ]]);

	if(ArrayOptFirstElem(_response_types_columns) != undefined)
	{
		for(_response_type in _response_types_columns)
		{
			_responseTypesColumns = {
				id: OptInt(_response_type.id.Value),
				name: _response_type.name.Value,
			};

			oResult.columns.push(_responseTypesColumns);
		}
	}
	
	// CallServerMethod( 'tools', 'call_code_library_method', ['libMain', 'Developer', [ oResult ]]);

	return oResult;
}
