/**
 * @namespace Websoft.WT.Project
*/
/** 
 * @typedef {import('./classes_library').integer} integer
*/
/**
 * @typedef {import('./classes_library').int} int 
*/
/**
 * @typedef {import('./classes_library').real} real 
*/
/**
 * @typedef {import('./classes_library').datetime} datetime 
*/
/**
 * @typedef {import('./classes_library').bool} bool 
*/
/**
 * @typedef {import('./classes_library').object} object 
*/
/**
 * @typedef {import('./classes_library').display_form} display_form 
*/
/**
 * @typedef {import('./classes_library').select_object} select_object 
*/
/**
 * @typedef {import('./classes_library').XmDoc} XmDoc 
*/
/**
 * @typedef {import('./classes_library').XmElem} XmElem 
*/
/**
 * @typedef {import('./classes_library').oCollectionParam} oCollectionParam
*/
/**
 * @typedef {import('./classes_library').oSimpleFilterElem} oSimpleFilterElem
*/
/**
 * @typedef {import('./classes_library').oPaging} oPaging
*/
/**
 * @typedef {import('./classes_library').oSort} oSort
*/
/**
 * @typedef {import('./classes_library').oSimpleEntrisElem} oSimpleEntrisElem
*/
/**
 * @typedef {import('./classes_library').oSimpleElem} oSimpleElem
*/
/**
 * @typedef {import('./classes_library').oDispRole} oDispRole
*/
/**
 * @typedef {import('./classes_library').FormField} FormField
*/
/**
 * @typedef {import('./classes_library').FormButton} FormButton
*/
/**
 * @typedef {import('./classes_library').WTLPEForm} WTLPEForm
*/
/**
 * @typedef {import('./classes_library').WTLPEFormResult} WTLPEFormResult
*/
/**
 * @typedef {import('./classes_library').WTLPECountResult} WTLPECountResult
*/
/**
 * @typedef {import('./classes_library').WTLPETextResult} WTLPETextResult
*/
/**
 * @typedef {import('./classes_library').oSimpleResult} oSimpleResult
*/
/**
 * @typedef {import('./classes_library').oSimpleResultCount} oSimpleResultCount
*/
/**
 * @typedef {import('./classes_library').oSimpleResultParagraph} oSimpleResultParagraph
*/
/**
 * @typedef {import('./classes_library').oSimpleRAResult} oSimpleRAResult
*/
/**
 * @typedef {import('./classes_library').WTScopeWvars} WTScopeWvars
*/





function alerd( sText, bDebug )
{
	/*
			запись сообщения в лог
			sText		- сообщение
			bDebug		- писать или нет сообщение
	*/
	try
	{
		if( bDebug == undefined || bDebug == null )
			throw "error";
		bDebug = tools_web.is_true( bDebug );
	}
	catch( ex )
	{
		bDebug = false;
	}
	if( bDebug )
		alert( 'project_library.js ' + sText )
}

/**
 * @typedef {Object} oTaskType
 * @property {bigint} id - ID типа задачи
 * @property {string} code - Код типа задачи
 * @property {string} name - Название типа задачи
 * @property {int} task_count - Количество задач с данным типом задачи
*/
/**
 * @typedef {Object} WTTaskTypeResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oTaskType[]} array – Массив типов задач.
*/
/**
 * @function GetTaskTypes
 * @memberof Websoft.WT.Project
 * @description Получение списка типов задач.
 * @param {bigint} iCurUserID - ID сотрудника.
 * @param {string[]} aWorkSpace - Типы задач для отображения
 * @param {boolean} bVirtualTask - Отображать виртуальные задачи да/нет
 * @param {string[]} aReturnData - перечень атрибутов, которые будут вычисляться
 * @param {string} sAccessType - Тип доступа: "admin"/"manager"/"admin_workspace"/"moderator"/"observer"/"auto"
 * @param {string} sApplication - код приложения для определения доступа
 * @param {string} sXQueryQual - строка XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {WTTaskTypeResult}
 */
function GetTaskTypes( iCurUserID, aWorkSpace, bVirtualTask, aReturnData, sAccessType, sApplication, sXQueryQual, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	oRes.paging = oCollectionParams.paging;
	
	var arrConds = [];
	var arrFilters = oCollectionParams.filters;
	iCurUserID = OptInt( iCurUserID, 0);
	
	if(sAccessType == "auto")
	{
		iApplicationID = OptInt(sApplication);
		if(iApplicationID != undefined)
		{
			sApplication = ArrayOptFirstElem(tool.xquery("for $elem in applications where $elem/id = " + iApplicationID + " return $elem/Fields('code')"), {code: ""}).code;
		}
		var iApplLevel = tools.call_code_library_method( "libApplication", "GetPersonApplicationAccessLevel", [ iCurUserID, sApplication ] );
		
		if(iApplLevel >= 10)
		{
			sAccessType = "admin";
		}
		else if(iApplLevel >= 7)
		{
			sAccessType = "manager";
		}
		else if(iApplLevel >= 5)
		{
			sAccessType = "admin_workspace";
		}
		else if(iApplLevel >= 3)
		{
			sAccessType = "moderator";
		}
		else if(iApplLevel >= 1)
		{
			sAccessType = "observer";
		}
		else
		{
			sAccessType = "reject";
		}
	}

	switch(sAccessType)
	{
		case "moderator":
		case "reject":
			{
				arrConds.push("$elem/id = 0");;
				break;
			}
	}
	
	if ( !IsEmptyValue(sXQueryQual) )
		arrConds.push(sXQueryQual);
	
	if ( arrFilters != undefined && arrFilters != null && IsArray(arrFilters) )
	{
		for ( oFilter in arrFilters )
		{
			if ( oFilter.type == 'search' )
			{
				if ( oFilter.value != '' )
				{
					arrConds.push("doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )");
				}
			}
		}
	}
	
	if (aWorkSpace.indexOf("workspace") >= 0 && aWorkSpace.indexOf("not_workspace") >= 0)
	{
		arrConds.push("($elem/show_in_workspace = true() or $elem/show_in_workspace = false())");
	}
	else if (aWorkSpace.indexOf("workspace") >= 0)
	{
		arrConds.push("$elem/show_in_workspace = true()");
	}
	else if (aWorkSpace.indexOf("not_workspace") >= 0)
	{
		arrConds.push("$elem/show_in_workspace = false()");
	}

	if (tools_web.is_true(bVirtualTask))
	{
		arrConds.push("$elem/virtual = true()");
	}
	else
	{
		arrConds.push("$elem/virtual = false()");
	}
	
	var sSortConds = "";
	if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		switch(sFieldName)
		{
			case "name":
				sSortConds = " order by $elem/name"
				break;
			case "code":
				sSortConds = " order by $elem/code"
				break;
		}
		
		if(sSortConds != "" && oCollectionParams.sort.DIRECTION == "DESC")
			sSortConds += " descending";
	}
	
	var sConds = (ArrayOptFirstElem(arrConds) != undefined) ? " where " + ArrayMerge(arrConds, "This", " and ") : "";
	var sReqTaskTypes = "for $elem in task_types" + sConds + sSortConds + " return $elem";
	var xarrTaskTypes = tools.xquery(sReqTaskTypes);
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(xarrTaskTypes);
		oRes.paging = oCollectionParams.paging;
		xarrTaskTypes = ArrayRange(xarrTaskTypes, OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE, oCollectionParams.paging.SIZE);
	}
	
	for ( catTaskType in xarrTaskTypes )
	{
		oElem = {
			id: catTaskType.id.Value,
			code: catTaskType.code.Value,
			name: catTaskType.name.Value,
			task_count: null
		};
		
		if (aReturnData.indexOf("task_count" ) >= 0)
		{
			oElem.task_count = ArrayCount(tools.xquery("for $elem in tasks where $elem/task_type_id = " + catTaskType.id.Value + " return $elem"))
		}
		
		oRes.array.push(oElem);
	}
	
	return oRes;
}

/**
 * @typedef {Object} oTask
 * @property {bigint} id
 * @property {string} name
 * @property {string} status
 * @property {string} priority
 * @property {date} start_date_plan
 * @property {date} end_date_plan
 * @property {date} date_plan
 * @property {date} date_end
 * @property {real} mark
 * @property {bigint} assigner_id
 * @property {string} assigner
 * @property {bigint} executor_id
 * @property {string} executor
 * @property {string} workflow_state_name
 * @property {boolean} expired
 * @property {string} link
*/

/**
 * @typedef {Object} WTTaskResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oTask[]} array – Массив заявок.
*/

/**
 * @function GetTasks
 * @memberof Websoft.WT.Project
 * @description Получение списка задач.
 * @param {bigint} iPersonID - ID сотрудника
 * @param {string} sType - тип выборки задач
 * @param {date} [dCreateDateStart] - дата создания с
 * @param {date} [dCreateDateFinish] - дата создания по
 * @param {bigint} [iAssignerID] - назначивший задачу
 * @param {bigint} [iTaskTypeID] - тип задачи
 * @param {bigint} [iProjectID] - проект
 * @param {string} [sStatus] - статус задачи
 * @param {string} [sSearch] - строка поиска
 * @param {string} [sAccessRole] Роль пользователя.
 * @param {bigint[]} [aPersons] - сотрудники
 * @returns {WTTaskResult}
*/
function GetTasks( iPersonID, sType, dCreateDateStart, dCreateDateFinish, iAssignerID, iTaskTypeID, iProjectID, sStatus, sSearch, sAccessRole, aPersons )
{
	return get_tasks( iPersonID, null, sType, dCreateDateStart, dCreateDateFinish, iAssignerID, iTaskTypeID, iProjectID, sStatus, sSearch, sAccessRole, aPersons );
}

function get_tasks( iPersonID, tePerson, sType, dCreateDateStart, dCreateDateFinish, iAssignerID, iTaskTypeID, iProjectID, sStatus, sSearch, sAccessRole, aPersons, bReturnCount )
{
	/*
		Получение списка задач.
		iPersonID 	- ID сотрудника
		tePerson	- TopElem сотрудника
		sType		- тип выборки задач ( my/preparation/my_sub/my_expired/all_expired/my_tasks_for_today/persons )
		dCreateDateStart	- дата создания с
		dCreateDateFinish	- дата создания по
		iAssignerID			- назначивший задачу
		iTaskTypeID			- тип задачи
		sStatus				- статус
		sAccessRole			- роль пользователя
	*/
	function set_error( iError, sErrorText, bResult )
	{
		oRes.error = iError;
		oRes.errorText = sErrorText;
		oRes.result = bResult;
	}
	
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];
	oRes.count = 0;
	try
	{
		if( bReturnCount == undefined || bReturnCount == null )
			throw "error";
		bReturnCount = tools_web.is_true( bReturnCount );
	}
	catch( ex )
	{
		bReturnCount = false;
	}
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		set_error( 1, i18n.t( 'peredannekorre' ), false )
		return oRes;
	}

	try
	{
		tePerson.Name;
	}
	catch( ex )
	{
		try
		{
			tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
		}
		catch( ex )
		{
			set_error( 1, i18n.t( 'peredannekorre' ), false )
			return oRes;
		}
	}
	try
	{
		if( sType == undefined || sType == null || sType == "" )
			throw "error";
	}
	catch( ex )
	{
		set_error( 1, i18n.t( 'peredannekorre_1' ), false )
		return oRes;
	}
	try
	{
		dCreateDateStart = Date( dCreateDateStart );
	}
	catch( ex )
	{
		dCreateDateStart = null;
	}
	try
	{
		dCreateDateFinish = Date( dCreateDateFinish );
	}
	catch( ex )
	{
		dCreateDateFinish = null;
	}
	try
	{
		iAssignerID = OptInt( iAssignerID, null );
	}
	catch( ex )
	{
		iAssignerID = null;
	}
	try
	{
		iTaskTypeID = OptInt( iTaskTypeID, null );
	}
	catch( ex )
	{
		iTaskTypeID = null;
	}
	try
	{
		iProjectID = OptInt( iProjectID, null );
	}
	catch( ex )
	{
		iProjectID = null;
	}
	try
	{
		if( sStatus == undefined || sStatus == "" )
			throw "error";
		sStatus = String( sStatus );
	}
	catch( ex )
	{
		sStatus = null;
	}
	try
	{
		if( sSearch == undefined || sSearch == null )
			throw "error";
		sSearch = String( sSearch );
	}
	catch( ex )
	{
		sSearch = "";
	}
	try
	{
		if ( sAccessRole == undefined || sAccessRole == null )
			throw "error";
		sAccessRole = String( sAccessRole );
	}
	catch( ex )
	{
		sAccessRole = "";
	}
	
	var xarrTasks = null;
	var conds = new Array();
	if( dCreateDateStart != null )
	{
		conds.push( "$elem/start_date_plan >= " + XQueryLiteral( dCreateDateStart ) );
	}
	if( dCreateDateFinish != null )
	{
		conds.push( "$elem/start_date_plan <= " + XQueryLiteral( dCreateDateFinish ) );
	}
	if( iAssignerID != null )
	{
		conds.push( "$elem/assigner_id = " + XQueryLiteral( iAssignerID ) );
	}
	if( iTaskTypeID != null )
	{
		conds.push( "$elem/task_type_id = " + XQueryLiteral( iTaskTypeID ) );
	}
	if( iProjectID != null )
	{
		conds.push( "$elem/source_object_id = " + XQueryLiteral( iProjectID ) );
	}
	if( sStatus != null )
	{
		conds.push( "$elem/status = " + XQueryLiteral( sStatus ) );
	}
	if( sSearch != "" )
	{
		conds.push( "doc-contains( $elem/id, 'wt_data', " + XQueryLiteral( sSearch ) + " )" );
	}
	switch( sType )
	{
		case "my":
			conds.push( "$elem/executor_id = " + XQueryLiteral( iPersonID ) );
			break;
		case "persons":
			try
			{
				if( !IsArray( aPersons ) )
				{
					throw "error";
				}
			}
			catch( ex )
			{
				aPersons = new Array();
			}
			if( ArrayOptFirstElem( aPersons ) == undefined )
			{
				set_error( 1, i18n.t( 'neperedanmassi' ), false )
				return oRes;
			}
			conds.push( "MatchSome( $elem/executor_id, ( " + ArrayMerge( aPersons, "This", "," ) + " ) )" );
			break;
		case "my_sub":
			 
			xarrTasks = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iPersonID, ['fact','func'], false, 'task', null, ArrayMerge( conds, "This", " and " ), true, true, true, true ] );
			//arrCollaborators = tools.get_sub_person_ids_by_func_manager_id( iPersonID );
			//conds.push( "MatchSome( $elem/executor_id, ( " + ArrayMerge( arrCollaborators, "This", "," ) + " ) )" );
			break;
		case "preparation":
			conds.push( "( $elem/executor_id = " + XQueryLiteral( iPersonID ) + " or MatchSome( $elem/preparation_id, ( " + iPersonID + " ) ) )" );
			break;
		case "my_expired":
			conds.push( "( $elem/end_date_plan <= " + XQueryLiteral( DateNewTime( Date() ) ) + " and $elem/executor_id = " + XQueryLiteral( iPersonID ) + " )" );
			break;
		case "all_expired":
			conds.push( "( $elem/end_date_plan <= " + XQueryLiteral( DateNewTime( Date() ) ) + " )" );
			break;
		case "my_tasks_for_today":
			conds.push( "( $elem/start_date_plan = " + XQueryLiteral( DateNewTime( Date(), 0, 0, 0 ) ) + " and $elem/executor_id = " + XQueryLiteral( iPersonID ) + " )" );
			break;
	}
	var arrFEObjects = new Array();
	function get_foreign_elem_object( object_id )
	{
		catObject = ArrayOptFind( arrFEObjects, "This.id == object_id" );
		if( catObject == undefined )
		{
			var feObject = object_id.OptForeignElem;
			catObject = new Object();
			catObject.id = object_id.Value;
			catObject.foreign_elem = feObject;
			arrFEObjects.push( catObject );
		}
		return catObject.foreign_elem;
	}
	function get_priority_name( priority )
	{
		switch( priority )
		{
			case 0:
				return i18n.t( 'nizkiy' );
			case 1:
				return i18n.t( 'sredniy' );
			case 2:
				return i18n.t( 'vysokiy' );
		}
		return "";
	}
	
	function get_foreign_elem_name( object_id )
	{
		feObject = get_foreign_elem_object( object_id );
		if( feObject != undefined )
			return RValue( tools.get_disp_name_value( feObject ) );
		return "";
	}
	arrTaskTypes = new Array();
	function get_task_type( iId )
	{
		iId = OptInt( iId );
		if( iId == undefined )
			return undefined;

		var oTaskType = ArrayOptFind( arrTaskTypes, "This.id == iId" );
		if( oTaskType == undefined )
		{
			oTaskType = new Object();
			oTaskType.id = iId;
			var TE = undefined;
			try
			{
				TE = OpenDoc( UrlFromDocID( iId ) ).TopElem;
			}
			catch( ex )
			{}
			oTaskType.top_elem = TE;
			arrTaskTypes.push( oTaskType );
		}
		return oTaskType.top_elem;
	}
	function get_task_url( catElem )
	{
		if( !catElem.task_type_id.HasValue )
			return "";
		teTaskType = get_task_type( catElem.task_type_id );
		if( teTaskType == undefined || !teTaskType.eval_code_for_url.HasValue )
			return tools_web.get_mode_clean_url( null, catElem.id );;
		try
		{
			return eval( teTaskType.eval_code_for_url );
		}
		catch( err )
		{
			alert( err )
		}
		return tools_web.get_mode_clean_url( null, catElem.id );;
	}
	function check_user_access( iTaskID, sUserAccessRole )
	{
		docTask = tools.open_doc( iTaskID );
		if ( docTask != undefined )
		{
			teTask = docTask.TopElem;

			if ( teTask.user_access_role.HasValue && teTask.user_access_role == sUserAccessRole && tePerson.access.access_role == sUserAccessRole )
			{
				return true;
			}
			else
			{
				return false;
			}
		}
	}
	// alert("for $elem in tasks where " + ArrayMerge( conds, "This", " and " ) + " return $elem")
	if( xarrTasks == null )
	{
		xarrTasks = XQuery( "for $elem in tasks where " + ArrayMerge( conds, "This", " and " ) + " order by $elem/end_date_plan return $elem" );
	}
	if( bReturnCount )
	{
		oRes.count = ArrayCount( xarrTasks )
	}
	else
	{
		for( _task in xarrTasks )
		{
			if ( sAccessRole != '' && ! check_user_access( _task.id.Value, sAccessRole ) )
				continue;

			obj = new Object();
			obj.id = _task.id.Value;
			obj.name = _task.name.Value;
			obj.expired = _task.end_date_plan.HasValue && ( _task.end_date_plan < ( _task.date_fact.HasValue ? _task.date_fact : Date() ) );

			if ( ( sType == 'my_expired' || sType == 'all_expired' ) && ! obj.expired )
				continue;

			feStatus = get_foreign_elem_object( _task.status );
			obj.status = feStatus != undefined ? feStatus.name.Value : "";
			obj.type = _task.task_type_id.HasValue ? _task.task_type_id.OptForeignElem.name.Value : "";
			obj.priority = get_priority_name( _task.priority );
			obj.start_date_plan = _task.start_date_plan.Value;
			obj.end_date_plan = _task.end_date_plan.Value;
			obj.date_plan = _task.date_plan.Value;
			obj.date_end = _task.date_fact.Value;
			obj.mark = _task.value.Value;
			obj.workflow_state_name = _task.workflow_state_name.Value;
			obj.assigner_id = _task.assigner_id.Value;
			obj.assigner = get_foreign_elem_name( _task.assigner_id );
			obj.executor_id = _task.executor_id.Value;
			obj.executor = get_foreign_elem_name( _task.executor_id );
			obj.link = get_task_url( _task )

			oRes.array.push( obj );
		}
	}
	return oRes;
}

function lp_create_task( sCommand, iPersonID, tePerson, SCOPE_WVARS, iTaskID, iExecutorID, iSourceObjectID )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.action_result = ({});

	function merge_form_fields()
	{
		try
		{
			var oResFormFields = new Array();
			if( oRes.action_result.GetOptProperty( "form_fields" ) != undefined )
			{
				oResFormFields = oRes.action_result.form_fields;
			}
			else if( oRes.action_result.GetOptProperty( "confirm_result" ) != undefined && oRes.action_result.confirm_result.GetOptProperty( "form_fields" ) != undefined )
			{
				oResFormFields = oRes.action_result.confirm_result.form_fields;
			}
			for( _field in oFormFields )
			{
				if( ArrayOptFind( oResFormFields, "This.name == _field.name" ) == undefined )
				{
					oResFormFields.push( { name: _field.name, type: "hidden", value: _field.value } );
				}
			}
		}
		catch( err ){alert(err)}
	}

	try
	{
		if( ObjectType( SCOPE_WVARS ) != "JsObject" )
			throw "";
	}
	catch( ex )
	{
		 SCOPE_WVARS = ({});
	}

	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid' ) };
		return oRes;
	}

	try
	{
		iSourceObjectID = Int( iSourceObjectID );
	}
	catch( ex )
	{
		iSourceObjectID = null;
	}

	try
	{
		iTaskTypeID = Int( SCOPE_WVARS.GetOptProperty( "task_type_id" ) );
	}
	catch( ex )
	{
		iTaskTypeID = null;
	}

	try
	{
		iTaskID = Int( iTaskID );
	}
	catch( ex )
	{
		iTaskID = null;
	}

	try
	{
		iExecutorID = Int( iExecutorID );
	}
	catch( ex )
	{
		iExecutorID = null;
	}

	try
	{
		bSubordinates = tools_web.is_true( SCOPE_WVARS.GetOptProperty( "subordinates", true ) );
	}
	catch( ex )
	{
		bSubordinates = true;
	}

	try
	{
		bUseSourceObjectList = tools_web.is_true( SCOPE_WVARS.GetOptProperty( "bUseSourceObjectList", true ) );
	}
	catch( ex )
	{
		bUseSourceObjectList = true;
	}

	try
	{
		sFields = String( SCOPE_WVARS.GetOptProperty( "fields", "" ) );
		if( sFields == "" )
			throw "error";
		arrFields = sFields.split( ";" );
	}
	catch( ex )
	{
		arrFields = [ "executor_id", "parent_task_id", "start_date_plan", "end_date_plan", "status", "desc", "file_id", "custom_fields", "date_fact" , "comment" ];
	}

	try
	{
		if( iPersonID != null )
			tePerson.Name;
	}
	catch( ex )
	{
		if( iPersonID != null )
			try
			{
				tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
			}
			catch( ex )
			{
				oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid' ) };
				return oRes;
			}
		else
			tePerson = null;
	}
	
	function get_field_name_value( _object_id )
	{
		_object_id = OptInt( _object_id );
		if( _object_id == undefined )
		{
			return "";
		}
		try
		{
			return RValue( tools.get_disp_name_value( OpenDoc( UrlFromDocID( _object_id ) ).TopElem ) );
		}
		catch( ex ){}
		return ""
	}

	bFullAccess = false;
	bExecutor = false;
	bBoss = false;
	bAssigner = false;

	if( iTaskID == null )
	{
		bFullAccess = true;
	}
	
	function add_field( name, label, type, field, fshort, bMandatory )
	{
		bMandatory = tools_web.is_true( bMandatory );
		if( teTask == null || ( bBoss || bAssigner ) )
		{
			var oField = {
				name: name,
				label: label,
				type: type,
				value: ( teTask != null ? teTask.Child( field ).Value : "" ),
				mandatory: bMandatory 
			}
			
			if(fshort)
				oField.column = 2;
			
			oRes.action_result.form_fields.push( oField );
		}
		else
		{
			oRes.action_result.form_fields.push( { name: name + "_paragraph", type: "paragraph", value: label + " - " + ( teTask != null ? ( type == "date" && teTask.Child( field ).HasValue ? StrDate( teTask.Child( field ).Value, false ) : teTask.Child( field ).Value ) : "" ) } );
			oRes.action_result.form_fields.push( { name: name, type: "hidden", value: ( teTask != null ? teTask.Child( field ).Value : "" ) } );
		}
	}

	teTask = null;
	if( iTaskID != null )
	{
		teTask = OpenDoc( UrlFromDocID( iTaskID ) ).TopElem;
		iExecutorID = teTask.executor_id;
		bExecutor = teTask.executor_id == iPersonID;
		if( teTask.executor_id.HasValue )
		{
			bBoss = tools.is_boss( iPersonID, teTask.executor_id );
		}
		bAssigner = teTask.assigner_id == iPersonID;
	}

	if( iSourceObjectID == null && teTask != null )
	{
		iSourceObjectID = teTask.source_object_id;
	}

	switch( sCommand )
	{
		case "eval":

			oRes.action_result = {
				command: "display_form",
				title: ( teTask != null ? teTask.name.Value : i18n.t( 'novayazadacha' ) ),
				header: i18n.t( 'zapolnitepolyaz' ),
				form_fields: [] 
			};
			
			docSourceObject = undefined;
			if( iSourceObjectID != null )
			{
				docSourceObject = tools.open_doc( iSourceObjectID );
				oRes.action_result.form_fields.push( { name: "source_object_id", label: "", type: "hidden", value: iSourceObjectID } );
				if( docSourceObject != undefined )
				{
					oRes.action_result.form_fields.push( { name: "source_object_type", label: "", type: "hidden", value: RValue( docSourceObject.TopElem.Name ) } );
					oRes.action_result.form_fields.push( { name: "source_object_id" + "_paragraph", type: "paragraph", value: common.exchange_object_types.GetOptChildByKey( docSourceObject.TopElem.Name ).title + " - " + ( tools.get_disp_name_value( docSourceObject.TopElem ) ) } );
				}
				
			}
			
			add_field( "name", i18n.t( 'nazvanie' ), "string", "name", false, true );
			
			if( iTaskTypeID == null )
			{
				if( teTask == null || ( bBoss || bAssigner ) )
				{
					oRes.action_result.form_fields.push( { name: "task_type_id", label: i18n.t( 'tipzadachi' ), type: "foreign_elem", catalog: "task_type", value: ( teTask != null ? teTask.task_type_id.Value : "" ), display_value: ( teTask != null ? get_field_name_value( teTask.task_type_id ) : "" ), mandatory: false } );
				}
				else
				{
					oRes.action_result.form_fields.push( { name: "task_type_id" + "_paragraph", type: "paragraph", value: i18n.t( 'tipzadachi' ) + " - " + ( get_field_name_value( ( teTask != null ? teTask.task_type_id : "" ) ) ) } );
					oRes.action_result.form_fields.push( { name: "task_type_id", type: "hidden", value: ( teTask != null ? teTask.task_type_id.Value : "" ) } );
				}
				
			}
			
			for( _field in arrFields )
			{
				switch( _field )
				{
					case "executor_id":
						if( iExecutorID == null )
						{
							if( bUseSourceObjectList && docSourceObject != undefined )
							{
								field = { name: "executor_id", label: i18n.t( 'otvetstvennyy' ), type: "select", value: ( teTask != null ? teTask.executor_id.Value : "" ), mandatory: false, entries: [] };
								bOk = false;
								switch( docSourceObject.TopElem.Name )
								{
									case "project":
										for( _pp in ArraySelectDistinct( XQuery( "for $elem in project_participants where $elem/project_id = " + iSourceObjectID + " and $elem/catalog = 'collaborator' and ( $elem/status_id = 'active' or $elem/status_id = null() ) return $elem/Fields('object_id', 'object_name')" ), "This.object_id" ) )
										{
											field.entries.push( { name: _pp.object_name.Value, value: _pp.object_id.Value } );
										}
										bOk = true;
										break;
								}
								if( bOk )
								{
									oRes.action_result.form_fields.push( field );
									break;
								}
							}
							if( teTask == null || ( bBoss || bAssigner ) )
							{
								if( bSubordinates )
								{
									field = { name: "executor_id", label: i18n.t( 'otvetstvennyy' ), type: "select", value: ( teTask != null ? teTask.executor_id.Value : "" ), mandatory: false, entries: [] };
									curSubPersonIDs = tools.get_sub_person_ids_by_func_manager_id( iPersonID );
									//col_conds.push( 'MatchSome( $i/id, ( ' + ArrayMerge( curSubPersonIDs, 'This', ',' ) + ' ) )' );
									if( ArrayOptFirstElem( curSubPersonIDs ) != undefined )
									{
										for( _col in XQuery( "for $elem in collaborators where MatchSome( $elem/id, ( " + ArrayMerge( curSubPersonIDs, 'This', ',' ) + " ) ) and $elem/is_dismiss != true() return $elem/Fields('id', 'fullname')" ) )
										{
											field.entries.push( { name: _col.fullname.Value, value: _col.id.Value } );
										}
									}
									oRes.action_result.form_fields.push( field );
								}
								else
								{
									oRes.action_result.form_fields.push( { name: "executor_id", label: i18n.t( 'otvetstvennyy' ), type: "foreign_elem", catalog: "collaborator", value: ( teTask != null ? teTask.executor_id.Value : "" ), display_value: ( teTask != null ? get_field_name_value( teTask.executor_id ) : "" ), mandatory: false } );
								}
							}
							else
							{
								oRes.action_result.form_fields.push( { name: "executor_id" + "_paragraph", type: "paragraph", value: i18n.t( 'otvetstvennyy' ) + " - " + ( teTask != null ? get_field_name_value( teTask.executor_id ) : "" ) } );
								oRes.action_result.form_fields.push( { name: "executor_id", type: "hidden", value: ( teTask != null ? ( teTask.executor_id.Value ) : "" ) } );
							}
							
						}
						else
						{
							oRes.action_result.form_fields.push( { name: "executor_id", label: i18n.t( 'otvetstvennyy' ), type: "hidden", value: iExecutorID } );
						}
						break;
					
					case "start_date_plan":
						add_field( "start_date_plan", i18n.t( 'planiruemayadat' ), "date", "start_date_plan", true );
						break;
					case "status":
						field = { name: "status", label: i18n.t( 'status' ), type: "select", value: ( teTask != null ? teTask.status.Value : "" ), mandatory: true, entries: [], column: 2 };
						for( _status in common.task_statuses )
						{
							field.entries.push( { name: _status.name.Value, value: _status.id.Value } );
						}
						oRes.action_result.form_fields.push( field );

						break;
					
					case "end_date_plan":
						add_field( "end_date_plan", i18n.t( 'planiruemayadat_1' ), "date", "end_date_plan", true);
						break;
					
					case "desc":
						add_field( "desc", i18n.t( 'opisanie' ), "text", "desc", false );
						break;
					
					case "file_id":
						if( teTask == null || ( bBoss || bAssigner || bExecutor ) )
						{
							oRes.action_result.form_fields.push( { name: "file_id", label: i18n.t( 'fayl' ), type: "file", value: ( teTask != null ? ( teTask.files.ChildNum > 1 ? ArrayOptFirstElem( teTask.files ).file_id.Value : "" ) : "" ), display_value: get_field_name_value( ( teTask != null ? ( teTask.files.ChildNum > 1 ? ArrayOptFirstElem( teTask.files ).file_id.Value : "" ) : "" ) ), mandatory: false } );
						}
						else
						{
							oRes.action_result.form_fields.push( { name: "file_id" + "_paragraph", type: "paragraph", value: i18n.t( 'fayl' ) + " - " + ( get_field_name_value( ( teTask != null ? ( teTask.files.ChildNum > 1 ? ArrayOptFirstElem( teTask.files ).file_id.Value : "" ) : "" ) ) ) } );
							oRes.action_result.form_fields.push( { name: "file_id", type: "hidden", value: ( teTask != null ? ( teTask.files.ChildNum > 1 ? ArrayOptFirstElem( teTask.files ).file_id.Value : "" ) : "" ) } );
						}
						break;
					case "date_plan":
						if( teTask != null && ( bBoss || bAssigner ) )
						{
							oRes.action_result.form_fields.push( { name: "date_plan", label: i18n.t( 'fakticheskayadat' ), type: "date", value: ( teTask != null ? teTask.date_plan.Value : "" ), mandatory: false, column: 2 } );
						}
						break;
					case "date_fact":
						if( teTask != null && ( bBoss || bAssigner ) )
						{
							oRes.action_result.form_fields.push( { name: "date_fact", label: i18n.t( 'fakticheskayadat_1' ), type: "date", value: ( teTask != null ? teTask.date_fact.Value : "" ), mandatory: false, column: 2 } );
						}
						break;
					case "plan_labor_costs":
						add_field( "plan_labor_costs", i18n.t( 'planiruemyetru' ), "integer", "plan_labor_costs", true );
						break;
					case "fact_labor_costs":
						if( teTask != null && ( bBoss || bAssigner ) )
						{
							oRes.action_result.form_fields.push( { name: "fact_labor_costs", label: i18n.t( 'fakticheskietru' ), type: "integer", value: ( teTask != null ? teTask.fact_labor_costs.Value : "" ), mandatory: false, column: 2 } );
						}
						break;
					case "value":
						if( teTask != null && ( bBoss || bAssigner ) )
						{
							oRes.action_result.form_fields.push( { name: "value", label: i18n.t( 'ocenka' ), type: "integer", value: ( teTask != null ? teTask.value.Value : "" ), mandatory: false} );
						}
						break;
					case "parent_task_id":
						if( ( bBoss || bAssigner ) )
						{
							oRes.action_result.form_fields.push( { name: "parent_task_id", label: i18n.t( 'roditelskayazad' ), type: "foreign_elem", catalog: "task", value: ( teTask != null ? teTask.parent_task_id.Value : "" ), display_value: get_field_name_value( ( teTask != null ? teTask.parent_task_id : "" ) ), mandatory: false, query_qual: ( iSourceObjectID != null ? "$elem/source_object_id = " + iSourceObjectID : "" ) } );
						}
						break;
					case "comment":
						if( teTask != null && ( bBoss || bAssigner || bExecutor ) )
						{
							oRes.action_result.form_fields.push( { name: "comment", label: i18n.t( 'kommentariy' ), type: "text", value: ( teTask != null ? teTask.comment.Value : "" ), mandatory: false } );
						}
						break;
					case "fact":
						if( teTask != null && ( bBoss || bAssigner || bExecutor ) )
						{
							oRes.action_result.form_fields.push( { name: "fact", label: i18n.t( 'reshenie' ), type: "text", value: ( teTask != null ? teTask.fact.Value : "" ), mandatory: false } );
						}
						break;
					
				}
			}
			break;

		case "submit_form":
			oFormFields = null;
			var form_fields = SCOPE_WVARS.GetOptProperty( "form_fields", "" )
			if ( form_fields != "" )
				oFormFields = ParseJson( form_fields );
			
			docSourceObject = undefined;
			
			if( iSourceObjectID != null )
			{
				docSourceObject = tools.open_doc( iSourceObjectID );
			}
			
			bSendNotificationExecutor = tools_web.is_true( SCOPE_WVARS.GetOptProperty( "bSendNotificationExecutor", true ) );
			
			if( iTaskID == null )
			{
				taskDoc = OpenNewDoc( 'x-local://wtv/wtv_task.xmd' );
				taskDoc.TopElem.executor_type = "collaborator";
				taskDoc.TopElem.assigner_id = iPersonID;
			}
			else
			{
				taskDoc = OpenDoc( UrlFromDocID( iTaskID ) );
			}

			iLastExecutorID = OptInt( taskDoc.TopElem.executor_id );
			sLastStatus = String( taskDoc.TopElem.status.Value );
			iExecutorID = undefined;
			oExecutor = ArrayOptFind( oFormFields, "This.name == 'executor_id'" );
			if( oExecutor != undefined )
			{
				iExecutorID = OptInt( oExecutor.value, null )
			}

			oValue = ArrayOptFind( oFormFields, "This.name == 'value'" );
			if( oValue != undefined && OptInt( oValue.value ) != undefined && OptInt( SCOPE_WVARS.GetOptProperty( "iMaxMark" ) ) != undefined )
			{
				if( OptInt( oValue.value ) > OptInt( SCOPE_WVARS.GetOptProperty( "iMaxMark" ) ) )
				{
					oRes.action_result = { command: "alert", msg: i18n.t( 'maksimalnayaoce' ) + OptInt( SCOPE_WVARS.GetOptProperty( "iMaxMark" ) ) };
					break;
				}
			}

			if( iExecutorID == undefined && false )
			{
				oRes.action_result = { command: "alert", msg: i18n.t( 'neperedanotvet' ) };
				break;
			}

			if( iTaskTypeID == null )
			{
				oTaskType = ArrayOptFind( oFormFields, "This.name == 'task_type_id'" );
				if( oTaskType != undefined )
				{
					iTaskTypeID = OptInt( oTaskType.value, null )
				}
			}

			bCheckCustomField = false;
			oCheckCustomField = ArrayOptFind( oFormFields, "This.name == 'check_custom_field'" );
			if( oCheckCustomField != undefined )
			{
				bCheckCustomField = tools_web.is_true( oCheckCustomField.value );
			}

			var bCanCheckCustomFields = ArrayOptFind( arrFields, "This == 'custom_fields'" ) != undefined

			if( !bCheckCustomField && bCanCheckCustomFields )
			{
				
				if( iTaskTypeID != null )
				{
					taskDoc.TopElem.task_type_id = iTaskTypeID;
					fldCustomElems = tools.get_custom_template( taskDoc.TopElem.Name, null, taskDoc.TopElem );
					fldWebCustomFields = new Array();
					if ( fldCustomElems != null )
					{
						fldWebCustomFields = ArraySelectByKey( fldCustomElems.fields, true, 'disp_web' );
					}
					if( ArrayOptFirstElem( fldWebCustomFields ) != undefined )
					{
						oRes.action_result = {
							command: "display_form",
							title: i18n.t( 'novayazadacha' ),
							header: i18n.t( 'zapolnitedopol' ),
							form_fields: []
						};

						for( _field in oFormFields )
						{
							
							if( _field.name == "file_id" && _field.GetOptProperty( "url", "" ) != "" )
							{
								docResource = OpenNewDoc( 'x-local://wtv/wtv_resource.xmd' );

								if( iPersonID != null )
								{
									docResource.TopElem.person_id = iPersonID;
									tools.common_filling( 'collaborator', docResource.TopElem, iPersonID, tePerson );
								}
								docResource.BindToDb();
								docResource.TopElem.put_data( _field.url );
								docResource.Save();
								sValue = docResource.DocID;
							}
							else
							{
								sValue = _field.value;
							}
							oRes.action_result.form_fields.push( { name: _field.name, label: "", type: "hidden", value: sValue } );
						}

						var fldCustomTemplate = tools.get_custom_template( 'task', null, null ); 
						if ( fldCustomElems != null )
						{
							fldCustomElemsFields = ArraySelectByKey( fldCustomElems.fields, true, 'disp_web' );
							if( ArrayOptFirstElem( fldCustomElemsFields ) != undefined )
							{
								for( _field in fldCustomElemsFields )
								{
									if ( ArrayCount( _field.view.conditions ) != 0 )
									{
										bShow_arrCustomFields = SafeEval( tools.create_filter_javascript( _field.view.conditions ), [ { 'fldFieldElem': _field, 'tools': tools, 'curObject': taskDoc.TopElem } ] );
										if ( ! bShow_arrCustomFields )
											continue;
									}
									obj = { name: "custom_field_" + _field.name.Value, label: _field.title.Value, query_qual: _field.xquery_qual.Value, type: _field.type.Value, value: "", catalog_name: _field.catalog.Value, max_chars: _field.max_chars.Value, mandatory: _field.is_required.Value, validation: ( _field.is_required.Value ? "nonempty" : "" ), entries: [] };
									for( _entr in _field.entries )
										obj.entries.push( { name: _entr.value.Value, value: _entr.value.Value } );
									oRes.action_result.form_fields.push( obj );
								}
								oRes.action_result.form_fields.push( { name: "check_custom_fields", type: "hidden", value: true } );
								merge_form_fields();
								break;
							}
						}

						break;

					}
				}
			}
			
			if( iTaskTypeID != null )
			{
				taskDoc.TopElem.task_type_id = iTaskTypeID;
				tools.common_filling( 'task_type', taskDoc.TopElem, iTaskTypeID );
				if( bCanCheckCustomFields )
				{
					oSourceParam = new Object();
					for( _field in oFormFields )
						if( StrBegins( _field.name, "custom_field_" ) )
						{
							if( IsArray( _field.value ) )
							{
								oSourceParam.SetProperty( StrReplace( _field.name, "custom_field_", "" ), ArrayMerge( _field.value, "This", ";" ) );
							}
							else
							{
								oSourceParam.SetProperty( StrReplace( _field.name, "custom_field_", "" ), _field.value );
							}
						}

					oResCE = tools_web.custom_elems_filling( taskDoc.TopElem, oSourceParam, null, ({ 'sCatalogName': taskDoc.TopElem.Name, 'iObjectID': iTaskTypeID, 'bCheckMandatory': true, 'bCheckCondition': true }) );
					if ( oResCE.error != 0 )
					{
						if ( ArrayCount( oResCE.mandatory_fields ) != 0 )
							sErrorText += StrReplace( i18n.t( 'neobhodimozapo_1' ), '{PARAM1}', ArrayMerge( oResCE.mandatory_fields, 'tools_web.get_cur_lng_name(This.title,curLng.short_id)', '", "' ) );
						if ( ArrayCount( oResCE.condition_fields ) != 0 )
							sErrorText += ' ' + StrReplace( i18n.t( 'nevernyeznachen' ), '{PARAM1}', ArrayMerge( oResCE.condition_fields, 'tools_web.get_cur_lng_name(This.title,curLng.short_id)', '", "' ) );
						oRes.action_result = { command: "alert", msg: sErrorText };
						break;
					}
				}
			}

			for( _field in oFormFields )
			{

				if( StrBegins( _field.name, "custom_field_" ) || _field.name == "task_type_id" )
				{
					continue;
				}
				else if( _field.name == "file_id" )
				{
					sValue = _field.GetOptProperty( "url", "" )
					if( sValue != "" )
					{
						docResource = OpenNewDoc( 'x-local://wtv/wtv_resource.xmd' );

						if( iPersonID != null )
						{
							docResource.TopElem.person_id = iPersonID;
							tools.common_filling( 'collaborator', docResource.TopElem, iPersonID, tePerson );
						}
						docResource.BindToDb();
						docResource.TopElem.put_data( sValue );
						docResource.Save();
						taskDoc.TopElem.files.ObtainChildByKey( docResource.DocID );
					}
					else if( OptInt( _field.GetOptProperty( "value" ) ) != undefined )
					{
						taskDoc.TopElem.files.ObtainChildByKey( OptInt( _field.value ) );
					}
				}
				else if( taskDoc.TopElem.ChildExists( _field.name ) )
				{
					taskDoc.TopElem.EvalPath( _field.name ).Value = _field.value;
				}
			}
			if( taskDoc.TopElem.status != "p" && taskDoc.TopElem.status != "r" && !taskDoc.TopElem.date_plan.HasValue )
			{
				taskDoc.TopElem.date_plan = Date();
			}
			if( taskDoc.TopElem.status == "1" && !taskDoc.TopElem.date_fact.HasValue )
			{
				taskDoc.TopElem.date_fact = Date();
			}
			
			if( iTaskID == null )
			{
				taskDoc.BindToDb( DefaultDb );
			}
			try
			{
				taskDoc.Save();
			}
			catch ( err )
			{
				oRes.action_result = { command: "alert", msg: String( err ) };
				break;
			}
			
			if( bSendNotificationExecutor )
			{
				if( taskDoc.TopElem.executor_id.HasValue && taskDoc.TopElem.executor_id != iLastExecutorID )
				{
					tools.create_notification( "create_new_task", taskDoc.TopElem.executor_id, "", taskDoc.DocID, null, taskDoc.TopElem );
				}
				if( iTaskID != null && docSourceObject != undefined && docSourceObject.TopElem.Name == "project" )
				{
					if( sLastStatus != taskDoc.TopElem.status.Value )
					{
						if( bExecutor )
						{
							catProjectManagerBossType = ArrayOptFirstElem( XQuery( "for $elem in boss_types where $elem/code = 'project_manager' return $elem" ) );
							if( catProjectManagerBossType != undefined )
							{
								xarrManagers = XQuery( "for $elem in project_participants where $elem/project_id = " + iSourceObjectID + " and $elem/boss_type_id = " + catProjectManagerBossType.id + " and ( $elem/status_id = 'active' or $elem/status_id = null() )  return $elem" );
								for( _pp in xarrManagers )
								{
									tools.create_notification( "update_task_executor_status", _pp.object_id, "", taskDoc.DocID, null, taskDoc.TopElem );
								}
							}
						}
						else
						{
							tools.create_notification( "update_task_executor_status", taskDoc.TopElem.executor_id, "", taskDoc.DocID, null, taskDoc.TopElem );
						}
					}
				}
			}
			
			oRes.action_result = { command: "close_form", msg: i18n.t( 'zadachauspeshnos' ), confirm_result: {command: "reload_page"} };
			break;
		default:
			oRes.action_result = { command: "alert", msg: i18n.t( 'neizvestnayakom' ) };
			break;
	}
	return oRes;
}

function get_tasks_by_object( iObjectID, sObectType, sStatus )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.value = "";
	oRes.value_str = "";
	try
	{
		iObjectID = Int( iObjectID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'peredannekorre_2' );
		return oRes;
	}
	try
	{
		if( sObectType == undefined || sObectType == "" )
			throw "error";
	}
	catch( ex )
	{
		sObectType = null;
	}
	
	try
	{
		if( sStatus == undefined || sStatus == "" )
			throw "error";
	}
	catch( ex )
	{
		sStatus = null;
	}
	var conds = new Array();
	if( sStatus != null )
		conds.push( "$elem/status = " + XQueryLiteral( String( sStatus ) ) );
	switch( sObectType )
	{
		case "collaborator":
			conds.push( "$elem/executor_id = " + iObjectID );
			break;
		case "subdivision":
			xarrPositions = ArraySelect( tools.xquery( 'for $elem in subs where IsHierChild( $elem/id, ' + iObjectID + ' ) and $elem/type = \'position\' order by $elem/Hier() return $elem/basic_collaborator_id' ), "This.basic_collaborator_id.HasValue" );
			if( ArrayOptFirstElem( xarrPositions ) == undefined )
				return oRes;
			conds.push( "MatchSome( $elem/executor_id, ( " + ArrayMerge( xarrPositions, "This.basic_collaborator_id", "," ) + ") )" );
			break;
			
		default:
			return oRes;
	}
	xarrTasks = XQuery( "for $elem in tasks where " + ArrayMerge( conds, "This", " and " ) + " return $elem/Fields('id')" )
	oRes.value = ArrayCount( xarrTasks );
	oRes.value_str = oRes.value;
	return oRes;
	
}

/**
 * @typedef {Object} oTaskPreparation
 * @property {bigint} id
 * @property {string} fullname
 * @property {string} position_name
 * @property {string} role
*/
/**
 * @typedef {Object} WTTaskPreparationsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oTaskPreparation[]} array – Массив ответственных.
*/
/**
 * @function GetTaskPreparations
 * @memberof Websoft.WT.Project
 * @description Получение списка ответственных по задаче.
 * @param {bigint} iTaskID - ID задачи
 * @returns {WTTaskPreparationsResult}
 */
function GetTaskPreparations( iTaskID )
{
	return get_task_preparations( iTaskID );
}

function get_task_preparations( iTaskID, teTask )
{
	/*
		Получение списка ответственных по задаче.
		iTaskID 	- ID задачи
		teTask	- TopElem задачи
	*/
	function set_error( iError, sErrorText, bResult )
	{
		oRes.error = iError;
		oRes.errorText = sErrorText;
		oRes.result = bResult;
	}
	
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];
	try
	{
		iTaskID = Int( iTaskID );
	}
	catch( ex )
	{
		set_error( 1, i18n.t( 'peredannekorre_3' ), false )
		return oRes;
	}

	try
	{
		teTask.Name;
	}
	catch( ex )
	{
		try
		{
			teTask = OpenDoc( UrlFromDocID( iTaskID ) ).TopElem;
		}
		catch( ex )
		{
			set_error( 1, i18n.t( 'peredannekorre_3' ), false )
			return oRes;
		}
	}

	var arrFEObjects = new Array();
	function get_foreign_elem_object( object_id )
	{
		catObject = ArrayOptFind( arrFEObjects, "This.id == object_id" );
		if( catObject == undefined )
		{
			var feObject = object_id.OptForeignElem;
			if( feObject == undefined )
			{
				return undefined;
			}
			catObject = new Object();
			catObject.id = object_id.Value;
			catObject.foreign_elem = feObject;
			arrFEObjects.push( catObject );
		}
		return catObject.foreign_elem;
	}
	
	function get_foreign_elem_name( object_id )
	{
		feObject = get_foreign_elem_object( object_id );
		if( feObject != undefined )
			return RValue( tools.get_disp_name_value( feObject ) );
		return "";
	}
	teTaskType = null;
	if( teTask.task_type_id.HasValue )
	{
		teTaskType = OpenDoc( UrlFromDocID( teTask.task_type_id ) ).TopElem;
	}
	for( _preparation in teTask.preparations )
	{
		if( !_preparation.person_id.HasValue )
		{
			continue;
		}
		obj = new Object();
		obj.id = _preparation.person_id.Value;
		
		fePerson = get_foreign_elem_object( _preparation.person_id );
		if( fePerson == undefined )
		{
			continue;
		}
		obj.fullname = fePerson.fullname.Value;
		obj.position_name = fePerson.position_name.Value;
		obj.role = "";
		if( _preparation.role_id.HasValue && teTaskType != null )
		{
			feRole = teTaskType.roles.GetOptChildByKey( _preparation.role_id );
			if( feRole != undefined )
			{
				obj.role = feRole.name.Value;
			}
		}
		oRes.array.push( obj );
	}
	return oRes;
}
/**
 * @typedef {Object} oProjectOperation
 * @property {string} name
 * @property {string} action
 * @property {number} operation_type
*/
/**
 * @typedef {Object} oProject
 * @property {bigint} id
 * @property {string} name
 * @property {date} start_date_plan
 * @property {date} end_date_plan
 * @property {date} start_date_fact
 * @property {date} end_date_fact
 * @property {oProjectOperation[]} operations
*/
/**
 * @typedef {Object} WTProjectResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oProject[]} array – Массив заявок.
*/
/**
 * @function GetProjects
 * @memberof Websoft.WT.Project
 * @description Получение списка проектов сотрудника.
 * @param {bigint} iPersonID - ID сотрудника
 * @param {bool} [bGetOperations] - возвращать доступные операции
 * @param {string[]} [arrStates] - массив статусов
 * @param {string} [sSearchName] - поиск по названию
 * @param {number} [iPageNum] - номер страницы
 * @param {number} [iPageSize] - размер страницы
 * @returns {WTProjectResult}
 */
function GetProjects( iPersonID, bGetOperations, arrStates, sSearchName, iPageNum, iPageSize )
{
	return get_projects( iPersonID, bGetOperations, arrStates, sSearchName, iPageNum, iPageSize );
}

function get_projects( iPersonID, bGetOperations, arrStates, sSearchName, iPageNum, iPageSize )
{
	/*
		Получение списка проектов.
	*/
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];
	
	function set_error( iError, sErrorText, bResult )
	{
		oRes.error = iError;
		oRes.errorText = sErrorText;
		oRes.result = bResult;
	}
	try
	{
		bGetOperations = tools_web.is_true( bGetOperations );
	}
	catch( ex )
	{
		bGetOperations = false;
	}
	
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		set_error( 1, i18n.t( 'peredannekorre' ), false )
		return oRes;
	}
	try
	{
		if( !IsArray( arrStates ) )
				throw "error";
	}
	catch( ex )
	{
		arrStates = [ "active" ];
	}
	try
	{
		if( sSearchName == undefined || sSearchName == null )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		sSearchName = "";
	}
	try
	{
		iPageNum = OptInt( iPageNum );
	}
	catch( ex )
	{
		iPageNum = undefined;
	}
	try
	{
		iPageSize = OptInt( iPageSize );
	}
	catch( ex )
	{
		iPageSize = undefined;
	}
	
	conds = new Array();
	conds.push( "$elem/is_model = false()" );
	if( ArrayOptFirstElem( arrStates ) != undefined )
	{
		conds.push( "MatchSome( $elem/status, ( " + ArrayMerge( arrStates, "XQueryLiteral( String( This ) )", "," ) + " ) )" );
	}
	
	if( sSearchName != "" )
	{
		conds.push( "contains( $elem/name, " + XQueryLiteral( sSearchName ) + " )" );
	}
	
	function get_operations_by_boss_type_id( _boss_type_id )
	{
		catElem = ArrayOptFind( arrBossTypeOperations, "This.id == _boss_type_id" );
		if( catElem == undefined )
		{
			catElem = new Object();
			catElem.id = _boss_type_id;
			arrBossTypes = ArraySelect( xarrBossTypes, "This.id == _boss_type_id" );
			arrOperationIds = new Array();
			for( _boss_type in xarrBossTypes )
			{
				if( _boss_type.operations.HasValue )
				{
					arrOperationIds = ArrayUnion( arrOperationIds, String( _boss_type.operations ).split( ";" ) );
				}
			}
			arr = ArrayIntersect( xarrOperations, arrOperationIds, "This.id", "Int( This )" );
			catElem.operations = new Array();
			for( _operation in arr )
			{
				catElem.operations.push( { "name": _operation.name.Value, "action": _operation.action.Value, "operation_type": _operation.operation_type.Value } );
			}
		}
		return catElem.operations
	}
	arrBossTypeOperations = new Array();
	
	xarrProjects = XQuery( "for $elem in projects where some $pr_partic in project_participants satisfies ( ( $pr_partic/project_id = $elem/id and ( $pr_partic/status_id = \'active\' or $pr_partic/status_id = null() ) and $pr_partic/object_id = " + iPersonID + " ) or $elem/join_mode = 'open' ) and " + ArrayMerge( conds, "This", " and " ) + " return $elem" );
	if( ArrayOptFirstElem( xarrProjects ) != undefined )
	{
		if( bGetOperations )
		{
			xarrProjectParticipants = ArraySelectAll( XQuery( "for $elem in project_participants where $elem/object_id = " + iPersonID + " and  MatchSome( $elem/project_id, ( " + ArrayMerge( xarrProjects, "This.id", "," ) + " ) ) and ( $elem/status_id = \'active\' or $elem/status_id = null() ) return $elem" ) );
			xarrProjectParticipants = ArraySelect( xarrProjectParticipants, "This.boss_type_id.HasValue" );
			xarrBossTypes = new Array();
			xarrOperations = new Array();
			if( ArrayOptFirstElem( xarrProjectParticipants ) != undefined )
			{
				xarrBossTypes = ArraySelectAll( XQuery( "for $elem in boss_types where MatchSome( $elem/id, ( " + ArrayMerge( xarrProjectParticipants, "This.boss_type_id", "," ) + " ) ) return $elem/Fields('id', 'operations')" ) );
				arrOperationIds = new Array();
				for( _boss_type in xarrBossTypes )
				{
					if( _boss_type.operations.HasValue )
					{
						arrOperationIds = ArrayUnion( arrOperationIds, String( _boss_type.operations ).split( ";" ) );
					}
				}
				if( ArrayOptFirstElem( arrOperationIds ) != undefined )
				{
					xarrOperations = XQuery( "for $elem in operations where MatchSome( $elem/id, ( " + ArrayMerge( arrOperationIds, "This", "," ) + " ) ) return $elem" );
				}
			}
		}
		if( iPageNum != undefined && iPageNum != undefined )
		{
			var iStartIndex = ( iPageNum - 1 )*iPageSize;
			xarrProjects = ArrayRange( xarrProjects, iStartIndex, iPageSize );
		}
		for( _project in xarrProjects )
		{
			obj = new Object();
			obj.id = _project.id.Value;
			obj.name = _project.name.Value;
			obj.status = _project.status.Value;
			obj.start_date_plan = _project.start_date_plan.Value;
			obj.end_date_plan = _project.end_date_plan.Value;
			obj.start_date_fact = _project.start_date_fact.Value;
			obj.end_date_fact = _project.end_date_fact.Value;
			if( bGetOperations )
			{
				obj.operations = new Array();
				arrProjectParticipants = ArraySelect( xarrProjectParticipants, "This.project_id == _project.id" );
				for( _elem in arrProjectParticipants )
				{
					obj.operations = ArrayUnion( obj.operations, get_operations_by_boss_type_id( _elem.boss_type_id ) );
				}
			}
			oRes.array.push( obj );
		}
	}
	return oRes;
}

// ======================================================================================
// ===================================== Выборки ========================================
// ======================================================================================

/**
 * @typedef {Object} oProject
 * @property {bigint} id
 * @property {string} name
 * @property {string} status
 * @property {string} status_id
 * @property {date} date_start
 * @property {date} date_end
 * @property {array} managers
 * @property {string} has_team 
 * @property {number} percent_complete
 * @property {boolean} has_attachments
 * @property {number} percent_plan_load
 * @property {string} roles
 * @property {string} warning
 * @property {string} roles_filter
 * @property {string} link
*/
/**
 * @typedef {Object} WTMyProjectResult
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oProject[]} array – Массив проектов.
*/
/**
 * @author RA
 * @function GetMyProjects
 * @memberof Websoft.WT.Project
 * @description Получение списка проектов сотрудника в зависимости от заданных параметров.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {string} sTypeProjects - Тип возвращаемых проектов (мои или доступные).
 * @returns {WTMyProjectResult}
*/
function GetMyProjects(iPersonID, sTypeProjects) {
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	try {
		if (OptInt(iPersonID) == undefined) {
			throw '';
		}
	} catch(e) {
		set_error(oRes, 1, i18n.t( 'otsutstvuetili' ));
		return oRes;
	}

	try {
		if (sTypeProjects == undefined || sTypeProjects == null || sTypeProjects == '') {
			throw '';
		}
	} catch(e) {
		sTypeProjects = 'my';
	}

	function getProjectPersonRoles(oProject, aRoles, iProjectID) {
		oProject.roles = "";
		if (sTypeProjects == 'open') {
			oProject.roles = i18n.t( 'vymozheteprisoe' );
		} else if (ArrayCount(aRoles) > 0) {
			aProjectPersonRoles = [];
			xarrProjectPersons = XQuery('for $elem in project_participants where $elem/object_id = '+ iPersonID +' and $elem/project_id = '+ iProjectID +' and ( $elem/status_id = \'active\' or $elem/status_id = null() ) return $elem');
			if ((catProjectParticipant = ArrayOptFirstElem(xarrProjectPersons)) != undefined && catProjectParticipant.participant_roles_id.HasValue) {
				for (role_id in catProjectParticipant.participant_roles_id) {
					if ((catRole = ArrayOptFindByKey(aRoles, role_id, 'id')) != undefined) {
						aProjectPersonRoles.push(catRole.name.Value);
					}
				}
				if (ArrayCount(aProjectPersonRoles) > 0) {
					oProject.roles = ArrayMerge(aProjectPersonRoles, 'This', ', ');
					oProject.roles_filter = ArrayMerge(aProjectPersonRoles, 'This', '|||');
				}
			}
			oProject.percent_plan_load = (catProjectParticipant != undefined && catProjectParticipant.percent_plan_load.HasValue) ? catProjectParticipant.percent_plan_load.Value : 0;
		}
	}

	function getProjects(cndtn, cndtn2) {
		sQuery = 'for $elem in projects where some $person_pt in project_participants satisfies ($person_pt/project_id = $elem/id  and ( $person_pt/status_id = \'active\' or $person_pt/status_id = null() )';
		if (sTypeProjects == 'my') {
			sQuery += ' and '+ cndtn +')';
		} else {
			sQuery += ' and ' + cndtn2 + ') and '+ cndtn;
		}
		return tools.xquery(sQuery + ' order by $elem/start_date_plan descending return $elem/id, $elem/__data');
	}

	switch (sTypeProjects) {
		case 'my':
			xarrProjects = getProjects('$person_pt/object_id = ' + iPersonID);
			break;

		case 'open':
			xarrProjects = getProjects('($elem/join_mode = "open" or $elem/join_mode = "request") ', '$person_pt/object_id != ' + iPersonID);
			break;
	}

	var iProjectID, sProjectStatus, dEndDatePlan, dEndDateFact;
	var iBossTypeID = get_boss_type_id('project_manager');

	if (ArrayCount(xarrProjects) > 0) {
		xarrProjectRoles = XQuery('for $elem in project_participant_roles where MatchSome($elem/project_id, ('+ ArrayMerge(xarrProjects, 'This.id', ',') +')) order by $elem/id return $elem');
		for (project in xarrProjects) {
			iProjectID = project.id.Value;
			dProject = tools.open_doc(iProjectID);
			if (dProject != undefined) {
				oProject = {
					id: '',
					name: '',
					status_id: '',
					status: '',
					date_start: '',
					date_end: '',
					managers: [],
					has_team: i18n.t( 'net' ),
					percent_complete: '',
					warning: '',
					link: ''
				};
				teProject = dProject.TopElem;
	
				sProjectStatus = (teProject.status.HasValue) ? teProject.status.Value : '';
				dEndDatePlan = OptDate(teProject.end_date_plan.Value, '');
				dEndDateFact = OptDate(teProject.end_date_fact.Value, '');
	
				oProject.id = iProjectID;
				oProject.name = Trim(teProject.name.Value);
				oProject.status_id = sProjectStatus;
				oProject.status = (sProjectStatus != '') ? common.project_status_types.GetOptChildByKey(sProjectStatus).name.Value : '';
				oProject.date_start = (teProject.start_date_fact.HasValue) ? OptDate(teProject.start_date_fact.Value, '') : OptDate(teProject.start_date_plan.Value, '');
				oProject.date_end = (teProject.end_date_fact.HasValue) ? dEndDateFact : dEndDatePlan;
	
				xarrProjectManagers = XQuery('for $elem in project_participants where $elem/catalog = "collaborator" and $elem/project_id = '+ iProjectID +' and $elem/boss_type_id = '+ iBossTypeID +' and ( $elem/status_id = \'active\' or $elem/status_id = null() ) return $elem/Fields("id", "object_name")');
				oProject.managers = (ArrayCount(xarrProjectManagers) > 0) ? ArrayMerge(xarrProjectManagers, 'This.object_name', ",") : [];
	
				oProject.has_team = teProject.team_selected.HasValue ? tools_web.is_true(teProject.team_selected.Value) ? i18n.t( 'da' ) : i18n.t( 'net' ) : i18n.t( 'net' );
				oProject.percent_complete = teProject.percent_complete.HasValue ? teProject.percent_complete.Value : 0;
				oProject.has_attachments = (teProject.files.ChildNum > 0);
					
				getProjectPersonRoles(oProject, xarrProjectRoles, iProjectID);
				
				if ((sProjectStatus == 'active' && dEndDatePlan != '' && Date() > dEndDatePlan) || dEndDateFact > dEndDatePlan) {
					oProject.warning = i18n.t( 'narushensrokoko' );
				} 

				oProject.link = tools_web.get_mode_clean_url(null, iProjectID);
				oRes.array.push(oProject);
			}
		}
	}
	
	// alert('oRes: ' + tools.object_to_text(oRes, 'json'));
	return oRes;
}

/**
 * @typedef {Object} oProjectFile
 * @property {bigint} id
 * @property {string} name
 * @property {string} link
 * @property {string} fullname
 * @property {string} position
 * @property {date} creation_date
*/
/**
 * @typedef {Object} WTProjectFiles
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oProjectFile[]} array – Массив прикрепленных к проекту ресурсов базы.
*/
/**
 * @author RA
 * @function GetProjectFiles
 * @memberof Websoft.WT.Project
 * @description Получение списка файлов проекта.
 * @param {bigint} iProjectID - ID проекта.
 * @param {boolean} bIncludeTaskFiles - Если true, то учитываются файлы, прикрепленные к связанным с проектом задачам.
 * @returns {WTProjectFiles}
*/
function GetProjectFiles(iProjectID, bIncludeTaskFiles) {
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	try {
		if (OptInt(iProjectID) == undefined) {
			throw '';
		}
	} catch(e) {
		set_error(oRes, 1, i18n.t( 'otsutstvuetili_1' ));
		return oRes;
	}

	try {
		if (bIncludeTaskFiles != undefined || bIncludeTaskFiles != null || bIncludeTaskFiles != '') {
			bIncludeTaskFiles = tools_web.is_true(bIncludeTaskFiles);
		} else {
			throw '';
		}
	} catch(e) {
		bIncludeTaskFiles = false;
	}

	function get_files_result(aFileIDs) {
		xarrFiles = XQuery('for $elem in resources where MatchSome($elem/id, ('+ ArrayMerge(aFileIDs, 'This', ',') +')) order by id return $elem/Fields("id", "name", "person_id", "person_fullname", "creation_date")');
		for (file in xarrFiles) {
			cPerson = file.person_id.HasValue && file.person_id.OptForeignElem != undefined ? file.person_id.OptForeignElem : undefined;
			sFullName = (file.person_fullname.HasValue) ? file.person_fullname.Value : (cPerson != undefined && cPerson.fullname.HasValue ? cPerson.fullname.Value : '');
			sPosition = (cPerson != undefined && cPerson.position_name.HasValue) ? cPerson.position_name.Value : '';
			sDate = file.creation_date.HasValue ? OptDate(file.creation_date.Value, '') : '';
			oFile = {
				id: file.id.Value,
				name: file.name.Value,
				link: tools_web.get_object_source_url('resource', file.id.Value),
				fullname: sFullName,
				position: sPosition,
				creation_date: sDate
			}
			oRes.array.push(oFile);
		}
	}

	dProject = tools.open_doc(iProjectID);
	if (dProject != undefined) {
		teProject = dProject.TopElem;
		if (teProject.files.ChildNum > 0) {
			get_files_result(ArrayExtract(teProject.files, 'PrimaryKey'));
		}

		if (bIncludeTaskFiles) {
			xarrTasks = tools.xquery('for $elem in tasks where $elem/source_object_id = '+ iProjectID +' return $elem/id, $elem/__data');
			aFileTasks = [];
			for (task in xarrTasks) {
				dTask = tools.open_doc(task.id);
				if (dTask != undefined) {
					teTask = dTask.TopElem;
					if (teTask.files.ChildNum > 0) {
						aFileTasks = ArrayUnion(aFileTasks, ArrayExtract(teTask.files, 'PrimaryKey'));
					}
				}
			}
			if (ArrayCount(aFileTasks) > 0) {
				get_files_result(aFileTasks);
			}
		}
	}
	
	// alert('oRes: ' + tools.object_to_text(oRes, 'json'));
	return oRes;
}

/**
 * @typedef {Object} oProjectManagers
 * @property {bigint} id
 * @property {string} name
 * @property {string} link
*/
/**
 * @typedef {Object} WTProjectManagers
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oProjectManagers[]} array – Массив руководителей проекта.
*/
/**
 * @author RA
 * @function GetProjectManagers
 * @memberof Websoft.WT.Project
 * @description Получение списка руководителей проекта.
 * @param {bigint} iProjectID - ID проекта.
 * @param {bigint} iBossTypeID - ID типа руководителя.
 * @returns {WTProjectManagers}
*/
function GetProjectManagers(iProjectID, iBossTypeID) {
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	try {
		if (OptInt(iProjectID) == undefined) {
			throw '';
		}
	} catch(e) {
		set_error(oRes, 1, i18n.t( 'otsutstvuetili_1' ));
		return oRes;
	}

	try {
		if (iBossTypeID == undefined || iBossTypeID == null || iBossTypeID == '') {
			throw '';
		}
	} catch(e) {
		iBossTypeID = get_boss_type_id('project_manager');
	}

	oRes.array = get_project_managers(iProjectID, iBossTypeID, true);
	return oRes;
}

/**
 * @typedef {Object} oProjectParicipants
 * @property {bigint} id
 * @property {string} photo
 * @property {string} fullname
 * @property {string} position
 * @property {string} subdivision
 * @property {string} roles
 * @property {string} status
 * @property {string} percent
 * @property {date} date_start
 * @property {date} date_end
*/
/**
 * @typedef {Object} WTProjectParticipants
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oProjectParicipants[]} array – Массив участников проекта.
*/
/**
 * @author RA
 * @function GetProjectParticipants
 * @memberof Websoft.WT.Project
 * @description Получение списка участников проекта.
 * @param {bigint} iProjectID - ID проекта.
 * @returns {WTProjectParticipants}
*/
function GetProjectParticipants(iProjectID) {
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	try {
		if (OptInt(iProjectID) == undefined) {
			throw '';
		}
	} catch(e) {
		set_error(oRes, 1, i18n.t( 'otsutstvuetili_1' ));
		return oRes;
	}

	var iParticipantTypeID = get_boss_type_id('project_participant');
	xarrPersonParticpants = XQuery('for $elem in collaborators where some $pr_particip in project_participants satisfies ($elem/id = $pr_particip/object_id and $pr_particip/project_id = '+ iProjectID +' and $pr_particip/boss_type_id = '+ iParticipantTypeID +') order by $elem/fullname return $elem');
	xarrProjectParticipants = tools.xquery('for $elem in project_participants where some $person in collaborators satisfies ($elem/object_id = $person/id and $elem/project_id = '+ iProjectID +' and $elem/boss_type_id = '+ iParticipantTypeID +') return $elem/id, $elem/__data');
	xarrProjectRoles = XQuery('for $elem in project_participant_roles where $elem/project_id = '+ iProjectID +' return $elem/Fields("id", "name")');

	for (participant in xarrProjectParticipants) {
		iParticipantID = participant.id.Value;
		dParticipant = tools.open_doc(iParticipantID);
		if (dParticipant != undefined) {
			teParticipant = dParticipant.TopElem;
			oParticipant = { 
				id: iParticipantID, 
				photo: '', 
				fullname: '', 
				position: '', 
				subdivision: '', 
				roles: '', 
				status: '', 
				percent: '', 
				date_start: '', 
				date_end: '' 
			};
			cPersonParticipant = ArrayOptFindByKey(xarrPersonParticpants, teParticipant.object_id.Value, 'id');
			if (cPersonParticipant != undefined) {
				oParticipant.photo = tools_web.get_object_source_url('person', teParticipant.object_id.Value);
				oParticipant.fullname = cPersonParticipant.fullname.Value;
				oParticipant.position = cPersonParticipant.position_name.Value;
				oParticipant.subdivision = cPersonParticipant.position_parent_name.Value;
			}
			if (teParticipant.participant_roles_id.HasValue) {
				aRoles = [];
				for (role in teParticipant.participant_roles_id) {
					if ((catRole = ArrayOptFindByKey(xarrProjectRoles, role.Value, 'id')) != undefined && catRole.name.HasValue) {
						aRoles.push(catRole.name.Value);
					}
				}
				if (ArrayCount(aRoles) > 0) {
					oParticipant.roles = ArrayMerge(aRoles, 'This', ', ');
				}
			}
			oParticipant.status = (teParticipant.is_excluded.HasValue && tools_web.is_true(teParticipant.is_excluded.Value)) ? i18n.t( 'isklyuchenizproe' ) : i18n.t( 'vkomandeproekt' );
			if (teParticipant.percent_plan_load.HasValue) {
				oParticipant.percent = teParticipant.percent_plan_load.Value;
			}
			if (teParticipant.start_date.HasValue) {
				oParticipant.date_start = OptDate(teParticipant.start_date.Value, '');
			}
			if (teParticipant.finish_date.HasValue) {
				oParticipant.date_end = OptDate(teParticipant.finish_date.Value, '');
			}

			oRes.array.push(oParticipant);
		}
	}

	// alert('oRes: ' + tools.object_to_text(oRes, 'json'));
	return oRes;
}

/**
 * @typedef {Object} oTask
 * @property {bigint} id
 * @property {string} name
 * @property {string} fullname
 * @property {string} position
 * @property {date} date_start
 * @property {date} date_end
 * @property {string} status
*/
/**
 * @typedef {Object} WTHierarchicalTaskResult
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oTask[]} array – Массив этапов/задач.
*/
/**
 * @author RA
 * @function GetHierarchicalTasksPerson
 * @memberof Websoft.WT.Project
 * @description Получение списка этапов/задач сотрудника.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {bigint} iProjectID - ID проекта.
 * @returns {WTHierarchicalTaskResult}
*/
function GetHierarchicalTasksPerson(iPersonID, iProjectID) {
	var oRes = tools.get_code_library_result_object();
	var iProjectManager = get_boss_type_id('project_manager');
	var iProjectParticipant = get_boss_type_id('project_participant');
	oRes.array = [];

	try {
		if (OptInt(iPersonID) == undefined) {
			throw '';
		}
	} catch(e) {
		set_error(oRes, 1, i18n.t( 'otsutstvuetili' ));
		return oRes;
	}

	try {
		if (OptInt(iProjectID) == undefined) {
			throw '';
		}
	} catch(e) {
		set_error(oRes, 1, i18n.t( 'otsutstvuetili_1' ));
		return oRes;
	}

	function getTaskResult(id, task, executors, parent_id) {
		oTaskRes = { id: id, name: task.name.Value, fullname: '', position: '', date_start: '', date_end: '', status: '', parent_id: OptInt(parent_id, '') }
		if (task.executor_id.HasValue && (cExecutor = ArrayOptFindByKey(executors, task.executor_id.Value, 'id')) != undefined) {
			oTaskRes.fullname = cExecutor.fullname.Value;
			oTaskRes.position = cExecutor.position_name.Value;
		}
		oTaskRes.date_start = (OptDate(task.date_plan.Value) != undefined) ? task.date_plan.Value : OptDate(task.start_date_plan.Value, '');
		oTaskRes.date_end = (OptDate(task.date_fact.Value) != undefined) ? task.date_fact.Value : OptDate(task.end_date_plan.Value, '');
		oTaskRes.status = (task.status.HasValue) ? common.task_statuses.GetOptChildByKey(task.status.Value).name.Value : '';
		return oTaskRes;
	}

	function getPersonProjects(iBossTypeID) {
		return XQuery('for $elem in projects where some $pr_particip in project_participants satisfies ($elem/id = $pr_particip/project_id and ( $pr_particip/status_id = \'active\' or $pr_particip/status_id = null() ) and $pr_particip/object_id = '+ iPersonID +' and $pr_particip/boss_type_id = '+ iBossTypeID +')  and $elem/id = '+ iProjectID +' order by $elem/name descending return $elem');
	}

	function getProjectsTasks(aPersonProjects, type) {
		sCondition = '';
		switch (type) {
			case 'boss':
				sCondition = 'and $elem/parent_task_id = null()';
				break;

			case 'participant':
				sCondition = 'and $elem/parent_task_id != null()';
				break;
		}
		return XQuery('for $elem in tasks where MatchSome($elem/source_object_id, ('+ ArrayMerge(aPersonProjects, 'This.id', ',') +')) '+ sCondition +' order by $elem/date_fact descending return $elem');
	}

	function getTasksExecutors(aTasks) {
		return XQuery('for $elem in collaborators where some $task in tasks satisfies ($elem/id = $task/executor_id and MatchSome($task/id, ('+ ArrayMerge(aTasks, 'This.id', ',') +'))) order by $elem/id return $elem');
	}

	aTasksChild = [];
	xarrProjectsManagered = getPersonProjects(iProjectManager);
	if (ArrayCount(xarrProjectsManagered) > 0) {
		xarrTasksParent = getProjectsTasks(xarrProjectsManagered, 'boss');
		xarrExecutors = getTasksExecutors(xarrTasksParent);
		
		for (task in xarrTasksParent) {
			iParentID = task.id.Value;
			oTask = getTaskResult(iParentID, task, xarrExecutors);
			oRes.array.push(oTask);

			xarrCurTasksChild = tools.xquery('for $elem in tasks where IsHierChild($elem/id, '+ iParentID +') order by $elem/Hier() return $elem');
			if (ArrayCount(xarrCurTasksChild) > 0) {
				xarrExecutors = getTasksExecutors(xarrCurTasksChild);
				for (task in xarrCurTasksChild) {
					iTaskID = task.id.Value;
					oTask = getTaskResult(iTaskID, task, xarrExecutors, iParentID);
					oRes.array.push(oTask);
					aTasksChild.push(iTaskID);
				}
			}
		}

		xarrTasksChild = getProjectsTasks(xarrProjectsManagered, 'participant');
		if (ArrayCount(xarrTasksChild) > 0) {
			xarrExecutors = getTasksExecutors(xarrTasksChild);
			for (task in xarrTasksChild) {
				iTaskID = task.id.Value;
				if (ArrayOptFind(aTasksChild, 'iTaskID == This') != undefined) {
					continue;
				} else {
					oTask = getTaskResult(iTaskID, task, xarrExecutors);
					oRes.array.push(oTask);
					aTasksChild.push(iTaskID);
				}
			}
		}
	} 

	xarrProjectsParticipanted = getPersonProjects(iProjectParticipant);
	if (ArrayCount(xarrProjectsParticipanted) > 0) {
		xarrTaskStagesPart = getProjectsTasks(xarrProjectsParticipanted, 'all');
		xarrExecutors = getTasksExecutors(xarrTaskStagesPart);
		for (task in xarrTaskStagesPart) {
			iTaskID = task.id.Value;
			if (ArrayOptFind(aTasksChild, 'iTaskID == This') != undefined) {
				continue;
			} else {
				oTask = getTaskResult(iTaskID, task, xarrExecutors);
				oRes.array.push(oTask);
			}
		}
	}

	// alert('oRes: ' + tools.object_to_text(oRes, 'json'));
	return oRes;
}

/**
 * @typedef {Object} oSkill
 * @property {bigint} id
 * @property {string} name
 * @property {string} target_level_id
*/
/**
 * @typedef {Object} oProjectRoles
 * @property {bigint} id
 * @property {string} name
 * @property {oSkill[]} skills
 * @property {number} participants
 * @property {string} comment
*/
/**
 * @typedef {Object} WTProjectRoles
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oProjectRoles[]} array – Массив ролей проекта.
*/
/**
 * @author RA
 * @function GetProjectRoles
 * @memberof Websoft.WT.Project
 * @description Получение списка ролей проекта.
 * @param {bigint} iProjectID - ID проекта.
 * @returns {WTProjectRoles}
*/
function GetProjectRoles(iProjectID) {
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	try {
		if (OptInt(iProjectID) == undefined) {
			throw '';
		}
	} catch(e) {
		set_error(oRes, 1, i18n.t( 'otsutstvuetili_1' ));
		return oRes;
	}

	xarrProjectRoles = tools.xquery('for $elem in project_participant_roles where $elem/project_id = '+ iProjectID +' return $elem/id, $elem/__data');
	for (elem in xarrProjectRoles) {
		iRoleID = elem.id.Value;
		oRole = { id: iRoleID, name: '', skills: [], participants: 0, comment: '' }
		dRole = tools.open_doc(iRoleID);
		if (dRole != undefined) {
			teRole = dRole.TopElem;
			oRole.name = (teRole.name.HasValue) ? teRole.name.Value : '';
			if (teRole.knowledge_parts.ChildNum > 0) {
				for (skill in teRole.knowledge_parts) {
					iLevelID = (skill.target_level_id.HasValue) ? skill.target_level_id.Value : '';
					sSkillName = (skill.knowledge_part_name.HasValue) ? skill.knowledge_part_name.Value : '';
					oSkill = { id: skill.PrimaryKey.Value,  name: sSkillName, target_level_id: iLevelID }
					oRole.skills.push(oSkill);
				}
			}
			oRole.participants = (teRole.participant_num.HasValue) ? teRole.participant_num.Value : '';
			oRole.comment = (teRole.comment.HasValue) ? teRole.comment.Value : '';
		}
		oRes.array.push(oRole);
	}

	// alert('oRes: ' + tools.object_to_text(oRes, 'json'));
	return oRes;
}

/**
 * @typedef {Object} oBossProjectRoles
 * @property {bigint} project_id
 * @property {string} project_name
 * @property {string} project_status
 * @property {date} data_start
 * @property {date} data_end
 * @property {bigint} role_id
 * @property {string} role_name
*/
/**
 * @typedef {Object} WTBossProjectRoles
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oBossProjectRoles[]} array – Массив ролей.
*/
/**
 * @author RA
 * @function GetBossProjectRoles
 * @memberof Websoft.WT.Project
 * @description Получение списка ролей проектов сотрудника, в которых он является руководителем.
 * @param {bigint} iPersonID - ID сотрудника.
 * @returns {WTBossProjectRoles}
*/
function GetBossProjectRoles(iPersonID) {
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	try {
		if (OptInt(iPersonID) == undefined) {
			throw '';
		}
	} catch(e) {
		set_error(oRes, 1, i18n.t( 'otsutstvuetili' ));
		return oRes;
	}

	xarrPersonProjects = ArraySelectAll(XQuery('for $elem in projects where some $pp in project_participants satisfies($elem/id = $pp/project_id and $pp/object_id = '+ iPersonID +' and $pp/boss_type_id = '+ get_boss_type_id('project_manager') +') return $elem/Fields("id", "name", "status", "start_date_plan", "end_date_plan")'));

	if (ArrayCount(xarrPersonProjects) > 0) {
		xarrRoles = XQuery('for $elem in project_participant_roles where MatchSome($elem/project_id, ('+ ArrayMerge(xarrPersonProjects, 'This.id', ',') +')) order by $elem/project_id return $elem/Fields("id", "project_id", "name")');
		iPrevRoleID = ArrayOptFirstElem(xarrRoles).project_id.Value;
		catProject = ArrayOptFindByKey(xarrPersonProjects, iPrevRoleID, 'id');
		for (role in xarrRoles) {
			obj = {};
			if (iPrevRoleID != role.project_id.Value) {
				iPrevRoleID = role.project_id.Value;
				catProject = ArrayOptFindByKey(xarrPersonProjects, iPrevRoleID, 'id');
			}
			obj.project_id = catProject.id.Value;
			obj.project_name = catProject.name.Value;
			sProjectStatus = (catProject.status.HasValue) ? catProject.status.Value : '';
			obj.project_status = (sProjectStatus != '') ? common.project_status_types.GetOptChildByKey(sProjectStatus).name.Value : '';
			obj.data_start = (catProject.start_date_plan.HasValue) ? StrDate(catProject.start_date_plan.Value, false) : '';
			obj.data_end = (catProject.end_date_plan.HasValue) ? StrDate(catProject.end_date_plan.Value, false) : '';
			obj.role_id = role.id.Value;
			obj.role_name = role.name.Value;

			oRes.array.push(obj);
		}
	}

	return oRes;
}

/**
 * @typedef {Object} oTheMostEffectiveManagers
 * @property {bigint} id
 * @property {string} label
 * @property {string} bar_bgcolor
 * @property {string} bar_border_color
 * @property {string} stack_id
 * @property {string} coordinates (JSON)
*/
/**
 * @typedef {Object} WTTheMostEffectiveManagers
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oTheMostEffectiveManagers[]} array – Массив ролей проекта.
*/
/**
 * @author RA
 * @function GetTheMostEffectiveManagers
 * @memberof Websoft.WT.Project
 * @description Получение списка самых результативных руководителей проекта.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {number} iLimitProjects - Ограничение количества проектов.
 * @param {string} sBarColor - Цвет бара.
 * @param {string} sChartTitle - Название графика.
 * @returns {WTTheMostEffectiveManagers}
*/
function GetTheMostEffectiveManagers(iPersonID, iLimitProjects, sBarColor, sChartTitle) {
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	try {
		if ((iPersonID = OptInt(iPersonID)) == undefined) {
			throw '';
		}
	} catch(e) {
		set_error(oRes, 1, i18n.t( 'otsutstvuetili' ));
		return oRes;
	}

	try {
		if (sBarColor == undefined || sBarColor == null || sBarColor == '') {
			throw '';
		}
	} catch(e) {
		sBarColor = '#315DFA';
	}

	try {
		if (sChartTitle == undefined || sChartTitle == null || sChartTitle == '') {
			throw '';
		}
	} catch(e) {
		sChartTitle = i18n.t( 'samyerezultati' );
	}

	var iLimitProjects = OptInt(iLimitProjects, 5);
	var iProjectManagerID = get_boss_type_id('project_manager');
	var xarrProjectsFinished = XQuery('for $elem in projects where $elem/status = "close" and $elem/end_date_fact < $elem/end_date_plan return $elem');

	function getProjectManagers(xarrSubordinates) {
		sRequest = 'for $elem in project_participants where $elem/catalog = "collaborator" and $elem/boss_type_id = '+ iProjectManagerID; //+ ' and ( $elem/status_id = \'active\' or $elem/status_id = null() )';
		if (xarrSubordinates != undefined && xarrSubordinates != null) {
			sRequest += ' and MatchSome($elem/object_id, ('+ ArrayMerge(xarrSubordinates, 'This', ',') +'))';
		} else {
			sCndtn = '';
			iPersonSubdivision = OptInt(ArrayOptFirstElem(XQuery('for $elem in collaborators where $elem/id = '+ iPersonID +' return $elem/Fields("position_parent_id")'), { position_parent_id: undefined }).position_parent_id);
			if (iPersonSubdivision != undefined) {
				xarrPersons = XQuery('for $elem in collaborators where $elem/position_parent_id = '+ iPersonSubdivision +' return $elem/Fields("id")');
				if (ArrayCount(xarrPersons) > 0) {
					sCndtn = ' and MatchSome($elem/object_id, ('+ ArrayMerge(xarrPersons, 'This.id', ',') +'))';
				}
			}
			sRequest += (sCndtn != '') ? sCndtn : ' and $elem/object_id = '+ iPersonID;
		}
		sRequest += ' and MatchSome($elem/project_id, ('+ ArrayMerge(xarrProjectsFinished, 'This.id', ',') +')) return $elem';
		// alert('sRequest: ' + sRequest);

		return XQuery(sRequest);
	}

	xarrSubordinatePersons = tools.get_sub_person_ids_by_func_manager_id(iPersonID, 'collaborator');
	xarrProjectManagers = (ArrayCount(xarrSubordinatePersons) > 1) ? getProjectManagers(xarrSubordinatePersons) : getProjectManagers();
	iCount = 0;
	aEffectiveManagers = [];

	for (manager in xarrProjectManagers) {
		if (iCount <= iLimitProjects) {
			iManagerID = manager.object_id.Value;
			oManagerResult = {
				id: iManagerID,
				fullname: manager.object_name.Value,
				success_projects: 0
			}
			
			if (ArrayOptFindByKey(aEffectiveManagers, iManagerID, 'id') != undefined) {
				continue;
			} else {
				aSuccessProjects = ArraySelectByKey(xarrProjectManagers, iManagerID, 'object_id');
				if (ArrayCount(aSuccessProjects) > 0) {
					oManagerResult.success_projects = ArrayCount(aSuccessProjects);
					iCount++;
					aEffectiveManagers.push(oManagerResult);
				}
			}
		} else {
			break;
		}
	}

	aAxisXData = [];
	aCoordinates = [];
	aEffectiveManagers = ArraySort(aEffectiveManagers, 'success_projects', '-');
	
	if (ArrayCount(aEffectiveManagers) > 0) {
		aAxisXData = ArrayExtractKeys(aEffectiveManagers, 'fullname');
		aCoordinates = ArrayExtractKeys(aEffectiveManagers, 'success_projects');
		oRes.array.push({
			id: iPersonID,
			label: sChartTitle,
			bar_bgcolor: sBarColor,
			bar_border_color: sBarColor,
			coordinates: EncodeJson({ labels: aAxisXData, numbers: aCoordinates })
		});
	}

	// alert('oRes: ' + tools.object_to_text(oRes, 'json'));
	return oRes;
}

// ======================================================================================
// ===============================  Удаленные действия ==================================
// ======================================================================================

/**
 * @typedef {Object} oArguments
 * @property {string} sBossTypes – Типы руководителей, которым разрешено создание проектов.
 * @property {string} sTypeLeaderChoice – Выбор руководителей из подчиненных или из всех сотрудников.
 * @property {boolean} bDescRequired – Описание обязательно/не обязательно к заполнению.
 * @property {string} fields – Cериализованное содержимое формы.
*/
/**
 * @author RA
 * @function CreateProject
 * @memberof Websoft.WT.Project
 * @description Создание/редактирование карточки проекта.
 * @param {string} sCommand - Режим выполнения удаленного действия (показ формы/обработка формы).
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {bigint} iProjectID - ID проекта, если есть.
 * @param {oArguments} SCOPE_WVARS - Переменные УД.
 * @param {FormField[]} aFieldEntries - Массив entries переменной fields УД.
*/
function CreateProject(sCommand, iPersonID, iProjectID, SCOPE_WVARS, aFieldEntries) {
	var oRes = tools.get_code_library_result_object();
	var aFields, isModeEdit;
	var iBossTypeID = get_boss_type_id('project_manager');
	
	if (iPersonID == undefined || iPersonID == null || Trim(iPersonID) == '') {
		return close_form(oRes, i18n.t( 'otsutstvuetili' ));
	}

	if (iProjectID != undefined && iProjectID != null && Trim(iProjectID) != '') {
		isModeEdit = is_exist_project(iProjectID);
	} else {
		isModeEdit = false;
	}

	var sTitle = (isModeEdit) ? i18n.t( 'izmenenieproek' ) : i18n.t( 'sozdanieproekta' );
		
	try {
		if (ObjectType(SCOPE_WVARS) != 'JsObject') {
			throw '';
		}
	} catch(e) {
		SCOPE_WVARS = ({});
	}

	try {
		if (SCOPE_WVARS.GetOptProperty('bDescRequired') != undefined) {
			bDescRequired = tools_web.is_true(SCOPE_WVARS.bDescRequired);
		} else {
			throw '';
		}
	} catch(e) {
		bDescRequired = false;
	}

	try {
		if ((sBossTypes = SCOPE_WVARS.GetOptProperty('sBossTypes')) != undefined && Trim(sBossTypes) != '' && StrContains(sBossTypes, ',')) {
			sBossTypes = Trim(sBossTypes);
		} else {
			throw '';
		}
	} catch(e) {
		cBossType = ArrayOptFirstElem(XQuery('for $elem in boss_types where $elem/code = "main" return $elem/Fields("id")'));
		sBossTypes = (ArrayOptFirstElem(cBossType) != undefined) ? String(cBossType.id.Value) : '';
	}

	try {
		if ((sTypeLeaderChoice = SCOPE_WVARS.GetOptProperty('sTypeLeaderChoice')) != undefined && Trim(sTypeLeaderChoice) != '') {
			sTypeLeaderChoice = Trim(sTypeLeaderChoice);
		} else {
			throw '';
		}
	} catch(e) {
		sTypeLeaderChoice = 'all';
	}

	if (isModeEdit && ArrayOptFirstElem(XQuery('for $elem in func_managers where MatchSome($elem/boss_type_id, ('+ sBossTypes +')) and $elem/person_id = '+ iPersonID +' return $elem/Fields("id")')) == undefined) {
		return close_form(oRes, i18n.t( 'vyneyavlyaetesru' ));
	}

	try {
		sFields = String(SCOPE_WVARS.GetOptProperty('fields', ''));
		if (sFields == '') {
			throw '';
		}
		aFields = sFields.split(';');
	} catch(e) {
		aFields = ['name', 'desc', 'start_date_plan', 'end_date_plan', 'plan_labor_costs', 'status', 'join_mode', 'default_request_type_id', 'team_selected', 'start_date_fact', 'end_date_fact', 'fact_labor_costs', 'percent_complete', 'project_managers', 'text_result', 'files'];
	}

	var aIntersectFields = ArrayIntersect(aFieldEntries, aFields, 'This.id', 'This');
	var aFormFields = get_arr_value_form_fields(SCOPE_WVARS);
	if( ArrayOptFind( aIntersectFields, "This.id == 'start_date_plan'" ) != undefined && ArrayOptFind( aIntersectFields, "This.id == 'end_date_plan'" ) != undefined )
	{
		if( OptDate(get_form_field_val(aFormFields, 'start_date_plan') ) != undefined && OptDate(get_form_field_val(aFormFields, 'end_date_plan') ) != undefined )
		{
			if( OptDate(get_form_field_val(aFormFields, 'start_date_plan') ) > OptDate(get_form_field_val(aFormFields, 'end_date_plan') ) )
			{
				return remote_action_alert(oRes, i18n.t( 'planiruemayadat_2' ));
			}
		}
	}
	if( ArrayOptFind( aIntersectFields, "This.id == 'start_date_fact'" ) != undefined && ArrayOptFind( aIntersectFields, "This.id == 'end_date_fact'" ) != undefined )
	{
		if( OptDate(get_form_field_val(aFormFields, 'start_date_fact') ) != undefined && OptDate(get_form_field_val(aFormFields, 'end_date_fact') ) != undefined )
		{
			if( OptDate(get_form_field_val(aFormFields, 'start_date_fact') ) > OptDate(get_form_field_val(aFormFields, 'end_date_fact') ) )
			{
				return remote_action_alert(oRes, i18n.t( 'fakticheskayadat_2' ));
			}
		}
	}
	
	var teProject = null;
	if (isModeEdit) {
		dProject = tools.open_doc(iProjectID);
	} else {
		dProject = OpenNewDoc('x-local://wtv/wtv_project.xmd');
		dProject.BindToDb();
	}
	try {
		teProject = dProject.TopElem;
	} catch(e) {
		return remote_action_alert(oRes, i18n.t( 'neudalosotkryt' )+ iProjectID +')');
	}

	var sQueryProjectManagers = '';
	switch (sTypeLeaderChoice) {
		case 'subordinates':
			aSubordinateIDs = tools.get_sub_person_ids_by_func_manager_id(iPersonID, 'collaborator');
			sQueryProjectManagers = 'MatchSome($elem/id, ('+ ArrayMerge(aSubordinateIDs, 'This', ',') +'))';
			break;
	}

	function get_fld_val(sName) {
		return (teProject != null && (fld = teProject.GetOptProperty(sName)) != undefined && fld.HasValue) ? fld.Value : null;
	}

	function create_field(oArgs) {		
		function get_person_project_manager_string() {
			if (isModeEdit) {
				var aPersons = get_project_manager_person_ids(iProjectID, iBossTypeID);
				if (ArrayOptFirstElem(aPersons) != undefined) {
					return ArrayMerge(aPersons, 'This.object_id', ';');
				}
			} else {
				return String(iPersonID);
			}
			return null;
		}

		function get_project_file(fld) {
			var chFile = ArrayOptFirstElem(teProject.files);
			var feFile = (chFile != undefined) ? chFile.file_id.OptForeignElem : undefined;
			if (isModeEdit && feFile != undefined && feFile.name.HasValue) {
				switch (fld) {
					case 'name':
						// alert('name: ' + feFile.name.Value);
						return feFile.name.Value;
					case 'url':
						var sRsrc = tools_web.get_object_source_url('resource', chFile.file_id.Value);
						// var sRsrc = '';
						// dRsrc = tools.open_doc(chFile.file_id.Value);
						// if (dRsrc != undefined) {
						// 	teRsrc = dRsrc.TopElem;
						// 	sRsrc = (teRsrc.file_url.HasValue) ? teRsrc.file_url.Value : '';
						// }
						// alert('url: ' + sRsrc);
						return sRsrc;
				}
			} else {
				return '';
			}
		}
		
		switch (oArgs.id) {
			case 'name':
				oRes.result.form_fields.push({ 
					name: 'name', 
					page: 'main',
					label: oArgs.name,
					mandatory: true, 
					validation: 'nonempty',			
					type: 'string', 
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'desc':
				oRes.result.form_fields.push({ 
					name: 'desc', 
					page: 'main',
					label: oArgs.name,
					mandatory: bDescRequired,
					type: 'text', 
					richtext: true, 
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'start_date_plan':
				oRes.result.form_fields.push({ 
					name: 'start_date_plan',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'date',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'end_date_plan':
				oRes.result.form_fields.push({
					name: 'end_date_plan',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'date',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'plan_labor_costs':
				oRes.result.form_fields.push({
					name: 'plan_labor_costs',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'integer',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'status':
				oRes.result.form_fields.push({
					name: 'status',
					page: 'main',
					label: oArgs.name,
					mandatory: true,
					type: 'select',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null),
					entries: ArrayExtract(common.project_status_types, '({name:This.name.Value,value:This.PrimaryKey.Value})')
				});
				break;
			case 'join_mode':
				oRes.result.form_fields.push({
					name: 'join_mode',
					page: 'main',
					label: oArgs.name,
					mandatory: true,
					type: 'select',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null),
					entries: ArrayExtract(common.join_mode_types, '({name:This.name.Value,value:This.PrimaryKey.Value})')
				});
				break;
			case 'default_request_type_id':
				oRes.result.form_fields.push({
					visibility: [{ parent: 'join_mode', value: 'request' }],
					name: 'default_request_type_id',
					page: 'main',
					label: oArgs.name,
					mandatory: true,
					type: 'select',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null),
					entries: ArrayExtract(XQuery('for $elem in request_types where $elem/object_type = "project" return $elem/Fields("id", "name")'), "({name:This.name.Value,value:This.PrimaryKey.Value})")
				});
				break;
			case 'team_selected':
				oRes.result.form_fields.push({
					name: 'team_selected',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'bool',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'start_date_fact':
				oRes.result.form_fields.push({ 
					name: 'start_date_fact',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'date',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'end_date_fact':
				oRes.result.form_fields.push({
					name: 'end_date_fact',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'date',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'fact_labor_costs':
				oRes.result.form_fields.push({
					name: 'fact_labor_costs',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'integer',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'percent_complete':
				oRes.result.form_fields.push({
					name: 'percent_complete',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'integer',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'project_managers':
				oRes.result.form_fields.push({
					name: 'project_managers',
					page: 'main',
					label: oArgs.name,
					type: 'foreign_elem', 
					multiple: true,
					catalog: 'collaborator',
					query_qual: sQueryProjectManagers,
					mandatory: true,
					value: get_person_project_manager_string()
				});
				break;
			case 'text_result':
				oRes.result.form_fields.push({ 
					name: 'text_result', 
					page: 'main',
					label: oArgs.name,
					mandatory: false, 
					type: 'string', 
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'files':
				// var sFileName = get_project_file('name');
				// var sFileUrl = get_project_file('url');
				oRes.result.form_fields.push({ 
					name: 'files', 
					page: 'main',
					label: oArgs.name,
					mandatory: false, 
					type: 'file',
					value: (isModeEdit ? get_fld_val('file_id') : null)
				});
				break;
		}
	}

	function save_fields_form() {
		if (aFormFields == '') {
			return remote_action_alert(oRes, i18n.t( 'vsepolyaformypu' ));
		}

		teProject.name = get_form_field_val(aFormFields, 'name');
		teProject.desc = get_form_field_val(aFormFields, 'desc');
		teProject.start_date_plan = ((sData = OptDate(get_form_field_val(aFormFields, 'start_date_plan'), '')) != '') ? StrDate(sData, true) : '';
		teProject.end_date_plan = ((sData = OptDate(get_form_field_val(aFormFields, 'end_date_plan'), '')) != '') ? StrDate(sData, true) : '';
		teProject.plan_labor_costs = get_form_field_val(aFormFields, 'plan_labor_costs');
		teProject.status = get_form_field_val(aFormFields, 'status');
		teProject.join_mode = get_form_field_val(aFormFields, 'join_mode');
		teProject.default_request_type_id = get_form_field_val(aFormFields, 'default_request_type_id');
		teProject.team_selected = get_form_field_val(aFormFields, 'team_selected');
		teProject.start_date_fact = ((sData = OptDate(get_form_field_val(aFormFields, 'start_date_fact'), '')) != '') ? StrDate(sData, true) : '';
		teProject.end_date_fact = ((sData = OptDate(get_form_field_val(aFormFields, 'end_date_fact'), '')) != '') ? StrDate(sData, true) : '';
		teProject.fact_labor_costs = get_form_field_val(aFormFields, 'fact_labor_costs');
		teProject.percent_complete = get_form_field_val(aFormFields, 'percent_complete');

		oResource = ArrayOptFindByKey(aFormFields, 'files', 'name');
		if (oResource != undefined) {
			var sUrl = (oResource.GetOptProperty('url') != undefined) ? oResource.url : '';
			iResourceID = create_resource(oResource.value, sUrl, iPersonID);
			if (iResourceID != undefined) {
				teProject.files.ObtainChildByKey(iResourceID);
			} else {
				alert(i18n.t( 'createprojectn' ))
			}
		}

		teProject.text_result = get_form_field_val(aFormFields, 'text_result');
		try {
			dProject.Save();
		}
		catch (e) {
			return remote_action_alert(oRes, String(e));
		}
		iProjectIDNew = dProject.DocID;

		function delete_project_manager(iProjectMenegerID) {
			try {
				// alert('DELETE: ' + elem.id.Value);
				DeleteDoc(UrlFromDocID(iProjectMenegerID));
			} catch(e) {
				alert(i18n.t( 'createprojecto' ) + iProjectMenegerID);
			}
		}

		function set_project_managers(aBefore, aAfter, is_before) {
			if (is_before) {
				for (elem in aBefore) {
					if (ArrayOptFind(aAfter, 'OptInt(This) == elem.object_id.Value') == undefined) {
						delete_project_manager(elem.id.Value);
					} else {
						tools.create_project_participant(elem.object_id.Value, null, iProjectIDNew, iBossTypeID);
					}
				}
			} else {
				for (elem in aAfter) {
					if (ArrayOptFind(aBefore, 'This.object_id.Value == OptInt(elem)') == undefined) {
						tools.create_project_participant(elem, null, iProjectIDNew, iBossTypeID);
					}
				}
			}
		}

		var aProjectManagersBefore = (isModeEdit) ? ArraySelectAll(get_project_manager_person_ids(iProjectID, iBossTypeID)) : [];
		var aProjectManagersAfter = ((sManagers = Trim(get_form_field_val(aFormFields, 'project_managers'))) != '') ? sManagers.split(';') : [];
		
		if (isModeEdit) {
			set_project_managers(aProjectManagersBefore, aProjectManagersAfter, (ArrayCount(aProjectManagersBefore) > ArrayCount(aProjectManagersAfter)));
		} else {
			for (manager in aProjectManagersAfter) {
				tools.create_project_participant(manager, null, iProjectIDNew, iBossTypeID);
			}
		}
	}

	function create_project() {
		switch(sCommand) {
			case 'eval': 
			{
				oRes.result = {
					command: 'wizard',
					is_one_page: true,
					title: sTitle,
					message: '',
					pages: [{ name: 'main' }],
					form_fields: [],
					buttons: [
						{ name: 'submit', label: i18n.t( 'sohranit' ), type: 'submit' }, 
						{ name: 'cancel', label: i18n.t( 'otmenit' ), type: 'cancel'}
					]
				};

				for (fld in aIntersectFields) {
					create_field(fld);
				}
				break;
			}
			case 'submit_form':
			{
				save_fields_form();
				return close_form(oRes, i18n.t( 'proektuspeshno' )+ (isModeEdit ? i18n.t( 'otredaktirovan' ) : i18n.t( 'sozdan' )) + '.', true);
			}
		}
	}

	if (isModeEdit) {
		isPersonManager = is_project_manager(iPersonID, iProjectID, iBossTypeID);
		if (!isPersonManager) {
			return close_form(oRes, i18n.t( 'vynemozhetereda' ));
		} else {
			create_project();
		}
	} else {
		create_project();
	}

	return oRes;
}

/**
 * @typedef {Object} oArguments
 * @property {string} sChoiceParticipants –  Выбор участников - из подчиненных или всех сотрудников. По умолчанию – из всех сотрудников.
 * @property {boolean} bSendNotificationAfterInclude – Отправлять/не отправлять уведомление сотруднику о включении в проект.
 * @property {boolean} bSendNotificationChangeRole – Отправлять/не отправлять уведомление участнику о смене роли.
 * @property {boolean} bCommentRequired – Поле комментарий обязательно/не обязательно к заполнению.
 * @property {boolean} bRolesRequired – Поле роли обязательно/не обязательно к заполнению.
 * @property {boolean} bWithoutAgreement – Включать сотрудника в проект без согласования.
 * @property {string} fields – Cериализованное содержимое формы.
*/
/**
 * @author RA
 * @function CreateProjectParticipant
 * @memberof Websoft.WT.Project
 * @description Создание/редактирование карточки участника проекта.
 * @param {string} sCommand - Режим выполнения удаленного действия (показ формы/обработка формы).
 * @param {bigint} iPersonID - ID текущего пользователя.
 * @param {XmElem} tePerson - TopElem текущего пользователя.
 * @param {bigint} iProjectID - ID проекта.
 * @param {bigint} iProjectParticipantID - ID участника проекта. Если не задан, создается новый участник.
 * @param {oArguments} SCOPE_WVARS - Переменные УД.
 * @param {FormField[]} aFieldEntries - Массив entries переменной fields УД.
*/
function CreateProjectParticipant(sCommand, iPersonID, tePerson, iProjectID, iProjectParticipantID, SCOPE_WVARS, aFieldEntries) {
	var oRes = tools.get_code_library_result_object();
	var aFields, isModeEdit;
	var sTitle = i18n.t( 'dobavitredakti' );
	
	if (iPersonID == undefined || iPersonID == null || Trim(iPersonID) == '') {
		return close_form(oRes, i18n.t( 'otsutstvuetids' ));
	}
	
	try {
		if (iProjectID == undefined || iProjectID == null || Trim(iProjectID) == '') {
			throw '';
		}
	} catch(e) {
		return close_form(oRes, i18n.t( 'otsutstvuetidp' ));
	}

	var sProjectUrl = UrlSchema(CurRequest.Url) + '://' + CurRequest.UrlHost + tools_web.get_mode_clean_url(null, iProjectID);

	if (iProjectParticipantID != undefined && iProjectParticipantID != null && Trim(iProjectParticipantID) != '') {
		isModeEdit = is_project_participant(iProjectID, iProjectParticipantID);
		if (!isModeEdit) {
			return close_form(oRes, i18n.t( 'ukazannyyiducha' ));
		} else {
			isModeEdit = true;
		}
	} else {
		isModeEdit = false;
	}

	try {
		if (ObjectType(SCOPE_WVARS) != 'JsObject') {
			throw '';
		}
	} catch(e) {
		SCOPE_WVARS = ({});
	}

	if ((sChoiceParticipants = SCOPE_WVARS.GetOptProperty('sChoiceParticipants')) != undefined && Trim(sChoiceParticipants) != '') {
		sChoiceParticipants = Trim(sChoiceParticipants);
	} else {
		sChoiceParticipants = 'all';
	}

	if ((bSendNotificationAfterInclude = SCOPE_WVARS.GetOptProperty('bSendNotificationAfterInclude')) != undefined) {
		bSendNotificationAfterInclude = tools_web.is_true(bSendNotificationAfterInclude);
	} else {
		bSendNotificationAfterInclude = false;
	}

	if ((bSendNotificationChangeRole = SCOPE_WVARS.GetOptProperty('bSendNotificationChangeRole')) != undefined) {
		bSendNotificationChangeRole = tools_web.is_true(bSendNotificationChangeRole);
	} else {
		bSendNotificationChangeRole = false;
	}

	if ((bCommentRequired = SCOPE_WVARS.GetOptProperty('bCommentRequired')) != undefined) {
		bCommentRequired = tools_web.is_true(bCommentRequired);
	} else {
		bCommentRequired = false;
	}

	if ((bRolesRequired = SCOPE_WVARS.GetOptProperty('bRolesRequired')) != undefined) {
		bRolesRequired = tools_web.is_true(bRolesRequired);
	} else {
		bRolesRequired = true;
	}

	if ((bWithoutAgreement = SCOPE_WVARS.GetOptProperty('bWithoutAgreement')) != undefined) {
		bWithoutAgreement = tools_web.is_true(bWithoutAgreement);
	} else {
		bWithoutAgreement = false;
	}

	if ((sFields = String(SCOPE_WVARS.GetOptProperty('fields', ''))) != '') {
		aFields = sFields.split(';');
	} else {
		aFields = ['project_id', 'participant_id', 'boss_type_id', 'roles', 'start_date', 'finish_date', 'plan_load', 'percent_plan_load', 'is_excluded', 'comment', 'file_id'];
	}

	var tePP = null;
	if (isModeEdit) {
		try {
			dPP = OpenDoc(UrlFromDocID(iProjectParticipantID));
			tePP = dPP.TopElem;
		} catch(e) {
			return remote_action_alert(oRes, i18n.t( 'neudalosotkryt_1' )+ iProjectParticipantID +')');
		}
	}
	
	var sQueryRoles = '';
	if ((aRoles = get_project_roles(iProjectID)) != undefined) {
		sQueryRoles = 'MatchSome($elem/id, ('+ ArrayMerge(aRoles, 'This.id', ',') +'))';
	}
	
	var sQueryProjectParticipants = '';
	switch (sChoiceParticipants) {
		case 'subordinates':
			aSubordinateIDs = tools.get_sub_person_ids_by_func_manager_id(iPersonID, 'collaborator');
			sQueryProjectParticipants = 'MatchSome($elem/id, ('+ ArrayMerge(aSubordinateIDs, 'This', ',') +'))';
			break;
	}

	function get_pp_role_ids() {
		var arr = [];
		for (role_id in tePP.participant_roles_id) {
			arr.push(role_id);
		}
		return arr;
	}

	function get_fld_val(sName) {
		if (tePP != null) {
			switch (sName) {
				case 'roles':
					aRoles = get_pp_role_ids();
					return (ArrayCount(aRoles) > 0) ? ArrayMerge(aRoles, 'This', ';') : null;
				
				default:
					return ((oFld = tePP.GetOptProperty(sName)) != undefined && oFld.HasValue) ? oFld.Value : null;
			}
		}
		return null;
	}

	function get_project_roles_name() {
		if (tePP != null && tePP.participant_roles_id.HasValue) {
			aRoleNames = XQuery('for $elem in project_participant_roles where $elem/project_id = '+ iProjectID +' return $elem/Fields("id", "name")');
			if (ArrayCount(aRoleNames) > 0) {
				return ArrayMerge(ArrayExtractKeys(aRoleNames, 'name'), 'This', '|||');
			}
		}
		return '';
	}

	function create_field(oArgs) {	
		switch (oArgs.id) {
			case 'project_id':
				oRes.result.form_fields.push({ 
					name: oArgs.id, 
					page: 'main',
					label: oArgs.name,
					mandatory: true,
					type: 'foreign_elem', 
					catalog: 'project',
					value: iProjectID,
					display_value: ((tePP != null && (catProject = tePP.project_id.OptForeignElem) != undefined) ? catProject.name.Value : ''),
					disabled: true
				});
				break;
			case 'participant_id':
				oRes.result.form_fields.push({ 
					name: oArgs.id, 
					page: 'main',
					label: oArgs.name,
					mandatory: true,
					type: 'foreign_elem', 
					catalog: 'collaborator',
					query_qual: sQueryProjectParticipants, 
					value: (isModeEdit ? iProjectParticipantID : null),
					display_value: ((tePP != null && (catPerson = tePP.object_id.OptForeignElem) != undefined) ? catPerson.fullname.Value : ''),
					disabled: isModeEdit
				});
				break;
			case 'boss_type_id':
				oRes.result.form_fields.push({ 
					name: oArgs.id, 
					page: 'main',
					label: oArgs.name,
					mandatory: true,
					type: 'foreign_elem', 
					catalog: 'boss_type',
					query_qual: 'IsEmpty($elem/object_type) = true() or MatchSome($elem/object_type, ' + XQueryLiteral('project') + ')', 
					value: (isModeEdit ? get_fld_val(oArgs.id) : null),
					display_value: ((tePP != null && (catBossType = tePP.boss_type_id.OptForeignElem) != undefined) ? catBossType.name.Value : ''),
				});
				break;
			case 'roles':
				oRes.result.form_fields.push({ 
					name: 'roles',
					page: 'main',
					label: oArgs.name,
					mandatory: bRolesRequired,
					type: 'foreign_elem',
					multiple: true,
					catalog: 'project_participant_role',
					query_qual: sQueryRoles,
					value: (isModeEdit ? get_fld_val(oArgs.id) : null),
					display_value: get_project_roles_name()
				});
				break;
			case 'start_date':
				oRes.result.form_fields.push({
					name: 'start_date',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'date',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'finish_date':
				oRes.result.form_fields.push({
					name: 'finish_date',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'date',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'plan_load':
				oRes.result.form_fields.push({
					name: 'plan_load',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'integer',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'percent_plan_load':
				oRes.result.form_fields.push({
					name: 'percent_plan_load',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'integer',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'is_excluded':
				oRes.result.form_fields.push({
					name: 'is_excluded',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'bool',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'comment':
				oRes.result.form_fields.push({
					name: 'comment',
					page: 'main',
					label: oArgs.name,
					mandatory: bCommentRequired,
					type: 'string',
					value: (isModeEdit ? get_fld_val(oArgs.id) : null)
				});
				break;
			case 'file_id':
				oRes.result.form_fields.push({ 
					name: 'file_id',
					page: 'main',
					label: oArgs.name,
					mandatory: false,
					type: 'file',
					value: null
				});
				break;
		}
	}

	function save_fields_form() {
		var aFormFields = get_arr_value_form_fields(SCOPE_WVARS);
		if (aFormFields == '') {
			return remote_action_alert(oRes, i18n.t( 'vsepolyaformypu' ));
		}

		var iPPObjectID = get_form_field_val(aFormFields, 'participant_id');
		var iPPBossTypeID = get_form_field_val(aFormFields, 'boss_type_id');

		if (is_project_manager(iPPObjectID, iProjectID, iPPBossTypeID)) {
			return i18n.t( 'vproekteuzheest' );
		}

		if (!isModeEdit) {
			try {
				dPP = tools.create_project_participant(iPPObjectID, null, iProjectID, iPPBossTypeID, bWithoutAgreement);
				tePP = dPP.TopElem;
			} catch(e) {
				return i18n.t( 'neudalossozdat' );
			}

		} else {
			tePP.project_id = iProjectID;
			sDispName = common.exchange_object_types.GetChildByKey(tePP.catalog).disp_name;
			tePP.object_name = tools.get_foreign_field(tePP.object_id, sDispName, global_settings.object_deleted_str);
			tePP.catalog = 'collaborator';
			tools.common_filling('collaborator', tePP, iProjectID, tePerson);
			tePP.boss_type_id = iPPBossTypeID;
		}

		tePP.start_date = ((sData = OptDate(get_form_field_val(aFormFields, 'start_date'), '')) != '') ? StrDate(sData, true) : '';
		tePP.finish_date = ((sData = OptDate(get_form_field_val(aFormFields, 'finish_date'), '')) != '') ? StrDate(sData, true) : '';
		tePP.plan_load = get_form_field_val(aFormFields, 'plan_load');
		tePP.percent_plan_load = get_form_field_val(aFormFields, 'percent_plan_load');
		tePP.is_excluded = get_form_field_val(aFormFields, 'is_excluded');
		tePP.comment = get_form_field_val(aFormFields, 'comment');

		oResource = ArrayOptFindByKey(aFormFields, 'file_id', 'name');
		if (oResource != undefined) {
			var sUrl = (oResource.GetOptProperty('url') != undefined) ? oResource.url : '';
			iResourceID = create_resource(oResource.value, sUrl, iPersonID);
			if (iResourceID != undefined) {
				tePP.files.ObtainChildByKey(iResourceID);
			} else {
				alert(i18n.t( 'createprojectp' ))
			}
		}

		function set_pp_roles(aBefore, aAfter, is_before) {
			if (is_before) {
				for (elem in aBefore) {
					if (ArrayOptFind(aAfter, 'OptInt(This) == OptInt(elem)') == undefined) {
						tePP.participant_roles_id.DeleteByValue(elem);
					} else {
						tePP.participant_roles_id.ObtainByValue(OptInt(elem, ''));
					}
				}
			} else {
				for (elem in aAfter) {
					if (ArrayOptFind(aBefore, 'OptInt(This) == OptInt(elem)') == undefined) {
						tePP.participant_roles_id.ObtainByValue(OptInt(elem, ''));
					}
				}
			}
		}

		var sPPRoles = get_form_field_val(aFormFields, 'roles');
		var aPPRolesBefore = (isModeEdit) ? ArraySelectAll(get_pp_role_ids()) : [];
		var aPPRolesAfter = (sPPRoles != '' && StrContains(sPPRoles, ';')) ? sPPRoles.split(';') : (sPPRoles != '') ? [sPPRoles] : [];

		if (isModeEdit) {
			set_pp_roles(aPPRolesBefore, aPPRolesAfter, (ArrayCount(aPPRolesBefore) > ArrayCount(aPPRolesAfter)));
			if (bSendNotificationChangeRole && (ArrayCount(ArrayIntersect(aPPRolesBefore, aPPRolesAfter, 'This', 'This')) != ArrayCount(aPPRolesBefore))) {
				bSended = tools.create_notification('change_project_participant_role', tePP.object_id.Value, sProjectUrl, iProjectID, null, null);
				if (!bSended) {
					alert(i18n.t( 'createprojectp_1' ));
				}
			}
		} else {
			for (role in aPPRolesAfter) {
				tePP.participant_roles_id.ObtainByValue(OptInt(role, ''));
			}
		}

		dPP.Save();
		return '';
	}

	var aIntersectFields = ArrayIntersect(aFieldEntries, aFields, 'This.id', 'This');
	function create_project_participant() {
		switch(sCommand) {
			case 'eval':
			{
				oRes.result = {
					command: 'wizard',
					is_one_page: true,
					title: sTitle,
					message: '',
					pages: [{ name: 'main' }],
					form_fields: [],
					buttons: [
						{ name: 'submit', label: i18n.t( 'sohranit' ), type: 'submit' }, 
						{ name: 'cancel', label: i18n.t( 'otmenit' ), type: 'cancel'}
					]
				};

				for (fld in aIntersectFields) {
					create_field(fld);
				}
				break;
			}
			case 'submit_form':
			{
				var sFnResult = save_fields_form();
				if (sFnResult != '') {
					return remote_action_alert(oRes, sFnResult);
				}
				if (!isModeEdit && bSendNotificationAfterInclude && tePP.status_id.HasValue && tePP.status_id.Value == 'active') {
					bSended = tools.create_notification('include_person_to_project', tePP.object_id.Value, sProjectUrl, iProjectID, null, null);
					if (!bSended) {
						alert(i18n.t( 'createprojectp_2' ));
					}
				}
				var sTextDlgMessage = (isModeEdit) ? i18n.t( 'informaciyaobuch' ) : i18n.t( 'vybrannyysotru' );
				return close_form(oRes, sTextDlgMessage, true);
			}
		}
	}

	if (!is_project_manager(iPersonID, iProjectID)) {
		return close_form(oRes, i18n.t( 'polzovateldolzh' ));
	} else {
		create_project_participant();
	}

	return oRes;
}

/**
 * @typedef {Object} oArguments
 * @property {boolean} bSendNtfPM – Отправлять/не отправлять уведомление руководителям проекта.
 * @property {boolean} bCommentRequired – Поле комментарий обязательно к заполнению.
 * @property {boolean} bFilesRequired – Поле файл обязательно к заполнению.
 * @property {string} fields – Cериализованное содержимое формы.
*/
/**
 * @author RA
 * @function JoinToProject
 * @memberof Websoft.WT.Project
 * @description Добавление сотрудника в качестве участника проекта.
 * @param {string} sCommand - Режим выполнения удаленного действия (показ формы/обработка формы).
 * @param {bigint} iPersonID - ID текущего пользователя.
 * @param {bigint} iProjectID - ID проекта.
 * @param {oArguments} SCOPE_WVARS - Переменные УД.
 * @param {FormField[]} aFieldEntries - Массив entries переменной fields УД.
*/
function JoinToProject(sCommand, iPersonID, iProjectID, SCOPE_WVARS, aFieldEntries) {
	var oRes = tools.get_code_library_result_object();
	var sTitle = i18n.t( 'uchastvovatvpro' );
	var sProjectUrl = UrlSchema(CurRequest.Url) + '://' + CurRequest.UrlHost + tools_web.get_mode_clean_url(null, iProjectID);
	
	if (iPersonID == undefined || iPersonID == null || Trim(iPersonID) == '') {
		return close_form(oRes, i18n.t( 'otsutstvuetids' ));
	}

	if (iProjectID == undefined || iProjectID == null || Trim(iProjectID) == '') {
		return close_form(oRes, i18n.t( 'otsutstvuetidp' ));
	}

	
	var cPP = ArrayOptFirstElem(XQuery('for $pp in project_participants where some $p in projects satisfies ($pp/object_id = '+ iPersonID +' and $pp/project_id = $p/id and $p/id = '+ iProjectID +' and $p/join_mode = "open" and ($p/status = "plan" or $p/status = "active")) return $pp'));
	var cPR = ArrayOptFirstElem(XQuery('for $elem in project_participant_roles where $elem/project_id = '+ iProjectID +' return $elem/Fields("id")'));
	if (cPP != undefined || cPR == undefined) {
		return close_form(oRes, i18n.t( 'ubediteschtovyn' ));
	}

	try {
		if (ObjectType(SCOPE_WVARS) != 'JsObject') {
			throw '';
		}
	} catch(e) {
		SCOPE_WVARS = ({});
	}

	if ((bSendNtfPM = SCOPE_WVARS.GetOptProperty('bSendNtfPM')) != undefined) {
		bSendNtfPM = tools_web.is_true(bSendNtfPM);
	} else {
		bSendNtfPM = false;
	}

	if ((bCommentRequired = SCOPE_WVARS.GetOptProperty('bCommentRequired')) != undefined) {
		bCommentRequired = tools_web.is_true(bCommentRequired);
	} else {
		bCommentRequired = false;
	}

	if ((bFilesRequired = SCOPE_WVARS.GetOptProperty('bFilesRequired')) != undefined) {
		bFilesRequired = tools_web.is_true(bFilesRequired);
	} else {
		bFilesRequired = false;
	}

	var aFields;
	if ((sFields = String(SCOPE_WVARS.GetOptProperty('fields', ''))) != '') {
		aFields = sFields.split(';');
	} else {
		aFields = ['id', 'roles', 'comment', 'file_id'];
	}

	var sQueryRoles = '';
	if ((aRoles = get_project_roles(iProjectID)) != undefined) {
		sQueryRoles = 'MatchSome($elem/id, ('+ ArrayMerge(aRoles, 'This.id', ',') +'))';
	}

	function create_field(oArgs) {	
		switch (oArgs.id) {
			case 'id':
				oRes.result.form_fields.push({ 
					name: oArgs.id, 
					page: 'main',
					label: oArgs.name,
					mandatory: true,
					type: 'foreign_elem', 
					catalog: 'project',
					value: iProjectID,
					disabled: true
				});
				break;
			case 'roles':
				oRes.result.form_fields.push({ 
					name: 'roles',
					page: 'main',
					label: oArgs.name,
					mandatory: true,
					type: 'foreign_elem',
					multiple: true,
					catalog: 'project_participant_role',
					query_qual: sQueryRoles,
					value: null
				});
				break;
			case 'comment':
				oRes.result.form_fields.push({
					name: 'comment',
					page: 'main',
					label: oArgs.name,
					mandatory: bCommentRequired,
					type: 'string',
					value: null
				});
				break;
			case 'file_id':
				oRes.result.form_fields.push({ 
					name: 'file_id',
					page: 'main',
					label: oArgs.name,
					mandatory: bFilesRequired,
					type: 'file',
					value: null
				});
				break;
		}
	}

	function save_fields_form() {
		var aFormFields = get_arr_value_form_fields(SCOPE_WVARS);
		if (aFormFields == '') {
			return remote_action_alert(oRes, i18n.t( 'vsepolyaformypu' ));
		}

		var iBossTypeID = get_boss_type_id('project_participant');
		var dPM, tePM;
		try {
			dPM = tools.create_project_participant(iPersonID, null, iProjectID, iBossTypeID);
			tePM = dPM.TopElem;
		} catch(e) {
			return remote_action_alert(oRes, i18n.t( 'neudalosotkryt_2' ));
		}
		tePM.comment = get_form_field_val(aFormFields, 'comment');

		var oResource = ArrayOptFindByKey(aFormFields, 'file_id', 'name');
		if (oResource != undefined) {
			var sUrl = (oResource.GetOptProperty('url') != undefined) ? oResource.url : '';
			iResourceID = create_resource(oResource.value, sUrl, iPersonID);
			if (iResourceID != undefined) {
				tePM.files.ObtainChildByKey(iResourceID);
			} else {
				alert(i18n.t( 'jointoprojectn' ))
			}
		}

		var sPPRoles = get_form_field_val(aFormFields, 'roles');
		var aPPRoles = (sPPRoles != '' && StrContains(sPPRoles, ';')) ? sPPRoles.split(';') : (sPPRoles != '') ? [sPPRoles] : [];
		for (role in aPPRoles) {
			tePM.participant_roles_id.ObtainByValue(OptInt(role, ''));
		}

		dPM.Save();
		return tePM.status_id.Value;
	}

	var aIntersectFields = ArrayIntersect(aFieldEntries, aFields, 'This.id', 'This');
	switch(sCommand) {
		case 'eval':
			oRes.result = {
				command: 'wizard',
				is_one_page: true,
				title: sTitle,
				message: '',
				pages: [{ name: 'main' }],
				form_fields: [],
				buttons: [
					{ name: 'submit', label: i18n.t( 'sohranit' ), type: 'submit' }, 
					{ name: 'cancel', label: i18n.t( 'otmenit' ), type: 'cancel'}
				]
			};

			for (fld in aIntersectFields) {
				create_field(fld);
			}
			return oRes;

		case 'submit_form':
			var sStatePM = save_fields_form();
			var sText = i18n.t( 'tepervyuchastni' );
			if (sStatePM == 'agreement') {
				sText = i18n.t( 'zayavkanauchasti' )
			}
			if (bSendNtfPM) {
				xarrPersonFMs = XQuery('for $elem in func_managers where $elem/catalog = "collaborator" and $elem/object_id = '+ iPersonID +' return $elem');
				sParamText = ArrayOptFirstElem(XQuery('for $elem in collaborators where $elem/id = '+ iPersonID +' return $elem/Fields("fullname")'), { fullname: i18n.t( 'sotrudnik' ) }).fullname + ';' + sProjectUrl;
				for (fm in xarrPersonFMs) {
					bSendNotification = tools.create_notification('person_join_to_project', fm.person_id.Value, sParamText, iProjectID);
					if (!bSendNotification) {
						alert(i18n.t( 'jointoprojectn_1' ));
					}
				}
			}
			return close_form(oRes, sText, true);
	}
}

/**
 * @author RA
 * @function ChangeProjectStatus
 * @memberof Websoft.WT.Project
 * @description Изменить статус проекта.
 * @param {string} sCommand - Режим выполнения удаленного действия (показ формы/обработка формы).
 * @param {bigint} iPersonID - ID текущего пользователя.
 * @param {bigint} iProjectID - ID проекта.
 * @param {string} sStatus - Статус проекта.
*/
function ChangeProjectStatus(sCommand, iPersonID, iProjectID, sStatus) {
	var oRes = tools.get_code_library_result_object();
	
	if (iPersonID == undefined || iPersonID == null || Trim(iPersonID) == '') {
		return remote_action_alert(oRes, i18n.t( 'otsutstvuetids' ));
	}
	
	if (iProjectID == undefined || iProjectID == null || Trim(iProjectID) == '') {
		return remote_action_alert(oRes, i18n.t( 'otsutstvuetidp' ));
	}

	if (!is_project_manager(iPersonID, iProjectID)) {
		return remote_action_alert(oRes, i18n.t( 'polzovateldolzh' ));
	}

	function set_poject_status(dProject) {
		dProject.TopElem.status = sStatus;
		dProject.Save();

		return {
			command: 'alert', 
			msg: i18n.t( 'statusproektau' ),
			confirm_result: { command: 'reload_page' }
		};
	}

	function send_notification(iExecutor, sTextParam, iTaskID, teTask) {
		bSended = tools.create_notification('change_status_task_project', iExecutor, sTextParam, iTaskID, null, teTask);
		if (!bSended) {
			alert(i18n.t( 'changeprojects' ))
		}
	}

	function change_tasks_status(aTasks, dProject, sState) {
		var sProjectUrl = UrlSchema(CurRequest.Url) + '://' + CurRequest.UrlHost + tools_web.get_mode_clean_url(null, iProjectID);
		var cProject = ArrayOptFirstElem(XQuery('for $elem in projects where $elem/id = '+ iProjectID +' return $elem/Fields("name")'));
		var sProjectName = i18n.t( 'beznazvaniya' );
		if (cProject != undefined && cProject.name.HasValue) {
			sProjectName = cProject.name.Value;
		}
		
		for (task in aTasks) {
			dTask = tools.open_doc(task.id);
			if (dTask != undefined) {
				teTask = dTask.TopElem;
				teTask.status = sState;
				dTask.Save();

				iExecutor = (teTask.executor_id.HasValue) ? teTask.executor_id.Value : '';
				sTextParam = sProjectName + ';' + sProjectUrl;
				send_notification(iExecutor, sTextParam, task.id.Value, teTask);
			}
		}

		return set_poject_status(dProject);
	}

	function checkProjectTasks() {
		return tools.xquery('for $elem in tasks where $elem/source_object_id = '+ iProjectID +' and MatchSome($elem/status, ("p", "r", "0")) return $elem/id, $elem/__data');
	}

	function close_project(dProject) {
		xarrProjectTasks = checkProjectTasks();
		if (ArrayCount(xarrProjectTasks) > 0) {
			return {
				command: 'confirm', 
				msg: i18n.t( 'vnimanievproek' ),
				confirm_result: change_tasks_status(xarrProjectTasks, dProject, '1')
			};
		} else {
			return set_poject_status(dProject);
		}
	}

	function cancel_project(dProject) {
		xarrProjectTasks = checkProjectTasks();
		if (ArrayCount(xarrProjectTasks) > 0) {
			return {
				command: 'confirm', 
				msg: i18n.t( 'vnimanievproek_1' ),
				confirm_result: change_tasks_status(xarrProjectTasks, dProject, 'x')
			};
		} else {
			return set_poject_status(dProject);
		}
	}

	dProject = tools.open_doc(iProjectID);
	if (dProject == undefined) {
		return remote_action_alert(oRes, i18n.t( 'neudalosotkryt_3' ));
	}
	teProject = dProject.TopElem;

	switch (sStatus) {
		case 'close':
		{
			if (teProject.allow_assessment.HasValue && teProject.allow_assessment.Value) {
				oRes.result = {
					command: 'confirm', 
					msg: i18n.t( 'vyuverenychtoho' ),
					confirm_result: close_project(dProject)
				};
				return oRes;
			} else {
				oRes.result = {
					command: 'confirm', 
					msg: i18n.t( 'vnimanieposlez' ),
					confirm_result: close_project(dProject)
				};
				return oRes;
			}
		}
		case 'cancel':
		{
			oRes.result = {
				command: 'confirm', 
				msg: i18n.t( 'vyuverenychtoho_1' ),
				confirm_result: cancel_project(dProject)
			};
			return oRes;
		}
		case 'active':
		{
			oRes.result = {
				command: 'confirm', 
				msg: i18n.t( 'vyuverenychtoho_2' ),
				confirm_result: set_poject_status(dProject)
			};
			return oRes;
		}
		case 'plan':
		{
			oRes.result = {
				command: 'confirm', 
				msg: i18n.t( 'vyuverenychtoho_3' ),
				confirm_result: set_poject_status(dProject)
			};
			return oRes;
		}
	}
}

/**
 * @typedef {Object} oArguments
 * @property {boolean} bSendNotificationAfterInclude – Отправлять/не отправлять уведомление сотруднику о включении в проект.
 * @property {string} fields – Cериализованное содержимое формы.
*/
/**
 * @author RA
 * @function AddProjectParicipant
 * @memberof Websoft.WT.Project
 * @description Добавить сотрудника в проект.
 * @param {string} sCommand - Режим выполнения удаленного действия (показ формы/обработка формы).
 * @param {bigint} iBossID - ID текущего пользователя (руководителя).
 * @param {bigint} iPersonID - ID пользователя.
 * @param {oArguments} SCOPE_WVARS - Переменные УД.
 * @param {FormField[]} aFieldEntries - Массив entries переменной fields УД.
*/
function AddProjectParicipant(sCommand, iBossID, iPersonID, SCOPE_WVARS, aFieldEntries) {
	var oRes = tools.get_code_library_result_object();
	var sTitle = i18n.t( 'dobavituchastni' );
	var iBossTypeID = get_boss_type_id('project_participant');
	var sProjectUrl = '';
	
	if (iBossID == undefined || iBossID == null || Trim(iBossID) == '') {
		return remote_action_alert(oRes, i18n.t( 'otsutstvuetidt' ));
	}

	if (iPersonID == undefined || iPersonID == null || Trim(iPersonID) == '') {
		return remote_action_alert(oRes, i18n.t( 'otsutstvuetids' ));
	}

	try {
		if (ObjectType(SCOPE_WVARS) != 'JsObject') {
			throw '';
		}
	} catch(e) {
		SCOPE_WVARS = ({});
	}

	if ((bSendNotificationAfterInclude = SCOPE_WVARS.GetOptProperty('bSendNotificationAfterInclude')) != undefined) {
		bSendNotificationAfterInclude = tools_web.is_true(bSendNotificationAfterInclude);
	} else {
		bSendNotificationAfterInclude = false;
	}

	var aFields;
	if ((sFields = String(SCOPE_WVARS.GetOptProperty('fields', ''))) != '') {
		aFields = sFields.split(';');
	} else {
		aFields = ['project_id', 'role_id'];
	}

	var aProjectsID = get_manager_projects(iBossID);
	var sQueryQual = (ArrayCount(aProjectsID) > 0) ? 'MatchSome($elem/id, ('+ ArrayMerge(aProjectsID, 'This.id', ',') +'))' : '';
	function create_field(oArgs) {	
		switch (oArgs.id) {
			case 'project_id':
				oRes.result.form_fields.push({ 
					name: oArgs.id, 
					page: 'choice_project',
					label: oArgs.name,
					mandatory: true,
					type: 'foreign_elem', 
					catalog: 'project',
					value: null,
					query_qual: sQueryQual
				});
				break;
			case 'role_id':
				oRes.result.form_fields.push({
					visibility: [{ parent: 'project_id', value: 'notnull' }],
					name: oArgs.id, 
					page: 'choice_project',
					label: oArgs.name,
					mandatory: true,
					type: 'foreign_elem', 
					catalog: 'project_participant_role',
					value: null,
					query_qual: '$elem/project_id = {{param}}'
				});
				break;
		}
	}

	var aFormFields = get_arr_value_form_fields(SCOPE_WVARS);
	if (aFormFields == '') {
		return remote_action_alert(oRes, i18n.t( 'vsepolyaformypu' ));
	}

	var aIntersectFields = ArrayIntersect(aFieldEntries, aFields, 'This.id', 'This');
	switch(sCommand) {
		case 'eval':
			oRes.result = {
				command: 'wizard',
				is_one_page: true,
				title: sTitle,
				message: '',
				pages: [{ name: 'choice_project' }],
				form_fields: [],
				buttons: [
					{ name: 'submit', label: i18n.t( 'sohranit' ), type: 'submit' }, 
					{ name: 'cancel', label: i18n.t( 'otmenit' ), type: 'cancel'}
				]
			};

			for (fld in aIntersectFields) {
				create_field(fld);
			}
			return oRes;

		case 'submit_form':
			try {
				iProjectID = get_form_field_val(aFormFields, 'project_id');
				iRoleID = get_form_field_val(aFormFields, 'role_id');
				sProjectUrl = UrlSchema(CurRequest.Url) + '://' + CurRequest.UrlHost + tools_web.get_mode_clean_url(null, iProjectID);

				dPP = tools.create_project_participant(iPersonID, null, iProjectID, iBossTypeID, true);
				dPP.TopElem.participant_roles_id.ObtainByValue(iRoleID);
				dPP.Save();
			} catch(e) {
				return remote_action_alert(oRes, i18n.t( 'sotrudnikuzheyav' ));
			}
		
			if (bSendNotificationAfterInclude) {
				bSended = tools.create_notification('include_person_to_project', iPersonID, sProjectUrl, iProjectID, null, null);
				if (!bSended) {
					alert(i18n.t( 'addprojectpari' ));
				}
			}
		
			return close_form(oRes, i18n.t( 'sotrudnikbyldo' ), true);
	}
}

/**
 * @author RA, LP
 * @function RemoveProjectRole
 * @memberof Websoft.WT.Project
 * @description Удалить роль проекта.
 * @param {string} sCommand - Режим выполнения удаленного действия (показ формы/обработка формы).
 * @param {bigint} iPersonID - ID текущего пользователя.
 * @param {bigint} iRoleID - ID роли.
*/
function RemoveProjectRole(sCommand, iPersonID, iRoleID) {
	var oRes = tools.get_code_library_result_object();

	if (iPersonID == undefined || iPersonID == null || Trim(iPersonID) == '') {
		return remote_action_alert(oRes, i18n.t( 'otsutstvuetids' ));
	}

	if (iRoleID == undefined || iRoleID == null || Trim(iRoleID) == '') {
		return remote_action_alert(oRes, i18n.t( 'otsutstvuetidr' ));
	}
	
	xarrPP = XQuery('for $elem in project_participants where MatchSome( $elem/participant_roles_id, ( ' + iRoleID + ' ) ) return $elem');
	if (ArrayOptFirstElem(xarrPP) != undefined) {
		return remote_action_alert(oRes, i18n.t( 'vproekteestucha' ));
	}
	
	var docProjectParticipantRole = tools.open_doc( iRoleID );
	if( docProjectParticipantRole == undefined )
	{
		return remote_action_alert(oRes, i18n.t( 'nekorrektnyyid_1' ));
	}
	if( docProjectParticipantRole.TopElem.project_id.HasValue )
	{
		catProjectManagerBossType = ArrayOptFirstElem( XQuery( "for $elem in boss_types where $elem/code = 'project_manager' return $elem" ) );
		if( catProjectManagerBossType != undefined )
		{
			if( ArrayOptFirstElem( XQuery( "for $elem in project_participants where $elem/object_id = " + iPersonID + " and  $elem/project_id = " + docProjectParticipantRole.TopElem.project_id + " and $elem/boss_type_id = " + catProjectManagerBossType.id + " and ( $elem/status_id = 'active' or $elem/status_id = null() ) return $elem" ) ) == undefined )
			{
				return remote_action_alert(oRes, i18n.t( 'uvasnetpravnau' ));
			}
		}
	}
	
	function remove_role() {
		try {
			DeleteDoc(UrlFromDocID(iRoleID));
			return { command: 'alert', msg: i18n.t( 'roluchastnikovp' ) }
		} catch(e) {
			return { command: 'alert', msg: i18n.t( 'vozniklaoshibka' ) + e }
		}
	}

	if (sCommand == 'eval') {
		oRes.result = {
			command: 'confirm',
			msg: i18n.t( 'vyuverenychtoho_4' ),
			confirm_result: remove_role()
		};
		return oRes;
	}
}

/**
 * @author RA
 * @function RemoveProjectTask
 * @memberof Websoft.WT.Project
 * @description Удалить задачу проекта.
 * @param {string} sCommand - Режим выполнения удаленного действия (показ формы/обработка формы).
 * @param {bigint} iPersonID - ID текущего пользователя.
 * @param {bigint} iTaskID - ID задачи.
*/
function RemoveProjectTask(sCommand, iPersonID, iTaskID) {
	var oRes = tools.get_code_library_result_object();

	if (iPersonID == undefined || iPersonID == null || Trim(iPersonID) == '') {
		return remote_action_alert(oRes, i18n.t( 'otsutstvuetids' ));
	}

	if (iTaskID == undefined || iTaskID == null || Trim(iTaskID) == '') {
		return remote_action_alert(oRes, i18n.t( 'otsutstvuetidz' ));
	}

	var bStage = false;
	var cTask = ArrayOptFirstElem(XQuery('for $elem in tasks where $elem/id = '+ iTaskID +' return $elem/Fields("id", "source_object_id", "parent_task_id")'));
	if (cTask != undefined && cTask.parent_task_id.HasValue) {
		bStage = true;
	} else if (cTask == undefined) {
		return remote_action_alert(oRes, i18n.t( 'zadachasid' ) + iTaskID + i18n.t( 'otsutstvuetvba' ));
	}

	if (cTask.source_object_id.HasValue && !is_project_manager(iPersonID, cTask.source_object_id.Value)) {
		return remote_action_alert(oRes, i18n.t( 'vyneyavlyaetesru_1' ));
	}

	function remove_task() {
		var sMsg = (bStage) ? i18n.t( 'etapproektauda' ) : i18n.t( 'zadachaproektau' );
		try {
			DeleteDoc(UrlFromDocID(iTaskID));
			return { command: 'alert', msg: sMsg }
		} catch(e) {
			sMsg = i18n.t( 'vozniklaoshibka_1' )+ (bStage ? i18n.t( 'etapa' ) : i18n.t( 'zadachi' )) +i18n.t( 'proekta' );
			return { command: 'alert', msg: sMsg + e }
		}
	}

	switch (sCommand) {
		case 'eval':
		{
			var sMsg = i18n.t( 'vyuverenychtoho_5' )+ (bStage ? i18n.t( 'etap' ) : i18n.t( 'zadachu' )) +i18n.t( 'proekta_1' );
			var bTaskHasChilds = (ArrayOptFirstElem(XQuery('for $elem in tasks where $elem/parent_task_id = '+ iTaskID +' return $elem/Fields("id")')) != undefined);
			if (bTaskHasChilds) {
				return remote_action_alert(oRes, i18n.t( 'vdannometapees' ));
			} else {
				oRes.result = {
					command: 'confirm',
					msg: sMsg,
					confirm_result: remove_task()
				}
				return oRes;
			}				
		}
	}
}

// ======================================================================================
// =================  Внутрибиблиотечные служебные функции (notfordoc) - START ==========
// ======================================================================================
function get_boss_type_id(code) {
	return ArrayOptFirstElem(XQuery('for $elem in boss_types where $elem/code = '+ XQueryLiteral(code) +' return $elem/Fields("id")'), {id: undefined}).id;
}

function get_form_field_val(fields, fld) {
	oFld = ArrayOptFindByKey(fields, fld, 'name');
	if (oFld != undefined) {
		return oFld.value;
	} else {
		return '';
	}
}

function get_arr_value_form_fields(SCOPE_WVARS) {
	var form_fields = SCOPE_WVARS.GetOptProperty('form_fields', '');
	if (form_fields != '') {
		return ParseJson(form_fields);
	}
	return '';
}

function set_error(oRes, iError, sErrorText) {
	oRes.error = iError;
	oRes.errorText = sErrorText;
	oRes.array = [];
}

function get_project_managers(iProjectID, iBossTypeID, bShortName) {
	aManagers = [];
	xarrPersons = XQuery('for $elem in project_participants where $elem/catalog = "collaborator" and $elem/project_id = '+ iProjectID +' and $elem/boss_type_id = '+ iBossTypeID +' and ( $elem/status_id = \'active\' or $elem/status_id = null() ) return $elem/Fields("id", "object_name")');

	for (person in xarrPersons) {
		iPerson = person.id.Value;
		if (bShortName) {
			aFullName = (person.object_name.HasValue) ? Trim(person.object_name.Value).split(' ') : [];
			sFullName = (ArrayCount(aFullName) >= 1) ? aFullName[0] + ' ' + aFullName[1] : '';
		} else {
			sFullName = (person.object_name.HasValue) ? Trim(person.object_name.Value) : '';
		}
		aManagers.push(sFullName);
		// oParticipant = {
		// 	id: iPerson,
		// 	name: sFullName,
		// 	link: tools_web.get_mode_clean_url(null, iPerson),
		// }
		// aManagers.push(oParticipant);
	}
	if (ArrayCount(aManagers) > 0) {
		return [{ id: ArrayOptFirstElem(xarrPersons).id.Value, name: ArrayMerge(aManagers, 'This', ', ')}];
	}
	return [{ id: ArrayOptFirstElem(xarrPersons).id.Value, name: i18n.t( 'otsutstvuyut' ) }];
}

function get_manager_projects(iBossID) {
	iBossTypeID = get_boss_type_id('project_manager');
	return XQuery('for $elem in projects where some $pp in project_participants satisfies ($elem/id = $pp/project_id and $pp/object_id = '+ iBossID +' and $pp/boss_type_id = '+ iBossTypeID +') return $elem/Fields("id")');
}

function close_form(oRes, sMsg, isReload) {
	oRes.result = { command: 'close_form', msg: sMsg };
	try {
		if (isReload == undefined || isReload == null || isReload == '') {
			throw '';
		} else {
			isReload = tools_web.is_true(isReload);
		}
	} catch(e) {
		isReload = false;
	}
	if (isReload) {
		oRes.result.confirm_result = { command: 'reload_page' };
	}
	return oRes;
}

function remote_action_alert(oRes, sMsg) {
	oRes.result = { command: 'alert', msg: sMsg };
	return oRes;
}

function is_project_participant(iProjectID, iParticipant) {
	return (ArrayOptFirstElem(XQuery('for $elem in project_participants where $elem/project_id = '+ iProjectID +' and $elem/id = '+ iParticipant +' and ( $elem/status_id = \'active\' or $elem/status_id = null() ) return $elem/Fields("id")')) != undefined);
}

function is_exist_project(iProjectID) {
	return (ArrayOptFirstElem(XQuery('for $elem in projects where $elem/id = '+ iProjectID +' return $elem/Fields("id")')) != undefined);
}

function is_project_manager(iPersonID, iProjectID, iBossTypeID) {
	try {
		iBossTypeID = OptInt(iBossTypeID);
		if (iBossTypeID == undefined) {
			throw '';
		}
	} catch(e) {
		iBossTypeID = get_boss_type_id('project_manager');
	}
	
	xarrProjects = XQuery('for $elem in project_participants where $elem/object_id = '+ iPersonID +' and $elem/project_id = '+ iProjectID +' and $elem/boss_type_id = '+ iBossTypeID + ' return $elem/Fields("id")');
	return (ArrayOptFirstElem(xarrProjects) != undefined);
}

function get_project_manager_person_ids(iProjectID, iBossTypeID, sConditional) {
	if (sConditional == undefined || sConditional == null) {
		sConditional = '';
	}
	return XQuery('for $elem in project_participants where $elem/project_id = '+ iProjectID +' and $elem/boss_type_id = '+ iBossTypeID + sConditional + ' and ( $elem/status_id = \'active\' or $elem/status_id = null() ) return $elem/Fields("object_id", "id")');
}

function get_project_roles(iProjectID) {
	return XQuery('for $elem in project_participant_roles where $elem/project_id = '+ iProjectID +' return $elem');
}

function create_resource(sName, sUrl, iPersonID) {
	try {
		dResource = OpenNewDoc('x-local://wtv/wtv_resource.xmd');
		dResource.BindToDb();
		dResource.TopElem.name = sName;
		dResource.TopElem.person_id = iPersonID;
		tools.common_filling('collaborator', dResource.TopElem, iPersonID);
		if (sUrl != undefined && sUrl != null && sUrl != '') {
			dResource.TopElem.put_data(sUrl);
		}
		dResource.Save();
		return OptInt(dResource.DocID);
	} catch(e) {
		return undefined;
	}
}
/**
 * @author LP
 * @function CreateProjectParticipantRole
 * @memberof Websoft.WT.Project
 * @description Создание/редактирование роли участника проекта.
 * @param {string} sCommand - Режим выполнения удаленного действия (показ формы/обработка формы).
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {bigint} iProjectID - ID проекта, если есть.
 * @param {bigint} [iProjectParticipantRoleID] - ID роли участника проекта, если есть.
 * @param {oArguments} [SCOPE_WVARS] - Переменные УД.
*/
function CreateProjectParticipantRole( sCommand, iPersonID, iProjectID, iProjectParticipantRoleID, SCOPE_WVARS )
{
	function set_error( iError, sErrorText, bResult )
	{
		oRes.error = iError;
		oRes.errorText = sErrorText;
		oRes.result = bResult;
	}

	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.action_result = ({});
	
	try
	{
		if( ObjectType( SCOPE_WVARS ) != "JsObject" )
			throw "";
	}
	catch( ex )
	{
		 SCOPE_WVARS = ({});
	}
	try
	{
		iPersonID = Int( iPersonID )
	}
	catch( ex )
	{
		set_error( 1, i18n.t( 'peredannekorre_4' ), false );
		oRes.action_result = { command: "alert", msg: i18n.t( 'peredannekorre_4' ) };
		return oRes;
	}
	try
	{
		iProjectID = Int( iProjectID )
	}
	catch( ex )
	{
		set_error( 1, i18n.t( 'peredannekorre_5' ), false );
		oRes.action_result = { command: "alert", msg: i18n.t( 'peredannekorre_5' ) };
		return oRes;
	}
	try
	{
		iProjectParticipantRoleID = OptInt( iProjectParticipantRoleID );
	}
	catch( ex )
	{
		iProjectParticipantRoleID = undefined;
	}
	
	xarrBossTypes = tools.get_object_relative_boss_types( iPersonID, iProjectID );
	xarrOperations = tools.get_relative_operations_by_boss_types( xarrBossTypes );
	if( ArrayOptFind( xarrOperations, "This.action == 'can_create_update_project_participant_role'" ) == undefined )
	{
		set_error( 1, i18n.t( 'usotrudnikanet' ), false );
		oRes.action_result = { command: "alert", msg: i18n.t( 'usotrudnikanet' ) };
		return oRes;
	}
	
	docProjectParticipantRole = null;
	if( iProjectParticipantRoleID != undefined )
	{
		docProjectParticipantRole = tools.open_doc( iProjectParticipantRoleID );
		if( docProjectParticipantRole == undefined )
		{
			set_error( 1, i18n.t( 'peredannekorre_6' ), false );
			oRes.action_result = { command: "alert", msg: i18n.t( 'peredannekorre_6' ) };
			return oRes;
		}
	}
	
	switch( sCommand )
	{
		case "eval":
			oRes.action_result = { 	command: "display_form",
						title: ( iProjectParticipantRoleID == undefined ? i18n.t( 'novayarol' ) : i18n.t( 'redaktirovanie' ) ),
						header: ( iProjectParticipantRoleID == undefined ? i18n.t( 'novayarol' ) : i18n.t( 'redaktirovanie' ) ),
						form_fields: [],
						buttons:
						[
							{ name: "submit", label: "Ok", type: "submit" },
							{ name: "cancel", label: i18n.t( 'otmenit' ), type: "cancel"},
							{ name: "submit", label: i18n.t( 'redaktirovatur' ), type: "submit", submit_type: "edit_knowledge"}
						],
						no_buttons: false						
					};
			docProject = tools.open_doc( iProjectID )
			oRes.action_result.form_fields.push( { name: "project_name_paragraph", type: "paragraph", value: i18n.t( 'proekt' ) + " - " + docProject.TopElem.name } );
			oRes.action_result.form_fields.push( { name: "name", label: i18n.t( 'nazvanie' ), type: "string", value: ( docProjectParticipantRole != null ? docProjectParticipantRole.TopElem.name.Value : "" ), mandatory: true } );
			oRes.action_result.form_fields.push( { name: "participant_num", label: i18n.t( 'kolichestvouchas' ), type: "integer", value: ( docProjectParticipantRole != null ? docProjectParticipantRole.TopElem.participant_num.Value : "" ), mandatory: false } );
			oRes.action_result.form_fields.push( { name: "knowledge_parts_value", label: i18n.t( 'trebuemyeznaniya' ), type: "foreign_elem", catalog: "knowledge_part", multiple: true, value: ( docProjectParticipantRole != null ? ArrayMerge( docProjectParticipantRole.TopElem.knowledge_parts, "This.knowledge_part_id.Value", ";" ) : "" ), display_value: ( docProjectParticipantRole != null ? ArrayMerge( docProjectParticipantRole.TopElem.knowledge_parts, "This.knowledge_part_name.Value", "|||" ) : "" ), mandatory: false } );
			oRes.action_result.form_fields.push( { name: "comment", label: i18n.t( 'kommentariy' ), type: "text", value: ( docProjectParticipantRole != null ? docProjectParticipantRole.TopElem.comment.Value : "" ), mandatory: false } );
			break;
		case "submit_form":
			oFormFields = null;
			var form_fields = SCOPE_WVARS.GetOptProperty( "form_fields", "" )
			if ( form_fields != "" )
				oFormFields = ParseJson( form_fields );
			
			if( iProjectParticipantRoleID == undefined )
			{
				docProjectParticipantRole = OpenNewDoc( 'x-local://wtv/wtv_project_participant_role.xmd' );
				docProjectParticipantRole.TopElem.project_id = iProjectID;
			}
			
			
			sSubmitType = ArrayOptFind( oFormFields, "This.name == '__submit_type__'" );
			sSubmitType = sSubmitType != undefined ? sSubmitType.value : "";
			for( _field in oFormFields )
			{

				if( docProjectParticipantRole.TopElem.ChildExists( _field.name ) )
				{
					docProjectParticipantRole.TopElem.EvalPath( _field.name ).Value = _field.value;
				}
				else if( _field.name == "knowledge_parts_value" )
				{
					arrKnowledgeParts = String( _field.value ).split( ";" );
					arrKnowledgeParts = ArrayExtract( arrKnowledgeParts, "OptInt( This )" );  
					docProjectParticipantRole.TopElem.knowledge_parts.DeleteChildren( "!StrContains( String( _field.value ), String( This.PrimaryKey.Value ) )" );

					for ( _value in arrKnowledgeParts )
					{
						if( docProjectParticipantRole.TopElem.knowledge_parts.ChildByKeyExists( _value ) )
						{
							continue;
						}
						docKnowledgePart = tools.open_doc( _value );
						if( docKnowledgePart == undefined )
						{
							continue;
						}
						_kp = docProjectParticipantRole.TopElem.knowledge_parts.ObtainChildByKey( _value );
						_kp.knowledge_part_name = docKnowledgePart.TopElem.name;
						_kp.require_acknowledgement = docKnowledgePart.TopElem.require_acknowledgement;
						_kp.full_path = tools.knowledge_part_path_by_knowledge_part_id( _value );
					}
				}

			}
			for( _field in oFormFields )
			{

				if( StrContains( _field.name, "edit_knowledge_" ) )
				{
					arr = String( _field.name ).split( "_" )
					iKnowledgePartID = OptInt( arr[ 2 ] );
					if( iKnowledgePartID != undefined )
					{
						_kp = docProjectParticipantRole.TopElem.knowledge_parts.GetOptChildByKey( iKnowledgePartID );
						if( _kp != undefined )
						{
							docKnowledgePart = tools.open_doc( iKnowledgePartID );
							if( docKnowledgePart == undefined )
							{
								continue;
							}
							_kp.target_level_id = _field.value;
							_kp.target_level_name = docKnowledgePart.TopElem.levels.ObtainChildByKey( _field.value ).name;
						}
					}
				}
			}
			
			if( sSubmitType == "edit_knowledge" )
			{
				oRes.action_result = { 	command: "display_form",
						title: i18n.t( 'redaktirovanie_1' ) ,
						header: i18n.t( 'redaktirovanie_1' ),
						form_fields: [],					
					};
				oRes.action_result.form_fields.push( { name: "name", label: i18n.t( 'nazvanie' ), type: "hidden", value: docProjectParticipantRole.TopElem.name.Value, mandatory: true } );
				oRes.action_result.form_fields.push( { name: "participant_num", label: i18n.t( 'kolichestvouchas' ), type: "hidden", value: docProjectParticipantRole.TopElem.participant_num.Value , mandatory: false } );
				oRes.action_result.form_fields.push( { name: "knowledge_parts_value", label: i18n.t( 'trebuemyeznaniya' ), type: "hidden", value: ArrayMerge( docProjectParticipantRole.TopElem.knowledge_parts, "This.knowledge_part_id.Value", ";" ), mandatory: true } );
				oRes.action_result.form_fields.push( { name: "comment", label: i18n.t( 'kommentariy' ), type: "hidden", value: docProjectParticipantRole.TopElem.comment.Value, mandatory: true } );
				
				for( _kp in docProjectParticipantRole.TopElem.knowledge_parts )
				{
					docKnowledgePart = tools.open_doc( _kp.PrimaryKey );
					if( docKnowledgePart == undefined )
					{
						continue;
					}
					obj = { name: "edit_knowledge_" + _kp.PrimaryKey, label: _kp.knowledge_part_name.Value, type: "select", value: _kp.target_level_id.Value, display_value: _kp.target_level_name.Value, mandatory: false, entries: [] };
					for( _entr in docKnowledgePart.TopElem.levels )
						obj.entries.push( { name: _entr.name.Value, value: _entr.id.Value } );
					oRes.action_result.form_fields.push( obj );
				}
				return oRes;
			}
			if( iProjectParticipantRoleID == undefined )
			{
				docProjectParticipantRole.BindToDb();
			}
			docProjectParticipantRole.Save()
			docProject = tools.open_doc( iProjectID );
			docProject.TopElem.participant_roles.ObtainChildByKey( docProjectParticipantRole.DocID );
			docProject.Save();
			
			oRes.action_result = { command: "close_form", msg: i18n.t( 'roluchastnikaso' ), confirm_result: { command: "reload_page" } };
			break;

		default:
			oRes.action_result = { command: "alert", msg: i18n.t( 'neizvestnayakom' ) };
			break;
	}
	
	return oRes;
}

/**
 * @typedef {Object} MyRoleInProjectContext
 * @property {string} sRoles – роль в проекте.
*/
/**
 * @typedef {Object} ReturnMyRoleInProjectContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {MyRoleInProjectContext} context – Контекст.
*/
/**
 * @function GetMyRoleInProjectContext
 * @memberof Websoft.WT.Project
 * @author PL
 * @description Получение роли сотрудника в мероприятии.
 * @param {bigint} iProjectID - ID проекта.
 * @param {bigint} iPersonID - ID сотрудника.
 * @returns {ReturnMyRoleInProjectContext}
*/
function GetMyRoleInProjectContext( iProjectID, iPersonID )
{
	return get_my_role_in_project_context( iProjectID, iPersonID );
}
function get_my_role_in_project_context( iProjectID, iPersonID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {
		"sRoles": ""
	};

	try
	{
		iProjectID = Int( iProjectID );
	}
	catch( ex )
	{
		
		oRes.error = 503; 
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iProjectID' }";
		return oRes;
	}
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		
		oRes.error = 503; 
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}
	
	catProjectParticipant = ArrayOptFirstElem( XQuery( "for $elem in project_participants where $elem/object_id = " + iPersonID + " and $elem/project_id = " + iProjectID + " and ( $elem/status_id = 'active' or $elem/status_id = null() ) return $elem" ) );
	if( catProjectParticipant != undefined && ArrayOptFirstElem( catProjectParticipant.participant_roles_id ) != undefined )
	{
		xarrProjectParticipantRoles = XQuery( "for $elem in project_participant_roles where MatchSome( $elem/id, ( " + ArrayMerge( catProjectParticipant.participant_roles_id, "This", "," ) + " ) ) return $elem" );
		if( ArrayOptFirstElem( xarrProjectParticipantRoles ) != undefined )
		{
			oRes.context.sRoles = ArrayMerge( xarrProjectParticipantRoles, "This.name.Value", ", " );
		}
	}

	return oRes;
}
/**
 * @typedef {Object} ProjectParticipantContext
 * @property {string} sTitleRoles – заголовок ролей.
 * @property {string} sComment – комментарий.
*/
/**
 * @typedef {Object} ReturnProjectParticipantContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {ProjectParticipantContext} context – Контекст участника проекта.
*/
/**
 * @function GetProjectParticipantContext
 * @author PL
 * @memberof Websoft.WT.Project
 * @description Получение контекста участника проекта.
 * @param {bigint} iProjectParticipantID - ID участника проекта.
 * @returns {ReturnProjectParticipantContext}
*/
function GetProjectParticipantContext( iProjectParticipantID )
{
	return get_project_participant_context( iProjectParticipantID );
}
function get_project_participant_context( iProjectParticipantID, teProjectParticipant )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {
		"sTitleRoles": "",
		"sComment": ""
	};

	try
	{
		iProjectParticipantID = Int( iProjectParticipantID );
	}
	catch( ex )
	{
		
		oRes.error = 503; 
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iProjectParticipantID' }";
		return oRes;
	}
	try
	{
		teProjectParticipant.Name;
	}
	catch( ex )
	{
		try
		{
			teProjectParticipant = tools.open_doc( iProjectParticipantID ).TopElem
		}
		catch( err )
		{
			oRes.error = 503; 
			oRes.errorText = "{ text: 'Object not found.', param_name: 'iProjectParticipantID' }";
			return oRes;
		}
	}
	if( ArrayOptFirstElem( teProjectParticipant.participant_roles_id ) != undefined )
	{
		xarrProjectParticipantRoles = XQuery( "for $elem in project_participant_roles where MatchSome( $elem/id, ( " + ArrayMerge( teProjectParticipant.participant_roles_id, "This", "," ) + " ) ) return $elem" );
		if( ArrayOptFirstElem( xarrProjectParticipantRoles ) != undefined )
		{
			oRes.context.sTitleRoles = ArrayCount( xarrProjectParticipantRoles ) == 1 ? i18n.t( 'trebovaniyakrol' ) : i18n.t( 'trebovaniyakrol_1' );
			oRes.context.sTitleRoles += " " + ArrayMerge( xarrProjectParticipantRoles, "This.name.Value", ", " );
		}
		docProjectParticipantRole = tools.open_doc( ArrayOptFirstElem( teProjectParticipant.participant_roles_id ) );
		if( docProjectParticipantRole != undefined )
		{
			oRes.context.sComment = docProjectParticipantRole.TopElem.comment.Value;
		}
	}
	
	return oRes;
}
/**
 * @typedef {Object} PersonProjectContext
 * @property {boolean} bManager – является руководителем проекта.
 * @property {boolean} bParticipant – является участником проекта.
 * @property {boolean} bParticipantByBossType – является участников проекта c переданным типом руководителя.
 * @property {boolean} bProjectParticipantRole – в проекте указаны роли участников.
 * @property {boolean} bAllowAssessment – разрешена оценка участников после завершения проекта.
 * @property {boolean} bTaskExecutor – является ответственным за исполнение задачи.
 * @property {string} sParticipantRole – роль участником проекта.
*/
/**
 * @typedef {Object} ReturnPersonProjectContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {PersonProjectContext} context – Контекст проекта по сотруднику.
*/
/**
 * @function GetPersonProjectContext
 * @memberof Websoft.WT.Project
 * @author PL
 * @description Получение контекста проекта по сотруднику.
 * @param {bigint} iProjectID - ID проекта.
 * @param {bigint} iPersonID - ID сотрудник.
 * @param {bigint} iBossTypeID - ID типа руководителя для вычисления параметра.
 * @returns {ReturnPersonProjectContext}
*/
function GetPersonProjectContext( iProjectID, iPersonID, iBossTypeID )
{
	return get_person_project_context( iProjectID, null, iPersonID, iBossTypeID );
}
function get_person_project_context( iProjectID, teProject, iPersonID, iBossTypeID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {
		"bManager": false,
		"bParticipant": false,
		"bParticipantByBossType": false,
		"bProjectParticipantRole": false,
		"bAllowAssessment": false,
		"bTaskExecutor": false,
		"sParticipantRole": "",
		"bCanCreateTask": false
	};

	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		
		oRes.error = 503; 
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}
	try
	{
		iBossTypeID = OptInt( iBossTypeID );
	}
	catch( ex )
	{
		
		iBossTypeID = undefined;
	}
	try
	{
		iProjectID = Int( iProjectID );
	}
	catch( ex )
	{
		
		oRes.error = 503; 
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iProjectID' }";
		return oRes;
	}
	try
	{
		teProject.Name;
	}
	catch( ex )
	{
		try
		{
			teProject = tools.open_doc( iProjectID ).TopElem
		}
		catch( err )
		{
			oRes.error = 503; 
			oRes.errorText = "{ text: 'Object not found.', param_name: 'iProjectID' }";
			return oRes;
		}
	}
	
	xarrBossTypes = tools.get_object_relative_boss_types( iPersonID, iProjectID );
	xarrOperations = tools.get_relative_operations_by_boss_types( xarrBossTypes );
	oRes.context.bCanCreateTask = ( ArrayOptFind( xarrOperations, "This.action == 'project_task_add_new'" ) != undefined );
	
	xarrPersonProjectParticipants = XQuery( "for $elem in project_participants where $elem/object_id = " + iPersonID + " and $elem/project_id = " + iProjectID + " and ( $elem/status_id = 'active' or $elem/status_id = null() )  return $elem" )
	catProjectManagerBossType = ArrayOptFirstElem( XQuery( "for $elem in boss_types where $elem/code = 'project_manager' return $elem" ) );
	if( catProjectManagerBossType != undefined )
	{
		oRes.context.bManager = ( ArrayOptFind( xarrPersonProjectParticipants, "This.boss_type_id == catProjectManagerBossType.id" ) != undefined );
	}
	oRes.context.bParticipant = ( ArrayOptFirstElem( xarrPersonProjectParticipants ) != undefined );
	
	catProjectParticipant = ArrayOptFind( xarrPersonProjectParticipants, "This.boss_type_id.HasValue" );
	if( catProjectParticipant != undefined )
	{
		catParticipantRole = catProjectParticipant.boss_type_id.OptForeignElem;
		if( catParticipantRole != undefined )
		{
			oRes.context.sParticipantRole = catParticipantRole.name.Value;
		}
	}
	if( iBossTypeID != undefined )
	{
		oRes.context.bParticipantByBossType = ( ArrayOptFind( xarrPersonProjectParticipants, "This.boss_type_id == iBossTypeID" ) != undefined );
	}
	oRes.context.bProjectParticipantRole = ( ArrayOptFirstElem( teProject.participant_roles ) != undefined );
	oRes.context.bAllowAssessment = teProject.allow_assessment.Value;
	oRes.context.bTaskExecutor = ( ArrayOptFirstElem( XQuery( "for $elem in tasks where $elem/source_object_id = " + iProjectID + " and $elem/executor_id = " + iPersonID + " return $elem" ) ) != undefined );
	return oRes;
}

/**
 * @typedef {Object} ProjectsContext
 * @property {number} projects_num – Общее количество проектов.
 * @property {number} active_projects_num – Количество проектов в работе.
 * @property {number} expired_projects_num – Количество просроченных проектов.
 * @property {number} unexpired_projects_num – Количество проектов, выполненных вовремя.
 * @property {number} unexpired_task_percent – Процент задач, выполненных в срок.
 * @property {number} project_participant_num – Количество участников проектов.
*/
/**
 * @typedef {Object} ReturnProjectsContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {ProjectsContext} context – Контекст проекта по сотруднику.
*/
/**
 * @function GetProjectsContext
 * @memberof Websoft.WT.Project
 * @author PL
 * @description Универсальный показатель по проектам.
 * @param {bigint} iPersonID - ID сотрудник.
 * @returns {ReturnProjectsContext}
*/
function GetProjectsContext( iPersonID )
{
	return get_projects_context( iPersonID );
}
function get_projects_context( iPersonID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {
		"projects_num": 0,
		"active_projects_num": 0,
		"expired_projects_num": 0,
		"unexpired_projects_num": 0,
		"unexpired_task_percent": 0,
		"project_participant_num": 0
	};
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		
		oRes.error = 503; 
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}
	catProjectManagerBossType = ArrayOptFirstElem( XQuery( "for $elem in boss_types where $elem/code = 'project_manager' return $elem" ) );
	if( catProjectManagerBossType == undefined )
	{
		return oRes;
	}
	// aSubordinateIDs = tools.get_sub_person_ids_by_func_manager_id( iPersonID );
	var aSubordinateIDs = tools.call_code_library_method( "libMain", "GetTypicalSubordinates", [ iPersonID, null, null, true ] );
	var sMergeSubordinateIDs = ArrayMerge(aSubordinateIDs, "This", ",");
	if( ArrayOptFirstElem( aSubordinateIDs ) != undefined )
	{
		var sReqProjectParticipants = "for $elem_qc in project_participants where MatchSome($elem_qc/object_id, (" + sMergeSubordinateIDs + ")) and $elem_qc/boss_type_id = " + catProjectManagerBossType.id + " and ( $elem_qc/status_id = 'active' or $elem_qc/status_id = null() ) return $elem_qc";
	}
	else
	{
		var sReqProjectParticipants = "for $elem in project_participants where $elem/object_id = " + iPersonID + " and $elem/boss_type_id = " + catProjectManagerBossType.id + " and ( $elem/status_id = 'active' or $elem/status_id = null() ) return $elem";
	}
	var xarrProjectParticipants = tools.xquery(sReqProjectParticipants);
	
	if( ArrayOptFirstElem( xarrProjectParticipants ) == undefined )
	{
		return oRes;
	}
	var xarrProjects = ArrayDirect(XQuery( "for $elem_qc in projects where MatchSome( $elem_qc/id, ( " + ArrayMerge( xarrProjectParticipants, "This.project_id" ) + " ) ) and $elem_qc/status != 'cancel' order by $elem_qc/status return $elem_qc" ));
	if( ArrayOptFirstElem( xarrProjects ) == undefined )
	{
		return oRes;
	}
	oRes.context.projects_num = ArrayCount( xarrProjects );
	oRes.context.active_projects_num = ArrayCount( ArraySelectBySortedKey( xarrProjects, 'active', "status" ) );
	oRes.context.expired_projects_num = ArrayCount( ArraySelect( xarrProjects, "This.end_date_plan.HasValue && ( ( This.end_date_fact.HasValue && This.end_date_fact > This.end_date_plan ) || ( !This.end_date_fact.HasValue && Date() > This.end_date_plan ) )" ) );
	
	var xarrClosedProjects = ArraySelectBySortedKey( xarrProjects, 'close', "status" )
	oRes.context.unexpired_projects_num = ArrayCount( ArraySelect( xarrClosedProjects, "This.end_date_fact.HasValue && This.end_date_fact <= This.end_date_plan" ) );
	
	var xarrTasks = XQuery( "for $elem_qc in tasks where MatchSome( $elem_qc/source_object_id, ( " + ArrayMerge( xarrProjects, "This.id", "," ) + " ) ) and $elem_qc/status = '1' return $elem_qc" );
	if( ArrayOptFirstElem( xarrTasks ) != undefined )
	{
		oRes.context.unexpired_task_percent = ( ArrayCount( ArraySelect( xarrTasks, "!This.end_date_plan.HasValue || ( This.date_fact.HasValue && This.end_date_plan >= This.date_fact )" ) )*100 ) / ArrayCount( xarrTasks );
	}
	oRes.context.project_participant_num = ArrayCount( XQuery( "for $elem in project_participants where MatchSome( $elem/project_id, ( " + ArrayMerge( xarrProjects, "This.id", "," ) + " ) ) and ( $elem/status_id = 'active' or $elem/status_id = null() ) and $elem/catalog = 'collaborator' return $elem" ) );
	
	return oRes;
}
/**
 * @author LP
 * @function EditProjectParticipantKnowledge
 * @memberof Websoft.WT.Project
 * @description Создание/редактирование подтверждения знаний для участника проекта.
 * @param {string} sCommand - Режим выполнения удаленного действия (показ формы/обработка формы).
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {bigint} iProjectParticipantID - ID участника проекта.
 * @param {oArguments} [SCOPE_WVARS] - Переменные УД.
*/
function EditProjectParticipantKnowledge( sCommand, iPersonID, iProjectParticipantID, SCOPE_WVARS )
{
	function set_error( iError, sErrorText, bResult )
	{
		oRes.error = iError;
		oRes.errorText = sErrorText;
		oRes.result = bResult;
	}

	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.action_result = ({});
	
	try
	{
		if( ObjectType( SCOPE_WVARS ) != "JsObject" )
			throw "";
	}
	catch( ex )
	{
		 SCOPE_WVARS = ({});
	}
	try
	{
		iPersonID = Int( iPersonID )
	}
	catch( ex )
	{
		set_error( 1, i18n.t( 'peredannekorre_4' ), false );
		oRes.action_result = { command: "alert", msg: i18n.t( 'peredannekorre_4' ) };
		return oRes;
	}

	try
	{
		iProjectParticipantID = OptInt( iProjectParticipantID );
	}
	catch( ex )
	{
		set_error( 1, i18n.t( 'peredannekorre_7' ), false );
		oRes.action_result = { command: "alert", msg: i18n.t( 'peredannekorre_7' ) };
		return oRes;
	}
	docProjectParticipant = tools.open_doc( iProjectParticipantID );
	if( docProjectParticipant.TopElem.status_id.HasValue && docProjectParticipant.TopElem.status_id != "active" )
	{
		set_error( 1, i18n.t( 'nelzyaocenivatu' ), false );
		oRes.action_result = { command: "alert", msg: i18n.t( 'nelzyaocenivatu' ) };
		return oRes;
	}
	
	var bAccess = false;
	catProject = docProjectParticipant.TopElem.project_id.OptForeignElem;
	if( catProject == undefined )
	{
		set_error( 1, i18n.t( 'neukazanproekt' ), false );
		oRes.action_result = { command: "alert", msg: i18n.t( 'neukazanproekt' ) };
		return oRes;
	}

	if( !bAccess )
	{
		catProjectManagerBossType = ArrayOptFirstElem( XQuery( "for $elem in boss_types where $elem/code = 'project_manager' return $elem" ) );
		if( catProjectManagerBossType != undefined && ( catProject.status == "active" || ( catProject.allow_assessment && catProject.status == "close" ) ) )
		{
			if( ArrayOptFirstElem( XQuery( "for $elem in project_participants where $elem/object_id = " + iPersonID + " and $elem/project_id = " + docProjectParticipant.TopElem.project_id + " and $elem/boss_type_id = " + catProjectManagerBossType.id + " and ( $elem/status_id = 'active' or $elem/status_id = null() ) return $elem" ) ) != undefined )
			{
				bAccess = true;
			}
		}
	}
	
	if( !bAccess )
	{
		set_error( 1, i18n.t( 'uvasnetpravnao' ), false );
		oRes.action_result = { command: "alert", msg: i18n.t( 'uvasnetpravnao' ) };
		return oRes;
	}
	
	arrKnowledges = get_project_participant_knowledges( iProjectParticipantID, docProjectParticipant.TopElem );
	
	switch( sCommand )
	{
		case "eval":
			oRes.action_result = { 	command: "display_form",
						title: ( i18n.t( 'ocenkauchastnik' ) + docProjectParticipant.TopElem.object_name ),
						header: ( i18n.t( 'ocenkauchastnik' ) + docProjectParticipant.TopElem.object_name ),
						form_fields: [],					
					};
			oRes.action_result.form_fields.push( { name: "form_title", type: "paragraph", value: i18n.t( 'proekt' ) + " : " + catProject.name } );
			oRes.action_result.form_fields.push( { name: "skills_title", type: "paragraph", value: i18n.t( 'navykiuchastnika' ) } );
			
			for( _kp in arrKnowledges )
			{
				oRes.action_result.form_fields.push( { name: "skills_" + _kp.knowledge_part_id, type: "paragraph", value: RValue( _kp.knowledge_part_name ) } );
				field = { name: "current_level_id_" + _kp.knowledge_part_id, label: i18n.t( 'uroven' ), type: "select", value: "", entries: [] };
				field.entries.push( { name: i18n.t( 'neoceneno' ), value: "___no_assessment___" } );
				for( _level in _kp.levels )
				{
					field.entries.push( { name: RValue( _level.title ), value: RValue( _level.value ) } );
				}
				oRes.action_result.form_fields.push( field );
				oRes.action_result.form_fields.push( { name: "comment_" + _kp.knowledge_part_id, label: i18n.t( 'kommentariy' ), type: "string", value: "" } );
			}
			
			break;
		case "submit_form":
			oFormFields = null;
			var form_fields = SCOPE_WVARS.GetOptProperty( "form_fields", "" )
			if ( form_fields != "" )
				oFormFields = ParseJson( form_fields );
			for( _kp in arrKnowledges )
			{
				
				conds = new Array();
				conds.push( "$elem/person_id = " + docProjectParticipant.TopElem.object_id );
				conds.push( "$elem/knowledge_part_id = " + _kp.knowledge_part_id );
				conds.push( "$elem/project_participant_id = " + docProjectParticipant.DocID );
				conds.push( "$elem/state_id = 'active'" );
				conds.push( "$elem/confirmation_type = 'project_mark'" );
				catKnowledgeAcquaint = ArrayOptFirstElem( XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( conds, "This", " and " ) + " return $elem" ) );
				catLevel = ArrayOptFind( oFormFields, "This.name == ( 'current_level_id_' + _kp.knowledge_part_id )" );
				if( catLevel == undefined || catLevel.value == "" || catLevel.value == "___no_assessment___" )
				{
					if( catKnowledgeAcquaint != undefined )
					{
						DeleteDoc( UrlFromDocID( catKnowledgeAcquaint.id ) );
					}
					continue;
				}
				if( catKnowledgeAcquaint != undefined )
				{
					docKnowledgeAcquaint = tools.open_doc( catKnowledgeAcquaint.id );
					if( docKnowledgeAcquaint == undefined )
					{
						continue;
					}
				}
				else
				{
					docKnowledgeAcquaint = OpenNewDoc('x-local://wtv/wtv_knowledge_acquaint.xmd');
					docKnowledgeAcquaint.BindToDb();
					docKnowledgeAcquaint.TopElem.knowledge_part_id = _kp.knowledge_part_id;
					docKnowledgeAcquaint.TopElem.knowledge_part_name = _kp.knowledge_part_name;
					docKnowledgeAcquaint.TopElem.state_id = "active";
					docKnowledgeAcquaint.TopElem.confirmation_type = "project_mark";
					docKnowledgeAcquaint.TopElem.project_participant_id = docProjectParticipant.DocID;
					docKnowledgeAcquaint.TopElem.person_id = docProjectParticipant.TopElem.object_id;
					tools.common_filling( 'collaborator', docKnowledgeAcquaint.TopElem, docProjectParticipant.TopElem.object_id );
				}
				if( catLevel != undefined )
				{
					docKnowledgeAcquaint.TopElem.level_id = catLevel.value;
					docKnowledgeAcquaint.TopElem.level_index = catLevel.ChildIndex;
					docKnowledgeAcquaint.TopElem.level_name = ArrayOptFind( _kp.levels, "This.value == catLevel.value" ).title;
				}
				docKnowledgeAcquaint.TopElem.confirmation_date = Date();
				catComment = ArrayOptFind( oFormFields, "This.name == ( 'comment_' + _kp.knowledge_part_id )" );
				if( catComment != undefined )
				{
					docKnowledgeAcquaint.TopElem.comment = catComment.value;
				}
				docKnowledgeAcquaint.Save()
			}
			
			oRes.action_result = { command: "close_form", msg: i18n.t( 'ocenkiuchastnik' ), confirm_result: { command: "reload_page" } };
			break;

		default:
			oRes.action_result = { command: "alert", msg: i18n.t( 'neizvestnayakom' ) };
			break;
	}
	
	return oRes;
}

function CreateUpdateProjectTask( sCommand, iPersonID, iProjectID, iTaskID, SCOPE_WVARS )
{
	function set_error( iError, sErrorText, bResult )
	{
		oRes.error = iError;
		oRes.errorText = sErrorText;
		oRes.result = bResult;
	}

	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.action_result = ({});
	
	try
	{
		if( ObjectType( SCOPE_WVARS ) != "JsObject" )
			throw "";
	}
	catch( ex )
	{
		 SCOPE_WVARS = ({});
	}
	try
	{
		iPersonID = Int( iPersonID )
	}
	catch( ex )
	{
		set_error( 1, i18n.t( 'peredannekorre_4' ), false );
		oRes.action_result = { command: "alert", msg: i18n.t( 'peredannekorre_4' ) };
		return oRes;
	}
	try
	{
		iProjectID = Int( iProjectID )
	}
	catch( ex )
	{
		set_error( 1, i18n.t( 'peredannekorre_5' ), false );
		oRes.action_result = { command: "alert", msg: i18n.t( 'peredannekorre_5' ) };
		return oRes;
	}
	try
	{
		iTaskID = OptInt( iTaskID );
	}
	catch( ex )
	{
		iTaskID = undefined;
	}
	function check_disabled( field_name )
	{
		switch( field_name )
		{
			case "name":
			case "status":
			case "plan_labor_costs":
			case "fact_labor_costs":
				return ArrayOptFind( xarrOperations, "This.action == 'project_task_edit_" + field_name + "'" ) == undefined;
			case "plan":
				return ArrayOptFind( xarrOperations, "This.action == 'project_task_edit_desc'" ) == undefined;
			case "fact":
				return false
			case "end_date_plan":
				return ArrayOptFind( xarrOperations, "This.action == 'project_task_edit_end_date_plan'" ) == undefined;
			case "date_plan":
				return ArrayOptFind( xarrOperations, "This.action == 'project_task_edit_start_date_plan'" ) == undefined;
			case "date_fact":
				return ArrayOptFind( xarrOperations, "This.action == 'project_task_edit_date_plan'" ) == undefined;
				
			case "end_date_fact":
				return ArrayOptFind( xarrOperations, "This.action == 'project_task_edit_date_fact'" ) == undefined;
			case "executor_id":
				return ArrayOptFind( xarrOperations, "This.action == 'project_task_edit_executor'" ) == undefined;
			case "value":
				return ArrayOptFind( xarrOperations, "This.action == 'project_task_edit_mark'" ) == undefined;
		}
		return true;
	}
	function add_field( field_name )
	{
		switch( field_name )
		{
			case "source_object_id":
				oRes.action_result.form_fields.push( { name: field_name, label: i18n.t( 'proekt' ), type: "foreign_elem", catalog: "project", value: iProjectID, display_value: docProject.TopElem.name.Value, mandatory: true, disabled: true } );
				break;
			case "name":
				oRes.action_result.form_fields.push( { name: field_name, label: i18n.t( 'nazvanie' ), type: "string", value: ( docTask != null ? docTask.TopElem.name.Value : "" ), mandatory: true, disabled: check_disabled( field_name ) } );
				break;
			case "plan":
				oRes.action_result.form_fields.push( { name: field_name, label: i18n.t( 'opisanie' ), type: "text", value: ( docTask != null ? docTask.TopElem.plan.Value : "" ), mandatory: true, disabled: check_disabled( field_name ) } );
				break;
			case "fact":
				oRes.action_result.form_fields.push( { name: field_name, label: i18n.t( 'reshenie' ), type: "text", value: ( docTask != null ? docTask.TopElem.fact.Value : "" ), mandatory: false, disabled: check_disabled( field_name ) } );
				break;
			case "date_plan":
				oRes.action_result.form_fields.push( { name: field_name, label: i18n.t( 'planovayadatana' ), type: "date", value: ( docTask != null ? docTask.TopElem.date_plan.Value : "" ), mandatory: false, disabled: check_disabled( field_name ) } );
				break;
			case "end_date_plan":
				oRes.action_result.form_fields.push( { name: field_name, label: i18n.t( 'planovayadataza' ), type: "date", value: ( docTask != null ? docTask.TopElem.end_date_plan.Value : "" ), mandatory: false, disabled: check_disabled( field_name ) } );
				break;
			case "executor_id":
				field = { name: field_name, label: i18n.t( 'ispolnitel' ), type: "select", value: ( docTask != null ? docTask.TopElem.executor_id.Value : "" ), entries: [], disabled: check_disabled( field_name ) };
				xarrProjectParticipants = XQuery( "for $elem in project_participants where $elem/project_id = " + iProjectID + " and ( $elem/status_id = 'active' or $elem/status_id = null() )  return $elem" );
				if( ArrayOptFirstElem( xarrProjectParticipants ) != undefined )
				{
					xarrCollaborators = XQuery( "for $elem_qc in collaborators where MatchSome( $elem_qc/id, ( " + ArrayMerge( xarrProjectParticipants, "This.object_id" ) + " ) ) return $elem_qc" );
					for( _coll in xarrCollaborators )
					{
						field.entries.push( { name: RValue( _coll.fullname ), value: RValue( _coll.id ) } );
					}
				}

				oRes.action_result.form_fields.push( field );
				break;
			case "plan_labor_costs":
				oRes.action_result.form_fields.push( { name: field_name, label: i18n.t( 'planovyetrudoz' ), type: "integer", value: ( docTask != null ? docTask.TopElem.plan_labor_costs.Value : "" ), mandatory: false, disabled: check_disabled( field_name ) } );
				break;
			case "status":
				field = { name: field_name, label: i18n.t( 'status' ), type: "select", value: ( docTask != null ? docTask.TopElem.status.Value : "" ), entries: [], disabled: check_disabled( field_name ) };
				for( _state in common.task_statuses )
				{
					field.entries.push( { name: RValue( _state.name ), value: RValue( _state.id ) } );
				}

				oRes.action_result.form_fields.push( field );
				break;
			case "date_fact":
				oRes.action_result.form_fields.push( { name: field_name, label: i18n.t( 'fakticheskayadat' ), type: "date", value: ( docTask != null ? docTask.TopElem.date_fact.Value : "" ), mandatory: false, disabled: check_disabled( field_name ) } );
				break;
			case "end_date_fact":
				oRes.action_result.form_fields.push( { name: field_name, label: i18n.t( 'fakticheskayadat_1' ), type: "date", value: ( docTask != null ? docTask.TopElem.end_date_fact.Value : "" ), mandatory: false, disabled: check_disabled( field_name ) } );
				break;
			case "fact_labor_costs":
				oRes.action_result.form_fields.push( { name: field_name, label: i18n.t( 'fakticheskietru' ), type: "integer", value: ( docTask != null ? docTask.TopElem.fact_labor_costs.Value : "" ), mandatory: false, disabled: check_disabled( field_name ) } );
				break;
			case "value":
				oRes.action_result.form_fields.push( { name: field_name, label: i18n.t( 'ocenka' ), type: "integer", value: ( docTask != null ? docTask.TopElem.value.Value : "" ), mandatory: false, disabled: check_disabled( field_name ) } );
				break;
		}
	}
	
	var docProject = tools.open_doc( iProjectID )
	xarrBossTypes = tools.get_object_relative_boss_types( iPersonID, iProjectID );
	xarrOperations = tools.get_relative_operations_by_boss_types( xarrBossTypes );
	if( iTaskID == undefined && ArrayOptFind( xarrOperations, "This.action == 'project_task_add_new'" ) == undefined )
	{
		set_error( 1, i18n.t( 'usotrudnikanet_1' ), false );
		oRes.action_result = { command: "alert", msg: i18n.t( 'usotrudnikanet_1' ) };
		return oRes;
	}
	
	docTask = null;
	if( iTaskID != undefined )
	{
		docTask = tools.open_doc( iTaskID );
		if( docTask == undefined )
		{
			set_error( 1, i18n.t( 'peredannekorre_3' ), false );
			oRes.action_result = { command: "alert", msg: i18n.t( 'peredannekorre_3' ) };
			return oRes;
		}
	}
	arrFields = [ "source_object_id", "name", "plan", "date_plan", "end_date_plan", "executor_id", "plan_labor_costs", "status", "date_fact", "end_date_fact", "fact_labor_costs", "fact", "value", "files" ];
	switch( sCommand )
	{
		case "eval":
			oRes.action_result = { 	command: "display_form",
						title: ( iTaskID == undefined ? i18n.t( 'novayazadacha' ) : i18n.t( 'redaktirovanie_2' ) ),
						header: ( iTaskID == undefined ? i18n.t( 'novayazadacha' ) : i18n.t( 'redaktirovanie_2' ) ),
						form_fields: [],				
					};
			for( _field in arrFields )
			{
				add_field( _field );
			}
			break;
		case "submit_form":
			oFormFields = null;
			var form_fields = SCOPE_WVARS.GetOptProperty( "form_fields", "" )
			if ( form_fields != "" )
				oFormFields = ParseJson( form_fields );
			
			if( iProjectParticipantRoleID == undefined )
			{
				docProjectParticipantRole = OpenNewDoc( 'x-local://wtv/wtv_project_participant_role.xmd' );
				docProjectParticipantRole.TopElem.project_id = iProjectID;
			}
			
			
			sSubmitType = ArrayOptFind( oFormFields, "This.name == '__submit_type__'" );
			sSubmitType = sSubmitType != undefined ? sSubmitType.value : "";
			for( _field in oFormFields )
			{

				if( docProjectParticipantRole.TopElem.ChildExists( _field.name ) )
				{
					docProjectParticipantRole.TopElem.EvalPath( _field.name ).Value = _field.value;
				}
				else if( _field.name == "knowledge_parts_value" )
				{
					arrKnowledgeParts = String( _field.value ).split( ";" );
					arrKnowledgeParts = ArrayExtract( arrKnowledgeParts, "OptInt( This )" );  
					docProjectParticipantRole.TopElem.knowledge_parts.DeleteChildren( "!StrContains( String( _field.value ), String( This.PrimaryKey.Value ) )" );

					for ( _value in arrKnowledgeParts )
					{
						if( docProjectParticipantRole.TopElem.knowledge_parts.ChildByKeyExists( _value ) )
						{
							continue;
						}
						docKnowledgePart = tools.open_doc( _value );
						if( docKnowledgePart == undefined )
						{
							continue;
						}
						_kp = docProjectParticipantRole.TopElem.knowledge_parts.ObtainChildByKey( _value );
						_kp.knowledge_part_name = docKnowledgePart.TopElem.name;
						_kp.require_acknowledgement = docKnowledgePart.TopElem.require_acknowledgement;
						_kp.full_path = tools.knowledge_part_path_by_knowledge_part_id( _value );
					}
				}

			}
			for( _field in oFormFields )
			{

				if( StrContains( _field.name, "edit_knowledge_" ) )
				{
					arr = String( _field.name ).split( "_" )
					iKnowledgePartID = OptInt( arr[ 2 ] );
					if( iKnowledgePartID != undefined )
					{
						_kp = docProjectParticipantRole.TopElem.knowledge_parts.GetOptChildByKey( iKnowledgePartID );
						if( _kp != undefined )
						{
							docKnowledgePart = tools.open_doc( iKnowledgePartID );
							if( docKnowledgePart == undefined )
							{
								continue;
							}
							_kp.target_level_id = _field.value;
							_kp.target_level_name = docKnowledgePart.TopElem.levels.ObtainChildByKey( _field.value ).name;
						}
					}
				}
			}
			
			if( sSubmitType == "edit_knowledge" )
			{
				oRes.action_result = { 	command: "display_form",
						title: i18n.t( 'redaktirovanie_1' ) ,
						header: i18n.t( 'redaktirovanie_1' ),
						form_fields: [],					
					};
				oRes.action_result.form_fields.push( { name: "name", label: i18n.t( 'nazvanie' ), type: "hidden", value: docProjectParticipantRole.TopElem.name.Value, mandatory: true } );
				oRes.action_result.form_fields.push( { name: "participant_num", label: i18n.t( 'kolichestvouchas' ), type: "hidden", value: docProjectParticipantRole.TopElem.participant_num.Value , mandatory: false } );
				oRes.action_result.form_fields.push( { name: "knowledge_parts_value", label: i18n.t( 'trebuemyeznaniya' ), type: "hidden", value: ArrayMerge( docProjectParticipantRole.TopElem.knowledge_parts, "This.knowledge_part_id.Value", ";" ), mandatory: true } );
				oRes.action_result.form_fields.push( { name: "comment", label: i18n.t( 'kommentariy' ), type: "hidden", value: docProjectParticipantRole.TopElem.comment.Value, mandatory: true } );
				
				for( _kp in docProjectParticipantRole.TopElem.knowledge_parts )
				{
					docKnowledgePart = tools.open_doc( _kp.PrimaryKey );
					if( docKnowledgePart == undefined )
					{
						continue;
					}
					obj = { name: "edit_knowledge_" + _kp.PrimaryKey, label: _kp.knowledge_part_name.Value, type: "select", value: _kp.target_level_id.Value, display_value: _kp.target_level_name.Value, mandatory: false, entries: [] };
					for( _entr in docKnowledgePart.TopElem.levels )
						obj.entries.push( { name: _entr.name.Value, value: _entr.id.Value } );
					oRes.action_result.form_fields.push( obj );
				}
				return oRes;
			}
			if( iProjectParticipantRoleID == undefined )
			{
				docProjectParticipantRole.BindToDb();
			}
			docProjectParticipantRole.Save()
			docProject = tools.open_doc( iProjectID );
			docProject.TopElem.participant_roles.ObtainChildByKey( docProjectParticipantRole.DocID );
			docProject.Save();
			
			oRes.action_result = { command: "close_form", msg: i18n.t( 'roluchastnikaso' ), confirm_result: { command: "reload_page" } };
			break;

		default:
			oRes.action_result = { command: "alert", msg: i18n.t( 'neizvestnayakom' ) };
			break;
	}
	
	return oRes;
}

/**
 * @typedef {Object} oKnowledgeAcquaint
 * @property {bigint} id
 * @property {string} knowledge_part_name
 * @property {string} current_level_name
 * @property {string} target_level_name
*/
/**
 * @typedef {Object} WTProjectParticipantKnowledgeAcquaintsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {oKnowledgeAcquaint[]} array – Массив ответственных.
*/
/**
 * @function GetProjectParticipantKnowledgeAcquaints
 * @memberof Websoft.WT.Project
 * @author PL
 * @description Список подтверждения знаний участника проекта.
 * @param {bigint} iProjectParticipantID - ID участника проекта
 * @returns {WTProjectParticipantKnowledgeAcquaintsResult}
 */
function GetProjectParticipantKnowledgeAcquaints( iProjectParticipantID )
{
	return get_project_participant_knowledge_acquaints( iProjectParticipantID );
}

function get_project_participant_knowledge_acquaints( iProjectParticipantID, teProjectParticipant )
{
	/*
		Список подтверждения знаний участника проекта.
		iProjectParticipantID 	- ID участника проекта
		teProjectParticipant	- TopElem участника проекта
	*/
	function set_error( iError, sErrorText, bResult )
	{
		oRes.error = iError;
		oRes.errorText = sErrorText;
		oRes.result = bResult;
	}
	
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];
	try
	{
		iProjectParticipantID = Int( iProjectParticipantID );
	}
	catch( ex )
	{
		set_error( 1, i18n.t( 'peredannekorre_7' ), false )
		return oRes;
	}

	try
	{
		teProjectParticipant.Name;
	}
	catch( ex )
	{
		try
		{
			teProjectParticipant = OpenDoc( UrlFromDocID( iProjectParticipantID ) ).TopElem;
		}
		catch( ex )
		{
			set_error( 1, i18n.t( 'peredannekorre_7' ), false )
			return oRes;
		}
	}
	arrKnowledges = get_project_participant_knowledges( iProjectParticipantID, teProjectParticipant );
	if( ArrayOptFirstElem( arrKnowledges ) == undefined )
	{
		return oRes;
	}
	conds = new Array();
	conds.push( "$elem/person_id = " + teProjectParticipant.object_id );
	conds.push( "MatchSome( $elem/knowledge_part_id, ( " + ArrayMerge( arrKnowledges, "This.knowledge_part_id", "," ) + " ) )" );
	conds.push( "$elem/project_participant_id = " + iProjectParticipantID );
	conds.push( "$elem/state_id = 'active'" );
	conds.push( "$elem/confirmation_type = 'project_mark'" );
	var xarrKnowledgeAcquaints = XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( conds, "This", " and " ) + " return $elem" );
	for( _knowledge in arrKnowledges )
	{
		oKnowledge = new Object();
		oKnowledge.id = _knowledge.knowledge_part_id;
		oKnowledge.knowledge_part_name = _knowledge.knowledge_part_name;
		oKnowledge.target_level_name = _knowledge.target_level_name;
		catKnowledge = ArrayOptFind( xarrKnowledgeAcquaints, "This.knowledge_part_id == _knowledge.knowledge_part_id" );
		oKnowledge.current_level_name = "";
		if( catKnowledge != undefined && catKnowledge.level_id.HasValue )
		{
			catLevel = ArrayOptFind( _knowledge.levels, "This.value == catKnowledge.level_id" );
			if( catLevel != undefined )
			{
				oKnowledge.current_level_name = catLevel.title;
			}
		}
		
		oRes.array.push( oKnowledge );
	}
	
	return oRes;
}

function get_project_participant_knowledges( iProjectParticipantID, teProjectParticipant )
{
	try
	{
		iProjectParticipantID = Int( iProjectParticipantID );
	}
	catch( ex )
	{
		set_error( 1, i18n.t( 'peredannekorre_7' ), false )
		return oRes;
	}

	try
	{
		teProjectParticipant.Name;
	}
	catch( ex )
	{
		try
		{
			teProjectParticipant = OpenDoc( UrlFromDocID( iProjectParticipantID ) ).TopElem;
		}
		catch( ex )
		{
			set_error( 1, i18n.t( 'peredannekorre_7' ), false )
			return oRes;
		}
	}
	arrKnowledges = new Array();
	if( ArrayOptFirstElem( teProjectParticipant.participant_roles_id ) != undefined )
	{
		
		for( _pr in teProjectParticipant.participant_roles_id )
		{
			docParticipantRole = tools.open_doc( _pr );
			if( docParticipantRole == undefined )
			{
				continue;
			}
			for( _kp in docParticipantRole.TopElem.knowledge_parts )
			{
				if( ArrayOptFind( arrKnowledges, "This.knowledge_part_id == _kp.PrimaryKey" ) != undefined )
				{
					continue;
				}
				docKnowledgePart = tools.open_doc( _kp.PrimaryKey );
				if( docKnowledgePart == undefined )
				{
					continue;
				}
				oKP = new Object();
				oKP.knowledge_part_id = RValue( _kp.PrimaryKey );
				oKP.target_level_id = RValue( _kp.target_level_id );
				oKP.target_level_name = RValue( _kp.target_level_name );
				oKP.knowledge_part_name = docKnowledgePart.TopElem.name.Value;
				oKP.levels = new Array();
				for( _level in docKnowledgePart.TopElem.levels )
				{
					oLevel = new Object();
					oLevel.value = RValue( _level.id );
					oLevel.title = RValue( _level.name );
					oKP.levels.push( oLevel );
				}
				arrKnowledges.push( oKP );
			}
		}
	}
	return arrKnowledges;
}

/**
 * @typedef {Object} oWorkflowProjectParicipant
 * @property {bigint} id
 * @property {bigint} person_id
 * @property {string} person_fullname
 * @property {string} person_link
 * @property {string} person_image
 * @property {string} person_position_parent_name
 * @property {string} person_position_name
 * @property {string} participant_roles
 * @property {bool} is_candidate
 * @property {string} project_name
 * @property {bigint} project_id
 * @property {string} status_id
 * @property {string} status_name
 * @property {string} workflow_state
 * @property {string} workflow_state_name
*/
/**
 * @typedef {Object} ReturnPersonWorkflowProjectParicipants
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oWorkflowProjectParicipant[]} array – Массив участников проекта на согласовании.
*/
/**
 * @function GetPersonWorkflowProjectParicipantsEnv
 * @memberof Websoft.WT.Project
 * @description Получение списка участников проекта по документообороту.
 * @param {bigint[]} [aProjectIds] - Массив ID проектов.
 * @param {string[]} [aStatusID] - Массив статусов интервала.
 * @param {oPaging} oPaging - Информация из рантайма о пейджинге
 * @returns {ReturnPersonWorkflowProjectParicipants}
*/

function GetPersonWorkflowProjectParicipantsEnv( aProjectIds, aStatusID, oPaging )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	var Env = CurRequest.Session.GetOptProperty( "Env", null );
	if ( Env == null )
	{
		oRes.error = 502; // Invalid environment
		oRes.errorText = "{ text: 'Invalid environment Env.', param_name: 'Env' }";
		return oRes;
	}
	try
	{
		if( !IsArray( aProjectIds ) )
			throw "error";
	}
	catch( ex )
	{
		aProjectIds = [];
	}
	try
	{
		if( !IsArray( aStatusID ) )
			throw "error";
	}
	catch( ex )
	{
		aStatusID = [ "agreement" ];
	}

	var oLngEnv = tools_web.get_cur_lng_obj( Env );
	var curLng = oLngEnv.GetOptProperty( "curLng", null );
	
	conds = new Array();
	if( ArrayOptFirstElem( aProjectIds ) != undefined )
	{
		conds.push( "MatchSome( $elem/project_id, (" + ArrayMerge( aProjectIds, "This", "," ) + ") )" );
	}
	if( ArrayOptFirstElem( aStatusID ) != undefined )
	{
		conds.push( "MatchSome( $elem/status_id, (" + ArrayMerge( aStatusID, "XQueryLiteral( String( This ) )", "," ) + ") )" );
	}

	function get_status_name( status_id )
	{
		if( !status_id.HasValue )
		{
			return "";
		}
		catState = ArrayOptFind( xarrStatus, "This.id == status_id" );
		if( catState == undefined )
		{
			feStatus = status_id.OptForeignElem;
			catState = new Object();
			catState.id = status_id.Value;
			if( feStatus != undefined )
			{
				catState.name = feStatus.name.Value;
			}
			else
			{
				catState.name = "";
			}
			xarrStatus.push( catState );
		}
		return catState.name;
	}
	
	var xarrStatus = new Array();
	
	var oParams = new Object;
	if ( ArrayOptFirstElem( conds ) != undefined )
	{
		oParams.xquery_qual = ArrayMerge( conds, "This", " and " );
	}
	if( ObjectType( oPaging ) == 'JsObject' && oPaging.SIZE != null )
	{
		oPaging.MANUAL = true;
		oParams.SetProperty( "paging_index", OptInt( oPaging.INDEX, 0 ) );
		oParams.SetProperty( "paging_size", oPaging.SIZE );
	}
	var oExtRes = tools_web.external_eval( "workflow_condition_project_participants", oParams, Env );
	if( ArrayOptFirstElem( oExtRes.array ) == undefined )
	{
		return oRes;
	}
	arrProjectParticipantRoleIds = new Array();
	for ( catProjectParticipantElem in oExtRes.array )
	{
		arrProjectParticipantRoleIds = ArrayUnion( arrProjectParticipantRoleIds, catProjectParticipantElem.participant_roles_id );
	}
	var arrProjectParticipantRoles = new Array();
	if( ArrayOptFirstElem( arrProjectParticipantRoleIds ) != undefined )
	{
		arrProjectParticipantRoles = XQuery( "for $elem in project_participant_roles where MatchSome( $elem/id, ( " + ArrayMerge( ArraySelectDistinct( arrProjectParticipantRoleIds, "This" ), "This", "," ) + " ) ) return $elem" );
	}
	
	xarrProjects = XQuery( "for $elem in projects where MatchSome( $elem/id, ( " + ArrayMerge( ArraySelectDistinct( oExtRes.array, "This.project_id" ), "This.project_id", "," ) + " ) ) return $elem" );

	for ( catProjectParticipantElem in oExtRes.array )
	{
 
		catProject = ArrayOptFindByKey( xarrProjects, catProjectParticipantElem.project_id, "id" );
		if( catProject == undefined )
		{
			continue;
		}
		
		arrProjectParticipantRoleNames = new Array();
		for( _ppr in catProjectParticipantElem.participant_roles_id )
		{
			catPPR = ArrayOptFindByKey( xarrProjects, _ppr, "id" );
			if( catPPR != undefined )
			{
				arrProjectParticipantRoleNames.push( catPPR.name.Value );
			}
		}
		oRes.array.push({
			"id": catProjectParticipantElem.id.Value,
			"person_id": catProjectParticipantElem.object_id.Value,
			"person_fullname": catProjectParticipantElem.object_name.Value,
			"person_image": tools_web.get_object_source_url( 'person', catProjectParticipantElem.object_id ),
			"person_link": tools_web.get_mode_clean_url( null, catProjectParticipantElem.object_id ),
			"person_position_parent_name": catProjectParticipantElem.person_subdivision_name.Value,
			"person_position_name": catProjectParticipantElem.person_position_name.Value,
			"participant_roles": ArrayMerge( arrProjectParticipantRoleNames, "This", ", " ),
			"is_candidate": ( catProjectParticipantElem.status_id == "agreement" ),
			"project_id": catProject.id.Value,
			"project_name": catProject.name.Value,
			"status_id": catProjectParticipantElem.status_id.Value,
			"status_name": get_status_name( catProjectParticipantElem.status_id ),
			"workflow_state": catProjectParticipantElem.workflow_state.Value,
			"workflow_state_name": catProjectParticipantElem.workflow_state_name.Value
		});
	}
	if( ObjectType(oPaging) == 'JsObject' && oPaging.SIZE != null )
	{
		oPaging.TOTAL = oExtRes.total;
	}
	return oRes;
}