function get_object_link( sObjectName, iObjectID )
{
	return tools_web.get_mode_clean_url( null, iObjectID );
}

function get_object_image_url( catElem )
{
	switch( catElem.Name )
	{
		case "collaborator" :
			return tools_web.get_object_source_url( 'person', catElem.id );
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
 * @namespace Websoft.WT.Online
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
/**
 * @typedef {Object} oParticipant
 * @property {bigint} id
 * @property {string} fullname
 * @property {string} participation
*/
/**
 * @typedef {Object} oEvent
 * @property {bigint} id
 * @property {string} name
 * @property {string} type
 * @property {string} type_name
 * @property {string} webinar_url
 * @property {date} start_date
 * @property {date} end_date
 * @property {oParticipant[]} participants
 * @property {oParticipant[]} tutors
*/
/**
 * @typedef {Object} WTGetEventsResult
 * @property {number} error
 * @property {string} errorText
 * @property {boolean} result
 * @property {oEvent[]} array
*/
/**
 * @function GetEvents
 * @memberof Websoft.WT.Online
 * @description Получения списка встреч/вебинаров для текущего пользователя.
 * @param {string} sType - режим представления. По умолчанию: week.
 * @param {datetime} dStartDate - Дата начала запрашиваемого периода.
 * @returns {WTGetEventsResult}
 */
function GetEvents( sType, dStartDate, dFinishDate )
{
	function set_error( error_text )
	{
		oRes.SetProperty( "error_string", RValue( error_text ) );
		oRes.SetProperty( "error", 1 );
	}
	function get_webinar_url( iEventID )
	{
		return "/vclass/v3/index.html#/enter?event_id=" + iEventID;
	}
	var oPeriodData = get_period_data( sType, dStartDate, dFinishDate );

	var oRes = tools.get_code_library_result_object();
	oRes.array = new Array();
	try
	{
		var iUserID = CurRequest.Session.Env.GetOptProperty( "curUserID" );
		var teUser = CurRequest.Session.Env.GetOptProperty( "curUser" );
	}
	catch( ex )
	{
		set_error( "Некорректный curUserID" );
		return oRes
	}
	var xarrOnlineEventTypes = XQuery( "for $elem in event_types where $elem/online = true() return $elem/Fields('id','name')" );
	if( ArrayOptFirstElem( xarrOnlineEventTypes ) == undefined )
	{
		return oRes;
	}
	var conds = new Array();
	conds.push( "( $elem/collaborator_id = " + iUserID + " or $elem/collaborator_id = 0 )" );
	conds.push( "MatchSome( $elem/event_type_id, ( " + ArrayMerge( xarrOnlineEventTypes, "This.id", "," ) + " ) )" );
	conds.push( "( ( $elem/start_date >= " + XQueryLiteral( oPeriodData.start_period_date ) + " and $elem/start_date < " + XQueryLiteral( oPeriodData.finish_period_date ) + " ) or ( $elem/finish_date > " + XQueryLiteral( oPeriodData.start_period_date ) + " and $elem/finish_date < " + XQueryLiteral( oPeriodData.finish_period_date ) + " ) )" );
	conds.push( "MatchSome( $elem/status_id, ( 'plan', 'active', 'cancel', 'close' ) )" );

	var xarrEventCollaborators = XQuery( "for $elem in event_collaborators where " + ArrayMerge( conds, "This", " and " ) + " return $elem/Fields('name','event_id','event_type_id','type_id','start_date','finish_date')" );
	if( ArrayOptFirstElem( xarrEventCollaborators ) != undefined )
	{
		var arrDistinctEventCollaborators = ArraySelectDistinct( xarrEventCollaborators, "This.event_id" );
		var xarrAllEventCollaborators = XQuery( "for $elem in event_collaborators where MatchSome( $elem/event_id, ( " + ArrayMerge( arrDistinctEventCollaborators, "This.event_id", "," ) + " ) ) return $elem/Fields('event_id','collaborator_id','person_fullname','type_id','is_collaborator','is_tutor')" );
		var xarrAllEventResults = XQuery( "for $elem in event_results where MatchSome( $elem/event_id, ( " + ArrayMerge( arrDistinctEventCollaborators, "This.event_id", "," ) + " ) ) return $elem/Fields('event_id','person_id','is_confirm','not_participate')" );
		var xarrEvents = XQuery( "for $elem in events where MatchSome( $elem/id, ( " + ArrayMerge( arrDistinctEventCollaborators, "This.event_id", "," ) + " ) ) return $elem/Fields('id','webinar_system_id')" );

		var arrEventCollaborators, arrEventResults, oEvent, catEventType, oParticipant, catEventResult;
		for( _event in arrDistinctEventCollaborators )
		{
			arrEventCollaborators = ArraySelectByKey( xarrAllEventCollaborators, _event.event_id, "event_id" );
			arrEventResults = ArraySelectByKey( xarrAllEventResults, _event.event_id, "event_id" );
			oEvent = new Object();
			oEvent.id = _event.event_id.Value;
			oEvent.name = _event.name.Value;
			oEvent.start_date = _event.start_date.Value;
			oEvent.end_date = _event.finish_date.Value;
			oEvent.editable = check_admin_access_to_event( _event.event_id, iUserID, arrEventCollaborators );
			catEventType = ArrayOptFindByKey( xarrOnlineEventTypes, _event.event_type_id, "id" );
			oEvent.type = _event.type_id.Value;
			oEvent.type_name = ( catEventType != undefined ? catEventType.name.Value : "[Object deleted]" );
			oEvent.webinar_url = get_webinar_url( _event.event_id );

			oEvent.participants = new Array();
			for( _ec in ArraySelectByKey( arrEventCollaborators, true, "is_collaborator" ) )
			{
				if( _ec.collaborator_id == 0 )
				{
					continue;
				}
				catEventResult = ArrayOptFindByKey( arrEventResults, _ec.collaborator_id, "person_id" );
				oParticipant = new Object();
				oParticipant.id = _ec.collaborator_id.Value;
				oParticipant.fullname = _ec.person_fullname.Value;
				oParticipant.participation = catEventResult != undefined ? ( catEventResult.is_confirm ? "accept" : ( catEventResult.not_participate ? "reject" : "" ) ) : "";
				oEvent.participants.push( oParticipant );
			}
			
			oEvent.tutors = new Array();
			for( _ec in ArraySelectByKey( arrEventCollaborators, true, "is_tutor" ) )
			{
				if( _ec.collaborator_id == 0 )
				{
					continue;
				}
				oParticipant = new Object();
				oParticipant.id = _ec.collaborator_id.Value;
				oParticipant.fullname = _ec.person_fullname.Value;
				oParticipant.participation = "";
				oEvent.tutors.push( oParticipant );
			}
			oRes.array.push( oEvent );
		}
	}
	conds = new Array();
	conds.push( "MatchSome( $elem/participants_id, ( " + iUserID + " ) )" );
	conds.push( "( ( $elem/plan_start_date >= " + XQueryLiteral( oPeriodData.start_period_date ) + " and $elem/plan_start_date < " + XQueryLiteral( oPeriodData.finish_period_date ) + " ) or ( $elem/plan_end_date > " + XQueryLiteral( oPeriodData.start_period_date ) + " and $elem/plan_end_date < " + XQueryLiteral( oPeriodData.finish_period_date ) + " ) )" );
	conds.push( "MatchSome( $elem/state_id, ( 'plan', 'active', 'cancel', 'close' ) )" );
	var xarrCalls = XQuery( "for $elem in calls where " + ArrayMerge( conds, "This", " and " ) + " return $elem" );
	var _call, catCollaborator;
	var xarrCollaborators = new Array();
	if( ArrayOptFirstElem( xarrCalls ) != undefined )
	{
		var arrParticipants = new Array();
		for( _call in xarrCalls )
		{
			arrParticipants = ArrayUnion( arrParticipants, _call.participants_id );
		}
		if( ArrayOptFirstElem( arrParticipants ) != undefined )
		{
			xarrCollaborators = XQuery( "for $elem in collaborators where MatchSome( $elem/id, ( " + ArrayMerge( ArraySelectDistinct( arrParticipants, "This" ), "XQueryLiteral( This )", ",") + " ) ) return $elem/Fields('id','fullname')" )
		}
	}
	var oCall;
	for( _call in xarrCalls )
	{
		oCall = new Object();
		oCall.id = _call.id.Value;
		oCall.name = _call.name.Value;
		oCall.start_date = _call.plan_start_date.Value;
		oCall.end_date = _call.plan_end_date.Value;
		oCall.editable = check_admin_access_to_event( _call.id, iUserID, null, "call", _call );
		oCall.type = "call";
		oCall.type_name = "Звонок";
		oCall.webinar_url = "/vchat/conversation/" + _call.conversation_id + "/call/" + _call.id.Value;

		oCall.participants = new Array();
		for( _p_id in _call.participants_id )
		{

			catCollaborator = ArrayOptFindByKey( xarrCollaborators, _p_id, "id" );
			if( catCollaborator == undefined )
			{
				continue;
			}
			oParticipant = new Object();
			oParticipant.id = RValue( _p_id );
			oParticipant.fullname = catCollaborator.fullname.Value;
			oParticipant.participation = "";
			oCall.participants.push( oParticipant );
		}
		
		oCall.tutors = new Array();
		if( _call.person_id.HasValue )
		{
			oParticipant = new Object();
			oParticipant.id = _call.person_id.Value;
			oParticipant.fullname = _call.person_fullname.Value;
			oParticipant.participation = "";
			oCall.tutors.push( oParticipant );
		}
		oRes.array.push( oCall );
	}
	return oRes;
}
function get_period_data( sType, dStartDate, dFinishDate )
{
	var oRes = { start_period_date: "", finish_period_date: "" };

	try
	{
		switch( sType )
		{
			case "week":
			case "month":
			case "day":
			case "year":
			case "quarter":
			case "period":
				break;
			default:
				throw "error";
		}
	}
	catch( ex )
	{
		sType = "week";
	}
	dStartDate = OptDate( dStartDate, Date() );
	dFinishDate = OptDate( dFinishDate, Date() );
	switch( sType )
	{
		case "week":
			var iWeekDay = WeekDay( dStartDate )
			if( iWeekDay != 1 )
			{
				dStartDate = DateOffset( dStartDate, ( 0 - 86400*( iWeekDay == 0 ? 6 : ( iWeekDay - 1 ) ) ) );
			}
			oRes.start_period_date = DateNewTime( dStartDate, 0, 0, 0 );
			oRes.finish_period_date = DateNewTime( DateOffset( dStartDate, 7*86400 ), 0, 0, 0 );
			break;
		case "month":
			var iMonth = Month( dStartDate );
			var iYear = Year( dStartDate );
			if( Day( dStartDate ) != 1 )
			{
				dStartDate = Date( iYear, iMonth, 1 )
			}
			oRes.start_period_date = DateNewTime( dStartDate, 0, 0, 0 );
			oRes.finish_period_date = DateNewTime( Date( ( iMonth == 12 ? ( iYear + 1 ) : iYear ) , ( iMonth == 12 ? 1 : ( iMonth + 1 ) ), 1 ), 0, 0, 0 );
			break;
		case "year":
			var iYear = Year( dStartDate );
			if( Day( dStartDate ) != 1 )
			{
				dStartDate = Date( iYear, 1, 1 );
			}
			oRes.start_period_date = DateNewTime( dStartDate, 0, 0, 0 );
			oRes.finish_period_date = DateNewTime( Date( iYear + 1, 1, 1 ), 0, 0, 0 );
			break;
		case "quarter":
			var iYear = Year( dStartDate );
			var iMonth = Month( dStartDate );
			switch( iMonth )
			{
				case 1:
				case 2:
				case 3:
					oRes.start_period_date = DateNewTime( Date( iYear, 1, 1 ), 0, 0, 0 );
					oRes.finish_period_date = DateNewTime( Date( iYear, 4, 1 ), 0, 0, 0 );
					break;
				case 4:
				case 5:
				case 6:
					oRes.start_period_date = DateNewTime( Date( iYear, 4, 1 ), 0, 0, 0 );
					oRes.finish_period_date = DateNewTime( Date( iYear, 7, 1 ), 0, 0, 0 );
					break;
				case 7:
				case 8:
				case 9:
					oRes.start_period_date = DateNewTime( Date( iYear, 7, 1 ), 0, 0, 0 );
					oRes.finish_period_date = DateNewTime( Date( iYear, 10, 1 ), 0, 0, 0 );
					break;
				case 10:
				case 11:
				case 12:
					oRes.start_period_date = DateNewTime( Date( iYear, 10, 1 ), 0, 0, 0 );
					oRes.finish_period_date = DateNewTime( Date( iYear + 1, 1, 1 ), 0, 0, 0 );
					break;
			}
			if( Day( dStartDate ) != 1 )
			{
				dStartDate = Date( iYear, 1, 1 );
			}
			oRes.start_period_date = DateNewTime( dStartDate, 0, 0, 0 );
			oRes.finish_period_date = DateNewTime( Date( iYear + 1, 1, 1 ), 0, 0, 0 );
			break;
		case "period":
			oRes.start_period_date = DateNewTime( dStartDate, 0, 0, 0 );
			oRes.finish_period_date = DateNewTime( dFinishDate, 0, 0, 0 );
			break;
		case "day":
			oRes.start_period_date = DateNewTime( dStartDate, 0, 0, 0 );
			oRes.finish_period_date = DateOffset( dStartDate, 86400 );
			break;
	}

	return oRes;
}

/**
 * @typedef {Object} oParticipantData
 * @property {bigint} id
 * @property {string} fullname
 * @property {string} participation
 * @property {boolean} can_use_camera
 * @property {boolean} can_use_microphone
*/
/**
 * @typedef {Object} oEventData
 * @property {bigint} id
 * @property {string} name
 * @property {string} type
 * @property {string} type_name
 * @property {string} status_id
 * @property {string} status_name
 * @property {string} description
 * @property {date} start_date
 * @property {date} end_date
 * @property {string} webinar_url
 * @property {oParticipantData[]} participants
 * @property {oParticipantData[]} tutors
*/
/**
 * @typedef {Object} WTGetEventResult
 * @property {number} error
 * @property {string} errorText
 * @property {boolean} result
 * @property {oEventData} event_data
*/
/**
 * @function GetEvent
 * @memberof Websoft.WT.Online
 * @description Получения данных мероприятия.
 * @param {bigint} iEventID - ID мероприятия
 * @returns {WTGetEventResult}
 */
function GetEvent( iEventID )
{
	function set_error( error_text )
	{
		oRes.SetProperty( "error_string", RValue( error_text ) );
		oRes.SetProperty( "error", 1 );
	}

	var oRes = tools.get_code_library_result_object();
	try
	{
		var iUserID = CurRequest.Session.Env.GetOptProperty( "curUserID" );
		var teUser = CurRequest.Session.Env.GetOptProperty( "curUser" );
	}
	catch( ex )
	{
		set_error( "Некорректный curUserID" );
		return oRes;
	}
	try
	{
		iEventID = Int( iEventID );
	}
	catch( ex )
	{
		set_error( "Некорректный iEventID" );
		return oRes;
	}
	var docEvent = tools.open_doc( iEventID );
	
	if( docEvent == undefined )
	{
		set_error( "Некорректный iEventID" );
		return oRes;
	}
	var sType = docEvent.TopElem.Name;
	if( !check_access_to_event( iEventID, iUserID, null, sType, docEvent.TopElem ) )
	{
		set_error( "У вас нет прав на просмотр этого мероприятия." );
		return oRes;
	}
	
	var oEventData = new Object();
	oEventData.id = iEventID;
	oEventData.name = docEvent.TopElem.name.Value;
	
	oEventData.start_date = "";
	oEventData.end_date = "";
	oEventData.description = "";
	oEventData.type = "";
	oEventData.type_name = "";
	oEventData.status_id = "";
	oEventData.status_name = "";
	oEventData.webinar_url = "";
	oEventData.participants = new Array();
	oEventData.tutors = new Array();
	switch( sType )
	{
		case "event":
			oEventData.start_date = docEvent.TopElem.start_date.Value;
			oEventData.end_date = docEvent.TopElem.finish_date.Value;
			oEventData.description = docEvent.TopElem.comment.Value;
			var feEventType = docEvent.TopElem.event_type_id.OptForeignElem;
			oEventData.type = docEvent.TopElem.type_id.Value;
			oEventData.type_name = ( feEventType != undefined ? feEventType.name.Value : "[Object deleted]" );
			oEventData.status_id = docEvent.TopElem.status_id.Value;
			oEventData.status_name = docEvent.TopElem.status_id.ForeignElem.name.Value;
			oEventData.webinar_url = docEvent.TopElem.get_webinar_url( iUserID, "" );
			
			var xarrEventResults = XQuery( "for $elem in event_results where $elem/event_id = " + iEventID + " return $elem" )
			for( _er in xarrEventResults )
			{
				catCollaborator = docEvent.TopElem.collaborators.GetOptChildByKey( _er.person_id );
				if( catCollaborator == undefined )
				{
					continue;
				}
				oParticipant = new Object();
				oParticipant.id = _er.person_id.Value;
				oParticipant.fullname = _er.person_fullname.Value;
				oParticipant.participation = _er.is_confirm ? "accept" : ( _er.not_participate ? "reject" : "" );
				oParticipant.can_use_camera = catCollaborator.can_use_camera.Value;
				oParticipant.can_use_microphone = catCollaborator.can_use_microphone.Value;
				oEventData.participants.push( oParticipant );
			}

			for( _tutor in docEvent.TopElem.tutors )
			{
				oTutor = new Object();
				oTutor.id = _tutor.collaborator_id.Value;
				oTutor.fullname = _tutor.person_fullname.Value;
				oTutor.participation = "";
				oTutor.can_use_camera = true;
				oTutor.can_use_microphone = true;
				oEventData.tutors.push( oTutor );
			}
			break;
		case "call":
			oEventData.start_date = docEvent.TopElem.plan_start_date.Value;
			oEventData.end_date = docEvent.TopElem.plan_end_date.Value;
			oEventData.type = "call";
			oEventData.type_name = "Звонок";
			oEventData.status_id = docEvent.TopElem.state_id.Value;
			oEventData.status_name = docEvent.TopElem.state_id.ForeignElem.name.Value;
			oEventData.webinar_url = "/vchat/conversation/" + docEvent.TopElem.conversation_id + "/call/" + iEventID;
			
			oEventData.description = docEvent.TopElem.comment.Value;
			var xarrCollaborators = new Array();
			if( ArrayOptFirstElem( docEvent.TopElem.participants ) != undefined )
			{
				xarrCollaborators = XQuery( "for $elem in collaborators where MatchSome( $elem/id, ( " + ArrayMerge( docEvent.TopElem.participants, "XQueryLiteral( This.person_id )", ",") + " ) ) return $elem/Fields('id','fullname')" )
			}
			for( _p in docEvent.TopElem.participants )
			{

				catCollaborator = ArrayOptFindByKey( xarrCollaborators, _p.person_id, "id" );
				if( catCollaborator == undefined )
				{
					continue;
				}
				oParticipant = new Object();
				oParticipant.id = RValue( _p.person_id );
				oParticipant.fullname = catCollaborator.fullname.Value;
				oParticipant.participation = "";
				oEventData.participants.push( oParticipant );
			}
			
			if( docEvent.TopElem.person_id.HasValue )
			{
				oParticipant = new Object();
				oParticipant.id = docEvent.TopElem.person_id.Value;
				oParticipant.fullname = docEvent.TopElem.person_fullname.Value;
				oParticipant.participation = "";
				oEventData.tutors.push( oParticipant );
			}
			break;
	}

	oEventData.editable = check_admin_access_to_event( iEventID, iUserID, null, sType, docEvent.TopElem );

	oRes.SetProperty( "event_data", oEventData );
	return oRes;
}
function check_access_to_event( iEventID, iUserID, xarrEventCollaborators, sType, teObject )
{
	try
	{
		if( sType == undefined || sType == null || sType == "" )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		sType = "event";
	}
	try
	{
		iUserID = Int( iUserID );
	}
	catch( ex )
	{
		return false;
	}
	try
	{
		iEventID = Int( iEventID );
	}
	catch( ex )
	{
		return false;
	}
	switch( sType )
	{
		case "event":
			try
			{
				if( !IsArray( xarrEventCollaborators ) )
				{
					throw "error";
				}
				if( ArrayOptFind( xarrEventCollaborators, "( This.collaborator_id == iUserID || This.collaborator_id == 0 ) && This.event_id == iEventID" ) != undefined )
				{
					return true;
				}
			}
			catch( err )
			{
				if( ArrayOptFirstElem( XQuery( "for $elem in event_collaborators where ( $elem/collaborator_id = " + iUserID + " or $elem/collaborator_id = 0 ) and $elem/event_id = " + iEventID + " return $elem/Fields('id')" ) ) != undefined )
				{
					return true;
				}
			}
			if( ArrayOptFirstElem( XQuery( "for $elem in event_lectors where $elem/person_id = " + iUserID + " and $elem/event_id = " + iEventID + " return $elem/Fields('id')" ) ) != undefined )
			{
				return true;
			}
			break;
			
		case "call":
			try
			{
				teObject.Name;
			}
			catch( ex )
			{
				teObject = tool.open_doc( iEventID );
				if( teObject == undefined )
				{
					return false;
				}
				teObject = teObject.TopElem;
			}

			return teObject.person_id == iUserID || teObject.participants.GetOptChildByKey( iUserID ) != undefined;
			break;
			
	}
	return false;
}
function check_admin_access_to_event( iEventID, iUserID, xarrEventCollaborators, sType, feElem )
{
	try
	{
		if( sType == undefined || sType == null || sType == "" )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		sType = "event";
	}
	try
	{
		iUserID = Int( iUserID );
	}
	catch( ex )
	{
		return false;
	}
	try
	{
		iEventID = Int( iEventID );
	}
	catch( ex )
	{
		return false;
	}
	switch( sType )
	{
		case "event":
			try
			{
				if( !IsArray( xarrEventCollaborators ) )
				{
					throw "error";
				}
				if( ArrayOptFind( xarrEventCollaborators, "( This.collaborator_id == iUserID ) && This.event_id == iEventID && ( This.is_tutor )" ) != undefined )
				{
					return true;
				}
			}
			catch( err )
			{
				if( ArrayOptFirstElem( XQuery( "for $elem in event_collaborators where ( $elem/collaborator_id = " + iUserID + " ) and $elem/event_id = " + iEventID + " and ( $elem/is_tutor = true() ) return $elem/Fields('id')" ) ) != undefined )
				{
					return true;
				}
			}
			break;
		
		case "call":
			try
			{
				feElem.Name;
			}
			catch( ex )
			{
				feElem = ArrayOptFirstElem( XQuery( "for $elem in calls where $elem/id = " + iEventID + " return $elem" ) );
			}
			if( feElem == undefined )
			{
				return false;
			}
			return feElem.person_id == iUserID;
			break;
	}
	
	/*if( ArrayOptFirstElem( XQuery( "for $elem in event_lectors where $elem/person_id = " + iUserID + " and $elem/event_id = " + iEventID + " return $elem/Fields('id')" ) ) != undefined )
	{
		return true;
	}*/
	return false;
}

/**
 * @typedef {Object} WTModifyEventResult
 * @property {number} error
 * @property {string} errorText
 * @property {boolean} result
 * @property {string} status
*/
/**
 * @function ModifyEvent
 * @memberof Websoft.WT.Online
 * @description Cоздает/изменяет мероприятие.
 * @param {oEventData} oEventData - данные по мероприятию
 * @returns {WTModifyEventResult}
 */
function ModifyEvent( oEventData )
{
	function set_error( error_text )
	{
		oRes.SetProperty( "error_string", RValue( error_text ) );
		oRes.SetProperty( "error", 1 );
	}

	var oRes = tools.get_code_library_result_object();
	oRes.event_id = "";
	try
	{
		var iUserID = CurRequest.Session.Env.GetOptProperty( "curUserID" );
		var teUser = CurRequest.Session.Env.GetOptProperty( "curUser" );
	}
	catch( ex )
	{
		set_error( "Некорректный curUserID" );
		return oRes
	}

	try
	{
		if( DataType( oEventData ) != "object" || ObjectType( oEventData ) != "JsObject" )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		set_error( "Некорректный oEventData" );
		return oRes
	}
	var iEventID = OptInt( oEventData.GetOptProperty( "id" ) );
	var sTypeCode = oEventData.GetOptProperty( "type" );
	var arrParticipants = oEventData.GetOptProperty( "participants", ([]) );
	if( iEventID != undefined )
	{
		var docEvent = tools.open_doc( iEventID );
		if( !check_admin_access_to_event( iEventID, iUserID, null, docEvent.TopElem.Name ) )
		{
			set_error( "У вас нет прав на редактирование этого мероприятия." );
			return oRes;
		}
	}
	else
	{
		switch( sTypeCode )
		{
			case "call":
				var docEvent = OpenNewDoc( "x-local://wtv/wtv_call.xmd" );
				docEvent.BindToDb( DefaultDb );
				docEvent.TopElem.person_id = iUserID;
				tools.common_filling( "collaborator", docEvent.TopElem, iUserID, teUser );
				docEvent.TopElem.state_id = "plan";
				if( OptInt( oEventData.GetOptProperty( "conversation_id" ) ) != undefined )
				{
					docEvent.TopElem.conversation_id = OptInt( oEventData.GetOptProperty( "conversation_id" ) );
				}
				else
				{
					var oResConversation = tools.call_code_library_method( 'libChat', 'change_participants_conversation', [ null, null, "change", null, ArrayExtract( arrParticipants, "This.id" ), null, null, null, "chat", oEventData.GetOptProperty( "name", "" ) ] );
					if( oResConversation.error == 0 )
					{
						docEvent.TopElem.conversation_id = oResConversation.doc_conversation.DocID;
					}
				}
				break;
			default:
				var docEvent = OpenNewDoc( "x-local://wtv/wtv_event.xmd" );
				docEvent.BindToDb( DefaultDb );
				docEvent.TopElem.event_settings.AssignElem( global_settings.settings.event_settings );
		}
	}
	docEvent.TopElem.name = oEventData.GetOptProperty( "name", "" );
	var bUpdateConfirm = false;
	var dStartDate = OptDate( oEventData.GetOptProperty( "start_date", "" ), null );
	var dFinishDate = OptDate( oEventData.GetOptProperty( "end_date", "" ), null );
	
	switch( sTypeCode )
	{
		case "call":
			docEvent.TopElem.plan_start_date = dStartDate;
			docEvent.TopElem.plan_end_date = dFinishDate;
			for( _participant in arrParticipants )
			{
				_collaborator_id = OptInt( _participant.GetOptProperty( "id" ) );
				if( _collaborator_id == undefined )
				{
					continue;
				}
				if( docEvent.TopElem.participants.GetOptChildByKey( _collaborator_id ) != undefined )
				{
					continue;
				}
				_participant = docEvent.TopElem.participants.ObtainChildByKey( _collaborator_id );
				tools.common_filling( "collaborator", _participant, _collaborator_id );
			}
			if( docEvent.TopElem.participants.GetOptChildByKey( _collaborator_id ) == undefined )
			{
				_participant = docEvent.TopElem.participants.ObtainChildByKey( iUserID );
				tools.common_filling( "collaborator", _participant, iUserID, teUser );
			}
			docEvent.TopElem.comment = oEventData.GetOptProperty( "description", "" );
			docEvent.Save();
			
			/*  уведомление */

			teOrganizerObject = OpenDoc( UrlFromDocID( OptInt( iUserID ) ) ).TopElem;

			sSubject = "";
			if( iEventID == undefined )
			{
				sSubject = teOrganizerObject.fullname + " приглашает вас на событие \""+docEvent.TopElem.name+"\" - " + docEvent.TopElem.plan_start_date;
			} else {
				sSubject = "Изменение в событии \"" +docEvent.TopElem.name+ "\"";
			}
			
			/*
			tools.create_notification(
			   'modify_event', // [oTypeParam]
			   iUserID, // <%=objDocID%> 
			   oEventData.GetOptProperty( "description", "" ), // <%=Text%>
			   null, /* <%=objDocSecID%>
			   docEvent.TopElem, /* <%=objDoc.Xml %> TopElem iObjectIDParam
			   sParticipantsText, /* <%=objDocSec.Xml %> TopElem iSecondObjectIDParam 
			);
			*/

			docEvent.TopElem.comment = oEventData.GetOptProperty( "description", "" )
			
			tools.create_notification('modify_event', iUserID, sSubject, null, docEvent.TopElem);
			
			ms_tools.raise_system_event_env( ( iEventID != undefined ? "change_plan_call" : "create_plan_call" ), {
				'iCallID': docEvent.DocID,
				'docCall': docEvent,
				'curUserID': iUserID,
				'curUser': teUser
			});
			oRes.event_id = docEvent.DocID;
			break;
		default:
			
			if( dStartDate != docEvent.TopElem.start_date || dFinishDate != docEvent.TopElem.finish_date )
			{
				bUpdateConfirm = true;
			}
			docEvent.TopElem.start_date = dStartDate;
			docEvent.TopElem.finish_date = dFinishDate;
			docEvent.TopElem.comment = oEventData.GetOptProperty( "description", "" );
			if( sTypeCode != undefined )
			{
				var catEventType = undefined;
				if( sTypeCode != "" )
				{
					catEventType = ArrayOptFirstElem( XQuery( "for $elem in event_types where $elem/code = " + XQueryLiteral( String( sTypeCode ) ) + " return $elem" ) );
				}
				if( catEventType == undefined )
				{
					docEvent.TopElem.event_type_id.Clear();
					docEvent.TopElem.type_id.Clear();
				}
				else
				{
					docEvent.TopElem.event_type_id = catEventType.id;
					docEvent.TopElem.type_id = catEventType.code;
				}
			}
			var arrTutors = oEventData.GetOptProperty( "tutors", ([]) );
			for( _tutor in arrTutors )
			{
				_collaborator_id = OptInt( _tutor.GetOptProperty( "id" ) );
				if( _collaborator_id == undefined )
				{
					continue;
				}
				if( docEvent.TopElem.tutors.GetOptChildByKey( _collaborator_id ) == undefined )
				{
					fldChild = docEvent.TopElem.tutors.ObtainChildByKey( _collaborator_id );
					tools.common_filling( "collaborator", fldChild, _collaborator_id );
				}
			}
			var arrDeletedTutors = new Array();
			for( _tutor in docEvent.TopElem.tutors )
			{
				if( ArrayOptFind( arrTutors, "OptInt( This.GetOptProperty( 'id' ) ) == _tutor.collaborator_id" ) != undefined )
				{
					continue;
				}
				else if( _tutor.collaborator_id != iUserID )
				{
					arrDeletedTutors.push( _tutor.collaborator_id.Value );
				}
			}
			for( _dt in arrDeletedTutors )
			{
				docEvent.TopElem.tutors.DeleteChildByKey( _dt );
			}

			if( docEvent.TopElem.tutors.GetOptChildByKey( iUserID ) == undefined )
			{
				fldChild = docEvent.TopElem.tutors.ObtainChildByKey( iUserID );
				tools.common_filling( "collaborator", fldChild, iUserID, teUser );
			}
			var oResSave = tools.call_code_library_method( "libEducation", "SaveEvent", [ docEvent ] );
			if( oResSave.error != 0 )
			{
				set_error( oResSave.message );
				return oRes;
			}
			
			oRes.event_id = docEvent.DocID;
			
			for( _participant in arrParticipants )
			{
				_collaborator_id = OptInt( _participant.GetOptProperty( "id" ) );
				if( _collaborator_id == undefined )
				{
					continue;
				}
				if( docEvent.TopElem.collaborators.GetOptChildByKey( _collaborator_id ) != undefined )
				{
					continue;
				}
				oResAddPerson = tools.call_code_library_method( 'libEducation', 'AddPersonToEventXmd', [ {
					'iEventID': docEvent.DocID,
					'docEvent': docEvent,
					'iPersonID': _collaborator_id,
					'tePerson': null,
					'bDoObtain': false,
					'bDoFilling': true,
					'bDoSave': false,
					'bCreateEventResult': true,
					'bSendNotification': true,
					'bEventResultAssist': false
				} ] );
				if( oResAddPerson.error != 0 )
				{
					set_error( oResAddPerson.message );
					//return oRes;
				}
			}
			var arrDeletedCollaborators = new Array();
			for( _collaborator in docEvent.TopElem.collaborators )
			{
				if( ArrayOptFind( arrParticipants, "OptInt( This.GetOptProperty( 'id' ) ) == _collaborator.collaborator_id" ) != undefined )
				{
					continue;
				}
				else
				{
					arrDeletedCollaborators.push( _collaborator.collaborator_id.Value );
				}
			}
			for( _collaborator_id in arrDeletedCollaborators )
			{
				oResDeletePerson = tools.call_code_library_method( 'libEducation', 'DeletePersonFromEventXmd', [ {
					'iPersonID': _collaborator_id,
					'iEventID': docEvent.DocID,
					'docEvent': docEvent,
					'bDoSave': false,
					'bSendNotification': true } ] );
				if( oResDeletePerson.error != 0 )
				{
					set_error( oResDeletePerson.message );
					//return oRes;
				}
			}
			oResSave = tools.call_code_library_method( "libEducation", "SaveEvent", [ docEvent ] );
			if( oResSave.error != 0 )
			{
				set_error( oResSave.message );
				return oRes;
			}
			if( iEventID == undefined )
			{
				oResult = tools.call_code_library_method( 'libEducation', 'SetStatusEvent', [ { iEventIDParam: docEvent.DocID, sNewStatusParam: "plan", docEvent: null, bSendNotificationsParam: true } ] );
				if( oResult.error != 0 )
				{
					set_error( oResult.errorText );
				}
			}
			else if( bUpdateConfirm  )
			{
				var arrSendedPersonIds = new Array();
				arrSendedPersonIds.push( iUserID );
				for( _er in XQuery( "for $elem in event_results where $elem/event_id = " + docEvent.DocID + " return $elem" ) )
				{
					if( ArrayOptFind( arrSendedPersonIds, "This == _er.person_id" ) == undefined )
					{
						docEventResult = undefined;
						if( _er.is_confirm )
						{
							docEventResult = tools.open_doc( _er.id );
							if( docEventResult == undefined )
							{
								continue;
							}
							docEventResult.TopElem.is_confirm = false;
							docEventResult.Save();
						}
					
						tools.create_notification( "online_meeting_update_dates", _er.person_id, "", iEventID, null, docEvent.TopElem );
						arrSendedPersonIds.push( _er.person_id.Value );
					}
				}
				for( _tutor in docEvent.TopElem.tutors )
				{
					if( ArrayOptFind( arrSendedPersonIds, "This == _tutor.PrimaryKey" ) == undefined )
					{
						tools.create_notification( "online_meeting_update_dates", _tutor.PrimaryKey, "", iEventID, null, docEvent.TopElem );
						arrSendedPersonIds.push( _tutor.PrimaryKey );
					}
				}
			}
			break;
	}
	
	return oRes;
}

/**
 * @typedef {Object} WTChangeStatusEventResult
 * @property {number} error
 * @property {string} errorText
 * @property {boolean} result
 * @property {string} status
*/
/**
 * @function ChangeStatusEvent
 * @memberof Websoft.WT.Online
 * @description Изменить статус мероприятия.
 * @param {bigint} iEventID - ID мероприятия
 * @param {string} sStatus - новый статус мероприятия
 * @returns {WTChangeStatusEventResult}
 */
function ChangeStatusEvent( iEventID, sStatus )
{
	function set_error( error_text )
	{
		oRes.SetProperty( "error_string", RValue( error_text ) );
		oRes.SetProperty( "error", 1 );
	}

	var oRes = tools.get_code_library_result_object();
	try
	{
		var iUserID = CurRequest.Session.Env.GetOptProperty( "curUserID" );
		var teUser = CurRequest.Session.Env.GetOptProperty( "curUser" );
	}
	catch( ex )
	{
		set_error( "Некорректный curUserID" );
		return oRes
	}
	try
	{
		iEventID = Int( iEventID );
	}
	catch( ex )
	{
		set_error( "Некорректный iEventID" );
		return oRes;
	}
	var docEvent = tools.open_doc( iEventID );
	if( docEvent == undefined )
	{
		set_error( "Некорректный iEventID" );
		return oRes;
	}
	if( !check_admin_access_to_event( iEventID, iUserID, null, docEvent.TopElem.Name, docEvent.TopElem ) )
	{
		set_error( "У вас нет прав на редактирование этого мероприятия." );
		return oRes;
	}
	try
	{
		switch( docEvent.TopElem.Name )
		{
			case "call":
				oResult = tools.call_code_library_method( 'libChat', 'SetStatusCall', [ iEventID, docEvent, sStatus ] );
				if( oResult.error != 0 )
				{
					set_error( oResult.errorText );
				}
				break;
			case "event":
				oResult = tools.call_code_library_method( 'libEducation', 'SetStatusEvent', [ { iEventIDParam: iEventID, sNewStatusParam: sStatus, docEventParam: null, bSendNotificationsParam: true } ] );
				if( oResult.error != 0 )
				{
					set_error( oResult.errorText );
				}
				break;
		}
	}
	catch( ex )
	{
		set_error( ex );
		return oRes;
	}
	return oRes
}

/**
 * @typedef {Object} WTDeleteEventResult
 * @property {number} error
 * @property {string} errorText
 * @property {boolean} result
 * @property {string} status
*/
/**
 * @function DeleteEvent
 * @memberof Websoft.WT.Online
 * @description Удаление мероприятия.
 * @param {bigint} iEventID - ID мероприятия
 * @returns {WTDeleteEventResult}
 */
function DeleteEvent( iEventID )
{
	function set_error( error_text )
	{
		oRes.SetProperty( "error_string", RValue( error_text ) );
		oRes.SetProperty( "error", 1 );
	}

	var oRes = tools.get_code_library_result_object();
	try
	{
		var iUserID = CurRequest.Session.Env.GetOptProperty( "curUserID" );
		var teUser = CurRequest.Session.Env.GetOptProperty( "curUser" );
	}
	catch( ex )
	{
		set_error( "Некорректный curUserID" );
		return oRes
	}
	try
	{
		iEventID = Int( iEventID );
	}
	catch( ex )
	{
		set_error( "Некорректный iEventID" );
		return oRes;
	}
	var docEvent = tools.open_doc( iEventID );
	if( docEvent == undefined )
	{
		set_error( "Некорректный iEventID" );
		return oRes;
	}
	if( !check_admin_access_to_event( iEventID, iUserID, null, docEvent.TopElem.Name, docEvent.TopElem ) )
	{
		set_error( "У вас нет прав на удаление этого мероприятия." );
		return oRes;
	}
	try
	{
		switch( docEvent.TopElem.Name )
		{
			case "call":
				DeleteDoc( UrlFromDocID( iEventID ) );
				break;
			case "event":
				DeleteDoc( UrlFromDocID( iEventID ) );
				for( _er in XQuery( "for $elem in event_results where $elem/event_id = " + iEventID + " return $elem/Fields('id')" ) )
				{
					DeleteDoc( UrlFromDocID( _er.id ) )
				}
				break;
		}
	}
	catch( ex )
	{
		set_error( ex );
		return oRes;
	}
	return oRes
}

/**
 * @typedef {Object} WTConfirmEventParticipationResult
 * @property {number} error
 * @property {string} errorText
 * @property {boolean} result
 * @property {string} status
*/
/**
 * @function ConfirmEventParticipation
 * @memberof Websoft.WT.Online
 * @description Подтверждение/отказ от участия.
 * @param {bigint} iEventID - ID мероприятия
 * @param {string} sParticipation  - тип
 * @returns {WTConfirmEventParticipationResult}
 */
function ConfirmEventParticipation( iEventID, sParticipation )
{
	function set_error( error_text )
	{
		oRes.SetProperty( "error_string", RValue( error_text ) );
		oRes.SetProperty( "error", 1 );
	}

	var oRes = tools.get_code_library_result_object();
	try
	{
		var iUserID = CurRequest.Session.Env.GetOptProperty( "curUserID" );
		var teUser = CurRequest.Session.Env.GetOptProperty( "curUser" );
	}
	catch( ex )
	{
		set_error( "Некорректный curUserID" );
		return oRes;
	}

	try
	{
		iEventID = Int( iEventID );
	}
	catch( ex )
	{
		set_error( "Некорректный iEventID" );
		return oRes;
	}
	var docEvent = tools.open_doc( iEventID );
	if( docEvent == undefined )
	{
		set_error( "Некорректный iEventID" );
		return oRes;
	}
	
	switch( docEvent.TopElem.Name )
	{
		case "event":
			switch( sParticipation )
			{
				case "accept":
					var catEventResult = ArrayOptFirstElem( XQuery( "for $elem in event_results where  $elem/event_id=" + iEventID + " and $elem/person_id=" + iUserID + "  return $elem" ) );
					if(catEventResult != undefined)
					{
						docEventResult = OpenDoc( UrlFromDocID( catEventResult.PrimaryKey ) );
						docEventResult.TopElem.is_confirm = true;
						docEventResult.Save();

						ms_tools.raise_system_event_env( 'portal_event_confirm_participation', {
							'curSystemEventObjectID':catEventResult.PrimaryKey,
							'iEventId': iEventID,
							'curUser': teUser,
							'curUserID': iUserID,
							'docEventResult': docEventResult,
							'iEventResultId': catEventResult.PrimaryKey
						} );
					}
					else
					{
						set_error( "Вы не являетесь участником мероприятия." );
						return oRes;
					}
					break;
				case "reject":
					catEventResult = ArrayOptFirstElem( XQuery( "for $elem in event_results where  $elem/event_id=" + iEventID + " and $elem/person_id=" + iUserID + "  return $elem" ) )
					if( catEventResult != undefined )
					{
						docEventResult = OpenDoc( UrlFromDocID( catEventResult.PrimaryKey ) );
						docEventResult.TopElem.not_participate = true;
						docEventResult.TopElem.is_assist = false;
						docEventResult.TopElem.is_confirm = false;
						docEventResult.Save();
						ms_tools.raise_system_event_env( 'portal_event_refused_participation', {
							'curSystemEventObjectID':iEventID,
							'iEventId': iEventID,
							'curUser': teUser,
							'curUserID': iUserID,
							'docEventResult': docEventResult,
							'iEventResultId': catEventResult.PrimaryKey
						} );
					}
					else
					{
						set_error( "Вы не являетесь участником мероприятия." );
						return oRes;
					}
					break;
				default:
					set_error( "Некорректный sParticipation" );
					return oRes;
			}
			break;
	}

	return oRes;
}

/**
 * @typedef {Object} oAvailabilityParticipant
 * @property {bigint} id
 * @property {string} availability
*/
/**
 * @typedef {Object} WTGetParticipantsAvailabilityResult
 * @property {number} error
 * @property {string} errorText
 * @property {boolean} result
 * @property {oAvailabilityParticipant[]} availability_participants
*/
/**
 * @function GetParticipantsAvailability
 * @memberof Websoft.WT.Online
 * @description Список занятости сотрудников.
 * @param {bigint} iEventID - ID мероприятия
 * @param {datetime} dStartDate  - Дата начала периода
 * @param {datetime} dFinishDate  - Дата завершения периода
 * @param {bigint[]} aParticipants  - массив ID участников
 * @returns {WTGetParticipantsAvailabilityResult}
 */
function GetParticipantsAvailability( iEventID, dStartDate, dFinishDate, aParticipants )
{
	function set_error( error_text )
	{
		oRes.SetProperty( "error_string", RValue( error_text ) );
		oRes.SetProperty( "error", 1 );
	}

	var oRes = tools.get_code_library_result_object();
	oRes.availability_participants = new Array();
	try
	{
		var iUserID = CurRequest.Session.Env.GetOptProperty( "curUserID" );
		var teUser = CurRequest.Session.Env.GetOptProperty( "curUser" );
	}
	catch( ex )
	{
		set_error( "Некорректный curUserID" );
		return oRes
	}
	try
	{
		iEventID = Int( iEventID );
	}
	catch( ex )
	{
		iEventID = null;
	}
	dStartDate = OptDate( dStartDate );
	dFinishDate = OptDate( dFinishDate );
	try
	{
		if( !IsArray( aParticipants ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		set_error( "Некорректный aParticipants" );
		return oRes;
	}
	var conds = new Array();
	conds.push( "MatchSome( $elem/collaborator_id, ( " + ArrayMerge( aParticipants, "This", "," ) + " ) )" );
	if( iEventID != null )
	{
		conds.push( "$elem/event_id != " + iEventID );
	}
	conds.push( "( ( ( $elem/start_date >= " + XQueryLiteral( dStartDate ) + " and $elem/start_date < " + XQueryLiteral( dFinishDate ) + " ) or ( $elem/finish_date > " + XQueryLiteral( dStartDate ) + " and $elem/finish_date < " + XQueryLiteral( dFinishDate ) + " ) ) or ( $elem/finish_date > " + XQueryLiteral( dFinishDate ) + " and $elem/start_date < " + XQueryLiteral( dStartDate ) + " ) )" );
	var xarrEventCollaborators = ArrayExtract( XQuery( "for $elem in event_collaborators where " + ArrayMerge( conds, "This", " and " ) + " return $elem/Fields('collaborator_id')" ), "This.collaborator_id" );
	conds = new Array();
	conds.push( "MatchSome( $elem/participants_id, ( " + ArrayMerge( aParticipants, "This", "," ) + " ) )" );
	if( iEventID != null )
	{
		conds.push( "$elem/id != " + iEventID );
	}
	conds.push( "( ( ( $elem/plan_start_date >= " + XQueryLiteral( dStartDate ) + " and $elem/plan_start_date < " + XQueryLiteral( dFinishDate ) + " ) or ( $elem/plan_end_date > " + XQueryLiteral( dStartDate ) + " and $elem/plan_end_date < " + XQueryLiteral( dFinishDate ) + " ) ) or ( $elem/plan_end_date > " + XQueryLiteral( dFinishDate ) + " and $elem/plan_start_date < " + XQueryLiteral( dStartDate ) + " ) )" );
	
	var xarrCalls = XQuery( "for $elem in calls where " + ArrayMerge( conds, "This", " and " ) + " return $elem/Fields('participants_id')" );
	var _call;
	for( _call in xarrCalls )
	{
		xarrEventCollaborators = ArrayUnion( xarrEventCollaborators, _call.participants_id );
	}
	xarrEventCollaborators = ArraySelectDistinct( xarrEventCollaborators, "This" );
	//xarrEventCollaborators = ArrayUnion( xarrEventCollaborators, ArrayExtract( XQuery( "for $elem in calls where " + ArrayMerge( conds, "This", " and " ) + " return $elem/Fields('collaborator_id')" ), "This.collaborator_id" ) );
	var oParticipant, _participant_id;
	for( _participant_id in aParticipants )
	{
		oParticipant = new Object();
		oParticipant.id = _participant_id;
		oParticipant.availability = ( ArrayOptFind( xarrEventCollaborators, "This == " + _participant_id ) != undefined ? "busy" : "available" );
		oRes.availability_participants.push( oParticipant );
	}
	return oRes;
}

/**
 * @typedef {Object} oUser
 * @property {bigint} id
 * @property {string} fullname
*/
/**
 * @typedef {Object} WTGetUsersResult
 * @property {number} error
 * @property {string} errorText
 * @property {boolean} result
 * @property {oUser[]} users
*/
/**
 * @function GetUsers
 * @memberof Websoft.WT.Online
 * @description Список занятости сотрудников.
 * @param {string} sSearch - Строка поиска
 * @returns {WTGetUsersResult}
 */
function GetUsers( sSearch )
{
	function set_error( error_text )
	{
		oRes.SetProperty( "error_string", RValue( error_text ) );
		oRes.SetProperty( "error", 1 );
	}

	var oRes = tools.get_code_library_result_object();
	oRes.users = new Array();
	try
	{
		var iUserID = CurRequest.Session.Env.GetOptProperty( "curUserID" );
		var teUser = CurRequest.Session.Env.GetOptProperty( "curUser" );
	}
	catch( ex )
	{
		set_error( "Некорректный curUserID" );
		return oRes
	}
	try
	{
		if( sSearch == undefined || sSearch == null )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		sSearch = "";
	}
	bAccess = false;
	catCatalogRemoteCollection = ArrayOptFirstElem( XQuery( "for $elem in remote_collections where $elem/code = 'uni_catalog_list_collaborator' return $elem/Fields('id')" ) );
	if ( catCatalogRemoteCollection != undefined )
	{
		bAccess = tools_web.check_access( OpenDoc( UrlFromDocID ( catCatalogRemoteCollection.id ), "form=x-local://wtv/wtv_form_doc_access.xmd;ignore-top-elem-name=1" ).TopElem, iUserID, teUser, CurRequest.Session );
	}
	if( !bAccess )
	{
		set_error( "У вас нет прав на получение списка." );
		return oRes;
	}

	var libParam = tools.get_params_code_library( "libOnline" );
	var xarrCollaborators = tools.call_code_library_method( "libMain", "get_user_collaborators", [ iUserID, libParam.GetOptProperty( "select_collaborator_type" ), false, sSearch, null, null, ( { "sort": { "FIELD": "fullname", "DIRECTION": "ASC" } } ) ] );
	var _user, oUser;
	for( _user in xarrCollaborators )
	{
		oUser = new Object();
		oUser.id = _user.id.Value;
		oUser.fullname = RValue( _user.fullname );
		oRes.users.push( oUser );
	}

	return oRes;
}

/**
 * @typedef {Object} ReturnRunOnlineAction
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {string} socket_type – Сокет.
 * @property {Object} actions – Контекст мероприятия.
*/
/**
 * @function RunOnlineAction
 * @memberof Websoft.WT.Online
 * @author PL
 * @description Просмотр/редактирование модуля курса CourseLab по ID
 * @param {Object} [aActions] - массив действий
 * @returns {ReturnRunOnlineAction}
*/
function RunOnlineAction( aActions )
{
	function set_error( error_text )
	{
		oAnswer.SetProperty( "error_string", RValue( error_text ) );
		oAnswer.SetProperty( "error", 1 );
		oRes.actions.push( oAnswer );
	}
	function set_res_error( error_text )
	{
		oRes.SetProperty( "error_string", RValue( error_text ) );
		oRes.SetProperty( "error", 1 );
	}

	var oRes = tools.get_code_library_result_object();
	oRes.actions = new Array();
	oRes.socket_type = "online";
	try
	{
		if( !IsArray( aActions ) )
		{
			throw "error";
		}
	}
	catch( err )
	{
		try
		{
			aActions = CurRequest.Query.GetProperty( "do" )
			aActions = ParseJson( CurRequest.Query.GetProperty( "do" ) )
		}
		catch( ex )
		{
			aActions = new Array();
		}
	}
	try
	{
		var iUserID = CurRequest.Session.Env.GetOptProperty( "curUserID" );
		var teUser = CurRequest.Session.Env.GetOptProperty( "curUser" );
	}
	catch( ex )
	{
		set_res_error( "Некорректный curUserID" );
		return oRes
	}
	var bCheckAccess = tools_web.check_access( global_settings.settings.calendar, iUserID, teUser, CurRequest.Session );
	
	
	var oParams;
	var _wps, _st;
	for( _action in aActions )
		try
		{
			sAction = _action.GetOptProperty( "action" );
			oAnswer = new Object();
			oAnswer.action = sAction;
			oAnswer.action_id = _action.GetOptProperty( "action_id" );
			oAnswer.error = 0;
			oAnswer.error_string = "";
			oAnswer.SetProperty( "cur_user_id", RValue( iUserID ) );
			oAnswer.SetProperty( "cur_user_fullname", RValue( teUser.fullname ) );
			oParams = _action.GetOptProperty( "params", ({}) );
			if( !bCheckAccess && sAction != "GetSettings" )
			{
				set_error( "У вас нет доступа к календарю" )
				continue;
			}

			switch( sAction )
			{
				case "GetSettings":
					oAnswer.SetProperty( "modules", ({}) );
					oAnswer.SetProperty( "lists", ({}) );
					oAnswer.modules.SetProperty( "conversation", ({}) );
					if( bCheckAccess )
					{
						oAnswer.modules.SetProperty( "calendar", ({}) );
					}
					oAnswer.modules.SetProperty( "todo", ({}) );
					oAnswer.lists.SetProperty( "event_types", [] );
					oAnswer.lists.event_types.push( { id: "call", name: "Звонок", can_create: true } );
					oAnswer.lists.event_types.push( { id: "meeting", name: "Вебинар", can_create: true } );
					//oAnswer.lists.event_types.push( { id: "webinar", name: "Вебинар", can_create: false } );
					
					for( _st in [ "activity", "general" ] )
					{
						oAnswer.lists.SetProperty( _st + "_web_person_states", [] );
						for( _wps in XQuery( "for $elem in web_person_states where $elem/type_id = " + XQueryLiteral( _st ) + " return $elem" ) )
						{
							oAnswer.lists.GetProperty( _st + "_web_person_states" ).push( { id: _wps.id.Value, code: _wps.code.Value, name: _wps.name.Value } );
						}
					}
					oAnswer.lists.SetProperty( "call_states", [] );
					for( _cs in common.event_status_types )
					{
						oAnswer.lists.call_states.push( { id: _cs.id.Value, name: _cs.name.Value } );
					}
					break;
				case "GetEvents":
					oResAction = GetEvents( oParams.GetOptProperty( "sType", "" ), oParams.GetOptProperty( "dStartDate", "" ), oParams.GetOptProperty( "dFinishDate", "" ) );
					oAnswer.SetProperty( "array" , oResAction.array );
					if( oResAction.error != 0 )
					{
						oAnswer.error = oResAction.error;
						oAnswer.error_string = oResAction.error_string;
					}
					break;
				case "GetEvent":
					oResAction = GetEvent( oParams.GetOptProperty( "iEventID", "" ) );
					oAnswer.SetProperty( "event_data" , oResAction.event_data );
					if( oResAction.error != 0 )
					{
						oAnswer.error = oResAction.error;
						oAnswer.error_string = oResAction.error_string;
					}
					break;
				case "ModifyEvent":
					oResAction = ModifyEvent( oParams.GetOptProperty( "oEventData", "" ) );
					oAnswer.SetProperty( "event_id" , oResAction.event_id );
					if( oResAction.error != 0 )
					{
						oAnswer.error = oResAction.error;
						oAnswer.error_string = oResAction.error_string;
					}
					break;
				case "ChangeStatusEvent":
					oResAction = ChangeStatusEvent( oParams.GetOptProperty( "iEventID", "" ), oParams.GetOptProperty( "sStatus", "" ) );
					if( oResAction.error != 0 )
					{
						oAnswer.error = oResAction.error;
						oAnswer.error_string = oResAction.error_string;
					}
					break;
				case "DeleteEvent":
					oResAction = DeleteEvent( oParams.GetOptProperty( "iEventID", "" ) );
					oAnswer.SetProperty( "event_id" , oParams.GetOptProperty( "iEventID", "" ) );
					if( oResAction.error != 0 )
					{
						oAnswer.error = oResAction.error;
						oAnswer.error_string = oResAction.error_string;
					}
					break;
				case "ConfirmEventParticipation":
					oResAction = ConfirmEventParticipation( oParams.GetOptProperty( "iEventID", "" ), oParams.GetOptProperty( "sParticipation", "" ) );
					if( oResAction.error != 0 )
					{
						oAnswer.error = oResAction.error;
						oAnswer.error_string = oResAction.error_string;
					}
					break;
				case "GetParticipantsAvailability":
					oResAction = GetParticipantsAvailability( oParams.GetOptProperty( "iEventID", "" ), oParams.GetOptProperty( "dStartDate", "" ), oParams.GetOptProperty( "dFinishDate", "" ), oParams.GetOptProperty( "aParticipants", "" ) );
					oAnswer.SetProperty( "availability_participants" , oResAction.availability_participants );
					if( oResAction.error != 0 )
					{
						oAnswer.error = oResAction.error;
						oAnswer.error_string = oResAction.error_string;
					}
					break;
				case "GetUsers":
					oResAction = GetUsers( oParams.GetOptProperty( "sSearch", "" ) );
					oAnswer.SetProperty( "users" , oResAction.users );
					if( oResAction.error != 0 )
					{
						oAnswer.error = oResAction.error;
						oAnswer.error_string = oResAction.error_string;
					}
					break;
				default:
					set_error( "Неизвестное действие." );
					break;
			}

			oRes.actions.push( oAnswer );
		}
		catch( ex )
		{
			set_error( ex );
		}
	oRes.actions = ParseJson( EncodeJson( oRes.actions, { ExportLargeIntegersAsStrings: true } ) )
	return oRes;
}