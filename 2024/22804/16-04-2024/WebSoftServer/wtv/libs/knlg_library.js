function alerd( sText, bDebug )
{
	/*
			запись сообщения в лог
			sText		- сообщение
			bDebug		- писать или нет сообщение
	*/
	sLogName = "knowledge_lib";
	EnableLog(sLogName);

	try
	{
		if( bDebug == undefined || bDebug == null )
			throw "error";
		bDebug = tools_web.is_true( bDebug );
	}
	catch( ex )
	{
		bDebug = global_settings.debug;
	}
	if( bDebug )
		LogEvent(sLogName, sText )
}

function get_object_image_url( catElem )
{
	switch( catElem.Name )
	{
		case "collaborator":
			return tools_web.get_object_source_url( 'person', catElem.id );
		case "expert":
			if( catElem.type == "collaborator" )
				return tools_web.get_object_source_url( 'person', catElem.person_id );
		default:
		{
			if( catElem.ChildExists( "resource_id" ) && catElem.resource_id.HasValue )
			{
				return tools_web.get_object_source_url( 'resource', catElem.resource_id );
			}
		}

	}

	return "/images/" + catElem.Name + ".png";
}


/**
 * @namespace Websoft.WT.Knowledge
*/

// Переопределение типов
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
 * @typedef {Object} object
*/
/**
 * @typedef {Object} XmDoc
*/
/**
 * @typedef {Object} XmElem
*/
/**
 * @typedef {Object} WTScopeWvars
*/

// Общие типы
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
 * @property {string} value 
*/
/**
 * @typedef {Object} oCollectionParam
 * @property {?bigint} personID
 * @property {?oPaging} paging
 * @property {?oSort} sort 
 * @property {?string[]} distincts 
 * @property {?oSimpleFilterElem[]} filters 
 * @property {?string} fulltext
 * @property {?bigint} management_object_ids
*/

/**
 * @typedef {Object} oSimpleEntrisElem
 * @property {string} parent
 * @property {string} value 
*/
/**
 * @typedef {Object} oSimpleElem
 * @property {string} name
 * @property {string} value 
*/
/**
 * @typedef {Object} FormField
 * @property {string} name  
 * @property {string} label 
 * @property {string} type 
 * @property {string} value 
 * @property {?oSimpleEntrisElem[]} entries 
 * @property {?string} validation  
 * @property {boolean} mandatory 
 * @property {?string} css_class
 * @property {?string} error_message 
 * @property {integer} column 
 * @property {?oSimpleElem[]} visibility  
*/
/**
 * @typedef {Object} FormButton
 * @property {string} name
 * @property {string} label 
 * @property {string} type 
*/
/**
 * @typedef {Object} WTLPEForm
 * @property {string} command 
 * @property {string} title
 * @property {?string} message
 * @property {?string} css_class
 * @property {?FormField[]} form_fields
 * @property {FormButton[]} buttons
 * @property {boolean} no_buttons
*/
/**
 * @typedef {Object} WTLPEFormResult
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {WTLPEForm} result – результат
*/
/**
 * @typedef {Object} WTLPECountResult
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {number} count – Счетчик
*/
/**
 * @typedef {Object} WTLPETextResult
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {string} paragraph – Текст
*/

/**
 * @typedef {Object} WTLPEFormResult
 * @property {int} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {WTLPEForm} action_result – результат

/**
 * @typedef {Object} WTKnowledgeResult
 * @property {number} error – код ошибки
 * @property {string} message – текст ошибки
*/
/**
 * @function UpdateAcquaintAssign
 * @memberof Websoft.WT.Knowledge
 * @description Обновление списка назначенных ознакомлений.
 * @param {bigint} iAcquaintId - ID ознакомления
 * @param {boolean} [bDel=false] - удалять назначенные уведомления не попадающие в выборку
 * @param {boolean} [bDebug=false] - дополнительное логирование
 * @returns {number} iCounter - количество назначений
*/
function UpdateAcquaintAssign( iAcquaintId, bDel, bDebug )
{
	return update_acquaint_assign( iAcquaintId, null, bDel, bDebug );
}

function update_acquaint_assign( iAcquaintId, teAcquaint, bDel, bDebug )
{
	/*
		обновление списка назначенных ознакомлений
		iAcquaintId	- ID ознакомления
		teAcquaint	- TopElem ознакомления
		bDel		- удалять назначенные уведомления не попадающие в выборку
		bDebug		- дополнительное логирование
	*/

	iAcquaintId = OptInt( iAcquaintId );
	try
	{
		teAcquaint.Name;
	}
	catch ( err )
	{
		teAcquaint = OpenDoc( UrlFromDocID( iAcquaintId ) ).TopElem;
	}
	try
	{
		if( bDel == undefined || bDel == null )
			throw "error";
		bDel = tools_web.is_true( bDel )
	}
	catch ( err )
	{
		bDel = true;
	}
	try
	{
		if( bDebug == undefined || bDebug == null )
			throw "error";
		bDebug = tools_web.is_true( bDebug );
	}
	catch ( err )
	{
		bDebug = false;
	}

	arrCollabs = new Array();
	for( st in teAcquaint.select_types )
	{
		alerd( 'st ' + st.select_type_id, bDebug );
		tmpArr = new Array();
		switch( st.select_type_id )
		{
			case 'spisok':
				tmpArr = ArrayExtract( teAcquaint.collaborators, 'This.collaborator_id' );
				break;

			case 'condition':
				tmpArr = ArrayExtract( XQuery( tools.create_xquery( 'collaborator', '', tools.create_filter_xquery( teAcquaint.conditions ) ) ), 'This.id' );
				break;

			case 'group':
				for( gr in teAcquaint.groups )
					tmpArr = ArrayUnion( tmpArr, ArrayExtract( XQuery( 'for $i in group_collaborators where $i/group_id = ' + gr.group_id + ' return $i' ), 'This.collaborator_id' ) );
				break;

			case 'eval':
				try
				{
					tmpArr = eval( teAcquaint.eval_code );
					if( !IsArray( tmpArr ) )
						tmpArr = new Array();
				}
				catch( ex ) { alerd( ex, bDebug ) }
				break;
		}

		arrCollabs = ArrayUnion( arrCollabs, tmpArr );

	}

	arrCollabs = ArraySelectDistinct( arrCollabs, 'This' );

	acquaintAssignArray = ArraySort( XQuery( 'for $elem in acquaint_assigns where $elem/acquaint_id = ' + iAcquaintId + ' return $elem' ), 'This.person_id', '+' );

	_counter = 0;
	for( col in arrCollabs )
	{
		_counter++;
		if ( ArrayOptFindBySortedKey( acquaintAssignArray, col, 'person_id' ) == undefined )
		{
			docAcquaintAssign = OpenNewDoc( 'x-local://wtv/wtv_acquaint_assign.xmd' );
			docAcquaintAssign.TopElem.AssignElem( teAcquaint );
			docAcquaintAssign.TopElem.acquaint_id = iAcquaintId;
			docAcquaintAssign.TopElem.person_id = col;
			docAcquaintAssign.TopElem.state_id = 'assign';
			docAcquaintAssign.BindToDb( DefaultDb );
			docAcquaintAssign.Save();
			tools.create_notification( '73', col, '', iAcquaintId, null, teAcquaint );
		}
	}
	if( bDel )
	{
		arrDeleteIds = new Array();
		for( aa in acquaintAssignArray )
		{
			if ( ArrayOptFind( arrCollabs, 'This==' + aa.person_id ) == undefined )
				arrDeleteIds.push( aa.id )
		}

		for( aa_id in arrDeleteIds )
			DeleteDoc( UrlFromDocID( aa_id ) )
	}

	return _counter;
}

/**
 * @function ActivateLearningTask
 * @memberof Websoft.WT.Knowledge
 * @description Обновление списка назначенных ознакомлений.
 * @param {bigint} iPersonID - id сотрудника, которому назначается
 * @param {bigint} iLearningTaskID - удалять id задания
 * @param {bigint} [iEducationPlanID] - дополнительное логирование
 * @param {bigint[]} [aFiles] - массив id файлов
 * @param {string} [sDesc] - описание
 * @param {bigint} [iActiveLearningID] -  id незаконченного курса
 * @param {bigint} [iExpertID] - id эксперта
 * @param {date} [dStartDate] - дата начала обучения
 * @param {date} [dPlanStartDate] - плановая дата начала обучения
 * @param {date} [dPlanEndDate] - плановая дата завершения обучения
 * @param {boolean} [bStartTask] - начинать задачу
 * @returns {WTKnowledgeResult}
 */
function ActivateLearningTask( iPersonID, iLearningTaskID, iEducationPlanID, aFiles, sDesc, iActiveLearningID, iExpertID, dStartDate, dPlanStartDate, dPlanEndDate, bStartTask )
{
	return activate_learning_task( {
		person_id: iPersonID,
		learning_task_id: iLearningTaskID,
		education_plan_id: iEducationPlanID,
		files: aFiles,
		desc: sDesc,
		active_learning_id: iActiveLearningID,
		expert_id: iExpertID,
		start_date: dStartDate,
		plan_start_date: dPlanStartDate,
		plan_end_date: dPlanEndDate,
		start_task: bStartTask
	} );
}

function activate_learning_task( oParam )
{
	/*
		функция назначения задания сотруднику
		oParam объект с параметрами
		person_id			- id сотрудника, которому назначается
		tePerson			- top_elem сотрудника
		learning_task_id	- id задания
		teLearningTask		- top_elem задания
		education_plan_id	- id плана обучения
		files				- массив id файлов
		desc				- описание
		active_learning_id	- id незаконченного курса
		expert_id			- id эксперта
		start_date			- дата начала
		plan_start_date		- плановая дата начала
		plan_end_date		- плановая дата завершения
		start_task			- начинать задачу
	*/

	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	oRes.doc_learning_task_result = null;

	try
	{
		iPersonID = Int( oParam.person_id );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Incorrect person_id';
		return oRes;
	}

	try
	{
		tePerson = oParam.tePerson;
		tePerson.Name;
	}
	catch ( err )
	{
		try
		{
			tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.message = 'Incorrect person_id';
			return oRes;
		}
	}

	try
	{
		iLearningTaskID = Int( oParam.learning_task_id );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Incorrect learning_task_id';
		return oRes;
	}
	try
	{
		iEventID = OptInt( oParam.event_id, null );
	}
	catch( ex )
	{
		iEventID = null;
	}

	try
	{
		teLearningTask = oParam.teLearningTask;
		teLearningTask.Name;
	}
	catch ( err )
	{
		try
		{
			teLearningTask = OpenDoc( UrlFromDocID( iLearningTaskID ) ).TopElem;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.message = 'Incorrect learning_task_id';
			return oRes;
		}
	}
	try
	{
		bStartTask = oParam.start_task;
		if( bStartTask == undefined || bStartTask == null )
			throw "error";
		bStartTask =  tools_web.is_true( oParam.start_task );
	}
	catch( ex )
	{
		bStartTask = false;
	}

	iActiveLearningID = OptInt( oParam.GetOptProperty( 'active_learning_id' ), null );

	catLearningTaskResult = ArrayOptFirstElem( XQuery( 'for $i in learning_task_results where $i/person_id = ' + iPersonID + ' and $i/learning_task_id = ' + iLearningTaskID + ( iActiveLearningID != null ? ' and $i/active_learning_id = ' + iActiveLearningID : ' and ( $i/status_id != \'success\' and $i/status_id != \'failed\' and $i/status_id != \'cancel\' )' ) + ' return $i/Fields(\'id\')' ) );
	if( catLearningTaskResult != undefined )
	{
		docLearningTaskResult = OpenDoc( UrlFromDocID( catLearningTaskResult.id ) );
		if( bStartTask )
		{
			bNeedSave = false;
			if( !docLearningTaskResult.TopElem.start_date.HasValue )
			{
				bNeedSave = true;
				docLearningTaskResult.TopElem.start_date = Date();
			}
			if( !docLearningTaskResult.TopElem.status_id.HasValue || docLearningTaskResult.TopElem.status_id == 'assign' )
			{
				bNeedSave = true;
				docLearningTaskResult.TopElem.status_id = 'process';
				if( docLearningTaskResult.TopElem.expert_id.HasValue )
				{
					tools.create_notification( "start_learning_task_result", docLearningTaskResult.TopElem.expert_id, "", docLearningTaskResult.DocID, null, docLearningTaskResult.TopElem );
				}
			}

			if( bNeedSave )
				docLearningTaskResult.Save();
		}

		oRes.doc_learning_task_result = docLearningTaskResult;
		return oRes;
	}

	try
	{
		dPlanStartDate =  Date( oParam.plan_start_date );
	}
	catch( ex )
	{
		dPlanStartDate = null;
	}
	try
	{
		dPlanEndDate =  Date( oParam.plan_end_date );
	}
	catch( ex )
	{
		dPlanEndDate = null;
	}
	try
	{
		dStartDate =  Date( oParam.start_date );
	}
	catch( ex )
	{
		dStartDate = null;
	}


	iEducationPlanID = OptInt( oParam.GetOptProperty( 'education_plan_id' ), null );
	iExpertID = OptInt( oParam.GetOptProperty( 'expert_id' ), null );

	arrFiles = oParam.GetOptProperty( 'files', [] );
	if( !IsArray( arrFiles ) )
		arrFiles = [];
	sDesc = oParam.GetOptProperty( 'desc', '' );

	docLearningTaskResult = OpenNewDoc( 'x-local://wtv/wtv_learning_task_result.xmd' );
	docLearningTaskResult.BindToDb( DefaultDb );

	docLearningTaskResult.TopElem.learning_task_id = iLearningTaskID;
	docLearningTaskResult.TopElem.learning_task_name = teLearningTask.name;
	docLearningTaskResult.TopElem.education_plan_id = iEducationPlanID;
	docLearningTaskResult.TopElem.active_learning_id = iActiveLearningID;

	docLearningTaskResult.TopElem.plan_start_date = dPlanStartDate;
	docLearningTaskResult.TopElem.plan_end_date = dPlanEndDate;
	docLearningTaskResult.TopElem.start_date = dStartDate;

	docLearningTaskResult.TopElem.event_id = iEventID;
	if( iExpertID != null )
	{
		docLearningTaskResult.TopElem.expert_id = iExpertID;
	}
	else if( teLearningTask.experts.ChildNum > 0 )
	{
		docLearningTaskResult.TopElem.expert_id = ArrayOptFirstElem( ArraySort( teLearningTask.experts, "Random( 0, 999 )", "+" ) ).person_id;
	}
	docLearningTaskResult.TopElem.person_id = iPersonID;
	tools.common_filling( 'collaborator', docLearningTaskResult.TopElem, iPersonID, tePerson );

	docLearningTaskResult.TopElem.desc = sDesc;
	for( iResourceID in arrFiles )
		if( OptInt( iResourceID ) != undefined )
			docLearningTaskResult.TopElem.files.ObtainChildByKey( OptInt( iResourceID ) );

	if( bStartTask )
	{
		if( !docLearningTaskResult.TopElem.start_date.HasValue )
		{
			docLearningTaskResult.TopElem.start_date = Date();
		}
		if( !docLearningTaskResult.TopElem.status_id.HasValue || docLearningTaskResult.TopElem.status_id == 'assign' )
		{
			docLearningTaskResult.TopElem.status_id = 'process';
			if( docLearningTaskResult.TopElem.expert_id.HasValue )
			{
				tools.create_notification( "start_learning_task_result", docLearningTaskResult.TopElem.expert_id, "", docLearningTaskResult.DocID, null, docLearningTaskResult.TopElem );
			}
		}

	}
	else
	{
		docLearningTaskResult.TopElem.status_id = 'assign';
	}

	docLearningTaskResult.Save();

	for( iResourceID in arrFiles )
		if( OptInt( iResourceID ) != undefined )
		{
			docResource = OpenDoc( UrlFromDocID( Int( iResourceID ) ) );
			docResource.TopElem.add_counter( docLearningTaskResult.TopElem );
		}

	oRes.doc_learning_task_result = docLearningTaskResult;

	return oRes;
}

/**
 * @function SetStatusLearningTaskResult
 * @memberof Websoft.WT.Knowledge
 * @description Смена статуса выполнения задачи.
 * @param {bigint} iLearningTaskResultID - id выполнения задания
 * @param {string} [sStatus] - новый статус ( failed, success )
 * @returns {WTKnowledgeResult}
 */
function SetStatusLearningTaskResult( iLearningTaskResultID, sStatus )
{
	return set_status_learning_task_result( {
		learning_task_result_id: iLearningTaskResultID,
		status: sStatus,
		need_save: true,
	} );
}

function set_status_learning_task_result( oParam )
{
	/*
		смена статуса выполнения задачи
		oParam объект с параметрами
		status					- новый статус ( failed, success )
		learning_task_result_id	- id задания
		docLearningTaskResult	- документ задания
		need_save				- необходимо сохранение
	*/

	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	oRes.doc_learning_task_result = null;

	try
	{
		sNewStatus = oParam.status;
		if( sNewStatus == undefined || sNewStatus == null )
			throw "error";
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Incorrect status';
		return oRes;
	}
	try
	{
		iLearningTaskResultID = Int( oParam.learning_task_result_id );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Incorrect learning_task_result_id';
		return oRes;
	}

	try
	{
		docLearningTaskResult = oParam.docLearningTaskResult;
		docLearningTaskResult.TopElem;
	}
	catch ( err )
	{
		try
		{
			docLearningTaskResult = OpenDoc( UrlFromDocID( iLearningTaskResultID ) );
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.message = 'Incorrect learning_task_result_id';
			return oRes;
		}
	}

	try
	{
		need_save = oParam.need_save;
		if( need_save == undefined || need_save == null )
			throw "error";
		need_save = tools_web.is_true( need_save );
	}
	catch( ex )
	{
		need_save = true;
	}
	sOldStatus = docLearningTaskResult.TopElem.status_id.Value;
	docLearningTaskResult.TopElem.status_id = sNewStatus;
	switch( sNewStatus )
	{
		case 'process':
			if( !docLearningTaskResult.TopElem.start_execution_date.HasValue )
			{
				docLearningTaskResult.TopElem.start_execution_date = Date();
			}
			break;
		case 'evaluation':
			if( !docLearningTaskResult.TopElem.finish_execution_date.HasValue )
			{
				docLearningTaskResult.TopElem.finish_execution_date = Date();
				if( docLearningTaskResult.TopElem.start_execution_date.HasValue )
				{
					docLearningTaskResult.TopElem.duration = DateDiff( docLearningTaskResult.TopElem.finish_execution_date, docLearningTaskResult.TopElem.start_execution_date );
					feLearningTask = docLearningTaskResult.TopElem.learning_task_id.OptForeignElem;

					if( feLearningTask != undefined && feLearningTask.duration.HasValue )
					{
						docLearningTaskResult.TopElem.expired = ( docLearningTaskResult.TopElem.duration > feLearningTask.duration );
					}
				}
			}
			break;
		case 'failed':
		case 'success':
			docLearningTaskResult.TopElem.finish_date = Date();
			if ( docLearningTaskResult.TopElem.active_learning_id.HasValue )
			{
				try
				{
					bSave = false;
					docActiveLearning = OpenDoc( UrlFromDocID( docLearningTaskResult.TopElem.active_learning_id ) );
					fldPart = ArrayOptFindByKey( docActiveLearning.TopElem.parts, docLearningTaskResult.TopElem.learning_task_id, 'object_id' );
					if ( fldPart.state_id < 2 )
					{
						fldPart.state_id = fldPart.cur_state_id = ( sNewStatus == 'failed' ? 3 : 4 );
						bSave = true;
					}
					if ( fldPart.score <= 0 )
					{
						fldPart.score = fldPart.cur_score = docLearningTaskResult.TopElem.mark;
						docActiveLearning.TopElem.calc_score();
						bSave = true;
					}
					if ( bSave )
						docActiveLearning.Save();
				}
				catch ( err )
				{
					alert( err )
				}
			}
			break;
	}

	if( need_save )
	{
		docLearningTaskResult.Save();
	}

	switch( sNewStatus )
	{
		case 'failed':
		case 'success':
		default:
			if( docLearningTaskResult.TopElem.education_plan_id.HasValue && sNewStatus != sOldStatus )
			{
				if( !need_save )
				{
					docLearningTaskResult.Save();
				}
				var teCommand = OpenDocFromStr( tools.xml_header() + '<queue_code_library/>' ).TopElem;
				teCommand.AddChild( 'type', 'string' ).Value = 'call_method';
				teCommand.AddChild( 'method', 'string' ).Value = 'update_education_plan';
				teCommand.AddChild( 'library', 'string' ).Value = 'libEducation';
				teCommand.AddChild( 'params', 'string' ).Value = EncodeJson( [ docLearningTaskResult.TopElem.education_plan_id.Value, null, docLearningTaskResult.TopElem.person_id.Value ] );
				teCommand.AddChild( 'start_date', 'date' ).Value = DateOffset( Date(), 60 );
				tools.put_message_in_queue( 'code-library-queue', teCommand.GetXml( { 'tabs': false } ) );
			}
			break;
	}

	if( sNewStatus != sOldStatus )
	{
		switch( sNewStatus )
		{
			case "evaluation":
				if( docLearningTaskResult.TopElem.expert_id.HasValue )
				{
					tools.create_notification( "evaluation_learning_task_result", docLearningTaskResult.TopElem.expert_id, "", docLearningTaskResult.DocID, null, docLearningTaskResult.TopElem );
				}
				break;
			case "cancel":
				if( docLearningTaskResult.TopElem.person_id )
				{
					tools.create_notification( "cancel_learning_task_result", docLearningTaskResult.TopElem.person_id, "", docLearningTaskResult.DocID, null, docLearningTaskResult.TopElem );
				}
				break;
			case "failed":
				if( docLearningTaskResult.TopElem.person_id )
				{
					tools.create_notification( "failed_learning_task_result", docLearningTaskResult.TopElem.person_id, "", docLearningTaskResult.DocID, null, docLearningTaskResult.TopElem );
				}
				break;
			case "process":
				if( sOldStatus == "evaluation" )
				{
					if( docLearningTaskResult.TopElem.person_id )
					{
						tools.create_notification( "return_learning_task_result", docLearningTaskResult.TopElem.person_id, "", docLearningTaskResult.DocID, null, docLearningTaskResult.TopElem );
					}
				}
				else if( docLearningTaskResult.TopElem.expert_id.HasValue )
				{
					tools.create_notification( "start_learning_task_result", docLearningTaskResult.TopElem.expert_id, "", docLearningTaskResult.DocID, null, docLearningTaskResult.TopElem );
				}
				break;
			case "success":
				if( docLearningTaskResult.TopElem.person_id )
				{
					tools.create_notification( "success_learning_task_result", docLearningTaskResult.TopElem.person_id, "", docLearningTaskResult.DocID, null, docLearningTaskResult.TopElem );
				}
				break;
			case "viewed":
				if( docLearningTaskResult.TopElem.person_id )
				{
					tools.create_notification( "viewed_learning_task_result", docLearningTaskResult.TopElem.person_id, "", docLearningTaskResult.DocID, null, docLearningTaskResult.TopElem );
				}
				break;
		}

		ms_tools.raise_system_event_env('common_learning_task_result_change_status', {
			'sOldStatus': sOldStatus,
			'iLearningTaskResultID': docLearningTaskResult.DocID,
			'teLearningTaskResult': docLearningTaskResult.TopElem
		});
	}

	oRes.doc_learning_task_result = docLearningTaskResult;

	return oRes;
}

function http_request( sUrl, sParam, bOnServer )
{
	/*
		выполнение http запроса на сервере
	*/
	try
	{
		if( sUrl == undefined || sUrl == null )
			throw "error";
	}
	catch ( err )
	{
		return '';
	}
	try
	{
		if( sParam == undefined || sParam == null )
			throw "error";
	}
	catch ( err )
	{
		sParam = '';
	}
	try
	{
		if( bOnServer == undefined || bOnServer == null )
			throw "error";
		bOnServer = tools_web.is_true( bOnServer );
	}
	catch ( err )
	{
		bOnServer = false;
	}
	if ( ( bOnServer || System.IsWebClient ) && !LdsIsServer )
		return CallServerMethod( 'tools_knlg', 'http_request', [ RValue( sUrl ), RValue( sParam ) ] );

	return HttpRequest( sUrl, 'get', sParam ).Body;
}


function get_article_desc( sDesc, sNewUrl, sQueryParam, bReplaceImgToBase, bReplaceImgToFile )
{
	try
	{
		if( sDesc == undefined || sDesc == null )
			throw "error";
	}
	catch ( err )
	{
		return '';
	}
	try
	{
		if( sQueryParam == undefined || sQueryParam == null )
			throw "error";
		sQueryParam
	}
	catch ( err )
	{
		sQueryParam = '';
	}
	try
	{
		if( bReplaceImgToBase == undefined || bReplaceImgToBase == null )
			throw "error";
		bReplaceImgToBase = tools_web.is_true( bReplaceImgToBase );
	}
	catch ( err )
	{
		bReplaceImgToBase = false;
	}
	try
	{
		if( bReplaceImgToFile == undefined || bReplaceImgToFile == null )
			throw "error";
		bReplaceImgToFile = tools_web.is_true( bReplaceImgToFile );
	}
	catch ( err )
	{
		bReplaceImgToFile = false;
	}

	try
	{
		if( sNewUrl == undefined || sNewUrl == null )
			throw "error";
	}
	catch ( err )
	{
		return sDesc;
	}
	if ( ! LdsIsServer )
		return CallServerMethod( 'tools_knlg', 'get_article_desc', [ RValue( sDesc ), RValue( sNewUrl ) ] );

	newHtmlStr = '';

	reader = new TagReader( sDesc );
	reader.ReadNext();
	var arrCompounds = new Array();
	var bReplaceCompound = true;
	while ( ! reader.EOF )
		try
		{
			if ( reader.TagName == 'img' )
			{
				attr = Trim( reader.GetAttr( 'src' ) );
				if ( attr != '' && !StrBegins( attr, "data:" ) )
				{
					if ( StrBegins( attr, '/' ) )
					{
						reader.SetAttr( 'src', UrlAppendPath( sNewUrl, attr ) );
					}
				}
				attr = Trim( reader.GetAttr( 'width' ) );
				if ( attr != '' && !StrContains( attr, "%" ) )
				{
					if( OptInt( attr, 0 ) > 600 )
					{
						reader.SetAttr( 'width', "600" );
						reader.SetAttr( 'height', "auto" );
					}
				}
				attr = Trim( reader.GetAttr( 'style' ) );
				if ( attr != '' && StrContains( attr, "width" ) )
				{
					sNewStyle = "";
					//alert('attr '+attr)
					arrStyles = String( Trim( attr ) ).split( ";" )
					for( _style in arrStyles )
					{
						//alert('_style '+_style)
						arr = String( Trim( _style ) ).split( ":" );
						if( Trim( arr[ 0 ] ) == "width" && !StrContains( Trim( arr[ 1 ] ), "%" ) )
						{
							iWidth = OptInt( StrReplace( Trim( arr[ 1 ] ), "px", "" ) );
							if( iWidth != undefined && iWidth > 600 )
							{
								sNewStyle += "width: 100%; height: auto;";
								reader.SetAttr( 'width', "100%" );
								reader.SetAttr( 'height', "auto" );
							}
							else
							{
								if( iWidth != undefined )
								{
									reader.SetAttr( 'width', iWidth );
								}
								sNewStyle += _style + ";";
								catHeight = ArrayOptFind( arrStyles, "StrBegins( Trim( This ), 'height' )" );
								if( catHeight != undefined )
								{
									arrHeight = String( Trim( catHeight ) ).split( ":" );
									iHeight = OptInt( StrReplace( Trim( arr[ 1 ] ), "px", "" ) );
									sNewStyle += catHeight + ";";
									if( iHeight != undefined )
									{
										reader.SetAttr( 'height', iHeight );
									}
								}
							}
						}
						else if( Trim( arr[ 0 ] ) == "height" )
						{
							continue;
						}
						else
						{
							sNewStyle += _style + ";";
						}
					}
					sNewStyle += "page-break-inside: auto; page-break-before: auto; word-wrap: nowrap; white-space: nowrap;"
					reader.SetAttr( 'style', sNewStyle );
				}
				else
				{
					reader.SetAttr( 'style', attr + "; page-break-inside: auto; page-break-before: auto; word-wrap: nowrap; white-space: nowrap;" );
				}
			}
			if( reader.TagName == 'a' )
			{
				attr = Trim( reader.GetAttr( 'href' ) );
				if ( attr != '' )
				{
					if ( StrBegins( attr, '/' ) )
					{
						if( UrlFileName( attr ) == 'open_object.html' )
						{
							query = UrlQuery( attr );
							reader.SetAttr( 'href', UrlAppendPath( sNewUrl, 'view_desc_unauthorize.html?desc_object_id=' + query.GetOptProperty( 'object_id' ) + ( sQueryParam != '' ? '&' + sQueryParam : '' )  ) );
						}
						else
						{
							reader.SetAttr( 'href', UrlAppendPath( sNewUrl, attr ) );
							reader.SetAttr( 'target', '_blank' );
						}
					}
				}

			}
			if( bReplaceCompound )
				if( reader.TagName == 'compound-attc' )
				{
					arrCompounds.push( { path: Trim( reader.GetAttr( 'path' ) ), data: Trim( reader.GetAttr( 'data' ) ) } )
				}
			newHtmlStr += reader.GetTagStr();
			reader.ReadNext();
		}
		catch( ex ){
			alert(ex);
			reader.ReadNext();
		}

	if( bReplaceCompound )
	{
		reader = new TagReader( newHtmlStr );
		newCompoundHtmlStr = '';
		while ( ! reader.EOF )
			try
			{
				if ( reader.TagName == 'img' )
				{
					sPath = Trim( reader.GetAttr( 'src' ) );
					if( !StrBegins( sPath, "data:" ) )
					{
						oType = ArrayOptFindByKey( tools_web.content_types.Object, UrlPathSuffix( sPath ), 'ext' );
						catCompound = ArrayOptFind( arrCompounds, 'String( This.path ) == String( sPath )' );
						if ( catCompound != undefined )
						{
							if( bReplaceImgToFile )
							{
								sTempUrl = ObtainTempFile( UrlPathSuffix( sPath ) );
								PutUrlData( sTempUrl, Base64Decode( StrReplace( StrReplace( catCompound.data, "\n", "" ), " ", "" ) ) );
								reader.SetAttr( "src", UrlToFilePath( sTempUrl ) );
							}
							else
							{
								oType = ArrayOptFindByKey( tools_web.content_types.Object, UrlPathSuffix( sPath ), 'ext' );
								reader.SetAttr( 'src', 'data:' + ( oType != undefined ? oType.type : 'image/jpeg' ) + ';base64,' + StrReplace( StrReplace( catCompound.data, "\n", "" ), " ", "" ) );
							}
						}
						else if( bReplaceImgToBase )
						{
							try
							{
								sFileData = null;
								if( StrContains( sPath, 'download_file.html' ) || OptInt( sPath ) != undefined )
								{
									query = UrlQuery( sPath );
									if( StrContains( sPath, 'download_file.html' ) )
										iFileID = Int( query.file_id );
									else
										iFileID = Int( sPath );
									docResource = OpenDoc( UrlFromDocID( iFileID ) );
									sTempUrl = ObtainTempFile( docResource.TopElem.file_name );
									docResource.TopElem.get_data( sTempUrl );
									sFileData = Base64Encode( LoadUrlData( sTempUrl ) );
								}
								if( sFileData == null )
								{
									oResp = HttpRequest( sPath, 'get', '', 'Ignore-Errors: 0' );
									if( oResp.RespCode == 200 && StrContains( oResp.ContentType, 'image' ) )
										sFileData = Base64Encode( oResp.Body );
									else
									{
										reader.ReadNext();
										continue;
									}
								}
								reader.SetAttr( 'src', 'data:' + ( oType != undefined && StrBegins( oType.type, 'image' ) ? oType.type : 'image/jpeg' ) + ';base64,' + StrReplace( StrReplace( sFileData, "\n", "" ), " ", "" ) );
							}
							catch(ex){ alert(ex) }
						}
						else if( bReplaceImgToFile )
						{
							try
							{
								sFileData = null;
								sTempUrl = ObtainTempFile( UrlPathSuffix( sPath ) );
								if( StrContains( sPath, 'download_file.html' ) || OptInt( sPath ) != undefined )
								{
									query = UrlQuery( sPath );
									if( StrContains( sPath, 'download_file.html' ) )
									{
										iFileID = Int( query.file_id );
									}
									else
									{
										iFileID = Int( sPath );
									}
									docResource = OpenDoc( UrlFromDocID( iFileID ) );
									docResource.TopElem.get_data( sTempUrl );
								}
								if( sFileData == null )
								{
									oResp = HttpRequest( sPath, 'get', '', 'Ignore-Errors: 0' );
									if( oResp.RespCode == 200 && StrContains( oResp.ContentType, 'image' ) )
									{
										oResp.SaveToFile( sTempUrl );
									}
									else
									{
										reader.ReadNext();
										continue;
									}
								}
								reader.SetAttr( "src", UrlToFilePath( sTempUrl ) );
							}
							catch(ex){ alert(ex) }
						}
					}
					else if( bReplaceImgToFile )
					{
						arrSrc = sPath.split( ";" );
						if( ArrayCount( arrSrc ) < 2 )
						{
							reader.ReadNext();
							continue;
						}
						sType = arrSrc[0].split(":")[1];
						oType = ArrayOptFindByKey( tools_web.content_types.Object, sType, "type" );
						sTempUrl = ObtainTempFile( ( oType != undefined ? oType.ext : ".png" ) );
						PutUrlData( sTempUrl, Base64Decode( arrSrc[1].split(",")[1] ) );
						reader.SetAttr( "src", UrlToFilePath( sTempUrl ) );
					}
				}
				if( reader.TagName != "compound-attc" )
					newCompoundHtmlStr += reader.GetTagStr();
				reader.ReadNext();
			}
			catch( ex ){
				alert(ex);
				reader.ReadNext();
			}

		newHtmlStr = newCompoundHtmlStr;
	}
	return newHtmlStr;
}


/**
 * @typedef {Object} WTKnowledgePartsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oKnowledgePart[]} array
*/
/**
 * @typedef {Object} oKnowledgePart
 * @property {bigint} id
 * @property {string} name
 * @property {string} parent_id
 * @property {bigint} classifier_id
 * @property {string} classifier_name
 * @property {string} image
 * @property {bigint} experts_count
 * @property {bigint} levels_count
 * @property {bigint} objects_count
 */
/**
 * @function GetKnowledgeParts
 * @memberof Websoft.WT.Knowledge
 * @description Получить список значений карты знаний
 * @param {bigint} [iKnowledgeClassifierID] - ID классификатора карты знаний
 * @param {bigint} [iParentKnowledgePartID] - ID родительского значения карты знаний
 * @param {bigint} [iKnowledgePartLevelID] - ID категории карты знаний
 * @param {bigint} [iExpertID] - ID эксперта
 * @returns {WTKnowledgePartsResult[]}
 */

 function GetKnowledgeParts( iKnowledgeClassifierID, iParentKnowledgePartID, iKnowledgePartLevelID, iExpertID, iCurUserID, sAccessType, sApplication, arrReturnData, sXQueryQual, oCollectionParams )
 {
	 return get_knowledge_parts( iKnowledgeClassifierID, iParentKnowledgePartID, iKnowledgePartLevelID, iExpertID, iCurUserID, sAccessType, sApplication, arrReturnData, sXQueryQual, oCollectionParams );
 }
 function get_knowledge_parts( iKnowledgeClassifierID, iParentKnowledgePartID, iKnowledgePartLevelID, iExpertID, iCurUserID, sAccessType, sApplication, arrReturnData, sXQueryQual, oCollectionParams )
 {
	 function set_error( iError, sErrorText, bResult )
	 {
		 oRes.error = iError;
		 oRes.errorText = sErrorText;
		 oRes.result = bResult;
	 }
 
	 oRes = tools.get_code_library_result_object();
	 oRes.array = [];
	 oRes.paging = oCollectionParams.GetOptProperty("paging"); 
	 try
	 {
		 iKnowledgeClassifierID = OptInt( iKnowledgeClassifierID );
	 }
	 catch( ex )
	 {
		 iKnowledgeClassifierID = undefined;
	 }
	 try
	 {
		 iKnowledgePartLevelID = OptInt( iKnowledgePartLevelID );
	 }
	 catch( ex )
	 {
		 iParentKnowledgePartID = undefined;
	 }
	 try
	 {
		 iParentKnowledgePartID = OptInt( iParentKnowledgePartID );
	 }
	 catch( ex )
	 {
		 iParentKnowledgePartID = undefined;
	 }
	 try
	 {
		 iExpertID = OptInt( iExpertID );
	 }
	 catch( ex )
	 {
		 iExpertID = undefined;
	 }
	 conds = new Array();
	 if( iKnowledgeClassifierID != undefined )
	 {
		 conds.push( "$elem/knowledge_classifier_id = " + iKnowledgeClassifierID );
	 }
	 if( iKnowledgePartLevelID != undefined )
	 {
		 conds.push( "$elem/knowledge_part_level_id = " + iKnowledgePartLevelID );
	 }
	 if( iParentKnowledgePartID != undefined )
	 {
		 conds.push( "$elem/parent_object_id = " + iParentKnowledgePartID );
	 }
	 if( iExpertID != undefined )
	 {
		 docExpert = tools.open_doc(iExpertID);
		 if(docExpert != undefined && docExpert.TopElem.Name != "expert")
		 {
			 var sExpertReq = tools.create_xquery("expert", "$elem/person_id=" + iExpertID, "");
			 var xqExperts = tools.xquery(sExpertReq);
			 var fldExpert = ArrayOptFirstElem(xqExperts);
			 if(fldExpert != undefined)
				 iExpertID = fldExpert.id.Value;
		 }
		 conds.push( "contains( $elem/experts, " + XQueryLiteral( String( iExpertID ) ) + " )" );
	 }
	 function get_knowledge_classifier( iId )
	 {
		 if( !iId.HasValue )
			 return undefined;
 
		 var oKnowledgeClassifier = ArrayOptFind( arrKnowledgeClassifier, "This.id == iId" );
		 if( oKnowledgeClassifier == undefined )
		 {
			 oKnowledgeClassifier = new Object();
			 oKnowledgeClassifier.id = iId;
			 oKnowledgeClassifier.foreign_elem = iId.OptForeignElem;
			 arrKnowledgeClassifier.push( oKnowledgeClassifier );
		 }
		 return oKnowledgeClassifier.foreign_elem;
	 }
 
	 iCurUserID = OptInt(iCurUserID, 0);
 
	 if ( sAccessType == null || sAccessType == undefined)
	 {
		 sAccessType = "auto";
	 }
 
	 if ( sAccessType != "auto" && sAccessType != "admin" && sAccessType != "manager" && sAccessType != "hr" && sAccessType != "expert" && sAccessType != "observer" )
	 {
		 sAccessType = "auto";
	 }
	 
	 if ( sApplication == null || sApplication == undefined)
	 {
		 sApplication = "";
	 }
 
	 if ( arrReturnData == null || arrReturnData == undefined)
	 {
		 arrReturnData = [];
	 }
 
	 if ( sXQueryQual == null || sXQueryQual == undefined)
		 sXQueryQual = "";
 
	 if ( sXQueryQual != "" )
	 {
		 conds.push( sXQueryQual );
	 }
 
	 if ( oCollectionParams.HasProperty("filters") && IsArray( oCollectionParams.filters ) )
	 {
		 arrFilters = oCollectionParams.filters;
	 }
	 else
	 {
		 arrFilters = [];
	 }
 
	 for ( oFilter in arrFilters )
	 {
		 if ( oFilter.type == 'search' )
		 {
			 if ( oFilter.value != '' ) 
				 conds.push("doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )");
		 }
	 }
 
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
			 sAccessType = "admin"; //Администратор приложения
		 }
		 else if(iApplLevel >= 7)
		 {
			 sAccessType = "manager"; //Администратор процесса
		 }
		 else if(iApplLevel >= 5)
		 {
			 sAccessType = "hr"; //Администратор HR
		 }
		 else if(iApplLevel >= 3)
		 {
			 sAccessType = "expert"; //Эксперт
		 }
		 else if(iApplLevel >= 1)
		 {
			 sAccessType = "observer"; //Наблюдатель
		 }
		 else
		 {
			 sAccessType = "reject";
		 }
	 }
 
	 switch(sAccessType)
	 {
		 case "expert":
			 var teApplication = tools_app.get_cur_application( sApplication );
			 if (teApplication != null)
			 {
				 bHierarchyExpertise = false;
				 if ( teApplication.wvars.GetOptChildByKey( 'HierarchyExpertise' ) != undefined )
				 {
					 bHierarchyExpertise = tools_web.is_true( teApplication.wvars.GetOptChildByKey( 'HierarchyExpertise' ).value );
				 }	
			 }
  
			 oExpert = ArrayOptFirstElem(tools.xquery("for $elem in experts where $elem/type = 'collaborator' and $elem/person_id = " + iCurUserID + " return $elem/Fields('id')"));
			 arrKnowPartsIDs_Expert = [];
			 if (oExpert != undefined)
			 {
				 arrKnowPartsIDs_Expert = ArrayExtract( tools.xquery( "for $elem in knowledge_parts where contains($elem/experts," + OptInt(oExpert.id, 0) + ") return $elem/Fields('id')" ), "This.id.Value" );
				 
				 if ( bHierarchyExpertise && ArrayOptFirstElem( arrKnowPartsIDs_Expert ) != undefined )
				 {
					 arrKnowPartsIDs_Expert_Hier = [];
					 for ( iKnowPart in arrKnowPartsIDs_Expert )
					 {
						 _xarr = tools.xquery( "for $elem in knowledge_parts where IsHierChildOrSelf( $elem/id, " + OptInt( iKnowPart, 0 ) + " ) order by $elem/Hier() return $elem/Fields('id')" );
						 arrKnowPartsIDs_Expert_Hier = ArrayUnion( arrKnowPartsIDs_Expert_Hier, ArrayExtract( _xarr, "This.id.Value" ) );
					 }
					 arrKnowPartsIDs_Expert = arrKnowPartsIDs_Expert_Hier;
				 }
			 }
			 conds.push( "MatchSome($elem/id, (" + ArrayMerge(arrKnowPartsIDs_Expert, "This", ",") + "))" );
			 break;
	 }
	 
	 bObjectsCount = false;
	 bExpertsCount = false;
	 bLevelsCount = false;
	 if ( ArrayOptFirstElem( arrReturnData ) != undefined )
		 {
			 for ( itemReturnData in arrReturnData )
			 {
				 switch ( itemReturnData )
				 {
					 case "objects_count": //Число объектов
						 bObjectsCount = true;
						 break;
					 case "experts_count": //число экспертов
						 bExpertsCount = true;
						 break;
					 case "levels_count": //Число уровней
						 bLevelsCount = true;
						 break;
				 }
			 }
		 }
 
	arrKnowledgeClassifier = new Array();
	var sSortCond = " order by $elem/name";
	if(ObjectType(oCollectionParams.sort) == 'JsObject' && !IsEmptyValue(oCollectionParams.sort.FIELD) )
	{
		switch(oCollectionParams.sort.FIELD)
		{
			case "name":
				sSortCond = " order by $elem/name";
				break;
			case "classifier_name":
				sSortCond = " order by $elem/knowledge_classifier_id"
				break;
		}
		
		if(oCollectionParams.sort.DIRECTION == "DESC")
		{
			sSortCond += " descending";
		}
	}

	var sKnwlgReq = "for $elem in knowledge_parts " + ( ArrayOptFirstElem( conds ) != undefined ? " where " + ArrayMerge( conds, "This", " and " ) : "" ) + sSortCond + " return $elem";
 	var arrKnwlgParts = tools.xquery( sKnwlgReq );
 	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		var oRetPage = tools.call_code_library_method( "libMain", "select_page_sort_params", [arrKnwlgParts, oCollectionParams.paging ]);
		oCollectionParams.paging = oRetPage.oPaging;
		arrKnwlgParts = oRetPage.oResult;
	}

	xarrKnowObjects = ArrayDirect(tools.xquery( "for $elem in knowledge_objects order by $elem/knowledge_part_id return $elem/Fields('knowledge_part_id')" ));
 
	for( _kp in arrKnwlgParts )
	{
		oKp = new Object();
		oKp.id = _kp.id.Value;
		oKp.name = _kp.name.Value;
		oKp.classifier_id = _kp.knowledge_classifier_id.Value;
		oKp.parent_id = _kp.parent_object_id.Value;
		feClassifier = get_knowledge_classifier( _kp.knowledge_classifier_id );
		oKp.classifier_name = feClassifier != undefined ? feClassifier.name.Value : "";
		oKp.image = get_object_image_url( _kp );
		oKp.experts_count = null;
		oKp.levels_count = null;
		oKp.objects_count = null;
		if ( bExpertsCount )
		 oKp.experts_count = ArrayCount( ArraySelect( String(_kp.experts).split(";"), "OptInt(This) != undefined" ) ); //число экспертов
		if ( bLevelsCount )
		{
		 docKnowPart = tools.open_doc( _kp.id.Value );
		 oKp.levels_count = (docKnowPart != undefined) ? ArrayCount( docKnowPart.TopElem.levels ) : null ; //число уровней
		}
		if ( bObjectsCount )
		 oKp.objects_count = ArrayCount( ArraySelectBySortedKey( xarrKnowObjects, _kp.id.Value, "knowledge_part_id" ) ); //число объектов

		oRes.array.push( oKp );
	}

	xarrKnowObjects = undefined;
	return oRes;
 }


/**
 * @typedef {Object} WTObjectKnowledgePartsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oObjectKnowledgePart[]} array
*/
/**
 * @typedef {Object} oObjectKnowledgePart
 * @property {bigint} id
 * @property {string} name
 * @property {string} desc
 * @property {int} cost
 * @property {boolean} require_acknowledgement
 * @property {string} img 
 * @property {string} link
 * @property {string} target_level_name
*/
/**
 * @function GetKnowledgePartsObject
 * @memberof Websoft.WT.Knowledge
 * @description Получить список значений карты знаний объекта
 * @param {bigint} iObjectID - ID объекта
 * @param {bigint} [iKnowledgeClassifierID] - ID классификатора карты знаний
 * @param {bigint} [iKnowledgePartLevelID] - ID категории карты знаний
 * @param {boolean} [bShowOnlyAcknowledgement=true] - показывать только подтвержденные значения
 * @returns {WTObjectKnowledgePartsResult[]}
 */

function GetKnowledgePartsObject( iObjectID, iKnowledgeClassifierID, iKnowledgePartLevelID, bShowOnlyAcknowledgement )
{
	return get_object_knowledge_parts( iObjectID, null, iKnowledgeClassifierID, iKnowledgePartLevelID, bShowOnlyAcknowledgement );
}
function get_object_knowledge_parts( iObjectID, teObject, iKnowledgeClassifierID, iKnowledgePartLevelID, bShowOnlyAcknowledgement )
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
	oRes.array = [];

	try
	{
		iObjectID = Int( iObjectID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'peredannekorre' );
		return oRes;
	}
	try
	{
		teObject.Name;
	}
	catch( ex )
	{
		try
		{
			teObject = OpenDoc( UrlFromDocID( iObjectID ) ).TopElem;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = i18n.t( 'peredannekorre' );
			return oRes;
		}
	}

	try
	{
		iKnowledgeClassifierID = OptInt( iKnowledgeClassifierID );
	}
	catch( ex )
	{
		iKnowledgeClassifierID = undefined;
	}
	try
	{
		iKnowledgePartLevelID = OptInt( iKnowledgePartLevelID );
	}
	catch( ex )
	{
		iKnowledgePartLevelID = undefined;
	}
	try
	{
		if( bShowOnlyAcknowledgement == undefined || bShowOnlyAcknowledgement == null )
			throw "error";
		bShowOnlyAcknowledgement = tools_web.is_true( bShowOnlyAcknowledgement );
	}
	catch ( err )
	{
		bShowOnlyAcknowledgement = true;
	}
	for( _kp in teObject.knowledge_parts )
	{
		if( bShowOnlyAcknowledgement && _kp.require_acknowledgement )
			continue;
		if( iKnowledgePartLevelID != undefined && iKnowledgePartLevelID != _kp.knowledge_part_level_id )
			continue;
		if(iKnowledgeClassifierID != undefined && feKp.knowledge_classifier_id != iKnowledgeClassifierID)
			continue;

		docKp = tools.open_doc(_kp.knowledge_part_id);
		if(docKp == undefined)
			continue;

		teKp = docKp.TopElem;
		sImgUrl = (teKp.resource_id.HasValue) ? tools_web.get_object_source_url('resource', teKp.resource_id.Value) : "";
		fldLevel = teKp.levels.GetOptChildByKey(_kp.target_level_id.Value);
		iTargetCost = fldLevel != undefined ? fldLevel.cost.Value : null;


		oKp = new Object();
		oKp.id = _kp.knowledge_part_id.Value;
		oKp.name = teKp.name.Value;
		oKp.target_level_name = ( _kp.target_level_name.HasValue ? _kp.target_level_name.Value : "-" );
		oKp.desc = _kp.knowledge_part_name.HasValue ? _kp.knowledge_part_name.Value : teKp.text_area.Value;
		oKp.cost = iTargetCost;
		oKp.require_acknowledgement = _kp.require_acknowledgement.Value;
		oKp.img = sImgUrl;
		oKp.link = tools_web.get_mode_clean_url(null, _kp.knowledge_part_id.Value)
		oRes.array.push( oKp );
	}
	return oRes;
}

/**
 * @typedef {Object} WTExpertsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oExpert[]} array
*/
/**
 * @typedef {Object} oExpert
 * @property {bigint} id
 * @property {bigint} person_id
 * @property {string} fullname
 * @property {string} position_name
 * @property {string} knowledge
 * @property {string} image
 * @property {string} link
*/
/**
 * @function GetExperts
 * @memberof Websoft.WT.Knowledge
 * @description Получить список экспертов
 * @param {string} sSearch - Строка для поиска
 * @param {bigint[]} [aKnowledgeParts] - Масиив значений карты знаний
 * @param {boolean} [bShowWithoutSearchParams=true] - Показывать результаты без параметров поиска
 * @returns {WTExpertsResult[]}
 */

function GetExperts( iCurUserID, bCheckAccess, sSearch, aKnowledgeParts, bShowWithoutSearchParams )
{
	return get_experts( iCurUserID, bCheckAccess, sSearch, aKnowledgeParts, bShowWithoutSearchParams );
}
function get_experts( iCurUserID, bCheckAccess, sSearch, aKnowledgeParts, bShowWithoutSearchParams, oPaging )
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
	oRes.array = [];
	
	try
	{
		if ( bCheckAccess == undefined || bCheckAccess == null )
			throw '';

		bCheckAccess = tools_web.is_true( bCheckAccess );
	}
	catch( ex )
	{
		bCheckAccess = global_settings.settings.check_access_on_lists.Value;
	}
	
	try
	{
		iCurUserID = Int( iCurUserID );
	}
	catch( ex )
	{
		oRes.error = 501; 
		oRes.errorText = "{ text: 'Invalid param iCurUserID.', param_name: 'iCurUserID' }";
		return oRes;
	}
	
	try
	{
		if( !IsArray( aKnowledgeParts ) )
			throw "error";
	}
	catch( ex )
	{
		aKnowledgeParts = [];
	}
	
	try
	{
		if( sSearch == undefined || sSearch == null )
			throw "error";
		sSearch = String( sSearch );
	}
	catch ( err )
	{
		sSearch = "";
	}
	
	try
	{
		if( bShowWithoutSearchParams == undefined || bShowWithoutSearchParams == null )
			throw "error";
		bShowWithoutSearchParams = tools_web.is_true( bShowWithoutSearchParams );
	}
	catch ( err )
	{
		bShowWithoutSearchParams = true;
	}
	
	if( !bShowWithoutSearchParams && sSearch == "" && ArrayOptFirstElem( aKnowledgeParts ) == undefined )
	{
		return oRes;
	}

	var expert_conds = new Array();
	var col_conds = new Array();
	var acquaint_conds = new Array();
	var libParam = tools.get_params_code_library( "libKnowledge" );
	var sExpertType = libParam.GetOptProperty( "expert_type", "standart" );
	var xarrCollaborators = new Array();
	var xarrKnowledgeAcquaints = new Array();
	var xarrKnowledgeProfiles = new Array();
	var xarrPositions = new Array();
	var xarrExperts = null;

	if( ArrayOptFirstElem( aKnowledgeParts ) != undefined )
	{
		xarrKnowledgeParts = XQuery( "for $elem in knowledge_parts where MatchSome( $elem/id, ( " + ArrayMerge( aKnowledgeParts, "This", "," ) + " ) ) return $elem" );
		if( ArrayOptFirstElem( xarrKnowledgeParts ) == undefined )
			return oRes;
		aExperts = new Array();
		for( _kp in xarrKnowledgeParts )
		{
			if( _kp.experts.HasValue )
			{
				aExperts = ArrayUnion( aExperts, String( _kp.experts ).split( ";" ) )
			}
		}
		if( ArrayOptFirstElem( aExperts ) == undefined )
		{
			xarrExperts = new Array();
		}
		else
		{
			expert_conds.push( "MatchSome( $elem/id, ( " + ArrayMerge( aExperts, "This", "," ) + " ) )" );
		}
	}

	function get_knowledges( _expert_id, _person_id )
	{
		var aKnowledge = new Array();
		if( OptInt( _expert_id ) != undefined )
		{
			var sExpertID = String( _expert_id );
			for( _kp in ArraySelect( xarrKnowledgeParts, "StrContains( This.experts, sExpertID )" ) )
			{
				aKnowledge.push( _kp.name.Value );
			}
		}
		if( OptInt( _person_id ) != undefined )
		{
			switch( sExpertType )
			{
				case "with_knowledge":
					var arrPositions = ArraySelectBySortedKey( xarrPositions, _person_id, "basic_collaborator_id" );
					var arrKnowledgeProfile = new Array();
					for( _position in arrPositions )
					{
						catProfile = ArrayOptFindBySortedKey( arrKnowledgeProfile, _position.knowledge_profile_id, "id" );
						if( catProfile != undefined )
						{
							arrKnowledgeProfile.push( catProfile );
						}
					}
					for( _kpr in arrKnowledgeProfile )
					{
						for( _kp in String( _kpr.knowledge_parts ).split( ";" ) )
						{
							catKP = ArrayOptFindBySortedKey( xarrKnowledgeParts, OptInt( _kp ), "id" );
							if( catKP != undefined )
							{
								aKnowledge.push( catKP.name.Value );
							}
						}
					}
					
				case "with_expert_level":
					aKnowledge = ArrayUnion( aKnowledge, ArrayExtract( ArraySelectBySortedKey( xarrKnowledgeAcquaints, _person_id, "person_id" ), "This.knowledge_part_name" ) );
					break;
			}
		}
		return ArrayMerge( aKnowledge, "This", ", " );
	}

	if( sSearch != "" )
	{
		expert_conds.push( "doc-contains( $elem/id, 'wt_data', " + XQueryLiteral( sSearch ) + " )" );
	}
	if( xarrExperts == null )
	{
		xarrExperts = XQuery( "for $elem in experts " + ( ArrayOptFirstElem( expert_conds ) != undefined ? " where " + ArrayMerge( expert_conds, "This", " and " ) : "" ) + " return $elem" );
	}
	
	var arrExpertsPush = new Array()
	if(bCheckAccess){
		for (oExpert in xarrExperts){
			if(tools_web.check_access( oExpert.id.Value, iCurUserID )){
				arrExpertsPush.push(oExpert)
			}
		}
		xarrExperts = arrExpertsPush
	}

	switch( sExpertType )
	{
		case "with_knowledge":
			/*var sKnowledgeProfileCond = "$elem/knowledge_parts != null()";
			if( ArrayOptFirstElem( aKnowledgeParts ) != undefined )
			{
				sKnowledgeProfileCond = ArrayMerge( aKnowledgeParts, "'contains( $elem/knowledge_parts, ' + XQueryLiteral( String( This ) ) + ' )'", " or " );
			}
			xarrKnowledgeProfiles = XQuery( "for $elem in knowledge_profiles where " + sKnowledgeProfileCond + " return $elem/Fields('id', 'knowledge_parts')" );
			if( ArrayOptFirstElem( xarrKnowledgeProfiles ) != undefined )
			{
				col_conds.push( "some $elem_p in positions satisfies  ( $elem_p/basic_collaborator_id = $elem/id and MatchSome( $elem_p/knowledge_profile_id, ( " + ArrayMerge( xarrKnowledgeProfiles, "This.id", "," ) + " ) ) )" );
				if( sSearch != "" )
				{
					col_conds.push( "doc-contains( $elem/id, 'wt_data', " + XQueryLiteral( sSearch ) + " )" );
				}
				xarrCollaborators = XQuery( "for $elem in collaborators where " + ArrayMerge( col_conds, "This", " and " ) + " order by $elem/id return $elem/Fields('id', 'fullname', 'position_name')" );
			}*/
			acquaint_conds.push( "$elem/person_id != null()" );
			acquaint_conds.push( "$elem/state_id = 'active'" );
			acquaint_conds.push( "( $elem/confirmation_date != null() and $elem/confirmation_date < " + XQueryLiteral( Date() ) + " )" );
			acquaint_conds.push( "( $elem/finish_date = null() or $elem/finish_date > " + XQueryLiteral( Date() ) + " )" );
			if( ArrayOptFirstElem( aKnowledgeParts ) != undefined )
			{
				acquaint_conds.push( "MatchSome( $elem/knowledge_part_id, ( " + ArrayMerge( aKnowledgeParts, "This", "," ) + " ) )" );
			}
			xarrKnowledgeAcquaints = ArrayDirect( XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( acquaint_conds, "This", " and " ) + " order by $elem/person_id return $elem/Fields( 'person_id', 'person_fullname', 'person_position_name', 'knowledge_part_name' )" ) );
			break;
		case "with_expert_level":
			acquaint_conds.push( "some $elem_kp in knowledge_parts satisfies  ( $elem_kp/id = $elem/knowledge_part_id and ( $elem_kp/expertise_level_index = null() or $elem/level_index >= $elem_kp/expertise_level_index ) )" );
			acquaint_conds.push( "$elem/person_id != null()" );
			acquaint_conds.push( "$elem/state_id = 'active'" );
			acquaint_conds.push( "( $elem/confirmation_date != null() and $elem/confirmation_date < " + XQueryLiteral( Date() ) + " )" );
			acquaint_conds.push( "( $elem/finish_date = null() or $elem/finish_date > " + XQueryLiteral( Date() ) + " )" );
			if( ArrayOptFirstElem( aKnowledgeParts ) != undefined )
			{
				acquaint_conds.push( "MatchSome( $elem/knowledge_part_id, ( " + ArrayMerge( aKnowledgeParts, "This", "," ) + " ) )" );
			}
			xarrKnowledgeAcquaints = ArrayDirect( XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( acquaint_conds, "This", " and " ) + " order by $elem/person_id return $elem/Fields( 'person_id', 'person_fullname', 'person_position_name', 'knowledge_part_name' )" ) );
			
			break;
	}
	
	arrResults = ArrayUnion( xarrExperts, xarrCollaborators, xarrKnowledgeAcquaints );
	arrResults = ArraySelectDistinct( arrResults, "This.Name == 'expert' ? ( This.type == 'collaborator' ? This.person_id : This.id ) : This.Name == 'collaborator' ? This.id :  This.person_id" );
	arrResults = ArraySort( arrResults, "This.Name == 'collaborator' ? This.fullname : This.Name == 'expert' ? This.name :  This.person_fullname", "-" );
	arrResults = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ arrResults, oPaging, null ] ).oResult;
	
	if( ArrayOptFirstElem( arrResults ) == undefined )
	{
		return oRes;
	}
	xarrKnowledgeParts = new Array();
	if( ArrayOptFirstElem( xarrExperts ) != undefined )
	{
		xarrKnowledgeParts = ArrayDirect( XQuery( "for $elem in knowledge_parts where " + ArrayMerge( xarrExperts, "'contains( $elem/experts, ' + XQueryLiteral( String( This ) ) + ' )'", " or " ) + " return $elem/Fields('id', 'name', 'experts')" ) );
	}
	if( sExpertType == "with_knowledge" )
	{
		xarrPositions = ArrayDirect( XQuery( "for $elem_qc in positions where MatchSome($elem_qc/basic_collaborator_id, (" + ArrayMerge( arrResults, "This.Name == 'expert' ? ( This.type == 'collaborator' ? This.person_id : 0 ) : This.Name == 'collaborator' ? This.id :  This.person_id", "," ) + ")) order by $elem_qc/basic_collaborator_id return $elem_qc/Fields('id','knowledge_profile_id','basic_collaborator_id')" ) );
		xarrPositions = ArraySelect( xarrPositions, "This.knowledge_profile_id.HasValue" );
		if( ArrayOptFirstElem( xarrPositions ) != undefined )
		{
			xarrKnowledgeProfiles = ArrayDirect( XQuery( "for $elem in knowledge_profiles where MatchSome( $elem/id, ( " + ArrayMerge( ArraySelectDistinct( xarrPositions, "This.knowledge_profile_id" ), "This.knowledge_profile_id", "," ) + " ) ) and $elem/knowledge_parts != null() order by $elem/id return $elem/Fields('id', 'knowledge_parts')" ) );
			if( ArrayOptFirstElem( xarrKnowledgeProfiles ) != undefined )
			{
				xarrKnowledgeParts = ArrayUnion( xarrKnowledgeParts, XQuery( "for $elem_qc in knowledge_parts where MatchSome($elem_qc/id, (" + ArrayMerge( xarrKnowledgeProfiles, "StrReplace( This.knowledge_parts, ';', ',' )", "," ) + ")) return $elem_qc/Fields('id','name','experts')" ) );
			}
		}
	}
	xarrKnowledgeParts = ArraySort( xarrKnowledgeParts, "This.id", "+" );
	
	for( _expert in arrResults )
	{
		oExpert = new Object();
		switch( _expert.Name )
		{
			case "expert":
				oExpert.id = _expert.id.Value;
				oExpert.person_id = _expert.person_id.Value;
				oExpert.fullname = _expert.name.Value;
				oExpert.position_name = "";
				oExpert.knowledge = get_knowledges( _expert.id, oExpert.person_id );
				if( _expert.type == "collaborator" )
				{
					fePerson = _expert.person_id.OptForeignElem;
					if( fePerson != undefined )
					{
						oExpert.position_name = fePerson.position_name.Value;
					}
				}
				oExpert.link = tools_web.get_mode_clean_url( null, _expert.id );
				oExpert.image = get_object_image_url( _expert );
				break;
				
			case "collaborator":
				oExpert.id = _expert.id.Value;
				oExpert.person_id = _expert.id.Value;
				oExpert.fullname = RValue( _expert.fullname );
				oExpert.position_name = _expert.position_name.Value;
				oExpert.knowledge = get_knowledges( null, oExpert.id );
			
				oExpert.link = tools_web.get_mode_clean_url( null, _expert.id );
				oExpert.image = get_object_image_url( _expert );
				break;
			case "knowledge_acquaint":
				oExpert.id = _expert.person_id.Value;
				oExpert.person_id = _expert.person_id.Value;
				oExpert.fullname = RValue( _expert.person_fullname );
				oExpert.position_name = _expert.person_position_name.Value;
				oExpert.knowledge = get_knowledges( null, oExpert.id );
			
				oExpert.link = tools_web.get_mode_clean_url( null, _expert.person_id );
				oExpert.image = tools_web.get_object_source_url( 'person', _expert.person_id );;
				break;
		
		}
		oRes.array.push( oExpert );
	}
	return oRes;
}

/**
 * @typedef {Object} WTKnowledgeObjectsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oKnowledgeObject[]} array
*/
/**
 * @typedef {Object} oKnowledgeObject
 * @property {bigint} id
 * @property {string} object_name
 * @property {string} catalog
 * @property {string} catalog_name
 * @property {string} knowledge
 * @property {string} image
 * @property {string} link
 * @property {string} desc
 * @property {string} comment
*/
/**
 * @function GetKnowledgeObjects
 * @memberof Websoft.WT.Knowledge
 * @description Получить объектов в карте знаний
 * @param {string[]} [aObjectType] - Массив типов объектов
 * @param {string} [sSearch] - Строка для поиска
 * @param {bigint[]} [aKnowledgeParts] - Масcив значений карты знаний
 * @param {boolean} [bShowWithoutSearchParams=true] - Показывать результаты без параметров поиска
 * @param {oSort} oSort - Информация из рантайма о сортировке.
 * @param {oPaging} oPaging - Информация из рантайма о пейджинге.
 * @param {bigint} [iUserID] - Идентификатор текущего сотрудника.
 * @param {boolean} [bUseLevel=false] - Учитывать уровни
 * @param {boolean} [bUseActivity=false] - Учитывать активности
 * @returns {WTKnowledgeObjectsResult[]}
 */

function GetKnowledgeObjects( aObjectType, sSearch, aKnowledgeParts, bShowWithoutSearchParams, oSort, oPaging, iUserID, bUseLevel, bUseActivity )
{
	return get_knowledge_objects( aObjectType, sSearch, aKnowledgeParts, bShowWithoutSearchParams, oSort, oPaging, iUserID, bUseLevel, bUseActivity );
}
function get_knowledge_objects( aObjectType, sSearch, aKnowledgeParts, bShowWithoutSearchParams, oSort, oPaging, iUserID, bUseLevel, bUseActivity )
{
	function set_error( iError, sErrorText )
	{
		oRes.error = iError;
		oRes.errorText = sErrorText;
	}

	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.paging = oPaging;
	oRes.array = [];

	try
	{
		if( !IsArray( aObjectType ) )
			throw "error";
	}
	catch( ex )
	{
		aObjectType = ArrayExtract( common.knowledge_parts_objects, "This.PrimaryKey" );
	}
	try
	{
		if( !IsArray( aKnowledgeParts ) )
			throw "error";
		aKnowledgeParts = ArraySelect( aKnowledgeParts, "OptInt( This ) != undefined" );
	}
	catch( ex )
	{
		aKnowledgeParts = [];
	}
	try
	{
		if( sSearch == undefined || sSearch == null )
			throw "error";
		sSearch = String( sSearch );
	}
	catch ( err )
	{
		sSearch = "";
	}
	try
	{
		if( bShowWithoutSearchParams == undefined || bShowWithoutSearchParams == null )
			throw "error";
		bShowWithoutSearchParams = tools_web.is_true( bShowWithoutSearchParams );
	}
	catch ( err )
	{
		bShowWithoutSearchParams = true;
	}
	try
	{
		if( bUseLevel == undefined || bUseLevel == null )
			throw "error";
		bUseLevel = tools_web.is_true( bUseLevel );
	}
	catch ( err )
	{
		bUseLevel = false;
	}
	try
	{
		if( bUseActivity == undefined || bUseActivity == null )
			throw "error";
		bUseActivity = tools_web.is_true( bUseActivity );
	}
	catch ( err )
	{
		bUseActivity = false;
	}
	try
	{
		if( bUseUserKnowledge == undefined || bUseUserKnowledge == null )
			throw "error";
		bUseUserKnowledge = tools_web.is_true( bUseUserKnowledge );
	}
	catch ( err )
	{
		bUseUserKnowledge = true;
	}
	if( bUseLevel || bUseActivity )
	{
		try
		{
			iUserID = Int( iUserID );
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = i18n.t( 'peredannekorre_1' );
			return oRes;
		}
	}
	if( !bShowWithoutSearchParams && sSearch == "" && ArrayOptFirstElem( aKnowledgeParts ) == undefined )
	{
		return oRes
	}
	var xarrKnowledgeAcquaints = new Array();
	if( bUseLevel )
	{
		xarrKnowledgeAcquaints = XQuery( "for $elem in knowledge_acquaints where $elem/person_id = " + iUserID + " and MatchSome( $elem/state_id, ( 'active' ) ) and ( $elem/finish_date = null() or $elem/finish_date > " + XQueryLiteral( Date() ) + " ) order by $elem/level_index descending return $elem/Fields('knowledge_part_id','level_index')" );
	}
	var xarrLearnings = new Array();
	var xarrTestLearnings = new Array();
	var xarrViewingLibraryMaterials = new Array();
	var xarrPollResults = new Array();
	var xarrEventCollaborators = new Array();
	var xarrEventResults = new Array();
	if( bUseActivity )
	{
		xarrLearnings = XQuery( "for $elem in learnings where $elem/state_id = 4 and $elem/person_id = " + iUserID + " return $elem/Fields( 'course_id' )" );
		xarrTestLearnings = XQuery( "for $elem in test_learnings where $elem/state_id = 4 and $elem/person_id = " + iUserID + " return $elem/Fields( 'assessment_id' )" );
		xarrPollResults = XQuery( "for $elem in poll_results where $elem/is_done = true() and $elem/person_id = " + iUserID + " return $elem/Fields( 'poll_id' )" );
		xarrViewingLibraryMaterials = XQuery( "for $elem in library_material_viewings where $elem/state_id = 4 and $elem/person_id = " + iUserID + " return $elem/Fields( 'material_id' )" );
		xarrEventCollaborators = XQuery( "for $elem in event_collaborators where $elem/status_id = 'close' and $elem/collaborator_id = " + iUserID + " return $elem/Fields( 'event_id', 'education_method_id' )" );
		xarrEventResults = XQuery( "for $elem in event_results where $elem/is_assist = true() and $elem/person_id = " + iUserID + " return $elem/Fields( 'event_id' )" );
		
	}

	conds = new Array();
	if( ArrayOptFirstElem( aKnowledgeParts ) != undefined )
	{
		conds.push( "MatchSome( $elem/knowledge_part_id, ( " + ArrayMerge( aKnowledgeParts, "This", "," ) + " ) )" );
	}
	conds.push( "MatchSome( $elem/catalog, ( " + ArrayMerge( aObjectType, "XQueryLiteral( String( This ) )", "," ) + " ) )" );
	//alert("for $elem in knowledge_objects where " + ArrayMerge( conds, "This", " and " ) + " return $elem" )
	
	var sCondSort = " order by $elem/object_name";
	if(ObjectType(oSort) == 'JsObject' && oSort.FIELD != null && oSort.FIELD != undefined && oSort.FIELD != "" )
	{
		switch(oSort.FIELD)
		{
			case "knowledge":
			case "comment":
			case "desc":
				break;
			default:
				sCondSort = " order by $elem/" + oSort.FIELD + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "") ;
		}
	}
	
	
	xarrAllKnowledgeObjects = XQuery( "for $elem in knowledge_objects where " + ArrayMerge( conds, "This", " and " ) + sCondSort + " return $elem" );
	
	if( bUseLevel )
	{
		var xarrTempAllKnowledgeObjects = xarrAllKnowledgeObjects;
		xarrAllKnowledgeObjects = new Array();
		for( _ko in xarrTempAllKnowledgeObjects )
		{
			if( _ko.target_level_index.HasValue )
			{
				catUserKnowledgeAcquaint = ArrayOptFindByKey( xarrKnowledgeAcquaints, _ko.knowledge_part_id, "knowledge_part_id" );
				if( catUserKnowledgeAcquaint != undefined && catUserKnowledgeAcquaint.level_index.HasValue && catUserKnowledgeAcquaint.level_index >= _ko.target_level_index )
				{
					continue;
				}
			}
			xarrAllKnowledgeObjects.push( _ko );
		}
	}
	xarrKnowledgeObjects = ArraySelectDistinct( xarrAllKnowledgeObjects, "This.object_id" );
	if( ArrayOptFirstElem( aKnowledgeParts ) != undefined )
	{
		xarrAllKnowledgeObjects = XQuery( "for $elem in knowledge_objects where MatchSome( $elem/object_id, ( " + ArrayMerge( xarrKnowledgeObjects, "This.object_id", "," ) + " ) ) return $elem" );
	}
	if( sSearch != "" )
	{
		object_conds = new Array();
		object_conds.push( "doc-contains( $elem/id, 'wt_data', " + XQueryLiteral( sSearch ) + " )" );
		xarrTmpObjects = new Array();
		for( _object_type in aObjectType )
		{
			xarrTmpObjects = ArrayUnion( xarrTmpObjects, XQuery( "for $elem in " + _object_type + "s where " + ArrayMerge( object_conds, "This", " and " ) + " return $elem/Fields('id')" ) )
		}
		xarrKnowledgeObjects = ArrayIntersect( xarrKnowledgeObjects, xarrTmpObjects, "This.object_id", "This.id" );
	}


	function get_knowledges( _object_id )
	{
		return ArrayMerge( ArraySelect( xarrAllKnowledgeObjects, "This.object_id == _object_id" ), "This.knowledge_part_name", ", " );
	}
	
	if ( ObjectType( oPaging ) == 'JsObject' && oPaging.SIZE != null )
	{
		oPaging.MANUAL = true;
		oPaging.TOTAL = ArrayCount( xarrKnowledgeObjects );
		oRes.paging = oPaging;
		xarrKnowledgeObjects = ArrayRange( xarrKnowledgeObjects, OptInt( oPaging.INDEX, 0 ) * oPaging.SIZE, oPaging.SIZE );
	}
	
	for( _object in xarrKnowledgeObjects )
	{
		if( bUseActivity )
		{
			switch( _object.catalog )
			{
				case "course":
					if( ArrayOptFindByKey( xarrLearnings, _object.object_id, "course_id" ) != undefined )
					{
						continue;
					}
					break;
				case "assessment":
					if( ArrayOptFindByKey( xarrTestLearnings, _object.object_id, "assessment_id" ) != undefined )
					{
						continue;
					}
					break;
				case "library_material":
					if( ArrayOptFindByKey( xarrViewingLibraryMaterials, _object.object_id, "material_id" ) != undefined )
					{
						continue;
					}
					break;
				case "poll":
					if( ArrayOptFindByKey( xarrPollResults, _object.object_id, "poll_id" ) != undefined )
					{
						continue;
					}
					break;
				case "education_method":
					bContinue = false;
					for( _ec  in ArraySelectByKey( xarrEventCollaborators, _object.object_id, "education_method_id" ) )
					{
						if( ArrayOptFindByKey( xarrEventResults, _ec.event_id, "event_id" ) != undefined )
						{
							bContinue = true;
							break;
						}
					}
					if( bContinue )
					{
						continue;
					}
					break;
			}
			
		}
		oObject = new Object();
		oObject.id = _object.object_id.Value;
		oObject.object_name = _object.object_name.Value;
		oObject.catalog = _object.catalog.Value;
		oObject.catalog_name = ( _object.catalog == "education_method" ? i18n.t( 'trening' ) : common.exchange_object_types.GetOptChildByKey( _object.catalog ).title.Value );
		oObject.knowledge = get_knowledges( _object.object_id );
		oObject.desc = "";
		oObject.comment = "";
		oObject.link = tools_web.get_mode_clean_url( null, _object.object_id );
		feObject = undefined;
		oObject.image = "";
		switch( _object.catalog )
		{
			case "collaborator":
				oObject.image = tools_web.get_object_source_url( 'person', _object.object_id );
				fePerson = _object.object_id.OptForeignElem;
				if( fePerson != undefined )
				{
					oObject.desc =  fePerson.position_name.Value + ( fePerson.position_name.HasValue && fePerson.position_parent_name.HasValue ? ", " : "" ) + fePerson.position_parent_name.Value;
				}
				break;
			case "blog":
				feObject = tools.open_doc(_object.object_id).TopElem;
				if (feObject.resource_id.HasValue)
				{
					oObject.image = tools_web.get_object_source_url('resource', feObject.resource_id.Value);
				}
				else if (feObject.authors.ChildExists('author') && feObject.authors.ChildNum == 1)
				{
					fldAutor = ArrayOptFirstElem(feObject.authors);
					sPersonUrl = (fldAutor.person_id.HasValue) ? tools_web.get_object_source_url('person', fldAutor.person_id.Value) : '';
					if (sPersonUrl != '')
					{
						oObject.image = sPersonUrl;
					}
				}
				oObject.type = feObject.type.Value;
				oObject.comment = feObject.comment.Value;
				oObject.desc = feObject.desc.Value;
				break;
			case "expert":
				feObject = _object.object_id.OptForeignElem;
				if( feObject.type == "collaborator" )
				{
					oObject.image = tools_web.get_object_source_url( 'person', feObject.person_id );
					fePerson = _object.object_id.OptForeignElem;
					if( fePerson != undefined )
					{
						oObject.desc =  fePerson.position_name.Value + ( fePerson.position_name.HasValue && fePerson.position_parent_name.HasValue ? ", " : "" ) + fePerson.position_parent_name.Value;
					}
					break;
				}
			default:
			{
				feObject = tools.open_doc(_object.object_id).TopElem;
				if( feObject.ChildExists( "resource_id" ) && feObject.resource_id.HasValue )
				{
					oObject.image = tools_web.get_object_source_url( 'resource', feObject.resource_id );
				}
				if(feObject.ChildExists("comment"))
					oObject.comment = feObject.comment.Value;
				if(feObject.ChildExists("desc"))
					oObject.desc = feObject.desc.Value;
			}

		}
		oRes.array.push( oObject );
	}
	return oRes;
}

function action_object_knowledge_parts( sCommand, iObjectID, iPersonID, SCOPE_WVARS )
{
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
		iKnowledgeClassifierID = OptInt( SCOPE_WVARS.GetOptProperty( "knowledge_classifier_id" ) );
	}
	catch( ex )
	{
		iKnowledgeClassifierID = undefined
	}
	try
	{
		iKnowledgePartID = OptInt( SCOPE_WVARS.GetOptProperty( "knowledge_part_id" ) );
	}
	catch( ex )
	{
		iKnowledgePartID = undefined
	}
	try
	{
		iObjectID = Int( iObjectID );
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid' ) };
		return oRes;
	}
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_1' ) };
		return oRes;
	}

	function add_level_fields( _knowledge_part_id, te_knowledge_part, _cat_kp )
	{
		_knowledge_part_id = OptInt( _knowledge_part_id );
		if( _knowledge_part_id == undefined )
		{
			return false;
		}
		try
		{
			te_knowledge_part.Name;
		}
		catch( ex )
		{
			try
			{
				te_knowledge_part = OpenDoc( UrlFromDocID( _knowledge_part_id ) ).TopElem;
			}
			catch( err )
			{
				return false;
			}
		}
		try
		{
			_cat_kp.knowledge_part_id;
		}
		catch( ex )
		{
			_cat_kp = undefined;
		}
		if( ArrayOptFirstElem( te_knowledge_part.levels ) != undefined )
		{
			obj = { name: "current_level_id", label: i18n.t( 'vyberitetekushi' ), type: "select", value: ( _cat_kp != undefined ? _cat_kp.current_level_id : "" ), mandatory: true, validation: "nonempty", entries: [] };
			for( _level in te_knowledge_part.levels )
				obj.entries.push( { name: _level.name.Value, value: _level.id.Value } );
			oRes.action_result.form_fields.push( obj );

			obj = { name: "target_level_id", label: i18n.t( 'vyberitecelevo' ), type: "select", value: ( _cat_kp != undefined ? _cat_kp.target_level_id : "" ), mandatory: true, validation: "nonempty", entries: [] };
			for( _level in te_knowledge_part.levels )
				obj.entries.push( { name: _level.name.Value, value: _level.id.Value } );
			oRes.action_result.form_fields.push( obj );
		}
	}

	oItem = tools.read_object( SCOPE_WVARS.GetOptProperty( "_ITEM_", "{}" ) );
	if( iKnowledgePartID == undefined )
	{
		try
		{
			iKnowledgePartID = OptInt( oItem.GetOptProperty( "id" ) );
		}
		catch( ex )
		{
			iKnowledgePartID == undefined;
		}
	}

	sAction = SCOPE_WVARS.GetOptProperty( "action" );
	sDesc = "";
	switch( sAction )
	{
		case "edit":
		case "add":
		{
			switch( sCommand )
			{
				case "eval":
					sKnowledgeName = "";
					catKp = undefined;
					if( sAction == "edit" )
					{
						if( iKnowledgePartID == undefined )
						{
							oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_2' ) };
							return oRes;
						}

						teObject = OpenDoc( UrlFromDocID( iObjectID ) ).TopElem;
						catKp = teObject.knowledge_parts.ObtainChildByKey( iKnowledgePartID );
						if( catKp != undefined )
						{
							sDesc = catKp.desc.Value;
							sKnowledgeName = catKp.knowledge_part_name.Value;
						}
					}

					oRes.action_result = { 	command: "display_form",
								title: i18n.t( 'ukazhitevashizna' ),
								header: i18n.t( 'ukazhitevashizna' ),
								form_fields: [] };
					if( sAction == "edit" )
					{
						oRes.action_result.form_fields.push( { name: "knowledge_part_name", label: i18n.t( 'vyberiteoblast' ), type: "paragraph",  value: sKnowledgeName} );
						oRes.action_result.form_fields.push( { name: "knowledge_part_id", label: i18n.t( 'vyberiteoblast' ), type: "hidden",  value: iKnowledgePartID} );
						add_level_fields( iKnowledgePartID, null, catKp );
					}
					else
					{
						if( iKnowledgeClassifierID == undefined )
						{
							oRes.action_result.form_fields.push( { name: "knowledge_part_id", label: i18n.t( 'vyberiteoblast' ), type: "foreign_elem", catalog_name: "knowledge_part", value: "",  mandatory: true, validation: "nonempty" } );
						}
						else
						{
							obj = { name: "knowledge_part_id", label: i18n.t( 'vyberiteoblast' ), type: "select", value: "", mandatory: true, validation: "nonempty", entries: [] };
							for( _kp in XQuery( "for $elem in knowledge_parts where $elem/knowledge_classifier_id = " + iKnowledgeClassifierID + " return $elem/Fields('id', 'name')" ) )
								obj.entries.push( { name: _kp.name.Value, value: _kp.id.Value } );
							oRes.action_result.form_fields.push( obj );
						}
					}
					oRes.action_result.form_fields.push( { name: "desc", label: i18n.t( 'opishitesvoyuro' ), type: "text", value: sDesc,  mandatory: true, validation: "nonempty" } );
					break;

				case "submit_form":
					oFormFields = null;
					var form_fields = SCOPE_WVARS.GetOptProperty( "form_fields", "" )
					if ( form_fields != "" )
						oFormFields = ParseJson( form_fields );
					docObject = OpenDoc( UrlFromDocID( iObjectID ) );
					teKnowledgePart = null;
					for( _field in oFormFields )
					{
						switch( _field.name )
						{
							case "knowledge_part_id":
							{
								iKnowledgePartID = OptInt( _field.value );
								if( iKnowledgePartID == undefined )
								{
									oRes.action_result = { command: "alert", msg: i18n.t( 'neobhodimovybr' ) };
									return oRes;
								}
								break;
							}
							case "desc":
							{
								sDesc = _field.value;
								break;
							}
						}
					}
					catKp = docObject.TopElem.knowledge_parts.GetOptChildByKey( iKnowledgePartID );
					if( catKp == undefined )
					{
						catKp = docObject.TopElem.knowledge_parts.ObtainChildByKey( iKnowledgePartID );
						teKnowledgePart = OpenDoc( UrlFromDocID( iKnowledgePartID ) ).TopElem;
						catKp.knowledge_part_name = teKnowledgePart.name.Value;
						catKp.require_acknowledgement = teKnowledgePart.require_acknowledgement;
					}

					if( ArrayOptFind( oFormFields, "This.name == 'current_level_id'" ) == undefined )
					{
						oRes.action_result = { 	command: "display_form",
							title: i18n.t( 'ukazhiteurovniz' ),
							header: i18n.t( 'ukazhiteurovniz' ),
							form_fields: [] };
						add_level_fields( iKnowledgePartID, teKnowledgePart, catKp );
						if( ArrayOptFirstElem( oRes.action_result.form_fields ) != undefined )
						{
							oRes.action_result.form_fields.push( { name: "knowledge_part_id", label: "", type: "hidden",  value: iKnowledgePartID} );
							oRes.action_result.form_fields.push( { name: "desc", label: "", type: "hidden",  value: sDesc} );
							return oRes;
						}
					}

					for( _field in oFormFields )
					{
						if( _field.value == "" || _field.value == null )
						{
							continue;
						}
						switch( _field.name )
						{
							case "current_level_id":
							{
								if( teKnowledgePart == null )
								{
									teKnowledgePart = OpenDoc( UrlFromDocID( iKnowledgePartID ) ).TopElem;
								}
								catLevel = teKnowledgePart.levels.GetOptChildByKey( _field.value );
								if( catLevel != undefined )
								{
									catKp.current_level_id = catLevel.id.Value;
									catKp.current_level_index = catLevel.ChildIndex;
									catKp.current_level_name = catLevel.name.Value;
								}
								break;
							}
							case "target_level_id":
							{
								if( teKnowledgePart == null )
								{
									teKnowledgePart = OpenDoc( UrlFromDocID( iKnowledgePartID ) ).TopElem;
								}
								catLevel = teKnowledgePart.levels.GetOptChildByKey( _field.value );
								if( catLevel != undefined )
								{
									catKp.target_level_id = catLevel.id.Value;
									catKp.target_level_index = catLevel.ChildIndex;
									catKp.target_level_name = catLevel.name.Value;
								}
								break;
							}
						}
					}
					catKp.desc = sDesc;

					try
					{
						docObject.Save();
					}
					catch ( err )
					{
						oRes.action_result = { command: "alert", msg: String( err ) };
						break;
					}
					oRes.action_result = { command: "close_form", msg: i18n.t( 'izmeneniyasohra' ), confirm_result: { command: "reload_page" } };
					break;
				default:
					oRes.action_result = { command: "alert", msg: i18n.t( 'neizvestnayakom' ) };
					break;
			}
			break;
		}
		case "delete":
			switch( sCommand )
			{
				case "eval":

					oRes.action_result = { 	command: "display_form",
							title: i18n.t( 'udalenieznachen' ),
							header: i18n.t( 'udalenieznachen' ),
							form_fields: [] };
					oRes.action_result.form_fields.push( { name: "knowledge_part_name", label: "", type: "paragraph",  value: i18n.t( 'dannoeznachenie' )} );
					break;

				case "submit_form":

					docObject = OpenDoc( UrlFromDocID( iObjectID ) );
					docObject.TopElem.knowledge_parts.DeleteChildByKey( iKnowledgePartID );
					docObject.Save();
					oRes.action_result = { command: "close_form", msg: i18n.t( 'znacheniekartyz' ), confirm_result: { command: "reload_page" } };
					break;

			}
	}
	return oRes;
}

/**
 * @typedef {Object} AcquaintContext
 * @property {bool} bHasActiveAcquaint – Есть неподтвержденное назначенное ознакомление.
 * @property {bool} bHasAcquaint – Есть назначенное ознакомление.
*/
/**
 * @typedef {Object} ReturnAcquaintContextContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {AcquaintContext} context – Контекст объекта по ознакомлению.
*/
/**
 * @function GetAcquaintContext
 * @memberof Websoft.WT.Knowledge
 * @description Получение контекста объекта по ознакомлению.
 * @param {bigint} iObjectID - ID объекта.
 * @returns {ReturnAcquaintContextContext}
*/
function GetAcquaintContext( iObjectID, iUserID )
{
	return get_acquaint_context( iObjectID, null, iUserID );
}
function get_acquaint_context( iObjectID, teObject, iUserID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = new Object;

	try
	{
		iObjectID = Int( iObjectID )
	}
	catch ( err )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iObjectID' }";
		return oRes;
	}
	try
	{
		iUserID = Int( iUserID )
	}
	catch ( err )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iUserID' }";
		return oRes;
	}

	xarrAssignAcquaints = XQuery( "for $elem in acquaint_assigns where $elem/object_id = " + iObjectID + " and $elem/person_id = " + iUserID + " return $elem/Fields('id', 'state_id')" );

	var oContext = {
		bHasActiveAcquaint: ( ArrayOptFind( xarrAssignAcquaints, "This.state_id == 'assign' || This.state_id == 'active'" ) != undefined ),
		bHasAcquaint: ( ArrayOptFirstElem( xarrAssignAcquaints ) != undefined )
	};
	oRes.context = oContext;

	return oRes;
}
/**
 * @function ConfirmAcquaint
 * @memberof Websoft.WT.Knowledge
 * @author PL
 * @description Подтверждение ознакомления.
 * @param {bigint} iObjectID - ID объекта
 * @param {bigint} iPersonID - ID сотрудника
 * @param {WTScopeWvars} SCOPE_WVARS - JSON объект с параметрами удаленного действия
 * @returns {WTLPEFormResult}
*/
function ConfirmAcquaint( iObjectID, iPersonID, SCOPE_WVARS )
{
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
	
	iObjectID = OptInt( iObjectID );
	
	if(iObjectID == undefined)
	{
		oItem = tools.read_object( SCOPE_WVARS.GetOptProperty( "_ITEM_", "{}" ) );
		iObjectID = OptInt( oItem.GetOptProperty( "id" ) );
	}
	
	if(iObjectID == undefined)
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid' ) };
		return oRes;
	}
	
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_1' ) };
		return oRes;
	}
	
	try
	{
		sCommand = SCOPE_WVARS.GetOptProperty( "command" );
	}
	catch( ex )
	{
		sCommand = null;
	}
	
	sQuery = "for $elem in acquaint_assigns where $elem/object_id = " + iObjectID + " and $elem/person_id = " + iPersonID + " and $elem/state_id != 'familiar' return $elem";
	catAcquainAssign = ArrayOptFirstElem( XQuery( sQuery ) );
	if( catAcquainAssign == undefined )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'usotrudnikanet' ) };
		return oRes;
	}
	docAcquaintAssignDoc = OpenDoc( UrlFromDocID( catAcquainAssign.id ) );
	docAcquaintAssign = docAcquaintAssignDoc.TopElem;
	if( docAcquaintAssign.acquaint_id.HasValue )
		docAcquaint = teCheckedObject = OpenDoc( UrlFromDocID( Int( docAcquaintAssign.acquaint_id ) ) ).TopElem;
	else
		teCheckedObject = OpenDoc( UrlFromDocID( Int( docAcquaintAssign.object_id ) ) ).TopElem;
	
	if( docAcquaintAssignDoc.TopElem.state_id == "assign" )
	{
		docAcquaintAssignDoc.TopElem.state_id = "active";
		docAcquaintAssignDoc.Save();
	}
	switch( sCommand )
	{
		case "eval":
			if( teCheckedObject.ChildExists( "assessments" ) )
			{
				xarrTestLearnings = XQuery( "for $elem in test_learnings where $elem/person_id = " + docAcquaintAssign.person_id + " and $elem/state_id = 4  return $elem" );
				xarrActiveTestLearnings = XQuery( "for $elem in active_test_learnings where $elem/person_id = " + docAcquaintAssign.person_id + " and $elem/state_id = 4  return $elem" );
				arrNotLearningTests = new Array();
				for( asses in teCheckedObject.assessments )
				{
					assessment = ArrayOptFind( xarrTestLearnings, "This.assessment_id == asses.PrimaryKey" );
					if( assessment == undefined )
					{
						arrNotLearningTests.push( asses.PrimaryKey.ForeignElem.title );
						if( ArrayOptFind( xarrActiveTestLearnings, "This.assessment_id == asses.PrimaryKey" ) == undefined )
						{
							tools.activate_test_to_person( docAcquaintAssign.person_id, asses.PrimaryKey );
						}
					}
				}
				if( ArrayOptFirstElem( arrNotLearningTests ) != undefined )
				{
					oRes.action_result = { command: ( sCommand == "submit_form" ? "close_form" : "alert" ), msg: RValue( ms_tools.get_const('neobhodimoproy') + "<br/>" + ArrayMerge( arrNotLearningTests, "This", "<br/>" ) ) };
					return oRes;
				}
			}
			if( !check_questions( teCheckedObject, docAcquaintAssign ) )
			{
				oRes.action_result = { 	command: "display_form",
							title: i18n.t( 'neobhodimootve' ),
							header: i18n.t( 'neobhodimootve' ),
							form_fields: [] };

				for( _question in teCheckedObject.questions )
				{
					bItem = false;
					if( _question.item_id.HasValue )
					{
						bItem = true;
						teItem = OpenDoc( UrlFromDocID( _question.item_id ) ).TopElem;
					}
					else
						teItem = _question;
					_answer = docAcquaintAssign.questions.ObtainChildByKey( _question.id ).answer;

					switch( teItem.type_id )
					{
						case "multiple_choice":
						case "multiple_response":
							bItem = true;
						case 'choice':
						case 'combo':
						case 'select':
							field = ( { name: _question.id.Value, label: teItem.title.Value, type: ( teItem.type_id == "multiple_response" || teItem.type_id == "select" ? "list" : "select" ), mandatory: true, entries: [] } );
							for( entrie in ( bItem ? teItem.answers : teItem.entries ) )
							{
								field.entries.push( { value: entrie.id.Value, name: ( bItem ? entrie.text.Value : entrie.value.Value ) } );
							}
							oRes.action_result.form_fields.push( field );
							break;

						case "number":
						case "numerical_fill_in_blank":
							oRes.action_result.form_fields.push( { name: _question.id.Value, label: teItem.title.Value, type: "integer", mandatory: true } );
							break;
						case "gap_fill":
						case 'string':
							oRes.action_result.form_fields.push( { name: _question.id.Value, label: teItem.title.Value, type: "string", mandatory: true } );
							break;
						case 'text':
							oRes.action_result.form_fields.push( { name: _question.id.Value, label: teItem.title.Value, type: "text", mandatory: true } );
							break;
						default:
							break;

					}
				}

				break;
			}
		case "submit_form":
			if( sCommand == "submit_form" )
			{
				oFormFields = null;
				var form_fields = SCOPE_WVARS.GetOptProperty( "form_fields", "" )
				if ( form_fields != "" )
					oFormFields = ParseJson( form_fields );
				for( _field in oFormFields )
				{
					if( teCheckedObject.questions.GetOptChildByKey( _field.name ) != undefined )
					{
						if( IsArray( _field.value ) )
						{
							docAcquaintAssign.questions.ObtainChildByKey( _field.name ).answer = ArrayMerge( _field.value, "This", ";" );
						}
						else
						{
							docAcquaintAssign.questions.ObtainChildByKey( _field.name ).answer = _field.value;
						}
					}
				}
				docAcquaintAssignDoc.Save();
				if( !check_questions( teCheckedObject, docAcquaintAssign ) )
				{
					oRes.action_result = { command: "close_form", msg: RValue( ms_tools.get_const('vynenavsevopro') ) };
					return oRes;
				}
			}
			

			oRes.action_result = { command: ( sCommand == "submit_form" ? "close_form" : "alert" ), msg: RValue( ms_tools.get_const('c_form_save') ), confirm_result: { command: "reload_page" } };

			docAcquaintAssign.finish_date = Date();
			docAcquaintAssign.state_id = 'familiar';
			docAcquaintAssignDoc.Save();
			break;
		default:
			oRes.action_result = { command: "alert", msg: i18n.t( 'neizvestnayakom' ) };
			break;
	}
	return oRes;
}
function check_questions( teCheckedObject, docAcquaintAssign )
{
	bResult = true;
	for( elem in teCheckedObject.questions )
		if( !check_question( elem, docAcquaintAssign ) )
			bResult = false;
	return bResult;
}

function check_question( _question, docAcquaintAssign )
{
	bItem = false;
	if( _question.item_id.HasValue )
	{
		bItem = true;
		teItem = OpenDoc( UrlFromDocID( _question.item_id ) ).TopElem;
	}
	else
		teItem = _question;
	_answer = docAcquaintAssign.questions.ObtainChildByKey( _question.id ).answer;

	switch( teItem.type_id )
	{
		case "multiple_choice":
		case "multiple_response":
		case "select":
		case "combo":
		case "choice":
			for( entr in ( bItem ? teItem.answers : teItem.entries ) )
				if( ( entr.ChildExists( "is_correct" ) ? entr.is_correct : entr.is_correct_answer ) && !StrContains( _answer,  entr.id ) )
					return false;
			return true;

			break;

		case "number":
		case "numerical_fill_in_blank":
			cond1 = OptReal( _answer );
			if( cond1 == undefined )
				return true;
			for( cond in ( bItem ? ( ArrayOptFirstElem( teItem.answers ) != undefined ? ArrayOptFirstElem( teItem.answers ).conditions : [] ) : teItem.conditions ) )
			{
				cond2 = OptReal( cond.value );
				if( cond2 == undefined )
					continue;
				switch( cond.grading_option_id.ForeignElem.option_id )
				{
					case "eq":
						if( cond1 != cond2 )
							return false;
						break;
					case "gt":
						if( cond1 > cond2 )
							return false;
						break;
					case "lt":
						if( cond1 < cond2 )
							return false;
						break;
					case "lte":
						if( cond1 <= cond2 )
							return false;
						break;
					case "gte":
						if( cond1 >= cond2 )
							return false;
						break;
				}
			}
			return true;

		default:
			for( cond in ( bItem ? ( ArrayOptFirstElem( teItem.answers ) != undefined ? ArrayOptFirstElem( teItem.answers ).conditions : [] ) : teItem.conditions ) )
			{
				if( cond.sentence_option_id == 'equal' && cond.value != _answer )
				{
					return false;
				}
				else if( !StrContains( _answer, cond.value ) )
				{
					return false;
				}
			}
			return true;

	}

	return false;
}

/**
 * @typedef {Object} WTExpertQuestionsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oExpertQuestion[]} array
*/
/**
 * @typedef {Object} oExpertQuestion
 * @property {bigint} id
 * @property {string} question
 * @property {string} expert_fullname
 * @property {string} person_fullname
 * @property {string} status
 * @property {string} status_name
 * @property {date} date
 * @property {string} link
*/
/**
 * @function GetExpertQuestions
 * @memberof Websoft.WT.Knowledge
 * @description Получить список вопросов эксперту
 * @param {string} sTypeID - тип вопроса ( my/to_me/faq/open )
 * @param {bigint} [iPersonID] - ID сотрудника, чьи вопросы необходимо вернуть
 * @param {bigint} [iExpertID] - ID эксперта, чьи вопросы необходимо вернуть
 * @param {string} [sSearch] - Строка для поиска
 * @param {string} [sStatus] - Статус вопроса
 * @returns {WTExpertQuestionsResult[]}
 */

function GetExpertQuestions( sTypeID, iPersonID, iExpertID, sSearch, sStatus )
{
	return get_expert_questions( sTypeID, iPersonID, iExpertID, sSearch, sStatus );
}
function get_expert_questions( sTypeID, iPersonID, iExpertID, sSearch, sStatus, oPagingParam, oSortParam, iMaxLen, dDateStart, dDateFinish, arrFilters )
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
	oRes.array = [];

	try
	{
		if( sSearch == undefined || sSearch == null )
			throw "error";
		sSearch = String( sSearch );
	}
	catch ( err )
	{
		sSearch = "";
	}
	try
	{
		iPersonID = OptInt( iPersonID, null );
	}
	catch ( err )
	{
		iPersonID = null;
	}
	
	try
	{
		iExpertID = OptInt( iExpertID, null );
	}
	catch ( err )
	{
		iExpertID = null;
	}
	
	try
	{
		if( !IsArray( arrFilters ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		arrFilters = new Array();
	}
	try
	{
		if( ObjectType( oPagingParam ) != "JsObject" )
			throw "error";
	}
	catch( ex )
	{
		oPagingParam = {};
	}
	try
	{
		if( ObjectType( oSortParam ) != "JsObject" )
			throw "error";
	}
	catch( ex )
	{
		oSortParam = {};
	}
	dDateStart = OptDate( dDateStart );
	dDateFinish = OptDate( dDateFinish );
	conds = new Array();
	try
	{
		switch( sTypeID )
		{
			case "my":
				if( iPersonID == null )
				{
					set_error( 1, i18n.t( 'neperedanidsot' ), false );
					return oRes;
				}
				break;
			case "to_me":
				if( iExpertID == null )
				{
					set_error( 1, i18n.t( 'neperedanideks' ), false );
					return oRes;
				}
				break;
			case "faq":
				conds.push( "$elem/is_faq = true()" );
			case "open":
				conds.push( "$elem/is_disclosed = true()" );
				break;
			default:
				throw "error";
		}
	}
	catch ( err )
	{
		set_error( 1, i18n.t( 'neperedantip' ), false );
		return oRes;
	}
	try
	{
		if( sStatus == undefined || sStatus == null || sStatus == "" )
			throw "error";
		sStatus = tools_web.is_true( sStatus );
	}
	catch ( err )
	{
		sStatus = "";
	}
	iMaxLen = OptInt( iMaxLen );
	var sSearchExpertFullname = "";

	if( iExpertID != null )
	{
		conds.push( "$elem/expert_id = " + iExpertID );
	}
	if( iPersonID != null )
	{
		conds.push( "$elem/person_id = " + iPersonID );
	}
	if( sStatus != "" )
	{
		conds.push( "$elem/status = " + XQueryLiteral( sStatus ) );
	}
	if( sSearch != "" )
	{
		conds.push( "doc-contains( $elem/id, 'wt_data', " + XQueryLiteral( sSearch ) + " )" );
	}
	if( dDateStart != undefined )
	{
		conds.push( "$elem/date >= " + XQueryLiteral( dDateStart ) );
	}
	if( dDateFinish != undefined )
	{
		conds.push( "$elem/date < " + XQueryLiteral( dDateFinish ) );
	}
	for( _filter in arrFilters )
	{
		if( _filter.type == "search" )
		{
			if( _filter.value != "" )
			{
				conds.push( "doc-contains( $elem/id, 'wt_data', " + XQueryLiteral( String( Base64Decode( _filter.value ) ) ) + " )" );
			}
		}
		else
		{
			switch( _filter.name )
			{
				case "date":
					try
					{
						conds.push( "$elem/date >= " + XQueryLiteral( Date( _filter.value_from ) ) );
					}
					catch(ex){}
					try
					{
						conds.push( "$elem/date < " + XQueryLiteral( Date( _filter.value_to ) ) );
					}
					catch(ex){}
					break;
			}
		}
	}

	xarrExpertQuestions = XQuery( "for $elem in expert_questions where " + ArrayMerge( conds, "This", " and " ) + " order by $elem/id return $elem/Fields('id', 'person_fullname', 'question', 'date', 'status', 'expert_id', 'question_file_id', 'answer_date')" );

	function get_field_value( name, catElem )
	{
		switch( name )
		{
			case "expert_fullname":
				if( catElem.expert_id.HasValue )
				{

					catExpert = ArrayOptFindBySortedKey( arrExperts, catElem.expert_id, "id" );
					if( catExpert != undefined )
					{
						return catExpert.name.Value;
					}
				}
				return i18n.t( 'ekspertneukaza' );
			case "question_file_name":
				if( catElem.question_file_id.HasValue )
				{
					catFile = ArrayOptFindBySortedKey( arrFiles, catElem.question_file_id, "id" );
					if( catFile != undefined )
					{
						return catFile.name.Value;
					}
				}
				return "";
			case "question_file_link":
				if( catElem.question_file_id.HasValue )
				{
					return tools_web.get_object_source_url( 'resource', catElem.question_file_id );
				}
				return "";
			case "link":
				return tools_web.get_mode_clean_url( null, catElem.id );
			case "status_name":
				return catElem.status ? i18n.t( 'otvechen' ) : i18n.t( 'neotvechen' );
			case "title_status_name":
				return catElem.status ? i18n.t( 'otvetpoluchen' ) : i18n.t( 'otvetanet' );
			case "date":
				return catElem.date.HasValue ? StrDate( catElem.date,false ) : "";
			case "question":
				if( iMaxLen == undefined )
				{
					return catElem.question.Value;
				}
				else
				{
					return ( StrLen( catElem.question.Value ) > iMaxLen ? ( StrLeftCharRange( catElem.question.Value, iMaxLen ) + "..." ) : catElem.question.Value );
				}
			default:
				return RValue( GetObjectProperty( catElem, name ) );
		}
		return "";
	}
	if( ArrayOptFirstElem( xarrExpertQuestions ) != undefined )
	{
		arrExperts = new Array();
		if( ArrayOptFind( xarrExpertQuestions, "This.expert_id.HasValue" ) != undefined )
		{
			arrExperts = ArrayDirect( XQuery( "for $elem in experts where MatchSome( $elem/id, ( " + ArrayMerge( ArraySelectDistinct( ArraySelect( xarrExpertQuestions, "This.expert_id.HasValue" ), "This.expert_id" ), "This.expert_id", "," ) + " ) ) order by $elem/id return $elem/Fields('id', 'name')" ) );
		}
		arrFiles = new Array();
		if( ArrayOptFind( xarrExpertQuestions, "This.question_file_id.HasValue" ) != undefined )
		{
			arrFiles = ArrayDirect( XQuery( "for $elem in resources where MatchSome( $elem/id, ( " + ArrayMerge( ArraySelectDistinct( ArraySelect( xarrExpertQuestions, "This.question_file_id.HasValue" ), "This.question_file_id" ), "This.question_file_id", "," ) + " ) ) order by $elem/id return $elem/Fields('id', 'name')" ) );
		}
		if( oSortParam.GetOptProperty( "FIELD", null ) != null && oSortParam.GetOptProperty( "DIRECTION", null ) != null )
		{
			xarrExpertQuestions = ArraySort( xarrExpertQuestions, "get_field_value( '" + oSortParam.FIELD + "', This )", ( oSortParam.DIRECTION == "ASC" ? "+" : "-" ) );
		}
		if( OptInt( oPagingParam.GetOptProperty( "SIZE" ), null ) != null )
		{
			xarrExpertQuestions = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ xarrExpertQuestions, oPagingParam, null ] ).oResult;
		}

		for( _expert_question in xarrExpertQuestions )
		{

			oObject = new Object();
			oObject.id = get_field_value( "id", _expert_question );

			oObject.person_fullname = get_field_value( "person_fullname", _expert_question );
			oObject.question = get_field_value( "question", _expert_question );
			oObject.date = get_field_value( "date", _expert_question );
			oObject.answer_date = get_field_value( "answer_date", _expert_question );
			oObject.status = get_field_value( "status", _expert_question );
			oObject.status_name = get_field_value( "status_name", _expert_question );
			oObject.title_status_name = get_field_value( "title_status_name", _expert_question );
			oObject.expert_fullname = get_field_value( "expert_fullname", _expert_question );

			oObject.question_file_name = get_field_value( "question_file_name", _expert_question );
			oObject.question_file_link = get_field_value( "question_file_link", _expert_question );

			oObject.link = get_field_value( "link", _expert_question );
			oRes.array.push( oObject );
		}
	}
	for( _filter in arrFilters )
	{
		if( _filter.type == "search" )
		{
			continue;
		}
		else
		{
			switch( _filter.name )
			{
				case "title_status_name":
					try
					{
						conds = new Array();
						for( _value in _filter.value )
						{
							conds.push( "This.title_status_name == " + XQueryLiteral( String( Base64Decode( _value.value ) ) ) );
						}
						if( ArrayOptFirstElem( conds ) != undefined )
						{
							oRes.array = ArraySelect( oRes.array, ArrayMerge( conds, "This", " or " ) );
						}
					}
					catch( ex ){}
					break;
				case "expert_fullname":
					try
					{
						conds = new Array();
						for( _value in _filter.value )
						{
							conds.push( "This.expert_fullname == " + XQueryLiteral( String( Base64Decode( _value.value ) ) ) );
						}
						if( ArrayOptFirstElem( conds ) != undefined )
						{
							oRes.array = ArraySelect( oRes.array, ArrayMerge( conds, "This", " or " ) );
						}
					}
					catch( ex ){}
					break;
			}
		}
	}
	return oRes;
}

function lp_create_expert_question( sCommand, iPersonID, tePerson, SCOPE_WVARS, iExpertQuestionID, bNotifyExpert, iNotificationExpert, bNotifyCollaborator, iNotificationCollaborator )
{
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
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_1' ) };
		return oRes;
	}

	try
	{
		iExpertQuestionID = Int( iExpertQuestionID );
	}
	catch( ex )
	{
		iExpertQuestionID = null;
	}
	var teExpertQuestion = null;
	var expertQuestionDoc = null;
	if( iExpertQuestionID != null )
	{
		try
		{
			expertQuestionDoc = OpenDoc( UrlFromDocID( iExpertQuestionID ) );
			teExpertQuestion = expertQuestionDoc.TopElem;
		}
		catch( ex )
		{
			oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_3' ) };
			return oRes;
		}
		feExpert = teExpertQuestion.expert_id.OptForeignElem;
		if( feExpert == undefined || feExpert.person_id != iPersonID )
		{
			oRes.action_result = { command: "alert", msg: i18n.t( 'vyneimeeteprav' ) };
			return oRes;
		}
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
				oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_1' ) };
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

	bNotifyExpert = SCOPE_WVARS.GetOptProperty( "bNotifyExpert", false )
	iNotificationExpert = SCOPE_WVARS.GetOptProperty( "iNotificationExpert", undefined )

	bNotifyCollaborator = SCOPE_WVARS.GetOptProperty( "bNotifyCollaborator", false )
	iNotificationCollaborator = SCOPE_WVARS.GetOptProperty( "iNotificationCollaborator", undefined )

	switch( sCommand )
	{
		case "eval":

			oRes.action_result = { 	
				command: "display_form",
				title: ( iExpertQuestionID == null ? i18n.t( 'zadatvoproseks' ) : i18n.t( 'otvetitnavopro' ) ),
				header: i18n.t( 'zapolnitepolyav' ),
				form_fields: [] 
			};

			if( iExpertQuestionID == null )
			{
				oRes.action_result.form_fields.push( { name: "question", label: i18n.t( 'vopros' ), type: "string", value: "", mandatory: true, validation: "nonempty" } );
				oRes.action_result.form_fields.push( { name: "question_file_id", label: i18n.t( 'fayl' ), type: "file", value: "", display_value: "", mandatory: false } );
				oRes.action_result.form_fields.push( { name: "expert_id", label: i18n.t( 'ekspert' ), type: "foreign_elem", catalog: "expert", value: "", display_value: "", mandatory: true, validation: "nonempty" } );
			}
			else
			{
				oRes.action_result.form_fields.push( { name: "question", label: i18n.t( 'vopros' ), type: "string", value: teExpertQuestion.question.Value, disabled: true } );
				oRes.action_result.form_fields.push( { name: "question_file_id", label: i18n.t( 'fayl' ), type: "file", value: teExpertQuestion.question_file_id.Value, display_value: get_field_name_value( teExpertQuestion.question_file_id ), disabled: true } );
				oRes.action_result.form_fields.push( { name: "expert_id", label: i18n.t( 'ekspert' ), type: "foreign_elem", catalog: "expert", value: teExpertQuestion.expert_id.Value, display_value: get_field_name_value( teExpertQuestion.expert_id ), disabled: true } );
				oRes.action_result.form_fields.push( { name: "answer", label: i18n.t( 'otvet' ), type: "text", value: "", mandatory: true, validation: "nonempty" } );
				oRes.action_result.form_fields.push( { name: "answer_file_id", label: i18n.t( 'fayl' ), type: "file", value: "", display_value: "", mandatory: false } );
				oRes.action_result.form_fields.push( { name: "is_faq", label: i18n.t( 'yavlyaetsyachastoz' ), type: "bool", value: "", mandatory: false } );
				oRes.action_result.form_fields.push( { name: "is_disclosed", label: i18n.t( 'otobrazitvopro' ), type: "bool", value: "", mandatory: false } );
			}

			break;

		case "submit_form":
			oFormFields = null;
			var form_fields = SCOPE_WVARS.GetOptProperty( "form_fields", "" )
			if ( form_fields != "" )
				oFormFields = ParseJson( form_fields );

			if( iExpertQuestionID == null )
			{
				expertQuestionDoc = OpenNewDoc( 'x-local://wtv/wtv_expert_question.xmd' );
				expertQuestionDoc.TopElem.date = Date();
				expertQuestionDoc.TopElem.person_id = iPersonID;
				tools.common_filling( 'expert_question', expertQuestionDoc.TopElem, iPersonID, tePerson );
			}
			else
			{
				expertQuestionDoc.TopElem.answer_date = Date();
				expertQuestionDoc.TopElem.status = true;
			}

			for( _field in oFormFields )
			{

				if( _field.name == "question_file_id" || _field.name == "answer_file_id" )
				{
					sValue = _field.GetOptProperty( "url", "" )
					if( sValue != "" )
					{
						iResourceID = create_resource( _field.GetOptProperty( "value", "" ), sValue, iPersonID );
						expertQuestionDoc.TopElem.EvalPath( _field.name ).Value = iResourceID;
					}
					else if( OptInt( _field.GetOptProperty( "value" ) ) != undefined )
					{
						expertQuestionDoc.TopElem.EvalPath( _field.name ).Value = _field.value;
					}
				}
				else if( expertQuestionDoc.TopElem.ChildExists( _field.name ) )
				{
					expertQuestionDoc.TopElem.EvalPath( _field.name ).Value = _field.value;
				}
			}

			if( iExpertQuestionID == null )
			{
				expertQuestionDoc.BindToDb( DefaultDb );
			}
			try
			{
				expertQuestionDoc.Save();

				/* вопрос */
				iQuestionExpertDocID = expertQuestionDoc.DocID
				docQuestionTE = expertQuestionDoc.TopElem;

				/* эксперт */
				docExpertQuestion = tools.open_doc( docQuestionTE.expert_id.Value );
				docExpertQuestionTE = docExpertQuestion.TopElem;
				iExpertPersonID = docExpertQuestionTE.person_id.Value;
				docExpertQuestion = tools.open_doc( OptInt(iExpertPersonID) );
				docExpertQuestionTE = docExpertQuestion.TopElem;

				sExpertName = '';
			    if(docExpertQuestionTE.middlename.Value != '')
			  	{
			  		sExpertName = docExpertQuestionTE.lastname.Value + ' ' + docExpertQuestionTE.firstname.Value + ' ' + docExpertQuestionTE.middlename.Value;
			  	} else {
			  		sExpertName = docExpertQuestionTE.lastname.Value + ' ' + docExpertQuestionTE.firstname.Value;
			  	}

			  	sQuery = "for $elem in collaborators where MatchSome( $elem/id, ( " + docQuestionTE.person_id.Value + " ) ) return $elem";
				sCollaboratorFullname = '';
				oCollaborator = ArrayOptFirstElem(tools.xquery(sQuery));
				if(oCollaborator != undefined)
				{
					sCollaboratorFullname = oCollaborator.fullname.Value;
					sCollaboratorSex = oCollaborator.sex.Value;
				}

				oNotification = {
					expert_id: iExpertPersonID,
					expert_name: sExpertName,
					expert_sex: docExpertQuestionTE.sex.Value,
					collaborator_id: docQuestionTE.person_id.Value,
					collaborator_name: sCollaboratorFullname,
					collaborator_sex: sCollaboratorSex,
					question_id: docQuestionTE.id.Value,
					question_text: docQuestionTE.question.Value,
					answer_text: docQuestionTE.answer.Value,
				};
			}
			catch ( err )
			{
				oRes.action_result = { command: "alert", msg: String( err ) };
				break;
			}

			if( iExpertQuestionID == null )
			{
				ms_tools.raise_system_event( "portal_create_expert_question", "", expertQuestionDoc.DocID, expertQuestionDoc );

				if(bNotifyExpert == true && iNotificationExpert != undefined){ // уведомление о новом вопросе
					tools.create_notification( iNotificationExpert, iExpertPersonID, oNotification );
				}

				//tools.create_notification( "70", expertQuestionDoc.DocID ); // архаизм
			} else {
				if(bNotifyCollaborator == true && iNotificationCollaborator != undefined){ // уведомление об ответе на вопрос
					tools.create_notification( iNotificationCollaborator, docQuestionTE.person_id.Value, oNotification );
				}
			}

			oRes.action_result = { command: "close_form", msg: ( iExpertQuestionID == null ? i18n.t( 'voprossozdan' ) : i18n.t( 'vyotvetilinavo' ) ), confirm_result: { command: "reload_page" } };
			break;
		default:
			oRes.action_result = { command: "alert", msg: i18n.t( 'neizvestnayakom' ) };
			break;
	}
	return oRes;
}


/**
 * @function RedirectExpertQuestion
 * @memberof Websoft.WT.Event
 * @description Удаление бюджета
 * @param {bigint[]} arrExpertQuestionIDs - Массив ID вопросов эксперту, подлежащих перенаправлению
 * @param {number} iExpertID - ID эксперта на которого перенаправляются вопрос(ы)
 * @returns {RedirectExpertQuestionResult}
*/
function RedirectExpertQuestion(arrExpertQuestionIDs, iExpertID){
	var oRes = tools.get_code_library_result_object();
	oRes.count = 0;

	/* arrExpertQuestionIDs */
	if(!IsArray(arrExpertQuestionIDs))
	{
		oRes.error = 501;
		oRes.errorText = i18n.t( 'argumentfunkci' );
		return oRes;
	}
	
	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrExpertQuestionIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = i18n.t( 'vmassivenetnio' );
		return oRes;
	}
	
	var docExpertQuestionObj = tools.open_doc(Int(catCheckObject));
	if(docExpertQuestionObj == undefined || docExpertQuestionObj.TopElem.Name != "expert_question")
	{
		oRes.error = 503;
		oRes.errorText = i18n.t( 'dannyeneyavlyayut' );
		return oRes;
	}

	/* iExpertID */
	iExpertID = OptInt( iExpertID, null );
	if( iExpertID == null )
	{
		oRes.error = 501;
		oRes.errorText = i18n.t( 'argumentfunkci_1' );
		return oRes;
	}

	var docExpertObj = tools.open_doc(Int(iExpertID));
	if(docExpertObj == undefined || docExpertObj.TopElem.Name != "expert")
	{
		oRes.error = 503;
		oRes.errorText = i18n.t( 'dannyeneyavlyayut_1' );
		return oRes;
	}

	for(iExpertQuestionID in arrExpertQuestionIDs)
	{
		try
		{
			sSQL = "for $elem in expert_questions where contains( $elem/id, ('" + XQueryLiteral(iExpertQuestionID) + "') ) return $elem"
			oExpertQuestionObject = ArrayOptFirstElem(tools.xquery(sSQL));
			
			if(oExpertQuestionObject == undefined)
				continue;

			docExpertQuestion = OpenDoc( UrlFromDocID( iExpertQuestionID ) );	
			docExpertQuestion.TopElem.expert_id = iExpertID;
			docExpertQuestion.Save();

			tools.create_notification( "72", docExpertQuestion.DocID );

			oRes.count++;
		}
		catch(err)
		{
			toLog("ERROR: RedirectExpertQuestion: " + ("[" + iExpertQuestionID + "]\r\n") + err, true);
		}
	}

	return oRes;
}


/**
 * @typedef {Object} oExpertQuestionAction
 * @property {bigint} id
 * @property {string} name
 * @property {string} action_type
 * @property {string} action_id
*/
/**
 * @typedef {Object} WTExpertQuestionActionsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {oExpertQuestionAction[]} array – массив
*/
/**
 * @function GetExpertQuestionActions
 * @memberof Websoft.WT.Knowledge
 * @author PL
 * @description Возвращение списка действий по вопросу эксперту.
 * @param {bigint} [iExpertQuestionID] - ID вопроса эксперту
 * @param {bigint} [iPersonID] - ID сотрудника
 * @returns {WTExpertQuestionActionsResult}
*/
function GetExpertQuestionActions( iExpertQuestionID, iPersonID )
{
	return get_expert_question_actions( iExpertQuestionID, null, iPersonID );
}
function get_expert_question_actions( iExpertQuestionID, teExpertQuestion, iPersonID )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];

	try
	{
		iExpertQuestionID = Int( iExpertQuestionID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'peredannekorre_2' );
		return oRes;
	}
	try
	{
		teExpertQuestion.Name;
	}
	catch( ex )
	{
		try
		{
			teExpertQuestion = OpenDoc( UrlFromDocID( iExpertQuestionID ) ).TopElem;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = i18n.t( 'peredannekorre_2' );
			return oRes;
		}
	}
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'peredannekorre_1' );
		return oRes;
	}

	if( !teExpertQuestion.expert_id.HasValue || teExpertQuestion.status )
	{
		return oRes;
	}
	feExpert = teExpertQuestion.expert_id.OptForeignElem;
	if( feExpert == undefined || feExpert.person_id != iPersonID )
	{
		return oRes;
	}

	oRes.array.push( { id: Random( 0, 99999999 ), name: i18n.t( 'otvetitnavopro' ), action_type: "remote_action", action_id: "AnswerQuestion" } );
	oRes.array.push( { id: Random( 0, 99999999 ), name: i18n.t( 'perenapravitvo' ), action_type: "remote_action", action_id: "RedirectExpertQuestion" } );

	return oRes;
}

/**
 * @typedef {Object} ExpertContext
 * @property {bool} bExpert – является экспертом.
 * @property {number} iQuestion – Количество вопросов.
 * @property {number} iUnanswerQuestion – Количество неотвеченных вопросов.
 * @property {number} iKnowledgePartNum – число значений карты знаний, по которым пользователь является экспертом.
 * @property {number} iKnowledgeAcquaintNum – число подтверждений знаний в статусе i18n.t( 'vprocesse' ) со способом подтверждения i18n.t( 'ekspertom' ), относящихся к области экспертизы пользователя.
*/
/**
 * @typedef {Object} ReturnExpertContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {ExpertContext} context – Контекст объекта по ознакомлению.
*/
/**
 * @function GetExpertContext
 * @memberof Websoft.WT.Knowledge
 * @description Получение контекста эксперта.
 * @param {bigint} iUserID - ID сотрудника.
 * @param {boolean} bHier - Учитывать иерархию значений
 * @returns {ReturnExpertContext}
*/
function GetExpertContext( iUserID, bHier )
{
	return get_expert_context( iUserID, bHier );
}
function get_expert_context( iUserID, bHier )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = new Object;

	try
	{
		iUserID = Int( iUserID )
	}
	catch ( err )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iUserID' }";
		return oRes;
	}

	var sQuery = "$elem/person_id = " + iUserID;

	var xarrExperts = XQuery( "for $elem in experts where " + sQuery + " return $elem/Fields('id')" );

	var oContext = {
		bExpert: false,
		iQuestion: 0,
		iUnanswerQuestion: 0,
		iKnowledgePartNum: 0,
		iKnowledgeAcquaintNum: 0
	};
	if( ArrayOptFirstElem( xarrExperts ) != undefined )
	{
		xarrQuestions = XQuery( "for $elem in expert_questions where MatchSome( $elem/expert_id, ( " + ArrayMerge( xarrExperts, "This.id", "," ) + ") ) return $elem/Fields('id', 'status')" );
		oContext.bExpert = true;
		oContext.iQuestion = ArrayCount( xarrQuestions );
		oContext.iUnanswerQuestion = ArrayCount( ArraySelect( xarrQuestions, "This.status" ) );
	}
	var oResExpertArea = GetExpertKnowledgeArea( iUserID, bHier );
	if( ArrayOptFirstElem( oResExpertArea.array ) != undefined )
	{
		oContext.iKnowledgePartNum = ArrayCount( oResExpertArea.array );
		xarrKnowledgeAcquaints = XQuery( "for $elem in knowledge_acquaints where $elem/confirmation_type = 'expert' and $elem/confirmation_expert_type = 'expert' and $elem/state_id = 'process' and MatchSome( $elem/knowledge_part_id, ( " + ArrayMerge( oResExpertArea.array, "This.id", "," ) + " ) ) return $elem/Fields('id')" );
		oContext.iKnowledgeAcquaintNum = ArrayCount( xarrKnowledgeAcquaints );
	}

	oRes.context = oContext;

	return oRes;
}

/**
 * @typedef {Object} WTRequireAcknowledgementsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oRequireAcknowledgement[]} array
*/
/**
 * @typedef {Object} oRequireAcknowledgement
 * @property {bigint} object_id
 * @property {string} object_name
 * @property {bigint} type_object_id
 * @property {string} type_object_name
 * @property {string} catalog
 * @property {string} image
 * @property {string} link
*/
/**
 * @function GetRequireAcknowledgements
 * @memberof Websoft.WT.Knowledge
 * @description Получить список объектов на согласовании
 * @param {string} sTypeID - тип ( knowledge_part/tag )
 * @param {bigint} iPersonID - ID сотрудника
 * @param {string} [sSearch] - поиск по строке
 * @returns {WTRequireAcknowledgementsResult[]}
 */

function GetRequireAcknowledgements( sTypeID, iPersonID, sSearch )
{
	return get_require_acknowledgements( sTypeID, iPersonID, sSearch );
}
function get_require_acknowledgements( sTypeID, iPersonID, sSearch )
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
	oRes.array = [];

	try
	{
		if( sSearch == undefined || sSearch == null )
			throw "error";
		sSearch = String( sSearch );
	}
	catch ( err )
	{
		sSearch = "";
	}
	try
	{
		iPersonID = OptInt( iPersonID, null );
	}
	catch ( err )
	{
		set_error( 1, i18n.t( 'neperedanidsot' ), false );
		return oRes;
	}
	conds = new Array();
	try
	{
		switch( sTypeID )
		{
			case "knowledge_part":
			case "tag":
				break;
			default:
				throw "error";
		}
	}
	catch ( err )
	{
		set_error( 1, i18n.t( 'neperedantip' ), false );
		return oRes;
	}


	curUserExpertCatElem = XQuery("for $i in experts where $i/person_id = " + iPersonID + " and $i/type = 'collaborator' return $i");

	if( ArrayOptFirstElem( curUserExpertCatElem ) == undefined )
	{
		return oRes;
	}

	expertKpTArray = XQuery( "for $i in " + sTypeID + "s where contains( $i/experts, '" + ArrayMerge( curUserExpertCatElem, "This.id", "' ) and contains( $i/experts, '" ) + "' ) return $i" );
	tmpArr = expertKpTArray;
	if( sTypeID == "knowledge_part" )
		for( elem in tmpArr )
			expertKpTArray = ArrayUnion( expertKpTArray, tools.xquery( 'for $i in knowledge_parts where IsHierChild( $i/id, ' + elem.id + ' ) order by $i/Hier() return $i' ) );

	expertKpTArray = ArraySelectDistinct( expertKpTArray, "This.id" );

	objectArray = XQuery( "for $i in " + ( sTypeID == "knowledge_part" ? "knowledge_objects" : "tagged_objects" ) + " where $i/require_acknowledgement = true() and MatchSome( $i/" + sTypeID + "_id, ( " + ArrayMerge( expertKpTArray, "This.id", "," ) + " ) ) return $i" )

	for ( _obj in objectArray )
	{
		objD = undefined;
		obj = new Object();
		_catalog_obj_type_elem = _obj.catalog.OptForeignElem;

		obj.id = _obj.id.Value;
		obj.catalog = _catalog_obj_type_elem != undefined ? _catalog_obj_type_elem.title.Value : "";
		obj.object_id = _obj.object_id.Value;
		obj.object_name = _obj.object_name.Value;
		obj.type_object_name = _obj.Child( sTypeID + "_name" ).Value;
		obj.type_object_id = _obj.Child( sTypeID + "_id" ).Value;

		if( sSearch != "" && !StrContains( obj.object_name, sSearch, true ) && !StrContains( obj.catalog, sSearch, true ) && !StrContains( obj.type_object_name, sSearch, true ) )
			continue;

		obj.image = "";
		objD = _obj.object_id.OptForeignElem;
		if( objD != undefined )
		{
			obj.image = get_object_image_url( objD );
		}
		if( _obj.catalog == "document" )
		{
			if( objD != undefined )
			{
				if( objD.is_link )
					obj.link = obj.link_href;
				else
					obj.link = tools_web.doc_link( objD );
			}
		}
		else if( _catalog_obj_type_elem.web_template.Value != "" )
			obj.link =  tools_web.get_mode_clean_url( null, _obj.object_id.Value );
		else
			obj.link = "";


		oRes.array.push( obj );
	}
	return oRes;
}


/**
 * @typedef {Object} WTTagObjectsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oTagObject[]} array
*/
/**
 * @typedef {Object} oTagObject
 * @property {bigint} id
 * @property {string} name
 * @property {string} catalog
 * @property {string} catalog_name
 * @property {date} create_date
 * @property {bool} require_acknowledgement
 * @property {string} image
 * @property {string} link
*/
/**
 * @function GetKnowledgeObjectsByTag
 * @memberof Websoft.WT.Knowledge
 * @description Получить список объектов по тэгу
 * @param {bigint} iTagIDParam - ID тэга
 * @param {boolean} bCheckAccess - Проверять права доступа
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @returns {WTTagObjectsResult[]}
 */

function GetKnowledgeObjectsByTag( iTagIDParam, bCheckAccess, iCurUserID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	try
	{
		var iTagID = OptInt(iTagIDParam);
		if(iTagID == undefined)
			throw StrReplace(i18n.t( 'argumentneyavlya' ), "{PARAM1}", iTagIDParam);

		if(tools.open_doc(iTagID).TopElem.Name != "tag")
			throw StrReplace(i18n.t( 'obektsidparamn' ), "{PARAM1}", iTagID);

		try
		{
			if ( bCheckAccess == undefined || bCheckAccess == null )
				throw '';
	
			bCheckAccess = tools_web.is_true( bCheckAccess );
		}
		catch( ex )
		{
			bCheckAccess = global_settings.settings.check_access_on_lists.Value;
		}

		docCurUser = tools.open_doc( iCurUserID );
		if ( docCurUser == undefined )
		{
			oRes.error = 1;
			oRes.errorText = i18n.t( 'oshibkaotkrytiya' ) + iCurUserID;
			return oRes;
		}
		teCurUser = docCurUser.TopElem;
			
		var sObjectsReq = tools.create_xquery("tagged_object", "$elem/tag_id = " + iTagID, "");

		var oObj;
		for(itemObject in tools.xquery(sObjectsReq))
		{
			if ( bCheckAccess && !tools_web.check_access( itemObject.object_id.Value, iCurUserID, teCurUser ) )
				continue;

			oObj = {
				id: itemObject.object_id.Value,
				name: itemObject.object_name.Value,
				catalog: itemObject.object_name.Value,
				catalog_name: common.exchange_object_types.GetOptChildByKey( itemObject.catalog.Value ).title.Value,
				create_date: itemObject.object_name.Value,
				require_acknowledgement: tools_web.is_true(itemObject.require_acknowledgement.Value),
				link: tools_web.get_mode_clean_url( null, itemObject.object_id.Value )
			};

			oRes.array.push(oObj);
		}
	}
	catch(err)
	{
		oRes.error = 502;
		oRes.errorText = err;
	}
	return oRes;
}

/**
 * @typedef {Object} WTTagsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oTag[]} array
*/
/**
 * @typedef {Object} oTag
 * @property {bigint} id
 * @property {string?} code - код
 * @property {string} name
 * @property {string?} image
 * @property {string?} link
 * @property {string?} knowledge_part_name - название связанного значения карты знаний.
*/
/**
 * @function GetKnowledgeTagsByObject
 * @memberof Websoft.WT.Knowledge
 * @description Получить список тэгов по объекту
 * @param {bigint} iObjectIDParam - ID объекта
 * @returns {WTTagsResult[]}
 */

function GetKnowledgeTagsByObject(iObjectIDParam)
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	try
	{
		var iObjectID = OptInt(iObjectIDParam);
		if(iObjectID == undefined)
			throw StrReplace(i18n.t( 'argumentneyavlya' ), "{PARAM1}", iObjectIDParam);

		var sTagsReq = tools.create_xquery("tag", "some $cross in tagged_objects satisfies ($elem/id=$cross/tag_id and $cross/object_id = " + iObjectID + ")", "");

		var oObj;
		for(itemTag in tools.xquery(sTagsReq))
		{
			oObj = {
				id: itemTag.id.Value,
				name: itemTag.name.Value,
				image: tools_web.get_object_source_url('resource', itemTag.resource_id.Value),
				link: tools_web.get_mode_clean_url( null, itemTag.id.Value )
			};

			oRes.array.push(oObj);
		}
	}
	catch(err)
	{
		oRes.error = 502;
		oRes.errorText = err;
	}
	return oRes;
}

/**
 * @typedef {Object} KnowledgeContext
 * @property {string} current_level_id – Код текущего уровня.
 * @property {string} current_level_name – Наименование текущего уровня.
 * @property {string} target_level_id – Код целевого уровня.
 * @property {string} target_level_name – Наименование целевого уровня.
 * @property {number} current_cost – Набрано баллов.
 * @property {number} target_cost – Целевое значение баллов.
 * @property {real} percent_cost – Процент достижения цели.
*/
/**
 * @typedef {Object} ReturnKnowledgeContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {KnowledgeContext} context – Контекст значения карты знаний относительно сотрудника
*/
/**
 * @function GetKnowledgeContext
 * @memberof Websoft.WT.Knowledge
 * @description Получение контекста значения карты знаний.
 * @param {bigint} iKnowledgePartID - ID значения карты знаний.
 * @param {bigint} iPersonID - ID сотрудника.
 * @returns {ReturnKnowledgeContext}
*/
function GetKnowledgeContext( iKnowledgePartID, iPersonID, arrCostObjectTypes )
{
	return get_knowledge_context( iKnowledgePartID, iPersonID, arrCostObjectTypes );
}
function get_knowledge_context( iKnowledgePartIDParam, iPersonIDParam, arrCostObjectTypes )
{
	function sum_current_cost(person_id, currency_id, knowledge_part_id, arrObjectTypes)
	{

		var sReqKPObjects = "for $elem in knowledge_objects where $elem/knowledge_part_id = " + knowledge_part_id + " and MatchSome( $elem/catalog, ( " + ArrayMerge( arrObjectTypes, "XQueryLiteral( String( This ) )", "," ) + " ) ) return $elem";
		var xarrAllKnowledgeObjects = tools.xquery( sReqKPObjects );

		if(ArrayOptFirstElem(xarrAllKnowledgeObjects) == undefined)
			return 0;

		var arrTransactions =  tools.call_code_library_method ("libGame", "GetPersonTransactions", [ person_id, currency_id, 1, false, false, null, ArrayMerge(xarrAllKnowledgeObjects, "This.object_id.Value", ",") ]);

		return ArraySum(arrTransactions.transactions, "OptInt(This.amount, 0)");

		/*
		var arrTransactions =  tools.call_code_library_method ("libGame", "GetPersonTransactions", [ person_id, currency_id, 1, false, false, null, ""]);
		var iCostSum = 0;
		var docTrabsaction
		for(itemTransaction in arrTransactions.transactions)
		{
			docTransaction = tools.open_doc(itemTransaction.id);
			if(ArrayOptFind(xarrAllKnowledgeObjects, "OptInt(This.object_id.Value, 999999) == OptInt(docTransaction.TopElem.object_id.Value)") != undefined)
			{
				iCostSum += OptInt(itemTransaction.amount, 0);
			}
		}

		return iCostSum;
		*/
	}

	var oRes = tools.get_code_library_result_object();
	oRes.context = {
		current_level_id: null,
		current_level_name: "",
		target_level_id: null,
		target_level_name: "",
		current_cost: null,
		target_cost: null,
		percent_cost: null
	};

	var iPersonID = OptInt(iPersonIDParam);
	if(iPersonID == undefined)
		throw StrReplace(i18n.t( 'argumentiperso' ), "{PARAM1}", iPersonIDParam);

	var docPerson = tools.open_doc(iPersonID);

	if(docPerson == undefined )
		throw StrReplace(i18n.t( 'nenaydensotrud' ), "{PARAM1}", iPersonID);

	var tePerson = docPerson.TopElem;

	if(tePerson.Name != 'collaborator')
		throw StrReplace(i18n.t( 'peredannyyidpa' ), "{PARAM1}", iPersonID);

	var iKnowledgePartID = OptInt(iKnowledgePartIDParam);
	if(iKnowledgePartID == undefined)
		throw StrReplace(i18n.t( 'argumentiknowl' ), "{PARAM1}", iKnowledgePartID);

	var docKnowledgePart = tools.open_doc(iKnowledgePartID);

	if(docKnowledgePart == undefined )
		throw StrReplace(i18n.t( 'nenaydenoznache' ), "{PARAM1}", iKnowledgePartID);

	var teKnowledgePart = docKnowledgePart.TopElem;

	if(teKnowledgePart.Name != 'knowledge_part')
		throw StrReplace(i18n.t( 'peredannyyidpa_1' ), "{PARAM1}", iKnowledgePartID);

	var curUserKnowledgePart = tePerson.knowledge_parts.GetOptChildByKey(iKnowledgePartID);

	if(curUserKnowledgePart != undefined)
	{
		if(curUserKnowledgePart.current_level_id.HasValue)
		{
			oRes.context.current_level_id = curUserKnowledgePart.current_level_id.Value;
			oRes.context.current_level_name = curUserKnowledgePart.current_level_name.Value;
		}

		if(curUserKnowledgePart.target_level_id.HasValue)
		{
			oRes.context.target_level_id = curUserKnowledgePart.target_level_id.Value;
			oRes.context.target_level_name = curUserKnowledgePart.target_level_name.Value;

			fldTargetKnowledgePartParam = teKnowledgePart.levels.GetOptChildByKey(curUserKnowledgePart.target_level_id.Value);
			if(fldTargetKnowledgePartParam != undefined)
			{
				var sTargetCurrencyID = fldTargetKnowledgePartParam.currency_type_id.HasValue ? fldTargetKnowledgePartParam.currency_type_id.Value : null;
				var iTargetCost = OptInt(fldTargetKnowledgePartParam.cost.Value, 0);
				if(sTargetCurrencyID != null && iTargetCost != 0)
				{
					oRes.context.target_cost = iTargetCost;
					oRes.context.current_cost = sum_current_cost(iPersonID, sTargetCurrencyID, iKnowledgePartID, arrCostObjectTypes)
					oRes.context.percent_cost = StrReal((100.0 * Real(oRes.context.current_cost)/Real(iTargetCost)), 1);
					//oRes.context.percent_cost = 100.0 * Real(oRes.context.current_cost)/Real(iTargetCost);
				}
			}
		}
	}
	else
		throw StrReplace(StrReplace(i18n.t( 'ukazannyyidpar' ), "{PARAM1}", iKnowledgePartID), "{PARAM2}", iPersonID);

	return oRes;
}

function get_duration_from_time( oSourceTime )
{
	return OptInt( oSourceTime.hour, 0 )*3600 + OptInt( oSourceTime.minute, 0 )*60 + OptInt( oSourceTime.second, 0 );
}

function get_time_from_duration( _duration, oSourceTime )
{
	_duration = OptInt( _duration );
	if( _duration == undefined )
	{
		return false
	}
	oSourceTime.hour = Int( _duration/3600 );
	oSourceTime.minute = Int( ( _duration%3600 )/60 );
	oSourceTime.second = Int( ( _duration%3600 )%60 );

	return true;
}
/**`
 * @typedef {Object} PersonLearningTaskContext
 * @property {number} task_num – Всего заданий.
 * @property {number} done_task_num – Выполненных заданий.
 * @property {number} passed_task_num – Выполненных успешно.
 * @property {number} today_task_num – Заданий на сегодня.
 * @property {boolean} is_expert – сотрудник является экспертом хотя бы в одном (выполнении задания | задании).
*/
/**
 * @typedef {Object} ReturnPersonLearningTaskContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {PersonLearningTaskContext} context – Контекст моих отпусков.
*/
/**
 * @function GetPersonLearningTaskContext
 * @memberof Websoft.WT.Knowledge
 * @author PL
 * @description Получение контекста сотрудника по заданиям.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {boolean} [bGetExpertByResult] - пределять экспертов по заданию или по выполнению задания.
 * @returns {ReturnPersonLearningTaskContext}
*/
function GetPersonLearningTaskContext( iPersonID, bGetExpertByResult )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = new Object;
	try{
		if( bGetExpertByResult == null || bGetExpertByResult == undefined || bGetExpertByResult == '' )
			throw 'error'
		bGetExpertByResult = tools_web.is_true( bGetExpertByResult );
	}
	catch( ex )
	{
		bGetExpertByResult = false;
	}
	try
	{
		iPersonID = Int( iPersonID )
	}
	catch ( err )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'nekorrektnyyid_1' );
		return oRes;
	}

	xarrLearningTaskResult = XQuery( "for $elem in learning_task_results where $elem/person_id = " + iPersonID + " return $elem" );
	sStartThisDate = DateNewTime( Date() );
	if( bGetExpertByResult )
	{
		sQueryExpert = "for $elem in learning_task_results where $elem/expert_id = " + iPersonID + " return $elem";
	}
	else
	{
		sQueryExpert = "for $elem in learning_tasks where MatchSome( $elem/experts_id, ( " + iPersonID + " ) ) return $elem";
	}

	var oContext = {
		task_num: ArrayCount( xarrLearningTaskResult ),
		done_task_num: ArrayCount( ArraySelect( xarrLearningTaskResult, "This.status_id == 'viewed' || This.status_id == 'success' || This.status_id == 'failed'" ) ),
		passed_task_num: ArrayCount( ArraySelect( xarrLearningTaskResult, "This.status_id == 'success'" ) ),
		today_task_num: ArrayCount( ArraySelect( xarrLearningTaskResult, "DateNewTime( This.plan_end_date ) == sStartThisDate" ) ),
		is_expert: ( ArrayOptFirstElem( XQuery( sQueryExpert ) ) != undefined )
	};
	oRes.context = oContext;

	return oRes;
}
/**
 * @typedef {Object} LearningTaskResultContext
 * @property {boolean} is_executor – Исполнитель – текущий пользователь является исполнителем по данному выполнению задания.
 * @property {boolean} is_expert – Эксперт– текущий пользователь является экспертом по данному выполнению задания или по связанному заданию (в зависимости от параметра показателя).
 * @property {bigint} person_id – ID сотрудника по заданию.
 * @property {bigint} learning_task_result_id – ID выполнения задания.
 * @property {string} person_name – ФИО сотрудника по заданию.
 * @property {string} person_position_name – Наименование должности сотрудника по заданию.
 * @property {string} person_subdivision_name – наименование подразделения сотрудника по заданию.
 * @property {string} person_img – аватарка сотрудника по заданию.
 * @property {string} status_id – ID текущего статуса.
 * @property {string} status_name – Наименование статуса.
 * @property {number} time_left – продолжительность задания.
 * @property {string} time_left_str – продолжительность задания в строке.
 * @property {string} work_time_str – продолжительность выполнения задания в строке.
 * @property {string} learning_task_desc - текст описания задания
*/
/**
 * @typedef {Object} ReturnLearningTaskResultContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {LearningTaskResultContext} context – Контекст моих отпусков.
*/
/**
 * @function GetLearningTaskResultContext
 * @memberof Websoft.WT.Knowledge
 * @author PL
 * @description Получение контекста сотрудника по заданиям.
 * @param {bigint} iLearningTaskResultID - ID выполнения задания.
 * @param {bigint} iUserID - ID сотрудника.
 * @param {boolean} [bGetExpertByResult] - пределять экспертов по заданию или по выполнению задания.
 * @returns {ReturnLearningTaskResultContext}
*/
function GetLearningTaskResultContext( iLearningTaskResultID, iUserID, bGetExpertByResult )
{
	get_learning_task_result( iLearningTaskResultID, null, iUserID, bGetExpertByResult )
}
function get_learning_task_result( iLearningTaskResultID, teLearningTask, iUserID, bGetExpertByResult )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = new Object;
	try{
		if( bGetExpertByResult == null || bGetExpertByResult == undefined || bGetExpertByResult == '' )
			throw 'error'
		bGetExpertByResult = tools_web.is_true( bGetExpertByResult );
	}
	catch( ex )
	{
		bGetExpertByResult = false;
	}
	try
	{
		iUserID = Int( iUserID );
	}
	catch ( err )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'nekorrektnyyid_1' );
		return oRes;
	}
	try
	{
		iLearningTaskResultID = Int( iLearningTaskResultID )
	}
	catch ( err )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'nekorrektnyyid_4' );
		return oRes;
	}
	try
	{
		teLearningTaskResult.Name;
	}
	catch( ex )
	{
		try
		{
			teLearningTaskResult = OpenDoc( UrlFromDocID( iLearningTaskResultID ) ).TopElem;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = i18n.t( 'nekorrektnyyid_4' );
			return oRes;
		}
	}


	var feLearningTask = teLearningTaskResult.learning_task_id.OptForeignElem;
	var docLearningTask = tools.open_doc( teLearningTaskResult.learning_task_id );
	var teLearningTask = undefined;
	if ( docLearningTask != undefined )
		teLearningTask = docLearningTask.TopElem;
	oResLearningTaskDuration = tools.call_code_library_method("libSchedule", "get_str_time_from_second", [ feLearningTask.duration.Value ]);
	oResLearningTaskResultDuration = tools.call_code_library_method("libSchedule", "get_str_time_from_second", [ teLearningTaskResult.duration.Value ]);
	var bIsExpert = ( teLearningTaskResult.expert_id == iUserID );
	var bIsExecutor = ( teLearningTaskResult.person_id == iUserID );
	var fldExpert = teLearningTaskResult.expert_id.OptForeignElem;
	var oContext = {
		is_executor: bIsExecutor,
		is_expert: bIsExpert,
		person_id: (bIsExecutor ? teLearningTaskResult.expert_id.Value : teLearningTaskResult.person_id.Value),
		person_name: (bIsExecutor ? ( fldExpert != undefined ? fldExpert.fullname.Value : "" ) : teLearningTaskResult.person_fullname.Value),
		person_position_name: (bIsExecutor ? ( fldExpert != undefined ? fldExpert.position_name.Value : "" ) : teLearningTaskResult.person_position_name.Value),
		person_subdivision_name: (bIsExecutor ? ( fldExpert != undefined ? fldExpert.position_parent_name.Value : "" ) : teLearningTaskResult.person_subdivision_name.Value),
		person_img: tools_web.get_object_source_url( 'person', (bIsExecutor ? teLearningTaskResult.expert_id.Value : teLearningTaskResult.person_id) ),
		status_id: teLearningTaskResult.status_id.Value,
		status_name: ( teLearningTaskResult.status_id.HasValue && teLearningTaskResult.status_id.OptForeignElem != undefined ? teLearningTaskResult.status_id.OptForeignElem.name.Value : "" ),
		time_left: ( feLearningTask.duration.HasValue ? feLearningTask.duration.Value : "" ),
		time_left_str: oResLearningTaskDuration.time_str,
		work_time_str: oResLearningTaskResultDuration.time_str,
		learning_task_desc: ( teLearningTask != undefined && teLearningTask.desc.HasValue ? teLearningTask.desc.Value : "" ),
		learning_task_result_id: iLearningTaskResultID
	};

	oRes.context = oContext;

	return oRes;
}
/**
 * @function ProcessLearningTaskResult
 * @memberof Websoft.WT.Knowledge
 * @author PL
 * @description Процесс выполнения задания.
 * @param {string} sCommand - Текущий режим удаленного действия
 * @param {bigint} iLearningTaskResultID - ID выполнения задания
 * @param {bigint} iPersonID - ID сотрудника
 * @param {XmElem} teLearningTaskResult - TopElem выполнения задания
 * @param {boolean} bAnswerNoEmpty - ответ не может быть пустым
 * @param {boolean} bHasResultFiles - обязательность добавления файла
 * @param {WTScopeWvars} SCOPE_WVARS - JSON объект с параметрами удаленного действия
 * @returns {WTLPEFormResult}
*/
function ProcessLearningTaskResult( sCommand, iLearningTaskResultID, iPersonID, teLearningTaskResult, bAnswerNoEmpty, bHasResultFiles, SCOPE_WVARS )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.action_result = ({});

	try{
		if( bAnswerNoEmpty == null || bAnswerNoEmpty == undefined || bAnswerNoEmpty == '' )
			throw 'error'
		bAnswerNoEmpty = tools_web.is_true( bAnswerNoEmpty );
	}
	catch( ex )
	{
		bAnswerNoEmpty = true;
	}
	try{
		if( bHasResultFiles == null || bHasResultFiles == undefined || bHasResultFiles == '' )
			throw 'error'
		bHasResultFiles = tools_web.is_true( bHasResultFiles );
	}
	catch( ex )
	{
		bHasResultFiles = true;
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
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_1' ) };
		return oRes;
	}

	try
	{
		iLearningTaskResultID = Int( iLearningTaskResultID );
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_5' ) };
		return oRes;
	}

	try
	{
		teLearningTaskResult.Name;
	}
	catch( ex )
	{
		try
		{
			teLearningTaskResult = OpenDoc( UrlFromDocID( iLearningTaskResultID ) ).TopElem;
		}
		catch( ex )
		{
			oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_5' ) };
			return oRes;
		}
	}
	if( teLearningTaskResult.person_id != iPersonID || ( teLearningTaskResult.status_id != "assign" && teLearningTaskResult.status_id != "process" ) )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'vynemozhetereda' ) };
		return oRes;
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

	switch( sCommand )
	{
		case "eval":
		{
			oRes.action_result = { 	command: "display_form",
						title: i18n.t( 'vypolneniezada' ),
						header: i18n.t( 'zapolnitepolya' ),
						buttons:
						[
							{ name: "submit", label: i18n.t( 'sohranit' ), submit_type: "save", type: "submit" },
							{ name: "submit", label: i18n.t( 'otpravitnaprov' ), submit_type: "send", type: "submit" },
							{ name: "cancel", label: i18n.t( 'otmenit' ), type: "cancel" }
						],
						form_fields: [] };

			oRes.action_result.form_fields.push( { name: "answer", label: i18n.t( 'otvet' ), type: "text", value: teLearningTaskResult.answer.Value } );

			var oFieldFile = ({ name: "file_id", label: i18n.t( 'fayly' ), type: "array", array: [], value: [] });
			oFieldFile.array.push( { name: "file_id", label: i18n.t( 'fayl' ), type: "file" } )
			for( _file in ArraySelect( teLearningTaskResult.files, "!This.is_expert" ) )
			{
				oFieldFile.value.push( [{ name: "file_id", label: i18n.t( 'fayl' ), type: "file", value: ( _file.file_id.Value ), display_value: ( get_field_name_value( _file.file_id.Value ) ) }] );
			}
			oRes.action_result.form_fields.push( oFieldFile );
			if( teLearningTaskResult.status_id == "assign" )
			{
				oResStatus = set_status_learning_task_result( { "learning_task_result_id": iLearningTaskResultID,
												"status": "process"
												} );
				oRes.action_result = { command: "alert", msg: i18n.t( 'vypristupilikv' ), confirm_result: oRes.action_result };
			}

			break;
		}
		case "submit_form":
		{
			oFormFields = null;

			var form_fields = SCOPE_WVARS.GetOptProperty( "form_fields", "" )
			if ( form_fields != "" )
				oFormFields = ParseJson( form_fields );

			docLearningTaskResult = tools.open_doc( iLearningTaskResultID );
			sSubmitType = ArrayOptFind( oFormFields, "This.name == '__submit_type__'" );
			sSubmitType = sSubmitType != undefined ? sSubmitType.value : "";

			catConfirm = ArrayOptFind( oFormFields, "This.name == 'is_confirm'" );
			bConfirm = catConfirm != undefined && tools_web.is_true( catConfirm.value );
			var aValues, oValue;
			for( _field in oFormFields )
			{

				if( _field.name == "file_id" )
				{
					aValues = _field.GetOptProperty( "value", [] );
					if( !IsArray( aValues ) )
					{
						aValues = RValue( aValues );
						
						switch( DataType( aValues ) )
						{
							case "string":
								aValues = Trim( aValues );
								if( StrBegins( aValues, "[" ) )
								{
									aValues = ParseJson( aValues );
									break;
								}
								break;
							default:

								if( OptInt( aValues ) != undefined )
								{
									aValues = [aValues];
									break;
								}
								break;
						}
					}
					if( !IsArray( aValues ) )
					{
						aValues = new Array();
					}
					docLearningTaskResult.TopElem.files.DeleteChildren( "!This.is_expert" );
					for( oValue in aValues )
					{
						catFile = ArrayOptFind(oValue,"This.name == 'file_id'");
						if( catFile == undefined )
						{
							continue;
						}
						sValue = catFile.GetOptProperty( "url", "" );
						if( sValue != "" )
						{
							iResourceID = create_resource( catFile.GetOptProperty( "value", "" ), sValue, iPersonID );
							docLearningTaskResult.TopElem.files.ObtainChildByKey( iResourceID );
						}
						else if( OptInt( catFile.GetOptProperty( "value" ) ) != undefined )
						{
							docLearningTaskResult.TopElem.files.ObtainChildByKey( OptInt( catFile.GetOptProperty( "value" ) ) );
						}
					}
				}
				else if( docLearningTaskResult.TopElem.ChildExists( _field.name ) )
				{
					docLearningTaskResult.TopElem.EvalPath( _field.name ).Value = _field.value;
				}
			}
			if( sSubmitType == "send" )
			{
				if( bAnswerNoEmpty && !docLearningTaskResult.TopElem.answer.HasValue )
				{
					oRes.action_result = { command: "alert", msg: i18n.t( 'neobhodimozapo' ) };
					return oRes;
				}
				if( bHasResultFiles && ArrayOptFind( docLearningTaskResult.TopElem.files, "!This.is_expert" ) == undefined )
				{
					oRes.action_result = { command: "alert", msg: i18n.t( 'neobhodimoprik' ) };
					return oRes;
				}
			}
			if( sSubmitType == "send" && !bConfirm )
			{
				oRes.action_result = { 	command: "display_form",
						title: i18n.t( 'vypolneniezada' ),
						header: i18n.t( 'zapolnitepolya' ),
						buttons:
						[
							{ name: "submit", label: i18n.t( 'da' ), submit_type: "send", type: "submit" },
							{ name: "cancel", label: i18n.t( 'net' ), type: "cancel" }
						],
						form_fields: [] };
				oRes.action_result.form_fields.push( { name: "paragraph", value: i18n.t( 'otpravitzadani' ), type: "paragraph" } );
				oRes.action_result.form_fields.push( { name: "answer", type: "hidden", value: docLearningTaskResult.TopElem.answer.Value } );
				arrFiles = ArraySelect( docLearningTaskResult.TopElem.files, "!This.is_expert" );

				oRes.action_result.form_fields.push( { name: "file_id", type: "hidden", value: ArrayExtract( arrFiles, "return [{name:'file_id',value:This.file_id.Value}]" ) } );
				oRes.action_result.form_fields.push( { name: "is_send", type: "hidden", value: true } );
				oRes.action_result.form_fields.push( { name: "is_confirm", type: "hidden", value: true } );
				return oRes;
			}
			oResStatus = null;
			if( sSubmitType == "send" )
			{
				oResStatus = set_status_learning_task_result( { "learning_task_result_id": iLearningTaskResultID,
												"docLearningTaskResult": docLearningTaskResult,
												"status": "evaluation"
												} );
			}
			else
			{
				docLearningTaskResult.Save();
			}

			if( oResStatus != null && oResStatus.error != 0 )
			{
				oRes.action_result = { command: "alert", msg: oResStatus.message };
			}
			else
			{
				oRes.action_result = { command: "close_form", msg: ( sSubmitType == "send" ? i18n.t( 'zadanieotpravl' ) : i18n.t( 'zadaniesohrane' ) ), confirm_result: { command: "reload_page" } };
			}
			break;
		}
		default:
			oRes.action_result = { command: "alert", msg: i18n.t( 'neizvestnayakom' ) };
			break;
	}
	return oRes;
}
function create_resource( sName, sUrl, iPersonID ) 
{
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
 * @function EvaluationLearningTaskResult
 * @memberof Websoft.WT.Knowledge
 * @author PL
 * @description Процесс оценки задания экспертом.
 * @param {string} sCommand - Текущий режим удаленного действия
 * @param {bigint} iLearningTaskResultID - ID выполнения задания
 * @param {bigint} iPersonID - ID сотрудника
 * @param {XmElem} teLearningTaskResult - TopElem выполнения задания
 * @param {boolean} bHasExpertComment - обязательность заполнения комментария
 * @param {boolean} bHasResultFiles - обязательность добавления файла
 * @param {boolean} bHasScore - обязательность проставления оценки
 * @param {number} iMinScore - минимальный балл
 * @param {number} iMaxScore - максимальный балл
 * @param {string[]} arrStatuses - массив возможных статусов
 * @param {WTScopeWvars} SCOPE_WVARS - JSON объект с параметрами удаленного действия
 * @returns {WTLPEFormResult}
*/
function EvaluationLearningTaskResult( sCommand, iLearningTaskResultID, iPersonID, teLearningTaskResult, bHasExpertComment, bHasResultFiles, bHasScore, iMinScore, iMaxScore, arrStatuses, SCOPE_WVARS )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.action_result = ({});

	try{
		if( bHasExpertComment == null || bHasExpertComment == undefined || bHasExpertComment == '' )
			throw 'error'
		bHasExpertComment = tools_web.is_true( bHasExpertComment );
	}
	catch( ex )
	{
		bHasExpertComment = true;
	}
	try{
		if( bHasResultFiles == null || bHasResultFiles == undefined || bHasResultFiles == '' )
			throw 'error'
		bHasResultFiles = tools_web.is_true( bHasResultFiles );
	}
	catch( ex )
	{
		bHasResultFiles = false;
	}
	try{
		if( !IsArray( arrStatuses ) )
			throw 'error'
	}
	catch( ex )
	{
		arrStatuses = [ "viewed", "success", "evaluation", "cancel", "failed" ]
	}
	try{
		if( bHasScore == null || bHasScore == undefined || bHasScore == '' )
			throw 'error'
		bHasScore = tools_web.is_true( bHasScore );
	}
	catch( ex )
	{
		bHasScore = true;
	}
	try{
		iMinScore = OptInt( iMinScore )
	}
	catch( ex )
	{
		iMinScore = undefined;
	}
	try{
		iMaxScore = OptInt( iMaxScore )
	}
	catch( ex )
	{
		iMaxScore = undefined;
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
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_1' ) };
		return oRes;
	}

	try
	{
		iLearningTaskResultID = Int( iLearningTaskResultID );
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_5' ) };
		return oRes;
	}

	try
	{
		teLearningTaskResult.Name;
	}
	catch( ex )
	{
		try
		{
			teLearningTaskResult = OpenDoc( UrlFromDocID( iLearningTaskResultID ) ).TopElem;
		}
		catch( ex )
		{
			oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_5' ) };
			return oRes;
		}
	}
	if( teLearningTaskResult.expert_id != iPersonID || teLearningTaskResult.status_id != "evaluation" )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'vynemozhetereda' ) };
		return oRes;
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

	switch( sCommand )
	{
		case "eval":
			oRes.action_result = { 	command: "display_form",
						title: i18n.t( 'vypolneniezada' ),
						header: i18n.t( 'zapolnitepolya' ),
						buttons:
						[
							{ name: "submit", label: i18n.t( 'sohranit' ), type: "submit" },
							{ name: "cancel", label: i18n.t( 'otmenit' ), type: "cancel" }
						],
						form_fields: [] };

			oRes.action_result.form_fields.push( { name: "expert_comment", label: i18n.t( 'kommentariy' ), type: "text", value: teLearningTaskResult.expert_comment.Value } );
			oRes.action_result.form_fields.push( { name: "mark", label: i18n.t( 'ocenka' ), type: "integer", value: teLearningTaskResult.mark.Value } );

			obj = { name: "status_id", label: i18n.t( 'status' ), type: "select", value: teLearningTaskResult.status_id.Value, mandatory: true, validation: "nonempty", entries: [] };
			for( _state in arrStatuses )
			{
				catState = common.learning_task_status_types.GetOptChildByKey( _state );
				if( catState == undefined )
				{
					continue;
				}
				obj.entries.push( { name: catState.name.Value, value: _state } );
			}
			oRes.action_result.form_fields.push( obj );

			var oFieldFile = ({ name: "file_id", label: i18n.t( 'fayly' ), type: "array", array: [], value: [] });
			oFieldFile.array.push( { name: "file_id", label: i18n.t( 'fayl' ), type: "file" } )
			for( _file in ArraySelect( teLearningTaskResult.files, "This.is_expert" ) )
			{
				oFieldFile.value.push( [{ name: "file_id", label: i18n.t( 'fayl' ), type: "file", value: ( _file.file_id.Value ), display_value: ( get_field_name_value( _file.file_id.Value ) ) }] );
			}
			oRes.action_result.form_fields.push( oFieldFile );
			
			break;

		case "submit_form":
			oFormFields = null;

			var form_fields = SCOPE_WVARS.GetOptProperty( "form_fields", "" )
			if ( form_fields != "" )
				oFormFields = ParseJson( form_fields );

			docLearningTaskResult = tools.open_doc( iLearningTaskResultID );
			for( _field in oFormFields )
			{
				if( _field.name == "file_id" )
				{
					aValues = _field.GetOptProperty( "value", [] );
					if( !IsArray( aValues ) )
					{
						aValues = RValue( aValues );
						
						switch( DataType( aValues ) )
						{
							case "string":
								aValues = Trim( aValues );
								if( StrBegins( aValues, "[" ) )
								{
									aValues = ParseJson( aValues );
									break;
								}
								break;
							default:

								if( OptInt( aValues ) != undefined )
								{
									aValues = [aValues];
									break;
								}
								break;
						}
					}
					if( !IsArray( aValues ) )
					{
						aValues = new Array();
					}
					docLearningTaskResult.TopElem.files.DeleteChildren( "This.is_expert" );
					for( oValue in aValues )
					{
						catFile = ArrayOptFind(oValue,"This.name == 'file_id'");
						if( catFile == undefined )
						{
							continue;
						}
						sValue = catFile.GetOptProperty( "url", "" );
						if( sValue != "" )
						{
							iResourceID = create_resource( catFile.GetOptProperty( "value", "" ), sValue, iPersonID );
							_child = docLearningTaskResult.TopElem.files.ObtainChildByKey( iResourceID );
							_child.is_expert = true;
						}
						else if( OptInt( catFile.GetOptProperty( "value" ) ) != undefined )
						{
							_child = docLearningTaskResult.TopElem.files.ObtainChildByKey( OptInt( catFile.GetOptProperty( "value" ) ) );
							_child.is_expert = true;
						}
					}
				}
				else if( _field.name == "status_id" )
				{
					sNewStatus = _field.value;
				}
				else if( docLearningTaskResult.TopElem.ChildExists( _field.name ) )
				{
					docLearningTaskResult.TopElem.Child( _field.name ).Value = _field.name == "mark" ? OptInt( _field.value, 0 ) : _field.value;
				}
			}
			oResStatus = null;
			if( sNewStatus != "evaluation" )
			{
				if( bHasExpertComment && !docLearningTaskResult.TopElem.expert_comment.HasValue )
				{
					oRes.action_result = { command: "alert", msg: i18n.t( 'neobhodimozapo_1' ) };
					return oRes;
				}
				if( bHasResultFiles && ArrayOptFind( docLearningTaskResult.TopElem.files, "This.is_expert == true" ) == undefined )
				{
					oRes.action_result = { command: "alert", msg: i18n.t( 'neobhodimoprik' ) };
					return oRes;
				}
				if( bHasScore )
				{
					if( !docLearningTaskResult.TopElem.mark )
					{
						oRes.action_result = { command: "alert", msg: i18n.t( 'neobhodimoukaz' ) };
						return oRes;
					}
					else
					{
						if( iMinScore != undefined && iMaxScore != undefined )
						{
							if( docLearningTaskResult.TopElem.mark > iMaxScore || docLearningTaskResult.TopElem.mark < iMinScore )
							{
								oRes.action_result = { command: "alert", msg: StrReplace( StrReplace( i18n.t( 'ocenkadolzhnaby' ), "{PARAM1}", iMinScore ), "{PARAM2}", iMaxScore ) };
								return oRes;
							}
						}
						else if( iMinScore != undefined )
						{
							if( docLearningTaskResult.TopElem.mark < iMinScore )
							{
								oRes.action_result = { command: "alert", msg: StrReplace( i18n.t( 'ocenkadolzhnaby_1' ), "{PARAM1}", iMinScore ) };
								return oRes;
							}
						}
						else if( iMaxScore != undefined )
						{
							if( docLearningTaskResult.TopElem.mark > iMaxScore )
							{
								oRes.action_result = { command: "alert", msg: StrReplace( i18n.t( 'ocenkadolzhnaby_2' ), "{PARAM1}", iMaxScore ) };
								return oRes;
							}
						}
					}
				}
				oResStatus = set_status_learning_task_result( { "learning_task_result_id": iLearningTaskResultID,
												"docLearningTaskResult": docLearningTaskResult,
												"status": sNewStatus
												} );
			}
			else
			{
				docLearningTaskResult.Save();
			}

			if( oResStatus != null && oResStatus.error != 0 )
			{
				oRes.action_result = { command: "alert", msg: oResStatus.message };
			}
			else
			{
				oRes.action_result = { command: "close_form", msg: i18n.t( 'zadaniesohrane' ), confirm_result: { command: "reload_page" } };
			}
			break;
		default:
			oRes.action_result = { command: "alert", msg: i18n.t( 'neizvestnayakom' ) };
			break;
	}
	return oRes;
}

/**
 * @typedef {Object} WTGetLearningTaskResultFilesResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oLearningTaskResultFile[]} array
*/
/**
 * @typedef {Object} oLearningTaskResultFile
 * @property {bigint} file_id - ID файла
 * @property {boolean} is_learning_task_result - Признак прикрепления к карточке выполнения задания
 * @property {bigint} source_object_id - ID карточки, к которой прикреплен файл
 * @property {date} creation_date - дата прикрепления к карточке
 * @property {string} file_name - название файла
 * @property {string} file_download_url - ссылка для открытия/загрузки файла
 * @property {string} person_fullname - ФИО пользователя, который прикрепил файл к карточке
*/
/**
 * @function GetLearningTaskResultFiles
 * @memberof Websoft.WT.Knowledge
 * @author PL
 * @description Получить список вопросов эксперту
 * @param {bigint} iLearningTaskResultID - ID выполнения задания
 * @param {bigint} iPersonID - ID сотрудника
 * @returns {WTGetLearningTaskResultFilesResult}
 */

function GetLearningTaskResultFiles( iLearningTaskResultID, iPersonID )
{
	return get_learning_task_result_files( iLearningTaskResultID, iPersonID );
}
function get_learning_task_result_files( iLearningTaskResultID, iPersonID, teLearningTaskResult )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];

	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'nekorrektnyyid_1' );
		return oRes;
	}

	try
	{
		iLearningTaskResultID = Int( iLearningTaskResultID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'nekorrektnyyid_5' );
		return oRes;
	}

	try
	{
		teLearningTaskResult.Name;
	}
	catch( ex )
	{
		try
		{
			teLearningTaskResult = OpenDoc( UrlFromDocID( iLearningTaskResultID ) ).TopElem;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = i18n.t( 'nekorrektnyyid_5' );
			return oRes;
		}
	}
	var arrFiles = new Array();
	switch( teLearningTaskResult.Name )
	{
		case "learning_task_result":
		{
			arrFiles = teLearningTaskResult.files;
			var teLearningTask = null;
			if( teLearningTaskResult.learning_task_id.HasValue )
			{
				try{
					teLearningTask = tools.open_doc( teLearningTaskResult.learning_task_id ).TopElem;
					arrFiles = ArrayUnion( arrFiles, teLearningTask.files );
				}
				catch( ex ){}
			}
			break;
		}
		case "learning_task":
		{
			arrFiles = teLearningTaskResult.files;
			break;
		}
	}
	if( ArrayOptFirstElem( arrFiles ) == undefined )
	{
		return oRes;
	}
	try
	{
		oSession = CurRequest.Session;
	}
	catch( ex )
	{
		oSession = null;
	}

	xarrFiles = QueryCatalogByKeys( 'resources', 'id', ArrayExtract( arrFiles, "This.file_id" ) );

	for( _file in xarrFiles )
	{
		oFile = new Object();
		oFile.id = _file.id.Value;
		oFile.is_learning_task_result = ( teLearningTaskResult.files.GetOptChildByKey( _file.id ) != undefined );
		oFile.source_object_id = ( oFile.is_learning_task_result ? iLearningTaskResultID : teLearningTaskResult.learning_task_id.Value );
		oFile.creation_date = _file.creation_date.Value;
		oFile.file_name = _file.name.Value;
		oFile.person_fullname = _file.person_fullname.Value;
		oFile.file_download_url = tools_web.get_object_source_url( 'resource', _file.id, { Session: oSession } );

		oRes.array.push( oFile );
	}

	return oRes;
}
/**
 * @function DeleteLearningTaskResultFile
 * @memberof Websoft.WT.Knowledge
 * @author PL
 * @description Удаление файла из карточки выполнения задания.
 * @param {string} sCommand - Текущий режим удаленного действия
 * @param {bigint} iLearningTaskResultID - ID выполнения задания
 * @param {bigint} iFileID - ID ресурса базы
 * @param {bigint} iPersonID - ID сотрудника
 * @param {boolean} bGetExpertByResult - брать эксперта из результата задания
 * @returns {WTLPEFormResult}
*/
function DeleteLearningTaskResultFile( sCommand, iLearningTaskResultID, iFileID, iPersonID, bGetExpertByResult )
{
	function check_expert()
	{
		if( bGetExpertByResult )
		{
			return iPersonID == docLearningTaskResult.TopElem.expert_id;
		}
		else
		{
			docLearningTask = tools.open_doc( docLearningTaskResult.TopElem.learning_task_id );
			if( docLearningTask != undefined )
			{
				return docLearningTask.TopElem.experts.ChildByKeyExists( iPersonID, "person_id" );
			}
		}
		return false;
	}

	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.action_result = ({});

	try{
		if( bGetExpertByResult == null || bGetExpertByResult == undefined || bGetExpertByResult == '' )
			throw 'error'
		bGetExpertByResult = tools_web.is_true( bGetExpertByResult );
	}
	catch( ex )
	{
		bGetExpertByResult = false;
	}

	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_1' ) };
		return oRes;
	}
	try
	{
		iFileID = Int( iFileID );
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_6' ) };
		return oRes;
	}
	try
	{
		iLearningTaskResultID = Int( iLearningTaskResultID );
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_5' ) };
		return oRes;
	}

	docLearningTaskResult = tools.open_doc( iLearningTaskResultID );
	if( docLearningTaskResult == undefined )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_5' ) };
		return oRes;
	}

	catFile = docLearningTaskResult.TopElem.files.GetOptChildByKey( iFileID );
	if( catFile == undefined )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'faylizusloviyz' ) };
		return oRes;
	}

	switch( docLearningTaskResult.TopElem.status_id )
	{
		case "process":
			if( catFile.is_expert || docLearningTaskResult.TopElem.person_id != iPersonID )
			{
				oRes.action_result = { command: "alert", msg: i18n.t( 'dannyyfayludal' ) };
				return oRes;
			}
			break;
		case "evaluation":
			if( !catFile.is_expert || !check_expert() )
			{
				oRes.action_result = { command: "alert", msg: i18n.t( 'dannyyfayludal' ) };
				return oRes;
			}
			break;

		default:
			oRes.action_result = { command: "alert", msg: i18n.t( 'dannyyfayludal' ) };
			return oRes;
	}

	switch( sCommand )
	{
		case "eval":
			oRes.action_result = { 	command: "display_form",
				title: i18n.t( 'vypolneniezada' ),
				header: i18n.t( 'zapolnitepolya' ),
				buttons:
				[
					{ name: "submit", label: i18n.t( 'da' ), type: "submit" },
					{ name: "cancel", label: i18n.t( 'net' ), type: "cancel" }
				],
				form_fields: [] };
			oRes.action_result.form_fields.push( { name: "paragraph", value: i18n.t( 'vydeystvitelno' ), type: "paragraph" } );

			break;
		case "submit":
			docLearningTaskResult.TopElem.files.DeleteChildByKey( iFileID );
			docLearningTaskResult.Save();

			oRes.action_result = { command: "close_form", msg: i18n.t( 'fayludalen' ), confirm_result: { command: "reload_page" } };
			break
		default:
			oRes.action_result = { command: "alert", msg: i18n.t( 'neizvestnayakom' ) };
			break;
	}
	return oRes;
}

/**
 * @typedef {Object} WTGetLearningTaskResultsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oLearningTaskResult[]} array
*/

/**
 * @typedef {Object} oLearningTaskResult
 * @property {bigint} id - ID выполнения задания
 * @property {boolean} delayed - Просрочено
 * @property {date} plan_date - Плановая дата решения
 * @property {string} title - Название задания
 * @property {string} img_url - Иконка
 * @property {string} status_id - Статус
 * @property {string} status_name - Наименование статуса
 * @property {number} score - Оценка
 * @property {string} executor - Исполнитель
 * @property {string} link - Ссылка
*/
/**
 * @function GetLearningTaskResults
 * @memberof Websoft.WT.Knowledge
 * @author PL
 * @description Получить список вопросов эксперту
 * @param {bigint} iPersonID - ID сотрудника
 * @param {string} sType - Тип отбора заданий
 * @param {string[]} arrStatuses - Массив статусов
 * @param {string} sSearch - Строка для поиска
 * @param {boolean} bGetExpertByResult - Определять экспертов по заданию или по выполнению задания
 * @param {oSimpleFilterElem[]} arrFilters - набор фильтров
 * @returns {WTGetLearningTaskResultsResult}
 */

function GetLearningTaskResults( iPersonID, sType, arrStatuses, sSearch, bGetExpertByResult, arrFilters )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];
	oRes.data = ({});

	function build_distincts()
	{
		oRes.data.SetProperty( "distincts", ({}) );
		arrDistinctStates = new Array();
		for( _state in arrStatuses )
		{
			arrDistinctStates.push( { "name": common.learning_task_status_types.GetOptChildByKey( _state ).name.Value, "value": _state } );
		}
		oRes.data.distincts.SetProperty( "f_status_id", arrDistinctStates );
		arrDistinctTypes = new Array();
		arrDistinctTypes.push( { "name": i18n.t( 'dlyaproverki' ), "value": "expert" } );
		arrDistinctTypes.push( { "name": i18n.t( 'dlyavypolneniya' ), "value": "executor" } );
		
		oRes.data.distincts.SetProperty( "f_type_id", arrDistinctTypes );
	}
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'nekorrektnyyid_1' );
		return oRes;
	}
	try{
		if( bGetExpertByResult == null || bGetExpertByResult == undefined || bGetExpertByResult == '' )
			throw 'error'
		bGetExpertByResult = tools_web.is_true( bGetExpertByResult );
	}
	catch( ex )
	{
		bGetExpertByResult = false;
	}
	
	conds = new Array();
	
	var satisfies_conds = new Array();
	xarrLearningTaskResults = new Array();
	aSatisfies = new Array();
	switch( sType )
	{
		case "":
		case "all":
		case "expert":
			if( bGetExpertByResult )
			{
				aSatisfies.push( "$elem/expert_id = " + iPersonID );
			}
			else
			{
				satisfies_conds = new Array();
				satisfies_conds.push( "$elem_lt/id = $elem/learning_task_id" );
				satisfies_conds.push( "MatchSome( $elem_lt/experts_id, ( " + iPersonID + " ) )" );

				aSatisfies.push( "( " + ArrayMerge( satisfies_conds, "This", " and " ) + "  and  $elem/status_id = 'evaluation' )" );
			}
			if( sType == "expert" )
			{
				break;
			}
		case "executor":
			aSatisfies.push( "$elem/person_id = " + iPersonID );
			break;
	}
	
	try{
		if( !IsArray( arrStatuses ) )
			throw 'error'
	}
	catch( ex )
	{
		arrStatuses = [ "assign", "process", "viewed", "success", "evaluation", "cancel", "failed" ]
	}
	build_distincts();
	if( ArrayOptFirstElem( arrStatuses ) == undefined )
	{
		return oRes;
	}
	
	for( oFilter in arrFilters )
	{
		if( oFilter.type == "search" )
		{
			if( oFilter.value != "" )
			{
				conds.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( String( oFilter.value ) ) + " )" );
			}
		}
		else
		{
			switch( oFilter.id )
			{
				case "f_status_id":
				{
					aFilterStatuses = ArrayExtract( oFilter.value, "This.value" );
					if( ArrayOptFirstElem( aFilterStatuses ) != undefined )
					{
						arrStatuses = aFilterStatuses;
					}
					break;
				}
				case "f_type_id":
				{
					aFilterTypes = ArrayExtract( oFilter.value, "This.value" );
					if( ArrayOptFirstElem( aFilterTypes ) != undefined )
					{
						aSatisfies = new Array();
						for( _type in aFilterTypes )
						{
							switch( _type )
							{
								case "expert":
									if( bGetExpertByResult )
									{
										aSatisfies.push( "$elem/expert_id = " + iPersonID );
									}
									else
									{
										satisfies_conds = new Array();
										satisfies_conds.push( "$elem_lt/id = $elem/learning_task_id" );
										satisfies_conds.push( "MatchSome( $elem_lt/experts_id, ( " + iPersonID + " ) )" );

										aSatisfies.push( "( ( " + ArrayMerge( satisfies_conds, "This", " and " ) + " ) and  $elem/status_id = 'evaluation' )" );
									}
									break;
								case "executor":
									aSatisfies.push( "$elem/person_id = " + iPersonID );
									break;
							}
						}
					}
					break;
				}
			}
		}
	}
	conds.push( "some $elem_lt in learning_tasks satisfies  ( " + ArrayMerge( aSatisfies, "This", " or " ) + " )" );
	conds.push( "MatchSome( $elem/status_id, ( " + ArrayMerge( arrStatuses, "XQueryLiteral( String( This ) )", "," ) + " ) )" );

	try{
		if( sSearch == null || sSearch == undefined || sSearch == '' )
			throw 'error';
		conds.push( "doc-contains( $elem/id, 'wt_data', " + XQueryLiteral( String( sSearch ) ) + " )" );
	}
	catch( ex )
	{
	}
	try
	{
		oSession = CurRequest.Session;
	}
	catch( ex )
	{
		oSession = null;
	}

	xarrLearningTaskResults = XQuery( "for $elem in learning_task_results where " + ArrayMerge( conds, "This", " and " ) + " return $elem" );
	if( ArrayOptFirstElem( xarrLearningTaskResults ) == undefined )
	{
		return oRes;
	}
	arrLearningTasks = ArraySelect( ArraySelectDistinct( xarrLearningTaskResults, "This.learning_task_id" ), "This.learning_task_id.HasValue" );
	xarrLearningTasks = new Array();
	if( ArrayOptFirstElem( arrLearningTasks ) != undefined )
	{
		xarrLearningTasks = XQuery( "for $elem in learning_tasks where MatchSome( $elem/id, ( " + ArrayMerge( arrLearningTasks, "This.learning_task_id", "," ) + " ) ) return $elem/Fields('id','name','resource_id')" )
	}

	for( _learning_task_result in xarrLearningTaskResults )
	{
		oLearningTaskResult = new Object();
		oLearningTaskResult.id = _learning_task_result.id.Value;
		oLearningTaskResult.delayed = _learning_task_result.expired.Value;
		oLearningTaskResult.plan_date = _learning_task_result.plan_end_date.Value;

		catLearningTask = ArrayOptFind( xarrLearningTasks, "This.id == _learning_task_result.learning_task_id" );
		oLearningTaskResult.title = ( catLearningTask != undefined ? catLearningTask.name.Value : "" );
		oLearningTaskResult.img_url = ( catLearningTask != undefined ? get_object_image_url( catLearningTask ) : "" );
		oLearningTaskResult.status_id = _learning_task_result.status_id.Value;
		oLearningTaskResult.status_name = ( _learning_task_result.status_id.HasValue ? _learning_task_result.status_id.ForeignElem.name.Value : "" );
		oLearningTaskResult.score = _learning_task_result.mark.Value;
		oLearningTaskResult.executor = _learning_task_result.person_fullname.Value;
		oLearningTaskResult.type_name = ( _learning_task_result.person_id == iPersonID ? i18n.t( 'dlyavypolneniya' ) : i18n.t( 'dlyaproverki' ) );
		oLearningTaskResult.link = tools_web.get_mode_clean_url( null, _learning_task_result.id );

		oRes.array.push( oLearningTaskResult );
	}

	return oRes;
}



/**
 * @typedef {Object} PersonCertificates
 * @property {string} img – Унифицированное изображение сертификата
 * @property {string} name – Название Тип сертификата
 * @property {string} org_name –  Название организации
 * @property {date} delivery_date – Дата выдачи
 * @property {date} expire_date – Истекает
 * @property {bool} valid – Действителен
*/
/**
 * @typedef {Object} ReturnGetPersonCertificates
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {PersonCertificates[]} array – массив
*/
/**
 * @function GetPersonCertificates
 * @memberof Websoft.WT.Knowledge
 * @description Получение сертификатов пользователя.
 * @author MD, LP
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {string} sActivityType - Тип активности.
 * @returns {ReturnGetPersonCertificates}
*/
function GetPersonCertificates( iPersonID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	try
	{
		iPersonID = Int( iPersonID );
	}
	catch ( err )
	{
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: 'Invalid param iPersonID.', param_name: 'iPersonID' }";
		return oRes;
	}

	var oCur = new Object;
	var xarrCertificates = XQuery( "for $elem in certificates where $elem/person_id = " + iPersonID + " return $elem/Fields('id','education_org_id','type_name','delivery_date','expire_date','valid')" );
	for ( catCertificateElem in xarrCertificates )
	{
		catEducationOrg = catCertificateElem.education_org_id.OptForeignElem;
		oCur = {
			id: catCertificateElem.id.Value,
			img: "/images/certificate.png",
			name: catCertificateElem.type_name.Value,
			org_name: ( catEducationOrg == undefined ? "[DELETED]" : catEducationOrg.name.Value ),
			delivery_date: catCertificateElem.delivery_date.Value,
			expire_date: catCertificateElem.expire_date.Value,
			valid: catCertificateElem.valid.Value
		};
		oRes.array.push( oCur );
	}

	return oRes;
}
function get_target_knowledge( arrCollaborators, sTargetType, arrKnowledgePartIds )
{
	try
	{
		if( sTargetType == null || sTargetType == undefined || sTargetType == "" )
		{
			throw "error";
		}
	}
	catch ( err )
	{
		sTargetType = "all";
	}
	try
	{
		if( !IsArray( arrCollaborators ) )
		{
			if( OptInt( arrCollaborators ) != undefined )
			{
				iTempCollaboratorID = OptInt( arrCollaborators );
				arrCollaborators = new Array();
				arrCollaborators.push( { "id": iTempCollaboratorID } )
			}
			else
			{
				throw "error";
			}
		}
	}
	catch( ex )
	{
		return [];
	}
	try
	{
		if( !IsArray( arrKnowledgePartIds ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		arrKnowledgePartIds = new Array();
	}
	bCheckKnowledgePart = ( ArrayOptFirstElem( arrKnowledgePartIds ) != undefined );
	function get_knowledge_profile( _knowledge_profile_id )
	{
		var catProfile = ArrayOptFindByKey( arrKnowledgeProfile, _knowledge_profile_id, "id" );
		if( catProfile == undefined )
		{
			catProfile = new Object();
			catProfile.id = RValue( _knowledge_profile_id );
			catProfile.top_elem = undefined;
			docKnowledgeProfile = tools.open_doc( _knowledge_profile_id );
			if( docKnowledgeProfile != undefined )
			{
				catProfile.top_elem = docKnowledgeProfile.TopElem;
			}
			arrKnowledgeProfile.push( catProfile );
		}
		return catProfile.top_elem;
	}
	var arrPersons = new Array();
	switch( sTargetType )
	{
		case "all":
		case "knowledge_profile":
			xarrPositions = XQuery( "for $elem_qc in positions where MatchSome($elem_qc/basic_collaborator_id, (" + ArrayMerge( arrCollaborators, "This.id", "," ) + ")) order by $elem_qc/basic_collaborator_id return $elem_qc/Fields('basic_collaborator_id','basic_collaborator_fullname','knowledge_profile_id','position_common_id')" );
			xarrPositionCommons = new Array();
			if( ArrayOptFind( xarrPositions, "This.position_common_id.HasValue" ) != undefined )
			{
				xarrPositionCommons = XQuery( "for $elem_qc in position_commons where MatchSome($elem_qc/id, (" + ArrayMerge( ArraySelect( ArraySelectDistinct( xarrPositionCommons, "This.position_common_id" ), "This.position_common_id.HasValue" ), "This.position_common_id", "," ) + ")) order by $elem_qc/id return $elem_qc/Fields('id','knowledge_profile_id')" );
			}
			xarrPositionCommons = ArraySort( xarrPositionCommons, "This.id", "+" );
			var arrKnowledgeProfile = new Array();
			var arrKnowledgeProfileIds = new Array();
			for( _position in xarrPositions )
			{
				catProfileTopElem = undefined;
				if( _position.knowledge_profile_id.HasValue )
				{
					arrKnowledgeProfileIds.push( _position.knowledge_profile_id );
				}
				else if( _position.position_common_id.HasValue )
				{
					catPositionCommon = ArrayOptFindBySortedKey( xarrPositionCommons, _position.position_common_id, "id" );
					if( catProfileTopElem != undefined && catProfileTopElem.knowledge_profile_id.HasValue )
					{
						arrKnowledgeProfileIds.push( catPositionCommon.knowledge_profile_id );
					}
				}
			}
			if( ArrayOptFirstElem( arrKnowledgeProfileIds ) != undefined )
			{
				var arrKnowledgeObjects = tools.xquery( "for $elem in knowledge_profiles where MatchSome( $elem/id, ( " + ArrayMerge( arrKnowledgeProfileIds, "This", "," ) + " ) ) return $elem/id, $elem/__data" );
				
				for( _position in xarrPositions )
				{
					iKnowledgeProfileID = undefined;
					if( _position.knowledge_profile_id.HasValue )
					{
						iKnowledgeProfileID = _position.knowledge_profile_id;
					}
					else if( _position.position_common_id.HasValue )
					{
						catPositionCommon = ArrayOptFindBySortedKey( xarrPositionCommons, _position.position_common_id, "id" );
						if( catProfileTopElem != undefined && catProfileTopElem.knowledge_profile_id.HasValue )
						{
							iKnowledgeProfileID = catPositionCommon.knowledge_profile_id;
						}
					}
					if( iKnowledgeProfileID == undefined )
					{
						continue
					}
					teKnowledgeProfile = get_knowledge_profile( iKnowledgeProfileID );
					if( teKnowledgeProfile == undefined )
					{
						continue;
					}
					for( _kp in teKnowledgeProfile.knowledge_parts )
					{
						if( bCheckKnowledgePart && ArrayOptFind( arrKnowledgePartIds, "This == _kp.knowledge_part_id" ) == undefined )
						{
							continue;
						}
						oPerson = new Object();
						oPerson.object_id = _position.basic_collaborator_id.Value;
						oPerson.object_name = _position.basic_collaborator_fullname.Value;
						oPerson.knowledge_part_id = _kp.knowledge_part_id.Value;
						oPerson.knowledge_part_name = _kp.name.Value;
						oPerson.target_level_id = _kp.target_level_id.Value;
						oPerson.target_level_index = _kp.target_level_index.Value;
						oPerson.target_level_name = _kp.target_level_name.Value;
						arrPersons.push( oPerson );
					}
					
				}
			}
			if( sTargetType == "knowledge_profile" )
			{
				break;
			}
		case "object":
			xarrKnowledgeAcquaints = XQuery( "for $elem_qc in knowledge_acquaints where MatchSome($elem_qc/person_id, (" + ArrayMerge( arrCollaborators, "This.id", "," ) + ")) order by $elem_qc/knowledge_part_id return $elem_qc/Fields('knowledge_part_id','knowledge_part_name','person_id','person_fullname','level_id','level_name','level_index','state_id','finish_date','type_id')" );
			if( bCheckKnowledgePart )
			{
				xarrKnowledgeAcquaints = ArrayIntersect( xarrKnowledgeAcquaints, arrKnowledgePartIds, "This.knowledge_part_id", "This" );
			}
			xarrKnowledgeAcquaints = ArraySelect( xarrKnowledgeAcquaints, "This.type_id == 'corporative' && ( This.state_id == 'plan' || This.state_id == 'process' || This.state_id == 'active' ) && ( !This.finish_date.HasValue || This.finish_date > Date() )" );
			for( _kp in xarrKnowledgeAcquaints )
			{
				oPerson = new Object();
				oPerson.object_id = _kp.person_id.Value;
				oPerson.object_name = _kp.person_fullname.Value;
				oPerson.knowledge_part_id = _kp.knowledge_part_id.Value;
				oPerson.knowledge_part_name = _kp.knowledge_part_name.Value;
				oPerson.target_level_id = _kp.level_id.Value;
				oPerson.target_level_index = _kp.level_index.Value;
				oPerson.target_level_name = _kp.level_name.Value;
				arrPersons.push( oPerson );
			}
			break;
	}
	
	return ArraySelectDistinct( arrPersons, "This.knowledge_part_id + '_' + This.object_id" );
}
/**
 * @typedef {Object} oPersonKnowledgeCollaborators
 * @property {bigint} id
 * @property {string} fullname – ФИО
 * @property {string} person_icon – Иконка сотрудника
 * @property {string} level – Название уровня
 * @property {number} level_index – уровень
*/
/**
 * @typedef {Object} oKnowledgeCollaborators
 * @property {bigint} id
 * @property {string} name – название
 * @property {oPersonKnowledgeCollaborators[]} array – массив сотрудников
*/
/**
 * @typedef {Object} ReturnGetKnowledgeCollaborators
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oKnowledgeCollaborators[]} array – массив
*/
/**
 * @function GetKnowledgeCollaborators
 * @memberof Websoft.WT.Knowledge
 * @description Получение знаний сотрудника.
 * @author PL
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {string} sType - Тип знаний.
 * @param {string} [sTargetType] - Тип отбора для требуемого уровня.
 * @param {string} [sReturnType] - Тип возвращаемых данных.
 * @param {number} [iMaxLen] - Максимальное количество возвращаемых записей.
 * @returns {ReturnGetKnowledgeCollaborators}
*/
function GetKnowledgeCollaborators( iPersonID, sType, sTargetType, sReturnType, iMaxLen )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	try
	{
		iPersonID = Int( iPersonID );
	}
	catch ( err )
	{
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: 'Invalid param iPersonID.', param_name: 'iPersonID' }";
		return oRes;
	}
	try
	{
		iMaxLen = OptInt( iMaxLen );
	}
	catch ( err )
	{
		iMaxLen = undefined;
	}
	try
	{
		if( sReturnType == null || sReturnType == undefined || sReturnType == "" )
		{
			throw "error";
		}
	}
	catch ( err )
	{
		sReturnType = "pn";
	}

	try
	{
		if( sType == null || sType == undefined || sType == "" )
		{
			throw "error";
		}
	}
	catch ( err )
	{
		sType = "current";
	}
	try
	{
		if( sTargetType == null || sTargetType == undefined || sTargetType == "" )
		{
			throw "error";
		}
	}
	catch ( err )
	{
		sTargetType = "all";
	}
	
	function get_person_data( catPerson, sLevelName )
	{
		var oPerson = new Object();
		var iObjectPersonID = "";
		try
		{
			iObjectPersonID = (  catPerson.ChildExists( "object_id" ) ? catPerson.object_id.Value : catPerson.person_id.Value );
		}
		catch( ex )
		{
			iObjectPersonID = (  catPerson.GetOptProperty( "object_id" ) != undefined ? catPerson.object_id : catPerson.person_id );
		}
		oPerson.id = String( iObjectPersonID );
		
		oPerson.link_url  = "/knowledge/" + oPerson.id;
		
		catPerson = ArrayOptFindByKey( arrCollaborators, iObjectPersonID, "id" );
		if( catPerson != undefined )
		{
			oPerson.name = RValue( catPerson.fullname );
			oPerson.position = RValue( catPerson.position_name );
			oPerson.subdivision = RValue( catPerson.position_parent_name );
		}
		else
		{
			oPerson.name = "";
			oPerson.position = "";
			oPerson.subdivision = "";
		}
		oPerson.img_url  = tools_web.get_object_source_url( 'person', oPerson.id );
		oPerson.comment = sLevelName;
		return oPerson;
	}
	
	arrCollaborators = tools.call_code_library_method( "libMain", "GetTypicalSubordinates", [ iPersonID, null, null, false] );
	if( ArrayOptFirstElem( arrCollaborators ) == undefined )
	{
		return oRes;
	}

	switch( sType )
	{
		case "interest":
			xarrKnowledgeAcquaints = XQuery( "for $elem_qc in knowledge_acquaints where MatchSome($elem_qc/person_id, (" + ArrayMerge( arrCollaborators, "This.id", "," ) + ")) order by $elem_qc/knowledge_part_id return $elem_qc/Fields('knowledge_part_id','knowledge_part_name','person_id','person_fullname','level_name','level_index','state_id','finish_date','type_id', 'level_id' )" );
			xarrKnowledgeAcquaints = ArraySelect( xarrKnowledgeAcquaints, "This.type_id == 'interest'" );
		case "current":
			if( sType == "current" )
			{
				xarrKnowledgeAcquaints = XQuery( "for $elem_qc in knowledge_acquaints where MatchSome($elem_qc/person_id, (" + ArrayMerge( arrCollaborators, "This.id", "," ) + "))  order by $elem_qc/knowledge_part_id return $elem_qc/Fields('knowledge_part_id','knowledge_part_name','person_id','person_fullname','level_name','level_index','state_id','finish_date', 'level_id' )" );
			}
			xarrKnowledgeAcquaints = ArraySelect( xarrKnowledgeAcquaints, "This.state_id == 'active' && ( !This.finish_date.HasValue || This.finish_date > Date() )" );
			for( _kp in ArraySelectDistinct( xarrKnowledgeAcquaints, "This.knowledge_part_id" ) )
			{
				arrPersons = ArraySelectBySortedKey( xarrKnowledgeAcquaints, _kp.knowledge_part_id, "knowledge_part_id" );
				arrPersons = ArraySelectDistinct( ArraySort( arrPersons, "This.level_index", "-" ), "This.person_id" );
				docKnowledgePart = tools.open_doc( _kp.knowledge_part_id );
				if( ArrayOptFirstElem( docKnowledgePart.TopElem.levels ) == undefined )
				{
					arrLevels = [ { ChildIndex: "", name: "" } ];
				}
				else
				{
					arrLevels = docKnowledgePart.TopElem.levels;
				}
				for( _level in arrLevels )
				{
					if( _level.ChildIndex != "" )
					{
						arrLevelPersons = ArraySelectByKey( arrPersons, _level.ChildIndex, "level_index" );
					}
					else
					{
						arrLevelPersons = arrPersons;
					}
					oKP = new Object();
					oKP.id = String( _kp.knowledge_part_id.Value ) + _level.ChildIndex;
					oKP.name = _kp.knowledge_part_name.Value + ( _level.name != "" ? ( " (" + _level.name + ")" ) : "" );
					oKP.link = "/lxpknowledge/" + _kp.knowledge_part_id.Value;
					//oKP.SetProperty( "c0", ({ items: [], total: 0, items_left: 0 }) );
					oColumn = ({ items: [], total: 0, items_left: 0, cell_display: sReturnType });
					for( _person in arrLevelPersons )
					{
						if( iMaxLen != undefined && oColumn.total >= iMaxLen )
						{
							oColumn.total++;
							oColumn.items_left++;
						}
						else
						{
							oColumn.items.push( get_person_data( _person, _person.level_name.Value ) );
							oColumn.total++;
						}
					}
					if( ArrayOptFirstElem( oColumn.items ) == undefined )
					{
						continue;
					}
					oKP.SetProperty( "c0", EncodeJson( oColumn ) );
					oRes.array.push( oKP );
				}
			}
			break;
		case "target":
			var arrTargetKnowledges = get_target_knowledge( arrCollaborators, sTargetType );
			for( _kp in ArraySelectDistinct( arrTargetKnowledges, "This.knowledge_part_id" ) )
			{
				arrPersons = ArraySelectByKey( arrTargetKnowledges, _kp.knowledge_part_id, "knowledge_part_id" );
				arrPersons = ArraySelectDistinct( ArraySort( arrPersons, "This.target_level_index", "-" ), "This.object_id" );
				docKnowledgePart = tools.open_doc( _kp.knowledge_part_id );
				if( ArrayOptFirstElem( docKnowledgePart.TopElem.levels ) == undefined )
				{
					arrLevels = [ { ChildIndex: "", name: "" } ];
				}
				else
				{
					arrLevels = docKnowledgePart.TopElem.levels;
				}
				for( _level in arrLevels )
				{
					if( _level.ChildIndex != "" )
					{
						arrLevelPersons = ArraySelectByKey( arrPersons, _level.ChildIndex, "target_level_index" );
					}
					else
					{
						arrLevelPersons = arrPersons;
					}
					oKP = new Object();
					oKP.id = String( RValue( _kp.knowledge_part_id ) ) + _level.ChildIndex;
					oKP.name = RValue( _kp.knowledge_part_name ) + ( _level.name != "" ? ( " (" + _level.name + ")" ) : "" );
					oKP.link = "/lxpknowledge/" + _kp.knowledge_part_id;
					//oKP.SetProperty( "c0", "" );
					oColumn = ({ items: [], total: 0, items_left: 0, cell_display: sReturnType  });
					for( _person in arrLevelPersons )
					{
						if( iMaxLen != undefined && oColumn.total >= iMaxLen )
						{
							oColumn.total++;
							oColumn.items_left++;
						}
						else
						{
							oColumn.items.push( get_person_data( _person, RValue( _person.target_level_name ) ) );
							oColumn.total++;
						}
					}
					if( ArrayOptFirstElem( oColumn.items ) == undefined )
					{
						continue;
					}
					oKP.SetProperty( "c0", EncodeJson( oColumn ) );
					oRes.array.push( oKP );
				}
			}
			break;
		case "problem":
			var arrTargetKnowledges = get_target_knowledge( arrCollaborators, sTargetType );
			xarrKnowledgeAcquaints = XQuery( "for $elem_qc in knowledge_acquaints where MatchSome($elem_qc/person_id, (" + ArrayMerge( arrCollaborators, "This.id", "," ) + ")) order by $elem_qc/knowledge_part_id return $elem_qc/Fields('knowledge_part_id','knowledge_part_name','person_id','person_fullname','level_name','level_index','state_id','finish_date',type_id' )" );
			xarrKnowledgeAcquaints = ArraySelect( xarrKnowledgeAcquaints, "This.state_id == 'active' && ( !This.finish_date.HasValue || This.finish_date > Date() )" );
			for( _kp in ArraySelectDistinct( arrTargetKnowledges, "This.knowledge_part_id" ) )
			{
				if( _kp.target_level_index == "" )
				{
					continue;
				}
				arrPersons = ArraySelectByKey( arrTargetKnowledges, _kp.knowledge_part_id, "knowledge_part_id" );
				arrPersons = ArraySelectDistinct( ArraySort( arrPersons, "This.target_level_index", "-" ), "This.object_id" );
				arrPersonKnowledgeAcquaint = ArraySelectBySortedKey( xarrKnowledgeAcquaints, _kp.knowledge_part_id, "knowledge_part_id" );
				arrPersonKnowledgeAcquaint = ArraySelectDistinct( ArraySort( arrPersonKnowledgeAcquaint, "This.level_index", "-" ), "This.person_id" );
				
				docKnowledgePart = tools.open_doc( _kp.knowledge_part_id );
				if( ArrayOptFirstElem( docKnowledgePart.TopElem.levels ) == undefined )
				{
					arrLevels = [ { ChildIndex: "", name: "" } ];
				}
				else
				{
					arrLevels = docKnowledgePart.TopElem.levels;
				}
				for( _level in arrLevels )
				{
					if( _level.ChildIndex != "" )
					{
						arrLevelPersons = ArraySelectByKey( arrPersons, _level.ChildIndex, "target_level_index" );
					}
					else
					{
						arrLevelPersons = arrPersons;
					}
					oKP = new Object();
					oKP.id = String( RValue( _kp.knowledge_part_id ) ) + _level.ChildIndex;
					oKP.name = RValue( _kp.knowledge_part_name ) + ( _level.name != "" ? ( " (" + _level.name + ")" ) : "" );
					oKP.link = "/lxpknowledge/" + _kp.knowledge_part_id;
					oColumn = ({ items: [], total: 0, items_left: 0, cell_display: sReturnType  });
					for( _person in arrLevelPersons )
					{
						catKnowledgeAcquaint = ArrayOptFindByKey( arrPersonKnowledgeAcquaint, _person.object_id, "person_id" );
						if( catKnowledgeAcquaint != undefined && ( catKnowledgeAcquaint.level_index.HasValue && catKnowledgeAcquaint.level_index >= _kp.target_level_index ) )
						{
							continue;
						}
						if( iMaxLen != undefined && oColumn.total >= iMaxLen )
						{
							oColumn.total++;
							oColumn.items_left++;
						}
						else
						{
							oColumn.items.push( get_person_data( _person, ( catKnowledgeAcquaint != undefined ? catKnowledgeAcquaint.level_name : "" ) ) );
							oColumn.total++;
						}
					}
					if( ArrayOptFirstElem( oColumn.items ) == undefined )
					{
						continue;
					}
					oKP.SetProperty( "c0", EncodeJson( oColumn ) );
					oRes.array.push( oKP );
				}
			}
			break;
	}
	

	return oRes;
}
/**
 * @typedef {Object} ReturnCheckAcquainAssign
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
*/
/**
 * @function CheckAcquainAssign
 * @memberof Websoft.WT.Knowledge
 * @description Проверка назначенного ознакомления на завершенность
 * @author PL
 * @param {bigint} iAcquaintAssignID - назначенное ознакомление.
 * @param {boolean} [bActivateAssessment] - Назначать тесты если они не были пройдены.
 * @returns {ReturnCheckAcquainAssign}
*/
function CheckAcquainAssign( iAcquaintAssignID, bActivateAssessment )
{
	var oRes = tools.get_code_library_result_object();
	
	try
	{
		iAcquaintAssignID = Int( iAcquaintAssignID );
	}
	catch ( err )
	{
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: 'Invalid param iAcquaintAssignID.', param_name: 'iAcquaintAssignID' }";
		return oRes;
	}
	try{
		if( bActivateAssessment == null || bActivateAssessment == undefined || bActivateAssessment == '' )
			throw 'error'
		bActivateAssessment = tools_web.is_true( bActivateAssessment );
	}
	catch( ex )
	{
		bActivateAssessment = false;
	}
	
	docAcquaintAssignDoc = tools.open_doc( iAcquaintAssignID );
	docAcquaintAssign = docAcquaintAssignDoc.TopElem;
	
	if( docAcquaintAssign.state_id == "familiar" )
	{
		return oRes;
	}
	
	if( docAcquaintAssign.acquaint_id.HasValue )
	{
		docAcquaint = teCheckedObject = OpenDoc( UrlFromDocID( Int( docAcquaintAssign.acquaint_id ) ) ).TopElem;
	}
	else
	{
		teCheckedObject = OpenDoc( UrlFromDocID( Int( docAcquaintAssign.object_id ) ) ).TopElem;
	}
	
	if( teCheckedObject.ChildExists( "assessments" ) )
	{
		xarrTestLearnings = XQuery( "for $elem in test_learnings where $elem/person_id = " + docAcquaintAssign.person_id + " and $elem/state_id = 4  return $elem" );
		xarrActiveTestLearnings = XQuery( "for $elem in active_test_learnings where $elem/person_id = " + docAcquaintAssign.person_id + " and $elem/state_id = 4  return $elem" );
		arrNotLearningTests = new Array()
		for( asses in teCheckedObject.assessments )
		{
			assessment = ArrayOptFind( xarrTestLearnings, "This.assessment_id == asses.PrimaryKey" );
			if( assessment == undefined )
			{
				arrNotLearningTests.push( asses.PrimaryKey );
				if( ArrayOptFind( xarrActiveTestLearnings, "This.assessment_id == asses.PrimaryKey" ) == undefined )
				{
					if( bActivateAssessment )
					{
						tools.activate_test_to_person( docAcquaintAssign.person_id, asses.PrimaryKey );
					}
					else
					{
						oRes.error = 1;
						return oRes;
					}
				}
			}
		}
		if( ArrayOptFirstElem( arrNotLearningTests ) != undefined )
		{
			oRes.error = 1;
			return oRes;
		}
	}
	if( !check_questions( teCheckedObject, docAcquaintAssign ) )
	{
		oRes.error = 1;
		return oRes;
	}
	docAcquaintAssign.finish_date = Date();
	docAcquaintAssign.state_id = 'familiar';
	docAcquaintAssignDoc.Save();
	return oRes
}

/**
 * @function RunKnowledgeAcquaintAction
 * @memberof Websoft.WT.Knowledge
 * @author PL
 * @deprecated с v.2023.2. В функции реализована интерфейсная часть УД. Код перенесен в файл УД.
 * @description Действия над знаниями сотрудника.
 * @param {bigint} iUserID - Текущий пользователь
 * @param {bigint} iPersonID - ID сотрудника
 * @param {bigint} iKnowledgePartID - ID значения карты знаний
 * @param {bigint} iKnowledgeClassifierID - ID классификатора знаний
 * @param {string} sActionType - действие
 * @param {boolean} bInterestSendNotification - Включить/отключить отправку уведомлений руководителям при изменении области интересов
 * @param {boolean} bCorpSendNotification - Включить/отключить отправку уведомлений сотрудникам при изменении корпоративных знаний
 * @param {boolean} bBossChangeCorpKnowledge - Разрешить/запретить непосредственным руководителям изменять требования к корпоративным знаниям для подчиненных
 * @param {boolean} bFuncManagerChangeCorpKnowledge - Разрешить/запретить функциональным руководителям изменять требования к корпоративным знаниям для подчиненных
 * @param {bigint[]} arrBossTypeIDs - Типы функциональных руководителей, которым разрешено изменять знаний подчиненным
 * @param {boolean} bPersonChangeInterestKnowledge - Разрешить/запретить сотрудникам изменять знания области интересов
 * @param {WTScopeWvars} SCOPE_WVARS - JSON объект с параметрами удаленного действия
 * @returns {WTLPEFormResult}
*/
function RunKnowledgeAcquaintAction( iUserID, iPersonID, iKnowledgePartID, iKnowledgeClassifierID, sActionType, bInterestSendNotification, bCorpSendNotification, bBossChangeCorpKnowledge, bFuncManagerChangeCorpKnowledge, arrBossTypeIDs, bPersonChangeInterestKnowledge, SCOPE_WVARS )
{
	
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
		catch( err ){}
	}
	function arr_buttons()
	{
		return [
					{ name: "cancel", label: ms_tools.get_const('c_cancel'), type: "cancel", css_class: "btn-submit-custom" },
					{ name: "submit", label: "OK", type: "submit", css_class: "btn-cancel-custom" }
				];
	}
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.action_result = ({});

	try
	{
		iUserID = Int( iUserID );
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_7' ) };
		return oRes;
	}
	try
	{
		if( sActionType != "add" && sActionType != "del" && sActionType != "edit" )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'peredannekorre_3' ) };
		return oRes;
	}
	
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.action_result = { command: "alert", msg: i18n.t( 'neperedanidsot_1' ) };
		return oRes;
	}
	oFormFields = null;
	var form_fields = SCOPE_WVARS.GetOptProperty( "form_fields", "" )
	if ( form_fields != "" )
	{
		oFormFields = ParseJson( form_fields );
	}
	try
	{
		if( bBossChangeCorpKnowledge == null || bBossChangeCorpKnowledge == undefined || bBossChangeCorpKnowledge == "" )
		{
			throw "error";
		}
		bBossChangeCorpKnowledge = tools_web.is_true( bBossChangeCorpKnowledge );
	}
	catch( ex )
	{
		bBossChangeCorpKnowledge = true;
	}
	try
	{
		if( bFuncManagerChangeCorpKnowledge == null || bFuncManagerChangeCorpKnowledge == undefined || bFuncManagerChangeCorpKnowledge == "" )
		{
			throw "error";
		}
		bFuncManagerChangeCorpKnowledge = tools_web.is_true( bFuncManagerChangeCorpKnowledge );
	}
	catch( ex )
	{
		bFuncManagerChangeCorpKnowledge = false;
	}
	try
	{
		if( bPersonChangeInterestKnowledge == null || bPersonChangeInterestKnowledge == undefined || bPersonChangeInterestKnowledge == "" )
		{
			throw "error";
		}
		bPersonChangeInterestKnowledge = tools_web.is_true( bPersonChangeInterestKnowledge );
	}
	catch( ex )
	{
		bPersonChangeInterestKnowledge = true;
	}
	try
	{
		if( !IsArray( arrBossTypeIDs ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		arrBossTypeIDs = new Array();
	}
	
	var sKnowledgeAcquaintType = "";
	if( iUserID == iPersonID )
	{
		sKnowledgeAcquaintType = "interest";
		if( !bPersonChangeInterestKnowledge )
		{
			oRes.action_result = { command: "alert", msg: i18n.t( 'sotrudnikunera' ) };
			return oRes;
		}
	}
	else
	{
		sKnowledgeAcquaintType = "corporative";
		if( ( !bBossChangeCorpKnowledge && ( !bFuncManagerChangeCorpKnowledge || ArrayOptFirstElem( arrBossTypeIDs ) == undefined ) ) || !tools.call_code_library_method( "libMain", "is_boss", [ iPersonID, null, iUserID, bBossChangeCorpKnowledge, ( bFuncManagerChangeCorpKnowledge ? arrBossTypeIDs : null  ) ] ).is_boss )
		{
			oRes.action_result = { command: "alert", msg: i18n.t( 'vamnerazresheno' ) };
			return oRes;
		}
	}
	
	iKnowledgeClassifierID = OptInt( iKnowledgeClassifierID, null );
	
	try
	{
		iKnowledgePartID = Int( iKnowledgePartID );
	}
	catch( ex )
	{
		catSelectedObjects = ArrayOptFind( oFormFields, "This.name == 'knowledge_part_id'" )
		if( catSelectedObjects != undefined && catSelectedObjects.value != "" )
		{
			iKnowledgePartID = Int( catSelectedObjects.value );
		}
		else
		{
			sQueryQual = ( iKnowledgeClassifierID != null ? "$elem/knowledge_classifier_id = " + iKnowledgeClassifierID : "" );
			oRes.action_result = {
					command: "display_form",
					title: ( sActionType != "edit" ? i18n.t( 'vyberiteznanie' ) : i18n.t( 'vyberiteznanie' ) ),
					message: ( sActionType != "edit" ? i18n.t( 'vyberiteznanie' ) : i18n.t( 'vyberiteznanie' ) ),
					form_fields:
						[
							{
								name: "knowledge_part_id",
								label: i18n.t( 'znanie' ),
								type: "foreign_elem",
								mandatory: true,
								catalog: "knowledge_part",
								query_qual: sQueryQual,
								value: "",
								title: i18n.t( 'vyberiteznanie' ),	
							},
						],
					buttons: arr_buttons(),
					no_buttons: false
				};
			merge_form_fields();
			return oRes;
		}
	}
	
	try
	{
		if( bInterestSendNotification == null || bInterestSendNotification == undefined || bInterestSendNotification == "" )
		{
			throw "error";
		}
		bInterestSendNotification = tools_web.is_true( bInterestSendNotification );
	}
	catch( ex )
	{
		bInterestSendNotification = false;
	}
	try
	{
		if( bCorpSendNotification == null || bCorpSendNotification == undefined || bCorpSendNotification == "" )
		{
			throw "error";
		}
		bCorpSendNotification = tools_web.is_true( bCorpSendNotification );
	}
	catch( ex )
	{
		bCorpSendNotification = false;
	}
	
	var acquaint_conds = new Array();
	acquaint_conds.push( "$elem/type_id = " + XQueryLiteral( sKnowledgeAcquaintType ) );
	acquaint_conds.push( "$elem/knowledge_part_id = " + iKnowledgePartID );
	acquaint_conds.push( "$elem/person_id = " + iPersonID );
	//acquaint_conds.push( "$elem/confirmation_date >= " + XQueryLiteral( Date() ) );
	acquaint_conds.push( "( $elem/finish_date > " + XQueryLiteral( Date() ) + " or $elem/finish_date = null() )" );
	acquaint_conds.push( "MatchSome( $elem/state_id, ( 'active', 'plan', 'process' ) )" );
	
	if( sActionType == "del" )
	{
		acquaint_conds.push( "$elem/type_id = '" + ( iUserID == iPersonID ? "interest" : "corporative" ) + "'" );
	}
	
	xarrKnowledgeAcquaints = XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( acquaint_conds, "This", " and " ) + " order by $elem/level_index descending return $elem" );
	catKnowledgeAcquaint = ArrayOptFirstElem( xarrKnowledgeAcquaints );
	
	sCommand = SCOPE_WVARS.GetOptProperty( "command" );
	switch( sActionType )
	{
		case "del":
			
			catConfirm = ArrayOptFind( oFormFields, "This.name == 'del_confirm'" )
			if( catConfirm == undefined )
			{
				oRes.action_result = {
					command: "display_form",
					title: ( i18n.t( 'podtverzhdenie' ) ),
					message: ( i18n.t( 'podtverzhdenie' ) ),
					form_fields:
						[
							{
								name: "del_confirm",
								type: "hidden",
								value: true,
							},
							{ 
								name: "del_confirm_paragraph_title", 
								type: "paragraph",  
								value: i18n.t( 'vydeystvitelno_1' )
							}
						],
					buttons: [
						{ name: "cancel", label: ms_tools.get_const('c_no'), type: "cancel", css_class: "btn-submit-custom" },
						{ name: "submit", label: ms_tools.get_const('c_yes'), type: "submit", css_class: "btn-cancel-custom" }
					],
					no_buttons: false
				};
				merge_form_fields();
				return oRes
			}
			var docToSendNotification = undefined
			for( _ka in xarrKnowledgeAcquaints )
			{
				docKnowledgeAcquaint = tools.open_doc( _ka.id );
				if( docKnowledgeAcquaint != undefined )
				{
					docKnowledgeAcquaint.TopElem.state_id = "cancel";
					docKnowledgeAcquaint.Save();
					docToSendNotification = docKnowledgeAcquaint;
				}
			}
			
			if( docToSendNotification != undefined )
			{
				if( docToSendNotification.TopElem.type_id == "interest" )
				{
					if( bInterestSendNotification )
					{
						for ( iBossID in tools.get_uni_user_bosses( iPersonID, { 'return_object_type': 'collaborator', 'return_object_value': 'id' } ) )
						{
							tools.create_notification( "delete_knowledge_acquaint_boss", iBossID, "", docToSendNotification.DocID, null, docToSendNotification.TopElem );
						}
					}
				}
				else
				{
					if( bCorpSendNotification )
					{
						tools.create_notification( "delete_knowledge_acquaint", iPersonID, "", docToSendNotification.DocID, null, docToSendNotification.TopElem );
					}
				}
			}
			
			oRes.action_result = { command: "close_form", msg: i18n.t( 'znanieudaleno' ), confirm_result: { command: "reload_page" } };
			break;
		default:
			if( sActionType == "add" && catKnowledgeAcquaint != undefined )
			{
				oRes.action_result = { command: "alert", msg: i18n.t( 'etoznanieuzhevh' ) };
				return oRes;
			}
			catConfirm = ArrayOptFind( oFormFields, "This.name == 'edit_confirm'" );
			
			docKnowledgePart = tools.open_doc( iKnowledgePartID );
			if( docKnowledgePart == undefined )
			{
				oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_8' ) };
				return oRes;
			}
			if( catConfirm == undefined )
			{
				
				oRes.action_result = {
					command: "display_form",
					title: ( sActionType == "edit" ? i18n.t( 'izmenenieznaniya' ) : i18n.t( 'dobavlenieznan' ) ),
					message: ( sActionType == "edit" ? i18n.t( 'izmenenieznaniya' ) : i18n.t( 'dobavlenieznan' ) ),
					form_fields:
						[
							{
								name: "edit_confirm",
								type: "hidden",
								value: true,
							},
							{ 
								name: "edit_confirm_paragraph_title", 
								type: "paragraph",  
								value: docKnowledgePart.TopElem.name.Value
							}
						],
					buttons: [
						{ name: "cancel", label: ms_tools.get_const('c_no'), type: "cancel", css_class: "btn-submit-custom" },
						{ name: "submit", label: ms_tools.get_const('c_yes'), type: "submit", css_class: "btn-cancel-custom" }
					],
					no_buttons: false
				};
				obj = { name: "level_id", label: i18n.t( 'vyberitecelevo' ), type: "select", value: "", mandatory: true, validation: "nonempty", entries: [] };

				for( _level in docKnowledgePart.TopElem.levels )
				{
					if( catKnowledgeAcquaint != undefined && catKnowledgeAcquaint.level_id == _level.id )
					{
						continue;
					}
					obj.entries.push( { name: _level.name.Value, value: _level.id.Value } );
				}
				oRes.action_result.form_fields.push( obj );
				oRes.action_result.form_fields.push( { name: "comment", label: i18n.t( 'opishiteurovenz' ), type: "text", mandatory: false } );
				oRes.action_result.form_fields.push( { name: "file_id", label: i18n.t( 'fayl' ), type: "file", value: "", display_value: "" } );
				merge_form_fields();
				return oRes
			}
			
			catFieldLevel = ArrayOptFind( oFormFields, "This.name == 'level_id'" );
			catLevel = docKnowledgePart.TopElem.levels.GetOptChildByKey( catFieldLevel.value );
			
			var docNewKnowledgeAcquaint = undefined;
			if( ArrayOptFind( xarrKnowledgeAcquaints, "This.level_index >= catLevel.ChildIndex" ) != undefined )
			{
				if( ArrayOptFind( xarrKnowledgeAcquaints, "This.level_id == catLevel.id && ( This.state_id == 'plan' || This.state_id == 'process' ) && This.type_id == '" + sKnowledgeAcquaintType + "'" ) != undefined )
				{
					docNewKnowledgeAcquaint = tools.open_doc( ArrayOptFind( xarrKnowledgeAcquaints, "This.level_index == catLevel.ChildIndex && ( This.state_id == 'plan' || This.state_id == 'process' )" ).id );
				}
				for( _ka in ArraySelect( xarrKnowledgeAcquaints, "This.level_index >= catLevel.ChildIndex && This.type_id == '" + sKnowledgeAcquaintType + "'" ) )
				{
					if( docNewKnowledgeAcquaint != undefined && docNewKnowledgeAcquaint.DocID == _ka.id )
					{
						continue;
					}
					docKnowledgeAcquaint = tools.open_doc( _ka.id );
					if( docKnowledgeAcquaint != undefined )
					{
						docKnowledgeAcquaint.TopElem.state_id = "cancel";
						docKnowledgeAcquaint.Save();
					}
				}
			}

			if( docNewKnowledgeAcquaint == undefined )
			{
				docNewKnowledgeAcquaint = OpenNewDoc( 'x-local://wtv/wtv_knowledge_acquaint.xmd' );
				docNewKnowledgeAcquaint.BindToDb( DefaultDb );
				
				docNewKnowledgeAcquaint.TopElem.type_id = sKnowledgeAcquaintType;
				docNewKnowledgeAcquaint.TopElem.person_id = iPersonID;
				//docNewKnowledgeAcquaint.TopElem.type_id = ( iUserID == iPersonID ? "interest" : "corporative" );
				tools.common_filling( 'collaborator', docNewKnowledgeAcquaint.TopElem, iPersonID );
				
				docNewKnowledgeAcquaint.TopElem.knowledge_part_id = iKnowledgePartID;
				docNewKnowledgeAcquaint.TopElem.knowledge_part_name = docKnowledgePart.TopElem.name.Value;
			}

			sConfirmationType = (catLevel != undefined && catLevel.confirmation_type.HasValue) ? catLevel.confirmation_type : docKnowledgePart.TopElem.confirmation_type;
			if( sConfirmationType == "none" )
			{
				if( !docNewKnowledgeAcquaint.TopElem.state_id.HasValue || docNewKnowledgeAcquaint.TopElem.state_id == "plan" || docNewKnowledgeAcquaint.TopElem.state_id == "process" )
				{
					docNewKnowledgeAcquaint.TopElem.state_id = "active";
				}
			}
			docNewKnowledgeAcquaint.TopElem.level_id = catLevel.id.Value;
			docNewKnowledgeAcquaint.TopElem.level_name = catLevel.name.Value;
			docNewKnowledgeAcquaint.TopElem.level_index = catLevel.ChildIndex;
			
			for( _field in oFormFields )
			{
				switch( _field.name )
				{
					case "comment":
					{
						docNewKnowledgeAcquaint.TopElem.comment = _field.value;
						break
					}
					case "file_id":
					{
						sValue = _field.GetOptProperty( "url", "" )
						if( sValue != "" )
						{
							iResourceID = create_resource( _field.GetOptProperty( "value", "" ), sValue, iUserID );
							docNewKnowledgeAcquaint.TopElem.files.ObtainChildByKey( iResourceID );
						}
						break
					}
				}
			}
			
			docNewKnowledgeAcquaint.TopElem.confirmation_type = catLevel.confirmation_type.Value;
			switch( docNewKnowledgeAcquaint.TopElem.confirmation_type )
			{
				case "courses_assessments":
				{
					docNewKnowledgeAcquaint.TopElem.confirmation_assessments.AssignElem( catLevel.confirmation_assessments );
					docNewKnowledgeAcquaint.TopElem.confirmation_courses.AssignElem( catLevel.confirmation_courses );
					break;
				}
				case "certificates":
				{
					docNewKnowledgeAcquaint.TopElem.confirmation_certificates.AssignElem( catLevel.confirmation_certificates );
					break;
				}
				case "expert":
				{
					docNewKnowledgeAcquaint.TopElem.confirmation_expert_type = catLevel.confirmation_expert_type;
					docNewKnowledgeAcquaint.TopElem.confirmation_boss_type_id = catLevel.confirmation_boss_type_id;
					docNewKnowledgeAcquaint.TopElem.confirmation_person_id = catLevel.confirmation_person_id;
					break;
				}
				case "activity":
				{
					docNewKnowledgeAcquaint.TopElem.cost = catLevel.cost;
					docNewKnowledgeAcquaint.TopElem.currency_type_id = catLevel.currency_type_id;
					break;
				}
			}
			
			docNewKnowledgeAcquaint.Save();
			
			if( docNewKnowledgeAcquaint.TopElem.type_id == "interest" )
			{
				if( bInterestSendNotification )
				{
					for ( iBossID in tools.get_uni_user_bosses( iPersonID, { 'return_object_type': 'collaborator', 'return_object_value': 'id' } ) )
					{
						tools.create_notification( ( catKnowledgeAcquaint == undefined ? "create" : "change" ) + "_knowledge_acquaint_boss", iBossID, "", docNewKnowledgeAcquaint.DocID, null, docNewKnowledgeAcquaint.TopElem );
					}
				}
			}
			else
			{
				if( bCorpSendNotification )
				{
					tools.create_notification( ( catKnowledgeAcquaint == undefined ? "create" : "change" ) + "_knowledge_acquaint", iPersonID, "", docNewKnowledgeAcquaint.DocID, null, docNewKnowledgeAcquaint.TopElem );
				}
			}
			
			
			oRes.action_result = { command: "close_form", msg: i18n.t( 'znaniedobavleno' ), confirm_result: { command: "reload_page" } };
			break;
	}
	
	return oRes;
}

function GetKnowledgeAcquaintProfile(iPersonID, iKnowledgePartID, sKnowledgeAcquaintType)
{
	var acquaint_conds = [];
	acquaint_conds.push( "$elem/type_id = " + XQueryLiteral( sKnowledgeAcquaintType ) );
	acquaint_conds.push( "$elem/knowledge_part_id = " + XQueryLiteral( iKnowledgePartID ) );
	acquaint_conds.push( "$elem/person_id = " + XQueryLiteral( iPersonID ) );
	//acquaint_conds.push( "$elem/confirmation_date >= " + XQueryLiteral( Date() ) );
	acquaint_conds.push( "( $elem/finish_date > " + XQueryLiteral( Date() ) + " or $elem/finish_date = null() )" );
	acquaint_conds.push( "MatchSome( $elem/state_id, ( 'active', 'plan', 'process' ) )" );
	

	var xarrKnowledgeAcquaints = tools.xquery( "for $elem in knowledge_acquaints where " + ArrayMerge( acquaint_conds, "This", " and " ) + " order by $elem/level_index descending return $elem" );
	
	return xarrKnowledgeAcquaints;
}

function DeleteKnowledgeAcquaint(iPersonID, iKnowledgePartID, sKnowledgeAcquaintType, oSendNotificationParam)
{
	var xarrKnowledgeAcquaints = GetKnowledgeAcquaintProfile(iPersonID, iKnowledgePartID, sKnowledgeAcquaintType);
	
	var docToSendNotification = undefined
	for( _ka in xarrKnowledgeAcquaints )
	{
		docKnowledgeAcquaint = tools.open_doc( _ka.id );
		if( docKnowledgeAcquaint != undefined )
		{
			docKnowledgeAcquaint.TopElem.state_id = "cancel";
			docKnowledgeAcquaint.Save();
			docToSendNotification = docKnowledgeAcquaint;
		}
	}
	
	if( docToSendNotification != undefined )
	{
		if( docToSendNotification.TopElem.type_id == "interest" )
		{
			if( oSendNotificationParam.bInterestSendNotification )
			{
				for ( iBossID in tools.get_uni_user_bosses( iPersonID, { 'return_object_type': 'collaborator', 'return_object_value': 'id' } ) )
				{
					tools.create_notification( "delete_knowledge_acquaint_boss", iBossID, "", docToSendNotification.DocID, null, docToSendNotification.TopElem );
				}
			}
		}
		else
		{
			if( oSendNotificationParam.bCorpSendNotification )
			{
				tools.create_notification( "delete_knowledge_acquaint", iPersonID, "", docToSendNotification.DocID, null, docToSendNotification.TopElem );
			}
		}
	}
	
	return true;
}

/**
 * @typedef {Object} WTGetUserKnowledgeResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oUserKnowledge[]} array
*/
/**
 * @typedef {Object} oUserKnowledge
 * @property {bigint} id
 * @property {string} knowledge_part_name - название значения
 * @property {string} knowledge_full_path - хлебные крошки
 * @property {string} level_name - текущий уровень знаний
 * @property {string} target_level_name - требуемый уровень знаний
 * @property {boolean} is_confirm - подтверждено
 * @property {string} confirm_name - признак подтверждения уровня - текст
 * @property {string} color - цвет и стиль признака подтверждения
 * @property {string} is_expert - признак официального эксперта
 * @property {string} image_url - ссылка на изображение значения карты знаний
 * @property {string} link_url - ссылка на значения карты знаний
 * @property {number} target_level_cost - стоимость целевого уровня
 * @property {bigint} knowledge_acquaint_id - идентификатор Подтверждения значения карты знаний
*/
/**
 * @function GetUserKnowledge
 * @memberof Websoft.WT.Knowledge
 * @description Получить знания пользователя
 * @param {bigint} iPersonID - ID сотрудника
 * @param {string} [sKnowledgeTypeID] - тип знания
 * @param {boolean} [bConfirmation=false] - показывать только подтвержденные значения
 * @returns {WTGetUserKnowledgeResult[]}
 */

function GetUserKnowledge( iPersonID, sKnowledgeTypeID, bConfirmation )
{
	return get_user_knowledge( iPersonID, sKnowledgeTypeID, bConfirmation );
}
function get_user_knowledge( iPersonID, sKnowledgeTypeID, bConfirmation )
{

	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];

	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'peredannekorre_1' );
		return oRes;
	}
	
	try
	{
		if( sKnowledgeTypeID == undefined || sKnowledgeTypeID == null || sKnowledgeTypeID == "" )
		{
			throw "error";
		}
	}
	catch ( err )
	{
		sKnowledgeTypeID = "all";
	}

	try
	{
		if( bConfirmation == undefined || bConfirmation == null )
		{
			throw "error";
		}
		bConfirmation = tools_web.is_true( bConfirmation );
	}
	catch ( err )
	{
		bConfirmation = true;
	}
	
	var conds = new Array();

	switch( sKnowledgeTypeID )
	{
		case "all":
		
			break;
		case "corporative":
		case "project":
		case "interest":
			conds.push( "$elem/type_id = " + XQueryLiteral( String( sKnowledgeTypeID ) ) );
			break;
		default:
			oRes.error = 1;
			oRes.errorText = i18n.t( 'neizvestnyytip' );
			return oRes;
	}
	
	conds.push( "$elem/person_id = " + iPersonID );
	conds.push( "$elem/knowledge_part_id != null()" );
	conds.push( "( $elem/finish_date = null() or $elem/finish_date < " + XQueryLiteral( Date() ) + " )" );
	
	if( bConfirmation )
	{
		conds.push( "$elem/state_id = 'active'" );
		conds.push( "( $elem/confirmation_date != null() and $elem/confirmation_date > " + XQueryLiteral( Date() ) + " )" );
	}
	else
	{
		conds.push( "MatchSome( $elem/state_id, ( 'active', 'process', 'plan' ) )" );
	}
	var arrTargetKnowledges = new Array();
	if( sKnowledgeTypeID == "all" || sKnowledgeTypeID == "corporative" )
	{
		arrTargetKnowledges = get_target_knowledge( iPersonID );
	}
	
	var xarrKnowledgeAcquaints = XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( conds, "This", " and " ) + " order by $elem/level_index descending return $elem" );
	if( ArrayOptFirstElem( xarrKnowledgeAcquaints ) == undefined && ArrayOptFirstElem( arrTargetKnowledges ) == undefined )
	{
		return oRes;
	}
	xarrDistinctKnowledgeAcquaints = ArraySelectDistinct( xarrKnowledgeAcquaints, "This.knowledge_part_id" );
	var xarrExperts = XQuery( "for $elem in experts where $elem/person_id = " + iPersonID + " return $elem/Fields( 'id' )" );
	var xarrKnowledgeParts = tools.xquery( "for $elem in knowledge_parts where MatchSome( $elem/id, ( " + ArrayMerge( ArrayUnion( xarrDistinctKnowledgeAcquaints, arrTargetKnowledges ), "This.knowledge_part_id", "," ) + " ) ) return $elem/id, $elem/__data" );
	
	var oKnowledge;
	for( _ka in xarrDistinctKnowledgeAcquaints )
	{
		oKnowledge = new Object();
		oKnowledge.id = _ka.knowledge_part_id.Value;
		
		docKnowledgePart = tools.open_doc( oKnowledge.id );
		if( docKnowledgePart == undefined )
		{
			continue
		}
		teKnowledgePart = docKnowledgePart.TopElem;
		
		oKnowledge.knowledge_part_name = _ka.knowledge_part_name.Value;
		oKnowledge.knowledge_full_path = tools.knowledge_part_path_by_knowledge_part_id( _ka.knowledge_part_id );
		
		oKnowledge.level_name = i18n.t( 'otsutstvuet' );
		oKnowledge.level_index = 0 - 1;
		oActiveAcquaint = ArrayOptFind( xarrKnowledgeAcquaints, "This.knowledge_part_id == _ka.knowledge_part_id && ( This.state_id == 'active' )" );
		if( oActiveAcquaint != undefined )
		{
			oKnowledge.level_name = oActiveAcquaint.level_name.Value;
			oKnowledge.level_index = oActiveAcquaint.level_index.Value;
		}
		oTarget = ArrayOptFindByKey( arrTargetKnowledges, _ka.knowledge_part_id, 'knowledge_part_id' );
		if( oTarget != undefined )
		{
			oKnowledge.target_level_name = oTarget.target_level_name;
			oKnowledge.target_level_index = oTarget.target_level_index;
			oKnowledge.target_level_id = oTarget.target_level_id;
		}
		else
		{
			oProcessAcquaint = ArrayOptFind( xarrKnowledgeAcquaints, "This.knowledge_part_id == _ka.knowledge_part_id && ( This.state_id == 'plan' || This.state_id == 'process' )" );
			if( oProcessAcquaint != undefined )
			{
				oKnowledge.target_level_name = oProcessAcquaint.level_name.Value;
				oKnowledge.target_level_index = oProcessAcquaint.level_index.Value;
				oKnowledge.target_level_id = oProcessAcquaint.level_id.Value;
			}
			else
			{
				oKnowledge.target_level_name = _ka.level_name.Value;
				oKnowledge.target_level_index = _ka.level_index.Value;
				oKnowledge.target_level_id = _ka.level_id;
			}
		}
		oKnowledge.is_confirm = oKnowledge.level_index >= oKnowledge.target_level_index;
		oKnowledge.confirm_name = oKnowledge.is_confirm ? i18n.t( 'podtverzhdeno' ) : i18n.t( 'nepodtverzhdeno' );
		oKnowledge.color = oKnowledge.is_confirm ? "#00FF00" : "#FF0000";
		oKnowledge.is_expert = "";
		
		if( ArrayOptFind( xarrExperts, "teKnowledgePart.experts.ChildExists( This.id )" ) != undefined )
		{
			oKnowledge.is_expert = i18n.t( 'oficialnyyeksp' );
		}
		
		sImgUrl = ( teKnowledgePart.resource_id.HasValue ) ? tools_web.get_object_source_url( "resource", teKnowledgePart.resource_id.Value ) : "";
		fldLevel = teKnowledgePart.levels.GetOptChildByKey( oKnowledge.target_level_id );
		iTargetCost = fldLevel != undefined ? fldLevel.cost.Value : null;

		oKnowledge.target_level_cost = iTargetCost;
		oKnowledge.image_url = sImgUrl;
		oKnowledge.link_url = tools_web.get_mode_clean_url( null, oKnowledge.id );
		oKnowledge.knowledge_acquaint_id = _ka.id.Value;

		oRes.array.push( oKnowledge );
	}
	for( _ka in ArraySelect( arrTargetKnowledges, "ArrayOptFindByKey( oRes.array, This.knowledge_part_id, 'id' ) == undefined" ) )
	{
		oKnowledge = new Object();
		oKnowledge.id = _ka.knowledge_part_id;
		
		docKnowledgePart = tools.open_doc( oKnowledge.id );
		if( docKnowledgePart == undefined )
		{
			continue
		}
		teKnowledgePart = docKnowledgePart.TopElem;
		
		oKnowledge.knowledge_part_name = _ka.knowledge_part_name;
		oKnowledge.knowledge_full_path = tools.knowledge_part_path_by_knowledge_part_id( _ka.knowledge_part_id );
		
		oKnowledge.level_name = "";
		oKnowledge.level_index = 0 - 1;
		
		oKnowledge.target_level_name = _ka.target_level_name;
		oKnowledge.target_level_index = _ka.target_level_index;
		oKnowledge.target_level_id = _ka.target_level_id;
		
		oActiveAcquaint = ArrayOptFind( xarrKnowledgeAcquaints, "This.knowledge_part_id == _ka.knowledge_part_id && ( This.state_id == 'active' ) && ( oKnowledge.target_level_id == '' || This.level_index >= oKnowledge.target_level_id )" );
		oKnowledge.is_confirm = oActiveAcquaint != undefined;
		oKnowledge.confirm_name = oKnowledge.is_confirm ? i18n.t( 'podtverzhdeno' ) : i18n.t( 'nepodtverzhdeno' );
		oKnowledge.color = oKnowledge.is_confirm ? "#00FF00" : "#FF0000";
		oKnowledge.is_expert = "";
		
		if( ArrayOptFind( xarrExperts, "teKnowledgePart.experts.ChildExists( This.id )" ) != undefined )
		{
			oKnowledge.is_expert = i18n.t( 'oficialnyyeksp' );
		}
		
		sImgUrl = ( teKnowledgePart.resource_id.HasValue ) ? tools_web.get_object_source_url( "resource", teKnowledgePart.resource_id.Value ) : "";
		fldLevel = teKnowledgePart.levels.GetOptChildByKey( oKnowledge.target_level_id );
		iTargetCost = fldLevel != undefined ? fldLevel.cost.Value : null;

		oKnowledge.target_level_cost = iTargetCost;
		oKnowledge.image_url = sImgUrl;
		oKnowledge.link_url = tools_web.get_mode_clean_url( null, oKnowledge.id );
		oKnowledge.knowledge_acquaint_id = "";

		oRes.array.push( oKnowledge );
	}
	
	return oRes;
}

/**
 * @typedef {Object} WTPersonKnowledgeProgressResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {number} percent – прогресс в процентах
*/
/**
 * @function GetPersonKnowledgeProgress
 * @memberof Websoft.WT.Knowledge
 * @description Получить прогресс подтверждения знания пользователя
 * @param {bigint} [iKnowledgePartID] - ID значения карты знаний
 * @param {bigint} [iPersonID] - ID сотрудника
 * @returns {WTPersonKnowledgeProgressResult[]}
 */

function GetPersonKnowledgeProgress( iKnowledgePartID, iPersonID )
{

	var oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.knowledge_acquaint_id = "";
	oRes.percent = "";
	
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'peredannekorre_1' );
		return oRes;
	}
	try
	{
		iKnowledgePartID = Int( iKnowledgePartID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'peredannekorre_4' );
		return oRes;
	}
	
	var conds = new Array();
	conds.push( "$elem/person_id = " + iPersonID );
	conds.push( "$elem/knowledge_part_id = " + iKnowledgePartID );
	conds.push( "( $elem/finish_date = null() or $elem/finish_date < " + XQueryLiteral( Date() ) + " )" );
	conds.push( "MatchSome( $elem/state_id, ( 'process', 'plan' ) )" );
	
	var catKnowledgeAcquaint = ArrayOptFirstElem( XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( conds, "This", " and " ) + " order by $elem/level_index descending return $elem" ) );
	if( catKnowledgeAcquaint == undefined )
	{
		return oRes;
	}
	oRes.knowledge_acquaint_id = catKnowledgeAcquaint.id.Value;
	switch( catKnowledgeAcquaint.confirmation_type )
	{
		case "none":
			oRes.percent = 100;
			break;
		case "expert":
		case "project_mark":
			oRes.percent = 0;
			break;
		case "courses_assessments":
			docKnowledgePart = tools.open_doc( iKnowledgePartID );
			var iAllCount = 0;
			var iCurrentCount = 0;
			catRequirement = docKnowledgePart.TopElem.levels.GetOptChildByKey( catKnowledgeAcquaint.level_id );
			
			if( catRequirement == undefined )
			{
				catRequirement = docKnowledgePart.TopElem;
			}
			if( ArrayOptFirstElem( catRequirement.confirmation_courses ) != undefined )
			{
				xarrLearnings = XQuery( "for $elem in learnings where $elem/person_id = " + iPersonID + " and $elem/state_id = 4 and MatchSome( $elem/course_id, ( " + ArrayMerge( catRequirement.confirmation_courses, "This.PrimaryKey", "," ) + " ) ) return $elem" );
				xarrLearnings = ArraySelectDistinct( xarrLearnings, "This.course_id" );
				iAllCount += ArrayCount( catRequirement.confirmation_courses );
				iCurrentCount += ArrayCount( xarrLearnings );
			}
			if( ArrayOptFirstElem( catRequirement.confirmation_assessments ) != undefined )
			{
				xarrLearnings = XQuery( "for $elem in test_learnings where $elem/person_id = " + iPersonID + " and $elem/state_id = 4 and MatchSome( $elem/assessment_id, ( " + ArrayMerge( catRequirement.confirmation_assessments, "This.PrimaryKey", "," ) + " ) ) return $elem" );
				xarrLearnings = ArraySelectDistinct( xarrLearnings, "This.assessment_id" );
				iAllCount += ArrayCount( catRequirement.confirmation_assessments );
				iCurrentCount += ArrayCount( xarrLearnings );
			}
			if( iAllCount == 0 )
			{
				oRes.percent = 100;
			}
			else
			{
				oRes.percent = Int( ( iCurrentCount*100 )/iAllCount );
			}
			break;
			
		case "certificates":
			docKnowledgePart = tools.open_doc( iKnowledgePartID );
			var iAllCount = 0;
			var iCurrentCount = 0;
			catRequirement = docKnowledgePart.TopElem.levels.GetOptChildByKey( catKnowledgeAcquaint.level_id );
			
			if( catRequirement == undefined )
			{
				catRequirement = docKnowledgePart.TopElem;
			}
			if( ArrayOptFirstElem( catRequirement.confirmation_certificates ) != undefined )
			{
				xarrLearnings = XQuery( "for $elem in certificates where $elem/person_id = " + iPersonID + " and $elem/valid = true() and MatchSome( $elem/type_id, ( " + ArrayMerge( catRequirement.confirmation_certificates, "This.PrimaryKey", "," ) + " ) ) return $elem" );
				xarrLearnings = ArraySelectDistinct( xarrLearnings, "This.type_id" );
				iAllCount += ArrayCount( catRequirement.confirmation_certificates );
				iCurrentCount += ArrayCount( xarrLearnings );
			}
			if( iAllCount == 0 )
			{
				oRes.percent = 100;
			}
			else
			{
				oRes.percent = Int( ( iCurrentCount*100 )/iAllCount );
			}
			break;
			
		case "activity":
			docKnowledgePart = tools.open_doc( iKnowledgePartID );
			catRequirement = docKnowledgePart.TopElem.levels.GetOptChildByKey( catKnowledgeAcquaint.level_id );
			
			if( catRequirement == undefined )
			{
				catRequirement = docKnowledgePart.TopElem;
			}
			oRes.percent = 0;
			if( !catRequirement.currency_type_id.HasValue || OptInt( catRequirement.cost, 0 ) <= 0 )
			{
				oRes.percent = 100;
			}
			else
			{
				catAccount = ArrayOptFirstElem( XQuery( "for $elem in accounts where $elem/object_id = " + iPersonID + " and $elem/currency_type_id = " + XQueryLiteral( catRequirement.currency_type_id ) + " return $elem" ) );
				if( catAccount != undefined )
				{
					oRes.percent = Int( ( OptInt( catAccount.balance, 0 )*100 )/OptInt( catRequirement.cost, 0 ) );
				}
			}
			break;
	}
	
	return oRes;
}

/**
 * @typedef {Object} PersonKnowledgePartContext
 * @property {bool} bHasActiveAcquaint – Есть или нет знание у пользователя/сотрудника.
 * @property {string} sKnowledgePath – Хлебные крошки.
 * @property {string} sKnowledgeName – Название значения.
 * @property {string} sKnowledgeTypeName – Тип значения.
 * @property {string} sTargetKnowledgeLevelName – Требуемый уровень.
 * @property {string} sTargetKnowledgeLevelID – Требуемый уровень.
 * @property {bool} bHasTargetKnowledge – знание есть в профиле.
 * @property {string} sCurrentKnowledgeLevelName – Текущий уровень.
 * @property {string} sCurrentKnowledgeLevelID – Текущий уровень.
 * @property {bigint} iKnowledgeAcquaintID – Идентификатор Подтверждения знаний.
 * @property {number} iKnowledgeAcquaintPercent – Прогресс в получении уровня.
 * @property {bool} bLevelCompleted – Уровень подтвержден.
 * @property {string} sTargetKnowledgeStatusID – Статус Подтверждения знания.
 * @property {string} sTargetKnowledgeStatusName – Статус Подтверждения знания (название).
 * @property {string} sKnowledgeAcquaintConfirmationType – Тип подтверждения.
 
*/
/**
 * @typedef {Object} ReturnPersonKnowledgePartContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {PersonKnowledgePartContext} context – Контекст значения карты знаний для сотрудника.
*/
/**
 * @function GetPersonKnowledgePartContext
 * @memberof Websoft.WT.Knowledge
 * @description Получение контекста значения карты знаний для сотрудника.
 * @param {bigint} iKnowledgePartID - ID значения карты знаний.
 * @param {bigint} iUserID - ID сотрудника.
 * @returns {ReturnPersonKnowledgePartContext}
*/
function GetPersonKnowledgePartContext( iKnowledgePartID, iUserID )
{
	return get_person_knowledge_part_context( iKnowledgePartID, null, iUserID );
}
function get_person_knowledge_part_context( iKnowledgePartID, teKnowledgePart, iUserID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = new Object;

	try
	{
		iKnowledgePartID = Int( iKnowledgePartID )
	}
	catch ( err )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iKnowledgePartID' }";
		return oRes;
	}
	try
	{
		teKnowledgePart.Name;
	}
	catch ( err )
	{
		try
		{
			teKnowledgePart = tools.open_doc( iKnowledgePartID ).TopElem;
		}
		catch ( err )
		{
			oRes.error = 503;
			oRes.errorText = "{ text: 'Object not found.', param_name: 'iKnowledgePartID' }";
			return oRes;
		}
	}
	try
	{
		iUserID = Int( iUserID )
	}
	catch ( err )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iUserID' }";
		return oRes;
	}

	var conds = new Array();
	conds.push( "$elem/person_id = " + iUserID );
	conds.push( "$elem/knowledge_part_id = " + iKnowledgePartID );
	conds.push( "( MatchSome( $elem/state_id, ( 'plan', 'process' ) ) or ( $elem/state_id = 'active' and ( $elem/finish_date = null() or $elem/finish_date < " + XQueryLiteral( Date() ) + " ) ) )" );
	var xarrKnowledgeAcquaints = XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( conds, "This", " and " ) + " order by $elem/level_index descending return $elem" );
	
	var arrTargetKnowledges = get_target_knowledge( iUserID );
	var catFirstKnowledge = ArrayOptFirstElem( xarrKnowledgeAcquaints );
	var catTargetKnowledge = ArrayOptFind( arrTargetKnowledges, "This.knowledge_part_id == iKnowledgePartID" );
	var catCurrentKnowledge = ArrayOptFind( xarrKnowledgeAcquaints, "This.state_id == 'active'" );
	var catTargetKnowledgeAcquaint = ( catTargetKnowledge != undefined ? ArrayOptFind( xarrKnowledgeAcquaints, "This.level_id == catTargetKnowledge.target_level_id" ) : undefined );

	var oResPersonKnowledgeProgress = GetPersonKnowledgeProgress( iKnowledgePartID, iUserID );
	var oContext = {
		bHasActiveAcquaint: ( ArrayOptFind( xarrKnowledgeAcquaints, "This.state_id == 'active'" ) != undefined ),
		sKnowledgePath: RValue( tools.knowledge_part_path_by_knowledge_part_id( iKnowledgePartID ) ),
		sKnowledgeName: teKnowledgePart.name.Value,
		sKnowledgeTypeName: StrTitleCase( ArrayMerge( ArraySelectDistinct( ArraySelect( xarrKnowledgeAcquaints, "This.type_id.HasValue" ), "This.type_id" ), "This.type_id.ForeignElem.name.Value", ", " ) ),
		sTargetKnowledgeLevelName: ( catTargetKnowledge != undefined ? catTargetKnowledge.target_level_name : "" ),
		sTargetKnowledgeLevelID: ( catTargetKnowledge != undefined ? catTargetKnowledge.target_level_id : "" ),
		bHasTargetKnowledge: ( catTargetKnowledge != undefined ),
		sCurrentKnowledgeLevelName: ( catCurrentKnowledge != undefined ? catCurrentKnowledge.level_name.Value : "" ),
		sCurrentKnowledgeLevelID: ( catCurrentKnowledge != undefined ? catCurrentKnowledge.level_id.Value : "" ),
		iKnowledgeAcquaintID: oResPersonKnowledgeProgress.knowledge_acquaint_id,
		iKnowledgeAcquaintPercent: oResPersonKnowledgeProgress.percent,
		bLevelCompleted: ( catFirstKnowledge != undefined && catFirstKnowledge.state_id == "active" ),
		sTargetKnowledgeStatusID: ( catTargetKnowledgeAcquaint != undefined ? catTargetKnowledgeAcquaint.state_id.Value : "" ),
		sTargetKnowledgeStatusName: ( catTargetKnowledgeAcquaint != undefined ? catTargetKnowledgeAcquaint.state_id.ForeignElem.name.Value : "" ),
		sKnowledgeAcquaintConfirmationType: ( ArrayOptFind( xarrKnowledgeAcquaints, "This.state_id == 'process'" ) != undefined ? ArrayOptFind( xarrKnowledgeAcquaints, "This.state_id == 'process'" ).confirmation_type.Value : "" )
	};
	oRes.context = oContext;

	return oRes;
}

/**
 * @typedef {Object} PersonKnowledgeAccessContext
 * @property {bool} bAccessCorpKnowledge – Есть или нет доступ к корпоративным знаниям.
 * @property {bool} bAccessInterestKnowledge – Есть или нет доступ к знаниям по интересам.
*/
/**
 * @typedef {Object} ReturnPersonKnowledgeAccessContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {PersonKnowledgeAccessContext} context – Права на редактирование знаний для сотрудника.
*/
/**
 * @function GetPersonKnowledgeAccessContext
 * @memberof Websoft.WT.Knowledge
 * @description Получение прав на редактирование знаний для сотрудника.
 * @param {bigint} iUserID - ID текущего сотрудника.
 * @param {bigint} [iPersonID] - ID проверяемого сотрудника (если пусто берется ID текущего сотрудника).
 * @param {bool} [bAccessMainBoss] - Разрешить доступ к корпоративным знаниям для непосредственных руководителей.
 * @param {bool} [bAccessFuncBoss] - Разрешить доступ к корпоративным знаниям для функциональных руководителей.
 * @param {bigint[]} [aFuncManagers] - Массив функциональных руководителей.
 * @param {bool} [bAccessInterest] - Разрешить доступ к знаниям по интересам.
 * @returns {ReturnPersonKnowledgeAccessContext}
*/
function GetPersonKnowledgeAccessContext( iUserID, iPersonID, bAccessMainBoss, bAccessFuncBoss, aFuncManagers, bAccessInterest )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = new Object;

	try
	{
		iUserID = Int( iUserID )
	}
	catch ( err )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iUserID' }";
		return oRes;
	}
	try
	{
		iPersonID = Int( iPersonID )
	}
	catch ( err )
	{
		iPersonID = iUserID;
	}
	try
	{
		if( bAccessMainBoss == undefined || bAccessMainBoss == null || bAccessMainBoss == "" )
		{
			throw "error";
		}
		bAccessMainBoss = tools_web.is_true( bAccessMainBoss )
	}
	catch ( err )
	{
		bAccessMainBoss = true;
	}
	try
	{
		if( bAccessFuncBoss == undefined || bAccessFuncBoss == null || bAccessFuncBoss == "" )
		{
			throw "error";
		}
		bAccessFuncBoss = tools_web.is_true( bAccessFuncBoss )
	}
	catch ( err )
	{
		bAccessFuncBoss = false;
	}
	try
	{
		if( bAccessInterest == undefined || bAccessInterest == null || bAccessInterest == "" )
		{
			throw "error";
		}
		bAccessInterest = tools_web.is_true( bAccessInterest )
	}
	catch ( err )
	{
		bAccessInterest = true;
	}
	
	try
	{
		if( !IsArray( aFuncManagers ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		aFuncManagers = null;
	}

	var oContext = {
		bAccessCorpKnowledge: false,
		bAccessInterestKnowledge: false
	};
	if( bAccessMainBoss || bAccessFuncBoss )
	{
		oContext.bAccessCorpKnowledge = tools.call_code_library_method( "libMain", "is_boss", [ iPersonID, null, iUserID, bAccessMainBoss, ( bAccessFuncBoss ? aFuncManagers : [] ) ] ).is_boss;
	}
	oContext.bAccessInterestKnowledge = ( bAccessInterest && ( iPersonID == iUserID ) );
	
	oRes.context = oContext;

	return oRes;
}

/**
 * @typedef {Object} WTGetExpertKnowledgeAreaResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oExpertKnowledgeArea[]} array
*/
/**
 * @typedef {Object} oExpertKnowledgeArea
 * @property {bigint} id - идентификатор значения карты знаний
 * @property {string} name - название значения карты знаний
 * @property {string} knowledge_part_image - ссылка на картинку значения карты знаний
 * @property {string} knowledge_part_url - ссылка на значения карты знаний
*/
/**
 * @function GetExpertKnowledgeArea
 * @memberof Websoft.WT.Knowledge
 * @description Получить область знаний пользователя
 * @param {bigint} iPersonID - ID сотрудника
 * @param {boolean} bHier - Учитывать иерархию значений
 * @returns {WTGetExpertKnowledgeAreaResult[]}
 */

function GetExpertKnowledgeArea( iPersonID, bHier )
{
	return get_expert_knowledge_area( iPersonID, bHier );
}
function get_expert_knowledge_area( iPersonID, bHier, oPagingParam, oSortParam )
{

	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];
	
	try
	{
		bHier = tools_web.is_true( bHier );
	}
	catch ( err )
	{
		bHier = false;
	}
	
	try
	{
		iPersonID = Int( iPersonID )
	}
	catch ( err )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}
	var libParam = tools.get_params_code_library( "libKnowledge" );
	var sExpertType = libParam.GetOptProperty( "expert_type", "standart" );
	
	var expert_conds = new Array();
	expert_conds.push( "$elem/type = 'collaborator'" );
	expert_conds.push( "$elem/person_id = " + iPersonID );
	var xarrExperts = XQuery( "for $elem in experts where " + ArrayMerge( expert_conds, "This", " and " ) + " return $elem" );
	var xarrKnowledgeParts = new Array();
	
	var _kp_conds = new Array();
	if( ArrayOptFirstElem( xarrExperts ) != undefined )
	{
		_kp_conds.push( ArrayMerge( xarrExperts, "'contains( $elem/experts, ' + XQueryLiteral( String( This.id ) ) + ' )'", " or " ) )
	}
	var acquaint_conds = new Array();
	var xarrKnowledgeAcquaints = new Array()
	switch( sExpertType )
	{
		case "with_knowledge":
			
			acquaint_conds.push( "$elem/person_id = " + iPersonID );
			acquaint_conds.push( "$elem/state_id = 'active'" );
			acquaint_conds.push( "( $elem/confirmation_date != null() and $elem/confirmation_date < " + XQueryLiteral( Date() ) + " )" );
			acquaint_conds.push( "( $elem/finish_date = null() or $elem/finish_date > " + XQueryLiteral( Date() ) + " )" );
			xarrKnowledgeAcquaints = ArrayDirect( XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( acquaint_conds, "This", " and " ) + " return $elem/Fields( 'knowledge_part_id', 'knowledge_part_name' )" ) );

			break;
		case "with_expert_level":
			acquaint_conds.push( "some $elem_kp in knowledge_parts satisfies  ( $elem_kp/id = $elem/knowledge_part_id and ( $elem_kp/expertise_level_index = null() or $elem/level_index >= $elem_kp/expertise_level_index ) )" );
			acquaint_conds.push( "$elem/person_id = " + iPersonID );
			acquaint_conds.push( "$elem/state_id = 'active'" );
			acquaint_conds.push( "( $elem/confirmation_date != null() and $elem/confirmation_date < " + XQueryLiteral( Date() ) + " )" );
			acquaint_conds.push( "( $elem/finish_date = null() or $elem/finish_date > " + XQueryLiteral( Date() ) + " )" );
			xarrKnowledgeAcquaints = ArrayDirect( XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( acquaint_conds, "This", " and " ) + " return $elem/Fields( 'knowledge_part_id', 'knowledge_part_name' )" ) );
			
			break;
	}
	if( ArrayOptFirstElem( xarrKnowledgeAcquaints ) != undefined )
	{
		_kp_conds.push( "MatchSome( $elem/id, ( " + ArrayMerge( xarrKnowledgeAcquaints, "This.knowledge_part_id", "," ) + " ) )" );
	}
	if( ArrayOptFirstElem( _kp_conds ) == undefined )
	{
		return oRes;
	}
	xarrKnowledgeParts = XQuery( "for $elem in knowledge_parts where " + ArrayMerge( _kp_conds, "This", " or " ) + " return $elem/Fields( 'id', 'name', 'resource_id' )" );
	for( _kp in xarrKnowledgeParts )
	{
		if( bHier && ArrayOptFindByKey( oRes.array, _kp.id, "id" ) != undefined )
		{
			continue;
		}
		oKP = new Object();
		oKP.id = _kp.id.Value;
		oKP.name = _kp.name.Value;
		oKP.knowledge_part_image = get_object_image_url( _kp );
		oKP.knowledge_part_url = tools_web.get_mode_clean_url( null, _kp.id );
		oRes.array.push( oKP );
		if( bHier )
		{
			for( _hkp in tools.xquery( "for $elem in knowledge_parts where IsHierChild( $elem/id, " + _kp.id + " ) order by $elem/Hier() return $elem/Fields( 'id', 'name', 'resource_id' )" ) )
			{
				if( ArrayOptFindByKey( oRes.array, _hkp.id, "id" ) != undefined )
				{
					continue;
				}
				oKP = new Object();
				oKP.id = _hkp.id.Value;
				oKP.name = _hkp.name.Value;
				oKP.knowledge_part_image = get_object_image_url( _hkp );
				oKP.knowledge_part_url = tools_web.get_mode_clean_url( null, _hkp.id );
				oRes.array.push( oKP );
			}
		}
	}
	
	oRes.array = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ oRes.array, oPagingParam, oSortParam ] ).oResult;
	
	return oRes;
}

/**
 * @typedef {Object} WTGetKnowledgeAcquaintLearningObjectsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oLearningObjectKnowledgeAcquaint[]} array
*/
/**
 * @typedef {Object} oLearningObjectKnowledgeAcquaint
 * @property {bigint} id - Идентификатор объекта
 * @property {string} catalog - каталог объекта
 * @property {string} catalog_name - название каталога объекта
 * @property {string} name - Название объекта
 * @property {string} object_link - Ссылка на карточку объекта
 * @property {string} object_image - Ссылка на иконку
 * @property {boolean} status - статус завершенности
 * @property {string} status_name - Название статуса
*/
/**
 * @function GetKnowledgeAcquaintLearningObjects
 * @memberof Websoft.WT.Knowledge
 * @description Получить объекты подтверждения знаний пользователя
 * @param {bigint} iKnowledgeAcquaintID - ID подтверждения знания
 * @param {boolean} [bShowCompleted] - Показывать пройденные
 * @returns {WTGetKnowledgeAcquaintLearningObjectsResult[]}
 */

function GetKnowledgeAcquaintLearningObjects( iKnowledgeAcquaintID, bShowCompleted )
{
	return get_knowledge_acquaint_learning_objects( iKnowledgeAcquaintID, null, bShowCompleted )
	
}
function get_knowledge_acquaint_learning_objects( iKnowledgeAcquaintID, teKnowledgeAcquaint, bShowCompleted )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];
	try
	{
		if( bShowCompleted == undefined || bShowCompleted == null || bShowCompleted == "" )
		{
			throw "error";
		}
		bShowCompleted = tools_web.is_true( bShowCompleted );
	}
	catch ( err )
	{
		bShowCompleted = true;
	}
	
	try
	{
		iKnowledgeAcquaintID = Int( iKnowledgeAcquaintID )
	}
	catch ( err )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iKnowledgeAcquaintID' }";
		return oRes;
	}
	try
	{
		teKnowledgeAcquaint.Name;
	}
	catch ( err )
	{
		try
		{
			teKnowledgeAcquaint = tools.open_doc( iKnowledgeAcquaintID ).TopElem;
		}
		catch ( err )
		{
			oRes.error = 503;
			oRes.errorText = "{ text: 'Object not found.', param_name: 'iKnowledgeAcquaintID' }";
			return oRes;
		}
	}
	
	switch( teKnowledgeAcquaint.confirmation_type )
	{
		case "courses_assessments":
		{
			if( ArrayOptFirstElem( teKnowledgeAcquaint.confirmation_courses ) != undefined )
			{
				xarrLearnings = new Array();
				xarrActiveLearnings = new Array();
				if( teKnowledgeAcquaint.person_id.HasValue )
				{
					xarrLearnings = XQuery( "for $elem in learnings where $elem/person_id = " + teKnowledgeAcquaint.person_id + " and $elem/state_id = 4 and MatchSome( $elem/course_id, ( " + ArrayMerge( teKnowledgeAcquaint.confirmation_courses, "This.PrimaryKey", "," ) + " ) ) return $elem/Fields('state_id', 'course_id')" );
					xarrActiveLearnings = XQuery( "for $elem in active_learnings where $elem/person_id = " + teKnowledgeAcquaint.person_id + " and MatchSome( $elem/course_id, ( " + ArrayMerge( teKnowledgeAcquaint.confirmation_courses, "This.PrimaryKey", "," ) + " ) ) return $elem/Fields('state_id', 'course_id')" );
				}
				xarrObjects = XQuery( "for $elem in courses where MatchSome( $elem/id, ( " + ArrayMerge( teKnowledgeAcquaint.confirmation_courses, "This.PrimaryKey", "," ) + " ) ) return $elem/Fields('id', 'name', 'resource_id')" );
				for( _object in teKnowledgeAcquaint.confirmation_courses )
				{
					catObject = ArrayOptFindByKey( xarrObjects, _object.PrimaryKey, "id" );
					if( catObject == undefined )
					{
						continue;
					}

					oLO = new Object();
					oLO.status = false;
					oLO.status_name = "";
					catLearning = ArrayOptFindByKey( xarrLearnings, _object.PrimaryKey, "course_id" );
					if( catLearning != undefined )
					{
						if( !bShowCompleted )
						{
							continue;
						}
						oLO.status = true;
						oLO.status_name = catLearning.state_id.ForeignElem.name.Value;
					}
					else
					{
						catActiveLearning = ArrayOptFindByKey( xarrActiveLearnings, _object.PrimaryKey, "course_id" );
						if( catActiveLearning != undefined )
						{
							oLO.status_name = catActiveLearning.state_id.ForeignElem.name.Value;
						}
					}
					oLO.id = catObject.id.Value;
					oLO.name = catObject.name.Value;
					oLO.catalog = RValue( catObject.Name );
					oLO.catalog_name = common.exchange_object_types.GetOptChildByKey( catObject.Name ).title.Value;
					oLO.object_link = tools_web.get_mode_clean_url( null, catObject.id );
					oLO.object_image = get_object_image_url( catObject );
					
					oRes.array.push( oLO );
				}
			}
			if( ArrayOptFirstElem( teKnowledgeAcquaint.confirmation_assessments ) != undefined )
			{
				xarrLearnings = new Array();
				xarrActiveLearnings = new Array();
				if( teKnowledgeAcquaint.person_id.HasValue )
				{
					xarrLearnings = XQuery( "for $elem in test_learnings where $elem/person_id = " + teKnowledgeAcquaint.person_id + " and $elem/state_id = 4 and MatchSome( $elem/assessment_id, ( " + ArrayMerge( teKnowledgeAcquaint.confirmation_assessments, "This.PrimaryKey", "," ) + " ) ) return $elem/Fields('state_id', 'assessment_id')" );
					xarrActiveLearnings = XQuery( "for $elem in active_test_learnings where $elem/person_id = " + teKnowledgeAcquaint.person_id + " and MatchSome( $elem/assessment_id, ( " + ArrayMerge( teKnowledgeAcquaint.confirmation_assessments, "This.PrimaryKey", "," ) + " ) ) return $elem/Fields('state_id', 'assessment_id')" );
				}
				xarrObjects = XQuery( "for $elem in assessments where MatchSome( $elem/id, ( " + ArrayMerge( teKnowledgeAcquaint.confirmation_assessments, "This.PrimaryKey", "," ) + " ) ) return $elem/Fields('id', 'title', 'resource_id')" );
				for( _object in teKnowledgeAcquaint.confirmation_assessments )
				{
					catObject = ArrayOptFindByKey( xarrObjects, _object.PrimaryKey, "id" );
					if( catObject == undefined )
					{
						continue;
					}

					oLO = new Object();
					oLO.status = false;
					oLO.status_name = "";
					catLearning = ArrayOptFindByKey( xarrLearnings, _object.PrimaryKey, "assessment_id" );
					if( catLearning != undefined )
					{
						if( !bShowCompleted )
						{
							continue;
						}
						oLO.status = true;
						oLO.status_name = catLearning.state_id.ForeignElem.name.Value;
					}
					else
					{
						catActiveLearning = ArrayOptFindByKey( xarrActiveLearnings, _object.PrimaryKey, "assessment_id" );
						if( catActiveLearning != undefined )
						{
							oLO.status_name = catActiveLearning.state_id.ForeignElem.name.Value;
						}
					}
					oLO.id = catObject.id.Value;
					oLO.name = catObject.title.Value;
					oLO.catalog = RValue( catObject.Name );
					oLO.catalog_name = common.exchange_object_types.GetOptChildByKey( catObject.Name ).title.Value;
					oLO.object_link = tools_web.get_mode_clean_url( null, catObject.id );
					oLO.object_image = get_object_image_url( catObject );
					
					oRes.array.push( oLO );
				}
			}
			break;
		}
		case "certificates":
		{
			if( ArrayOptFirstElem( teKnowledgeAcquaint.confirmation_certificates ) != undefined )
			{
				xarrLearnings = new Array();
				if( teKnowledgeAcquaint.person_id.HasValue )
				{
					xarrLearnings = XQuery( "for $elem in certificates where $elem/person_id = " + teKnowledgeAcquaint.person_id + " and $elem/valid = true() and MatchSome( $elem/type_id, ( " + ArrayMerge( teKnowledgeAcquaint.confirmation_certificates, "This.PrimaryKey", "," ) + " ) ) return $elem/Fields('type_id')" );
				}
				xarrObjects = XQuery( "for $elem in certificate_types where MatchSome( $elem/id, ( " + ArrayMerge( teKnowledgeAcquaint.confirmation_certificates, "This.PrimaryKey", "," ) + " ) ) return $elem/Fields('id', 'name', 'education_org_id')" );
				for( _object in teKnowledgeAcquaint.confirmation_certificates )
				{
					catObject = ArrayOptFindByKey( xarrObjects, _object.PrimaryKey, "id" );
					if( catObject == undefined )
					{
						continue;
					}
					
					oLO = new Object();
					oLO.status = false;
					oLO.status_name = i18n.t( 'nepoluchen' );
					catLearning = ArrayOptFindByKey( xarrLearnings, _object.PrimaryKey, "type_id" );
					if( catLearning != undefined )
					{
						if( !bShowCompleted )
						{
							continue;
						}
						oLO.status = true;
						oLO.status_name = i18n.t( 'poluchen' );
					}
					oLO.id = catObject.id.Value;
					feEducationOrg = catObject.education_org_id.OptForeignElem;
					oLO.name = catObject.name.Value + ( feEducationOrg != undefined ? ( " (" + feEducationOrg.name + ")" ) : "" );
					oLO.catalog = RValue( catObject.Name );
					oLO.catalog_name = common.exchange_object_types.GetOptChildByKey( catObject.Name ).title.Value;
					oLO.object_link = tools_web.get_mode_clean_url( null, catObject.id );
					oLO.object_image = get_object_image_url( catObject );
					
		
					oRes.array.push( oLO );
				}
			}
			break;
		}
	}
	
	return oRes;
}
/**
 * @function ProcessKnowledgeAcquaint
 * @memberof Websoft.WT.Knowledge
 * @description подтверждение уровня знаний.
 * @param {string} sAction - действие.
 * @param {bigint} iUserID - ID текущего сотрудника.
 * @param {bigint} [iPersonID] - ID проверяемого сотрудника
 * @param {bigint} [iKnowledgePartID] - ID значение карты знаний
 * @param {bigint} [iKnowledgeAcquaintID] - ID подтверждения знаний
 * @param {bool} [bSendNotification] - включить/отключить отправку уведомлений сотрудникам.
 * @param {bool} [bSendBossNotification] - включить/отключить отправку уведомлений руководителям сотрудников.
 * @param {bool} [bSendExpertNotification] - включить/отключить отправку уведомлений экспертам.
 * @param {bool} [bSendEvaluationExpertNotification] - включить/отключить отправку уведомлений оценивающим экспертам.
 * @returns {WTLPEFormResult}
*/
function ProcessKnowledgeAcquaint( sAction, iUserID, iPersonID, iKnowledgePartID, iKnowledgeAcquaintID, bSendNotification, bSendBossNotification, bSendExpertNotification, bSendEvaluationExpertNotification )
{
	function has_activity(sType, iActivityProfileID, iPersonID)
	{
		switch(sType)
		{
			case "course":
			{
				sReqActiveActivity = "for $elem in active_learnings where $elem/person_id = " + XQueryLiteral(iPersonID) + " and $elem/course_id = " + XQueryLiteral(iActivityProfileID) + " return $elem";
				sReqActivity = "for $elem in learnings where $elem/person_id = " + XQueryLiteral(iPersonID) + " and $elem/course_id = " + XQueryLiteral(iActivityProfileID) + " and $elem/state_id = 4 return $elem";
				break;
			}
			case "assessment":
			{
				sReqActiveActivity = "for $elem in active_test_learnings where $elem/person_id = " + XQueryLiteral(iPersonID) + " and $elem/assessment_id = " + XQueryLiteral(iActivityProfileID) + " return $elem";
				sReqActivity = "for $elem in test_learnings where $elem/person_id = " + XQueryLiteral(iPersonID) + " and $elem/assessment_id = " + XQueryLiteral(iActivityProfileID) + " and $elem/state_id = 4 return $elem";
				break;
			}
			
		}
		bHasActiveActivity = (ArrayOptFirstElem(tools.xquery(sReqActiveActivity)) != undefined);
		bHasActivity = (ArrayOptFirstElem(tools.xquery(sReqActivity)) != undefined);
		
		return bHasActiveActivity || bHasActivity;
	}

	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.action_result = ({});

	try
	{
		iUserID = Int( iUserID )
	}
	catch ( err )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iUserID' }";
		return oRes;
	}
	var docKnowledgeAcquaint = undefined;
	try
	{
		iKnowledgeAcquaintID = Int( iKnowledgeAcquaintID );
		docKnowledgeAcquaint = tools.open_doc( iKnowledgeAcquaintID );
		if( docKnowledgeAcquaint == undefined )
		{
			throw "error";
		}
		iKnowledgePartID = docKnowledgeAcquaint.TopElem.knowledge_part_id.Value;
		iPersonID = docKnowledgeAcquaint.TopElem.person_id.Value;
	}
	catch ( err )
	{
		iKnowledgeAcquaintID = undefined;
		try
		{
			iPersonID = Int( iPersonID )
		}
		catch ( err )
		{
			oRes.error = 503;
			oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
			oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_1' ) };
			return oRes;
		}
		try
		{
			iKnowledgePartID = Int( iKnowledgePartID )
		}
		catch ( err )
		{
			oRes.error = 503;
			oRes.errorText = "{ text: 'Object not found.', param_name: 'iKnowledgePartID' }";
			oRes.action_result = { command: "alert", msg: i18n.t( 'nekorrektnyyid_9' ) };
			return oRes;
		}

	}
	try
	{
		if( bSendNotification == undefined || bSendNotification == null || bSendNotification == "" )
		{
			throw "error";
		}
		bSendNotification = tools_web.is_true( bSendNotification );
	}
	catch ( err )
	{
		bSendNotification = false
	}
	try
	{
		if( bSendBossNotification == undefined || bSendBossNotification == null || bSendBossNotification == "" )
		{
			throw "error";
		}
		bSendBossNotification = tools_web.is_true( bSendBossNotification );
	}
	catch ( err )
	{
		bSendBossNotification = false
	}
	try
	{
		if( bSendExpertNotification == undefined || bSendExpertNotification == null || bSendExpertNotification == "" )
		{
			throw "error";
		}
		bSendExpertNotification = tools_web.is_true( bSendExpertNotification );
	}
	catch ( err )
	{
		bSendExpertNotification = false
	}
	try
	{
		if( bSendEvaluationExpertNotification == undefined || bSendEvaluationExpertNotification == null || bSendEvaluationExpertNotification == "" )
		{
			throw "error";
		}
		bSendEvaluationExpertNotification = tools_web.is_true( bSendEvaluationExpertNotification );
	}
	catch ( err )
	{
		bSendEvaluationExpertNotification = false
	}
	
	
	var arrTargetKnowledges = get_target_knowledge( iPersonID, "knowledge_profile" );
	var catTargetKnowledgePart = ArrayOptFindByKey( arrTargetKnowledges, iKnowledgePartID, "knowledge_part_id" );
	if( catTargetKnowledgePart == undefined && iPersonID != iUserID )
	{
		oRes.action_result = { command: "alert", msg: ( iPersonID == iUserID ? i18n.t( 'dannogoznaniyan' ) : i18n.t( 'dannogoznaniyan_1' ) ) };
		return oRes;
	}
	
	switch( sAction )
	{
		case "start":
			
			if( iKnowledgeAcquaintID == undefined )
			{
				var ka_conds = new Array();
				ka_conds.push( "$elem/person_id = " + iPersonID );
				ka_conds.push( "$elem/knowledge_part_id = " + iKnowledgePartID );
				ka_conds.push( "MatchSome( $elem/state_id, ( 'plan', 'process', 'active' ) )" );
				if( catTargetKnowledgePart != undefined && OptInt( catTargetKnowledgePart.target_level_index ) != undefined )
				{
					ka_conds.push( "$elem/level_index >= " + catTargetKnowledgePart.target_level_index );
				}
				
				catKnowledgeAcquaint = ArrayOptFirstElem( XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( ka_conds, "This", " and " ) + " order by $elem/level_index descending return $elem" ) );
				if( catKnowledgeAcquaint != undefined && ( catTargetKnowledgePart != undefined && catKnowledgeAcquaint.level_index > catTargetKnowledgePart.target_level_index ) )
				{
					oRes.action_result = { command: "alert", msg: ( i18n.t( 'vyuzhenachalipod' ) ) };
					return oRes;
				}
				else if( catKnowledgeAcquaint != undefined && ( catTargetKnowledgePart == undefined || catKnowledgeAcquaint.level_index == catTargetKnowledgePart.target_level_index ) )
				{
					docNewKnowledgeAcquaint = tools.open_doc( catKnowledgeAcquaint.id );
				}
				else
				{
					docNewKnowledgeAcquaint = OpenNewDoc( 'x-local://wtv/wtv_knowledge_acquaint.xmd' );
					docNewKnowledgeAcquaint.BindToDb( DefaultDb );
					docKnowledgePart = tools.open_doc( iKnowledgePartID );
					catLevel = undefined;
					if( catTargetKnowledgePart != undefined )
					{
						catLevel = docKnowledgePart.TopElem.levels.GetOptChildByKey( catTargetKnowledgePart.target_level_id );
					}
					//docNewKnowledgeAcquaint.TopElem.type_id = "corporative";
					docNewKnowledgeAcquaint.TopElem.person_id = iPersonID;
					docNewKnowledgeAcquaint.TopElem.type_id = ( iUserID == iPersonID ? "interest" : "corporative" );
					tools.common_filling( 'collaborator', docNewKnowledgeAcquaint.TopElem, iPersonID );
					
					docNewKnowledgeAcquaint.TopElem.knowledge_part_id = iKnowledgePartID;
					docNewKnowledgeAcquaint.TopElem.knowledge_part_name = docKnowledgePart.TopElem.name.Value;
					
					if( catLevel != undefined )
					{
						docNewKnowledgeAcquaint.TopElem.level_id = catLevel.id.Value;
						docNewKnowledgeAcquaint.TopElem.level_name = catLevel.name.Value;
						docNewKnowledgeAcquaint.TopElem.level_index = catLevel.ChildIndex;
					}
					else
					{
						catLevel = docKnowledgePart.TopElem;
					}
							
					docNewKnowledgeAcquaint.TopElem.confirmation_type = catLevel.confirmation_type.Value;
					switch( docNewKnowledgeAcquaint.TopElem.confirmation_type )
					{
						case "courses_assessments":
						{
							docNewKnowledgeAcquaint.TopElem.confirmation_assessments.AssignElem( catLevel.confirmation_assessments );
							for(itemAssessmentID in docNewKnowledgeAcquaint.TopElem.confirmation_assessments)
							{
								if(!has_activity("assessment", itemAssessmentID.assessment_id, iPersonID))
								{
									tools.activate_test_to_person({"iPersonID": iPersonID, "iAssessmentID": itemAssessmentID.assessment_id});
								}
							}
							docNewKnowledgeAcquaint.TopElem.confirmation_courses.AssignElem( catLevel.confirmation_courses );
							for(itemCourseID in docNewKnowledgeAcquaint.TopElem.confirmation_courses)
							{
								if(!has_activity("course", itemCourseID.course_id, iPersonID))
								{
									tools.activate_course_to_person({"iPersonID": iPersonID, "iCourseID": itemCourseID.course_id});
								}
							}
							break;
						}
						case "certificates":
						{
							docNewKnowledgeAcquaint.TopElem.confirmation_certificates.AssignElem( catLevel.confirmation_certificates );
							break;
						}
						case "expert":
						{
							docNewKnowledgeAcquaint.TopElem.confirmation_expert_type = catLevel.confirmation_expert_type;
							docNewKnowledgeAcquaint.TopElem.confirmation_boss_type_id = catLevel.confirmation_boss_type_id;
							docNewKnowledgeAcquaint.TopElem.confirmation_person_id = catLevel.confirmation_person_id;
							break;
						}
						case "activity":
						{
							docNewKnowledgeAcquaint.TopElem.cost = catLevel.cost;
							docNewKnowledgeAcquaint.TopElem.currency_type_id = catLevel.currency_type_id;
							break;
						}
					}
				}
			}
			else
			{
				docNewKnowledgeAcquaint = tools.open_doc( iKnowledgeAcquaintID );
			}
			
			
			docNewKnowledgeAcquaint.TopElem.state_id = "process";
			docNewKnowledgeAcquaint.Save();
			oRes.action_result = { command: "alert", msg: ( i18n.t( 'vynachaliproces' ) ), confirm_result: { command: "reload_page" } };
			
			if( bSendBossNotification )
			{
				for( _boss_id in tools.call_code_library_method( "libMain", "get_user_bosses", [ iPersonID, null, true, null, { 'return_object_type': 'collaborator', 'return_object_value': 'id' } ] ).array )
				{
					tools.create_notification( "knowledge_acquaint_start", _boss_id, "", docNewKnowledgeAcquaint.DocID, null, docNewKnowledgeAcquaint.TopElem );
				}
			}
			if( bSendExpertNotification )
			{
				for( _expert in GetExperts( null, [ iKnowledgePartID ], true ).array )
				{
					tools.create_notification( "knowledge_acquaint_start", _expert.person_id, "", docNewKnowledgeAcquaint.DocID, null, docNewKnowledgeAcquaint.TopElem );
				}
			}
			if( bSendEvaluationExpertNotification )
			{
				switch( docNewKnowledgeAcquaint.TopElem.confirmation_type )
				{
					case "expert":
						switch( docNewKnowledgeAcquaint.TopElem.confirmation_expert_type )
						{
							case "func_manager":
								for( _boss_id in tools.call_code_library_method( "libMain", "get_user_bosses", [ iPersonID, null, false, ( docNewKnowledgeAcquaint.TopElem.confirmation_boss_type_id.HasValue ? [ docNewKnowledgeAcquaint.TopElem.confirmation_boss_type_id.Value ] : null ), { 'return_object_type': 'collaborator', 'return_object_value': 'id' } ] ).array )
								{
									tools.create_notification( "knowledge_acquaint_on_agree", _boss_id, "", docNewKnowledgeAcquaint.DocID, null, docNewKnowledgeAcquaint.TopElem );
								}
								break;
							case "boss":
								for( _boss_id in tools.call_code_library_method( "libMain", "get_user_bosses", [ iPersonID, null, true, null, { 'return_object_type': 'collaborator', 'return_object_value': 'id' } ] ).array )
								{
									tools.create_notification( "knowledge_acquaint_on_agree", _boss_id, "", docNewKnowledgeAcquaint.DocID, null, docNewKnowledgeAcquaint.TopElem );
								}
								break;
							case "expert":
								for( _expert_id in GetExperts( null, [ iKnowledgePartID ], true ).array )
								{
									tools.create_notification( "knowledge_acquaint_on_agree", _expert_id, "", docNewKnowledgeAcquaint.DocID, null, docNewKnowledgeAcquaint.TopElem );
								}
								break;
						}
						break;
				}
			}
			break;
		
		case "finish":
			if( iKnowledgeAcquaintID == undefined )
			{
				var ka_conds = new Array();
				ka_conds.push( "$elem/person_id = " + iPersonID );
				ka_conds.push( "$elem/knowledge_part_id = " + iKnowledgePartID );
				ka_conds.push( "MatchSome( $elem/state_id, ( 'process', 'plan' ) )" );
				if( catTargetKnowledgePart != undefined && OptInt( catTargetKnowledgePart.target_level_index ) != undefined )
				{
					ka_conds.push( "$elem/level_index >= " + catTargetKnowledgePart.target_level_index );
				}
				catKnowledgeAcquaint = ArrayOptFirstElem( XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( ka_conds, "This", " and " ) + " order by $elem/level_index descending return $elem" ) );
				if( catKnowledgeAcquaint == undefined )
				{
					oRes.action_result = { command: "alert", msg: ( i18n.t( 'usotrudnikanet_1' ) ) };
					return oRes;
				}
				else
				{
					docKnowledgeAcquaint = tools.open_doc( catKnowledgeAcquaint.id );
				}
			}
			else
			{
				docKnowledgeAcquaint = tools.open_doc( iKnowledgeAcquaintID );
			}
			
			
			oResProgress = GetPersonKnowledgeProgress( iKnowledgePartID, iPersonID );
			if( oResProgress.knowledge_acquaint_id != docKnowledgeAcquaint.DocID )
			{
				oRes.action_result = { command: "alert", msg: ( i18n.t( 'usotrudnikaest' ) ) };
				return oRes;
			}
			switch( docKnowledgeAcquaint.TopElem.confirmation_type )
			{
				case "expert":
					switch( docKnowledgeAcquaint.TopElem.confirmation_expert_type )
					{
						case "func_manager":
							if( !tools.call_code_library_method( "libMain", "is_boss", [ iPersonID, null, iUserID, false, ( docKnowledgeAcquaint.TopElem.confirmation_boss_type_id.HasValue ? [ docKnowledgeAcquaint.TopElem.confirmation_boss_type_id.Value ] : null ) ] ).is_boss )
							{
								oRes.action_result = { command: "alert", msg: ( i18n.t( 'uvasnetpravnap' ) ) };
								return oRes;
							}
							break;
						case "boss":
							if( !tools.call_code_library_method( "libMain", "is_boss", [ iPersonID, null, iUserID, true ] ).is_boss )
							{
								oRes.action_result = { command: "alert", msg: ( i18n.t( 'uvasnetpravnap' ) ) };
								return oRes;
							}
							break;
						case "expert":
							if( ArrayOptFind( GetExperts( null, [ iKnowledgePartID ], true ).array, "This.person_id == iUserID" ) == undefined )
							{
								oRes.action_result = { command: "alert", msg: ( i18n.t( 'uvasnetpravnap' ) ) };
								return oRes;
							}
							break;
					}
					if( bSendNotification )
					{
						tools.create_notification( "knowledge_acquaint_agreement", docKnowledgeAcquaint.TopElem.person_id, "", docKnowledgeAcquaint.DocID, null, docKnowledgeAcquaint.TopElem );
					}
					break;
				default:
					if( iUserID != iPersonID )
					{
						oRes.action_result = { command: "alert", msg: ( i18n.t( 'uvasnetpravnap' ) ) };
						return oRes;
					}
					if( oResProgress.percent < 100 )
					{
						oRes.action_result = { command: "alert", msg: ( i18n.t( 'vypolnenynevse' ) ) };
						return oRes;
					}
					if( bSendBossNotification )
					{
						for( _boss_id in tools.call_code_library_method( "libMain", "get_user_bosses", [ iPersonID, null, true, null, { 'return_object_type': 'collaborator', 'return_object_value': 'id' } ] ).array )
						{
							tools.create_notification( "knowledge_acquaint_agreement_boss", _boss_id, "", docKnowledgeAcquaint.DocID, null, docKnowledgeAcquaint.TopElem );
						}
					}
					if( bSendExpertNotification )
					{
						for( _expert in GetExperts( null, [ iKnowledgePartID ], true ).array )
						{
							tools.create_notification( "knowledge_acquaint_agreement_boss", _expert.person_id, "", docKnowledgeAcquaint.DocID, null, docKnowledgeAcquaint.TopElem );
						}
					}
					break;
			}
			docKnowledgeAcquaint.TopElem.confirmation_date = Date();
			docKnowledgeAcquaint.TopElem.state_id = "active";
			docKnowledgeAcquaint.Save();
			oRes.action_result = { command: "alert", msg: i18n.t( 'znaniepodtverzh' ), confirm_result: { command: "reload_page" } };
			break;
			
		case "cancel":
			
			if( iKnowledgeAcquaintID == undefined )
			{
				var ka_conds = new Array();
				ka_conds.push( "$elem/person_id = " + iPersonID );
				ka_conds.push( "$elem/knowledge_part_id = " + iKnowledgePartID );
				ka_conds.push( "MatchSome( $elem/state_id, ( 'process', 'plan' ) )" );
				if( catTargetKnowledgePart != undefined && OptInt( catTargetKnowledgePart.target_level_index ) != undefined )
				{
					ka_conds.push( "$elem/level_index >= " + catTargetKnowledgePart.target_level_index );
				}
				catKnowledgeAcquaint = ArrayOptFirstElem( XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( ka_conds, "This", " and " ) + " order by $elem/level_index descending return $elem" ) );
				if( catKnowledgeAcquaint == undefined )
				{
					oRes.action_result = { command: "alert", msg: ( i18n.t( 'uvasnetznaniyad' ) ) };
					return oRes;
				}
				else
				{
					docKnowledgeAcquaint = tools.open_doc( catKnowledgeAcquaint.id );
				}
			}
			else
			{
				docKnowledgeAcquaint = tools.open_doc( iKnowledgeAcquaintID );
			}
			
			if( docKnowledgeAcquaint.TopElem.state_id == "active" )
			{
				oRes.action_result = { command: "alert", msg: ( i18n.t( 'nelzyaotmenitpo' ) ) };
				return oRes;
			}
			
			switch( docKnowledgeAcquaint.TopElem.confirmation_type )
			{
				case "expert":
					switch( docKnowledgeAcquaint.TopElem.confirmation_expert_type )
					{
						case "func_manager":
							if( !tools.call_code_library_method( "libMain", "is_boss", [ iPersonID, null, iUserID, false, ( docKnowledgeAcquaint.TopElem.confirmation_boss_type_id.HasValue ? [ docKnowledgeAcquaint.TopElem.confirmation_boss_type_id.Value ] : null ) ] ).is_boss )
							{
								oRes.action_result = { command: "alert", msg: ( i18n.t( 'uvasnetpravnao' ) ) };
								return oRes;
							}
							break;
						case "boss":
							if( !tools.call_code_library_method( "libMain", "is_boss", [ iPersonID, null, iUserID, true ] ).is_boss )
							{
								oRes.action_result = { command: "alert", msg: ( i18n.t( 'uvasnetpravnao' ) ) };
								return oRes;
							}
							break;
						case "expert":
							if( ArrayOptFind( GetExperts( null, [ iKnowledgePartID ], true ).array, "This.person_id == iUserID" ) == undefined )
							{
								oRes.action_result = { command: "alert", msg: ( i18n.t( 'uvasnetpravnao' ) ) };
								return oRes;
							}
							break;
					}
					if( bSendNotification )
					{
						tools.create_notification( "knowledge_acquaint_reject", docKnowledgeAcquaint.TopElem.person_id, "", docKnowledgeAcquaint.DocID, null, docKnowledgeAcquaint.TopElem );
					}
					break;
				default:
					if( iUserID != iPersonID )
					{
						oRes.action_result = { command: "alert", msg: ( i18n.t( 'uvasnetpravnao' ) ) };
						return oRes;
					}
					
					break;
			}
			
			docKnowledgeAcquaint.TopElem.state_id = "cancel";
			docKnowledgeAcquaint.Save();
			oRes.action_result = { command: "alert", msg: i18n.t( 'znanieotkloneno' ), confirm_result: { command: "reload_page" } };
			break;
	}
	
	return oRes;
	
}

/**
 * @typedef {Object} WTGetKnowledgeAcquaintsResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oKnowledgeAcquaint[]} array
*/
/**
 * @typedef {Object} oKnowledgeAcquaint
 * @property {bigint} id - идентификатор Подтверждения знания
 * @property {bigint} person_id - идентификатор сотрудника
 * @property {string} person_image - ссылка на фото сотрудника
 * @property {string} person_fullname - ФИО сотрудника
 * @property {string} person_position_name - название основной должности сотрудника
 * @property {string} person_subdivision_name - название подразделения, к которому относится основная должность сотрудника
 * @property {string} level_name - название подтверждаемого уровня
 * @property {string} knowledge_part_name - название Значения карты знаний из Подтверждения
 * @property {bigint} knowledge_part_id - идентификатор Значения карты знаний из Подтверждения
*/
/**
 * @function GetKnowledgeAcquaints
 * @memberof Websoft.WT.Knowledge
 * @description Получить объекты подтверждения знаний пользователя
 * @param {bigint} iUserID - ID текущего пользователя
 * @param {boolean} sType - тип отбора подтверждения
 * @returns {WTGetKnowledgeAcquaintsResult[]}
 */

function GetKnowledgeAcquaints( iUserID, sType )
{
	return get_knowledge_acquaints( iUserID, sType )
	
}
function get_knowledge_acquaints( iUserID, sType )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];
	try
	{
		iUserID = Int( iUserID )
	}
	catch ( err )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iUserID' }";
		return oRes;
	}
	var xarrKnowledgeAcquaints = new Array();
	
	switch( sType )
	{
		case "on_agree":
			var ka_conds = new Array();
			oResArea = GetExpertKnowledgeArea( iUserID, true );
			if( ArrayOptFirstElem( oResArea.array ) != undefined )
			{
				ka_conds.push( "MatchSome( $elem/knowledge_part_id, ( " + ArrayMerge( oResArea.array, "This.id", "," ) + " ) )" );
				ka_conds.push( "$elem/state_id = 'process'" );
				ka_conds.push( "$elem/confirmation_type = 'expert'" );
				ka_conds.push( "$elem/confirmation_expert_type = 'expert'" );
				xarrKnowledgeAcquaints = ArrayUnion( xarrKnowledgeAcquaints, XQuery( "for $elem in knowledge_acquaints where " + ArrayMerge( ka_conds, "This", " and " ) + " return $elem" ) );
			}
			ka_conds = new Array();
			ka_conds.push( "$elem/state_id = 'process'" );
			ka_conds.push( "$elem/confirmation_type = 'expert'" );
			ka_conds.push( "$elem/confirmation_expert_type = 'boss'" );
			xarrKnowledgeAcquaints = ArrayUnion( xarrKnowledgeAcquaints, tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iUserID, [ "fact" ], false, "knowledge_acquaint", null, ArrayMerge( ka_conds, "This", " and " ), true, true, true, true, null, true ] ) );

			ka_conds = new Array();
			ka_conds.push( "$elem/state_id = 'process'" );
			ka_conds.push( "$elem/confirmation_type = 'expert'" );
			ka_conds.push( "$elem/confirmation_expert_type = 'func_manager'" );
			xarrTempKnowledgeAcquaints = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iUserID, [ "func" ], false, "knowledge_acquaint", null, ArrayMerge( ka_conds, "This", " and " ), true, true, true, true, null, true  ] );
			for( _ka in xarrTempKnowledgeAcquaints )
			{
				if( !_ka.confirmation_boss_type_id.HasValue || tools.call_code_library_method( "libMain", "is_boss", [ _ka.person_id, null, iUserID, false, ( [ _ka.confirmation_boss_type_id.Value ] ) ] ).is_boss )
				{
					xarrKnowledgeAcquaints.push( _ka )
				}
			}
			break;
	}
	
	for( _ka in xarrKnowledgeAcquaints )
	{
		oKnowledgeAcquaint = new Object();
		oKnowledgeAcquaint.id = _ka.id.Value;
		oKnowledgeAcquaint.person_id = _ka.person_id.Value;
		oKnowledgeAcquaint.person_image = tools_web.get_object_source_url( 'person', _ka.person_id );
		oKnowledgeAcquaint.person_fullname = _ka.person_fullname.Value;
		oKnowledgeAcquaint.person_position_name = _ka.person_position_name.Value;
		oKnowledgeAcquaint.person_subdivision_name = _ka.person_subdivision_name.Value;
		oKnowledgeAcquaint.level_name = _ka.level_name.Value;
		oKnowledgeAcquaint.knowledge_part_name = _ka.knowledge_part_name.Value;
		oKnowledgeAcquaint.knowledge_part_id = _ka.knowledge_part_id.Value;
		
		oRes.array.push( oKnowledgeAcquaint )
	}
	
	return oRes;
}

/**
 * @typedef {Object} WTGetSubordinatesByKnowledgeResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oSubordinatesByKnowledge[]} array
*/
/**
 * @typedef {Object} oSubordinatesByKnowledge
 * @property {bigint} id - идентификатор сотрудника
 * @property {string} image - ссылка на фото сотрудника
 * @property {string} link - ссылка на карточку сотрудника
 * @property {string} fullname - ФИО сотрудника
 * @property {string} position_name - название основной должности сотрудника
 * @property {string} subdivision_name - название подразделения, к которому относится основная должность сотрудника
 * @property {string} current_level_name - название подтверждаемого уровня
 * @property {string} target_level_name - название требуемого уровня
 * @property {string} knowledge_type - тип знания – корпоративное (из профиля знаний и из подтверждений с типом Корпоративное), проектное (подтверждение с типом По результатам проекта), область интересов (подтверждение с типом По интересам). Знание может относиться сразу к нескольким типам, выдаем их одной строкой через запятую
 * @property {boolean} completed - подтвержденный уровень больше или равен требуемому
 * @property {string} completed_title - признак подтверждения уровня
*/
/**
 * @function GetSubordinatesByKnowledge
 * @memberof Websoft.WT.Knowledge
 * @description Подчиненные по знанию
 * @param {bigint} iUserID - ID текущего пользователя
 * @param {bigint} iKnowledgePartID - ID значения карты знаний
 * @param {oSort} oSort - Информация из рантайма о сортировке.
 * @param {oPaging} oPaging - Информация из рантайма о пейджинге.
 * @returns {WTGetSubordinatesByKnowledgeResult[]}
 */

function GetSubordinatesByKnowledge( iUserID, iKnowledgePartID, oSort, oPaging )
{
	return get_subordinates_by_knowledge( iUserID, iKnowledgePartID, oSort, oPaging )
	
}
function get_subordinates_by_knowledge( iUserID, iKnowledgePartID, oSort, oPaging )
{
	var oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];
	try
	{
		iUserID = Int( iUserID )
	}
	catch ( err )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iUserID' }";
		return oRes;
	}
	try
	{
		iKnowledgePartID = Int( iKnowledgePartID )
	}
	catch ( err )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iKnowledgePartID' }";
		return oRes;
	}
	
	function get_knowledge_type_name( arr )
	{
		arr = ArraySelectDistinct( arr, "This.type_id" );
		var arr_names = new Array();
		if( ArrayOptFind( arr, "This.type_id == 'corporative'" ) != undefined )
		{
			arr_names.push( i18n.t( 'korporativnoe' ) );
		}
		if( ArrayOptFind( arr, "This.type_id == 'interest'" ) != undefined )
		{
			arr_names.push( i18n.t( 'oblastintereso' ) );
		}
		if( ArrayOptFind( arr, "This.type_id == 'project'" ) != undefined )
		{
			arr_names.push( i18n.t( 'proektnoe' ) );
		}
		
		return ArrayMerge( arr_names, "This", ", " )
	}
	
	xarrSubordinates = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iUserID, null, false, null, null, "", true, true, true, true, null, true ] );
	if( ArrayOptFirstElem( xarrSubordinates ) == undefined )
	{
		return oRes;
	}
	var arrTargetKnowledges = get_target_knowledge( xarrSubordinates, null, [ iKnowledgePartID ] );
	var xarrKnowledgeAcquaints = XQuery( "for $elem_qc in knowledge_acquaints where MatchSome($elem_qc/person_id, (" + ArrayMerge( xarrSubordinates, "This.id", "," ) + ")) order by $elem_qc/level_index descending return $elem_qc/Fields('person_id','level_name','state_id','finish_date','type_id','knowledge_part_id','level_index')" );
	xarrKnowledgeAcquaints = ArraySelect( xarrKnowledgeAcquaints, "This.knowledge_part_id == iKnowledgePartID && This.type_id == 'corporative' && ( This.state_id == 'active' ) && ( !This.finish_date.HasValue || This.finish_date > Date() )" );
	xarrKnowledgeAcquaints = ArraySelectDistinct( xarrKnowledgeAcquaints, "This.person_id" );
	for( _tk in arrTargetKnowledges )
	{
		catCollaborator = ArrayOptFindByKey( xarrSubordinates, _tk.object_id, "id" );
		if( catCollaborator == undefined )
		{
			continue;
		}
		arrCurrentLevel = ArraySelectByKey( xarrKnowledgeAcquaints, _tk.object_id, "person_id" );
		catCurrentLevel = undefined;
		if( ArrayOptFirstElem( arrCurrentLevel ) != undefined )
		{
			catCurrentLevel = ArrayMax( arrCurrentLevel, "This.level_index" );
		}
		oSubordinate = new Object();
		oSubordinate.id = catCollaborator.id.Value;
		oSubordinate.image = get_object_image_url( catCollaborator );
		oSubordinate.link = tools_web.get_mode_clean_url( null, catCollaborator.id );
		oSubordinate.fullname = catCollaborator.fullname.Value;
		oSubordinate.position_name = catCollaborator.position_name.Value;
		oSubordinate.subdivision_name = catCollaborator.position_parent_name.Value;
		oSubordinate.current_level_name = ( catCurrentLevel != undefined ? catCurrentLevel.level_name.Value : "-" );
		oSubordinate.target_level_name = ( _tk.target_level_name != "" ? _tk.target_level_name : "-" );
		oSubordinate.knowledge_type = get_knowledge_type_name( arrCurrentLevel );
		oSubordinate.completed = ( catCurrentLevel != undefined ? catCurrentLevel.level_index >= _tk.target_level_index : false );
		oSubordinate.completed_title = ( oSubordinate.completed ? i18n.t( 'podtverzhdeno' ) : i18n.t( 'nepodtverzhdeno' ) );
		
		oRes.array.push( oSubordinate )
	}
	oRes.array = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ oRes.array, oPaging, oSort ] ).oResult;
	
	return oRes;
}


/**
 * @function AcquaintOpenFullPostAction
 * @memberof Websoft.WT.Knowledge
 * @description Проставляет категории у объекта, заданного параметром iAcquaintID. Категории берутся из teRemoteAction. Эта функция - post_action, вызываемая при сохранении карточки ознакомления
 * @author EO
 * @param {bigint} iAcquaintID - ID ознакомления
 * @param {boolean} bIsEdit - состояние параметра is_edit объекта-команды вызова карточки (command: "open_doc"...)
 * @param {bigint} iAppID - id текущего приложения
 * @param {oPaging} teRemoteAction - TopElem текущего удаленного действия
 */
function AcquaintOpenFullPostAction( iAcquaintID, bIsEdit, iAppID, teRemoteAction )
{
	try
	{
		sFormFields = teRemoteAction.wvars.ObtainChildByKey( 'form_fields' ).value;
		oFormFields = ParseJson( sFormFields );
		sRoleIDs = ArrayOptFind( oFormFields, "This.name == 'roles_id'" );
		arrRoleIDs = tools_web.parse_multiple_parameter( sRoleIDs.value );

		if ( ArrayOptFirstElem(arrRoleIDs) == undefined )
		{
			return;
		}

		iAcquaintID = OptInt( iAcquaintID );
		if ( iAcquaintID != undefined )
		{
			docAcquaint = tools.open_doc( iAcquaintID );
			if ( docAcquaint != undefined && docAcquaint.TopElem.Name == "acquaint" )
			{
				for ( iRoleID in arrRoleIDs )
				{
					iRoleID = OptInt( iRoleID );
					if ( iRoleID != undefined )
					{
						docAcquaint.TopElem.role_id.ObtainByValue ( iRoleID )
					}
				}
				docAcquaint.Save();
			}
		}
	}
	catch (err) {}
}


/**
 * @typedef {Object} oKnowledgeProfile
 * @property {bigint} id
 * @property {string} code - код профиля знаний
 * @property {string} name - название профиля знаний
 * @property {bigint} knowledge_part_count - число значений карты знаний в профиле знаний
 * @property {bigint} position_count - число должностей в профиле знаний 
*/

/**
 * @typedef {Object} ReturnKnowledgeProfiles
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oKnowledgeProfile[]} array – Коллекция сотрудников.
*/

/**
 * @function GetKnowledgeProfiles
 * @memberof Websoft.WT.Knowledge
 * @author EO
 * @description Получение списка профилей знаний
 * @param {string} [arrReturnData] - массив полей для вывода: "knowledge_part_count"(Число значений карты знаний), "position_count"(Число должностей)
 * @param {string} sXQueryQual строка для XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnKnowledgeProfiles}
*/
function GetKnowledgeProfiles( arrReturnData, sXQueryQual, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.paging = oCollectionParams.paging;
	oRes.array = [];

	var arrXQConds = [];

	if ( sXQueryQual == null || sXQueryQual == undefined)
		sXQueryQual = "";

	if ( sXQueryQual != "" )
	{
		arrXQConds.push( sXQueryQual );
	}

	if ( oCollectionParams.HasProperty("filters") && IsArray( oCollectionParams.filters ) )
	{
		arrFilters = oCollectionParams.filters;
	}
	else
	{
		arrFilters = [];
	}

    for ( oFilter in arrFilters )
	{
		if ( oFilter.type == 'search' )
		{
			if ( oFilter.value != '' ) 
				arrXQConds.push("doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )");
		}
	}

	var sXQConds = ArrayOptFirstElem(arrXQConds) == undefined ? "" : " where " + ArrayMerge(arrXQConds, "This", " and ");
	var sReq = "for $elem in knowledge_profiles" + sXQConds + " order by $elem/name return $elem/Fields('id','code','name','knowledge_parts')";
	var xarrKnowProfiles = tools.xquery(sReq);
	
	var xarrPositions = tools.xquery( "for $elem in positions where $elem/knowledge_profile_id != null() return $elem/Fields('knowledge_profile_id')" ); 

	for ( oItem in xarrKnowProfiles )
	{
		oElem = {
			id: oItem.id.Value,
			code: oItem.code.Value,
			name: oItem.name.Value,
			knowledge_part_count: null,
			position_count: null,
		};

		if ( ArrayOptFirstElem( arrReturnData ) != undefined )
		{
			for ( itemReturnData in arrReturnData )
			{
				switch ( itemReturnData )
				{
					case "knowledge_part_count": //Число значений карты знаний
						oElem.knowledge_part_count = ArrayCount( ArraySelect( String(oItem.knowledge_parts).split(";"), "OptInt(This) != undefined" ) );
						break;
					case "position_count": //Число должностей
						oElem.position_count = ArrayCount( ArraySelect(xarrPositions, 'This.knowledge_profile_id.Value == oItem.id') );
						break;
				}
			}
		}
		oRes.array.push(oElem);
	}

	if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		oRes.array = ArraySort(oRes.array, sFieldName, ((oCollectionParams.sort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(oRes.array);
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange(oRes.array, OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE, oCollectionParams.paging.SIZE);
	}

	return oRes;
}


/**
 * @typedef {Object} oReturnKnowledgePartLevels
 * @property {bigint} id
 * @property {string} code - код категории значений карты знаний
 * @property {string} name - название категории значений карты знаний
*/

/**
 * @typedef {Object} ReturnKnowledgePartLevels
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oReturnKnowledgePartLevels[]} array – Коллекция категорий значений карты знаний
*/

/**
 * @function GetKnowledgePartLevels
 * @memberof Websoft.WT.Knowledge
 * @author EO
 * @description Получение списка категорий значений карты знаний
 * @param {string} sXQueryQual строка для XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnKnowledgePartLevels}
*/
function GetKnowledgePartLevels( sXQueryQual, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.paging = oCollectionParams.paging;
	oRes.array = [];

	var arrXQConds = [];

	if ( sXQueryQual == null || sXQueryQual == undefined)
		sXQueryQual = "";

	if ( sXQueryQual != "" )
	{
		arrXQConds.push( sXQueryQual );
	}

	if ( oCollectionParams.HasProperty("filters") && IsArray( oCollectionParams.filters ) )
	{
		arrFilters = oCollectionParams.filters;
	}
	else
	{
		arrFilters = [];
	}

    for ( oFilter in arrFilters )
	{
		if ( oFilter.type == 'search' )
		{
			if ( oFilter.value != '' ) 
				arrXQConds.push("doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )");
		}
	}

	var sXQConds = ArrayOptFirstElem(arrXQConds) == undefined ? "" : " where " + ArrayMerge(arrXQConds, "This", " and ");
	var sReq = "for $elem in knowledge_part_levels" + sXQConds + " order by $elem/name return $elem/Fields('id','code','name')";
	var xarrKnowPartLevels = tools.xquery(sReq);

    for ( oItem in xarrKnowPartLevels )
	{
		oElem = {
			id: oItem.id.Value,
			code: oItem.code.Value,
			name: oItem.name.Value,
		};
		oRes.array.push(oElem);
	}

	if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		oRes.array = ArraySort(oRes.array, sFieldName, ((oCollectionParams.sort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(oRes.array);
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange(oRes.array, OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE, oCollectionParams.paging.SIZE);
	}

	return oRes;
}


/**
 * @typedef {Object} oReturnKnowledgePartTypes
 * @property {bigint} id
 * @property {string} code - код типа значений карты знаний
 * @property {string} name - название типа значений карты знаний
*/

/**
 * @typedef {Object} ReturnKnowledgePartTypes
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oReturnKnowledgePartTypes[]} array – Коллекция типов значений карты знаний
*/

/**
 * @function GetKnowledgePartTypes
 * @memberof Websoft.WT.Knowledge
 * @author EO
 * @description Получение списка типов значений карты знаний
 * @param {string} sXQueryQual строка для XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnKnowledgePartTypes}
*/
function GetKnowledgePartTypes( sXQueryQual, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.paging = oCollectionParams.paging;
	oRes.array = [];

	var arrXQConds = [];

	if ( sXQueryQual == null || sXQueryQual == undefined)
		sXQueryQual = "";

	if ( sXQueryQual != "" )
	{
		arrXQConds.push( sXQueryQual );
	}

	if ( oCollectionParams.HasProperty("filters") && IsArray( oCollectionParams.filters ) )
	{
		arrFilters = oCollectionParams.filters;
	}
	else
	{
		arrFilters = [];
	}

    for ( oFilter in arrFilters )
	{
		if ( oFilter.type == 'search' )
		{
			if ( oFilter.value != '' ) 
				arrXQConds.push("doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )");
		}
	}

	var sXQConds = ArrayOptFirstElem(arrXQConds) == undefined ? "" : " where " + ArrayMerge(arrXQConds, "This", " and ");
	var sReq = "for $elem in knowledge_part_types" + sXQConds + " order by $elem/name return $elem/Fields('id','code','name')";
	var xarrKnowPartTypes = tools.xquery(sReq);

    for ( oItem in xarrKnowPartTypes )
	{
		oElem = {
			id: oItem.id.Value,
			code: oItem.code.Value,
			name: oItem.name.Value,
		};
		oRes.array.push(oElem);
	}

	if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		oRes.array = ArraySort(oRes.array, sFieldName, ((oCollectionParams.sort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(oRes.array);
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange(oRes.array, OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE, oCollectionParams.paging.SIZE);
	}

	return oRes;
}


/**
 * @typedef {Object} oReturnGetKnowledgeClassifiers
 * @property {bigint} id
 * @property {string} code - код классификатора
 * @property {string} name - название классификатора
 * @property {bigint} id - число значений карты знаний, относящихся к данному классификатору
 * 
*/

/**
 * @typedef {Object} ReturnKnowledgeClassifiers
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oReturnGetKnowledgeClassifiers[]} array – Коллекция классификаторов
*/

/**
 * @function GetKnowledgeClassifiers
 * @memberof Websoft.WT.Knowledge
 * @author EO
 * @description Получение списка классификаторов
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {string} sAccessType - Тип доступа: "admin"/"manager"/"hr"/"expert"/"observer"/"auto"
 * @param {string} sApplication код приложения, по которому определяется доступ
 * @param {string} [arrReturnData] - массив полей для вывода: "knowledge_part_count"(общее количество значений карты знаний, относящихся к данному классификатору)
 * @param {string} sXQueryQual строка для XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnKnowledgeClassifiers}
*/
function GetKnowledgeClassifiers( iCurUserID, sAccessType, sApplication, arrReturnData, sXQueryQual, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.paging = oCollectionParams.paging;
	oRes.array = [];

	var arrXQConds = [];

	if ( sAccessType == null || sAccessType == undefined)
	{
		sAccessType = "auto";
	}

	if ( sAccessType != "auto" && sAccessType != "admin" && sAccessType != "manager" && sAccessType != "hr" && sAccessType != "expert" && sAccessType != "observer" )
	{
		sAccessType = "auto";
	}
	
	if ( sApplication == null || sApplication == undefined)
	{
		sApplication = "";
	}

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
			sAccessType = "admin"; //Администратор приложения
		}
		else if(iApplLevel >= 7)
		{
			sAccessType = "manager"; //Администратор процесса
		}
		else if(iApplLevel >= 5)
		{
			sAccessType = "hr"; //Администратор HR
		}
		else if(iApplLevel >= 3)
		{
			sAccessType = "expert"; //Эксперт
		}
		else if(iApplLevel >= 1)
		{
			sAccessType = "observer"; //Наблюдатель
		}
		else
		{
			sAccessType = "reject";
		}
	}

	switch(sAccessType)
	{
		case "expert":
			oExpert = ArrayOptFirstElem(tools.xquery("for $elem in experts where $elem/type = 'collaborator' and $elem/person_id = " + iCurUserID + " return $elem/Fields('id')"));
			xarrKnowParts_Classifier = [];
			if (oExpert != undefined)
			{
				xarrKnowParts_Classifier = tools.xquery( "for $elem in knowledge_parts where contains($elem/experts," + OptInt(oExpert.id, 0) + ") and $elem/knowledge_classifier_id != null() return $elem/Fields('knowledge_classifier_id') " );
			}
			arrXQConds.push( "MatchSome( $elem/id, ( " + ArrayMerge( xarrKnowParts_Classifier, "This.knowledge_classifier_id", "," ) + " ) )" );
			break;
	}

	if ( sXQueryQual == null || sXQueryQual == undefined)
		sXQueryQual = "";

	if ( sXQueryQual != "" )
	{
		arrXQConds.push( sXQueryQual );
	}

	if ( oCollectionParams.HasProperty("filters") && IsArray( oCollectionParams.filters ) )
	{
		arrFilters = oCollectionParams.filters;
	}
	else
	{
		arrFilters = [];
	}

    for ( oFilter in arrFilters )
	{
		if ( oFilter.type == 'search' )
		{
			if ( oFilter.value != '' ) 
				arrXQConds.push("doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )");
		}
	}

	var sXQConds = ArrayOptFirstElem(arrXQConds) == undefined ? "" : " where " + ArrayMerge(arrXQConds, "This", " and ");
	var sReq = "for $elem in knowledge_classifiers" + sXQConds + " order by $elem/name return $elem/Fields('id','code','name')";
	var xarrKnowPartClassifiers = tools.xquery(sReq);

	
	sReq = "for $elem in knowledge_parts where $elem/knowledge_classifier_id != null() return $elem/Fields('knowledge_classifier_id')";
	var xarrKnowParts = tools.xquery(sReq);
	

    for ( oItem in xarrKnowPartClassifiers )
	{
		oElem = {
			id: oItem.id.Value,
			code: oItem.code.Value,
			name: oItem.name.Value,
			knowledge_part_count: null,
		};

		if ( ArrayOptFirstElem( arrReturnData ) != undefined )
		{
			for ( itemReturnData in arrReturnData )
			{
				switch ( itemReturnData )
				{
					case "knowledge_part_count": //Число значений карты знаний
						oElem.knowledge_part_count = ArrayCount( ArraySelect( xarrKnowParts, "This.knowledge_classifier_id.Value == oItem.id.Value" ) );
						break;
				}
			}
		}
		oRes.array.push(oElem);
	}

	if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		oRes.array = ArraySort(oRes.array, sFieldName, ((oCollectionParams.sort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(oRes.array);
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange(oRes.array, OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE, oCollectionParams.paging.SIZE);
	}

	return oRes;
}

/**
 * @typedef {Object} ReturnTags
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oTag[]} array – Коллекция тегов
*/

/**
 * @function GetTags
 * @memberof Websoft.WT.Knowledge
 * @author EO
 * @description Получение списка тегов
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {string} sAccessType - Тип доступа: "admin"/"manager"/"hr"/"expert"/"observer"/"auto"
 * @param {string} sApplication код приложения, по которому определяется доступ
 * @param {string} sXQueryQual строка для XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnTags}
*/
function GetTags( iCurUserID, sAccessType, sApplication, sXQueryQual, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.paging = oCollectionParams.paging;
	oRes.array = [];

	var arrXQConds = [];

	if ( sAccessType == null || sAccessType == undefined)
	{
		sAccessType = "auto";
	}

	if ( sAccessType != "auto" && sAccessType != "admin" && sAccessType != "manager" && sAccessType != "hr" && sAccessType != "expert" && sAccessType != "observer" )
	{
		sAccessType = "auto";
	}
	
	if ( sApplication == null || sApplication == undefined)
	{
		sApplication = "";
	}

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
			sAccessType = "admin"; //Администратор приложения
		}
		else if(iApplLevel >= 7)
		{
			sAccessType = "manager"; //Администратор процесса
		}
		else if(iApplLevel >= 5)
		{
			sAccessType = "hr"; //Администратор HR
		}
		else if(iApplLevel >= 3)
		{
			sAccessType = "expert"; //Эксперт
		}
		else if(iApplLevel >= 1)
		{
			sAccessType = "observer"; //Наблюдатель
		}
		else
		{
			sAccessType = "reject";
		}
	}

	switch(sAccessType)
	{
		case "expert":
			arrXQExpertConds = [];
			oExpert = ArrayOptFirstElem(tools.xquery("for $elem in experts where $elem/type = 'collaborator' and $elem/person_id = " + iCurUserID + " return $elem/Fields('id')"));
			if (oExpert != undefined)
			{
				arrRoles = tools.xquery("for $elem in roles where $elem/catalog_name = 'tag' and contains($elem/experts," + OptInt(oExpert.id, 0) + ") return $elem/Fields('id')");
				if (ArrayOptFirstElem(arrRoles) != undefined)
				{
					arrXQExpertConds.push( "MatchSome( $elem/role_id, ( " + ArrayMerge( arrRoles, "This.id.Value", "," ) + " ) )" );
				}
				arrXQExpertConds.push( "contains($elem/experts," + OptInt(oExpert.id, 0) + ")" );
			}
			if ( ArrayOptFirstElem( arrXQExpertConds) != undefined )
			{
				arrXQConds.push( "( " +  ArrayMerge( arrXQExpertConds, "This", " or " ) + " )" )
			}
			break;
	}

	if ( sXQueryQual == null || sXQueryQual == undefined)
		sXQueryQual = "";

	if ( sXQueryQual != "" )
	{
		arrXQConds.push( sXQueryQual );
	}

	if ( oCollectionParams.HasProperty("filters") && IsArray( oCollectionParams.filters ) )
	{
		arrFilters = oCollectionParams.filters;
	}
	else
	{
		arrFilters = [];
	}

    for ( oFilter in arrFilters )
	{
		if ( oFilter.type == 'search' )
		{
			if ( oFilter.value != '' ) 
				arrXQConds.push("doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )");
		}
	}

	var sXQConds = ArrayOptFirstElem(arrXQConds) == undefined ? "" : " where " + ArrayMerge(arrXQConds, "This", " and ");
	var sReq = "for $elem in tags" + sXQConds + " order by $elem/name return $elem/Fields('id','code','name','knowledge_part_id')";
	var xarrTags = tools.xquery(sReq);

    for ( oItem in xarrTags )
	{
		oElem = {
			id: oItem.id.Value,
			code: oItem.code.Value,
			name: oItem.name.Value,
			knowledge_part_name: ( oItem.knowledge_part_id.OptForeignElem != undefined ) ? oItem.knowledge_part_id.ForeignElem.name.Value : ""
		};

		oRes.array.push(oElem);
	}

	if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		oRes.array = ArraySort(oRes.array, sFieldName, ((oCollectionParams.sort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(oRes.array);
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange(oRes.array, OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE, oCollectionParams.paging.SIZE);
	}

	return oRes;
}


/**
 * @function TagOpenFullPostAction
 * @memberof Websoft.WT.Knowledge
 * @description Проставляет категории у объекта, заданного параметром iTagID. Категории берутся из teRemoteAction. Эта функция - post_action, вызываемая при сохранении карточки тега
 * @author EO
 * @param {bigint} iTagID - ID тега
 * @param {boolean} bIsEdit - состояние параметра is_edit объекта-команды вызова карточки (command: "open_doc"...)
 * @param {bigint} iAppID - id текущего приложения
 * @param {oPaging} teRemoteAction - TopElem текущего удаленного действия
 */
 function TagOpenFullPostAction( iTagID, bIsEdit, iAppID, teRemoteAction )
 {
	 try
	 {
		 sFormFields = teRemoteAction.wvars.ObtainChildByKey( 'form_fields' ).value;
		 oFormFields = ParseJson( sFormFields );
		 sRoleIDs = ArrayOptFind( oFormFields, "This.name == 'roles_id'" );
		 arrRoleIDs = tools_web.parse_multiple_parameter( sRoleIDs.value );
 
		 if ( ArrayOptFirstElem(arrRoleIDs) == undefined )
		 {
			 return;
		 }
 
		 iTagID = OptInt( iTagID );
		 if ( iTagID != undefined )
		 {
			 docTag = tools.open_doc( iTagID );
			 if ( docTag != undefined && docTag.TopElem.Name == "tag" )
			 {
				 for ( iRoleID in arrRoleIDs )
				 {
					 iRoleID = OptInt( iRoleID );
					 if ( iRoleID != undefined )
					 {
                        docTag.TopElem.role_id.ObtainByValue ( iRoleID )
					 }
				 }
				 docTag.Save();
			 }
		 }
	 }
	 catch (err) {}
 }


 /**
 * @typedef {Object} WTTagDeleteResult
 * @memberof Websoft.WT.Knowledge
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {integer} TagDeletedCount – количество удаленных тегов
*/
/**
 * @function TagDelete
 * @memberof Websoft.WT.Knowledge
 * @description Удаляет теги
 * @author EO
 * @param {bigint[]} arrTagIDs - массив ID тегов
 * @returns {WTTagDeleteResult}
*/
function TagDelete( arrTagIDs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.TagDeletedCount = 0;
	
	if(!IsArray(arrTagIDs))
	{
		oRes.error = 501;
		oRes.errorText = i18n.t( 'argumentfunkci_2' );
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrTagIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = i18n.t( 'vmassivenetnio' );
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "tag")
	{
		oRes.error = 503;
		oRes.errorText = i18n.t( 'massivneyavlyaet' );
		return oRes;
	}

	xarrTaggedObjects = tools.xquery("for $elem in tagged_objects return $elem/Fields('tag_id')");

	for ( itemTagID in arrTagIDs )
	{
		try
		{
			iTagID = OptInt(itemTagID);
			if(iTagID == undefined)
			{
				throw i18n.t( 'elementmassiva' );
			}
			if ( ArrayOptFind( xarrTaggedObjects, "OptInt(This.tag_id.Value, -1) == iTagID" ) != undefined )
			{
				continue;
			}

			DeleteDoc( UrlFromDocID( Int( iTagID ) ) );
			oRes.TagDeletedCount++;
		}
		catch( err )
		{
			oRes.error = 504;
			oRes.errorText = err;
		}
	}

	return oRes;
}


/**
 * @typedef {Object} WTKnowledgePartTypeDeleteResult
 * @memberof Websoft.WT.Knowledge
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {integer} KnowPartTypeDeletedCount – количество удаленных типов значений карты знаний
*/
/**
 * @function KnowledgePartTypeDelete
 * @memberof Websoft.WT.Knowledge
 * @description Удаляет типы значений карты знаний
 * @author EO
 * @param {bigint[]} arrKnowPartTypeIDs - массив ID типов значений карты знаний
 * @returns {WTKnowledgePartTypeDeleteResult}
*/
function KnowledgePartTypeDelete( arrKnowPartTypeIDs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.KnowPartTypeDeletedCount = 0;

	if(!IsArray(arrKnowPartTypeIDs))
	{
		oRes.error = 501;
		oRes.errorText = i18n.t( 'argumentfunkci_2' );
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrKnowPartTypeIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = i18n.t( 'vmassivenetnio' );
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "knowledge_part_type")
	{
		oRes.error = 503;
		oRes.errorText = i18n.t( 'massivneyavlyaet_1' );
		return oRes;
	}

	xarrKnowParts = tools.xquery("for $elem in knowledge_parts where $elem/knowledge_part_type_id != null() return $elem/Fields('knowledge_part_type_id')");

	for ( itemKnowPartTypeID in arrKnowPartTypeIDs )
	{
		try
		{
			iKnowPartTypeID = OptInt(itemKnowPartTypeID);
			if(iKnowPartTypeID == undefined)
			{
				throw i18n.t( 'elementmassiva' );
			}
			if ( ArrayOptFind( xarrKnowParts, "OptInt(This.knowledge_part_type_id.Value, -1) == iKnowPartTypeID" ) != undefined )
			{
				continue;
			}

			DeleteDoc( UrlFromDocID( Int( iKnowPartTypeID ) ) );
			oRes.KnowPartTypeDeletedCount++;
		}
		catch( err )
		{
			oRes.error = 504;
			oRes.errorText = err;
		}
	}

	return oRes;
}


/**
 * @typedef {Object} WTKnowledgeProfileDeleteResult
 * @memberof Websoft.WT.Knowledge
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {integer} KnowProfileDeletedCount – количество удаленных профилей знаний
*/
/**
 * @function KnowledgeProfileDelete
 * @memberof Websoft.WT.Knowledge
 * @description Удаляет профили знаний
 * @author EO
 * @param {bigint[]} arrKnowProfileIDs - массив ID профилей знаний
 * @returns {WTKnowledgeProfileDeleteResult}
*/
function KnowledgeProfileDelete( arrKnowProfileIDs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.KnowProfileDeletedCount = 0;

	if(!IsArray(arrKnowProfileIDs))
	{
		oRes.error = 501;
		oRes.errorText = i18n.t( 'argumentfunkci_2' );
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrKnowProfileIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = i18n.t( 'vmassivenetnio' );
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "knowledge_profile")
	{
		oRes.error = 503;
		oRes.errorText = i18n.t( 'massivneyavlyaet_2' );
		return oRes;
	}

	xarrPositions = tools.xquery("for $elem in positions where $elem/knowledge_profile_id != null() return $elem/Fields('knowledge_profile_id')");

	for ( itemKnowProfileID in arrKnowProfileIDs )
	{
		try
		{
			iKnowProfileID = OptInt(itemKnowProfileID);
			if(iKnowProfileID == undefined)
			{
				throw i18n.t( 'elementmassiva' );
			}
			if ( ArrayOptFind( xarrPositions, "OptInt(This.knowledge_profile_id.Value, -1) == iKnowProfileID" ) != undefined )
			{
				continue;
			}
			

			DeleteDoc( UrlFromDocID( Int( iKnowProfileID ) ) );
			oRes.KnowProfileDeletedCount++;
		}
		catch( err )
		{
			oRes.error = 504;
			oRes.errorText = err;
		}
	}

	return oRes;
}


/**
 * @typedef {Object} WTKnowledgeClassifierDeleteResult
 * @memberof Websoft.WT.Knowledge
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {integer} KnowClassifierDeletedCount – количество удаленных классификаторов
*/
/**
 * @function KnowledgeClassifierDelete
 * @memberof Websoft.WT.Knowledge
 * @description Удаляет классификаторы
 * @author EO
 * @param {bigint[]} arrKnowClassifierIDs - массив ID классификаторов
 * @returns {WTKnowledgeClassifierDeleteResult}
*/
function KnowledgeClassifierDelete( arrKnowClassifierIDs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.KnowClassifierDeletedCount = 0;

	if(!IsArray(arrKnowClassifierIDs))
	{
		oRes.error = 501;
		oRes.errorText = i18n.t( 'argumentfunkci_2' );
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrKnowClassifierIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = i18n.t( 'vmassivenetnio' );
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "knowledge_classifier")
	{
		oRes.error = 503;
		oRes.errorText = i18n.t( 'massivneyavlyaet_3' );
		return oRes;
	}

	xarrKnowParts = tools.xquery("for $elem in knowledge_parts where $elem/knowledge_classifier_id != null() return $elem/Fields('knowledge_classifier_id')");

	for ( itemKnowClassifierID in arrKnowClassifierIDs )
	{
		try
		{
			iKnowClassifierID = OptInt(itemKnowClassifierID);
			if(iKnowClassifierID == undefined)
			{
				throw i18n.t( 'elementmassiva' );
			}
			if ( ArrayOptFind( xarrKnowParts, "OptInt(This.knowledge_classifier_id.Value, -1) == iKnowClassifierID" ) != undefined )
			{
				continue;
			}

			DeleteDoc( UrlFromDocID( Int( iKnowClassifierID ) ) );
			oRes.KnowClassifierDeletedCount++;
		}
		catch( err )
		{
			oRes.error = 504;
			oRes.errorText = err;
		}
	}

	return oRes;
}


/**
 * @typedef {Object} WTKnowledgePartLevelDeleteResult
 * @memberof Websoft.WT.Knowledge
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {integer} KnowPartLevelDeletedCount – количество удаленных категорий значения карты знаний
*/
/**
 * @function KnowledgePartLevelDelete
 * @memberof Websoft.WT.Knowledge
 * @description Удаляет категории значения карты знаний
 * @author EO
 * @param {bigint[]} arrKnowPartLevelIDs - массив ID категорий значения карты знаний
 * @returns {WTKnowledgePartLevelDeleteResult}
*/
function KnowledgePartLevelDelete( arrKnowPartLevelIDs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.KnowPartLevelDeletedCount = 0;

	if(!IsArray(arrKnowPartLevelIDs))
	{
		oRes.error = 501;
		oRes.errorText = i18n.t( 'argumentfunkci_2' );
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrKnowPartLevelIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = i18n.t( 'vmassivenetnio' );
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "knowledge_part_level")
	{
		oRes.error = 503;
		oRes.errorText = i18n.t( 'massivneyavlyaet_4' );
		return oRes;
	}

	xarrKnowObjects = tools.xquery("for $elem in knowledge_objects where $elem/knowledge_part_level_id != null() return $elem/Fields('knowledge_part_level_id')");

	for ( itemKnowPartLevelID in arrKnowPartLevelIDs )
	{
		try
		{
			iKnowPartLevelID = OptInt(itemKnowPartLevelID);
			if(iKnowPartLevelID == undefined)
			{
				throw i18n.t( 'elementmassiva' );
			}
			if ( ArrayOptFind( xarrKnowObjects, "OptInt(This.knowledge_part_level_id.Value, -1) == iKnowPartLevelID" ) != undefined )
			{
				continue;
			}

			DeleteDoc( UrlFromDocID( Int( iKnowPartLevelID ) ) );
			oRes.KnowPartLevelDeletedCount++;
		}
		catch( err )
		{
			oRes.error = 504;
			oRes.errorText = err;
		}
	}

	return oRes;
}


/**
 * @typedef {Object} WTKnowledgePartCreateClassifierResult
 * @memberof Websoft.WT.Knowledge
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
*/
/**
 * @function KnowledgePartCreateClassifier
 * @memberof Websoft.WT.Knowledge
 * @description Создает значение карты знаний по классификатору
 * @author EO
 * @param {string} sKnowPartName - название значения карты знаний
 * @param {bigint} iKnowClassifierID - ID классификатора знаний
 * @returns {WTKnowledgePartCreateClassifierResult}
*/
function KnowledgePartCreateClassifier( sKnowPartName, iKnowClassifierID )
{
	var oRes = tools.get_code_library_result_object();

	if( sKnowPartName == undefined || sKnowPartName == null || sKnowPartName == "" )
	{
		oRes.error = 501;
		oRes.errorText = i18n.t( 'neperedanonazv' );
		return oRes;
	}

	if ( iKnowClassifierID == null || iKnowClassifierID == undefined )
	{
		oRes.error = 502;
		oRes.errorText = i18n.t( 'neperedanpered' );
		return oRes;
	}
	iKnowClassifierID = OptInt( iKnowClassifierID );
	if ( iKnowClassifierID == undefined )
	{
		oRes.error = 502;
		oRes.errorText = i18n.t( 'neperedanpered' );
		return oRes;
	}

	try
	{
		docPosCommon = tools.new_doc_by_name("knowledge_part", false);
		docPosCommon.BindToDb();
		docPosCommon.TopElem.name = sKnowPartName;
		docPosCommon.TopElem.knowledge_classifier_id = iKnowClassifierID;
		docPosCommon.Save();
	}
	catch( err )
	{
		oRes.error = 503;
		oRes.errorText = err;
	}

	return oRes;
}


/**
 * @typedef {Object} WTKnowledgePartCreatePartResult
 * @memberof Websoft.WT.Knowledge
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
*/
/**
 * @function KnowledgePartCreatePart
 * @memberof Websoft.WT.Knowledge
 * @description Создает значение карты знаний по значению
 * @author EO
 * @param {string} sKnowPartName - название значения карты знаний
 * @param {bigint} iKnowPartID - ID значения карты знаний
 * @returns {WTKnowledgePartCreatePartResult}
*/
function KnowledgePartCreatePart( sKnowPartName, iKnowPartID )
{
	var oRes = tools.get_code_library_result_object();

	if( sKnowPartName == undefined || sKnowPartName == null || sKnowPartName == "" )
	{
		oRes.error = 501;
		oRes.errorText = i18n.t( 'neperedanonazv' );
		return oRes;
	}

	if ( iKnowPartID == null || iKnowPartID == undefined )
	{
		oRes.error = 502;
		oRes.errorText = i18n.t( 'neperedanpered_1' );
		return oRes;
	}
	iKnowPartID = OptInt( iKnowPartID );
	if ( iKnowPartID == undefined )
	{
		oRes.error = 502;
		oRes.errorText = i18n.t( 'neperedanpered_1' );
		return oRes;
	}

	var docObj = tools.open_doc( iKnowPartID );
	if(docObj == undefined || docObj.TopElem.Name != "knowledge_part")
	{
		oRes.error = 503;
		oRes.errorText = i18n.t( 'peredannyyid' ) + iKnowPartID + i18n.t( 'neyavlyaetsyaidzn' );
		return oRes;
	}

	try
	{
		docPosCommon = tools.new_doc_by_name("knowledge_part", false);
		docPosCommon.BindToDb();
		docPosCommon.TopElem.name = sKnowPartName;
		docPosCommon.TopElem.parent_object_id = iKnowPartID;
		docPosCommon.Save();
	}
	catch( err )
	{
		oRes.error = 504;
		oRes.errorText = err;
	}

	return oRes;
}