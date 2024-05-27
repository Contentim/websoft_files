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
		bDebug = global_settings.debug;
	}
	if( bDebug )
	{
		tools.log_event_server( "xhttp", ( 'chat_library.js ' + sText ) );
	}
}
/**
 * @namespace Websoft.WT.Chat
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
 * @typedef {Object} oState
 * @property {string} id
 * @property {string} name
*/
/**
 * @typedef {Object} WTChatResult
 * @property {number} error – код ошибки
 * @property {string} message – текст ошибки
*/
/**
 * @typedef {Object} oCatalog
 * @property {string} type
 * @property {string} title
 * @property {boolean} all
 * @property {bigint[]} objects
*/
/**
 * @function SendMessage
 * @memberof Websoft.WT.Chat
 * @description Запись сообщений в блок сообщений.
 * @param {string} sTextMessage - текст сообщения
 * @param {bigint} iObjectID - ID получателя ( чат/чат чат-бота/разговор )
 * @param {bigint} iSenderID - ID отправителя ( сотрудник/чат-бот )
 * @param {bigint[]} [arrFiles] - массив файлов, прикрепленных к сообщению
 * @param {oCatalog[]} [arrCatalogs] - массив Ссылок на объекты, прикрепленных к сообщению
 * @param {string} [sMessageID] - id сообщение ( если не прислано будет сгенерировано автоматически )
 * @param {string} [sMessageType] - тип сообщения ( message / system )
 * @param {bigint[]} [arrMessageRecipients] - адресаты для сообщения
 * @param {string[]} [arrDispRoles] - роли для сообщения
 * @returns {WTChatResult}
 */
function SendMessage( sTextMessage, iObjectID, iSenderID, arrFiles, arrCatalogs, sMessageID, sMessageType, arrMessageRecipients, arrDispRoles )
{
	return send_message( sTextMessage, iObjectID, null, iSenderID, null, arrFiles, arrCatalogs, sMessageID, null, sMessageType, arrMessageRecipients, arrDispRoles );
}

function check_user_access_message( oMessage, iPersonID, tePerson, iConversationID, teConversation, oConversationOperationData, aUserRoles, aUserGroups )
{
	/*
		проверка прав доступа сотрудника к сообщению
		oMessage	- сообщение ( элемент массива блока сообщений )
		iPersonID	- ID сотрудника
		tePerson	- TopElem сотрудника
		iConversationID	- ID разговора
		oConversationOperationData	- результат get_operations_conversation
		aUserRoles	- массив ID ролей сотрудника в разговоре
		aUserGroups	- массив ID групп сотрудника
	*/
	try
	{
		iPersonID = Int( iPersonID )
	}
	catch( ex )
	{
		return false;
	}
	try
	{
		iConversationID = Int( iConversationID )
	}
	catch( ex )
	{
		return false;
	}
	try
	{
		teConversation.Name
	}
	catch( ex )
	{
		try
		{
			teConversation = OpenDoc( UrlFromDocID( iConversationID ) ).TopElem;
		}
		catch( ex )
		{
			return false
		}
	}
	if( oMessage.state_id != "active" )
	{
		return false;
	}
	var catMessageRecipient = oMessage.recipients.GetOptChildByKey( iPersonID );
	if( catMessageRecipient != undefined && catMessageRecipient.state_id == "hide" )
	{
		return false;
	}
	if( oMessage.object_id == iPersonID )
	{
		return true;
	}
	switch( oMessage.type_id )
	{
		case "message":
		case "forward":
		case "personal":
		{
			if( ArrayOptFirstElem( oMessage.disp_roles ) == undefined )
			{
				return catMessageRecipient != undefined || ( ( teConversation.is_public || teConversation.format_id == "channel" ) && oMessage.type_id != "personal" );
			}
		}
		case "system":
		{
			if( oMessage.type_id == "system" )
			{
				if( ArrayOptFirstElem( oMessage.disp_roles ) == undefined )
				{
					return catMessageRecipient != undefined;
				}
			}
		}
		default:
		{
			try
			{
				if( IsArray( aUserRoles ) )
				{
					for( _disp_role_id in aUserRoles )
					{
						if( oMessage.disp_roles.GetOptChildByKey( _disp_role_id ) != undefined )
							return true;
					}
					return false;
				}
			}
			catch( ex )
			{
			}
			try
			{
				tePerson.Name
			}
			catch( ex )
			{
				try
				{
					tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
				}
				catch( ex )
				{
					return false
				}
			}
			try
			{
				oConversationOperationData.GetProperty( "disp_roles" );
			}
			catch( ex )
			{
				oConversationOperationData = get_operations_conversation( iConversationID, iPersonID, teConversation, tePerson, null, false );
			}

			try
			{
				if( !IsArray( aUserGroups ) )
					throw "error";
			}
			catch( ex )
			{
				aUserGroups = ArrayExtract( XQuery( "for $i in group_collaborators where $i/collaborator_id = " + iPersonID + "  return $i/Fields( 'group_id' )" ), "This.group_id.Value" );
			}
			for( _disp_role in oMessage.disp_roles )
			{
				_cat_disp_role = oConversationOperationData.disp_roles.GetOptChildByKey( _disp_role.PrimaryKey );
				if( _cat_disp_role != undefined && check_access_role( _cat_disp_role.access, iPersonID, tePerson, aUserGroups ) )
					return true;
			}
			return false;
		}
	}
	return false
}

function check_access_role( oAccess, iPersonID, tePerson, aUserGroups )
{
	flagFirstBlock = true;
	if ( tePerson.access.access_level < oAccess.access_level )
	{
		flagFirstBlock = false;
	}
	else if ( ArrayCount( oAccess.access_roles ) != 0 && ! oAccess.access_roles.ChildByKeyExists( tePerson.access.access_role ) )
	{
		flagFirstBlock = false;
	}
	else if ( ArrayCount( oAccess.access_groups ) != 0 )
	{
		try
		{
			if( !IsArray( aUserGroups ) )
				throw "error";
		}
		catch( ex )
		{
			aUserGroups = ArrayExtract( XQuery( "for $i in group_collaborators where $i/collaborator_id = " + iPersonID + "  return $i/Fields( 'group_id' )" ), "This.group_id.Value" );
		}
		if ( ArrayOptFind( aUserGroups, 'oAccess.access_groups.ChildByKeyExists(This)' ) == undefined )
			flagFirstBlock = false;
	}

	if ( ArrayCount( oAccess.conditions ) == 0 )
		return flagFirstBlock;

	if ( flagFirstBlock && oAccess.operator == 'or' )
		return true;
	if ( ! flagFirstBlock && oAccess.operator != 'or' )
		return false;

	if( ArrayOptFirstElem( XQuery( tools.create_xquery( 'collaborator', '$elem/id = ' + iPersonID, tools.create_filter_xquery( oAccess.conditions ), '', '' ) ) ) != undefined )
		return true;

	return false;
}

function save_message_in_block( iObjectID, eMessage, bSaveBlock, docOldBlockMessage, iBlockMessageID, sActionType )
{
	try
	{
		if( bSaveBlock == "" || bSaveBlock == undefined || bSaveBlock == null )
			throw 'error';
	}
	catch( ex )
	{
		bSaveBlock = true;
	}
	try
	{
		docOldBlockMessage.TopElem
	}
	catch( ex )
	{
		docOldBlockMessage = undefined;
	}
	iBlockMessageID = OptInt( iBlockMessageID );
	if( docOldBlockMessage == undefined && iBlockMessageID != undefined )
	{
		docOldBlockMessage = tools.open_doc( iBlockMessageID );
	}
	iMaxMessage = OptInt( global_settings.settings.max_message_in_block_count )
	catBlockMessage = undefined;
	var teObject = null;
	var catParicipantState = null;

	if( docOldBlockMessage == undefined )
	{
		catBlockMessage = ArrayOptFirstElem( XQuery( 'for $i in block_messages where $i/object_id = ' + iObjectID + ' and $i/state_id = \'active\' order by $i/create_date descending return $i' ) );
	}
	if( sActionType != "edit" && ( ( docOldBlockMessage == undefined && ( catBlockMessage == undefined || catBlockMessage.count_message >= iMaxMessage ) ) || ( docOldBlockMessage != undefined && docOldBlockMessage.TopElem.messages.ChildNum >= iMaxMessage ) ) )
	{
		teObject = OpenDoc( UrlFromDocID( iObjectID ) ).TopElem;
		docBlockMessage = OpenNewDoc( 'x-local://wtv/wtv_block_message.xmd' );
		docBlockMessage.BindToDb( DefaultDb );
		docBlockMessage.TopElem.create_date = Date();
		docBlockMessage.TopElem.object_id = iObjectID;
		docBlockMessage.TopElem.object_type = teObject.Name;
		docBlockMessage.TopElem.object_name = tools.get_disp_name_value( teObject );
		if( docOldBlockMessage == undefined && catBlockMessage != undefined )
		{
			docOldBlockMessage = OpenDoc( UrlFromDocID( catBlockMessage.id ) );
			docOldBlockMessage.TopElem.state_id = 'close';
			catParicipantState = docOldBlockMessage.TopElem.recipients.Clone();
			docOldBlockMessage.TopElem.recipients.Clear();
			docOldBlockMessage.Save();
		}
		else if( docOldBlockMessage != undefined )
		{
			docOldBlockMessage.TopElem.state_id = 'close';
			catParicipantState = docOldBlockMessage.TopElem.recipients.Clone();
			docOldBlockMessage.TopElem.recipients.Clear();
			docOldBlockMessage.Save();
		}
		arrRecipients = get_recipients( iObjectID, teObject ).recipients;
		if( catParicipantState != null )
		{
			docBlockMessage.TopElem.recipients.AssignElem( catParicipantState );
		}
		/*for( _rec in arrRecipients )
			docBlockMessage.TopElem.recipient_id.ObtainByValue( _rec )*/
	}
	else if( docOldBlockMessage == undefined )
	{
		docBlockMessage = OpenDoc( UrlFromDocID( catBlockMessage.id ) );
	}
	else
	{
		docBlockMessage = docOldBlockMessage;
	}

	//teBlockMessage = docBlockMessage.TopElem;
	switch( sActionType )
	{
		case "edit":
			_Message = docBlockMessage.TopElem.messages.GetOptChildByKey( eMessage.id );
			if( _Message == undefined )
			{
				return docBlockMessage;
			}
			_Message.Clear();
			break;
		default:
			_Message = docBlockMessage.TopElem.messages.AddChild();

	}
	_Message.AssignElem( eMessage );
	if( bSaveBlock )
		docBlockMessage.Save();

	ms_tools.raise_system_event_env( 'common_write_message', {
			'sTextMessage': _Message.text,
			'iObjectID': iObjectID,
			'iSenderID': _Message.object_id,
			'teBlockMessage': docBlockMessage.TopElem,
			'sMessageID': _Message.id
		} );

	return docBlockMessage;
}
function get_forward_message_data( catMessage, iPersonID, oCacheData )
{
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = "";
	oRes.forward_message_data = ({});
	oRes.forward_message_data.state = "";
	
	try
	{
		if( oCacheData == undefined || oCacheData == null )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oCacheData = ({object_block_messages: [], list_block_messages: [], recipient_objects: []});
	}
	if( !IsArray( oCacheData.GetOptProperty( "object_block_messages" ) ) )
	{
		oCacheData.SetProperty( "object_block_messages", [] );
	}
	if( !IsArray( oCacheData.GetOptProperty( "list_block_messages" ) ) )
	{
		oCacheData.SetProperty( "list_block_messages", [] );
	}
	if( !IsArray( oCacheData.GetOptProperty( "recipient_objects" ) ) )
	{
		oCacheData.SetProperty( "recipient_objects", [] );
	}
	oRes.cache_data = oCacheData;
	
	try
	{
		if( catMessage.Name != "message" )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = "Incorrect catMessage";
		return oRes;
	}
	if( !catMessage.forward.message_id.HasValue )
	{
		return oRes;
	}
	var teBlockMessage = undefined;
	var docBlockMessage, catBlockMessages, _bm;
	if( catMessage.forward.block_message_id.HasValue )
	{
		teBlockMessage = ArrayOptFind( oRes.cache_data.object_block_messages, "This.id == " + catMessage.forward.block_message_id );
		if( teBlockMessage == undefined )
		{
			docBlockMessage = tools.open_doc( catMessage.forward.block_message_id );
			if( docBlockMessage != undefined )
			{
				teBlockMessage = docBlockMessage.TopElem;
				oRes.cache_data.object_block_messages.push( teBlockMessage );
			}
		}
	}
	else
	{
		catBlockMessages = ArrayOptFind( oRes.cache_data.list_block_messages, "This.id == " + catMessage.forward.conversation_id );
		if( catBlockMessages == undefined )
		{
			catBlockMessages = new Object();
			catBlockMessages.id = catMessage.forward.conversation_id.Value;
			xarrBlockMessages = XQuery( "for $elem in block_messages where $elem/object_id = " + catMessage.forward.conversation_id + " and $elem/state_id != 'hidden' order by $elem/create_date descending return $elem/Fields('id')" );
			catBlockMessages.block_messages = xarrBlockMessages;
			oRes.cache_data.list_block_messages.push( catBlockMessages );
		}
		for( _bm in catBlockMessages.block_messages )
		{
			teBlockMessage = ArrayOptFind( oRes.cache_data.object_block_messages, "This.id == " + _bm.id );
			if( teBlockMessage == undefined )
			{
				docBlockMessage = tools.open_doc( _bm.id );
				if( docBlockMessage != undefined )
				{
					teBlockMessage = docBlockMessage.TopElem;
					oRes.cache_data.object_block_messages.push( teBlockMessage );
				}
			}
			if( teBlockMessage != undefined )
			{
				if( teBlockMessage.messages.ChildByKeyExists( catMessage.forward.message_id ) )
				{
					break;
				}
				else
				{
					teBlockMessage = undefined;
				}
			}
		}
	}
	
	if( teBlockMessage == undefined || !teBlockMessage.messages.ChildByKeyExists( catMessage.forward.message_id ) )
	{
		oRes.forward_message_data.state = "deleted";
		oRes.error = 404;
		oRes.message = "Forward message not found.";
		return oRes;
	}
	var catForwardMessage = teBlockMessage.messages.GetOptChildByKey( catMessage.forward.message_id );
	oRes.forward_message_data.state = catForwardMessage.edit_date.HasValue ? "edited" : "";
	oRes.forward_message_data.message_id = catForwardMessage.id.Value;
	oRes.forward_message_data.create_date = catForwardMessage.create_date.Value;
	oRes.forward_message_data.block_message_id = teBlockMessage.id.Value;
	oRes.forward_message_data.message_text = catForwardMessage.text.Value;
	//oRes.forward_message_data.sender_id = catForwardMessage.object_id.Value;
	var oResRecipientObject = get_recipient_object( catForwardMessage.object_id.Value, oRes.cache_data.recipient_objects );
	oRes.forward_message_data.sender = oResRecipientObject.ro;
	oRes.cache_data.recipient_objects = oResRecipientObject.recipient_objects;
	//oRes.forward_message_data.sender_fullname = catForwardMessage.text.Value;
	oRes.forward_message_data.conversation_name = get_data_conversation( catMessage.forward.conversation_id, iPersonID ).name;
	return oRes;
}
function get_reply_message_data( catMessage, iConversationID, oCacheData )
{
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = "";
	oRes.reply_message_data = ({});
	oRes.reply_message_data.state = "";
	try
	{
		if( oCacheData == undefined || oCacheData == null )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oCacheData = ({object_block_messages: [], list_block_messages: [], recipient_objects: []});
	}
	if( !IsArray( oCacheData.GetOptProperty( "object_block_messages" ) ) )
	{
		oCacheData.SetProperty( "object_block_messages", [] );
	}
	if( !IsArray( oCacheData.GetOptProperty( "list_block_messages" ) ) )
	{
		oCacheData.SetProperty( "list_block_messages", [] );
	}
	if( !IsArray( oCacheData.GetOptProperty( "recipient_objects" ) ) )
	{
		oCacheData.SetProperty( "recipient_objects", [] );
	}
	try
	{
		iConversationID = OptInt( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = "Incorrect iConversationID";
		return oRes;
	}
	oRes.cache_data = oCacheData;
	
	try
	{
		if( catMessage.Name != "message" )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = "Incorrect catMessage";
		return oRes;
	}
	if( !catMessage.reply.message_id.HasValue )
	{
		return oRes;
	}
	var teBlockMessage = undefined;
	var docBlockMessage, catBlockMessages, _bm;
	if( catMessage.reply.block_message_id.HasValue )
	{
		teBlockMessage = ArrayOptFind( oRes.cache_data.object_block_messages, "This.id == " + catMessage.reply.block_message_id );
		if( teBlockMessage == undefined )
		{
			docBlockMessage = tools.open_doc( catMessage.reply.block_message_id );
			if( docBlockMessage != undefined )
			{
				teBlockMessage = docBlockMessage.TopElem;
				oRes.cache_data.object_block_messages.push( teBlockMessage );
			}
		}
	}
	else
	{
		catBlockMessages = ArrayOptFind( oRes.cache_data.list_block_messages, "This.id == " + iConversationID );
		if( catBlockMessages == undefined )
		{
			catBlockMessages = new Object();
			catBlockMessages.id = iConversationID;
			xarrBlockMessages = XQuery( "for $elem in block_messages where $elem/object_id = " + iConversationID + " and $elem/state_id != 'hidden' order by $elem/create_date descending return $elem/Fields('id')" );
			catBlockMessages.block_messages = xarrBlockMessages;
			oRes.cache_data.list_block_messages.push( catBlockMessages );
		}
		for( _bm in catBlockMessages.block_messages )
		{
			teBlockMessage = ArrayOptFind( oRes.cache_data.object_block_messages, "This.id == " + _bm.id );
			if( teBlockMessage == undefined )
			{
				docBlockMessage = tools.open_doc( _bm.id );
				if( docBlockMessage != undefined )
				{
					teBlockMessage = docBlockMessage.TopElem;
					oRes.cache_data.object_block_messages.push( teBlockMessage );
				}
			}
			if( teBlockMessage != undefined )
			{
				if( teBlockMessage.messages.ChildByKeyExists( catMessage.reply.message_id ) )
				{
					break;
				}
				else
				{
					teBlockMessage = undefined;
				}
			}
		}
	}
	
	if( teBlockMessage == undefined || !teBlockMessage.messages.ChildByKeyExists( catMessage.reply.message_id ) )
	{
		oRes.reply_message_data.state = "deleted";
		oRes.error = 404;
		oRes.message = "Reply message not found.";
		return oRes;
	}
	var catReplyMessage = teBlockMessage.messages.GetOptChildByKey( catMessage.reply.message_id );
	oRes.reply_message_data.state = catReplyMessage.edit_date.HasValue ? "edited" : "";
	oRes.reply_message_data.message_id = catReplyMessage.id.Value;
	oRes.reply_message_data.create_date = catReplyMessage.create_date.Value;
	oRes.reply_message_data.block_message_id = teBlockMessage.id.Value;
	oRes.reply_message_data.message_text = catReplyMessage.text.Value;
	oRes.reply_message_data.files = new Array();
	for( _file in catReplyMessage.files )
	{
		feFile = _file.file_id.OptForeignElem;
		if( feFile == undefined )
		{
			continue;
		}
		oRes.reply_message_data.files.push( { id: _file.file_id.Value, type: feFile.type.Value, name: feFile.name.Value, url: tools_web.get_resource_url( _file.file_id ) } );
	}
	var oResRecipientObject = get_recipient_object( catReplyMessage.object_id.Value, oRes.cache_data.recipient_objects );
	oRes.reply_message_data.sender = oResRecipientObject.ro;
	oRes.cache_data.recipient_objects = oResRecipientObject.recipient_objects;
	return oRes;
}

function get_message_by_message_id( sMessageID, iBlockMessageID, iConversationID )
{
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = "";
	oRes.cat_message = null;
	oRes.doc_block_message = null;
	
	try
	{
		if( sMessageID == "" || sMessageID == null || sMessageID == undefined )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = "Incorrect sMessageID";
		return oRes;
	}
	try
	{
		iBlockMessageID = OptInt( iBlockMessageID );
	}
	catch( ex )
	{
		iBlockMessageID = undefined
	}
	try
	{
		iConversationID = OptInt( iConversationID );
	}
	catch( ex )
	{
		iConversationID = undefined
	}
	if( iConversationID == undefined && iBlockMessageID== undefined )
	{
		oRes.error = 1;
		oRes.message = "Incorrect iConversationID and iBlockMessageID";
		return oRes;
	}
	
	var arrBlockMessages = new Array();
	if( iBlockMessageID != undefined )
	{
		arrBlockMessages.push( {id: iBlockMessageID} );
	}
	else
	{
		arrBlockMessages = XQuery( "for $elem in block_messages where $elem/object_id = " + iConversationID + " and $elem/state_id != 'hidden' order by $elem/create_date descending return $elem/Fields('id')" );
	}
	var docBlockMessage, _bm;
	for( _bm in arrBlockMessages )
	{
		docBlockMessage = tools.open_doc( _bm.id );
		if( docBlockMessage == undefined )
		{
			continue;
		}
		if( docBlockMessage.TopElem.messages.ChildByKeyExists( sMessageID ) )
		{
			oRes.cat_message = docBlockMessage.TopElem.messages.GetOptChildByKey( sMessageID );
			oRes.doc_block_message = docBlockMessage;
			break;
		}
	}
	if( oRes.cat_message == null )
	{
		oRes.error = 1;
		oRes.message = "Message not found.";
	}
	return oRes;
}

function write_message( sTextMessage, iObjectID, teObject, iSenderID, teSender, arrFiles, arrCatalogs, sMessageID, oMessageData, sMessageType, arrMessageRecipients, arrDispRoles, bSendConversationData, sActionType, iBlockMessageID, catMessage, sCurrentWebsocketID, oReplyData, oForwardData )
{
	/*
		Запись сообщений в блок сообщений
			sTextMessage 	- текст сообщения
			iObjectID		- ID получателя ( чат/чат чат-бота/разговор )
			teObject		- TopElem получателя
			iSenderID		- ID отправителя ( сотрудник/чат-бот )
			teSender		- TopElem отправителя
			arrFiles		- массив файлов, прикрепленных к сообщению
			arrCatalogs		- массив Ссылок на объекты, прикрепленных к сообщению ( [ { type: 'collaborator', 'title': '', all: false, objects: [ 111111, 222222 ] } ] )
			sMessageID		- id сообщение ( если не прислано будет сгенерировано автоматически )
			oMessageData	- данные сообщения ( используется для чат-бота )
			sMessageType	- тип сообщения ( message / system )
			arrMessageRecipients	- адресаты для сообщения
			arrDispRoles	- роли для сообщения
			bSendConversationData	- отправлять полный набор данных по разговору
			sActionType		- тип действия (edit - при редактировании)
			iBlockMessageID	- ID блока сообщения
			catMessage		- Элемент сообщения из блока сообщения
			sCurrentWebsocketID	- текущий сокет
			oReplyData		- данные по сообщению на которое отвечают
			oForwardData	- данные по пересылаемому сообщению
	*/
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	try
	{
		if( !IsArray( arrFiles ) )
			throw 'error';
	}
	catch( ex )
	{
		arrFiles = [];
	}
	try
	{
		if( !IsArray( arrCatalogs ) )
			throw 'error';

	}
	catch( ex )
	{
		arrCatalogs = [];
	}

	try
	{
		if( sTextMessage == "" || sTextMessage == undefined || sTextMessage == null )
			throw 'error';
		sTextMessage = tools_web.convert_html_to_bbcode( sTextMessage );
	}
	catch( ex )
	{
		sTextMessage = "";
	}
	try
	{
		if( oMessageData == "" || oMessageData == undefined || oMessageData == null )
			throw 'error';
	}
	catch( ex )
	{
		oMessageData = null;
	}
	function check_message_data( oMessageData )
	{
		if( oMessageData == null )
		{
			return false;
		}
		if( oMessageData.GetOptProperty( "data_type" ) != undefined )
		{
			return true;
		}
		if( oMessageData.GetOptProperty( "inline_keyboards" ) != undefined && ArrayOptFirstElem( oMessageData.inline_keyboards ) != undefined )
		{
			return true;
		}
		return false;
	}
	try
	{
		if( sTextMessage == "" && ArrayOptFirstElem( arrFiles ) == undefined && ArrayOptFirstElem( arrCatalogs ) == undefined && !check_message_data( oMessageData ) )
			throw 'error';
	}
	catch( ex )
	{
		sTextMessage = "";
		oRes.error = 1;
		oRes.message = 'Не переданы данные сообщения';
		alerd( 'write_message ' + oRes.message )
		return oRes;
	}
	alerd( 'write_message start ' + sTextMessage )
	try
	{
		iObjectID = Int( iObjectID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID объекта';
		alerd( 'write_message finish ' + oRes.message )
		return oRes;
	}
	
	try
	{
		teObject.Name;
		if( teObject == null || teObject == '' )
			throw 'error object'
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
			oRes.message = 'Передан некорректный ID объекта';
			alerd( 'write_message finish ' + oRes.message )
			return oRes;
		}
	}
	try
	{
		iSenderID = Int( iSenderID );
	}
	catch( ex )
	{
		iSenderID = undefined
	}
	try
	{
		teSender.Name;
		if( teSender == null || teSender == '' )
			throw 'error sender'
	}
	catch( ex )
	{
		teSender = null;
		if( iSenderID != undefined )
			try
			{
				teSender = OpenDoc( UrlFromDocID( iSenderID ) ).TopElem;
			}
			catch( ex )
			{
			}
	}

	try
	{
		if( sMessageID == "" || sMessageID == undefined || sMessageID == null )
			throw 'error';
	}
	catch( ex )
	{
		sMessageID = null;
	}
	
	try
	{
		if( sMessageType == "" || sMessageType == undefined || sMessageType == null )
			throw 'error';
	}
	catch( ex )
	{
		sMessageType = 'message';
	}
	try
	{
		if( !IsArray( arrMessageRecipients ) )
			throw 'no'
	}
	catch( ex )
	{
		arrMessageRecipients = null;
	}
	try
	{
		if( !IsArray( arrDispRoles ) )
			throw 'no'
	}
	catch( ex )
	{
		arrDispRoles = [];
	}
	try
	{
		bSendConversationData = tools_web.is_true( bSendConversationData );
	}
	catch( ex )
	{
		bSendConversationData = false;
	}
	
	try
	{
		if( StrBegins( RValue( oReplyData ), "{" ) )
		{
			oReplyData = ParseJson( RValue( oReplyData ) );
		}
		if( oReplyData.GetProperty( "message_id", "" ) == "" )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oReplyData = null;
	}
	try
	{
		if( StrBegins( RValue( oForwardData ), "{" ) )
		{
			oForwardData = ParseJson( RValue( oForwardData ) );
		}
		if( oForwardData.GetProperty( "message_id", "" ) == "" || OptInt( oForwardData.GetProperty( "conversation_id", "" ) ) == undefined )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oForwardData = null;
	}

	var arrRecipients = null;

	iBlockMessageID = OptInt( iBlockMessageID, null );
	try
	{
		if( sActionType == null || sActionType == undefined )
		{
			throw "error";
		}
		switch( sActionType )
		{
			case "edit":
			{
				try
				{
					catMessage.Name;
					_Message = catMessage;
				}
				catch( ex )
				{
					if( sMessageID == null )
					{
						oRes.error = 1;
						oRes.message = 'Передан некорректный ID сообщения';
						return oRes;
					}
					_Message = undefined;

					for( _bm in tools.xquery( "for $elem in block_messages where $elem/object_id = " + iObjectID + " " + ( iBlockMessageID != null ? ( "$elem/id = " + iBlockMessageID ) : "" ) + " return $elem/id, $elem/__data" ) )
					{
						docBlockMessage = tools.open_doc( _bm.id );
						if( docBlockMessage == undefined )
						{
							continue;
						}

						_Message = docBlockMessage.TopElem.messages.GetOptChildByKey( sMessageID );
						if( _Message != undefined )
						{
							iBlockMessageID = _bm.id.Value;
							break;
						}
					}
					if( _Message == undefined )
					{
						oRes.error = 1;
						oRes.message = 'Передан некорректный ID сообщения';
						return oRes;
					}
				}
				_Message.edit_date = Date();
				if( arrMessageRecipients == null )
				{
					arrMessageRecipients = ArrayExtract( _Message.recipients, "This.PrimaryKey" );
				}
				else
				{
					var arrDeletedRecipients = new Array();
					for( _recipient in _Message.recipients )
					{
						if( ArrayOptFind( arrMessageRecipients, "OptInt( This ) == _recipient.PrimaryKey" ) == undefined )
						{
							arrDeletedRecipients.push( _recipient.PrimaryKey );
						}
					}
					for( _recipient in arrDeletedRecipients )
					{
						_Message.recipients.DeleteChildByKey( _recipient );
					}
				}
				break;
			}
		}
	}
	catch( ex )
	{
		sActionType = "new";
		teBlockMessage = OpenNewDoc( 'x-local://wtv/wtv_block_message.xmd' ).TopElem;
		_Message = teBlockMessage.messages.AddChild();
	}
	if( !_Message.id.HasValue )
	{
		if( sMessageID != null )
		{
			_Message.id = sMessageID;
		}
		else
		{
			_Message.id = tools.random_string( 6 );
		}
	}
	_Message.text = sTextMessage;
	if( !_Message.create_date.HasValue )
	{
		_Message.create_date = Date();
	}
	_Message.type_id = sMessageType;
	if( teSender != null )
	{
		_Message.object_id = iSenderID;
		_Message.object_type = teSender.Name;
		_Message.object_name = tools.get_disp_name_value( teSender );
	}
	else
	{
		_Message.object_id.Clear();
		_Message.object_type.Clear();
		_Message.object_name.Clear();
	}

	if( oMessageData != null )
	{
		_Message.data = tools.object_to_text( oMessageData, 'json' )
	}
	else
	{
		_Message.data.Clear();
	}

	_Message.files.Clear();
	for( _file_id in arrFiles )
	{
		iFileID = OptInt( _file_id );
		if( iFileID != undefined )
		{
			_Message.files.ObtainChildByKey( iFileID );
		}
	}
	_Message.disp_roles.Clear();
	for( _disp_role in arrDispRoles )
	{
		_Message.disp_roles.ObtainChildByKey( _disp_role );
	}

	_Message.catalogs.Clear();
	for( _catalog in arrCatalogs )
	{
		sCatalogName = _catalog.GetOptProperty( 'type', '' );
		if( sCatalogName == '' )
			continue;
		_common_child = common.exchange_object_types.GetOptChildByKey( sCatalogName );
		if( _common_child == undefined )
			continue;

		_child = _Message.catalogs.ObtainChildByKey( sCatalogName );
		sTitle = _catalog.GetOptProperty( 'title', '' );
		if( sTitle == '' )
		{
			sTitle = _common_child.web_title;
		}
		_child.title = sTitle;
		_child.all = tools_web.is_true( _catalog.GetOptProperty( 'all', false ) );
		_objects = _catalog.GetOptProperty( 'objects', [] )
		if( IsArray( _objects ) )
		{
			for( _object in _objects )
			{
				_object_id = OptInt( _object );
				if( _object_id != undefined )
				{
					_child.objects.ObtainChildByKey( _object_id );
				}
			}
		}
	}
	
	if( oReplyData != null )
	{
		_Message.reply.message_id = oReplyData.GetOptProperty( "message_id", null );
		_Message.reply.block_message_id = oReplyData.GetOptProperty( "block_message_id", null );
	}
	
	if( oForwardData != null )
	{
		_Message.forward.message_id = oForwardData.GetOptProperty( "message_id", null );
		_Message.forward.block_message_id = oForwardData.GetOptProperty( "block_message_id", null );
		_Message.forward.conversation_id = oForwardData.GetOptProperty( "conversation_id", null );
	}

	aRecipients = undefined;
	var sOMessage = null;
	var teObjectType = null;
	var catParticipant = undefined;
	var oSendMessage = null;
	var oResRecipients = null;
	var feObjectParticipant = undefined;

	if( arrMessageRecipients != null )
	{
		arrRecipients = arrMessageRecipients;
	}
	else if( arrRecipients == null )
	{
		switch( teObject.Name )
		{
			case 'request':
			case 'event':
			{
				oResRecipients = get_recipients( iObjectID, teObject );
				arrRecipients = oResRecipients.recipients;
				break;
			}
			case 'conversation':
			{
				if( teObject.is_public )
				{
					sKey = 'participants_state_in_conversation_' + iObjectID;
					oState = tools_web.get_user_data( sKey );

					if( oState == null || oState == undefined )
					{
						arrRecipients = new Array();
					}
					else
					{
						arrRecipients = oState.participants;
					}
					arrRecipients = ArrayExtract( arrRecipients, 'This.participant_id' );
				}
				else
				{
					catParticipant = ArrayOptFind( teObject.participants, 'This.state_id == \'active\'' );
					if( catParticipant != undefined )
					{
						switch( catParticipant.object_type )
						{
							default:
								oResRecipients = get_recipients( iObjectID, teObject );
								arrRecipients = oResRecipients.recipients;
								break;
						}
					}
				}
				break;
			}
			default:
			{
				oResRecipients = get_recipients( iObjectID, teObject );
				arrRecipients = oResRecipients.recipients;
			}
		}
	}
	if( oResRecipients != null )
	{
		feObjectParticipant = oResRecipients.fe_object;
	}
	var arrConversationOperationDatas = new Array();

	function get_conversation_operation_data( _person_id )
	{
		catElem = ArrayOptFind( arrConversationOperationDatas, "This.person_id == _person_id" );
		if( catElem == undefined )
		{
			catElem = new Object();
			catElem.person_id = _person_id;
			catElem.data = get_operations_conversation( iObjectID, _person_id, teObject, null, teObjectType, false );
			arrConversationOperationDatas.push( catElem );
		}
		return catElem.data;
	}

	arrRecipients = ArraySelect( ArrayExtract( arrRecipients, "OptInt( This )" ), "This != undefined" );
	var bUseWebSocket = false;
	var oResRecipientObject = new Object();
	oResRecipientObject.recipient_objects = new Array();
	if( teObject.Name == 'conversation' )
	{
		bUseWebSocket = AppConfig.GetOptProperty( 'DOTNETCORE-XHTTP' ) == '1';
		if ( ( tools.sys_db_capability ) == 0 )
		{
			var xHttpStaticAssembly = null;

			if( bUseWebSocket )
			{
				xHttpStaticAssembly = tools.get_object_assembly( 'XHTTPMiddlewareStatic' );
				var datexAssembly = tools.get_object_assembly( 'DatexCore' );
				WebSockets = xHttpStaticAssembly.CallClassStaticMethod( 'Datex.XHTTP.WebSocketContext', 'GetWebSockets').ToArray();
			}

			if( teObject.conversation_type_id.HasValue )
				teObjectType = OpenDoc( UrlFromDocID( teObject.conversation_type_id ) ).TopElem;
		}
		sUserDataKey = 'chat_conversations_recipients';
		aRecipients = tools_web.get_user_data( sUserDataKey );
		if( aRecipients == undefined || aRecipients == null )
		{
			aRecipients = new Array();
		}
		else
		{
			aRecipients = aRecipients.GetOptProperty( 'result', [] );
		}
		alerd( 'write_message aRecipients ' + tools.object_to_text( aRecipients, 'json' ) );
		var oResCacheData = new Object();
		try
		{
			oSendMessage = new Object();
			oSendMessage.id = _Message.id.Value;
			//oSendMessage.conversation_id = iObjectID;
			oSendMessage.conversation = new Object();
			oSendMessage.action = ( sActionType == "edit" ? "edit_message" : "send_message" );
			oSendMessage.conversation.id = iObjectID;
			oSendMessage.conversation.name = teObject.name.Value;

			oSendMessage.conversation.position_priority = 0;
			oSendMessage.conversation.list_css = "";

			oSendMessage.operations = [];
			oSendMessage.recipients = [];
			if( _Message.type_id == 'personal' )
			{
				oSendMessage.recipients = ArraySelect( arrRecipients, "This != iSenderID" );
			}
			oSendMessage.message_state_id = "not_read";
			oSendMessage.disp_roles = ArrayExtract( _Message.disp_roles, 'This.id.Value' );
			sObjectImageUrl = '';
			if ( teObject.resource_id.HasValue )
				sObjectImageUrl = tools_web.get_object_source_url( 'resource', teObject.resource_id );
			else
				sObjectImageUrl = '/images/conversation.png';
			
			oSendMessage.recipient_state_id = ( sActionType != "edit" ? "not_read" : "" );
			oSendMessage.conversation.icon_url = sObjectImageUrl;
			for( participant in teObject.participants )
			{
				if( !participant.object_id.HasValue )
					continue
				if( participant.state_id == 'active' )
				{
					oSendMessage.conversation.object_type = participant.object_type.Value;
					oSendMessage.conversation.object_id = participant.object_id.Value;
					break;
				}
			}
			if( oSendMessage.action == "send_message" )
			{
				oSendMessage.conversation.last_unread_message = _Message.text.Value;
				oSendMessage.conversation.last_unread_message_date = _Message.create_date.Value;
				oSendMessage.conversation.increment_unread = 1;
			}

			oSendMessage.type_id = _Message.type_id.Value;
			oSendMessage.is_file = false;
			if( _Message.text.HasValue )
			{
				oSendMessage.text = tools_web.convert_bbcode_to_html( _Message.text.Value );
			}
			else if( ArrayOptFirstElem( _Message.files ) != undefined )
			{
				oSendMessage.text = "Файлы" + ": " + ArrayCount( _Message.files );
				oSendMessage.is_file = true;
			}
			if( _Message.object_id.HasValue )
			{
				oResRecipientObject = get_recipient_object( _Message.object_id.Value, oResCacheData.GetOptProperty( "recipient_objects" ) );
				oResCacheData.SetProperty( "recipient_objects", oResRecipientObject.recipient_objects );
				oSendMessage.sender = oResRecipientObject.ro;
			}
			else
			{
				oSendMessage.sender = ({});
			}
			oSendMessage.create_date = _Message.create_date.Value;
			oSendMessage.edit_date = _Message.edit_date.Value;
			try
			{
				if( _Message.data.HasValue )
				{
					CheckMessageData( _Message.data, oSendMessage );
				}
			}
			catch( ex ){}
			var oResReply = get_reply_message_data( _Message, iObjectID, oResCacheData );
			oResCacheData = oResReply.cache_data;
			oSendMessage.reply = oResReply.reply_message_data;
			var oResForward = get_forward_message_data( _Message, iObjectID, oResCacheData );
			oResCacheData = oResForward.cache_data;
			oSendMessage.forward = oResForward.forward_message_data;

			oSendMessage.files = new Array();
			for( _file in _Message.files )
			{
				feFile = _file.file_id.OptForeignElem;
				if( feFile == undefined )
					continue;
				oSendMessage.files.push( { id: _file.file_id.Value, type: feFile.type.Value, name: feFile.name.Value, url: tools_web.get_resource_url( _file.file_id ) } )
			}
			oSendMessage.recipient_states = null;
			sOMessage = EncodeJson( oSendMessage );
		}
		catch( err )
		{
			alert( 'chat_library.js write_message ' + err )
			sOMessage = null;
		}
	}
	
	for( _recipient in arrRecipients )
	{
		switch( teObject.Name )
		{
			case 'conversation':
			{
				if( _Message.disp_roles.ChildNum > 0 && !check_user_access_message( _Message, _recipient, null, iObjectID, teObject ) )
				{
					continue;
				}
				if( _recipient != iSenderID )
				{
					_Message.recipients.ObtainChildByKey( _recipient );
				}
				break;
			}
			default:
			{
				if( _recipient != iSenderID )
				{
					_Message.recipients.ObtainChildByKey( _recipient );
				}
			}
		}
	}
	if( oSendMessage != null )
	{
		oSendMessage.recipient_states = ArrayExtract( _Message.recipients, "return ({ id: This.PrimaryKey.Value, state_id: This.state_id.Value })" );
		oSendMessage.recipients = ArrayExtract( _Message.recipients, "This.PrimaryKey.Value" );
		sOMessage = EncodeJson( oSendMessage );
	}
	if( catParticipant == undefined && teObject.Name == "conversation" )
	{
		catParticipant = ArrayOptFind( teObject.participants, 'This.state_id == \'active\'' );
	}
	if( catParticipant != undefined )
	{
		if( feObjectParticipant == undefined )
		{
			feObjectParticipant = catParticipant.object_id.OptForeignElem;
		}
	}
	if( feObjectParticipant != undefined )
	{
		if( feObjectParticipant.Name == "chat" && feObjectParticipant.is_personal )
		{
			bSendConversationData = true;
		}
	}
	var oNewSendMessage;
	if ( ( tools.sys_db_capability ) == 0 )
	{

		bUseWebSocket = bUseWebSocket && xHttpStaticAssembly != null && aRecipients != undefined && sOMessage != null;
		if( bUseWebSocket )
		{
			switch( teObject.Name )
			{
				case 'conversation':
				{
					arrRecipientStates = oSendMessage.recipient_states;
					oSendMessage.recipient_states = null;
					if( ( catParticipant != undefined && catParticipant.object_type == "request" ) || true )
					{
						for( _recipient in ArrayIntersect( aRecipients, ArrayUnion( _Message.recipients, [{person_id: iSenderID}] ), "This.person_id", "This.person_id" ) )
						{
							
							if( catParticipant != undefined && ( bSendConversationData || catParticipant.object_type == "task" ||  catParticipant.object_type == "request" || catParticipant.object_type == "learning_record" ) )
							{
								oConversationOperationData = get_conversation_operation_data( _recipient.person_id );
								oDataConversation = get_data_conversation( oSendMessage.conversation.id, _recipient.person_id, teObject );
								oSendMessage.conversation.name = oDataConversation.name;
								oSendMessage.conversation.operations = oConversationOperationData.operations;

								oSendMessage.conversation.disp_roles = new Array();
								aUserGroups = null;
								tePerson = null;
								for( _disp_role in oConversationOperationData.disp_roles )
								{
									try
									{
										tePerson.Name
									}
									catch( ex )
									{
										tePerson = OpenDoc( UrlFromDocID( _recipient.person_id ) ).TopElem;
									}
									if( aUserGroups == null )
										aUserGroups = ArrayExtract( XQuery( "for $i in group_collaborators where $i/collaborator_id = " + _recipient.person_id + "  return $i/Fields( 'group_id' )" ), "This.group_id.Value" );
									if( check_access_role( _disp_role.access, _recipient.person_id, tePerson, aUserGroups ) )
									{
										oSendMessage.conversation.disp_roles.push( { id: RValue( _disp_role.id ), name: RValue( _disp_role.name.Value ) } );
									}
								}
								oSendMessage.conversation.icon_url = oDataConversation.pict_url;
								if( oConversationOperationData.conversation_top_elem != null )
								{
									if( ArrayOptFind( oSendMessage.conversation.operations, "This.id == 'use_priority_and_list_css'" ) != undefined )
									{
										oSendMessage.conversation.position_priority = OptInt( oConversationOperationData.conversation_top_elem.position_priority.Value, 0 );
										oSendMessage.conversation.list_css = oConversationOperationData.conversation_top_elem.list_css.Value;
									}
								}
							}
							catRecipient = arrRecipientStates != null ? ArrayOptFind( arrRecipientStates, "OptInt( This.id ) == OptInt( _recipient.person_id )" ) : undefined;
							oSendMessage.recipient_state_id = catRecipient != undefined ? catRecipient.state_id : "";
							alerd( 'write_message send to socket _recipient ' + _recipient.person_id )
							oNewSendMessage = oSendMessage;
							if( oNewSendMessage.action == "send_message" )
							{
								oNewSendMessage.conversation.SetProperty( "increment_unread", ( oSendMessage.sender.id == _recipient.person_id ? 0 : 1 ) );
							}
							oSocket = ArrayOptFind( WebSockets, 'This.Key == _recipient.socket_id ' );
							if( oSocket != undefined )
							{
								try
								{
									xHttpStaticAssembly.CallClassStaticMethod( 'Datex.XHTTP.WebSocketContext', 'WriteToWebSocketMessageQueue', [ oSocket.Key , tools.object_to_text( oNewSendMessage, 'json' ), true ] );
									alerd( 'write_message sended to socket oRecipient ' + _recipient.socket_id )
								}
								catch( err )
								{
									alert( 'chat_library.js write_message ' + err )
								}
							}
						}
					}
					else
					{
						for( _recipient in ArrayIntersect( aRecipients, ArrayUnion( _Message.recipients, [{person_id: iSenderID}] ), "This.person_id", "This.person_id" ) )
						{
							catRecipient = arrRecipientStates != null ? ArrayOptFind( arrRecipientStates, "OptInt( This.id ) == OptInt( _recipient.person_id )" ) : undefined;
							oSendMessage.recipient_state_id = catRecipient != undefined ? catRecipient.state_id : "";
							alerd( 'write_message send to socket _recipient ' + _recipient.person_id )
							oNewSendMessage = oSendMessage;
							oSocket = ArrayOptFind( WebSockets, 'This.Key == _recipient.socket_id ' )
							if( oSocket != undefined )
							{
								try
								{
									xHttpStaticAssembly.CallClassStaticMethod( 'Datex.XHTTP.WebSocketContext', 'WriteToWebSocketMessageQueue', [ oSocket.Key , tools.object_to_text( oNewSendMessage, 'json' ), true ] );
									alerd( 'write_message sended to socket oRecipient ' + _recipient.socket_id )
								}
								catch( err )
								{
									alert( 'chat_library.js write_message ' + err )
								}
							}
						}
					}
					break;

				}
			}
		}
	}
	else if( sOMessage != null && teObject.Name == "conversation" && bUseWebSocket )
	{
		teCommand = OpenDocFromStr( tools.xml_header() + '<queue_sendtosocket/>' ).TopElem;
		teCommand.AddChild( 'type', 'string' ).Value = 'sendtosocket';
		teCommand.AddChild( 'object_type', 'string' ).Value = catParticipant != undefined ? catParticipant.object_type.Value : "";
		teCommand.AddChild( 'conversation_id', 'integer' ).Value = iObjectID;
		teCommand.AddChild( 'send_conversation_data', 'bool' ).Value = bSendConversationData;
		teCommand.AddChild( 'json_message', 'string' ).Value = EncodeJson( oSendMessage, { ExportLargeIntegersAsStrings: true } );
		teCommand.AddChild( 'json_recipients', 'string' ).Value = EncodeJson( ArrayIntersect( aRecipients, ArrayUnion( _Message.recipients, [{person_id: iSenderID}] ), "This.person_id", "This.person_id" ) );
		tools.put_message_in_queue( 'chat-sendtosocket-queue', teCommand.GetXml( { 'tabs': false } ) );
	}
	if( global_settings.settings.use_mobile_chat.Value && teObject.Name == "conversation" && ArrayOptFirstElem( _Message.recipients ) != undefined )
	{
		for( _col in XQuery( "for $elem in collaborators where MatchSome( $elem/id, ( " + ArrayMerge( _Message.recipients, "This.person_id", "," ) + " ) ) return $elem/Fields('login')" ) )
		{
			tools_web.send_message('webtutormobilex', _Message.text, null, _col.login.Value, ( {"travel": ( "webtutormobilex://command/chat," + iObjectID )} ));
		}
	}

	if( teObject.Name == "conversation" && teObject.format_id == "channel" && _Message.type_id == "message" )
	{
		catParticipant = ArrayOptFind( teObject.participants, 'This.state_id == \'active\'' );
		if( catParticipant != undefined )
		{
			catConversationObjectType = common.conversation_object_types.GetOptChildByKey( catParticipant.object_type );
			if( catConversationObjectType != undefined && catConversationObjectType.exclude_channel_participant )
			{
				_Message.recipients.Clear();
			}
		}
	}

	if ( ( tools.sys_db_capability ) == 0 )
	{
		save_message_in_block( iObjectID, _Message, true, null, iBlockMessageID, sActionType );
	}
	else
	{
		teCommand = OpenDocFromStr( tools.xml_header() + '<queue_saveblockmessage/>' ).TopElem;
		teCommand.AddChild( 'type', 'string' ).Value = 'saveblockmessage';
		teCommand.AddChild( 'conversation_id', 'integer' ).Value = iObjectID;
		teCommand.AddChild( 'object_id', 'integer' ).Value = iObjectID;
		teCommand.AddChild( 'block_message_id', 'integer' ).Value = iBlockMessageID;
		teCommand.AddChild( 'xml_message', 'string' ).Value = _Message.Xml;
		teCommand.AddChild( 'action_type', 'string' ).Value = sActionType;
		tools.put_message_in_queue( 'chat-saveblockmessage-queue', teCommand.GetXml( { 'tabs': false } ) );
	}

	if( sActionType == "new" && teObject.Name == 'conversation' )
	{
		try
		{
			arrParticipants = new Array();
			if( teSender != null && teSender.Name != 'chatbot' )
			{
				if( teObject.Name == 'chatbot_chat' )
				{
					arrParticipants.push( teObject );
				}
				else if( teObject.Name == 'conversation'  )
				{
					catParticipant = teObject.participants.GetOptChildByKey( 'active', 'state_id' );
					if( catParticipant != undefined && catParticipant.object_type == 'chatbot_chat' )
					{
						arrParticipants.push( catParticipant.object_id.OptForeignElem )
					}
					else
						arrParticipants = XQuery( 'for $i in chatbot_chats where $i/conversation_id = ' + iObjectID + ' and $i/state_id = \'active\' return $i' );
				}
			}
			if( ArrayOptFirstElem( arrParticipants ) != undefined )
			{
				for( catParticipant in arrParticipants )
				{
					oMessage = new Object();
					oMessage.id = _Message.id.Value;
					oMessage.msg_type = 'message';
					oMessage.chat_id = catParticipant.code.Value;
					oMessage.text = _Message.text.Value;
					if( oMessageData != null )
						for( _elem in oMessageData )
							oMessage.SetProperty( _elem, oMessageData.GetOptProperty( _elem ) )

					catChatBotChatBotType = ArrayOptFirstElem( XQuery( 'for $i in chatbot_chatbot_types where $i/chatbot_id = ' + catParticipant.chatbot_id + ' and $i/chatbot_type_id = ' + catParticipant.chatbot_type_id + ' return $i' ) )

					chatbot_request_processing( null, '', { bot_id : catChatBotChatBotType.bot_id.Value }, oMessage, false, iSenderID, ( teObject.Name == 'conversation' ? iObjectID : undefined ), _Message, sCurrentWebsocketID );

				}
			}
		}
		catch( ex )
		{
			alert('chat_library.js write_message ' +  ex )
		}

		try
		{
			for( _rc in teObject.related_chats )
			{
				send_message_to_chatbot( "В разговоре -" + teObject.name + ", " + teSender.name + " написал: ", _rc.PrimaryKey );
			}
		}
		catch( ex )
		{
			alert('chat_library.js write_message ' +  ex )
		}

	}
	
	//oRes.SetProperty( 'doc_message', docBlockMessage );

	alerd( 'write_message finish' )
	return oRes;
}

function CheckMessageData( sMessageData, oSendMessage )
{
	try
	{
		var oMessageData = ParseJson( sMessageData );
	}
	catch( ex )
	{
		return false;
	}
	try
	{
		if( oMessageData.GetOptProperty( "data_type" ) == "message_info" )
		{
			var _field;
			for( _field in oMessageData )
			{
				if( _field != "data_type" && !oSendMessage.HasProperty( _field ) )
				{
					oSendMessage.SetProperty( _field, oMessageData.GetOptProperty( _field ) );
				}
			}
			return true;
		}
	}
	catch( ex )
	{
	}
	oSendMessage.SetProperty( "data", oMessageData );
	return true;
}

function send_message( sTextMessage, iObjectID, teObject, iSenderID, teSender, arrFiles, arrCatalogs, sMessageID, oMessageData, sMessageType, arrMessageRecipients, arrDispRoles, sActionType, iBlockMessageID, catMessage )
{
	/*
		Запись сообщений в очередь
		sTextMessage 	- текст сообщения
		iObjectID		- ID получателя ( чат/чат чат-бота/разговор )
		teObject		- TopElem получателя
		iSenderID		- ID отправителя ( сотрудник/чат-бот )
		teSender		- TopElem отправителя
		arrFiles		- массив файлов, прикрепленных к сообщению
		arrCatalogs		- массив Ссылок на объекты, прикрепленных к сообщению ( [ { type: 'collaborator', 'title': '', all: false, objects: [ 111111, 222222 ] } ] )
		sMessageID		- id сообщение ( если не прислано будет сгенерировано автоматически )
		oMessageData	- данные сообщения
		sMessageType	- тип сообщения ( message / system )
		arrMessageRecipients	- адресаты для сообщения
		arrDispRoles	- роли для сообщения
	*/

	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	oRes.SetProperty( 'doc_message', null );
	try
	{
		sTextMessage;
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан текст сообщения';
		return oRes;
	}
	try
	{
		iObjectID = Int( iObjectID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID объекта';
		return oRes;
	}
	try
	{
		teObject.Name;
	}
	catch( ex )
	{
		teObject = null;
	}
	try
	{
		oMessageData;
	}
	catch( ex )
	{
		oMessageData = null;
	}
	try
	{
		iSenderID = Int( iSenderID );
	}
	catch( ex )
	{
		iSenderID = undefined
	}
	try
	{
		teSender.Name;
	}
	catch( ex )
	{
		teSender = null;
	}

	try
	{
		if( !IsArray( arrFiles ) )
			throw 'error';
	}
	catch( ex )
	{
		arrFiles = [];
	}
	try
	{
		if( !IsArray( arrCatalogs ) )
			throw 'error';
	}
	catch( ex )
	{
		arrCatalogs = [];
	}
	try
	{
		sMessageID;
	}
	catch( ex )
	{
		sMessageID = null;
	}
	try
	{
		sMessageType;
	}
	catch( ex )
	{
		sMessageType = 'message';
	}
	try
	{
		if( !IsArray( arrMessageRecipients ) )
			throw 'error';
	}
	catch( ex )
	{
		arrMessageRecipients = null;
	}
	try
	{
		if( !IsArray( arrDispRoles ) )
			throw 'error';
	}
	catch( ex )
	{
		arrDispRoles = [];
	}

	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	if( global_settings.settings.script_queues.enable_queues && false )
	{
		_params = new Array();
		_params.push( XQueryLiteral( sTextMessage ) );
		_params.push( iObjectID );
		_params.push( "null" );
		_params.push( iSenderID );
		_params.push( "null" );
		_params.push( 'tools.read_object( ' + XQueryLiteral( tools.object_to_text( arrFiles, 'json' ) ) + ' )' );
		_params.push( 'tools.read_object( ' + XQueryLiteral( tools.object_to_text( arrCatalogs, 'json' ) ) + ' )' );
		_params.push( XQueryLiteral( String( sMessageID ) ) );
		_params.push( ( oMessageData != null ? 'tools.read_object( ' + XQueryLiteral( tools.object_to_text( oMessageData, 'json' ) ) + ' )' : 'null' ) );
		_params.push( XQueryLiteral( sMessageType ) );
		_params.push( ( arrMessageRecipients != null ? 'tools.read_object( ' + XQueryLiteral( tools.object_to_text( arrMessageRecipients, 'json' ) ) + ' )' : "null" ) );
		_params.push( 'tools.read_object( ' + XQueryLiteral( String( tools.object_to_text( arrDispRoles, 'json' ) ) ) + ' )' );
		_params.push( XQueryLiteral( null ) );
		_params.push( XQueryLiteral( sActionType ) );
		_params.push( XQueryLiteral( iBlockMessageID ) );

		tools.add_script_to_queue( "tools.call_code_library_method( 'libChat', 'write_message', [ " + ArrayMerge( _params, "This", ", " ) + " ] )", "send_message", true, 0 );
	}
	else
		oRes = write_message( sTextMessage, iObjectID, teObject, iSenderID, teSender, arrFiles, arrCatalogs, sMessageID, oMessageData, sMessageType, arrMessageRecipients, arrDispRoles, null, sActionType, iBlockMessageID, catMessage );

	return oRes;
}
function get_recipient_from_object( _cat_object, _object_type, iConversationID, teConversation )
{
	arrRes = new Array();
	switch( _object_type )
	{
		case 'chatbot_chat':
		case 'chatbot_chats':
			if( _cat_object.person_id.HasValue )
				arrRes.push( _cat_object.person_id );
			break;

		case 'chat':
			arrRes = ArrayExtract( _cat_object.collaborators, 'This.collaborator_id' );
			break;
		case 'chats':
			if( _cat_object.collaborators.HasValue )
			{
				arrRes = ArrayExtract( String( _cat_object.collaborators ).split( ',' ), 'OptInt( This )' );
			}
			break;
		case 'events':
			if( _cat_object.is_room )
			{
				arrRes = ArrayExtract( XQuery( 'for $i in event_room_collaborators where $i/event_id = ' + _cat_object.id + ' return $i/Fields(\'collaborator_id\')' ), 'This.collaborator_id' );//and ( $i/is_collaborator = true() or $i/is_tutor = true() )
				arrRes = ArrayUnion( arrRes, ArrayExtract( XQuery( 'for $i in event_room_lectors where $i/event_id = ' + _cat_object.id + ' and $i/person_id != null() return $i/Fields(\'person_id\')' ), 'This.person_id' ) );

			}
			else
			{
				arrRes = ArrayExtract( XQuery( 'for $i in event_collaborators where $i/event_id = ' + _cat_object.id + ' return $i/Fields(\'collaborator_id\')' ), 'This.collaborator_id' );//and ( $i/is_collaborator = true() or $i/is_tutor = true() )
				arrRes = ArrayUnion( arrRes, ArrayExtract( XQuery( 'for $i in event_lectors where $i/event_id = ' + _cat_object.id + ' and $i/person_id != null() return $i/Fields(\'person_id\')' ), 'This.person_id' ) );
				feEventType = _cat_object.event_type_id.OptForeignElem;
				if( feEventType != undefined && feEventType.online && _cat_object.webinar_system_id.HasValue )
				{
					arrWeninarConversationParticipants = tools.get_webinar_conversation_participants();
					catWebinarSystem = ArrayOptFind( arrWeninarConversationParticipants, "This.webinar_system_id == _cat_object.webinar_system_id" );
					if( catWebinarSystem != undefined )
					{
						arrRes = ArrayUnion( arrRes,  catWebinarSystem.persons );
					}

				}
			}
			break;
		case 'event':
			teEvent = OpenDoc( UrlFromDocID( _cat_object ) ).TopElem;
			arrRes = ArrayExtract( teEvent.collaborators, 'This.PrimaryKey' );
			arrRes = ArrayUnion( arrRes, ArrayExtract( teEvent.tutors, 'This.PrimaryKey' ) );
			arrRes = ArrayUnion( arrRes, ArrayExtract( teEvent.even_preparations, 'This.person_id' ) );
			if( teEvent.is_room )
			{
				arrRes = ArrayUnion( arrRes, ArrayExtract( XQuery( 'for $i in event_room_lectors where $i/event_id = ' + _cat_object + ' and $i/person_id != null() return $i/Fields(\'person_id\')' ), 'This.person_id' ) );
			}
			else
			{
				arrRes = ArrayUnion( arrRes, ArrayExtract( XQuery( 'for $i in event_lectors where $i/event_id = ' + _cat_object + ' and $i/person_id != null() return $i/Fields(\'person_id\')' ), 'This.person_id' ) );
			}
			feEventType = teEvent.event_type_id.OptForeignElem;
			if( feEventType != undefined && feEventType.online && teEvent.webinar_system_id.HasValue )
			{
				arrWeninarConversationParticipants = tools.get_webinar_conversation_participants();
				catWebinarSystem = ArrayOptFind( arrWeninarConversationParticipants, "This.webinar_system_id == teEvent.webinar_system_id" );
				if( catWebinarSystem != undefined )
				{
					arrRes = ArrayUnion( arrRes,  catWebinarSystem.persons );
				}

			}
			break;
		case 'requests':
		case 'tasks':
			arrRes = _cat_object.workflow_person_id;
			break;
		case 'request':
		case 'task':
			arrRes = ArrayExtract( _cat_object.workflow_matchings, "This.person_id" );
			break;
		case 'learning_records':
			arrRes.push( _cat_object.person_id.Value );
			arrRes = ArrayUnion( arrRes, ArrayExtract( _cat_object.proctors_id, "This.Value" ) );
			xarrProctoringObjects = XQuery( "for $elem in object_experts where $elem/object_id = " + _cat_object.proctoring_object_id + " and $elem/type = 'proctor' return $elem" );
			arrRes = ArrayUnion( arrRes, ArrayExtract( xarrProctoringObjects, 'This.person_id' ) )
			break;
		default:
			catConversationObjectType = common.conversation_object_types.GetOptChildByKey( _object_type );
			if( catConversationObjectType == undefined || catConversationObjectType.is_fix_participants )
			{
				try
				{
					teConversation.Name;
					if( teConversation == null || teConversation == '' )
						throw 'error object'
				}
				catch( ex )
				{
					try
					{
						teConversation = OpenDoc( UrlFromDocID( Int( iConversationID ) ) ).TopElem;
					}
					catch( ex )
					{
						return [];
					}
				}
				arrRes = teConversation.participants_id;
			}
			break;

	}
	return ArraySelectDistinct( ArrayExtract( ArraySelect( arrRes, 'OptInt( This ) != undefined' ), "OptInt( This )" ), "This" );
}
/**
 * @typedef {Object} oResultRecipient
 * @property {number} error
 * @property {string} message
 * @property {bigint[]} recipients
*/
/**
 * @function GetRecipients
 * @memberof Websoft.WT.Chat
 * @description Получение списка адресатов.
 * @param {bigint} iObjectID - ID объекта
 * @returns {oResultRecipient}
 */
function GetRecipients( iObjectID )
{
	return get_recipients( iObjectID );
}

function get_recipients( iObjectID, teObject )
{
	/*
		получение списка адресатов
		iObjectID		- ID объекта
		teObject		- TopElem объекта
	*/

	var oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	oRes.recipients = new Array();
	oRes.fe_object = undefined;

	try
	{
		teObject.Name;
		if( teObject == null || teObject == '' )
			throw 'error object'
	}
	catch( ex )
	{
		try
		{
			teObject = OpenDoc( UrlFromDocID( Int( iObjectID ) ) ).TopElem;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.message = 'Передан некорректный ID объекта';
			return oRes;
		}
	}

	arrRecipients = new Array();
	switch( teObject.Name )
	{
		case 'chat':
		case 'chatbot_chat':
			arrRecipients = get_recipient_from_object( teObject, teObject.Name, iObjectID, teObject );
			break;

		case 'conversation':
			for( _participant in teObject.participants )
			{
				if( _participant.state_id != 'active' )
					continue;
				switch( _participant.object_type )
				{
					case "chat":
					case "chatbot_chat":
					case "request":
					case "task":
					case "learning_record":
						{
							feObject = _participant.object_id.OptForeignElem;
							
							if( feObject == undefined )
							{
								continue;
							}
							oRes.fe_object = feObject;
							arrRecipients = get_recipient_from_object( feObject, _participant.object_type + 's', iObjectID, teObject );
							break;
						}
					default:
						arrRecipients = get_recipient_from_object( _participant.object_id, _participant.object_type, iObjectID, teObject );
				}
			}
			break;


	}

	oRes.recipients = ArraySelectDistinct( arrRecipients, 'This' );
	return oRes;
}
/**
 * @function ChangeParticipantsConversation
 * @memberof Websoft.WT.Chat
 * @description Изменение участников разговора.
 * @param {bigint|string} iConversationID - ID разговора ( можно передать название, тогда создастся новый разговор с таким названием )
 * @param {string} sAction - действие с участниками ( add/del/change/send_to_chatbot/event/request/object )
 * @param {bigint} [iParticipantID] - ID сотрудника для добавления/удаления
 * @param {bigint[]} [arrParticipants] - массив участников ( при sAction = 'change' )
 * @param {bigint} [iChatbotID] - ID чат-бота
 * @param {bigint} [iConversationTypeID] - ID типа разговора ( если создается новый разговор )
 * @returns {WTChatResult}
 */
function ChangeParticipantsConversation( iConversationID, sAction, iParticipantID, arrParticipants, iChatbotID, iConversationTypeID )
{
	return change_participants_conversation_queue( iConversationID, null, sAction, iParticipantID, arrParticipants, iChatbotID, iConversationTypeID )
}

function change_participants_conversation_queue( iConversationID, docConversation, sAction, iParticipantID, arrParticipants, iChatbotID, iConversationTypeID, docParticipantObject )
{
	/*
		Запись в очередь изменения участников разговора
		iConversationID	- ID разговора ( можно передать название, тогда создастся новый разговор с таким названием )
		docConversation	- документ разговора
		sAction			- действие с участниками ( add/del/change/send_to_chatbot/event/request/object )
		iParticipantID	- ID сотрудника для добавления/удаления
		arrParticipants	- массив участников ( при sAction = 'change' )
		iChatbotID		- ID чат-бота
		iConversationTypeID	- ID типа разговора ( если создается новый разговор )
		docParticipantObject	- документ участников разговора ( чат, чат чат-бота, мероприятия, заявка )
	*/

	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	try
	{
		if( iConversationID == "" || iConversationID == undefined )
			throw "error";
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID разговора';
		return oRes;
	}
	try
	{
		docConversation.TopElem;
	}
	catch( ex )
	{
		docConversation = null;
	}
	try
	{
		if( sAction == "" || sAction == undefined )
			throw "error";
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передано действие над участниками разговора';
		return oRes;
	}
	try
	{
		iParticipantID = OptInt( iParticipantID );
	}
	catch( ex )
	{
		iParticipantID = undefined
	}
	try
	{
		iChatbotID = OptInt( iChatbotID );
	}
	catch( ex )
	{
		iChatbotID = undefined
	}
	try
	{
		iConversationTypeID = OptInt( iConversationTypeID );
	}
	catch( ex )
	{
		iConversationTypeID = undefined
	}
	try
	{
		docParticipantObject.TopElem;
	}
	catch( ex )
	{
		docParticipantObject = undefined
	}

	try
	{
		if( !IsArray( arrParticipants ) )
			throw "error";
	}
	catch( ex )
	{
		if( sAction == 'change' )
		{
			oRes.error = 1;
			oRes.message = 'Не передан массив участников';
			return oRes;
		}
		arrParticipants = [];
	}

	if( global_settings.settings.script_queues.enable_queues && false )
		tools.add_script_to_queue( "tools.call_code_library_method( 'libChat', 'change_participants_conversation', [ "  + XQueryLiteral( iConversationID ) + ", null, " + XQueryLiteral( sAction ) + ", " + iParticipantID + ", tools.read_object( " + XQueryLiteral( tools.object_to_text( arrParticipants, "json" ) ) + ", " + iChatbotID + " , " + iConversationTypeID +  " ] )", 'change_participants_conversation', true, 0 );
	else
		oRes = change_participants_conversation( iConversationID, docConversation, sAction, iParticipantID, arrParticipants, iChatbotID, iConversationTypeID, docParticipantObject )

	return oRes;
}

function change_participants_conversation( iConversationID, docConversation, sAction, iParticipantID, arrParticipants, iChatbotID, iConversationTypeID, docParticipantObject, sConversationFormat, sConversationName, iCreationUserID, bSendConversationData, bSendMessage, oParticipantObject )
{
	/*
		Изменение участников разговора
		iConversationID	- ID разговора ( можно передать название, тогда создастся новый разговор с таким названием )
		docConversation	- документ разговора
		sAction			- действие с участниками ( add/del/change/send_to_chatbot/add_object/del_object/change_object/event/request/object )
		iParticipantID	- ID сотрудника/мероприятия для добавления/удаления
		arrParticipants	- массив участников ( при sAction = 'change' )
		iChatbotID		- ID чат-бота
		iConversationTypeID	- ID типа разговора ( если создается новый разговор )
		docParticipantObject	- документ участников разговора ( чат, чат чат-бота, мероприятия, заявка )
		sConversationFormat	- формат разговора
		sConversationName	- название разговора
		iCreationUserID		- ID создателя разговора
		bSendConversationData	- отправлять данные разговора
		bSendMessage		- отправлять сообщения о включении/исключении из разговора
		oParticipantObject	- данные документа участников разговора ( чат, чат чат-бота, мероприятия, заявка ) ({id:"",type:"",name:""})
	*/
	alerd( 'change_participants_conversation start ' )
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = "";
	oRes.conversation_id = "";
	try
	{
		if( sAction == "" || sAction == undefined )
			throw "error";
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передано действие над участниками разговора';
		alerd( 'change_participants_conversation finish ' + oRes.message )
		return oRes;
	}
	try
	{
		if( sConversationFormat == "" || sConversationFormat == undefined || sConversationFormat == null )
			throw "error";
	}
	catch( ex )
	{
		sConversationFormat = "chat";
	}
	try
	{
		if( sConversationName == "" || sConversationName == undefined )
			throw "error";
	}
	catch( ex )
	{
		sConversationName = null;
	}
	try
	{
		iConversationTypeID = Int( iConversationTypeID );
	}
	catch( ex )
	{
		iConversationTypeID = global_settings.settings.default_conversation_type_id.Value;
	}
	try
	{
		iCreationUserID = OptInt( iCreationUserID, null );
	}
	catch( ex )
	{
		iCreationUserID = null;
	}
	try
	{
		docParticipantObject.TopElem;
	}
	catch( ex )
	{
		docParticipantObject = null;
	}
	try
	{
		iChatbotID = Int( iChatbotID );
	}
	catch( ex )
	{
		if( sAction == 'send_to_chatbot' )
		{
			oRes.error = 1;
			oRes.message = 'Не передан ID чат-бота';
			alerd( 'change_participants_conversation finish ' + oRes.message )
			return oRes;
		}
	}
	try
	{
		if( bSendMessage == undefined || bSendMessage == null || bSendMessage == "" )
		{
			throw "error";
		}
		bSendMessage = tools_web.is_true( bSendMessage );
	}
	catch( ex )
	{
		bSendMessage = true;
	}
	try
	{
		iParticipantID = OptInt( iParticipantID );
	}
	catch( ex )
	{
		iParticipantID = undefined;
	}
	try
	{
		if( ObjectType( oParticipantObject ) != "JsObject" )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oParticipantObject = null;
	}
	try
	{
		if( !IsArray( arrParticipants ) )
		{
			throw 'error';
		}
		arrParticipants = ArrayExtract( arrParticipants, "OptInt( This )" );
	}
	catch( ex )
	{
		if( sAction == 'change' || sAction == 'add_request' || sAction == 'del_request' || sAction == 'add_task' || sAction == 'del_task' )
		{
			oRes.error = 1;
			oRes.message = 'Не передан массив участников';
			alerd( 'change_participants_conversation finish ' + oRes.message )
			return oRes;
		}
		arrParticipants = [];
	}
	if( ArrayOptFirstElem( arrParticipants ) == undefined && iParticipantID != undefined )
	{
		arrParticipants.push( iParticipantID );
	}

	if( ArrayOptFirstElem( arrParticipants ) == undefined && ( sAction == 'add_object' || sAction == 'del_object' || sAction == 'add' || sAction == 'del' || sAction == 'send_to_chatbot' ) )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID участника разговора';
		alerd( 'change_participants_conversation finish ' + oRes.message )
		return oRes;
	}
	
	var bAddChatbot = false;
	var iAddChatbotID = null;
	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		/*if( sAction == 'send_to_chatbot' && docParticipantObject == null )
		{
			//catChatBotChat = ArrayOptFirstElem( tools.xquery('for $elem in chatbot_chats where $elem/person_id = ' + iParticipantID + ' and $elem/chatbot_id = ' + iChatbotID + ' return $elem') );
			if( catChatBotChat != undefined )
			{
				docParticipantObject = OpenDoc( UrlFromDocID( catChatBotChat.id ) );
			}
		}*/
		iConversationID = undefined;
		if( docParticipantObject != null || oParticipantObject != null )
		{
			catConversation = ArrayOptFirstElem( tools.xquery('for $elem in conversations where $elem/active_object_id = ' + ( docParticipantObject != null ? docParticipantObject.DocID : oParticipantObject.id ) + ' and $elem/state_id = \'active\' return $elem') );
			if( catConversation != undefined )
			{
				iConversationID = catConversation.id;
			}
		}
		if( iConversationID == undefined && sConversationName != null )
		{
			docConversation = tools.new_doc_by_name( 'conversation', false );
			docConversation.BindToDb( DefaultDb );
			docConversation.TopElem.name = sConversationName;
			docConversation.TopElem.conversation_type_id = iConversationTypeID;
			if( iConversationTypeID != null )
			{
				var catConversationType = ArrayOptFirstElem( XQuery( "for $elem in conversation_types where $elem/id = " + iConversationTypeID + " return $elem" ) );
				if( catConversationType != undefined )
				{
					docConversation.TopElem.prohibit_write = catConversationType.prohibit_write;
					docConversation.TopElem.can_call = catConversationType.can_call;
					docConversation.TopElem.can_change_participant = catConversationType.can_change_participant;
					docConversation.TopElem.can_show_additional_info = catConversationType.can_show_additional_info;
					bAddChatbot = catConversationType.chatbot_id.HasValue;
					iAddChatbotID = catConversationType.chatbot_id.Value;
				}
			}
			docConversation.TopElem.format_id = sConversationFormat;
			iConversationID = docConversation.DocID;
			if( iCreationUserID != null )
			{
				docConversation.TopElem.person_id = iCreationUserID;
				tools.common_filling( 'collaborator', docConversation.TopElem, iCreationUserID );
			}
		}
	}
	try
	{
		docConversation.TopElem;
	}
	catch( ex )
	{
		try
		{
			docConversation = tools.open_doc( iConversationID );
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.message = 'Передан некорректный ID разговора';
			alerd( 'change_participants_conversation finish ' + oRes.message )
			return oRes;
		}
	}

	arrDeletedParticipants = new Array();
	arrAddedParticipants = new Array();

	teConversation = docConversation.TopElem;
	catActiveParticipant = undefined;
	if( teConversation.participants.ChildNum > 0 )
		catActiveParticipant = ArrayMax( ArraySelect( teConversation.participants, 'This.state_id==\'active\'' ), 'This.create_date' );

	switch( sAction )
	{
		case 'add':
		case 'del':
			if( catActiveParticipant != undefined )
			{
				switch( catActiveParticipant.object_type )
				{
					case "task":
					case "request":

						sAction = sAction + "_" + catActiveParticipant.object_type;
						if( docParticipantObject == null )
						{
							docParticipantObject = tools.open_doc( catActiveParticipant.object_id );
						}
						//arrParticipants.push( iParticipantID );
						break;
				}
			}
			break;
	}
	if( docParticipantObject == null )
	{
		switch( sAction )
		{
			case 'add_object':
			case 'del_object':
			case 'change_object':
				if( catActiveParticipant != undefined )
				{
					catConversationObjectType = common.conversation_object_types.GetOptChildByKey( catActiveParticipant.object_type );
					if( catConversationObjectType == undefined || catConversationObjectType.is_fix_participants )
					{
						break;
					}
					else
					{
						sAction = StrReplace( sAction, "_object", "" );
						break;
					}
				}
				oRes.error = 1;
				oRes.message = 'Не передан документ источник';
				alerd( 'change_participants_conversation finish ' + oRes.message )
				return oRes;
		}
	}

	arrOldParticipants = new Array();
	switch( sAction )
	{
		case 'del_request':
		case 'add_request':
		case 'del_task':
		case 'add_task':
			arrOldParticipants = get_recipients( docConversation.DocID, teConversation ).recipients;
			switch( sAction )
			{
				case 'del_request':
				case 'del_task':
					for( _participient in arrParticipants )
					{
						if( ArrayOptFind( arrOldParticipants, 'This == _participient' ) != undefined )
							arrDeletedParticipants.push( _participient );
					}
					break;
				case 'add_request':
				case 'add_task':
					for( _participient in arrParticipants )
					{
						if( docParticipantObject.TopElem.workflow_matchings.GetOptChildByKey( _participient, "person_id" ) == undefined )
							arrAddedParticipants.push( _participient );
					}
					break;
			}
			break;
		case 'event':
		case 'request':
		case 'object':
			break;
		case 'add':
		case 'change':
		case 'del':
		case 'send_to_chatbot':
		case 'add_object':
		case 'del_object':
		case 'change_object':
			arrOldParticipants = get_recipients( docConversation.DocID, teConversation ).recipients;
			switch( sAction )
			{
				case 'del':
				case 'del_object':
					var arrTempParticipants = new Array();
					arrTempParticipants = arrOldParticipants;
					for( _participient in arrParticipants )
					{
						if( ArrayOptFind( arrOldParticipants, 'This == _participient' ) != undefined )
							arrDeletedParticipants.push( _participient );
						
						arrTempParticipants = ArraySelect( arrTempParticipants, 'This != _participient' );
					}
					arrParticipants = arrTempParticipants;
					break;
				case 'add':
				case 'add_object':
					for( _participient in arrParticipants )
					{
						if( ArrayOptFind( arrOldParticipants, 'This == _participient' ) == undefined )
							arrAddedParticipants.push( _participient );
						arrOldParticipants.push( _participient );
						//arrTempParticipants = ArraySelect( arrTempParticipants, 'This != _participient' );
					}
					arrParticipants = arrOldParticipants;
					break;
				case 'send_to_chatbot':
					for( _participient in arrOldParticipants )
					{
						if( _participient != iParticipantID )
							arrDeletedParticipants.push( _participient );
					}
					break;
				default:

					for( _participient in arrOldParticipants )
					{
						if( ArrayOptFind( arrParticipants, 'This == _participient' ) == undefined )
							arrDeletedParticipants.push( _participient );
					}
					for( _participient in arrParticipants )
					{
						if( ArrayOptFind( arrOldParticipants, 'This == _participient' ) == undefined )
							arrAddedParticipants.push( _participient );
					}
					break;

			}
			break;
		default:
			oRes.error = 1;
			oRes.message = 'Неизвестное действие';
			alerd( 'change_participants_conversation finish ' + oRes.message )
			return oRes;
	}


	if( docParticipantObject == null )
	{
		switch( sAction )
		{
			case 'add':
			case 'change':
			case 'del':
				docParticipantObject = OpenNewDoc( 'x-local://wtv/wtv_chat.xmd' );
				docParticipantObject.TopElem.name = 'Чат по разговору' + ' ' + teConversation.name + ' ( ' + Date() + ' )';
				if( ArrayCount( arrParticipants ) == 2 )
					docParticipantObject.TopElem.is_personal = true;
				else
					docParticipantObject.TopElem.is_multiplayer = true;
				docParticipantObject.TopElem.conversation_id = iConversationID;
				for( _participant in arrParticipants )
				{
					_participant = OptInt( _participant );
					fldUser = docParticipantObject.TopElem.collaborators.ObtainChildByKey( _participant );
					tools.common_filling( 'collaborator', fldUser, _participant );
					fldUser.confirmed = true;
				}

				docParticipantObject.BindToDb( DefaultDb );
				docParticipantObject.Save();
				break;


			case 'send_to_chatbot':
				iChatbotTypeID = null;
				try
				{
					teChatBot = OpenDoc( UrlFromDocID( iChatbotID ) ).TopElem;
					iChatbotTypeID = ArrayOptFind( teChatBot.chatbot_types, 'This.chatbot_type_id.HasValue && This.chatbot_type_id.ForeignElem.code == \'webtutor\'' ).chatbot_type_id
				}
				catch( ex )
				{
					oRes.error = 1;
					oRes.message = 'Передан некорректный ID чат-бота';
					alerd( 'change_participants_conversation finish ' + oRes.message )
					return oRes;
				}
				catChat = undefined;
				//catChat = ArrayOptFirstElem( XQuery( 'for $i in chatbot_chats where $i/person_id = ' + iParticipantID + ' and $i/chatbot_id = ' + iChatbotID + ' and $i/chatbot_type_id = ' + iChatbotTypeID + ' return $i' ) );
				if( catChat == undefined )
				{
					docParticipantObject = OpenNewDoc( 'x-local://wtv/wtv_chatbot_chat.xmd' );
					docParticipantObject.BindToDb( DefaultDb );
					docParticipantObject.TopElem.chatbot_type_id = iChatbotTypeID;
					docParticipantObject.TopElem.chatbot_id = iChatbotID;
					docParticipantObject.TopElem.code = tools.random_string( 10 );
					docParticipantObject.TopElem.person_id = iParticipantID;
					tools.common_filling( 'collaborator', docParticipantObject.TopElem, iParticipantID );
					docParticipantObject.TopElem.name = 'Чат по разговору' + ' ' + teConversation.name + ' ( ' + Date() + ' )';
					docParticipantObject.Save();
				}
				else
					docParticipantObject = OpenDoc( UrlFromDocID( catChat.id ) )
				break;
			case 'del_object':
			case 'add_object':
			case 'change_object':
			case "event":
				break;
			default:
				oRes.error = 1;
				oRes.message = 'Не передан документ источник';
				alerd( 'change_participants_conversation finish ' + oRes.message )
				return oRes;
		}
	}
	else
	{
		switch( sAction )
		{
			case 'send_to_chatbot':
				iChatbotTypeID = null;
				try
				{
					teChatBot = OpenDoc( UrlFromDocID( iChatbotID ) ).TopElem;
					iChatbotTypeID = ArrayOptFind( teChatBot.chatbot_types, 'This.chatbot_type_id.HasValue && This.chatbot_type_id.ForeignElem.code == \'webtutor\'' ).chatbot_type_id
				}
				catch( ex )
				{
					oRes.error = 1;
					oRes.message = 'Передан некорректный ID чат-бота';
					alerd( 'change_participants_conversation finish ' + oRes.message )
					return oRes;
				}
				break;
			case 'del_request':
			case 'del_task':
				for( _participant in arrDeletedParticipants )
				{
					_workflow_matching = docParticipantObject.TopElem.workflow_matchings.GetOptChildByKey( _participant, "person_id" );
					if( _workflow_matching != undefined && _workflow_matching.type != "participant" )
					{
						oRes.error = 1;
						oRes.message = "Нельзя исключить данного участника";
						alerd( 'change_participants_conversation finish ' + oRes.message )
						return oRes;
					}
					docParticipantObject.TopElem.workflow_matchings.DeleteChildByKey( _participant, "person_id" );
				}
				docParticipantObject.Save();
				break;
			case 'add_request':
			case 'add_task':
				for( _participant in arrAddedParticipants )
				{
					_child = docParticipantObject.TopElem.workflow_matchings.ObtainChildByKey( _participant, "person_id" );
					_child.type = "participant";
				}
				docParticipantObject.Save();
				break;

		}
	}
	if( bSendMessage )
	{
		switch( sAction )
		{
			case "object":
			case "request":
			case "event":
				break;
			default:
				if( ArrayOptFirstElem( arrDeletedParticipants ) != undefined )
				{
					CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "write_message", [ 'Вы были исключены из разговора', iConversationID, teConversation, null, null, [], [], null, null, 'system', arrDeletedParticipants ] ] );
				}
		}
	}

	switch( sAction )
	{
		case 'del_object':
		case 'add_object':
		case 'change_object':
		{
			teConversation.participants_id.Clear();
			for( _participant in arrParticipants )
			{
				teConversation.participants_id.ObtainByValue( _participant );
			}
		}
		case "request":
		case "event":
		case "object":
		case 'del':
		case 'add':
		case 'change':
		case 'send_to_chatbot':
			if( docParticipantObject != null )
			{
				for( part in teConversation.participants )
				{
					part.state_id = 'archive';
				}
				_child = teConversation.participants.AddChild();
				_child.object_id = docParticipantObject.DocID;
				_child.object_type = docParticipantObject.TopElem.Name;
				_child.object_name = tools.get_disp_name_value( docParticipantObject.TopElem );
				break;
			}
			else if( oParticipantObject != null )
			{
				for( part in teConversation.participants )
				{
					part.state_id = 'archive';
				}
				_child = teConversation.participants.AddChild();
				_child.object_id = oParticipantObject.id;
				_child.object_type = oParticipantObject.type;
				_child.object_name = oParticipantObject.name;
				break;
			}
			break;

	}
	teConversation.created = true;
	docConversation.Save();
	if( bSendMessage )
	{
		switch( sAction )
		{
			case "object":
			case "request":
			case "event":
				break;
			default:
				if( ArrayOptFirstElem( arrAddedParticipants ) != undefined )
				{
					CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "write_message", [ 'Вы были добавлены в разговор', iConversationID, teConversation, null, null, [], [], null, null, 'system', arrAddedParticipants, null, bSendConversationData ] ] );
				}
		}
	}
	if( ArrayOptFirstElem( arrAddedParticipants ) != undefined || ArrayOptFirstElem( arrDeletedParticipants ) != undefined )
	{
		arrNewRecipients = new Array();
		for( _recipient in ArrayUnion( arrOldParticipants, arrAddedParticipants ) )
		{
			if( ArrayOptFind( arrDeletedParticipants, "This == _recipient" ) == undefined )
			{
				arrNewRecipients.push( _recipient );
			}
		}
		for( _recipient in ArrayUnion( arrNewRecipients, arrDeletedParticipants ) )
		{
			tools_web.remove_user_data_by_prefix( "list_conversations_" + _recipient );
		}
		oMessage = { "conversation_id": iConversationID, "action" : "conversation_participants_updated", "recipients": arrNewRecipients };
		CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "send_message_to_socket", [ arrNewRecipients, oMessage ] ] );
		oMessage = { "action" : "delete_person_from_participants", "conversations": [ iConversationID ] };
		CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "send_message_to_socket", [ arrDeletedParticipants, oMessage ] ] );
		var docVideoChat;
		var arrRemoveTickets = new Array();
		var arrTempRemoveUsers = new Array();
		var catActiveVideoChat = ArrayOptFirstElem( XQuery( "for $elem in calls where $elem/conversation_id = " + docConversation.DocID + " and $elem/state_id = 'active' return $elem/Fields('id')" ) );
		if( catActiveVideoChat != undefined )
		{
			arrTempRemoveUsers = new Array();
			var bNeedSave = false;
			docVideoChat = tools.open_doc( catActiveVideoChat.id );
			for( _dp_id in arrDeletedParticipants )
			{
				catParticipant = docVideoChat.TopElem.participants.GetOptChildByKey( _dp_id )
				if( catParticipant != undefined )
				{
					if( catParticipant.ticket_id.HasValue )
					{
						arrRemoveTickets.push( catParticipant.ticket_id.Value );
					}
					arrTempRemoveUsers.push( _dp_id );
					catParticipant.state_id = "archive";
					catParticipant.has_entered = false;
					catParticipant.ticket_id.Clear();
					catParticipant.hash_id.Clear();
					bNeedSave = true;
				}
			}
			for( _ap_id in arrAddedParticipants )
			{
				if( !docVideoChat.TopElem.participants.ChildByKeyExists( _ap_id ) )
				{
					catParticipant = docVideoChat.TopElem.participants.ObtainChildByKey( _ap_id );
					catParticipant.state_id = "active";
					bNeedSave = true;
				}
			}
			if( bNeedSave )
			{
				docVideoChat.Save();
			}
			teCommand = OpenDocFromStr( tools.xml_header() + '<queue_call/>' ).TopElem;
			teCommand.AddChild( 'type', 'string' ).Value = 'start_call';
			teCommand.AddChild( 'call_only_by_list', 'bool' ).Value = false;
			teCommand.AddChild( 'call_only_new', 'bool' ).Value = true;
			teCommand.AddChild( 'conversation_id', 'integer' ).Value = docVideoChat.DocID;
			teCommand.AddChild( 'user_id', 'integer' ).Value = "";
			tools.put_message_in_queue( 'call-queue', teCommand.GetXml( { 'tabs': false } ) );

			if( ArrayOptFirstElem( arrTempRemoveUsers ) != undefined )
			{
				oMessage = { "conversation_id": iConversationID, "call_id": docVideoChat.DocID, "action" : "leaved_call", "leaved_recipients": arrTempRemoveUsers };
				CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "send_message_to_socket", [ arrNewRecipients, oMessage ] ] );
			}
		}
		if( ArrayOptFirstElem( arrRemoveTickets ) != undefined )
		{
			try
			{
				var oMediaSoup = tools.dotnet_host.Object.GetAssembly( "Datex.MediaSoup.dll" );
				oMediaSoup.CallClassStaticMethod( "Datex.MediaSoup.InterServices", "RemoveTickets", [ String( docVideoChat.DocID ), arrRemoveTickets ] );

			}
			catch( ex )
			{
				alert( "RemoveTickets " + ex )
			}
		}
	}


	if( sAction == 'send_to_chatbot' && !docParticipantObject.TopElem.chatbot_stage_id.HasValue )
	{
		catChatBotType = ArrayOptFirstElem( XQuery( 'for $i in chatbot_chatbot_types where $i/chatbot_id = ' + iChatbotID + ' and $i/chatbot_type_id = ' + iChatbotTypeID + ' return $i' ) );
		if( catChatBotType != undefined && teChatBot.start_chatbot_stage_id.HasValue )
		{
			send_to_stage( catChatBotType.chatbot_code, docParticipantObject.DocID, teChatBot.start_chatbot_stage_id, docParticipantObject, null, teChatBot, false, iConversationID, { TEXT: '', message: { type: "start" } } );
		}
	}
	
	if( bAddChatbot && iAddChatbotID != null )
	{
		add_chatbot_to_conversation( docConversation.DocID, iAddChatbotID );
	}

	oRes.SetProperty( 'doc_conversation', docConversation );
	oRes.SetProperty( 'conversation_id', docConversation.DocID );
	alerd( 'change_participants_conversation finish ' + oRes.message )
	return oRes;
}
/**
 * @typedef {Object} oParticipant
 * @property {bigint} participant_id – ID участника
 * @property {string} state – статус
*/
/**
 * @function SetStatusPrticipantInConversation
 * @memberof Websoft.WT.Chat
 * @description Изменение статуса участников разговора.
 * @param {bigint} iConversationID - ID разговора
 * @param {oParticipant[]} aParticipantStates - массив участников разговора с их статусами ( статус delete - исключен из разговора )
 * @returns {WTChatResult}
 */
function SetStatusPrticipantInConversation( iConversationID, aParticipantStates )
{
	return set_status_participant_in_conversation( iConversationID, aParticipantStates )
}

function set_status_participant_in_conversation( iConversationID, aParticipantStates, teConversation, oState )
{
	/*
		Изменение статуса участников разговора
		iConversationID		- ID разговора
		aParticipantStates	- массив участников разговора с их статусами ( статус delete - исключен из разговора ) - [{participant_id: 111111, state: 'print'}]
		teConversation	- TopElem разговора
	*/
	alerd( 'set_status_participant_in_conversation start' )
	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';

	try
	{
		if( !IsArray( aParticipantStates ) )
			throw 'not array';
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан массив участников со статусами';
		alerd( 'set_status_participant_in_conversation finish ' + oRes.message )
		return oRes;
	}
	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Некорректный ID разговора';
		alerd( 'set_status_participant_in_conversation finish ' + oRes.message )
		return oRes;
	}
	try
	{
		teConversation.Name;
	}
	catch( ex )
	{
		teConversation = null;
	}
	sKey = 'participants_state_in_conversation_' + iConversationID;

	try
	{
		if( oState == null || oState == undefined )
			throw "";
	}
	catch( ex )
	{
		oState = tools_web.get_user_data( sKey );
	}

	if( oState == null || oState == undefined )
		arrParticipants = new Array();
	else
		arrParticipants = oState.participants;


	var bNewState = false;
	var catCollaborator, xarrCollaboratorParticipants;
	for( _rec in aParticipantStates )
	{

		if( _rec.state == 'delete' )
		{
			arrParticipants = ArraySelect( arrParticipants, 'This.participant_id != _rec.participant_id' );
			bNewState = true;
		}
		else
		{
			catParticipant = ArrayOptFind( arrParticipants, 'This.participant_id == _rec.participant_id' );
			if( catParticipant == undefined )
			{
				bNewState = true;
				catParticipant = new Object();
				catParticipant.participant_id = RValue( _rec.participant_id );
				if( _rec.GetOptProperty( "participant_fullname", "" ) != "" )
				{
					catParticipant.participant_fullname = RValue( _rec.GetOptProperty( "participant_fullname", "" ) );
				}
				catParticipant.state = RValue( _rec.state );
				catParticipant.date = RValue( Date() );
				arrParticipants.push( catParticipant );
			}
			else
			{
				if( catParticipant.state != _rec.state )
				{
					bNewState = true;
				}
				if( _rec.GetOptProperty( "participant_fullname", "" ) != "" )
				{
					catParticipant.SetProperty( "participant_fullname", RValue( _rec.GetOptProperty( "participant_fullname", "" ) ) );
				}
				catParticipant.date = RValue( Date() );
				catParticipant.state = RValue( _rec.state );
			}
		}
	}
	var arrNullParticipants = ArraySelect( arrParticipants, "This.GetOptProperty( 'participant_fullname', '' ) == ''" );
	if( ArrayOptFirstElem( arrNullParticipants ) != undefined )
	{
		xarrCollaboratorParticipants = XQuery( "for $elem_qc in collaborators where MatchSome($elem_qc/id,(" + ArrayMerge( arrNullParticipants, "XQueryLiteral( This.participant_id )", "," ) + ")) return $elem_qc/Fields('id','fullname')" );
		xarrCollaboratorParticipants = ArraySort( xarrCollaboratorParticipants, "This.id", "+" );
		for( _participant in arrParticipants )
		{
			if( _participant.GetOptProperty( "participant_fullname", "" ) == "" )
			{
				catCollaborator = ArrayOptFindBySortedKey( xarrCollaboratorParticipants, _participant.participant_id, "id" );
				_participant.SetProperty( "participant_fullname", RValue( ( catCollaborator != undefined ? catCollaborator.fullname.Value : "[Object Deleted]" ) ) );
			}
		}
	}
	tools_web.set_user_data( sKey, { participants: arrParticipants }, 86400);

	if( bNewState )
	{
		bUseWebSocket = AppConfig.GetOptProperty( 'DOTNETCORE-XHTTP' ) == '1';
		if( bUseWebSocket )
		{
			oSendMessage = { action: "set_status_participant_in_conversation", participants: arrParticipants };
			sSendMessage = tools.object_to_text( oSendMessage, 'json' );
			if ( ( tools.sys_db_capability ) == 0 )
			{
				xHttpStaticAssembly = tools.get_object_assembly( 'XHTTPMiddlewareStatic' );
				var datexAssembly = tools.get_object_assembly( 'DatexCore' );
				WebSockets = xHttpStaticAssembly.CallClassStaticMethod( 'Datex.XHTTP.WebSocketContext', 'GetWebSockets').ToArray();
				arrRecipients = get_recipients( iConversationID, teConversation ).recipients;
				sUserDataKey = 'chat_conversations_recipients';
				aRecipients = tools_web.get_user_data( sUserDataKey );
				if( aRecipients == undefined || aRecipients == null )
					aRecipients = new Array();
				else
					aRecipients = aRecipients.GetOptProperty( 'result', [] );


				for( _recipient in ArrayIntersect( aRecipients, arrRecipients, "This.person_id", "This" ) )
				{

					oSocket = ArrayOptFind( WebSockets, 'This.Key == _recipient.socket_id ' )
					if( oSocket != undefined )
					{
						try
						{
							xHttpStaticAssembly.CallClassStaticMethod( 'Datex.XHTTP.WebSocketContext', 'WriteToWebSocketMessageQueue', [ oSocket.Key , sSendMessage, true ] );
						}
						catch( err )
						{
							alert( 'chat_library.js set_status_participant_in_conversation ' + err )
						}
					}
				}
			}
			else
			{
				teCommand = OpenDocFromStr( tools.xml_header() + '<queue_sendtosocket/>' ).TopElem;
				teCommand.AddChild( 'type', 'string' ).Value = 'sendtosocket_status_participant';
				teCommand.AddChild( 'conversation_id', 'integer' ).Value = iConversationID;
				teCommand.AddChild( 'json_message', 'string' ).Value = sSendMessage;
				teCommand.AddChild( 'json_recipients', 'string' ).Value = teConversation != null ? tools.object_to_text( get_recipients( iConversationID, teConversation ).recipients, 'json' ) : null;
				tools.put_message_in_queue( 'chat-sendtosocket-queue', teCommand.GetXml( { 'tabs': false } ) );
			}
		}
	}
	alerd( 'set_status_participant_in_conversation finish' )
	return oRes;
}

/**
 * @typedef {Object} oConversationData
 * @property {string} name – название
 * @property {string} pict_url – url картинки
*/
/**
 * @function GetConversationData
 * @memberof Websoft.WT.Chat
 * @description Получить данные разговора по сотруднику.
 * @param {bigint} iConversationID - ID разговора
 * @param {bigint} iPersonID - ID сотрудника для которого строятся данные
 * @returns {oConversationData}
 */
function GetConversationData( iConversationID, iPersonID )
{
	return get_data_conversation( iConversationID, iPersonID )
}

function get_data_conversation( iConversationID, iPersonID, teConversation, feConversation )
{
	/*
		Получить название разговора для сотрудника
		iConversationID	- ID разговора
		iPersonID		- ID сотрудника
		teConversation	- TopElem разговора
		feConversation	- ForeignElem разговора
	*/

	var oRes = new Object();
	oRes.name = '';
	oRes.pict_url = '';
	try
	{
		iConversationID = Int( iConversationID )
	}
	catch( ex )
	{
		return oRes;
	}
	try
	{
		teConversation.Name;
	}
	catch( ex )
	{
		teConversation = null;
	}
	try
	{
		feConversation.id
	}
	catch( ex )
	{
		feConversation = null;
	}

	if( feConversation == null && teConversation == null )
	{
		try
		{
			teConversation = OpenDoc( UrlFromDocID( iConversationID ) ).TopElem;
		}
		catch( ex )
		{
			return oRes;
		}
	}
	var oObject = teConversation != null ? teConversation : feConversation;

	oRes.name = String( tools.get_disp_name_value( oObject ) );
	var sObjectImageUrl = '';
	if ( OptInt( oObject.resource_id ) != undefined )
	{
		sObjectImageUrl = tools_web.get_object_source_url( 'resource', oObject.resource_id );
	}
	else
	{
		sObjectImageUrl = '/images/conversation.png';
	}
	oRes.pict_url = sObjectImageUrl;

	try
	{
		iPersonID = Int( iPersonID )
	}
	catch( ex )
	{
		return oRes
	}

	var sObjectType = '';
	var oObjectType = null;
	if( feConversation != null )
	{
		sObjectType = feConversation.active_object_type;
		oObjectType = feConversation.active_object_id;
	}
	else
	{
		var oParticipant = ArrayOptFind( teConversation.participants, 'This.state_id == \'active\' && This.object_id.HasValue' );
		if( oParticipant == undefined )
			return oRes;

		sObjectType = oParticipant.object_type;
		oObjectType = oParticipant.object_id;
	}
	function get_fe_object_type()
	{
		if( OptInt( oObjectType ) == undefined )
		{
			return undefined;
		}
		return ArrayOptFirstElem( XQuery( "for $elem in " + sObjectType + "s where $elem/id = " + oObjectType + " return $elem" ) );
	}
	var feObjectType, catCollaborator, sCollaborators;
	switch( sObjectType )
	{
		case 'chat':
			feObjectType = get_fe_object_type();
			if( feObjectType != undefined && feObjectType.is_personal )
			{
				sCollaborators = String( feObjectType.collaborators );
				for( _col in ArrayExtract( sCollaborators.split( ',' ), 'OptInt( This )' ) )
				{
					if( _col != undefined && _col != iPersonID )
					{
						catCollaborator = ArrayOptFirstElem( XQuery( 'for $elem in collaborators where $elem/id = ' + _col + ' return $elem/Fields(\'fullname\')' ) )
						if( catCollaborator != undefined )
						{
							oRes.name = catCollaborator.fullname.Value;
							oRes.pict_url = tools_web.get_object_source_url( 'person', _col )
						}
						break;
					}
				}
			}
			break;
		case "learning_record":
			feObjectType = get_fe_object_type();
			if( feObjectType != undefined )
			{
				if( feObjectType.person_id != iPersonID )
				{
					oRes.name = feObjectType.person_fullname + " - " + feObjectType.proctoring_object_name;
					oRes.pict_url = tools_web.get_object_source_url( 'person', feObjectType.person_id );
				}
			}
			break;

	}
	return oRes;
}

/**
 * @typedef {Object} oConversationMessageSender
 * @property {bigint} id – ID отправителя
 * @property {string} disp_name – название отправителя
 * @property {string} icon_url – ссылка на картинку отправителя
*/
/**
 * @typedef {Object} oConversationMessageFile
 * @property {string} type – тип файла
 * @property {string} name – название файла
 * @property {string} url – ссылка на файл
*/
/**
 * @typedef {Object} oConversationMessage
 * @property {string} id – ID сообщения
 * @property {string} text – текст сообщения
 * @property {string} type_id – тип сообщения
 * @property {bigint} block_message_id – ID блока сообщения
 * @property {bigint[]} recipients – список адресатов сообщения ( для личных )
 * @property {oConversationMessageSender} sender – отправитель сообщения
 * @property {date} create_date – дата создания сообщения
 * @property {oConversationMessageFile[]} files – прикрепленные файлы
*/
/**
 * @typedef {Object} oConversationAction
 * @property {string} id – ID действия
 * @property {string} name – название действия
*/
/**
 * @typedef {Object} oConversation
 * @property {bigint} id – ID разговора
 * @property {string} name – название разговора
 * @property {oConversationAction[]} operations – разрешенные действия
 * @property {oParticipant[]} participants – участники разговора
 * @property {string} icon_url – картинка разговора
 * @property {string} format_id – формат разговора
 * @property {boolean} is_public – публичный разговор
 * @property {boolean} open_additional_info – панель дополнительной информации по умолчанию открыта
 * @property {string} object_id – ID объекта по которому создан разговор
 * @property {string} object_name – название объекта по которому создан разговор
 * @property {string} object_type – тип объекта по которому создан разговор
 * @property {string} last_unread_message – последнее сообщение в разговоре
 * @property {date} last_unread_message_date – дата последнего сообщения в разговоре
 * @property {number} message_count – количество сообщений в разговоре
 * @property {number} unread_message_count – количество непрочитанных сообщений в разговоре
 * @property {number} unread_message – количество непрочитанных сообщений в разговоре
 * @property {oConversationMessage[]} messages – сообщения разговора
*/
/**
 * @typedef {Object} oResConversation
 * @property {number} error – код ошибки
 * @property {string} message – сообщение
 * @property {oConversation[]} conversations – массив разговоров
*/
/**
 * @function GetConversations
 * @memberof Websoft.WT.Chat
 * @description Получение разговоров сотрудников.
 * @param {bigint} iPersonID - ID сотрудника
 * @param {string} [sStatus] - статус разговора
 * @param {string} [sQueryQual] - условия XQuery выборки
 * @param {date} [dLastDate|null] - дата начиная с которой учитывать сообщения
 * @param {boolean} [bSelectOnlyNewMessage|false] - записывать только новые сообщения
 * @param {bigint} [iCurrentConversationID] - ID текущего разговора
 * @param {string} [sObjectTypes|chat;chatbot_chat] - типы объектов ( через ; ) разговоры по которым вернуть
 * @param {boolean} [bShowPublic|true] - показывать публичные разговоры
 * @param {boolean} [bUpdateState|false] - обновлять статус в разговоре
 * @returns {oResConversation}
 */
function GetConversations( iPersonID, sStatus, sQueryQual, dLastDate, bSelectOnlyNewMessage, iCurrentConversationID, sObjectTypes, bShowPublic, bUpdateState )
{
	return get_conversations( iPersonID, sStatus, sQueryQual, dLastDate, bSelectOnlyNewMessage, null, iCurrentConversationID, sObjectTypes, bShowPublic, bUpdateState )
}

function get_conversations( iPersonID, sStatus, sQueryQual, dLastDate, bSelectOnlyNewMessage, Session, iCurrentConversationID, sObjectTypes, bShowPublic, bUpdateState, tePerson, oSearchParam, bLiteData, iPageSize, iLastConversationID )
{
	/*
		получение разговоров сотрудников
		iPersonID	- ID сотрудника
		sStatus		- статус разговора
		sQueryQual	- условия XQuery выборки
		dLastDate	- дата начиная с которой учитывать сообщения
		bSelectOnlyNewMessage	- записывать только новые сообщения
		Session		- сессия
		iCurrentConversationID	- ID текущего разговора
		sObjectTypes	- типы объектов ( через ; ) разговоры по которым вернуть ( chat, chatbot_chat, event, request, learning_record )
		bShowPublic	- показывать публичные разговоры
		bUpdateState	- обновлять статус в разговоре
		tePerson	- TopElem сотрудника
		oSearchParam	- параметры поиска
		bLiteData	- возвращать укороченные данные
		iPageSize	- размер страницы
		iPageNum	- номер страницы
	*/
	alerd( 'get_conversations start ')
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	oRes.more = false;
	oRes.conversations = new Array();

	try
	{
		iPageSize = Int( iPageSize )
	}
	catch( ex )
	{
		iPageSize = null;
	}
	try
	{
		iLastConversationID = Int( iLastConversationID )
	}
	catch( ex )
	{
		iLastConversationID = null;
	}
	try
	{
		iPersonID = Int( iPersonID )
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Некорректный ID сотрудника';
		alerd( 'get_conversations finish ' + oRes.message)
		return oRes;
	}
	alerd( 'get_conversations iPersonID ' + iPersonID )
	try
	{
		if( sStatus == undefined || sStatus == null  )
			throw "error";
	}
	catch( ex )
	{
		sStatus = '';
	}
	try
	{
		if( sQueryQual == undefined || sQueryQual == null  )
			throw "error";
	}
	catch( ex )
	{
		sQueryQual = '';
	}
	try
	{
		dLastDate = Date( dLastDate )
	}
	catch( ex )
	{
		dLastDate = null;
	}
	try
	{
		bSelectOnlyNewMessage = tools_web.is_true( bSelectOnlyNewMessage )
	}
	catch( ex )
	{
		bSelectOnlyNewMessage = false;
	}
	try
	{
		bShowPublic = tools_web.is_true( bShowPublic )
	}
	catch( ex )
	{
		bShowPublic = true;
	}
	try
	{
		bLiteData = tools_web.is_true( bLiteData )
	}
	catch( ex )
	{
		bLiteData = false;
	}
	try
	{
		bUpdateState = tools_web.is_true( bUpdateState )
	}
	catch( ex )
	{
		bUpdateState = false;
	}
	try
	{
		if( Session == undefined || Session == null )
			throw "error";
	}
	catch( ex )
	{
		Session = null;
	}
	try
	{
		iCurrentConversationID = Int( iCurrentConversationID )
	}
	catch( ex )
	{
		iCurrentConversationID = null
	}
	try
	{
		if( sObjectTypes == undefined || sObjectTypes == null || sObjectTypes == "" )
			throw "error";
		sObjectTypes = String( sObjectTypes );
	}
	catch( ex )
	{
		sObjectTypes = 'chat;chatbot_chat;task';
	}
	try
	{
		tePerson.Name;
	}
	catch( ex )
	{
		tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
	}
	try
	{
		if( ObjectType( oSearchParam ) != "JsObject" )
			throw "error";
	}
	catch( ex )
	{
		oSearchParam = {};
	}

	var arrCondRecipients = oSearchParam.GetOptProperty( "recipients" );
	if( !IsArray( arrCondRecipients ) )
	{
		arrCondRecipients = new Array();
	}
	arrCondRecipients.push( iPersonID );
	var aObjectTypes = sObjectTypes.split( ';' )
	var xarrBlockMessages = null;
	var xarrPersonMessages = null;

	var _person_id;
	var block_conds = new Array();
	block_conds.push( '$i/object_type = \'conversation\'' );
	for( _person_id in arrCondRecipients )
	{
		block_conds.push( 'MatchSome( $i/recipient_id, ( ' + _person_id + ' ) )' );
	}
	block_conds.push( '$i/state_id != \'hidden\'' );
	if( dLastDate != null && bSelectOnlyNewMessage )
	{
		block_conds.push( '( $i/last_message_date >= date( \'' + dLastDate + '\' ) or MatchSome( $i/unread_recipient_id, ( ' + iPersonID + ' ) ) )' );
	}
	else if( dLastDate != null )
	{
		block_conds.push( ' $i/last_message_date >= date( \'' + dLastDate + '\' ) ' );
	}
	else if( bSelectOnlyNewMessage )
	{
		block_conds.push( 'MatchSome( $i/unread_recipient_id, ( ' + iPersonID + ' ) )' );
	}
	//var pm_conds = new Array();
	
	var dLastActivityDateFrom = null;
	var dLastActivityDateTo = null;
	try
	{
		if( oSearchParam.GetOptProperty( "start_active_date", "" ) != "" )
		{
			dLastActivityDateFrom = Date( oSearchParam.GetOptProperty( "start_active_date", "" ) );
		}
	}
	catch( ex ){}
	try
	{
		if( oSearchParam.GetOptProperty( "finish_active_date", "" ) != "" )
		{
			dLastActivityDateTo = Date( oSearchParam.GetOptProperty( "finish_active_date", "" ) );
		}
	}
	catch( ex ){}

	var xarrDateBlockMessages = null;
	var xarrTempResultIds = null;
	if( dLastActivityDateFrom != null || dLastActivityDateTo != null )
	{
		var satisfies_conds = new Array();
		if( dLastActivityDateFrom != null )
		{
			satisfies_conds.push( "$elem_bm/last_message_date >= " + XQueryLiteral( dLastActivityDateFrom ) );
		}
		if( dLastActivityDateTo != null )
		{
			satisfies_conds.push( "$elem_bm/last_message_date < " + XQueryLiteral( dLastActivityDateTo ) );
		}
		xarrDateBlockMessages = XQuery( "for $elem_bm in block_messages where " + ArrayMerge( satisfies_conds, "This", " and " ) + " return $elem/Fields('object_id')" );
		if( xarrTempResultIds == null )
		{
			xarrTempResultIds = IsArray(xarrDateBlockMessages) ? ArrayExtractKeys( xarrDateBlockMessages, 'object_id' ) : [];
		}
		else
		{
			xarrTempResultIds = IsArray(xarrDateBlockMessages) && IsArray(xarrTempResultIds) ? ArrayIntersect( xarrTempResultIds, ArrayExtractKeys( xarrDateBlockMessages, 'object_id' ), "This", "This" ) : [];
		}
	}
	var or_conds = new Array();

	var bUseTempResult = false;
	var xarrTempConversations = new Array();
	if( sQueryQual != '' )
	{
		var xarrConversationByQueryQual = XQuery( "for $elem in conversations where " + StrReplace( sQueryQual, "$i", "$elem" ) + " return $elem/Fields('id')" );
		if( xarrTempResultIds == null )
		{
			xarrTempResultIds = ArrayExtractKeys( xarrConversationByQueryQual, 'id' );
		}
		else
		{
			xarrTempResultIds = ArrayIntersect( xarrTempResultIds, ArrayExtractKeys( xarrConversationByQueryQual, 'id' ), "This", "This" );
		}
		bUseTempResult = true;
	}
	if( bSelectOnlyNewMessage || dLastDate != null )
	{
		if ( (tools.sys_db_capability & tools.UNI_CAP_BASIC) != 0 )
		{
			xarrBlockMessages = ArrayDirect( XQuery( 'for $i in block_messages where ' + ArrayMerge( block_conds, 'This', ' and ' ) + ' order by $i/create_date descending return $i,$i/__data' ) );
		}
		else
		{
			xarrBlockMessages = ArrayDirect( XQuery( 'for $i in block_messages where ' + ArrayMerge( block_conds, 'This', ' and ' ) + ' order by $i/create_date descending return $i' ) );
		}
		if( ArrayOptFirstElem( xarrBlockMessages ) == undefined )
		{
			alerd( 'get_conversations finish ' + oRes.message)
			return oRes;
		}
		if( xarrTempResultIds == null )
		{
			xarrTempResultIds = ArrayExtractKeys( xarrBlockMessages, 'object_id' );
		}
		else
		{
			xarrTempResultIds = ArrayIntersect( xarrTempResultIds, ArrayExtractKeys( xarrBlockMessages, 'object_id' ), "This", "This" );
		}
		bUseTempResult = true;
	}
	
	var sUserDataKey = "list_conversations_" + iPersonID + "_" + ArrayMerge( ArraySort( aObjectTypes, "This", "+" ), "This", "-" ) + "_" + sStatus;
									  
	var aUserDataConversations = tools_web.get_user_data( sUserDataKey );

	if( aUserDataConversations == undefined || aUserDataConversations == null )
	{
		aUserDataConversations = null;
	}
	else
	{
		aUserDataConversations = aUserDataConversations.conversations;
	}
	if( aUserDataConversations == null )
	{
		if( true )
		{
			var xarrObjects = new Array();
			var bOtherObject = false;
			for( _ot in aObjectTypes )
				switch( _ot )
				{
					case 'chat':
						var chat_conds = new Array();
						for( _person_id in arrCondRecipients )
						{
							chat_conds.push( 'contains( $elem_chat/collaborators, ' + XQueryLiteral( String( _person_id ) ) + ' )' );
						}
						xarrTempConversations = ArrayUnion( xarrTempConversations, XQuery( 'for $elem in conversations where some $elem_chat in chats satisfies ( $elem/active_object_id = $elem_chat/id and ' + ArrayMerge( chat_conds, "This", " and " ) + ' ) return $elem' ) );
						break;
					case 'chatbot_chat':
						if( ArrayCount( arrCondRecipients ) == 1 )
						{
							xarrTempConversations = ArrayUnion( xarrTempConversations, XQuery( 'for $elem in conversations where some $elem_chat in chatbot_chats satisfies  ( $elem/active_object_id = $elem_chat/id and $elem_chat/person_id = ' +  iPersonID  + ' ) return $elem' ) )
						}
						break;
					case 'event':
						var event_conds = new Array();
						for( _person_id in arrCondRecipients )
						{
							event_conds.push( '$elem/collaborator_id = ' +  _person_id );
						}
						xarrObjects = ArrayUnion( xarrObjects, ArrayExtractKeys( XQuery( 'for $elem in event_collaborators where ' + ArrayMerge( event_conds, "This", " and " ) + ' return $elem/Fields(\'event_id\')' ), 'event_id' ) );// and ( $i/is_collaborator = true() or $i/is_tutor = true() )
						xarrObjects = ArrayUnion( xarrObjects, ArrayExtractKeys( XQuery( 'for $elem in event_room_collaborators where ' + ArrayMerge( event_conds, "This", " and " ) + ' return $elem/Fields(\'event_id\')' ), 'event_id' ) );// and ( $i/is_collaborator = true() or $i/is_tutor = true() )
						var lector_conds = new Array();
						for( _person_id in arrCondRecipients )
						{
							lector_conds.push( '$elem/person_id = ' +  _person_id );
						}
						xarrObjects = ArrayUnion( xarrObjects, ArrayExtractKeys( XQuery( 'for $elem in event_room_lectors where ' + ArrayMerge( lector_conds, "This", " and " ) + ' return $elem/Fields(\'event_id\')' ), 'event_id' ) );
						xarrObjects = ArrayUnion( xarrObjects, ArrayExtractKeys( XQuery( 'for $elem in event_lectors where ' + ArrayMerge( lector_conds, "This", " and " ) + ' return $elem/Fields(\'event_id\')' ), 'event_id' ) );
						arrWeninarConversationParticipants = tools.get_webinar_conversation_participants();
						if( ArrayOptFirstElem( arrWeninarConversationParticipants ) != undefined )
						{
							var arrWebinars = new Array();
							for( _webinar in arrWeninarConversationParticipants )
							{
								if( ArrayOptFind( _webinar.persons, "This == iPersonID" ) !=  undefined )
								{
									arrWebinars.push( _webinar.webinar_system_id );
								}
							}
							if( ArrayOptFirstElem( arrWebinars ) != undefined )
							{
								xarrObjects = ArrayUnion( xarrObjects, ArrayExtractKeys( XQuery( 'for $elem in events where MatchSome( $elem/webinar_system_id, ( ' +  ArrayMerge( arrWebinars, "This", "," )  + ' ) ) return $elem/Fields(\'id\')' ), 'id' ) );
								xarrObjects = ArrayUnion( xarrObjects, ArrayExtractKeys( XQuery( 'for $elem in event_rooms where MatchSome( $elem/webinar_system_id, ( ' +  ArrayMerge( arrWebinars, "This", "," )  + ' ) ) return $elem/Fields(\'id\')' ), 'id' ) );
							}
						}
						break;
					case 'task':
						var task_conds = new Array();
						for( _person_id in arrCondRecipients )
						{
							task_conds.push( 'MatchSome( $elem_task/workflow_person_id, ( ' +  _person_id  + ' ) )' );
						}
						xarrTempConversations = ArrayUnion( xarrTempConversations, XQuery( 'for $elem in conversations where some $elem_task in tasks satisfies ( $elem_task/id = $elem/active_object_id and ' + ArrayMerge( task_conds, "This", " and " ) + ' ) return $elem' ) );
						break;
					case 'request':
						req_conds = new Array();
						for( _person_id in arrCondRecipients )
						{
							req_conds.push( 'MatchSome( $elem/workflow_person_id, ( ' +  _person_id  + ' ) )' );
						}

						if( oSearchParam.GetOptProperty( "request" ) != undefined )
						{
							for( _param in oSearchParam.request )
							{
								sParamValue = String( oSearchParam.request.GetOptProperty( _param, "" ) );
								if( sParamValue == "" )
									continue;
								switch( _param )
								{
									case "my_request":
										if( tools_web.is_true( sParamValue ) )
											req_conds.push( 'MatchSome( $elem/workflow_main_person_id, ( ' +  iPersonID  + ' ) )' );
										break;
									case "search_text":
										req_conds.push( "doc-contains( $elem/id, 'wt_data', " +  XQueryLiteral( String( sParamValue ) )  + " )" );
										break;
									case "code":
										req_conds.push( "contains( $elem/code, " +  XQueryLiteral( String( sParamValue ) )  + " )" );
										break;
									case "start_create_date":
									case "finish_create_date":
										try
										{
											sParamValue = Date( sParamValue );
										}
										catch( ex )
										{
											continue;
										}
										req_conds.push( "$elem/create_date " + ( _param == "start_create_date" ? " > " : " < " ) +  XQueryLiteral( sParamValue ) );
										break;
									case "request_type_id":
										sParamValue = OptInt( sParamValue );
										if( sParamValue == undefined )
											continue
										req_conds.push( "$elem/" + _param + " = " +  sParamValue );
										break;
									default:
										req_conds.push( "$elem/" + _param + " = " +  XQueryLiteral( String( sParamValue ) ) );//status_id, workflow_state
										break;

								}
							}
						}
						xarrObjects = ArrayUnion( xarrObjects, ArrayExtractKeys( XQuery( 'for $elem in requests where ' + ArrayMerge( req_conds, "This", " and " ) + ' return $elem/Fields(\'id\')' ), 'id' ) );
						break;
					case "learning_record":
						if( ArrayCount( arrCondRecipients ) == 1 )
						{
							xarrProctoringObjects = XQuery( "for $elem in object_experts where $elem/person_id = " + iPersonID + " and $elem/type = 'proctor' return $elem" );
							xarrObjects = ArrayUnion( xarrObjects, ArrayExtractKeys( XQuery( "for $elem in learning_records where $elem/person_id = " + iPersonID + " " + ( ArrayOptFirstElem( xarrProctoringObjects ) != undefined ? " or MatchSome( $elem/proctoring_object_id, ( " + ArrayMerge( xarrProctoringObjects, "This.object_id", "," ) + "  ) )" : "" ) + " or MatchSome( $elem/proctors_id, ( " + iPersonID + " ) ) return $elem/Fields('id')" ), 'id' ) );
						}
						break;
					default:
						bOtherObject = true;
						break;
				}
			if( ArrayCount( arrCondRecipients ) == 1 )
			{
				xarrObjects.push( iPersonID );
			}
			
			if( bOtherObject )
			{
				or_conds.push( "MatchSome( $elem/participants_id, ( " + iPersonID + " ) )" );
			}
			if( bShowPublic )
			{
				or_conds.push( "$elem/is_public = true()" );
			}
			if( ArrayOptFirstElem( or_conds ) != undefined )
			{
				or_conds = [ "(" + ArrayMerge( or_conds, "This", " or " ) + ")" ];
				
			}
			
			if( ArrayOptFirstElem( xarrObjects ) != undefined )
			{
				or_conds.push( "MatchSome( $elem_qc/active_object_id, ( " + ArrayMerge( xarrObjects, "This", "," ) + " ) )" );
			}
			
			if( ArrayOptFirstElem( or_conds ) == undefined && ArrayOptFirstElem( xarrTempConversations ) == undefined )
			{
				alerd( 'get_conversations finish ' + oRes.message)
				return oRes
			}

		}

		var _or_conds, sIdent;
		
		for( _or_conds in or_conds )
		{
			sIdent = StrContains( _or_conds, "$elem_qc/" ) ? "$elem_qc" : "$elem";
			xarrTempConversations = ArrayUnion( xarrTempConversations, XQuery( "for " + sIdent + " in conversations where " + _or_conds + " return " + sIdent ) );
		}
		
		if( sStatus != "" )
		{
			xarrTempConversations = ArraySelectByKey( xarrTempConversations, sStatus, "state_id" );
		}
		aUserDataConversations = ArrayExtract( xarrTempConversations, "return ({can_show_additional_info: This.can_show_additional_info.Value, can_call: This.can_change_participant.Value,can_change_participant: This.can_change_participant.Value, prohibit_write: This.prohibit_write.Value, Name: 'conversation', name: This.name.Value, create_date: This.create_date.Value, active_object_type: This.active_object_type.Value, active_object_name: This.active_object_name.Value, active_object_id: This.active_object_id.Value, is_public: This.is_public.Value, list_css: This.list_css.Value, position_priority: This.position_priority.Value, resource_id:This.resource_id.Value, conversation_type_id: This.conversation_type_id.Value, id:This.id.Value, format_id: This.format_id.Value, active_object_type: This.active_object_type.Value, state_id: This.state_id.Value, person_org_name: This.person_org_name.Value, person_subdivision_name: This.person_subdivision_name.Value, custom_state_id: This.custom_state_id.Value, person_id: This.person_id.Value})" );
		tools_web.set_user_data( sUserDataKey, { conversations: aUserDataConversations }, 600 );
	}
	
	if( bUseTempResult )
	{
		aUserDataConversations = ArrayIntersect( aUserDataConversations, xarrTempResultIds, "This.id", "This" );
	}
	
	var conds = new Array();
	conds.push( "This.format_id != 'hidden'" );
	conds.push( 'StrContains( ",' + ArrayMerge( aObjectTypes, 'This', ',' ) + ',", "," + This.active_object_type + "," )' );
	
	var sSearchText = oSearchParam.GetOptProperty( "search_text", "" );
	/*if( oSearchParam.GetOptProperty( "search_text", "" ) != "" )
	{
		conds.push( "StrContains( This.name, " + XQueryLiteral( String( oSearchParam.GetOptProperty( "search_text", "" ) ) ) + " )" );
	}*/
	if( oSearchParam.GetOptProperty( "org_name", "" ) != "" )
	{
		conds.push( "StrContains( This.person_org_name, " + XQueryLiteral( String( oSearchParam.GetOptProperty( "org_name", "" ) ) ) + " )" );
	}
	if( oSearchParam.GetOptProperty( "subdivision_name", "" ) != "" )
	{
		conds.push( "StrContains( This.person_subdivision_name, " + XQueryLiteral( String( oSearchParam.GetOptProperty( "subdivision_name", "" ) ) ) + " )" );
	}
	if( oSearchParam.GetOptProperty( "custom_state_id", "" ) != "" )
	{
		conds.push( "This.custom_state_id == " + XQueryLiteral( String( oSearchParam.GetOptProperty( "custom_state_id", "" ) ) ) );
	}
	var iConversationTypeID = OptInt( oSearchParam.GetOptProperty( "conversation_type" ) );
	if( iConversationTypeID != undefined )
	{
		conds.push( "This.conversation_type_id == " + iConversationTypeID );
	}

	xarrConversations = ArraySelect( aUserDataConversations, ArrayMerge( conds, "This", " && " ) );
	//xarrConversations = ArraySort( xarrConversations, "This.id", "+" );
	var xarrPersonConversationState = new Array();
	var xarrHidePersonMessages = new Array();
	var xarrNewReactionPersonMessages = new Array();
	if( ArrayOptFirstElem( xarrConversations ) != undefined )
	{
		alerd("get_conversations xarrConversations ");
		if( !bLiteData )
		{
			xarrPersonMessages = ( XQuery( "for $elem_qc in person_messages where MatchSome( $elem_qc/object_id, ( " + ArrayMerge( xarrConversations, "This.id", "," ) + " ) ) and ( $elem_qc/person_id = " + iPersonID + " or $elem_qc/person_id = null() ) order by $elem_qc/message_date descending return $elem_qc/Fields('person_id','message_id','message_date','message_text','file_count','object_id','unread','conversation_state','type')" ) );
			xarrPersonMessages = ArraySort( xarrPersonMessages, "This.object_id", "+" );
			xarrPersonConversationState = ArraySelectByKey( xarrPersonMessages, "conversation_state", "type" );
			xarrHidePersonMessages = ArraySort( ArraySelectByKey( xarrPersonMessages, "hide_message", "type" ), "This.message_id", "+" );
			xarrNewReactionPersonMessages = ArraySort( ArraySelectDistinct( ArraySelectByKey( xarrPersonMessages, "new_reaction", "type" ), "This.object_id" ), "This.object_id", "+" );
			
			xarrPersonMessages = ArraySelectByKey( xarrPersonMessages, "message", "type" );
			xarrPersonMessages = ArraySelect( xarrPersonMessages, "This.unread || ArrayOptFindBySortedKey( xarrHidePersonMessages, This.message_id, 'message_id' ) == undefined" );
			var aUserGroups = null;
		}
		var arrTempConversations = null;
		var _conversation;
		var arrConversationTypes = new Array();
		var oConversationOperationData = { "cache_operations": [] };
		var catVideoChat;
		var teConversationType;
		var arrConversationPersonMessages;
		var catLastMessage, catConversationTypeData, catTempConversation, _field;
		if( !bLiteData )
		{
			arrTempConversations = new Array();
			var oTempConversation;
			for( _conversation in xarrConversations )
			{
				oTempConversation = new Object();
				oTempConversation.id = _conversation.id;
				oTempConversation.position_priority = _conversation.position_priority;
				oTempConversation.last_unread_message_date = "";
				arrConversationPersonMessages = ArraySelectBySortedKey( xarrPersonMessages, _conversation.id, "object_id" );
				iUnreadMessage = ArrayCount( ArraySelectByKey( arrConversationPersonMessages, true, "unread" ) );
				catLastMessage = ArrayOptMax( arrConversationPersonMessages, "This.message_date" );
				if( catLastMessage != undefined )
				{
					if( catLastMessage.message_text.HasValue )
					{
						oTempConversation.last_unread_message = catLastMessage.message_text.Value;
					}
					else if( catLastMessage.file_count > 0 )
					{
						oTempConversation.last_unread_message = "Файлы" + ": " + catLastMessage.file_count;
						oTempConversation.last_unread_message_is_file = true;
					}
					oTempConversation.last_unread_message_is_file = catLastMessage.file_count > 0;
					oTempConversation.last_unread_message_date = catLastMessage.message_date.Value;
				}
			
				if( oTempConversation.last_unread_message_date == "" )
				{
					oTempConversation.last_unread_message_date = _conversation.create_date;
				}
				
				//oConversation.message_count = oResMessages.count;
				oTempConversation.unread_message_count = iUnreadMessage;
				oTempConversation.unread_message = iUnreadMessage;
				arrTempConversations.push( oTempConversation );
			}
			if( iPageSize != null )
			{
				var arrTempArray = new Array();
				var bFound = iLastConversationID == null;
				var iCount = 0;
				var _elem;
				arrTempConversations = ArraySort( arrTempConversations, "This.position_priority", "-", "This.GetOptProperty( 'last_unread_message_date' )", "-" );
				for( _elem in arrTempConversations )
				{
					if( iCount >= iPageSize )
					{
						oRes.more = true;
						break;
					}
					if( _elem.id == iLastConversationID )
					{
						bFound = true;
						continue;
					}
					if( !bFound )
					{
						continue;
					}
					arrTempArray.push( _elem );
					iCount++;
				}

				xarrConversations = ArrayIntersect( xarrConversations, arrTempArray, "This.id", "This.id" );
				arrTempConversations = arrTempArray;			
			}
			arrTempConversations = ArraySort( arrTempConversations, "This.id", "+" );													
		}
		function select_block_messages( catElem )
		{
			if( catElem.object_id != oConversation.id )
				return false;

			if( bUserRole  )
			{
				for( _role_id in catElem.disp_role_id )
					if( ArrayOptFind( aUserRoles, "This == _role_id" ) != undefined )
						return true;
			}
			if( ( dLastDate == null || catElem.last_message_date > dLastDate ) )
				return true;
			return false
		}
		if( bUpdateState )
		{
			var arrUpdateState = new Array();
		}
		function get_conversation_type_data( _fe )
		{
			if( OptInt( _fe.conversation_type_id ) == undefined )
			{
				return ({topelem: null, disp_roles: []});
			}
			var catConversationType = ArrayOptFindBySortedKey( arrConversationTypes, _fe.conversation_type_id, "id" );
			if( catConversationType == undefined )
			{
				catConversationType = new Object();
				catConversationType.id = _fe.conversation_type_id;
				var doc = tools.open_doc( _fe.conversation_type_id );
				catConversationType.topelem = ( doc == undefined ? null : doc.TopElem );
				catConversationType.disp_roles = null;
				arrConversationTypes.push( catConversationType );
				arrConversationTypes = ArraySort( arrConversationTypes, "id", "+" );
			}
			return catConversationType;
		}
		
		var xarrVideoChats = XQuery( "for $elem in calls where $elem/state_id = 'active' and MatchSome( $elem/active_participants_id, ( " + iPersonID + " ) ) and MatchSome( $elem/conversation_id, ( " + ArrayMerge( xarrConversations, "This.id", "," ) + " ) ) return $elem" );
		xarrVideoChats = ArraySort( xarrVideoChats, "This.conversation_id", "+" );
		
		for( _conversation in xarrConversations )
		{
			if( bLiteData )
			{
				oConversation = new Object();
				oConversation.id = _conversation.id;
				oConversation.name = _conversation.name;
				if( sSearchText != "" && !StrContains( oConversation.name, sSearchText, true ) )
				{
					continue;
				}
				oConversation.state_id = _conversation.state_id;

				oConversation.position_priority = 0;
				catVideoChat = ArrayOptFindBySortedKey( xarrVideoChats, _conversation.id, "conversation_id" );
				oConversation.active_call = catVideoChat != undefined;
				oConversation.list_css = "";
				sObjectImageUrl = '';
				if ( _conversation.resource_id != "" )
					sObjectImageUrl = tools_web.get_object_source_url( 'resource', _conversation.resource_id );
				else
					sObjectImageUrl = '/images/conversation.png';
				oConversation.icon_url = sObjectImageUrl;
				oRes.conversations.push( oConversation );

			}
			else
			{

				oConversation = new Object();
				oConversation.id = _conversation.id;
				oConversation.state_id = _conversation.state_id;
				/*docConversation = tools.open_doc( _conversation.id );
				if( docConversation == undefined )
				{
					continue;
				}

				teConversation = docConversation.TopElem;*/
				oDataConversation = get_data_conversation( _conversation.id, iPersonID, null, _conversation );
				oConversation.name = oDataConversation.name;
				if( sSearchText != "" && !StrContains( oConversation.name, sSearchText, true ) )
				{
					continue;
				}
				catVideoChat = ArrayOptFindBySortedKey( xarrVideoChats, _conversation.id, "conversation_id" );
				oConversation.active_call = catVideoChat != undefined;
				catConversationState = ArrayOptFindBySortedKey( xarrPersonConversationState, _conversation.id, "object_id" );
				oConversation.conversation_state = ( catConversationState != undefined ? catConversationState.conversation_state.Value : "" );
				catConversationTypeData = get_conversation_type_data( _conversation );

				oConversationOperationData = get_operations_conversation( _conversation.id, iPersonID, _conversation, null, catConversationTypeData.topelem, false, oConversationOperationData.cache_operations, false );

				oConversation.open_additional_info = false;
				if( catConversationTypeData.topelem != null )
				{
					oConversation.open_additional_info = catConversationTypeData.topelem.open_additional_info.Value;
				}
				//oConversation.actions = oConversationOperationData.actions;

				if( ArrayOptFind( oConversationOperationData.operations, "This.id == 'use_priority_and_list_css'" ) != undefined )
				{
					oConversation.position_priority = OptInt( _conversation.position_priority, 0 );
					oConversation.list_css = _conversation.list_css;
				}
				oConversation.disp_roles = new Array();

				/*sKey = "participants_state_in_conversation_" + _conversation.id;
				oState = tools_web.get_user_data( sKey );

				if( oState == null || oState == undefined )
				{
					arrParticipants = new Array();
				}
				else
				{
					arrParticipants = oState.participants;
				}

				oConversation.participants = arrParticipants;*/

				oConversation.icon_url = oDataConversation.pict_url;

				oConversation.format_id = _conversation.format_id;
				oConversation.is_public = _conversation.is_public;
				oConversation.object_id = _conversation.active_object_id;
				oConversation.object_name = _conversation.active_object_name;
				oConversation.object_type = _conversation.active_object_type;

				oConversation.last_unread_message = "";
				oConversation.last_unread_message_date = "";

				aUserRoles = new Array();
				if( catConversationTypeData.disp_roles == null )
				{
					for( _disp_role in oConversationOperationData.disp_roles )
					{
						try
						{
							tePerson.Name
						}
						catch( ex )
						{
							tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
						}
						if( aUserGroups == null )
						{
							aUserGroups = ArrayExtract( XQuery( "for $elem in group_collaborators where $elem/collaborator_id = " + iPersonID + "  return $elem/Fields( 'group_id' )" ), "This.group_id.Value" );
						}
						if( check_access_role( _disp_role.access, iPersonID, tePerson, aUserGroups ) )
						{
							aUserRoles.push( _disp_role.id.Value );
							oConversation.disp_roles.push( { id: _disp_role.id.Value, name: _disp_role.name.Value } );
						}
					}
					catConversationTypeData.disp_roles = oConversation.disp_roles;
				}
				else
				{
					oConversation.disp_roles = catConversationTypeData.disp_roles;
				}
				//bUserRole = ArrayOptFirstElem( aUserRoles ) != undefined;
				oConversation.SetProperty( "new_reaction", ArrayOptFindBySortedKey( xarrNewReactionPersonMessages, _conversation.id, "object_id" ) != undefined );
				catTempConversation = ArrayOptFindBySortedKey( arrTempConversations, _conversation.id, "id" );
				if( catTempConversation != undefined )
				{
					for( _field in catTempConversation )
					{
						oConversation.SetProperty( _field, catTempConversation.GetProperty( _field ) );
					}
				}
				oRes.conversations.push( oConversation );
			}
		}
		oRes.conversations = ArraySort( oRes.conversations, "This.position_priority", "-", "This.GetOptProperty( 'last_unread_message_date' )", "-" );
		if( bUpdateState )
		{
			var teCommand = OpenDocFromStr( tools.xml_header() + '<queue_set_status_participant_in_conversation/>' ).TopElem;
			teCommand.AddChild( 'type', 'string' ).Value = 'set_status_participant_in_conversation';
			teCommand.AddChild( 'conversations_id', 'string' ).Value = EncodeJson( ArrayExtract( xarrConversations, "RValue( This.id )" ) );
			teCommand.AddChild( 'json_participant_states', 'string' ).Value = EncodeJson( [ { participant_id: iPersonID, state: 'online' } ] );
			tools.put_message_in_queue( 'chat-sendtosocket-queue', teCommand.GetXml( { 'tabs': false } ) );
		}
	}

	alerd( 'get_conversations finish ')
	return oRes
}
function get_recipient_object( iRecipientID, arrRecipientObjects )
{
	try
	{
		if( !IsArray( arrRecipientObjects ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		arrRecipientObjects = new Array();
	}
	var oRes = new Object();
	oRes.recipient_objects = arrRecipientObjects;
	oRes.ro = ArrayOptFind( oRes.recipient_objects, 'This.id == ' + iRecipientID );

	if( oRes.ro == undefined )
	{
		oRes.ro = new Object();
		oRes.ro.id = iRecipientID;
		try
		{
			teObject = OpenDoc( UrlFromDocID( Int( iRecipientID ) ) ).TopElem;
			sObjectImageUrl = '';
			switch( teObject.Name )
			{
				case 'collaborator':
					sObjectImageUrl = tools_web.get_object_source_url( 'person', iRecipientID )
					break;
				default:
					if ( teObject.ChildExists( 'resource_id' ) && teObject.resource_id.HasValue )
						sObjectImageUrl = tools_web.get_object_source_url( 'resource', teObject.resource_id );
					else
						sObjectImageUrl = '/images/' + teObject.Name + '.png';
			}
			oRes.ro.icon_url = sObjectImageUrl;
			oRes.ro.type = teObject.Name;
			oRes.ro.disp_name = RValue( tools.get_disp_name_value( teObject ) );
			if( oRes.ro.disp_name == "" && teObject.ChildExists( "name" ) )
			{
				oRes.ro.disp_name = teObject.name.Value;
			}
		}
		catch( ex )
		{
			oRes.ro.icon_url = "";
			oRes.ro.disp_name = global_settings.object_deleted_str.Value;
		}

		oRes.recipient_objects.push( oRes.ro );
	}

	return oRes;
}
/**
 * @typedef {Object} oResConversationMessage
 * @property {number} error – код ошибки
 * @property {string} message – сообщение
 * @property {number} count – количество сообщений
 * @property {number} unread_count – количество непрочитанных сообщений
 * @property {date} last_unread_message_date – дата последнего сообщения
 * @property {string} last_unread_message – последнее сообщение
 * @property {oConversationMessage[]} conversations – массив сообщений
*/
/**
 * @function GetConversationMessages
 * @memberof Websoft.WT.Chat
 * @description Получение списка сообщений разговора для сотрудника.
 * @param {bigint} iConversationID - ID разговора
 * @param {bigint} iPersonID - ID сотрудника
 * @param {number} [iPageNum] - номер страницы с сообщениями
 * @param {number} [iPageSize] - количество сообщений на странице
 * @param {boolean} [bCheckUnreadMessage] - проставлять статус прочитано у непрочитанных сообщений
 * @param {date} [dLastMessageDate] - дата после которой нужны сообщения
 * @param {boolean} [bSelectOnlyUnreadMessage|false] - записывать только непрочитанные сообщения
 * @returns {oResConversationMessage}
 */
function GetConversationMessages( iConversationID, iPersonID, iPageNum, iPageSize, bCheckUnreadMessage, dLastMessageDate, bSelectOnlyUnreadMessage )
{
	return get_conversation_messages( iConversationID, iPersonID, null, null, null, iPageNum, iPageSize, bCheckUnreadMessage, null, dLastMessageDate, bSelectOnlyUnreadMessage )
}

function get_conversation_messages( iConversationID, iPersonID, Session, teConversation, tePerson, iPageNum, iPageSize, bCheckUnreadMessage, xarrBlockMessages, dLastMessageDate, bSelectOnlyUnreadMessage, oConversationOperationData, aUserRoles, bFullAccess, sUpMessageID, sSearchText, bReturnAllMessage )
{
	/*
		получение списка сообщений разговора для сотрудника
		iConversationID - ID разговора
		iPersonID		- ID сотрудника
		Session			- сессия
		teConversation	- TopElem разговора
		tePerson		- TopElem сотрудника
		iPageNum		- номер страницы с сообщениями
		iPageSize		- количество сообщений на странице
		bCheckUnreadMessage - проставлять статус прочитано у непрочитанных сообщений
		xarrBlockMessages	- список блоков сообщений ( при необходимости )
		dLastMessageDate	- дата после которой нужны сообщения
		bSelectOnlyUnreadMessage	- записывать только непрочитанные сообщения
		oConversationOperationData	- результат get_operations_conversation
		aUserRoles		- роли сотрудника в разговоре
		bFullAccess		- полный доступ к сообщениям разговора
		sUpMessageID	- id верхнего сообщения
		sSearchText		- строка для поиска
		bReturnAllMessage	- возвращать все сообщения с начала списка
	*/
	alerd( 'get_conversation_messages start ')
	var oRes = new Object();
	oRes.message = '';
	oRes.error = 0;
	oRes.count = 0;
	oRes.unread_count = 0;
	oRes.messages = new Array();
	oRes.last_unread_message_date = null;
	oRes.last_unread_message = null;
	oRes.last_unread_message_is_file = false;
	oRes.last_page = true;

	try
	{
		iConversationID = Int( iConversationID )
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Некорректный ID разговора';
		alerd( 'get_conversation_messages finish ' + oRes.message)
		return oRes;
	}
	try
	{
		teConversation.Name;
	}
	catch( ex )
	{
		teConversation = OpenDoc( UrlFromDocID( iConversationID ) ).TopElem;
	}
	alerd( 'get_conversation_messages  ' + iConversationID )
	try
	{
		iPersonID = Int( iPersonID )
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Некорректный ID сотрудника';
		alerd( 'get_conversation_messages finish ' + oRes.message)
		return oRes;
	}
	try
	{
		tePerson.Name;
	}
	catch( ex )
	{
		tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
	}

	try
	{
		iPageNum = Int( iPageNum )
	}
	catch( ex )
	{
		iPageNum = 1;
	}

	try
	{
		iPageSize = Int( iPageSize )
	}
	catch( ex )
	{
		iPageSize = 100;
	}
	
	try
	{
		if( bCheckUnreadMessage == undefined || bCheckUnreadMessage == null )
		{
			throw "error";
		}
		bCheckUnreadMessage = tools_web.is_true( bCheckUnreadMessage );
	}
	catch( ex )
	{
		bCheckUnreadMessage = false;
	}
	try
	{
		if( bReturnAllMessage == undefined || bReturnAllMessage == null )
		{
			throw "error";
		}
		bReturnAllMessage = tools_web.is_true( bReturnAllMessage );
	}
	catch( ex )
	{
		bReturnAllMessage = false;
	}
	try
	{
		if( bSelectOnlyUnreadMessage == undefined || bSelectOnlyUnreadMessage == null )
		{
			throw "error";
		}
		bSelectOnlyUnreadMessage = tools_web.is_true( bSelectOnlyUnreadMessage );
	}
	catch( ex )
	{
		bSelectOnlyUnreadMessage = false;
	}
	try
	{
		if( sUpMessageID == undefined || sUpMessageID == null )
			throw "error";
	}
	catch( ex )
	{
		sUpMessageID = "";
	}

	try
	{
		Session;
	}
	catch( ex )
	{
		Session = null;
	}
	try
	{
		oConversationOperationData.GetProperty( "disp_roles" );
	}
	catch( ex )
	{
		try
		{
			iConversationID = Int( iConversationID )
		}
		catch( ex )
		{
			return false;
		}
		oConversationOperationData = get_operations_conversation( iConversationID, iPersonID, teConversation, tePerson, null, false );
	}

	try
	{
		if( !IsArray( aUserRoles ) )
			throw "error";
	}
	catch( ex )
	{

		aUserRoles = new Array();
		var aUserGroups = null;
		for( _disp_role in oConversationOperationData.disp_roles )
		{
			if( aUserGroups == null )
				aUserGroups = ArrayExtract( XQuery( "for $i in group_collaborators where $i/collaborator_id = " + iPersonID + "  return $i/Fields( 'group_id' )" ), "This.group_id.Value" );
			if( check_access_role( _disp_role.access, iPersonID, tePerson, aUserGroups ) )
				aUserRoles.push( _disp_role.id.Value );
		}
	}

	
	arrRecipientObjects = new Array();

	try
	{
		dLastMessageDate = Date( dLastMessageDate );
	}
	catch( ex )
	{
		dLastMessageDate = null;
	}
	try
	{
		if( bFullAccess == undefined || bFullAccess == null )
			throw "error";
		bFullAccess = tools_web.is_true( bFullAccess );
	}
	catch( ex )
	{
		bFullAccess = false;
		catActiveParticipant = ArrayMax( ArraySelect( teConversation.participants, 'This.state_id==\'active\'' ), 'This.create_date' );
		switch( catActiveParticipant.object_type )
		{
			case "event":
				feObject = catActiveParticipant.object_id.OptForeignElem;
				if( feObject != undefined )
				{
					feEventType = feObject.event_type_id.OptForeignElem;
					if( feEventType != undefined && feEventType.online && feObject.webinar_system_id.HasValue )
					{
						arrWeninarConversationParticipants = tools.get_webinar_conversation_participants();
						if( ArrayOptFirstElem( arrWeninarConversationParticipants ) != undefined )
						{
							arrWebinars = new Array();
							for( _webinar in ArraySelect( arrWeninarConversationParticipants, "This.webinar_system_id == feObject.webinar_system_id" ) )
							{
								if( ArrayOptFind( _webinar.persons, "This == iPersonID" ) !=  undefined )
								{
									bFullAccess = true;
									break;
								}
							}

						}
					}
				}
				break;
		}

	}
	var bSearch = false;
	try
	{
		if( sSearchText == undefined || sSearchText == null || sSearchText == "" )
		{
			throw "error";
		}
		bSearch = true;
	}
	catch( ex ){}
	try
	{
		if( ArrayOptFirstElem( xarrBlockMessages ) == undefined )
			throw '';
	}
	catch( ex )
	{
		conds = new Array();
		conds.push( '$i/object_id = ' + iConversationID );
		conds.push( '$i/state_id != \'hidden\'' );
		if( bSearch )
		{
			bm_conds.push( "doc-contains( $i/id, 'wt_data', " +  XQueryLiteral( String( sSearchText ) )  + " )" );
		}
		if( bSelectOnlyUnreadMessage )
			conds.push( 'MatchSome( $i/unread_recipient_id, ( ' + iPersonID + ' ) ) ' )
		else if( !bFullAccess && !teConversation.is_public && teConversation.format_id != "channel" )
			conds.push( ' ( MatchSome( $i/recipient_id, ( ' + iPersonID + ' ) ) ' + ( ArrayCount( aUserRoles ) > 0 ? " or MatchSome( $i/disp_role_id, ( " + ArrayMerge( aUserRoles, "XQueryLiteral( This )", "," ) + " ) )" : "" ) + " ) " )
		if( dLastMessageDate != null )
			conds.push( '$i/last_message_date >= ' + XQueryLiteral( dLastMessageDate ) )
		xarrBlockMessages = XQuery( 'for $i in block_messages where ' + ArrayMerge( conds, 'This', ' and ' ) + ' order by $i/create_date descending return $i' )
	}
	var bFoundUpMessage = false;
	if( ArrayOptFirstElem( xarrBlockMessages ) != undefined )
	{
		var iCnt = 0;
		var iUnreadMessage = 0;
		var iCurrentMessage = 0;
		var iStartMessage = iPageSize*( iPageNum - 1 ) + 1;
		var iFinishMessage = iPageSize*iPageNum;
		var bBreak = false;
		var iUserMessage = 0;
		var arrReadMessages = new Array();
		var catRecipient, oMessage;
		var oResRecipientObject;
		var oResCacheData = new Object();
		oResCacheData.recipient_objects = new Array();
		var oTempData;
		var bAddCount = true;
		for( _bm in ArraySort( xarrBlockMessages, 'This.create_date', '-' ) )
		{
			if( _bm.count_message == 0 )
			{
				continue;
			}

			docBlockMessage = OpenDoc( UrlFromDocID( _bm.id ) );
			teBlockMessage = docBlockMessage.TopElem;
			aUserMessages = teBlockMessage.messages;
			
			if( bSearch )
			{
				aUserMessages = ArraySelect( aUserMessages, "StrContains( This.text, sSearchText, true )" );
			}

			if( !bFullAccess )
			{
				aUserMessages = ArraySelect( aUserMessages, 'check_user_access_message( This, iPersonID, tePerson, iConversationID, teConversation, oConversationOperationData, aUserRoles )' );
			}
			else
			{
				aUserMessages = ArraySelect( aUserMessages, "This.state_id != 'hide'" );
			}
			iUserMessage = ArrayCount( aUserMessages );
			if( ( sUpMessageID != "" ? ( !bFoundUpMessage && ArrayOptFindByKey( aUserMessages, sUpMessageID, "id" ) == undefined ) : ( iStartMessage > ( iCurrentMessage + iUserMessage ) ) ) )
			{
				iCurrentMessage += iUserMessage;
				if( !bSelectOnlyUnreadMessage && dLastMessageDate == null && !bReturnAllMessage )
				{
					continue;
				}
			}

			bNeedSave = false;
			
			for( _message in ArraySort( aUserMessages, 'This.ChildIndex', '-' ) )
			{
				if( oRes.last_unread_message_date == null )
				{
					oRes.last_unread_message_date = _message.create_date.Value;
					if( _message.text.HasValue )
					{
						oRes.last_unread_message = _message.text.Value;
					}
					else if( ArrayOptFirstElem( _message.files ) != undefined )
					{
						oRes.last_unread_message = "Файлы" + ": " + ArrayCount( _message.files );
						oRes.last_unread_message_is_file = true;
					}
				}

				_unread_recipient = ArrayOptFind( _message.recipients, 'This.person_id == iPersonID && This.state_id == \'not_read\'' );
				if( bSelectOnlyUnreadMessage && ( _unread_recipient == undefined && ( dLastMessageDate == null || _message.create_date < dLastMessageDate ) ) )
					continue;

				iCurrentMessage++;

				if( ( sUpMessageID != "" ? ( !bFoundUpMessage ) : ( iStartMessage > iCurrentMessage ) ) )
				{
					if( sUpMessageID != "" && _message.id == sUpMessageID )
					{
						bFoundUpMessage = true;
					}
					if( !bReturnAllMessage )
					{
						continue;
					}
					else
					{
						bAddCount = false;
					}
				}
				else
				{
					bAddCount = true;
				}

				if( dLastMessageDate != null && dLastMessageDate > _message.create_date )
				{
					if( _unread_recipient != undefined )
						iUnreadMessage++;
					continue;
				}
				else if( _unread_recipient != undefined )
				{
					iUnreadMessage++;
				}

				if( !bSelectOnlyUnreadMessage && iCnt >= iPageSize )
				{
					bBreak = true;
					break;
				}

				oMessage = new Object();
				oMessage.id = _message.id.Value;
				oMessage.text = tools_web.convert_bbcode_to_html( _message.text.Value );
				oMessage.type_id = _message.type_id.Value;
				oMessage.state_id = _message.state_id.Value;
				oMessage.block_message_id = _bm.id.Value;
				if( _message.object_id.HasValue )
				{
					oResRecipientObject = get_recipient_object( _message.object_id.Value, oResCacheData.recipient_objects );
					oResCacheData.recipient_objects = oResRecipientObject.recipient_objects;
					oMessage.sender = oResRecipientObject.ro;
				}
				else
				{
					oMessage.sender = ({});
				}
				oMessage.create_date = _message.create_date.Value;
				oMessage.edit_date = _message.edit_date.Value;
				oMessage.message_state_id = ( ArrayOptFindByKey( _message.recipients, "not_read", "state_id" ) == undefined ? "read" : "not_read" );
				catRecipient = _message.recipients.GetOptChildByKey( iPersonID );
				oMessage.recipient_state_id = ( catRecipient != undefined ? catRecipient.state_id.Value : "" );
				oMessage.recipients = [];
				if( oMessage.type_id == 'personal' )
					oMessage.recipients = ArrayExtract( _message.recipients, 'This.person_id.Value' );
				oMessage.disp_roles = ArrayExtract( _message.disp_roles, 'This.id.Value' );
				try
				{
					if( _message.data.HasValue )
					{
						CheckMessageData( _message.data, oMessage );
					}
				}
				catch( ex ){}

				oMessage.files = new Array();
				for( _file in _message.files )
				{
					feFile = _file.file_id.OptForeignElem;
					if( feFile == undefined )
						continue;
					oMessage.files.push( { id: _file.file_id.Value, type: feFile.type.Value, name: feFile.name.Value, url: tools_web.get_resource_url( _file.file_id, Session ) } );
				}

				if( bCheckUnreadMessage && _unread_recipient != undefined )
				{
					arrReadMessages.push( { id: _message.id.Value, block_message_id: _bm.id.Value } );
					//_unread_recipient.state_id = 'read';
					//bNeedSave = true;
				}
				
				oTempData = get_reply_message_data( _message, iConversationID, oResCacheData );
				oResCacheData = oTempData.cache_data;
				oMessage.reply = oTempData.reply_message_data;
				oTempData = get_forward_message_data( _message, iConversationID, oResCacheData );
				oResCacheData = oTempData.cache_data;
				oMessage.forward = oTempData.forward_message_data;
				
				oMessage.reactions = [];
				oRes.messages.push( oMessage );
				if( bAddCount )
				{
					iCnt++;
				}
			}

			/*if( ArrayOptFirstElem( arrReadMessages ) != undefined )
			{
				read_conversation_messages_queue( arrReadMessages, iConversationID, iPersonID );
			}*/

			if( bBreak )
				break;
		}
		var xarrLikes = XQuery( "for $elem in likes where $elem/object_id = " + iConversationID + " and $elem/type_id = 'reaction' and MatchSome( $elem/message_id, (" + ArrayMerge( oRes.messages, "XQueryLiteral( This.id )", "," ) + ") ) return $elem/Fields('reaction','message_id','person_id')" );
		xarrLikes = ArraySort( xarrLikes, "This.message_id", "+" );
		var arrTempArray;
		for( _message in oRes.messages )
		{
			arrTempArray = ArraySelectBySortedKey( xarrLikes, _message.id, "message_id" );
			arrTempArray = ArraySort( arrTempArray, "This.reaction", "+" );
			_message.reactions = ArrayExtract( ArraySelectDistinct( arrTempArray, "This.reaction" ), "return ({reaction_id: This.reaction.Value,reaction_count: ArrayCount( ArraySelectBySortedKey(arrTempArray,This.reaction,'reaction') )});" )
			catMyReaction = ArrayOptFindByKey( arrTempArray, iPersonID, "person_id" );
			_message.my_reaction = ( catMyReaction == undefined ? "" : catMyReaction.reaction.Value );
		}
		if( ArrayOptFirstElem( arrReadMessages ) != undefined )
		{
			read_conversation_messages_queue( arrReadMessages, iConversationID, iPersonID );
		}
		oRes.last_page = !bBreak;
		oRes.count = iCnt;
		oRes.unread_count = iUnreadMessage;
	}
	//alert( tools.object_to_text( oRes, 'json' ) )
	alerd( 'get_conversation_messages finish ' + oRes.message)
	return oRes
}
/**
 * @typedef {Object} oResConversationOperation
 * @property {number} error – код ошибки
 * @property {string} message – сообщение
 * @property {oConversationAction[]} operations – разрешенные действия
 * @property {boolean} is_boss – руководитель
 * @property {string} type – тип сотрудника
*/
/**
 * @function GetConversationOperations
 * @memberof Websoft.WT.Chat
 * @description Получение операций сотрудника по разговорам.
 * @param {bigint} iPersonID - ID сотрудника
 * @param {bigint} [iConversationID] - ID разговора
 * @returns {oResConversationOperation}
 */
function GetConversationOperations( iPersonID, iConversationID )
{
	return get_operations_conversation( iConversationID, iPersonID, null, null, null )
}

function get_operations_conversation( iConversationID, iPersonID, teConversation, tePerson, teConversationType, bUserRecipients, arrCacheOperations, bCheckProhibitions )
{
	/*
		получение операций сотрудника по разговорам
		iConversationID - ID разговора
		iPersonID		- ID сотрудника
		teConversation	- TopElem разговора
		tePerson		- TopElem сотрудника
		teConversationType	- TopElem типа разговора
		bUserRecipients	- пользователь является участником разговора
	*/
	function add_operations( xarr )
	{
		var oOperation;
		for( _operation in xarr )
		{
			oOperation = { id: _operation.action.Value, name: _operation.name.Value, action: !_operation.operation_type.Value };
			switch( oOperation.id )
			{
				case "prohibition_to_write_messages":
					oOperation.SetProperty( "middle_action", "get_allow_to_write_participants" );
					break;
				case "allow_to_write_messages":
					oOperation.SetProperty( "middle_action", "get_prohibition_to_write_participants" );
					break;
				case "add_participant_conversation":
					oOperation.SetProperty( "middle_action", "get_collaborators" );
					break;
				case "del_participant_conversation":
					oOperation.SetProperty( "middle_action", "get_participants_conversation" );
					break;
			}
			oRes.operations.push( oOperation );
		}
	}
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = "";
	oRes.is_boss = false;
	oRes.type = global_settings.settings.conversation_visible_type_id.Value;
	oRes.operations = new Array();
	oRes.disp_roles = new Array();
	oRes.recipients = new Array();
	oRes.conversation_top_elem = null;

	var iCurTicks = GetCurTicks();
	try
	{
		if( !IsArray( arrCacheOperations ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		arrCacheOperations = new Array();
	}
	oRes.cache_operations = arrCacheOperations;

	try
	{
		iConversationID = OptInt( iConversationID, null )
	}
	catch( ex )
	{
		iConversationID = null;
	}

	try
	{
		teConversation.Name;
		if( teConversation == null || teConversation == '' )
			throw 'error'
	}
	catch( ex )
	{
		if( iConversationID != null )
		{
			teConversation = OpenDoc( UrlFromDocID( iConversationID ) ).TopElem;
		}
	}
	oRes.conversation_top_elem = teConversation;
	try
	{
		if( bUserRecipients == undefined || bUserRecipients == null || bUserRecipients == "" )
		{
			throw 'error';
		}
		bUserRecipients = tools_web.is_true( bUserRecipients );
	}
	catch( ex )
	{
		bUserRecipients = true;
	}
	try
	{
		if( bCheckProhibitions == undefined || bCheckProhibitions == null || bCheckProhibitions == "" )
		{
			throw 'error';
		}	
		bCheckProhibitions = tools_web.is_true( bCheckProhibitions );
	}
	catch( ex )
	{
		bCheckProhibitions = true;
	}
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Некорректный ID сотрудника';
		return oRes;
	}
	var catCacheOperation;
	var xarrOperations = new Array();
	var arrOperations = new Array();
	if( iConversationID != null )
	{
		if( bUserRecipients )
		{
			oRes.recipients = get_recipients( iConversationID, teConversation ).recipients;

			if( ArrayOptFind( oRes.recipients, 'This == iPersonID' ) == undefined && !teConversation.is_public )
			{
				oRes.error = 403;
				oRes.message = 'Сотрудник не является участником разговора';
				return oRes;
			}
		}
	}
	if( iConversationID != null && teConversation.state_id == 'close' )
	{
		if( iConversationID != null && OptInt( teConversation.conversation_type_id ) != undefined )
		{
			catCacheOperation = ArrayOptFindBySortedKey( oRes.cache_operations, teConversation.conversation_type_id, "id" );
			if( catCacheOperation != undefined )
			{
				oRes.disp_roles = catCacheOperation.disp_roles;
			}
			else
			{
				try
				{
					teConversationType.Name
				}
				catch( ex )
				{
					try
					{
						teConversationType = OpenDoc( UrlFromDocID( teConversation.conversation_type_id ) ).TopElem;
					}
					catch( ex )
					{
						return oRes;
					}
				}

				oRes.disp_roles = teConversationType.disp_roles;
				oRes.type = teConversationType.visible_type_id.Value;
			}
		}
		return oRes;
	}
	if( iConversationID != null )
	{
		if( !teConversation.prohibit_write )
		{
			if( ( !bCheckProhibitions || ( teConversation.ChildExists( "prohibitions" ) && ArrayOptFind( teConversation.prohibitions, "This.person_id == iPersonID && This.type_id == 'prohibition_to_write'" ) == undefined ) ) )
			{
				oRes.operations.push( { id: 'write_message', name: '', action: false } );
			}
		}
		if( ObjectType( teConversation ) == "XmElem" && teConversation.ChildExists( "participants" ) )
		{
			catParticipant = ArrayOptFind( teConversation.participants, "This.state_id == 'active'" );
		}
		else
		{
			catParticipant = ( { object_id: teConversation.active_object_id, object_type: teConversation.active_object_type } );
		}
		if( teConversation.can_change_participant )
		{
			if( catParticipant != undefined )
			{

				switch( catParticipant.object_type )
				{
					case "chat":
						catAddOperation = common.operation_types.GetOptChildByKey( 'add_participant_conversation' );
						if( catAddOperation != undefined )
							oRes.operations.push( { id: catAddOperation.id.Value, name: catAddOperation.name.Value, action: true, middle_action: "get_collaborators" } );
						catAddOperation = common.operation_types.GetOptChildByKey( 'del_participant_conversation' );
						if( catAddOperation != undefined )
							oRes.operations.push( { id: catAddOperation.id.Value, name: catAddOperation.name.Value, action: true, middle_action: "get_participants_conversation" } );
						break;
					case "event":
						var xarrBossTypes = tools.get_object_relative_boss_types( iPersonID, catParticipant.object_id );
						xarrOperations = tools.get_relative_operations_by_boss_types(xarrBossTypes);
						xarrOperations = ArraySelect(xarrOperations, "This.operation_catalog_list.HasValue && ( StrContains(','+This.operation_catalog_list.Value+',', ',conversation,') )");
						add_operations( xarrOperations );
						break;

					default:
						catConversationObjectType = common.conversation_object_types.GetOptChildByKey( catParticipant.object_type );
						if( catConversationObjectType == undefined || catConversationObjectType.is_fix_participants )
						{
							catAddOperation = common.operation_types.GetOptChildByKey( 'add_object_participant_conversation' );
							if( catAddOperation != undefined )
								oRes.operations.push( { id: catAddOperation.id.Value, name: catAddOperation.name.Value, action: true, middle_action: "get_collaborators" } );
							catAddOperation = common.operation_types.GetOptChildByKey( 'del_object_participant_conversation' );
							if( catAddOperation != undefined )
								oRes.operations.push( { id: catAddOperation.id.Value, name: catAddOperation.name.Value, action: true, middle_action: "get_participants_conversation" } );
						}
						break;

				}
			}
		}
		if( teConversation.can_show_additional_info )
		{
			catAddOperation = common.operation_types.GetOptChildByKey( 'additional_info' );
			if( catAddOperation != undefined )
			{
				oRes.operations.push( { id: catAddOperation.id.Value, name: catAddOperation.name.Value, action: true } );
			}
		}
		if( teConversation.can_call )
		{
			catAddOperation = common.operation_types.GetOptChildByKey( 'can_call' );
			if( catAddOperation != undefined )
			{
				oRes.operations.push( { id: catAddOperation.id.Value, name: catAddOperation.name.Value, action: true } );
			}
		}
		if( ( teConversation.format_id == 'chat' || teConversation.format_id == 'channel' || teConversation.format_id == 'group' ) )
		{
			catAddOperation = common.operation_types.GetOptChildByKey( 'show_conversation_participant' );
			if( catAddOperation != undefined )
			{
				oRes.operations.push( { id: catAddOperation.id.Value, name: catAddOperation.name.Value, action: true, middle_action: "get_participants_conversation" } );
			}
		}
	}
	
	xarrOperations = new Array();
	if( iConversationID != null && OptInt( teConversation.conversation_type_id ) != undefined )
	{
		catCacheOperation = ArrayOptFindBySortedKey( oRes.cache_operations, teConversation.conversation_type_id, "id" );
		if( catCacheOperation != undefined )
		{
			xarrOperations = catCacheOperation.xarr_operations;
			oRes.disp_roles = catCacheOperation.disp_roles;
		}
		else
		{
			try
			{
				teConversationType.Name
			}
			catch( ex )
			{
				try
				{
					teConversationType = OpenDoc( UrlFromDocID( teConversation.conversation_type_id ) ).TopElem;
				}
				catch( ex )
				{
					oRes.operations = ArraySelectDistinct( oRes.operations, "This.id" );
					return oRes;
				}
			}

			oRes.disp_roles = teConversationType.disp_roles;
			oRes.type = teConversationType.visible_type_id.Value;

			var _child = teConversationType.func_managers.GetOptChildByKey( iPersonID );
			if( _child != undefined && _child.boss_type_id.HasValue )
			{
				oRes.is_boss = true;
				var feBossType = _child.boss_type_id.OptForeignElem;
				if( feBossType != undefined )
				{
					arrOperations = ArrayUnion( arrOperations, feBossType.operation_id );
				}
			}
			catCacheOperation = new Object();
			catCacheOperation.id = RValue( teConversation.conversation_type_id );
			catCacheOperation.disp_roles = oRes.disp_roles;
			catCacheOperation.xarr_operations = ArrayOptFirstElem( arrOperations ) != undefined ? ArrayDirect( XQuery( 'for $elem in operations where MatchSome( $elem/id, ( ' + ArrayMerge( arrOperations, 'This', ',' ) + ' ) ) and contains( $elem/operation_catalog_list, ( \'conversation\' ) ) return $elem' ) ) : [];
			xarrOperations = ArrayUnion( xarrOperations, catCacheOperation.xarr_operations );
			oRes.cache_operations.push( catCacheOperation );
			oRes.cache_operations = ArraySort( oRes.cache_operations, "This.id", "+" );
		}
	}
	
	catCacheOperation = ArrayOptFindBySortedKey( oRes.cache_operations, "current_user", "id" );
	arrOperations = new Array();
	if( catCacheOperation != undefined )
	{
		
		xarrOperations = ArrayUnion( xarrOperations, catCacheOperation.xarr_operations );
	}
	else
	{
		var catCurrentUserBossType = ArrayOptFirstElem( XQuery( 'for $elem in boss_types where $elem/code = \'current_user\' return $elem' ) );
		if( catCurrentUserBossType != undefined )
		{
			arrOperations = ArrayUnion( arrOperations, catCurrentUserBossType.operation_id );
		}
		catCacheOperation = new Object();
		catCacheOperation.id = "current_user";
		catCacheOperation.xarr_operations = ArrayOptFirstElem( arrOperations ) != undefined ? ArrayDirect( XQuery( 'for $elem in operations where MatchSome( $elem/id, ( ' + ArrayMerge( arrOperations, 'This', ',' ) + ' ) ) and contains( $elem/operation_catalog_list, ( \'conversation\' ) ) return $elem' ) ) : [];
		xarrOperations = ArrayUnion( xarrOperations, catCacheOperation.xarr_operations );
		oRes.cache_operations.push( catCacheOperation );
		oRes.cache_operations = ArraySort( oRes.cache_operations, "This.id", "+" );
	}
	if( iConversationID != null )
	{
		if( teConversation.person_id == iPersonID )
		{
			catCacheOperation = ArrayOptFindBySortedKey( oRes.cache_operations, "author_conversation", "id" );
			arrOperations = new Array();
			if( catCacheOperation != undefined )
			{
				
				xarrOperations = ArrayUnion( xarrOperations, catCacheOperation.xarr_operations );
			}
			else
			{
				var catAuthorConversationBossType = ArrayOptFirstElem( XQuery( "for $elem in boss_types where $elem/code = 'author_conversation' return $elem" ) );
				if( catAuthorConversationBossType != undefined )
				{
					arrOperations = ArrayUnion( arrOperations, catAuthorConversationBossType.operation_id );
				}
				catCacheOperation = new Object();
				catCacheOperation.id = "author_conversation";
				catCacheOperation.xarr_operations = ArrayOptFirstElem( arrOperations ) != undefined ? ArrayDirect( XQuery( 'for $elem in operations where MatchSome( $elem/id, ( ' + ArrayMerge( arrOperations, 'This', ',' ) + ' ) ) and contains( $elem/operation_catalog_list, ( \'conversation\' ) ) return $elem' ) ) : [];
				xarrOperations = ArrayUnion( xarrOperations, catCacheOperation.xarr_operations );
				oRes.cache_operations.push( catCacheOperation );
				oRes.cache_operations = ArraySort( oRes.cache_operations, "This.id", "+" );
			}
		}
	}
	
	add_operations( xarrOperations )

	oRes.operations = ArraySelectDistinct( oRes.operations, "This.id" );
	return oRes;
}

function create_resource( oFileData, iPersonID, bUnauthorize, tePerson )
{
	/*
		создание ресурса базы
		oFileData		- поле Request c файлом
		iPersonID		- ID сотрудника
		tePerson		- TopElem сотрудника
		bUnauthorize	- проставлять параметр разрешить скачивание без авторизации
	*/

	var oRes = new Object();
	oRes.error = 0;
	oRes.doc = null;
	oRes.message = "";

	try
	{
		sFileName = UrlFileName( oFileData.FileName );
	}
	catch( ex ){
		oRes.error = 1;
		oRes.message = 'incorrect oFileData';
		return oRes
	}

	try
	{
		if( bUnauthorize == undefined || bUnauthorize == null )
			throw "error"
		bUnauthorize = tools_web.is_true( bUnauthorize );
	}
	catch( ex ){ bUnauthorize = false; }

	docResource = OpenNewDoc( 'x-local://wtv/wtv_resource.xmd' );
	docResource.BindToDb( DefaultDb );

	docResource.TopElem.person_id = iPersonID;
	tools.common_filling( 'collaborator', docResource.TopElem, docResource.TopElem.person_id, tePerson );

	if( bUnauthorize )
		docResource.TopElem.allow_unauthorized_download = true;
	docResource.TopElem.put_str( oFileData, sFileName );
	docResource.Save();
	oRes.doc = docResource;

	return oRes;
}

function add_message( iChatID, sMessage, iSenderID, teChat, iStageID, iPrevStageID, teChatBot, oAnswer, iConversationID, bWriteMessage )
{
	/*
		добавляет сообщение чат-бота
		teChat		- TopElem чата чат-бота
		sMessage	- записываемое сообщение
		iStageID	- следующий этап чат-бота
		iPrevStageID- предыдущий этап чат-бота
		iChatID		- id чата чат-бота
		iSenderID	- id отправителя сообщения
		teChatBot	- TopElem чат-бота
		bWriteMessage 	- записывать сообщение в блок сообщений
	*/
	try
	{
		teChatBot.Name;
	}
	catch( ex )
	{
		teChatBot = null;
	}
	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		iConversationID = undefined;
	}
	try
	{
		if( bWriteMessage == undefined || bWriteMessage == null )
			throw 'error';
		bWriteMessage = tools_web.is_true( bWriteMessage );
	}
	catch( ex )
	{
		bWriteMessage = true;
	}
	try
	{
		oAnswer;
	}
	catch( ex )
	{
		oAnswer = null;
	}

	try
	{
		teChat.Name;
	}
	catch( ex )
	{
		teChat = OpenDoc( UrlFromDocID( iChatID ) ).TopElem;
	}
	if( bWriteMessage )
		send_message( HtmlEncode( tools_web.convert_bbcode_to_html( HtmlEncode( sMessage ) ) ), ( iConversationID != undefined ? iConversationID : iChatID ), ( iConversationID != undefined ? null : teChat ), iSenderID, null, [], [], null, oAnswer );

	if( teChatBot != null && teChatBot.write_to_messages )
	{
		_message = teChat.messages.AddChild();
		_message.date = Date();
		_message.text = sMessage;
		_message.next_chatbot_stage_id = iStageID;
		_message.last_chatbot_stage_id = iPrevStageID;
	}
	return true;
}

function create_chat_chatbot( catChatBotType, oMessage, teChatBot, iPersonID, iConversationID, eMessage )
{
	/*
		создание чата чат-бота
		catChatBotType		- элемент XQuery запроса chatbot_chatbot_types
		oMessage			- объект сообщения из мессенджера
		teChatBot			- TopElem чат-бота
		iPersonID			- id сотрудника
		iConversationID		- id разговора
		eMessage			- сообщение блока сообщений
	*/
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		iPersonID = null;
	}
	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		iConversationID = null;
	}
	try
	{
		eMessage.Name;
	}
	catch( ex )
	{
		eMessage = null;
	}
	dChat = OpenNewDoc( 'x-local://wtv/wtv_chatbot_chat.xmd' );
	dChat.BindToDb( DefaultDb );
	dChat.TopElem.chatbot_type_id = catChatBotType.chatbot_type_id;
	dChat.TopElem.chatbot_id = catChatBotType.chatbot_id;
	dChat.TopElem.code = oMessage.chat_id;
	dChat.TopElem.person_id = iPersonID;
	dChat.Save();
	if( teChatBot.start_chatbot_stage_id.HasValue )
		return send_to_stage( catChatBotType.chatbot_code, dChat.DocID, teChatBot.start_chatbot_stage_id, dChat, null, teChatBot, false, iConversationID, { TEXT: oMessage.text }, eMessage, iPersonID );

	return dChat;
}

function update_chatbot_stage_keyboard( teStage, oKeyboard )
{
	try
	{
		if( oKeyboard.HasProperty( "keyboard_type" ) )
		{
			teStage.keyboard_type = oKeyboard.GetProperty( "keyboard_type" );
			switch( teStage.keyboard_type )
			{
				case "combo":
				case "inline_keyboard":
				{
					var arrStageInlineKeyboards = new Array();
					if( oKeyboard.GetOptProperty( "use_stage_inline_keyboard", false ) )
					{
						if( !oKeyboard.GetOptProperty( "first_stage_inline_keyboard", false ) )
						{
							arrStageInlineKeyboards = teStage.inline_keyboards.Clone();
							teStage.inline_keyboards.Clear();
						}
						else
						{
							if( ArrayOptFirstElem( teStage.inline_keyboards ) != undefined )
							{
								teStage.inline_keyboards.Child( ArrayCount( teStage.inline_keyboards ) - 1 ).next_row = true;
							}
						}
					}
					else
					{
						teStage.inline_keyboards.Clear();
					}
					var _inline_keyboard, _child, _field;
					_child = undefined;
					if( oKeyboard.HasProperty( "inline_keyboards" ) && IsArray( oKeyboard.GetProperty( "inline_keyboards" ) ) )
					{
						for( _inline_keyboard in oKeyboard.GetProperty( "inline_keyboards" ) )
						{
							_child = teStage.inline_keyboards.AddChild();
							for( _field in _child )
							{
								if( _inline_keyboard.HasProperty( _field.Name ) )
								{
									_field.Value =  _inline_keyboard.GetProperty( _field.Name );
								}
							}
						}
					}
					if( _child != undefined )
					{
						_child.next_row = true;
					}
					for( _inline_keyboard in arrStageInlineKeyboards )
					{
						teStage.inline_keyboards.AddChild().AssignElem( _inline_keyboard );
					}
					if( teStage.keyboard_type == "inline_keyboard" )
					{
						break;
					}
				}
				case "keyboard":
				{
					var arrStageKeyboards = new Array();
					if( oKeyboard.GetOptProperty( "use_stage_keyboard", false ) )
					{
						if( !oKeyboard.GetOptProperty( "first_stage_keyboard", false ) )
						{
							arrStageKeyboards = teStage.keyboards.Clone();
							teStage.keyboards.Clear();
						}
						else
						{
							if( ArrayOptFirstElem( teStage.keyboards ) != undefined )
							{
								teStage.keyboards.Child( ArrayCount( teStage.keyboards ) - 1 ).next_row = true;
							}
						}
					}
					else
					{
						teStage.keyboards.Clear();
					}
					var _keyboard, _child, _field;
					_child = undefined;
					if( oKeyboard.HasProperty( "keyboards" ) && IsArray( oKeyboard.GetProperty( "keyboards" ) ) )
					{
						
						for( _keyboard in oKeyboard.GetProperty( "keyboards" ) )
						{
							_child = teStage.keyboards.AddChild();
							for( _field in _child )
							{
								if( _keyboard.HasProperty( _field ) )
								{
									_field.Value =  _keyboard.GetProperty( _field );
								}
							}
						}
					}
					if( _child != undefined )
					{
						_child.next_row = true;
					}
					for( _keyboard in arrStageKeyboards )
					{
						teStage.keyboards.AddChild().AssignElem( _keyboard );
					}
					break;
				}
			}
		}
	}
	catch( e ){}
	return teStage;
}

function update_chatbot_stage_tiles( teStage, oTile )
{
	try
	{
		if( oTile.HasProperty( "tiles" ) )
		{
			var arrStageTiles = new Array();
			if( oTile.GetOptProperty( "use_stage_tiles", false ) )
			{
				if( !oTile.GetOptProperty( "first_stage_tiles", false ) )
				{
					arrStageTiles = teStage.tile_block.tiles.Clone();
					teStage.tile_block.tiles.Clear();
				}
			}
			else
			{
				teStage.tile_block.tiles.Clear();
			}
			
			var _tile, _child, _field, _button, _child_button, _field_button;
			_child = undefined;
			if( oTile.HasProperty( "tiles" ) && IsArray( oTile.GetProperty( "tiles" ) ) )
			{
				for( _tile in oTile.GetProperty( "tiles" ) )
				{
					_child = teStage.tile_block.tiles.AddChild();
					
					for( _field in _child )
					{
						switch( _field.Name )
						{
							case "buttons_block":
							{
								for( _button in _tile.buttons )
								{
									_child_button = _child.buttons_block.buttons.AddChild();
									for( _field_button in _child_button )
									{
										if( _button.HasProperty( _field_button.Name ) )
										{
											_field_button.Value = _button.GetProperty( _field_button.Name );
										}
									}
								}
								break;
							}
							default:
							{
								if( _tile.HasProperty( _field.Name ) )
								{
									_field.Value = _tile.GetProperty( _field.Name );
								}
								break;
							}
						}
					}
				}
			}

			for( _tile in arrStageTiles )
			{
				teStage.tile_block.tiles.AddChild().AssignElem( _tile );
			}
		}
	}
	catch( e ){}
	return teStage;
}

/**
 * @function SendChatToStage
 * @memberof Websoft.WT.Chat
 * @description Переводит чат чат-бота на указанный этап.
 * @param {bigint} iChatID - id чата чат-бота
 * @param {bigint} iStageID - id этапа на который переводится чат
 * @param {string} [sChatBotCode] - ID сотрудника
 * @param {bigint} [iPrevStageID] - id предыдущего этапа
 * @param {boolean} [bReWriteLastMessage|false] - перезаписывать последнее сообщение в чате
 * @param {bigint} [iConversationID] - ID разговора
 * @returns {WTChatResult}
 */
function SendChatToStage( iChatID, iStageID, sChatBotCode, iPrevStageID, bReWriteLastMessage, iConversationID )
{
	return send_to_stage( sChatBotCode, iChatID, iStageID, null, iPrevStageID, null, bReWriteLastMessage, iConversationID )
}

function send_to_stage( sChatBotCode, curChatID, iStageID, curChatDoc, iPrevStageID, teChatBot, bReWriteLastMessage, iConversationID, oRequest, oMessage, curUserID, curUser )
{
	/*
		переводит чат чат-бота на указанный этап
		sChatBotCode	- код бота
		iStageID		- id этапа на который переводится чат
		curChatID		- id чата чат-бота
		curChatDoc		- документ чата чат-бота
		iPrevStageID	- id предыдущего этапа
		teChatBot		- TopElem чат-бота
		bReWriteLastMessage	- перезаписывать последнее сообщение в чате
		iConversationID	- id разговора
		oRequest		-
		oMessage		- сообщение из блока сообщений
	*/

	oRes = new Object();
	oRes.error = 0;
	oRes.message = ''
	oRes.result = new Object();

	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		iConversationID = undefined
	}
	try
	{
		curChatID = Int( curChatID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID чата';
		return oRes;
	}
	try
	{
		iStageID = Int( iStageID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID этапа';
		return oRes;
	}
	try
	{
		curChatDoc.TopElem;
	}
	catch( ex )
	{
		curChatDoc = OpenDoc( UrlFromDocID( curChatID ) );
	}
	try
	{
		iPrevStageID = Int( iPrevStageID );
	}
	catch( ex )
	{
		iPrevStageID = curChatDoc.TopElem.chatbot_stage_id
	}
	try
	{
		if( bReWriteLastMessage == undefined || bReWriteLastMessage == null )
			throw "error";
		bReWriteLastMessage = tools_web.is_true( bReWriteLastMessage );
	}
	catch( ex )
	{
		bReWriteLastMessage = false;
	}
	try
	{
		if( oRequest == undefined || oRequest == null )
			throw "";
		oRequest.GetOptProperty( "test" );
	}
	catch( ex )
	{
		oRequest = ({});
	}
	try
	{
		oMessage.Name
	}
	catch( ex )
	{
		oMessage = null;
	}


	message = oRequest.GetOptProperty( 'message', '' );
	try
	{
		curUserID = Int( curUserID );
	}
	catch( ex )
	{
		curUserID = OptInt( oRequest.GetOptProperty( 'curUserID', '' ) );
	}
	try
	{
		curUser.Name;
	}
	catch( ex )
	{
		curUser = null;
		if( curUserID != undefined )
		{
			curUser = tools.open_doc( curUserID ).TopElem;
		}
	}
	
	ChatBotType = oRequest.GetOptProperty( 'ChatBotType', '' );
	TEXT = oRequest.GetOptProperty( 'TEXT', '' );
	commands = oRequest.GetOptProperty( 'commands', [] );

	curChat = curChatDoc.TopElem;
	curChat.last_message_id = '';

	var ChatBotTE = teChatBot;

	var ChatDocTE = curChat;
	var ChatDoc = curChatDoc;
	var StageId = iStageID;
	var LastStageId = iPrevStageID;
	var chat = curChatDoc;

	try
	{
		if( sChatBotCode == undefined || sChatBotCode == null )
			throw "error";
	}
	catch( ex )
	{
		catChatBotType = ArrayOptFirstElem( XQuery( 'for $elem in chatbot_chatbot_types where $elem/chatbot_id = ' + curChat.chatbot_id + ' and $elem/chatbot_type_id = ' + curChat.chatbot_type_id + ' return $elem' ) );
		if( catChatBotType != undefined )
			sChatBotCode = catChatBotType.chatbot_code;
		else
		{
			oRes.error = 1;
			oRes.message = 'Не передан код бота';
			return oRes;
		}
	}
	try
	{
		teChatBot.Name;
	}
	catch( ex )
	{
		teChatBot = OpenDoc( UrlFromDocID( curChat.chatbot_id ) ).TopElem;
	}
	var curChatbotParams = new Object();
	tools_web.set_web_params( curChatbotParams, teChatBot.wvars, true, curChat.chatbot_id );

	feChatBotType = null;
	try
	{
		if( spxmlCodeLib == undefined || spxmlCodeLib == null )
			throw "error";
	}
	catch( ex )
	{
		feChatBotType = curChat.chatbot_type_id.OptForeignElem;
		spxmlCodeLib = OpenCodeLib( feChatBotType.script_url );
	}
	var ChatBotTypeTE = feChatBotType;
	tempObjectId = null;
	try
	{
		teStage = OpenDoc( UrlFromDocID( iStageID ) ).TopElem.Clone();
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан stage ID';
		return oRes;
	}
	var stageDoc = teStage;
	var iAutoChatbotStage = teStage.auto_chatbot_stage_id.Value;
	var oResLib;
	switch( teStage.action_type )
	{
		case 'custom_chatbot_template':
		{
			try
			{
				if( teStage.custom_chatbot_template_id.HasValue )
				{
					eval_str = '';
					StatusReader = 'send';
					teCustomChatbotTemplate = OpenDoc( UrlFromDocID( teStage.custom_chatbot_template_id ) ).TopElem;
					curParameters = teStage.parameters;
					if( teCustomChatbotTemplate.exec_code.code_url.HasValue )
					{
						eval_str = LoadUrlText( teCustomChatbotTemplate.exec_code.code_url );
					}
					else
					{
						eval_str = teCustomChatbotTemplate.eval_str;
					}

					eval( eval_str );
				}
			}
			catch( err )
			{
				alerd( err, teChatBot.logged )
			}
			break;
		}
		case 'aiml':
		{
			try
			{
				if( teStage.custom_chatbot_template_id.HasValue )
				{
					eval_str = '';

					/*oCheckResult = check_standart_inline_commands()
					if( oCheckResult != 'not_find' )
					{
						oRes.result = oCheckResult;
						return oRes;
					}*/

					dCustomChatbotTemplate = OpenDoc( UrlFromDocID( teStage.custom_chatbot_template_id ) ).TopElem;
					curParameters = teStage.parameters;
					eval_str = LoadUrlText( 'x-local://wtv/aiml/interpreter.js' );

					eval( eval_str );
				}
			}
			catch( ex )
			{
				alerd( ex, ( teChatBot != null && teChatBot.logged ) )
			}
			break;
		}
		case "close":
			curChat.state_id = "archive";
		case "standart":
		{
			function check_keyboard( catKeyboard )
			{
				/*var oSafeEvalParams = [ { 'curChat': curChat, 'common': common, 'lists': lists, 'ms_tools': ms_tools, 'tools': tools, 'tools_web': tools_web } ];
				if( !catKeyboard.perfom_condition.HasValue )
				{
					return true;
				}
				try
				{
					return SafeEval( catKeyboard.perfom_condition, oSafeEvalParams )
				}
				catch( ex ){}*/
				
				return check_code_library_condition( catKeyboard, catKeyboard, curChat, TEXT, curUser, teStage, null, "perfom_condition" );
			}
			if( !teStage.send_text_library.eval_code_type.HasValue )
			{
				teStage.send_text_library.eval_code_type = teStage.is_eval_send_text ? "eval" : "text";
			}
			switch( teStage.send_text_library.eval_code_type )
			{
				case "code_library":
					oResLib = eval_code_library_code( teStage.send_text_library, curChat, TEXT, curUser, teStage );
					sAnswer = oResLib.GetOptProperty( "result", "" );
					teStage = update_chatbot_stage_keyboard( teStage, oResLib );
					teStage = update_chatbot_stage_tiles( teStage, oResLib );
					break;
				case "text":
					sAnswer = teStage.send_text.Value;
					break;
				case "eval":
					sAnswer = eval( teStage.send_text );
					break;
			}
			if( teStage.action_type == "standart" )
			{
				if( teStage.is_eval_generate_keyboard )
				{
					switch( teStage.eval_generate_keyboard_library.eval_code_type )
					{
						case "code_library":
							oResLib = eval_code_library_code( teStage.eval_generate_keyboard_library, curChat, TEXT, curUser, teStage );
							teStage = update_chatbot_stage_keyboard( teStage, oResLib );
							break;
						default:
							eval( teStage.eval_generate_keyboard );
							break;
					}
					
				}
				switch( teStage.keyboard_type )
				{
					case "combo":
					case "keyboard":
					{
						var arrDeletedKeyboards = new Array();
						for( _keyboard in teStage.keyboards )
						{
							if( !check_keyboard( _keyboard ) )
							{
								arrDeletedKeyboards.push( { id: _keyboard.id.Value } );
							}
						}
						teStage.keyboards.DeleteChildren( "ArrayOptFindByKey( arrDeletedKeyboards, This.id, 'id' ) != undefined" );
						if( teStage.keyboard_type == "keyboard" )
						{
							break;
						}
					}
					case "inline_keyboard":
					{
						var arrDeletedInlineKeyboards = new Array();
						for( _inline_keyboard in teStage.inline_keyboards )
						{
							if( !check_keyboard( _inline_keyboard ) )
							{
								arrDeletedInlineKeyboards.push( { id: _inline_keyboard.id.Value } );
							}
						}
						teStage.inline_keyboards.DeleteChildren( "ArrayOptFindByKey( arrDeletedInlineKeyboards, This.id, 'id' ) != undefined" );
						break;
					}
				}
			}
			oRes.result = CallObjectMethod( spxmlCodeLib, 'SendMessage', [ curChat.code.Value, ( bReWriteLastMessage ? curChat.last_message_id : '' ), iStageID, OptInt( iPrevStageID ), sChatBotCode, teStage.Xml, sAnswer, ( curChat.lng_id.HasValue ? curChat.lng_id.ForeignElem.short_id.Value : 'ru' ), tempObjectId ] );
			if( OptInt( oRes.result.GetOptProperty( 'new_message_id' ) ) != undefined )
			{
				curChat.last_message_id = oRes.result.GetOptProperty( 'new_message_id' );
			}
			add_message( curChatID, sAnswer, curChat.chatbot_id, curChat, iStageID, curChat.chatbot_stage_id, teChatBot, oRes.result.GetOptProperty( 'answer', ({}) ), iConversationID );
			if( iConversationID != undefined )
			{
				var docConversation = tools.open_doc( iConversationID );
				if( docConversation != undefined )
				{
					var catBlockKeyboard = docConversation.TopElem.keyboards_block.Clone();
					if( teStage.keyboard_type == "keyboard" || teStage.keyboard_type == "combo" )
					{
						docConversation.TopElem.keyboards_block.keyboards.AssignElem( teStage.keyboards );
					}
					else
					{
						docConversation.TopElem.keyboards_block.keyboards.Clear();
					}
					if( catBlockKeyboard.Xml != docConversation.TopElem.keyboards_block.Xml )
					{
						docConversation.Save();
						try
						{
							update_conversation_data( iConversationID, docConversation.TopElem, ( curChat.lng_id.HasValue ? curChat.lng_id.ForeignElem.short_id.Value : 'ru' ) );
						}
						catch(ex)
						{
							alert( "update_conversation_data " + ex )
						}
					}
				}
			}
			break;
		}
	}
	curChat.chatbot_stage_id = iStageID;
	curChat.escalation.Clear();
	if( ArrayOptFirstElem( teStage.escalation.escalation_stages ) != undefined )
	{
		curChat.escalation.start_date = Date();
		curChat.escalation.use_escalation = true;
		curChat.calculate_escalation_date( teStage );
	}
	curChatDoc.Save();
	if( oRes.error == 0 && teStage.action_type != "close" )
	{
		if( OptInt( iAutoChatbotStage ) != undefined )
		{
			return send_to_stage( sChatBotCode, curChatID, iAutoChatbotStage, curChatDoc, iStageID, teChatBot, bReWriteLastMessage, iConversationID, oRequest, oMessage, curUserID, curUser )
		}
		return oRes.result;
	}
	return oRes
}

function send_message_to_chatbot( sMessageText, curChatID, curChatDoc, sChatBotCode, iConversationID )
{
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = ''
	oRes.result = new Object();
	if( sMessageText == "" || sMessageText == null || sMessageText == undefined )
	{
		return oRes;
	}
	try
	{
		curChatID = Int( curChatID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID чата';
		return oRes;
	}
	try
	{
		curChatDoc.TopElem;
	}
	catch( ex )
	{
		curChatDoc = OpenDoc( UrlFromDocID( curChatID ) );
	}
	var curChat = curChatDoc.TopElem;
	try
	{
		if( sChatBotCode == undefined || sChatBotCode == null )
			throw "error";
	}
	catch( ex )
	{
		catChatBotType = ArrayOptFirstElem( XQuery( 'for $i in chatbot_chatbot_types where $i/chatbot_id = ' + curChat.chatbot_id + ' and $i/chatbot_type_id = ' + curChat.chatbot_type_id + ' return $i' ) );
		if( catChatBotType != undefined )
			sChatBotCode = catChatBotType.chatbot_code;
		else
		{
			oRes.error = 1;
			oRes.message = 'Не передан код бота';
			return oRes;
		}
	}
	try
	{
		if( spxmlCodeLib == undefined || spxmlCodeLib == null )
			throw "error";
	}
	catch( ex )
	{
		var feChatBotType = curChat.chatbot_type_id.OptForeignElem;
		spxmlCodeLib = OpenCodeLib( feChatBotType.script_url );
	}
	oRes.result = CallObjectMethod( spxmlCodeLib, 'SendMessage', [ curChat.code.Value, "", "", "", sChatBotCode, OpenNewDoc( "x-local://wtv/wtv_chatbot_stage.xmd" ).TopElem.Xml, sMessageText, ( curChat.lng_id.HasValue ? curChat.lng_id.ForeignElem.short_id.Value : 'ru' ) ] );
	add_message( curChatID, sMessageText, curChat.chatbot_id, curChat, "", curChat.chatbot_stage_id, null, oRes.result.GetOptProperty( 'answer', {} ), iConversationID );

	curChatDoc.Save();
	return oRes;
}

function eval_code_library_code( code_library_block, curChat, TEXT, curUser, teStage )
{
	var oReslib;
	if( code_library_block.code_library_id.HasValue )
	{
		if( code_library_block.method_name.HasValue )
		{
			var arrMethodParams = new Array();
			var _mp;
			for( _mp in code_library_block.method_params )
			{
				arrMethodParams.push( ( _mp.eval_code ? eval( _mp.value ) : _mp.value.Value ) );
			}
			return tools.call_code_library_method( code_library_block.code_library_id.Value, code_library_block.method_name.Value, arrMethodParams );
		}
		else
		{
			var teCodeLibrary = tools.get_cache_code_librarys( code_library_block.code_library_id );
			var oLibText = LoadUrlText( teCodeLibrary.exec_code.code_url );
			return eval( oLibText );
		}
	}
}

function check_code_library_condition( command, TopElem, curChat, TEXT, curUser, teStage, sWebsocketID, sFieldConditionEval )
{
	try
	{
		
		var oResLib;

		switch( command.perfom_condition_type )
		{
			case "condition":
			{
				try
				{
					if( sFieldConditionEval == undefined || sFieldConditionEval == "" || sFieldConditionEval == null )
					{
						throw "error";
					}
				}
				catch( ex )
				{
					sFieldConditionEval = "condition_eval";
				}
				return !command.Child( sFieldConditionEval ).HasValue ? true : eval( command.Child( sFieldConditionEval ) );
				break;
			}
			case "code_library":
			{
				oResLib = eval_code_library_code( command, curChat, TEXT, curUser, teStage, sWebsocketID );
				return oResLib.result;
			}
			case "statistic_rec":
			{
				if( command.statistic_rec_id.HasValue && curUser != undefined )
				{
					var docStatisticParam = tools.open_doc( command.statistic_rec_id );
					if( docStatisticParam != undefined )
					{
						var feConversation = curChat.conversation_id.HasValue ? curChat.conversation_id.OptForeignElem : undefined;
						if( feConversation != undefined )
						{
							var iObjectID = feConversation.active_object_id;
							var arrStatisticRec = docStatisticParam.TopElem.calculate( iObjectID, null, null, null, ({ 'return_data': true, 'virtual': true, 'backcheck': false, 'curUser': curUser }) );
							var catStatisticRecResult = ArrayOptFirstElem( arrStatisticRec );
							var ResultValue;
							if( catStatisticRecResult != undefined )
							{
								var catResultField = undefined;
								switch( docStatisticParam.TopElem.informer.output_type )
								{
									case "object":
										if( !command.statistic_param.HasValue )
										{
											return false;
										}
										catResultField = docStatisticParam.TopElem.result_fields.GetOptChildByKey( command.statistic_param, "name" );
										//alert("catStatisticRecResult.value_str.Value "+catStatisticRecResult.value_str.Value)
										ResultValue = ParseJson( catStatisticRecResult.value_str.Value ).GetOptProperty( command.statistic_param );
										break;
									case "number":
									case "percent":
										ResultValue = OptReal( catStatisticRecResult.value.Value );
										break;
									default:
										ResultValue = catStatisticRecResult.value.Value;
								}
								var ConditionValue = command.condition_value.Value;
								switch( DataType( ResultValue ) )
								{
									case "integer":
										ConditionValue = OptInt( ConditionValue, 0 );
										break;
									case "real":
										ConditionValue = OptReal( ConditionValue, 0.0 );
										break;
									case "bool":
										ConditionValue = tools_web.is_true( ConditionValue );
										break;
								}
								
								if( catResultField != undefined )
								{
									switch( catResultField.type )
									{
										case "integer":
											ConditionValue = OptInt( ConditionValue, 0 );
											ResultValue = OptInt( ResultValue, 0 );
											break;
										case "real":
											ConditionValue = OptReal( ConditionValue, 0.0 );
											ResultValue = OptReal( ResultValue, 0.0 );
											break;
										case "bool":
											ConditionValue = tools_web.is_true( ConditionValue );
											ResultValue = tools_web.is_true( ResultValue );
											break;
										case "date":
											ConditionValue = OptDate( ConditionValue );
											ResultValue = OptDate( ResultValue );
											break;
										default:
											ConditionValue = String( ConditionValue );
											ResultValue = String( ResultValue );
											break;
									}
								}
								switch( command.statistic_option_type )
								{
									case "eq":
										return ResultValue == ConditionValue;
									case "neq":
										return ResultValue != ConditionValue;
									case "gt":
										return ResultValue > ConditionValue;
									case "lt":
										return ResultValue < ConditionValue;
									case "lte":
										return ResultValue <= ConditionValue;
									case "gte":
										return ResultValue >= ConditionValue;
									case "cn":
										return StrContains( ResultValue, ConditionValue );
									case "ncn":
										return !StrContains( ResultValue, ConditionValue );
								}
							}
						}
					}
				}
			}
		}
	}
	catch( ex )
	{
		alert("check_code_library_condition "+ex)
		return false;
	}
	return false;
}

/**
 * @typedef {Object} oProcessChatbotMessage
 * @property {string} id – id сообщения
 * @property {string} msg_type – тип сообщения
 * @property {string} chat_id – id чата
 * @property {string} text – текст сообщения
*/
/**
 * @function ProcessChatbot
 * @memberof Websoft.WT.Chat
 * @description Обработка запроса от мессенджера чат-ботом.
 * @param {string} sBotID - ID бота
 * @param {oProcessChatbotMessage} oMessage - сообщение
 * @param {bigint} [iSenderID] - ID отправителя
 * @param {bigint} [iConversationID] - ID разговора
 * @returns {WTChatResult}
 */
function ProcessChatbot( sBotID, oMessage, iSenderID, iConversationID )
{
	return chatbot_request_processing( null, '', { bot_id : sBotID }, oMessage, false, iSenderID, iConversationID )
}

function chatbot_request_processing( Request, RequestBody, RequestQueryString, RequestForm, bWriteMessage, curUserID, iConversationID, oMessage, sWebsocketID )
{
	/*
		обработка запроса от мессенджера
		catChatBotType		- элемент XQuery запроса chatbot_chatbot_types
		oMessage			- объект сообщения из мессенджера
		teChatBot			- TopElem чат-бота
		bWriteMessage		- записывать сообщение в блок сообщений
		curUserID			- id сотрудника
		iConversationID		- id разговора
	*/

	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		iConversationID = undefined;
	}
	try
	{
		oMessage.Name;
	}
	catch( ex )
	{
		oMessage = null;
	}
	try
	{
		if( ObjectType( RequestBody ) != "JsObject" )
			throw "error";
	}
	catch( ex )
	{
		try
		{
			RequestBody = tools.read_object( Request.Body );
		}
		catch( ex )
		{
			RequestBody = {}
		}
	}
	try
	{
		if( ObjectType( RequestQueryString ) != "JsObject" )
			throw "error";
	}
	catch( ex )
	{
		try
		{
			RequestQueryString = Request.QueryString;
		}
		catch( ex )
		{
			RequestQueryString = {}
		}
	}
	try
	{
		if( ObjectType( RequestForm ) != "JsObject" )
			throw "error";
	}
	catch( ex )
	{
		try
		{
			RequestForm = Request.Form;
		}
		catch( ex )
		{
			RequestForm = {}
		}

	}
	try
	{
		if( bWriteMessage == undefined || bWriteMessage == null )
			throw "error";
		bWriteMessage = tools_web.is_true( bWriteMessage );
	}
	catch( ex )
	{
		bWriteMessage = true;
	}
	try
	{
		Int( curUserID );
	}
	catch( ex )
	{
		curUserID = null;
	}
	function get_cur_user()
	{
		if( curUser == undefined && message != null )
		{
			curUser = tools.open_doc( message.person_info.id );
			if( curUser != undefined )
			{
				curUser = curUser.TopElem;
			}
		}
		return curUser;
	}
	var curUser = undefined;
	
	function check_command( command, top_elem )
	{
		if( ( top_elem.Name == 'chatbot_stage' && ( top_elem.keyboard_type == 'inline_keyboard' || top_elem.keyboard_type == 'combo' ) ) && command.is_inline_keyboard )
		{
			return message.inline_keyboard_id == command.inline_keyboard_id;
		}
		else
		{
			return check_code_library_condition( command, top_elem, curChat, TEXT, get_cur_user(), teStage, sWebsocketID );
		}
		return false;
	}

	function check_universal_commands()
	{
		if( teStage == null || ( teStage.ChildExists( 'is_use_universal_commands' ) && teStage.is_use_universal_commands ) )
		{

			try
			{
				switch( teChatBot.command_eval_library.eval_code_type )
				{
					case "code_library":
						eval_code_library_code( teChatBot.command_eval_library, curChat, TEXT, curUser, teStage, sWebsocketID );
						break;
					default:
						if( teChatBot.command_eval_str.HasValue )
						{
							eval( teChatBot.command_eval_str );
						}
						break;
				}
			}
			catch( ex )
			{
				alerd( ex, ( teChatBot != null && teChatBot.logged ) );
			}

			if( teStage == null || ( teStage.ChildExists( 'is_use_universal_commands' ) && teStage.is_use_universal_commands ) )
				for( comm in teChatBot.universal_commands )
					if( check_command( comm, teChatBot ) )
					{
						return send_to_stage( ChatBotType.chatbot_code.Value, curChatDoc.DocID, comm.chatbot_stage_id, curChatDoc , curChat.chatbot_stage_id, teChatBot, reWriteLastMessage, iConversationID, oRequest, oMessage, curUserID, curUser );
					}
		}
		return 'not_find';
	}

	function run_opencall( iConversationID )
	{
		var docCall;
		var catActiveVideoChat = ArrayOptFirstElem( XQuery( "for $elem in calls where $elem/conversation_id = " + iConversationID + " and $elem/state_id = 'active' return $elem/Fields('id')" ) );
		if( catActiveVideoChat != undefined )
		{
			docCall = tools.open_doc( catActiveVideoChat.id );
		}
		else
		{
			docCall = tools.new_doc_by_name( "call" );
			docCall.BindToDb( DefaultDb );
			docCall.TopElem.person_id = curUserID;
			tools.common_filling( 'collaborator', docCall.TopElem, curUserID );
			
			docCall.TopElem.state_id = "active";
			
			docCall.TopElem.conversation_id = iConversationID;
		}
		var bNeedSaveCall = false;
		for( _participant_id in [ iTempObjectID, curUserID ] )
		{
			if( docCall.TopElem.participants.GetOptChildByKey( curUserID ) == undefined || docCall.TopElem.participants.GetOptChildByKey( curUserID ).state_id != "active" )
			{
				catParticipant = docCall.TopElem.participants.ObtainChildByKey( curUserID );
				catParticipant.state_id = "active";
				bNeedSaveCall = true;
			}
		}
		if( bNeedSaveCall )
		{
			docCall.Save();
		}
		oResRunConversation = RunActionInConversation( iConversationID, curUserID, "open_call", ({ conversation_id: iConversationID, call_id: docCall.DocID }) );
	
	}
	function check_standart_inline_commands()
	{
		if( message.inline_keyboard_id != '' && StrBegins( message.inline_keyboard_id, 'c_' ) )
		{
			oRequest.commands = String( message.inline_keyboard_id ).split( '_' );
			var oResRunConversation = null;
			switch( oRequest.commands[ 1 ] )
			{
				case 'cs':
				{
					return send_to_stage( ChatBotType.chatbot_code.Value, curChatDoc.DocID, oRequest.commands[ 2 ], curChatDoc , curChat.chatbot_stage_id, teChatBot, reWriteLastMessage, iConversationID, oRequest, oMessage, curUserID, curUser );
				}
				case 'body':
				{
					stageBody = ArrayOptFirstElem( XQuery( 'for $elem in chatbot_stages where $elem/code = ' + XQueryLiteral( String( oRequest.commands[ 2 ] ) ) + ' return $elem' ) );
					if( stageBody != undefined )
					{
						return send_to_stage( ChatBotType.chatbot_code.Value, curChatDoc.DocID, stageBody.id, curChatDoc , curChat.chatbot_stage_id, teChatBot, reWriteLastMessage, iConversationID, oRequest, oMessage, curUserID, curUser );
					}
					break;
				}
				case 'openadditionalinfo':
				{
					var iTempObjectID = OptInt( oRequest.commands[ 2 ] );
					var sAdditionalInfoUrl = "";
					if( iTempObjectID != undefined )
					{
						sAdditionalInfoUrl = tools_web.get_mode_clean_url( null, iTempObjectID, ({placeholder: "empty"}) )
					}
					else
					{
						sAdditionalInfoUrl = Base64Decode( oRequest.commands[ 2 ] );
					}
					RunActionInConversation( iConversationID, curUserID, "open_additional_info", ({ url: sAdditionalInfoUrl }) );
					break;
				}
				case "openconversation":
				case "opencall":
				{
					var iTempObjectID = OptInt( oRequest.commands[ 2 ] )
					if( iTempObjectID != undefined )
					{
						var docTempObject = tools.open_doc( iTempObjectID );
						if( docTempObject != undefined )
						{
							switch( docTempObject.TopElem.Name )
							{
								case "conversation":
									oResRunConversation = RunActionInConversation( iConversationID, curUserID, "open_conversation", ({ conversation_id: iTempObjectID }) );
									if( oResRunConversation.error == 0 )
									{
										return oRes;
									}
									break;
								case "collaborator":
								{
									var chat_conds = new Array();
									chat_conds.push( "$elem/prohibited = false()" );
									chat_conds.push( "$elem/partner_prohibited = false()" );
									chat_conds.push( "$elem/partner_confirmed = true()" );
									chat_conds.push( "$elem/confirmed = true()" );
									chat_conds.push( "( ( $elem/partner_id = " + curUserID + " and $elem/person_id = " + iTempObjectID + " ) or ( $elem/partner_id = " + iTempObjectID + " and $elem/person_id = " + curUserID + " ) )" );
									var xarrPersonalChat = XQuery( "for $elem in personal_chats where " + ArrayMerge( chat_conds, "This", " and " ) + " return $elem" );
									if( ArrayOptFirstElem( xarrPersonalChat ) != undefined )
									{
										var catConversation = ArrayOptFirstElem( XQuery( "for $elem in conversations where $elem/state_id = 'active' and MatchSome( $elem/active_object_id, ( " + ArrayMerge( xarrPersonalChat, "This.chat_id", "," ) + " ) ) return $elem" ) );
										if( catConversation != undefined )
										{
											if( oRequest.commands[ 1 ] == "openconversation" )
											{
												oResRunConversation = RunActionInConversation( iConversationID, curUserID, "open_conversation", ({ conversation_id: catConversation.id }) );
											}
											else if( oRequest.commands[ 1 ] == "opencall" )
											{	
												run_opencall( catConversation.id );
											}
										}
									}
									if( oResRunConversation == null )
									{
										var oResConversation = change_participants_conversation( null, null, "change", null, [ iTempObjectID, curUserID ], "", null, null, null, docTempObject.TopElem.fullname, curUserID, true );
										if( oResConversation.error == 0 )
										{
											if( oRequest.commands[ 1 ] == "openconversation" )
											{
												oResRunConversation = RunActionInConversation( iConversationID, curUserID, "open_conversation", ({ conversation_id: oResConversation.doc_conversation.DocID }) );
											}
											else if( oRequest.commands[ 1 ] == "opencall" )
											{	
												run_opencall( oResConversation.doc_conversation.DocID );
											}
										}
									}
									
									if( oResRunConversation != null && oResRunConversation.error == 0 )
									{
										return oRes;
									}
									break;
								}
							}
						}
					}
					break;
				}
				case "activateobject":
				{
					var iTempObjectID = OptInt( oRequest.commands[ 2 ] )
					if( iTempObjectID != undefined )
					{
						var docTempObject = tools.open_doc( iTempObjectID );
						if( docTempObject != undefined )
						{
							switch( docTempObject.TopElem.Name )
							{
								case "assessment":
								{
									var oResActivate = tools.activate_test_to_person( curUserID, iTempObjectID );
									var iActiveObjectID = null;
									if( OptInt( oResActivate ) != undefined )
									{
										iActiveObjectID = OptInt( oResActivate );
									}
									else
									{
										try
										{
											iActiveObjectID = oResActivate.DocID;
										}
										catch( ex ){}
									}
									
									if( iActiveObjectID != null )
									{
										var sActiveUrl = "/test_launch.html?structure=first&assessment_id=" + iTempObjectID + "&object_id=" + iActiveObjectID + "&launch_id=" + tools_web.encrypt_launch_id( iActiveObjectID, DateOffset( Date(), 86400*365 ) );
										oResRunConversation = RunActionInConversation( iConversationID, curUserID, "open_additional_info", ({ url: sActiveUrl }) );
									}
									if( oResRunConversation != null && oResRunConversation.error == 0 )
									{
										return oRes;
									}
									break;
								}
								case "course":
								{
									var oResActivate = tools.activate_test_to_person( curUserID, iTempObjectID );
									var iActiveObjectID = null;
									if( OptInt( oResActivate ) != undefined )
									{
										iActiveObjectID = OptInt( oResActivate );
									}
									else
									{
										try
										{
											iActiveObjectID = oResActivate.DocID;
										}
										catch( ex ){}
									}
									
									if( iActiveObjectID != null )
									{
										var sActiveUrl = "/course_launch.html?structure=first&launch_id=" + tools_web.encrypt_launch_id( iActiveObjectID, DateOffset( Date(), 86400*365 ) );
										oResRunConversation = RunActionInConversation( iConversationID, curUserID, "open_additional_info", ({ url: sActiveUrl }) );
									}
									if( oResRunConversation != null && oResRunConversation.error == 0 )
									{
										return oRes;
									}
									break;
								}
							}
						}
					}
				}
			}
		}
		return 'not_find';
	}
	
	function run_unknow_command_chatbot_stage( catUnknowCommand )
	{
		var sUnknowCommandMessageText = "";
		
		if( !catUnknowCommand.unknow_command_text_library.eval_code_type.HasValue )
		{
			catUnknowCommand.unknow_command_text_library.eval_code_type = catUnknowCommand.is_eval_unknow_command ? "eval" : "text";
		}
		switch( catUnknowCommand.unknow_command_text_library.eval_code_type )
		{
			case "code_library":
				sUnknowCommandMessageText = eval_code_library_code( catUnknowCommand.unknow_command_text_library, curChat, TEXT, curUser, teStage, sWebsocketID );
				break;
			case "text":
				sUnknowCommandMessageText = catUnknowCommand.unknow_command_text.Value;
				break;
			case "eval":
				sUnknowCommandMessageText = eval( catUnknowCommand.unknow_command_text.Value );
				break;
		}
		
		if( sUnknowCommandMessageText != "" )
		{
			oRes.result = send_message_to_chatbot( sUnknowCommandMessageText, curChatID, curChatDoc, sChatBotCode, iConversationID );
		}
		if( catUnknowCommand.unknow_command_chatbot_stage_id.HasValue )
		{
			oRes.result = send_to_stage( ChatBotType.chatbot_code.Value, curChatDoc.DocID, catUnknowCommand.unknow_command_chatbot_stage_id, curChatDoc, curChat.chatbot_stage_id, teChatBot, reWriteLastMessage, iConversationID, oRequest, oMessage, curUserID, curUser );
		}
		if( sUnknowCommandMessageText != "" || catUnknowCommand.unknow_command_chatbot_stage_id.HasValue )
		{
			return true;
		}
		return false;
	}

	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	oRes.result = new Object();

	try
	{
		var teStage = null;
		oRequest = new Object();
		oRequest.commands = new Array();
		var teChatBot = null;
		var curChatbotParams = new Object();
		StatusReader = 'get';
		reWriteLastMessage = false;
		bot_id = RequestQueryString.GetOptProperty( 'bot_id', '' );

		var ChatBotTE;
		var stageDoc;
		var ChatBotTypeTE;
		var ChatDocTE;
		var ChatDoc;
		var StageId;
		var LastStageId;
		var chat;
		var ChatStageTE;
		var sUnknowCommandMessageText, oResLib;

		if( bot_id == '' )
		{
			oRes.error = 1;
			return oRes;
		}

		ChatBotType = ArrayOptFirstElem( XQuery( 'for $i in chatbot_chatbot_types where $i/bot_id = ' + XQueryLiteral( String( bot_id ) ) + ' return $i' ) );
		if( ChatBotType == undefined )
		{
			oRes.error = 1;
			return oRes;
		}

		ChatBotTypeTE = ChatBotType.chatbot_type_id.OptForeignElem;
		teChatBot = OpenDoc( UrlFromDocID( ChatBotType.chatbot_id ) ).TopElem;
		ChatBotTE = teChatBot;


		tools_web.set_web_params( curChatbotParams, teChatBot.wvars, true, ChatBotType.chatbot_id );
		spxmlCodeLib = OpenCodeLib( ChatBotTypeTE.script_url );
		var message = OpenDocFromStr( CallObjectMethod( spxmlCodeLib, 'ReadRequest', [ RequestBody, RequestForm, RequestQueryString, curUserID ] ), 'form=x-local://wtv/wtv_form_chatbot_message.xmd' ).TopElem;
		curUser = get_cur_user();
		oRequest.SetProperty( 'message', message );
		oRequest.SetProperty( 'ChatBotType', ChatBotType );
		switch( message.type )
		{
			case 'message':
			case 'start':

				if( message.id.HasValue )
				{
					message_status = tools_web.get_user_data( 'chatbot_api_' + bot_id + '_' + message.chat_id + '_' + message.id );
					if( message_status == null )
						tools_web.set_user_data( 'chatbot_api_' + bot_id + '_' + message.chat_id + '_' + message.id, 'processed', 600);
					else
					{
						alerd( 'Message with ID ' + message.id + ' already processed', ( teChatBot != null && teChatBot.logged ) );
						oRes.error = 1;
						return oRes;
					}
				}
				TEXT = message.text;
				oRequest.SetProperty( 'TEXT', message.text );

				chat = ArrayOptFirstElem( XQuery( 'for $i in chatbot_chats where $i/code = ' + XQueryLiteral( String( message.chat_id ) ) + ' and $i/chatbot_id = ' + ChatBotType.chatbot_id + ' and $i/chatbot_type_id = ' + ChatBotType.chatbot_type_id + ' return $i' ) );
				if( chat == undefined )
				{
					oRes.result = create_chat_chatbot( ChatBotType, message, teChatBot, iConversationID, oMessage );
					return oRes;
				}
				else
					curChatDoc = OpenDoc( UrlFromDocID( chat.id ) );
				ChatDoc = curChatDoc;
				chat = curChatDoc;

				curChatID = curChatDoc.DocID;
				sChatBotCode = bot_id;
				curChat = curChatDoc.TopElem;
				ChatDocTE = curChat;
				curChat.last_message_xml = message.Xml;
				if( curUserID == null )
				{
					curUserID = curChat.person_id;
				}
				oRequest.SetProperty( 'curUserID', curUserID );
				var tmpArr = new Array();

				if( curChat.chatbot_stage_id.HasValue )
				{
					iStageID = curChat.chatbot_stage_id
					teStage = OpenDoc( UrlFromDocID( curChat.chatbot_stage_id ) ).TopElem;
					stageDoc = ChatStageTE = teStage;
				}

				if( bWriteMessage || ( teStage == null || teStage.is_write_message ) )
				{
					add_message( curChatDoc.DocID, TEXT, curUserID, curChatDoc.TopElem, curChatDoc.TopElem.chatbot_stage_id, curChatDoc.TopElem.chatbot_stage_id, teChatBot, {}, iConversationID, bWriteMessage );
					curChatDoc.TopElem.last_message_id = '';
					curChatDoc.Save();
				}

				try
				{
					if( teChatBot.regular_eval_str.HasValue )
						if( eval( teChatBot.regular_eval_str ) )
							return;
				}
				catch( ex )
				{
					alerd( ex, ( teChatBot != null && teChatBot.logged ) );
				}

				if( message.type == 'start' )
				{
					if( teChatBot.start_chatbot_stage_id.HasValue )
						oRes.result = send_to_stage( ChatBotType.chatbot_code.Value, curChatDoc.DocID, teChatBot.start_chatbot_stage_id, curChatDoc, curChat.chatbot_stage_id, teChatBot, reWriteLastMessage, iConversationID, oRequest, oMessage, curUserID, curUser )
					return oRes;
				}
				var catUnknowCommand = teStage;
				var _unknow_command;
				for( _unknow_command in teStage.unknow_command_chatbot_stage.unknow_command_chatbot_stages )
				{
					if( check_command( _unknow_command, _unknow_command ) )
					{
						catUnknowCommand = _unknow_command;
						break;
					}
				}
				if( curChat.chatbot_stage_id.HasValue )
				{
					switch( teStage.action_type )
					{
						case 'custom_chatbot_template':
							try
							{
								if( teStage.custom_chatbot_template_id.HasValue )
								{
									eval_str = '';
									dCustomChatbotTemplate = OpenDoc( UrlFromDocID( teStage.custom_chatbot_template_id ) ).TopElem;
									curParameters = teStage.parameters;
									if( dCustomChatbotTemplate.exec_code.code_url.HasValue )
										eval_str = LoadUrlText( dCustomChatbotTemplate.exec_code.code_url );
									else
										eval_str = dCustomChatbotTemplate.eval_str;

									oCheckResult = check_standart_inline_commands()
									if( oCheckResult != 'not_find' )
									{
										oRes.result = oCheckResult;
										return oRes;
									}

									eval( eval_str );
								}
							}
							catch( ex )
							{
								alerd( ex, ( teChatBot != null && teChatBot.logged ) )
							}
							return oRes;

						case 'aiml':
							try
							{
								if( teStage.custom_chatbot_template_id.HasValue )
								{
									eval_str = '';

									oCheckResult = check_standart_inline_commands()
									if( oCheckResult != 'not_find' )
									{
										oRes.result = oCheckResult;
										return oRes;
									}

									dCustomChatbotTemplate = OpenDoc( UrlFromDocID( teStage.custom_chatbot_template_id ) ).TopElem;
									curParameters = teStage.parameters;
									eval_str = LoadUrlText( 'x-local://wtv/aiml/interpreter.js' );
									eval( eval_str );
								}
							}
							catch( ex )
							{
								alerd( ex, ( teChatBot != null && teChatBot.logged ) )
							}
							return oRes;
						case "close":
							if( curChat.state_id != "archive" )
							{
								curChat.state_id = "archive";
								curChatDoc.Save();
							}
							break;
						case 'standart':
							try
							{
								switch( teStage.command_eval_library.eval_code_type )
								{
									case "code_library":
										oResLib = eval_code_library_code( teStage.command_eval_library, curChat, TEXT, curUser, teStage, sWebsocketID );
										break;
									default:
										if( teStage.command_eval_str.HasValue )
										{
											eval( teStage.command_eval_str );
										}
										break;
								}
							}
							catch( ex )
							{
								alerd( ex, ( teChatBot != null && teChatBot.logged ) );
							}
							oCheckResult = check_standart_inline_commands()
							if( oCheckResult != 'not_find' )
							{
								oRes.result = oCheckResult;
								return oRes;
							}

							for( comm in teStage.commands )
							{
								if( check_command( comm, teStage ) )
								{
									switch( comm.command_action_library.eval_code_type )
									{
										case "code_library":
											oResLib = eval_code_library_code( comm.command_action_library, curChat, TEXT, get_cur_user(), teStage, sWebsocketID );
											break;
										default:
											eval( comm.command_action );
											break;
									}
									if( comm.chatbot_stage_id.HasValue )
									{
										oRes.result = send_to_stage( ChatBotType.chatbot_code.Value, curChatDoc.DocID, comm.chatbot_stage_id, curChatDoc, curChat.chatbot_stage_id, teChatBot, reWriteLastMessage, iConversationID, oRequest, oMessage, curUserID, curUser );
									}
									return oRes;
								}
							}
							if( ( !teStage.is_use_universal_commands || teStage.is_send_before_standart_command ) && ( catUnknowCommand.unknow_command_text.HasValue || catUnknowCommand.unknow_command_chatbot_stage_id.HasValue ) )
							{
								if( run_unknow_command_chatbot_stage( catUnknowCommand ) )
								{
									return oRes;
								}
							}
							break;


					}
				}
				oCheckResult = check_universal_commands();
				if( oCheckResult != 'not_find' )
				{
					oRes.result = oCheckResult
					return oRes;
				}
				if( curChat.chatbot_stage_id.HasValue )
				{
					switch( teStage.action_type )
					{
						case 'standart':
							if( teStage.is_use_universal_commands && !teStage.is_send_before_standart_command && ( catUnknowCommand.unknow_command_text.HasValue || catUnknowCommand.unknow_command_chatbot_stage_id.HasValue ) )
							{
								if( run_unknow_command_chatbot_stage( catUnknowCommand ) )
								{
									return oRes;
								}
							}
							break;
					}
				}
				catUnknowCommand = teChatBot;
				for( _unknow_command in teChatBot.unknow_command_chatbot_stage.unknow_command_chatbot_stages )
				{
					if( check_command( _unknow_command, _unknow_command ) )
					{
						catUnknowCommand = _unknow_command;
						break;
					}
				}
				if( catUnknowCommand.unknow_command_text.HasValue || catUnknowCommand.unknow_command_chatbot_stage_id.HasValue )
				{
					if( run_unknow_command_chatbot_stage( catUnknowCommand ) )
					{
						return oRes;
					}
				}
				break;

		}
		try{
			oRes.result = CallObjectMethod( spxmlCodeLib, 'GetNullAnswer', [ message.chat_id.Value, ChatBotType.chatbot_code.Value, ( curChat.lng_id.HasValue ? curChat.lng_id.ForeignElem.short_id.Value : 'ru' ), '' ] )
		}
		catch( ex )
		{
			oRes.error = 1;
			alerd( 'chatbot_request_processing ' + ex, ( teChatBot != null && teChatBot.logged ) );
		}
	}
	catch( err )
	{
		alerd( 'chatbot_request_processing ' + err, ( teChatBot != null && teChatBot.logged ) );
		try{
			oRes.result = CallObjectMethod( spxmlCodeLib, 'GetErrorAnswer', [ message.chat_id.Value, ChatBotType.chatbot_code.Value, ( curChat.lng_id.HasValue ? curChat.lng_id.ForeignElem.short_id.Value : 'ru' ), RValue( err ) ] )
		}
		catch( ex )
		{
			oRes.error = 1;
			alerd( 'chatbot_request_processing ' + ex, ( teChatBot != null && teChatBot.logged ) );
		}
	}

	return oRes;
}

function get_aiml_data( iCustomChatBotTemplateID, bIsForcibly, iCurChatID, curChat, teCustomChatBotTemplate )
{
	/*
		возвращает AIML по шаблону
		iCustomChatBotTemplateID	- ID настраиваемого шаблона чат-бота
		teCustomChatBotTemplate		- TopElem настраиваемого шаблона чат-бота
		bIsForcibly					- перезагрузить AIML
		iCurChatID					- id чата чат-бота
		curChat						- TopElem чата чат-бота
	*/
	oRes = new Object();
	oRes.error = 0;
	oRes.message = ''
	oRes.result = '';
	try
	{
		iCustomChatBotTemplateID = Int( iCustomChatBotTemplateID )
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'ID настраиваемого шаблона чат-бота';
		return oRes;
	}
	try
	{
		teCustomChatBotTemplate.Name;
	}
	catch( ex )
	{
		teCustomChatBotTemplate = OpenDoc( UrlFromDocID( iCustomChatBotTemplateID ) ).TopElem;
	}


	try
	{
		iCurChatID = Int( iCurChatID )
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'ID чата чат-бота';
		return oRes;
	}
	try
	{
		curChat.Name
	}
	catch( ex )
	{
		curChat = OpenDoc( UrlFromDocID( iCurChatID ) ).TopElem;
	}

	try
	{
		if( bIsForcibly == undefined || bIsForcibly == null )
			throw "error";
		bIsForcibly = tools_web.is_true( bIsForcibly );
	}
	catch( ex )
	{
		bIsForcibly = true;
	}

	function get_custom_template( iCustomTemplateID, teCustomTemplate )
	{
		try
		{
			iCustomTemplateID = Int( iCustomTemplateID );
		}
		catch( exx )
		{
			return '';
		}
		try
		{
			teCustomTemplate.Name
		}
		catch( ex )
		{
			try
			{
				teCustomTemplate = OpenDoc( UrlFromDocID( iCustomTemplateID ) ).TopElem;
			}
			catch( ex )
			{
				return '';
			}
		}
		var sTmpAiml = '';
		if( teCustomTemplate.out_type != 'aiml' )
			return '';

		if( teCustomTemplate.exec_code.code_url.HasValue )
			sTmpAiml = EvalCodePageUrl( teCustomTemplate.exec_code.code_url );
		else
			sTmpAiml = EvalCodePage( teCustomTemplate.eval_str )

		for( _temp in teCustomTemplate.include_custom_chatbot_templates )
			sTmpAiml += get_custom_template( _temp.PrimaryKey );

		return sTmpAiml
	}

	//arrAIMLData = curChat.aiml_datas.ObtainChildByKey( iCustomChatBotTemplateID ).data;
	arrAIMLData = tools_web.get_user_data( 'AIML_DATA_' + iCustomChatBotTemplateID );
	if ( bIsForcibly || arrAIMLData == null || arrAIMLData == undefined || arrAIMLData == '' )
	{
		var sXmlAiml = '';
		sXmlAiml += get_custom_template( iCustomChatBotTemplateID, teCustomChatBotTemplate );

		arrAIMLData = '<aiml>' + sXmlAiml + '</aiml>';
		eval( LoadUrlText( 'x-local://wtv/aiml/parser.js' ) );

		//curChat.aiml_datas.ObtainChildByKey( iCustomChatBotTemplateID ).data = arrAIMLData;
		tools_web.set_user_data( 'AIML_DATA_' + iCustomChatBotTemplateID, { 'aiml': arrAIMLData }, 86400 );
	}
	else
		arrAIMLData = arrAIMLData.aiml;

	oRes.result = arrAIMLData;

	return oRes;
}

function conversation_api( Request, Response, isWebSocket, Session, aAction, sWebsocketID )
{
	/*
		функция обрабатывает запрос от интерфейса чатов
		Request		- Объект Request
		Response	- Объект Response
		isWebSocket	- вызов из websocket
		Session		- Объект сессии
		aAction		- Объект с параметрами запроса
		sWebsocketID	- ID сокета
	*/
	var iCurTicks = GetCurTicks();
	alerd( 'conversation_api start ')
	try{
		if( Session == null || Session == undefined || Session == '' )
			throw 'not session'
	}
	catch( ex )
	{
		Session = Request.Session;
	}
	try{
		if( isWebSocket == null || isWebSocket == undefined || isWebSocket == '' )
			throw 'error';
		isWebSocket = tools_web.is_true( isWebSocket );
	}
	catch( ex )
	{
		isWebSocket = false;
	}
	var curUser, curUserID, curLngWeb, curLng;
	var oUserInit = tools_web.user_init( Request, ( isWebSocket ? {} : Request.Query ) );
	//Server.Execute( AppDirectoryPath() + '/wt/web/include/access_init.html' );

	if (!oUserInit.access)
	{
		if (oUserInit.error_code == 'empty_login' && Response != null )
		{
			Response.SetWrongAuth();
		}
		else
		{
			Request.SetRespStatus(403, 'Forbidden');
		}
		alerd( 'conversation_api finish ')
		return;
	}
	else
	{
		Session = Request.Session;
		curUserID = Session.Env.curUserID;
		curUser = Session.Env.curUser;
		curLngWeb = tools_web.get_default_lng_web( curUser );
	}

	function set_error( text_error, iError )
	{
		oAnswer.error = OptInt( iError, 1 );
		oAnswer.message = String( text_error );
		throw '!!!';
	}

	function get_object( id )
	{
		id = OptInt( id );
		gr = ArrayOptFind( arrObjectDoc, 'This.id == ' + id );
		if( gr == undefined )
		{
			gr = new Object();
			gr.id = id;
			gr.doc = OpenDoc( UrlFromDocID( id ) );
			arrObjectDoc.push( gr );
		}
		return gr;
	}
	function get_conversation_object()
	{
		if( teObject != null )
			return teObject;
		catConversation = ArrayOptFirstElem( XQuery( "for $elem in conversations where $elem/id = " + iConversationID + " return $elem" ) );
		if( catConversation == undefined )
		{
			set_error( StrReplace( 'Не найдено объекта с ID {PARAM1}', '{PARAM1}', iConversationID ) );
		}

		teObject = tools.open_doc( catConversation.active_object_id ).TopElem;
		return teObject;
	}
	function check_selectable( oObj )
	{
		switch( sAction.action )
		{
			case 'get_custom_request_participants_conversation':
				if( ArrayOptFind( get_conversation_object().workflow_matchings, "This.person_id == oObj.id && This.type == 'participant'" ) == undefined )
				{
					oObj.selectable = false;
					oObj.comment = "Сотрудник не может быть исключен из разговора";
				}
				break;

			case 'get_collaborators':
				if( ArrayOptFind( oResOperations.recipients, "This == oObj.id" ) != undefined )
				{
					oObj.selectable = false;
					oObj.comment = "Сотрудник является участником разговора";
				}
				break;
			case 'get_prohibition_to_write_participants':
				if( ArrayOptFind( teConversation.prohibitions, "This.person_id == oObj.id && This.type_id == 'prohibition_to_write'" ) != undefined )
				{
					oObj.selectable = false;
					oObj.comment = "Сотруднику уже заблокирована возможность писать в чат";
				}
				break;
		}
		oObj.id = String( oObj.id );
		return oObj;
	}
	try
	{
		if( aAction == null || aAction == undefined || aAction == '' )
		{
			throw 'error';
		}
	}
	catch( ex )
	{
		if( Request.QueryString.GetOptProperty( 'action' ) != undefined )
		{
			aAction = tools.read_object( UrlDecode( Request.QueryString.GetOptProperty( 'action', '{}' ) ) );
		}
		else
		{
			aAction = Request.Form;
		}
	}
	function check_priority( sType )
	{
		switch( sType )
		{
			case "get_my_conversations":
				return 10;
			default:
				return 0;
		}
	}
	var bArray = IsArray( aAction );
	if( !bArray )
	{
		aAction = [ aAction ];
	}
	aAction = ArraySort( aAction, "check_priority( This.action )", "+" );
	var xHttpStaticAssembly = null;
	var arrGetMyConversations, bShowPublic, bUpdateState, oSearchParam, sQueryQual, sStateID, oResConversations;
	var arrObjectDoc = new Array();
	var oAnswer = new Object();
	var sAction, sObjectTypes, bReverse;
	var oResTemp;
	var iPageSize;
	var iLastConversationID, aSort, arrTempArray, _elem, bFound, iCount, i, _type;
	
	tools_web.set_user_data( "person_last_activity_date_" + curUserID, Date(), 3600 );
	for( sAction in aAction )
	{
		try
		{
			alerd( 'conversation_api sAction.action ' + sAction.action)
			oAnswer = new Object();
			oAnswer.error = 0;
			oAnswer.action = sAction.action;
			oAnswer.uid = sAction.GetOptProperty( 'uid', "" );
			oAnswer.SetProperty( "cur_user_id", RValue( curUserID ) );
			oAnswer.SetProperty( "cur_user_fullname", RValue( curUser.fullname ) );
			switch( sAction.action )
			{
				case "ping":
				case "heartbeat":
					break;
				case 'get_my_conversations':
				{
					bReverse = tools_web.is_true( sAction.GetOptProperty( 'reverse', 0 ) );
					
					arrGetMyConversations = new Array();
					arrGetMyConversations.push( 0 );
					if( isWebSocket && tools_web.is_true( sAction.GetOptProperty( "lite_data", false ) ) && false )
					{
						arrGetMyConversations.push( 1 );
					}
					bShowPublic = sAction.GetOptProperty( 'show_public', true );
					bUpdateState = sAction.GetOptProperty( 'update_state', true );
					oSearchParam = sAction.GetOptProperty( 'search_param', {} );
					sQueryQual = sAction.GetOptProperty( 'query_qual', '' );
					sStateID = sAction.GetOptProperty( 'state_id', 'active' );
					sObjectTypes = sAction.GetOptProperty( 'object_type', 'chat;chatbot_chat;task' );
					iLastConversationID = OptInt( sAction.GetOptProperty( "last_conversation_id" ) );
					iPageSize = OptInt( sAction.GetOptProperty( "page_size" ) );
					aSort = sAction.GetOptProperty( "sort" );
					if( sObjectTypes == "all" )
					{
						sObjectTypes = ArrayMerge( common.conversation_object_types, "This.object_type", ";" );
					}
					for( _type in ArraySort( arrGetMyConversations, "This", "-" ) )
					{
						oResConversations = get_conversations( curUserID, sStateID, sQueryQual, null, false, Request.Session, null, sObjectTypes, bShowPublic, bUpdateState, curUser, oSearchParam, _type, ( IsArray( aSort ) && ArrayOptFirstElem( aSort ) != undefined ? null : iPageSize ), ( IsArray( aSort ) && ArrayOptFirstElem( aSort ) != undefined ? null : iLastConversationID ) );

						oAnswer = oResConversations;
						oAnswer.SetProperty( "cur_user_id", RValue( curUserID ) );
						oAnswer.SetProperty( "cur_user_fullname", RValue( curUser.fullname ) );
						oAnswer.SetProperty( "lite_data", false );
						oAnswer.SetProperty( "more", oResConversations.more );
						oAnswer.SetProperty( "action", sAction.action );
						oAnswer.SetProperty( "uid", sAction.GetOptProperty( 'uid', "" ) );
						if( IsArray( aSort ) && ArrayOptFirstElem( aSort ) != undefined )
						{
							for( i = ArrayCount( aSort ) - 1; i >= 0; i-- )
							{
								oAnswer.conversations = ArraySort( oAnswer.conversations, aSort[ i ].field, ( aSort[ i ].direction == "asc" ? "+" : "-" ) );
							}
						
							if( iPageSize != undefined )
							{
								arrTempArray = new Array();
								bFound = iLastConversationID == undefined;
								iCount = 0;
								for( _elem in oAnswer.conversations )
								{
									if( iCount >= iPageSize )
									{
										oAnswer.more = true;
										break;
									}
									if( _elem.id == iLastConversationID )
									{
										bFound = true;
										continue;
									}
									if( !bFound )
									{
										continue;
									}
									arrTempArray.push( _elem );
									iCount++;
								}
								oAnswer.conversations = arrTempArray;
							}
						}
						else
						{
							oAnswer.SetProperty( "more", oResConversations.more );
						}
						if( _type == 1 )
						{
							oAnswer.SetProperty( "lite_data", true );
							if( xHttpStaticAssembly == null )
							{
								xHttpStaticAssembly = tools.get_object_assembly( 'XHTTPMiddlewareStatic' );
							}
							xHttpStaticAssembly.CallClassStaticMethod( 'Datex.XHTTP.WebSocketContext', 'WriteToWebSocketMessageQueue', [ sWebsocketID, EncodeJson( oAnswer, { ExportLargeIntegersAsStrings: true } ), true ] );
						}
						bUpdateState = false;
					}
					//sPrimaryKey = 'unread_messages_' + curUserID + '_' + Request.Session.sid;
					//tools_web.set_user_data( sPrimaryKey, { last_date: RValue( Date() ) }, 3600 );
					break;
				}
				case 'get_last_messages':
				{
					iCurrentConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ) );
					docConversation = tools.open_doc( iCurrentConversationID );

					if( ArrayOptFind( get_recipients( iCurrentConversationID, docConversation.TopElem ).recipients, 'This == curUserID' ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( 'У вас нет прав на выполнение данного действия', 403 );
					}
					oAnswer.conversation_id = iCurrentConversationID;
					sPrimaryKey = 'unread_messages_' + curUserID + '_' + Request.Session.sid;
					//alert(sPrimaryKey)
					oUnreadMessages = tools_web.get_user_data( sPrimaryKey );
					dLastDate = null;
					if ( oUnreadMessages != null )
					{
						dLastDate = oUnreadMessages.GetOptProperty( 'last_date', null );
					}
					oUnreadMessages = new Object();
					oUnreadMessages.unread_messages = new Array();
					oUnreadMessages.last_date = StrDate( Date() );
					oUnreadMessages.unread_messages = get_conversations( curUserID, 'active', sAction.GetOptProperty( 'query_qual', '' ), dLastDate, true, Request.Session, iCurrentConversationID, sAction.GetOptProperty( 'object_type', 'chat;chatbot_chat' ), sAction.GetOptProperty( 'show_public', true ), sAction.GetOptProperty( 'update_state', true ), curUser ).conversations;
					tools_web.set_user_data( sPrimaryKey, { last_date: oUnreadMessages.last_date }, 3600 );

					oAnswer.data = oUnreadMessages
					break;
				}
				case "get_calls":
				{
					oAnswer.SetProperty( "calls", GetPersonCalls( curUserID, sAction.GetOptProperty( "states", [ "close", "active" ] ), sAction.GetOptProperty( "page_num" ), sAction.GetOptProperty( "page_size" ), sAction.GetOptProperty( "conversation_id" ) ).array );
					break;
				}
				case "get_conversation_files":
				{
					iCurrentConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ) );
					docConversation = tools.open_doc( iCurrentConversationID );

					if( ArrayOptFind( get_recipients( iCurrentConversationID, docConversation.TopElem ).recipients, 'This == curUserID' ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( 'У вас нет прав на выполнение данного действия', 403 );
					}
					oResTemp = GetConversationFiles( curUserID, curUser, iCurrentConversationID, docConversation, sAction.GetOptProperty( "page_num" ), sAction.GetOptProperty( "page_size" ), Request.Session );
					oAnswer.SetProperty( "files", oResTemp.array );
					oAnswer.SetProperty( "more", oResTemp.more );
					break;
				}
				case "get_conversation_links":
				{
					iCurrentConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ) );
					docConversation = tools.open_doc( iCurrentConversationID );

					if( ArrayOptFind( get_recipients( iCurrentConversationID, docConversation.TopElem ).recipients, 'This == curUserID' ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( 'У вас нет прав на выполнение данного действия', 403 );
					}
					oResTemp = GetConversationLinks( curUserID, curUser, iCurrentConversationID, docConversation, sAction.GetOptProperty( "page_num" ), sAction.GetOptProperty( "page_size" ), Request.Session );
					oAnswer.SetProperty( "links", oResTemp.array );
					oAnswer.SetProperty( "more", oResTemp.more );
					break;
				}
				case "get_web_person_states":
				{
					oAnswer.SetProperty( "web_person_states", [] );
					sType = sAction.GetOptProperty( "type_id", "general" );
					for( _wps in XQuery( "for $elem in web_person_states where $elem/type_id = " + XQueryLiteral( sType ) + " return $elem" ) )
					{
						oAnswer.web_person_states.push( { id: _wps.id.Value, code: _wps.code.Value, name: _wps.name.Value } );
					}
					break;
				}
				case 'send_message':
				case 'edit_message':
				{
					iConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ) );
					
					sMessageText = sAction.GetOptProperty( 'message_text', '' );
					sMessageID = sAction.GetOptProperty( 'message_id', "" );
					iBlockMessageID = OptInt( sAction.GetOptProperty( 'block_message_id', "" ) );
					catMessage = undefined;
					if( sAction.action == "edit_message" )
					{
						//oResOperations = get_operations_conversation( iConversationID, curUserID, null, curUser, null );
						if( sMessageID == "" )
						{
							set_error( "Некорректный ID сообщения" );
						}
						for( _bm in tools.xquery( "for $elem in block_messages where $elem/object_id = " + iConversationID + " " + ( iBlockMessageID != undefined ? ( " and $elem/id = " + iBlockMessageID ) : "" ) + " return $elem/id, $elem/__data" ) )
						{
							docBlockMessage = tools.open_doc( _bm.id );
							if( docBlockMessage == undefined )
							{
								continue;
							}
							catMessage = docBlockMessage.TopElem.messages.GetOptChildByKey( sMessageID );
							if( catMessage != undefined )
							{
								iBlockMessageID = _bm.id;
								break;
							}
						}
						if( catMessage == undefined )
						{
							set_error( "Некорректный ID сообщения" );
						}
						if( catMessage.object_id != curUserID )
						{
							set_error( "У вас нет прав на редактирование этого сообщения", 403 );
						}
					}
					if( sMessageID == "" )
					{
						sMessageID = tools.random_string( 6 );
					}

					arrFile = sAction.GetOptProperty( 'files', ([]) );
					if( !IsArray( arrFile ) )
					{
						arrFile = RValue( arrFile );
						switch( DataType( arrFile ) )
						{
							case "string":
								arrFile = Trim( arrFile );
								if( StrBegins( arrFile, "[" ) )
								{
									arrFile = ParseJson( arrFile );
									break;
								}
							default:
								if( OptInt( arrFile ) != undefined )
								{
									iTempFileID = OptInt( arrFile );
									arrFile = new Array();
									arrFile.push( iTempFileID );
								}
								else
								{
									arrFile = new Array();
								}
								break;
						}
					}

					arrFile = ArraySelect( ArrayExtract( arrFile, "OptInt( This )" ), "This != undefined" );

					oFileData = sAction.GetOptProperty( 'file_data' );
					if( oFileData != undefined && oFileData != '' )
					{
						oRes = create_resource( oFileData, curUserID, false, curUser );
						if( oRes.error == 0 )
							arrFile.push( oRes.doc.DocID )
					}
					else
					{
						iCntFile = 0;
						while( true )
						{
							oFileData = sAction.GetOptProperty( 'file-' + iCntFile )
							if( oFileData != undefined )
							{
								oRes = create_resource( oFileData, curUserID, false, curUser );
								if( oRes.error == 0 )
									arrFile.push( oRes.doc.DocID )
							}
							else
							{
								break;
							}
							iCntFile++;
						}
					}
					oMessageData = null;
					if( sAction.GetOptProperty( 'button_code', '' ) != '' )
					{
						oMessageData = new Object();
						oMessageData.inline_button_id = sAction.GetOptProperty( 'button_code', '' );
					}
					arrRecipients = null;
					if( sAction.GetOptProperty( 'message_recipients', null ) != null )
					{
						arrRecipients = tools.read_object( sAction.GetOptProperty( 'message_recipients', null ) );
					}
					arrDispRoles = null;
					if( sAction.GetOptProperty( 'disp_roles', null ) != null )
					{
						arrDispRoles = tools.read_object( sAction.GetOptProperty( 'disp_roles', null ) );
					}
					try
					{
						oForwardData = sAction.GetOptProperty( "forward", ({}) );
						if( StrBegins( RValue( oForwardData ), "{" ) || StrBegins( RValue( oForwardData ), "[" ) )
						{
							oForwardData = ParseJson( RValue( oForwardData ) );
						}
					}
					catch( ex )
					{
						oForwardData = null;
					}
					
					arrConversationIds = new Array();
					if( iConversationID == undefined )
					{
						arrConversationIds = sAction.GetOptProperty( "conversation_ids", [] );
						if( !IsArray( arrConversationIds ) )
						{
							arrConversationIds = RValue( arrConversationIds );
							switch( DataType( arrConversationIds ) )
							{
								case "string":
								{
									arrConversationIds = Trim( arrConversationIds );
									if( StrBegins( arrConversationIds, "[" ) )
									{
										arrConversationIds = ParseJson( arrConversationIds );
										break;
									}
								}
								default:
								{
									if( OptInt( arrConversationIds ) != undefined )
									{
										iTempID = OptInt( arrConversationIds );
										arrConversationIds = new Array();
										arrConversationIds.push( iTempID );
									}
									else
									{
										arrConversationIds = new Array();
									}
									break;
								}
							}
						}
					}
					else
					{
						arrConversationIds.push( iConversationID );
					}
					if( !IsArray( arrConversationIds ) || ArrayOptFirstElem( arrConversationIds ) == undefined )
					{
						set_error( "Не прислан ID разговора." );
					}
					arrForwardDatas = new Array();
					if( oForwardData != null )
					{
						if( IsArray( oForwardData ) )
						{
							arrForwardDatas = oForwardData;
						}
						else
						{
							arrForwardDatas.push( oForwardData );
						}
					}
					sError = "";
					for( iConversationID in arrConversationIds )
					{
						iConversationID = OptInt( iConversationID );
						oAnswer.conversation_id = iConversationID;
						try
						{
							teConversation = OpenDoc( UrlFromDocID( iConversationID ) ).TopElem;
						}
						catch( ex )
						{
							sError += ( sError != "" ? "\n" : "" ) + "При отправки сообщения в разговор " + iConversationID + " произошла ошибка - " + ( StrReplace( 'Не найдено объекта с ID {PARAM1}', '{PARAM1}', iConversationID )  );
							continue;
						}
						oResOperations = get_operations_conversation( iConversationID, curUserID, teConversation, curUser, null );
						if( ArrayOptFind( oResOperations.operations, 'This.id == \'write_message\'' ) == undefined )
						{
							sError += ( sError != "" ? "\n" : "" ) + "При отправки сообщения в разговор " + get_data_conversation( iConversationID, curUserID, teConversation ).name + " произошла ошибка - " +  ( 'У вас нет прав на выполнение данного действия'  );
							continue;
						}
						
						if( sAction.action == "edit_message" )
						{
							//oResOperations = get_operations_conversation( iConversationID, curUserID, null, curUser, null );

							catOperation = ArrayOptFind( oResOperations.operations, "This.id == 'edit_conversation_messages'");
							if( catOperation == undefined )
							{
								sError += ( sError != "" ? "\n" : "" ) + "При отправки сообщения в разговор " + get_data_conversation( iConversationID, curUserID, teConversation ).name + " произошла ошибка - " +  ( 'У вас нет прав на выполнение данного действия'  );
								continue;
							}
						}
						oResSendMesssage = write_message( HtmlEncode( sMessageText ), iConversationID, teConversation, curUserID, curUser, arrFile, [], sMessageID, oMessageData, sAction.GetOptProperty( 'message_type', 'message' ), arrRecipients, arrDispRoles, false, ( sAction.action == "edit_message" ? "edit" : null ), iBlockMessageID, catMessage, sWebsocketID, sAction.GetOptProperty( "reply" ) );
						if( oResSendMesssage.error != 0 && oForwardData == null )
						{
							sError += ( sError != "" ? "\n" : "" ) + "При отправки сообщения в разговор " + get_data_conversation( iConversationID, curUserID, teConversation ).name + " произошла ошибка - " +  ( oResSendMesssage.message );
							continue;
						}
						
					
						for( oForwardData in arrForwardDatas )
						{
							if( oForwardData.GetOptProperty( "message_id", "" ) == "" || OptInt( oForwardData.GetOptProperty( "conversation_id", "" ) ) == undefined )
							{
								continue;
							}
							catForwardMessage = get_message_by_message_id( oForwardData.message_id, oForwardData.GetOptProperty( "block_message_id" ), oForwardData.conversation_id );
							if( catForwardMessage.error == 0 )
							{
								oResSendMesssage = write_message( catForwardMessage.cat_message.text, iConversationID, teConversation, curUserID, curUser, ArrayExtract( catForwardMessage.cat_message.files, "This.PrimaryKey" ), [], null, null, "forward", arrRecipients, arrDispRoles, false, null, null, null, sWebsocketID, null, oForwardData );
								if( oResSendMesssage.error != 0 )
								{
									set_error( oResSendMesssage.message );
									sError += ( sError != "" ? "\n" : "" ) + "При отправки сообщения в разговор " + get_data_conversation( iConversationID, curUserID, teConversation ).name + " произошла ошибка - " +  ( oResSendMesssage.message );
									break;
								}
							}
						}
						
						oAnswer.message_id = sMessageID;
					}
					if( sError != "" )
					{
						set_error( sError );
					}
					
					break;
				}
				case 'get_conversation_messages':
				{
					iConversationID = Int( sAction.GetOptProperty( 'conversation_id' ) );
					docConversation = tools.open_doc( iConversationID );

					if( ArrayOptFind( get_recipients( iConversationID, docConversation.TopElem ).recipients, 'This == curUserID' ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( 'У вас нет прав на выполнение данного действия', 403 );
					}
					iPageSize = OptInt( sAction.GetOptProperty( 'page_size' ), 100 );
					iPageNum = OptInt( sAction.GetOptProperty( 'page_num' ), 1 );
					bCheckUnreadMessage = tools_web.is_true( sAction.GetOptProperty( 'check_unread_message', 0 ) );
					bReverse = tools_web.is_true( sAction.GetOptProperty( 'reverse', 0 ) );
					oAnswer.conversation_id = iConversationID;
					oResConversationMessages = get_conversation_messages( iConversationID, curUserID, Request.Session, null, curUser, iPageNum, iPageSize, bCheckUnreadMessage, null, null, false, null, null, false, sAction.GetOptProperty( "first_loaded_message_id", "" ), sAction.GetOptProperty( "search_text", "" ), sAction.GetOptProperty( "return_all", "" ) );
					if( bReverse )
					{
						arrMessages = new Array();
						for( i = ArrayCount( oResConversationMessages.messages ) - 1; i >=0; i-- )
						{
							arrMessages.push( oResConversationMessages.messages[ i ] );
						}
						oResConversationMessages.messages = arrMessages;
					}
					oAnswer.messages = oResConversationMessages.messages;
					oAnswer.is_load_more = !oResConversationMessages.last_page;
					break;
				}
				case 'get_operations':
				{
					oAnswer.operations = new Array();
					iConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ) );
					oAnswer.conversation_id = iConversationID;
					oAnswer.operations = get_operations_conversation( iConversationID, curUserID, null, curUser, null ).operations;

					break;
				}
				case 'create_conversation':
					sAction.SetProperty( "operation", "create_conversation" );
				case 'operation':
				{
					sOperationName = sAction.GetOptProperty( 'operation' );
					iParticipantID = OptInt( sAction.GetOptProperty( 'participant_id' ), null );

					iConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ), null );
					oAnswer.conversation_id = iConversationID;
					oResOperations = get_operations_conversation( iConversationID, curUserID, null, curUser, null );

					catOperation = ArrayOptFind( oResOperations.operations, 'This.id == sOperationName' );
					if( catOperation == undefined )
					{
						set_error( 'У вас нет прав на выполнение данного действия', 403 );
					}
					if (sOperationName != 'add_participant_conversation')
					{
						oAnswer.middle_action = catOperation.GetOptProperty( "middle_action", "" );
					}
					switch( sOperationName )
					{
						case 'create_conversation':

							iConversationTypeID = OptInt( sAction.GetOptProperty( 'conversation_type_id' ) );
							sOperationType = sAction.GetOptProperty( 'operation_type', 'change' );
							iChatbotID = OptInt( sAction.GetOptProperty( 'chatbot_id', null ) );
							arrParticipants = ( sAction.GetOptProperty( 'participants', '' ) != '' ? ( IsArray( sAction.GetOptProperty( 'participants', '' ) ) ? sAction.GetOptProperty( 'participants', '' ) : String( sAction.GetOptProperty( 'participants', '' ) ).split( ',' ) ) : [] );
							arrParticipants.push( curUserID );
							arrParticipants = ArraySelectDistinct( arrParticipants, "OptInt( This )" );
							if( ArrayOptFirstElem( arrParticipants ) != undefined )
							{
								if( ArrayOptFind( arrParticipants, "OptInt( This ) == curUserID" ) == undefined )
								{
									set_error( 'У вас нет прав на выполнение данного действия', 403 );
								}
							}

							sConversationName = sAction.GetOptProperty( 'conversation_name', '' );
							if( sConversationName == "" )
							{
								if( ArrayCount( arrParticipants ) == 2 )
								{
									xarrParticipantCollaborators = XQuery( "for $elem in collaborators where MatchSome( $elem/id, ( " + ArrayMerge( arrParticipants, "This", "," ) + " ) ) return $elem/Fields('fullname')" );
									sConversationName = ArrayMerge( xarrParticipantCollaborators, "This.fullname", ", " );
								}
								else
								{
									set_error( "Название не может быть пустым." );
								}
							}
							bCreateNewConversation = tools_web.is_true( sAction.GetOptProperty( 'create_new_conversation', true ) );
							if( iConversationTypeID == undefined )
							{
								catConversationType = ArrayOptFirstElem( XQuery( 'for $elem in conversation_types where $elem/code = \'support\' return $elem' ) );
								if( catConversationType != undefined )
									iConversationTypeID = catConversationType.id;
							}
							if( sOperationType == "change" && !bCreateNewConversation && ArrayCount( arrParticipants ) == 2 )
							{
								chat_conds = new Array();
								chat_conds.push( "$elem/prohibited = false()" );
								chat_conds.push( "$elem/partner_prohibited = false()" );
								chat_conds.push( "$elem/partner_confirmed = true()" );
								chat_conds.push( "$elem/confirmed = true()" );
								chat_conds.push( "( ( $elem/partner_id = " + arrParticipants[ 0 ] + " and $elem/person_id = " + arrParticipants[ 1 ] + " ) or ( $elem/partner_id = " + arrParticipants[ 1 ] + " and $elem/person_id = " + arrParticipants[ 0 ] + " ) )" );
								xarrPersonalChat = XQuery( "for $elem in personal_chats where " + ArrayMerge( chat_conds, "This", " and " ) + " return $elem" );
								if( ArrayOptFirstElem( xarrPersonalChat ) != undefined )
								{
									catConversation = ArrayOptFirstElem( XQuery( "for $elem in conversations where $elem/state_id = 'active' and MatchSome( $elem/active_object_id, ( " + ArrayMerge( xarrPersonalChat, "This.chat_id", "," ) + " ) ) return $elem" ) );
									if( catConversation != undefined )
									{
										oDisplayForm = new Object();
										oDisplayForm.type = "display_form";
										oDisplayForm.message = "У вас уже есть разговор с выбранным пользователем. Продолжить предыдущий разговор или создать новый?";
										oDisplayForm.buttons = new Array();
										oDisplayForm.buttons.push( { "title": "Продолжить предыдущий разговор", action_type: "open_conversation", conversation_id: catConversation.id.Value } );
										oButton = new Object();
										oButton.title = "Создать новый";
										oButton.action_type = "call_method_conversation_api";
										oButton.params = sAction;
										for( _param in sAction )
										{
											switch( _param )
											{
												case "action":
												{
													oButton.params.SetProperty( _param, "create_conversation" );
													break;
												}
												case "operation":
												{
													break;
												}
												default:
												{
													oButton.params.SetProperty( _param, sAction.GetOptProperty( _param ) );
												}
											}
										}
										oButton.params.SetProperty( "create_new_conversation", true );
										oDisplayForm.buttons.push( oButton );
										oAnswer.action_result = oDisplayForm;
										break;
									}
								}
							}

							oRes = change_participants_conversation( null, null, sOperationType, iParticipantID, arrParticipants, iChatbotID, iConversationTypeID, null, null, sConversationName, curUserID, true );
							if( oRes.error == 0 )
							{
								docConversation = oRes.doc_conversation;
								oFileData = sAction.GetOptProperty( 'file_data' );
								if( oFileData != undefined )
								{
									oResourceRes = create_resource( oFileData, curUserID, false, curUser )
									if( oResourceRes.error == 0 )
									{
										docConversation.TopElem.resource_id = oResourceRes.doc.DocID;
										docConversation.Save();
									}
								}
								bMedia = sAction.GetOptProperty( "media", false );
								if( bMedia )
								{
									teCommand = OpenDocFromStr( tools.xml_header() + '<queue_call/>' ).TopElem;
									teCommand.AddChild( 'type', 'string' ).Value = 'create_call';
									teCommand.AddChild( 'conversation_id', 'integer' ).Value = docConversation.DocID;
									teCommand.AddChild( 'user_id', 'integer' ).Value = curUserID;
									tools.put_message_in_queue( 'call-queue', teCommand.GetXml( { 'tabs': false } ) );
								}

							}
							else
							{
								set_error( oRes.message );
							}

							break;

						case 'del_request_participant_conversation':
						case 'add_request_participant_conversation':
						case 'del_task_participant_conversation':
						case 'add_task_participant_conversation':

							arrParticipants = new Array();
							if( iParticipantID != undefined )
								arrParticipants.push( iParticipantID );
							for( _participant in ( sAction.GetOptProperty( 'participants', '' ) != '' ? ( IsArray( sAction.GetOptProperty( 'participants', '' ) ) ? sAction.GetOptProperty( 'participants', '' ) : String( sAction.GetOptProperty( 'participants', '' ) ).split( ',' ) ) : [] ) )
								if( OptInt( _participant ) != undefined )
									arrParticipants.push( OptInt( _participant ) );
							change_participants_conversation( iConversationID, null, StrReplace( sOperationName, '_participant_conversation', '' ), null, arrParticipants );


							break;
						case 'del_object_participant_conversation':
						case 'add_object_participant_conversation':

							arrParticipants = new Array();
							if( iParticipantID != undefined )
								arrParticipants.push( iParticipantID );
							for( _participant in ( sAction.GetOptProperty( 'participants', '' ) != '' ? ( IsArray( sAction.GetOptProperty( 'participants', '' ) ) ? sAction.GetOptProperty( 'participants', '' ) : String( sAction.GetOptProperty( 'participants', '' ) ).split( ',' ) ) : [] ) )
								if( OptInt( _participant ) != undefined )
									arrParticipants.push( OptInt( _participant ) );
							change_participants_conversation_queue( iConversationID, null, StrReplace( sOperationName, '_participant_conversation', '' ), null, arrParticipants );
							break;
						case 'prohibition_to_write_messages':
						case 'allow_to_write_messages':

							arrParticipants = new Array();
							if( iParticipantID != undefined )
								arrParticipants.push( iParticipantID );
							for( _participant in ( sAction.GetOptProperty( 'participants', '' ) != '' ? ( IsArray( sAction.GetOptProperty( 'participants', '' ) ) ? sAction.GetOptProperty( 'participants', '' ) : String( sAction.GetOptProperty( 'participants', '' ) ).split( ',' ) ) : [] ) )
								if( OptInt( _participant ) != undefined )
									arrParticipants.push( OptInt( _participant ) );

							docConversation = OpenDoc( UrlFromDocID( iConversationID ) );
							for( _participant in arrParticipants )
							{
								catProhibition = ArrayOptFind( docConversation.TopElem.prohibitions, "This.person_id == _participant && This.type_id == 'prohibition_to_write'" );
								switch( sOperationName )
								{
									case "prohibition_to_write_messages":
										if( catProhibition == undefined )
										{
											catProhibition = docConversation.TopElem.prohibitions.AddChild();
											catProhibition.person_id = _participant;
											catProhibition.type_id = "prohibition_to_write";
										}
										break;
									case "allow_to_write_messages":
										if( catProhibition != undefined )
										{
											catProhibition.Delete();
										}
										break;
								}
							}
							docConversation.Save();
							break;
						case "additional_info":
							catConversation = ArrayOptFirstElem( XQuery( "for $elem in conversations where $elem/id = " + iConversationID + " return $elem/Fields( 'conversation_type_id' )" ) );
							oAnswer.additional_info_url = "";
							if( catConversation != undefined && catConversation.conversation_type_id.HasValue )
							{
								feConversationType = catConversation.conversation_type_id.OptForeignElem;
								if( feConversationType != undefined && feConversationType.use_additional_info_script )
								{
									try
									{
										teConversationType = OpenDoc( UrlFromDocID( catConversation.conversation_type_id ) ).TopElem;
										oAnswer.additional_info_url = tools.safe_execution( ( teConversationType.additional_info_script_url.HasValue ? LoadUrlText( teConversationType.additional_info_script_url ) : teConversationType.additional_info_script ) );
									}
									catch( ex )
									{
										alerd( 'conversation api open_conversation ' + ex )
									}
								}
							}
							break;
						default:
							try
							{
								docConversation = OpenDoc( UrlFromDocID( iConversationID ) );
							}
							catch( ex )
							{
								set_error( StrReplace( 'Не найдено объекта с ID {PARAM1}', '{PARAM1}', iConversationID ) );
							}
							if( StrEnds( sOperationName, "_participant_conversation" ) )
							{
								arrParticipants = ( sAction.GetOptProperty( 'participants', '' ) != '' ? ( IsArray( sAction.GetOptProperty( 'participants', '' ) ) ? sAction.GetOptProperty( 'participants', '' ) : String( sAction.GetOptProperty( 'participants', '' ) ).split( ',' ) ) : [] );
								change_participants_conversation( iConversationID, docConversation, StrReplace( sOperationName, '_participant_conversation', '' ), iParticipantID, arrParticipants );
							}
							else
							{

							}
							break;
					}
					break;
				}
				case 'get_collaborators':
					bAccess = false;
					catCatalogRemoteCollection = ArrayOptFirstElem( XQuery( "for $elem in remote_collections where $elem/code = 'uni_catalog_list_collaborator' return $elem/Fields('id')" ) );
					if ( catCatalogRemoteCollection != undefined )
					{
						bAccess = tools_web.check_access( OpenDoc( UrlFromDocID ( catCatalogRemoteCollection.id ), "form=x-local://wtv/wtv_form_doc_access.xmd;ignore-top-elem-name=1" ).TopElem, curUserID, curUser, Session );
					}

					if( !bAccess )
					{
						set_error( "У вас нет прав на получение списка сотрудников.", 403 );
					}
				case 'get_custom_request_participants_conversation':
				case 'get_participants_conversation':
				{
					iConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ) );

					oAnswer.conversation_id = iConversationID;
					oAnswer.is_filtered = false;
					iPageSize = OptInt( sAction.GetOptProperty( 'page_size' ) );
					iPageNum = OptInt( sAction.GetOptProperty( 'page_num' ), 1 );

					oResOperations = get_operations_conversation( iConversationID, curUserID, null, curUser, null );
					if( oResOperations.error == 1 )
					{
						set_error( oResOperations.message );
					}
					teObject = null;
					teConversation = oResOperations.conversation_top_elem;
					conds = new Array();

					switch( sAction.action )
					{
						case 'get_participants_conversation':
						case 'get_custom_request_participants_conversation':
						case 'get_prohibition_to_write_participants':
							oAnswer.disp_roles = new Array();
							for( _disp_role in oResOperations.disp_roles )
							{
								oAnswer.disp_roles.push( { id: _disp_role.id.Value, name: _disp_role.name.Value } );
							}
							//arrRecipients = ArraySelect( oResOperations.recipients, 'This != curUserID' );
							arrRecipients = oResOperations.recipients;
							conds.push( 'MatchSome( $elem/id, ( ' + ArrayMerge( arrRecipients, 'This', ',' ) + ' ) )' );
							break;
						case 'get_allow_to_write_participants':
							oAnswer.disp_roles = new Array();
							for( _disp_role in oResOperations.disp_roles )
							{
								oAnswer.disp_roles.push( { id: _disp_role.id.Value, name: _disp_role.name.Value } );
							}
							arrProhibitions = ArraySelect( teConversation.prohibitions, "This.person_id.HasValue && This.type_id == 'prohibition_to_write'" )
							if( ArrayOptFirstElem( arrProhibitions ) == undefined )
							{
								return oRes;
							}
							conds.push( 'MatchSome( $elem/id, ( ' + ArrayMerge( arrProhibitions, 'This.person_id', ',' ) + ' ) )' );
							break;
						default:
							conds.push( '$elem/allow_personal_chat_request = true()' );
							conds.push( '$elem/is_dismiss != true()' );
							bBreak = false;
							col_conds = new Array();
							if( true )
								switch( oResOperations.type )
								{
									case 'all':
										bBreak = true;
										break;
									case 'boss':
										curSubPersonIDs = tools.get_sub_person_ids_by_func_manager_id( curUserID, null, null, null, sAction.GetOptProperty( 'search_fullname', '' ) );
										col_conds.push( 'MatchSome( $elem/id, ( ' + ArrayMerge( curSubPersonIDs, 'This', ',' ) + ' ) )' );
										break;
									case 'colleagues':
										col_conds.push( '$elem/org_id = ' + ( curUser.org_id.HasValue ? curUser.org_id : 'null()' ) );
										break;
								}
							if( bBreak )
								break;
							arrRecipients = new Array();
							if( ArrayOptFirstElem( col_conds ) != undefined )
								conds.push( '(' + ArrayMerge( col_conds, 'This', ' or ' ) + ')' );

							break;
					}

					xarrCollaborators = new Array();
					if( ArrayOptFirstElem( conds ) != undefined )
					{
						if( sAction.GetOptProperty( 'search_fullname', '' ) != '' ) 
						{
							conds.push( 'contains( $elem/fullname, ' + XQueryLiteral( sAction.GetOptProperty( 'search_fullname', '' ) ) + ' )' );
							oAnswer.is_filtered = true;
						}
						if( IsArray( sAction.GetOptProperty( "user_ids" ) ) && ArrayOptFirstElem( sAction.GetOptProperty( "user_ids" ) ) != undefined ) 
						{
							conds.push( "MatchSome( $elem/id, (" + ArrayMerge( sAction.GetOptProperty( "user_ids" ), "XQueryLiteral( This )", "," ) + ") )" );
							oAnswer.is_filtered = true;
						}
						xarrCollaborators = XQuery( "for $elem in collaborators where " + ArrayMerge( conds, "This", " and " ) + " order by $elem/fullname return $elem" );
					}

					oAnswer.total = ArrayCount( xarrCollaborators )
					oAnswer.collaborators = new Array();
					if( iPageSize != undefined )
					{
						xarrRangeCollaborators = ArrayRange( xarrCollaborators, iPageSize*( iPageNum - 1 ), iPageSize );
					}
					else
					{
						xarrRangeCollaborators = xarrCollaborators;
					}
					if( ArrayOptFirstElem( xarrRangeCollaborators ) != undefined )
					{
						xarrObjectDatas = new Array();
						iPersonConversationSettingsObjectDataTypeId = GetPersonConversationSettingsObjectDataTypeId();

						if( iPersonConversationSettingsObjectDataTypeId != null )
						{
							xarrObjectDatas = XQuery( "for $elem_qc in object_datas where $elem_qc/object_data_type_id = " + iPersonConversationSettingsObjectDataTypeId + " and MatchSome( $elem_qc/object_id, ( " + ArrayMerge( xarrRangeCollaborators, "This.id", "," ) + " ) ) and $elem_qc/status_id = 'active' return $elem_qc/Fields('id','data_str','object_id')" );
							xarrObjectDatas = ArraySort( xarrObjectDatas, "This.object_id", "+" )
						}
						xarrCalls = XQuery( "for $elem_qc in calls where $elem_qc/state_id = 'active' and MatchSome( $elem_qc/active_participants_id, ( " + ArrayMerge( xarrRangeCollaborators, "This.id", "," ) + " ) ) return $elem_qc/Fields('id','active_participants_id')" );
						
						for( _rec in xarrRangeCollaborators )
						{
							catObjectData = ArrayOptFindBySortedKey( xarrObjectDatas, _rec.id, "object_id" );
							oObjectData = new Object();
							if( catObjectData != undefined && catObjectData.data_str.HasValue )
							{
								try
								{
									oObjectData = ParseJson( catObjectData.data_str );
								}
								catch(ex){}
							}
							obj = { 
								id: _rec.id.Value, 
								fullname: _rec.fullname.Value, 
								position_id: _rec.position_id.Value, 
								position_name: _rec.position_name.Value, 
								position_parent_id: _rec.position_parent_id.Value, 
								position_parent_name: _rec.position_parent_name.Value, 
								org_id: _rec.org_id.Value, 
								org_name: _rec.org_name.Value, 
								email: _rec.email.Value, 
								phone: _rec.phone.Value, 
								birth_date: ( _rec.birth_date.HasValue ? StrDate( _rec.birth_date.Value, false ) : "" ), 
								icon_url: tools_web.get_object_source_url( 'person', _rec.id ), 
								selectable: true, 
								state_id: oObjectData.GetOptProperty( "state_id", "" ), 
								last_activity_date: tools_web.get_user_data( "person_last_activity_date_" + _rec.id ),
								active_call: ArrayOptFind( xarrCalls, "This.active_participants_id.ByValueExists( _rec.id )" ) != undefined,
								comment: "",
								operations:[]
							}
							obj = check_selectable( obj );
							oAnswer.collaborators.push( obj );
						}
					}
					break;
				}
				case 'set_participant_state_in_conversation':
				{
					iConversationID = Int( sAction.GetOptProperty( 'conversation_id' ) );
					docConversation = tools.open_doc( iConversationID );
					if( ArrayOptFind( get_recipients( iConversationID, docConversation.TopElem ).recipients, 'This == curUserID' ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( 'У вас нет прав на выполнение данного действия', 403 );
					}
					oAnswer.conversation_id = iConversationID;
					iParticipantID = Int( sAction.GetOptProperty( 'participant_id' ) );
					sParticipantFullname = "";
					if( iParticipantID == curUserID )
					{
						sParticipantFullname = RValue( curUser.fullname );
					}
					sState = sAction.GetOptProperty( 'state' );
					set_status_participant_in_conversation( iConversationID, [ { participant_id: iParticipantID, state: sState, participant_fullname: sParticipantFullname } ] );
					break;
				}
				case 'add_chatbot_to_conversation':
				{
					iConversationID = Int( sAction.GetOptProperty( 'conversation_id' ) );
					docConversation = tools.open_doc( iConversationID );
					if( ArrayOptFind( get_recipients( iConversationID, docConversation.TopElem ).recipients, 'This == curUserID' ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( 'У вас нет прав на выполнение данного действия', 403 );
					}
					oAnswer.conversation_id = iConversationID;
					iChatbotID = Int( sAction.GetOptProperty( 'chatbot_id' ) );
					add_chatbot_to_conversation( iConversationID, iChatbotID );
					break;
				}
				case 'open_conversation':
				{
					//oAnswer.operations = new Array();
					iConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ) );
					docConversation = tools.open_doc( iConversationID );
					
					arrRecipients = get_recipients( iConversationID, docConversation.TopElem ).recipients;
					if( ArrayOptFind( arrRecipients, "This == curUserID" ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( "У вас нет прав на выполнение данного действия", 403 );
					}
					oDataConversation = get_data_conversation( iConversationID, curUserID, docConversation.TopElem );
					oAnswer.SetProperty( "name", oDataConversation.name );
					oAnswer.SetProperty( "state_id", docConversation.TopElem.state_id.Value );
					oAnswer.SetProperty( "icon_url", oDataConversation.pict_url );
					oAnswer.SetProperty( "participants", arrRecipients );
					
					oAnswer.conversation_id = iConversationID;
					if( iConversationID != undefined )
					{
						catConversation = ArrayOptFirstElem( XQuery( "for $elem in conversations where $elem/id = " + iConversationID + " return $elem/Fields( 'conversation_type_id' )" ) );
						if( catConversation != undefined && catConversation.conversation_type_id.HasValue )
						{
							feConversationType = catConversation.conversation_type_id.OptForeignElem;
							if( feConversationType != undefined && feConversationType.use_open_script )
							{
								try
								{
									teConversationType = OpenDoc( UrlFromDocID( catConversation.conversation_type_id ) ).TopElem;
									tools.safe_execution( teConversationType.open_script );
								}
								catch( ex )
								{
									alerd( 'conversation api open_conversation ' + ex )
								}
							}
						}
					}
					break;
				}
				case "hide_conversation_messages":
				{
					iConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ) );
					oResOperations = get_operations_conversation( iConversationID, curUserID, null, curUser, null );

					catOperation = ArrayOptFind( oResOperations.operations, "This.id == 'hide_conversation_messages'");
					if( catOperation == undefined )
					{
						set_error( "У вас нет прав на выполнение данного действия", 403 );
					}
					iBlockMessageID = OptInt( sAction.GetOptProperty( "block_message_id" ) );
					sMessageID = sAction.GetOptProperty( "message_id" );
					
					bDeleteOnlyForYouself = tools_web.is_true( sAction.GetOptProperty( "delete_only_for_yourself" ) );
					arrTempArray = new Array();
					if( sMessageID != undefined )
					{
						arrTempArray.push( sMessageID );
					}
					else
					{
						arrTempArray = sAction.GetOptProperty( "messages_id" );
					}
					arrTemp2Array = new Array();
					for( _message_id in arrTempArray )
					{
						try
						{
							arrTemp2Array.push( { id: _message_id.GetProperty( "id" ), block_message_id: OptInt( _message_id.GetOptProperty( "block_message_id" ), iBlockMessageID ), user_id: curUserID } );
						}
						catch( ex )
						{
							arrTemp2Array.push( { id: _message_id, block_message_id: iBlockMessageID, user_id: curUserID } );
						}
					}
					if( !bDeleteOnlyForYouself )
					{
						for( _message_id in arrTemp2Array )
						{
							catMessage = get_message_by_message_id( _message_id.id, _message_id.block_message_id, iConversationID ).cat_message;
							if( catMessage != null && catMessage.object_id != curUserID )
							{
								set_error( "Вы можете удалить только свои сообщения", 1 );
							}
						}
					}
					
					oAnswer.conversation_id = iConversationID;
					oHideRes = hide_conversation_messages_queue( iConversationID, arrTemp2Array, bDeleteOnlyForYouself );
					oMessage = { "conversation_id": iConversationID, "action" : "prepare_hide_conversation_messages" };

					if( arrTemp2Array != undefined )
					{
						oMessage.SetProperty( "messages_id", ArrayExtract( arrTemp2Array, "This.id" ) );
					}
					else
					{
						oMessage.SetProperty( "hide_block_messages", true );
					}
					CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "send_message_to_socket", [ ( bDeleteOnlyForYouself ? [ curUserID ] : get_recipients( iConversationID ).recipients ), oMessage ] ] );
					break;
				}
				case "get_proctoring_params":
				{
					iLearningID = OptInt( sAction.GetOptProperty( 'learning_id' ) );
					oAnswer.params = new Object();
					try
					{
						try
						{
							teLearning = OpenDoc( UrlFromDocID( Int( iLearningId ) ) ).TopElem;
						}
						catch( err )
						{
							alert( err )
							return '';
						}

						teProctoringObject = tools_proctor.get_proctoring_object( Int( iLearningId ), teLearning )
						teProctoringSystem = OpenDoc( UrlFromDocID( Int( teProctoringObject.proctoring.proctoring_system_id ) ) ).TopElem

						oLaunchParams = new Object();
						oLaunchParams.teProctoringSystem = teProctoringSystem;
						oLaunchParams.teProctoringObject = teProctoringObject;
						oLaunchParams.iLearningId = iLearningId;

						oAnswer.params = CallObjectMethod( OpenCodeLib( 'x-local://wtv/' + teProctoringSystem.library_url ), 'getParamsProctoring', [ oLaunchParams ] );

					}
					catch( ex ){}
					break;
				}
				case "get_request_states":
				{
					oAnswer.states = new Array();
					for( _state in common.request_status_types )
					{
						oAnswer.states.push( { "id": _state.id.Value, "name": _state.name.Value } );
					}
					break;
				}
				case "get_conversation_object_types":
				{
					oAnswer.conversation_object_types = new Array();
					for( _object_type in common.conversation_object_types )
					{
						catObjectType = common.exchange_object_types.GetOptChildByKey( _object_type.object_type.Value );
						if( catObjectType != undefined )
						{
							oAnswer.conversation_object_types.push( { "id": _object_type.object_type.Value, "name": catObjectType.title.Value } );
						}
					}
					break;
				}
				case "get_request_type_states":
				{
					iRequestTypeID = OptInt( sAction.GetOptProperty( "request_type_id", "" ) );
					oAnswer.states = new Array();

					docRequestType = tools.open_doc( iRequestTypeID );
					if( docRequestType != undefined && docRequestType.TopElem.workflow_id.HasValue )
					{
						docWorkflow = tools.open_doc( docRequestType.TopElem.workflow_id );
						if( docWorkflow != undefined )
						{
							for( _state in docWorkflow.TopElem.states )
							{
								oAnswer.states.push( { "code": _state.code.Value, "name": _state.name.Value } );
							}
						}
					}


					break;
				}
				case "get_conversation_request":
				{
					set_error( 'Метод не поддерживается' );
					iConversationID = Int( sAction.GetOptProperty( 'conversation_id' ) );
					docConversation = tools.open_doc( iConversationID );
					oAnswer.result = null;
					if( docConversation == undefined )
					{
						set_error( 'Некорректный conversation_id' );
					}
					teConversation = docConversation.TopElem;
					catActiveParticipant = ArrayOptFind( teConversation.participants, "This.state_id == 'active'" );
					if( catActiveParticipant == undefined || catActiveParticipant.object_type != "request" )
					{
						break;
					}
					docRequest = tools.open_doc( catActiveParticipant.object_id );
					if( docRequest == undefined )
					{
						set_error( 'Некорректный ID заявки' );
					}
					teRequest = docRequest.TopElem;
					iWorkflowID = teRequest.workflow_id.Value;
					oAnswer.result =  {
						request: {
							id: String( catActiveParticipant.object_id.Value ),
							code: teRequest.code.Value,
							request_type_id: String( teRequest.request_type_id.Value ),
							custom_elems: []
						},
						workflow: {
							workflow_id: String( iWorkflowID ),
							workflow_state: teRequest.workflow_state.Value,
							workflow_state_name: teRequest.workflow_state_name.Value,
							workflow_fields: [],
							actions: []
						},
						person: {
							person_id: String( teRequest.person_id.Value ),
							person_fullname: teRequest.person_fullname.Value,
							person_position_id: teRequest.person_position_id.Value,
							person_position_name: teRequest.person_position_name.Value,
							person_org_id: teRequest.person_org_id.Value,
							person_org_name: teRequest.person_org_name.Value,
							person_subdivision_id: teRequest.person_subdivision_id.Value,
							person_subdivision_name: teRequest.person_subdivision_name.Value,
						}
					};

					curObject = teRequest;
					curObjectID = catActiveParticipant.object_id;
					docWorkflow = tools.open_doc( iWorkflowID );
					if( docWorkflow != undefined )
					{
						teWorkflow = docWorkflow.TopElem;
						for (fldGroupElem in teWorkflow.field_groups) {
							if (tools.safe_execution(fldGroupElem.read_conditions.condition_eval_str)) {//read_
								bCanEdit = tools.safe_execution(fldGroupElem.write_conditions.condition_eval_str);
								for (fldFieldElem in ArraySelectByKey(teWorkflow.workflow_fields, fldGroupElem.code, 'field_group_id')) {
									fldFieldElem.AddDynamicChild('can_read', 'bool').Value = true;
									fldFieldElem.AddDynamicChild('can_edit', 'bool').Value = bCanEdit;

									if (fldFieldElem.type == 'foreign_elem') {
										try {
											fldFieldElem.xquery_qual.Value = EvalCodePage(fldFieldElem.xquery_qual.Value);
										} catch(sErr) {
											fldFieldElem.xquery_qual.Value = '';
										}
									}

									_fldTempWorkflow = ArrayOptFindByKey(teRequest.workflow_fields, fldFieldElem.name, 'name');
									_sTempValue = _fldTempWorkflow != undefined ? _fldTempWorkflow.value : '';
									if (_sTempValue != '' && fldFieldElem.type == 'foreign_elem') {
										fldFieldElem.AddDynamicChild('value_id', 'string').Value = _sTempValue;
										_catObject = ArrayOptFirstElem(tools.xquery('for $elem in ' + fldFieldElem.catalog + 's where $elem/id = ' + _sTempValue + ' return $elem'));
										if (_catObject != undefined) {
											switch (fldFieldElem.catalog) {
												case 'collaborator':
													_sTempDispValue = _catObject.fullname;
												break
												default:
													_sTempDispValue = _catObject.name;
											}
										} else {
											_sTempDispValue = '[Object Deleted]';
										}
										fldFieldElem.AddDynamicChild('value', 'string').Value = _sTempDispValue;
									} else {
										fldFieldElem.AddDynamicChild('value', 'string').Value = _sTempValue;
									}

									oAnswer.result.workflow.workflow_fields.push( fldFieldElem );
								}
							}
						}

						arrWorkflowActions = new Array();
						for (fldActionElem in teWorkflow.actions) {
							if (tools.safe_execution(fldActionElem.condition_eval_str)) {
								oAnswer.result.workflow.actions.push({
									action_id: fldActionElem.PrimaryKey.Value,
									name: fldActionElem.name.Value
								});
							}
						}
					}
					 fldCustomElems = tools.get_custom_template(curObject.Name, curObjectID, curObject);
					if (fldCustomElems != null) {
						for (fldCustomElem in fldCustomElems.fields.field) {
							if (teRequest.custom_elems.ChildByKeyExists(fldCustomElem.name)) {
								_fldTempCustomElem = teRequest.custom_elems.GetChildByKey(fldCustomElem.name);
								fldCustomElem.AddDynamicChild('value', 'string').Value = _fldTempCustomElem.value;
							}
						}
						oAnswer.result.request.custom_elems = ArraySelectByKey(fldCustomElems.fields.field, true, 'disp_web');
					}

					break;
				}
				case "search":
				{
					sSearchText = sAction.GetOptProperty( "search_text", "" );
					sCatalogName = sAction.GetOptProperty( "catalog", "" );
					bAccess = false;
					catCatalogRemoteCollection = ArrayOptFirstElem( XQuery( "for $elem in remote_collections where $elem/code = 'uni_catalog_list_" + sCatalogName + "' return $elem/Fields('id')" ) );
					if ( catCatalogRemoteCollection != undefined )
					{
						bAccess = tools_web.check_access( OpenDoc( UrlFromDocID ( catCatalogRemoteCollection.id ), "form=x-local://wtv/wtv_form_doc_access.xmd;ignore-top-elem-name=1" ).TopElem, curUserID, curUser, Session );
					}
					if( !bAccess )
					{
						set_error( "У вас нет прав на получение списка.", 403 );
					}
					oAnswer.array = new Array();
					xarrResults = XQuery( tools.create_xquery( sCatalogName, "", "", sSearchText ) );
					for( _obj in xarrResults )
					{
						oAnswer.array.push( { "id": _obj.id.Value, "name": RValue( tools.get_disp_name_value( _obj ) ) } );
					}
					break;
				}
				case "get_custom_states":
				{
					iConversationTypeID = OptInt( sAction.GetOptProperty( 'conversation_type_id' ) );
					docConversationType = tools.open_doc( iConversationTypeID );
					oAnswer.custom_states = new Array();
					if( docConversationType != undefined )
					{
						for( _state in docConversationType.TopElem.custom_states )
						{
							oAnswer.custom_states.push( { "id": _state.id.Value, "name": _state.name.Value } );
						}
					}
					break;
				}
				case "get_states":
				{
					oAnswer.states = new Array();
					for( _state in common.account_status_types )
					{
						oAnswer.states.push( { "id": _state.id.Value, "name": _state.name.Value } );
					}

					break;
				}
				case "read_conversation_messages":
				{
					iConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ) );
					docConversation = tools.open_doc( iConversationID );
					if( ArrayOptFind( get_recipients( iConversationID, docConversation.TopElem ).recipients, 'This == curUserID' ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( 'У вас нет прав на выполнение данного действия', 403 );
					}
					arrMessages = sAction.GetOptProperty( 'messages', [] );
					read_conversation_messages_queue( arrMessages, iConversationID, curUserID );
					break;
				}
				case "read_all_conversation_messages":
				{
					iConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ) );
					oAnswer.conversation_id = iConversationID;
					docConversation = tools.open_doc( iConversationID );
					if( ArrayOptFind( get_recipients( iConversationID, docConversation.TopElem ).recipients, 'This == curUserID' ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( 'У вас нет прав на выполнение данного действия', 403 );
					}
					//arrMessages = sAction.GetOptProperty( 'messages', [] );
					teCommand = OpenDocFromStr( tools.xml_header() + '<queue_saveblockmessage/>' ).TopElem;
					teCommand.AddChild( 'type', 'string' ).Value = 'readallconversationmessages';
					teCommand.AddChild( 'conversation_id', 'integer' ).Value = iConversationID;
					teCommand.AddChild( 'user_id', 'integer' ).Value = curUserID;
					tools.put_message_in_queue( 'chat-saveblockmessage-queue', teCommand.GetXml( { 'tabs': false } ) );
					
					break;
				}
				case "set_recipient_conversation_state":
				{
					iConversationID = Int( sAction.GetOptProperty( "conversation_id" ) );
					oAnswer.conversation_id = iConversationID;
					docConversation = tools.open_doc( iConversationID );
					if( ArrayOptFind( get_recipients( iConversationID, docConversation.TopElem ).recipients, 'This == curUserID' ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( 'У вас нет прав на выполнение данного действия', 403 );
					}
					sRecipientState = sAction.GetOptProperty( "conversation_state" );
					/*catRecipient = docConversation.TopElem.recipients.ObtainChildByKey( curUserID );
					if( catRecipient.conversation_state == sRecipientState )
					{
						break;
					}
					catRecipient.conversation_state = sRecipientState;
					if( !catRecipient.conversation_state.HasValue )
					{
						catRecipient.Delete();
					}
					docConversation.Save();*/
					teCommand = OpenDocFromStr( tools.xml_header() + '<queue_saveblockmessage/>' ).TopElem;
					teCommand.AddChild( 'type', 'string' ).Value = 'set_recipient_conversation_state';
					teCommand.AddChild( 'conversation_id', 'integer' ).Value = iConversationID;
					teCommand.AddChild( 'user_id', 'integer' ).Value = curUserID;
					teCommand.AddChild( 'user_fullname', 'string' ).Value = RValue( curUser.fullname );
					teCommand.AddChild( 'conversation_state', 'string' ).Value = sRecipientState;
					tools.put_message_in_queue( 'chat-saveblockmessage-queue', teCommand.GetXml( { 'tabs': false } ) );
					break;
				}
				case "create_call":
				{
					iConversationID = OptInt( sAction.GetOptProperty( "conversation_id" ) );
					if( iConversationID != undefined )
					{
						docConversation = tools.open_doc( iConversationID );

						oResOperations = get_operations_conversation( iConversationID, curUserID, null, curUser, null );

						catOperation = ArrayOptFind( oResOperations.operations, "This.id == 'can_call'" );
						if( catOperation == undefined )
						{
							set_error( 'У вас нет прав на выполнение данного действия', 403 );
						}
					}
					else
					{
						arrParticipants = sAction.GetOptProperty( "participants", "" );
						if( !IsArray( arrParticipants ) || ArrayOptFirstElem( arrParticipants ) == undefined )
						{
							set_error( "Не переданы участники звонка" );
						}
						
						
						if( ArrayOptFind( arrParticipants, "OptInt( This ) == curUserID" ) == undefined )
						{
							set_error( "Вы не можете создать звонок без своего участия" );
						}
						
						docConversation = undefined;
						xarrChats = XQuery( "for $elem in chats where " + ArrayMerge( arrParticipants, "'contains( $elem/collaborators, ( ' + XQueryLiteral( String( This ) ) + ' ) )'", " and " ) + " return $elem" );
						xarrChats = ArraySelect( xarrChats, "This.conversation_id.HasValue && ArrayCount( String( This.collaborators ).split( ',' ) ) == ArrayCount( arrParticipants )" );
						if( ArrayOptFirstElem( xarrChats ) != undefined )
						{
							catConversation = ArrayOptFirstElem( XQuery( "for $elem in conversations where $elem/state_id = 'active' and MatchSome( $elem/active_object_id, ( " + ArrayMerge( xarrChats, "This.id", "," ) + " ) ) return $elem" ) );
							if( catConversation != undefined )
							{
								docConversation = tools.open_doc( catConversation.id );
							}
						}
						if( docConversation == undefined )
						{
							oResConversation = change_participants_conversation( null, null, "change", null, arrParticipants, null, null, null, null, curUser.fullname, curUserID );
							if( oResConversation.error != 0 )
							{
								set_error( oResConversation.message );
							}
							docConversation = oResConversation.doc_conversation;
						}
						iConversationID = docConversation.DocID;
					}
					oAnswer.conversation_id = docConversation.DocID;
					catActiveVideoChat = ArrayOptFirstElem( XQuery( "for $elem in calls where $elem/conversation_id = " + iConversationID + " and $elem/state_id = 'active' return $elem/Fields('id')" ) );
					if( catActiveVideoChat == undefined )
					{
						oResCreateVideoChat = create_call( iConversationID, docConversation, curUserID );
						if( oResCreateVideoChat.error != 0 )
						{
							set_error( oResCreateVideoChat.message );
						}
						oAnswer.SetProperty( "call_id", oResCreateVideoChat.doc_call.DocID );
					}
					else
					{
						teCommand = OpenDocFromStr( tools.xml_header() + '<queue_call/>' ).TopElem;
						teCommand.AddChild( 'type', 'string' ).Value = 'create_call';
						teCommand.AddChild( 'conversation_id', 'integer' ).Value = docConversation.DocID;
						teCommand.AddChild( 'user_id', 'integer' ).Value = curUserID;
						tools.put_message_in_queue( 'call-queue', teCommand.GetXml( { 'tabs': false } ) );
						oAnswer.SetProperty( "call_id", catActiveVideoChat.id.Value );
					}
					break;
				}
				case "call_users":
				{
					iCallID = Int( sAction.GetOptProperty( "call_id" ) );
					docCall = tools.open_doc( iCallID );
					if( docCall == undefined )
					{
						set_error( "Звонок не найден" );
					}
					catParticipant = docCall.TopElem.participants.GetOptChildByKey( curUserID );
					if( catParticipant == undefined )
					{
						set_error( "Вы не участвуете в звонке", 403 );
					}
					teCommand = OpenDocFromStr( tools.xml_header() + '<queue_call/>' ).TopElem;
					teCommand.AddChild( 'type', 'string' ).Value = 'start_call';
					teCommand.AddChild( 'call_only_new', 'bool' ).Value = false;
					teCommand.AddChild( 'call_only_by_list', 'bool' ).Value = true;
					teCommand.AddChild( 'conversation_id', 'integer' ).Value = iCallID;
					teCommand.AddChild( 'user_id', 'integer' ).Value = curUserID;
					teCommand.AddChild( 'participants', 'string' ).Value = EncodeJson( sAction.GetOptProperty( "participants", null ) );
					tools.put_message_in_queue( 'call-queue', teCommand.GetXml( { 'tabs': false } ) );
					break;
				}
				case "update_ticket":
				{
					iCallID = Int( sAction.GetOptProperty( "call_id" ) );
					docCall = tools.open_doc( iCallID );
					if( docCall == undefined )
					{
						set_error( "Звонок не найден" );
					}
					catParticipant = docCall.TopElem.participants.GetOptChildByKey( curUserID );
					if( catParticipant == undefined )
					{
						set_error( "Вы не участвуете в звонке", 403 );
					}
					if( sAction.GetOptProperty( "peer_id", "" ) == "" )
					{
						set_error( "Некорректный peer_id" );
					}
					teCommand = OpenDocFromStr( tools.xml_header() + '<queue_call/>' ).TopElem;
					teCommand.AddChild( 'type', 'string' ).Value = 'update_ticket';
					teCommand.AddChild( 'user_id', 'integer' ).Value = curUserID;
					teCommand.AddChild( 'conversation_id', 'integer' ).Value = iCallID;
					teCommand.AddChild( 'peer_id', 'string' ).Value = sAction.GetOptProperty( "peer_id", "" );
					tools.put_message_in_queue( 'call-queue', teCommand.GetXml( { 'tabs': false } ) );
					break;
				}
				case "get_call_data":
				{
					iCallID = Int( sAction.GetOptProperty( "call_id" ) );
					docCall = tools.open_doc( iCallID );
					if( docCall == undefined )
					{
						set_error( "Звонок не найден" );
					}
					catParticipant = docCall.TopElem.participants.GetOptChildByKey( curUserID );
					if( catParticipant == undefined )
					{
						set_error( "Вы не участвуете в звонке", 403 );
					}
					oAnswer.SetProperty( "name", docCall.TopElem.name.Value );
					oAnswer.SetProperty( "conversation_id", docCall.TopElem.conversation_id.Value );
					oAnswer.SetProperty( "start_date", docCall.TopElem.start_date.Value );
					oAnswer.SetProperty( "end_date", docCall.TopElem.end_date.Value );
					oAnswer.SetProperty( "plan_start_date", docCall.TopElem.plan_start_date.Value );
					oAnswer.SetProperty( "plan_end_date", docCall.TopElem.plan_end_date.Value );
					oAnswer.SetProperty( "duration", docCall.TopElem.duration.Value );
					oAnswer.SetProperty( "state_id", docCall.TopElem.state_id.Value );
					oAnswer.SetProperty( "participants", [] );
					xarrCollaboratorParticipants = XQuery( "for $elem_qc in collaborators where MatchSome($elem_qc/id,(" + ArrayMerge( docCall.TopElem.participants, "XQueryLiteral( This.person_id )", "," ) + ")) return $elem_qc/Fields('id','fullname')" );
					xarrCollaboratorParticipants = ArraySort( xarrCollaboratorParticipants, "This.id", "+" );
					for( _participant in docCall.TopElem.participants )
					{
						catParticipant = ArrayOptFindBySortedKey( xarrCollaboratorParticipants, _participant.person_id, "id" );
						oAnswer.participants.push( { id: _participant.person_id.Value, fullname: ( catParticipant != undefined ? catParticipant.fullname.Value : "[Object Deleted]" ) } );
					}
					break;
				}
				case "open_call":
				{
					iCallID = Int( sAction.GetOptProperty( "call_id" ) );
					docCall = tools.open_doc( iCallID );
					if( docCall == undefined )
					{
						set_error( "Звонок не найден" );
					}
					catParticipant = docCall.TopElem.participants.GetOptChildByKey( curUserID );
					if( catParticipant == undefined )
					{
						set_error( "Вы не участвуете в звонке", 403 );
					}
					if( !catParticipant.has_entered )
					{
						catParticipant.has_entered = true;
						teCommand = OpenDocFromStr( tools.xml_header() + '<queue_call/>' ).TopElem;
						teCommand.AddChild( 'type', 'string' ).Value = 'send_has_entered';
						teCommand.AddChild( 'conversation_id', 'integer' ).Value = iCallID;
						teCommand.AddChild( 'user_id', 'integer' ).Value = curUserID;
						tools.put_message_in_queue( 'call-queue', teCommand.GetXml( { 'tabs': false } ) );
					}
					oAnswer.SetProperty( "start_date", docCall.TopElem.start_date.Value );
					oAnswer.SetProperty( "current_duration", DateDiff( Date(), docCall.TopElem.start_date.Value ) );
					oAnswer.SetProperty( "participants", new Array() );
					for( _participant in docCall.TopElem.participants )
					{
						if( _participant.state_id == "active" )
						{
							oAnswer.participants.push( { "participant_id": _participant.person_id.Value, "hash_id": _participant.hash_id.Value, "state_id": _participant.state_id.Value, "has_entered": _participant.has_entered.Value } );
						}
					}

					oMessage = { "conversation_id": docCall.TopElem.conversation_id.Value, "call_id": iCallID, "action" : "entered_call", "participants": oAnswer.participants };
					CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "send_message_to_socket", [ ArrayExtract( ArraySelect( docCall.TopElem.participants, "This.person_id != curUserID" ), "This.person_id.Value" ), oMessage ] ] );
					oCallData = new Object();
					oCallData.id = docCall.DocID;
					oCallData.state_id = "active";
					tools.call_code_library_method( 'libChat', 'write_message', [  curUser.fullname + " присоединился к звонку", docCall.TopElem.conversation_id, null, null, null, [], [], null, ({ data_type: "message_info", call: oCallData }), "system", ArraySelect( ArrayExtract( docCall.TopElem.participants, "This.person_id.Value" ), "This != curUserID" )  ] );
					teCommand = OpenDocFromStr( tools.xml_header() + '<queue_call/>' ).TopElem;
					teCommand.AddChild( 'type', 'string' ).Value = 'start_call';
					teCommand.AddChild( 'call_only_by_list', 'bool' ).Value = false;
					teCommand.AddChild( 'call_only_new', 'bool' ).Value = true;
					teCommand.AddChild( 'conversation_id', 'integer' ).Value = iCallID;
					teCommand.AddChild( 'user_id', 'integer' ).Value = curUserID;
					tools.put_message_in_queue( 'call-queue', teCommand.GetXml( { 'tabs': false } ) );
					break;
				}
				case "close_call":
				{
					iVideoChat = Int( sAction.GetOptProperty( "call_id" ) );
					docVideoChat = tools.open_doc( iVideoChat );
					if( docVideoChat == undefined )
					{
						set_error( "Звонок не найден" );
					}
					if( docVideoChat.TopElem.person_id != curUserID )
					{
						set_error( "У вас нет прав на выполнения.", 403 );
					}
					teCommand = OpenDocFromStr( tools.xml_header() + '<queue_call/>' ).TopElem;
					teCommand.AddChild( 'type', 'string' ).Value = 'close_call';
					teCommand.AddChild( 'end_date', 'date' ).Value = Date();
					teCommand.AddChild( 'conversation_id', 'integer' ).Value = iVideoChat;
					tools.put_message_in_queue( 'call-queue', teCommand.GetXml( { 'tabs': false } ) );

					break;
				}
				case "leave_call":
				{
					iCallID = Int( sAction.GetOptProperty( "call_id" ) );
					docCall = tools.open_doc( iCallID );
					if( docCall == undefined )
					{
						set_error( "Звонок не найден" );
					}
					catParticipant = docCall.TopElem.participants.GetOptChildByKey( curUserID );
					if( catParticipant == undefined )
					{
						set_error( "Вы не участвуете в звонке", 403 );
					}
					teCommand = OpenDocFromStr( tools.xml_header() + '<queue_call/>' ).TopElem;
					teCommand.AddChild( 'type', 'string' ).Value = 'leave_call';
					teCommand.AddChild( 'conversation_id', 'integer' ).Value = iCallID;
					teCommand.AddChild( 'end_date', 'date' ).Value = Date();
					teCommand.AddChild( 'user_id', 'integer' ).Value = curUserID;
					tools.put_message_in_queue( 'call-queue', teCommand.GetXml( { 'tabs': false } ) );

					catParticipant.state_id = "archive";
					//catParticipant.has_entered = false;
					catParticipant.ticket_id.Clear();
					catParticipant.hash_id.Clear();
					oMessage = { "conversation_id": docCall.TopElem.conversation_id.Value, "call_id": iCallID, "action" : "leaved_call", "leaved_recipients": [ curUserID ] };
					CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "send_message_to_socket", [ ArrayExtract( ArraySelect( docCall.TopElem.participants, "This.person_id != curUserID" ), "This.person_id.Value" ), oMessage ] ] );
					
					oCallData = new Object();
					oCallData.id = docCall.DocID;
					oCallData.state_id = "leaved";
					tools.call_code_library_method( 'libChat', 'write_message', [  curUser.fullname + " покинул звонок", docCall.TopElem.conversation_id, null, null, null, [], [], null, ({ data_type: "message_info", call: oCallData }), "system", ArraySelect( ArrayExtract( docCall.TopElem.participants, "This.person_id.Value" ), "This != curUserID" )  ] );
					
					break;
				}
				case "reject_call":
				{
					iCallID = Int( sAction.GetOptProperty( "call_id" ) );
					docCall = tools.open_doc( iCallID );
					if( docCall == undefined )
					{
						set_error( "Звонок не найден" );
					}
					catParticipant = docCall.TopElem.participants.GetOptChildByKey( curUserID );
					if( catParticipant == undefined )
					{
						set_error( "Вы не участвуете в звонке", 403 );
					}
					teCommand = OpenDocFromStr( tools.xml_header() + '<queue_call/>' ).TopElem;
					teCommand.AddChild( 'type', 'string' ).Value = 'reject_call';
					teCommand.AddChild( 'conversation_id', 'integer' ).Value = iCallID;
					teCommand.AddChild( 'user_id', 'integer' ).Value = curUserID;
					tools.put_message_in_queue( 'call-queue', teCommand.GetXml( { 'tabs': false } ) );


					oMessage = { "conversation_id": docCall.TopElem.conversation_id.Value, "call_id": iCallID, "action" : "rejected_call", "rejected_recipients": [ curUserID ] };
					CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "send_message_to_socket", [ ArrayExtract( ArraySelect( docCall.TopElem.participants, "This.person_id != curUserID" ), "This.person_id.Value" ), oMessage ] ] );
					
					oCallData = new Object();
					oCallData.id = docCall.DocID;
					oCallData.state_id = "reject";
					tools.call_code_library_method( 'libChat', 'write_message', [  curUser.fullname + " отклонил звонок", docCall.TopElem.conversation_id, null, null, null, [], [], null, ({ data_type: "message_info", call: oCallData }), "system", ArraySelect( ArrayExtract( docCall.TopElem.participants, "This.person_id.Value" ), "This != curUserID" )  ] );
					
					break;
				}
				case "get_person_conversation_settings":
				{
					oAnswer.SetProperty( "settings", GetPersonConversationSettings( curUserID ) );
					break;
				}
				case "set_person_conversation_settings":
				{
					oSettings = sAction.GetOptProperty( "settings", ({}) );
					oAnswer.SetProperty( "settings", SetPersonConversationSettings( curUserID, curUser, oSettings ) );
					break;
				}
				case 'get_conversation_data':
				{
					oConversationData = new Object();
					iConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ) );
					docConversation = tools.open_doc( iConversationID );
					arrRecipients = get_recipients( iConversationID, docConversation.TopElem ).recipients;
					if( ArrayOptFind( arrRecipients, "This == curUserID" ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( "У вас нет прав на выполнение данного действия", 403 );
					}
					oDataConversation = get_data_conversation( iConversationID, curUserID, docConversation.TopElem );
					oConversationData.SetProperty( "id", iConversationID );
					oConversationData.SetProperty( "name", oDataConversation.name );
					oConversationData.SetProperty( "state_id", docConversation.TopElem.state_id.Value );
					oConversationData.SetProperty( "creator_id", docConversation.TopElem.person_id.Value );
					oConversationData.SetProperty( "icon_url", oDataConversation.pict_url );
					oConversationData.SetProperty( "participants", arrRecipients );
					oConversationData.SetProperty( "operations", get_operations_conversation( iConversationID, curUserID, docConversation.TopElem, curUser, null, false ).operations );
					oConversationData.SetProperty( "desc", docConversation.TopElem.desc.Value );
					oResTemp = GetConversationFiles( curUserID, curUser, iConversationID, docConversation, 1, sAction.GetOptProperty( "files_page_size", 5 ) );
					oConversationData.SetProperty( "files", oResTemp.array );
					oConversationData.SetProperty( "files_more", oResTemp.more );
					oResTemp = GetConversationLinks( curUserID, curUser, iConversationID, docConversation, 1, sAction.GetOptProperty( "links_page_size", 5 ) )
					oConversationData.SetProperty( "links", oResTemp.array );
					oConversationData.SetProperty( "links_more", oResTemp.more );
					
					xarrPersonMessages = XQuery( "for $elem in person_messages where $elem/object_id = " + iConversationID + " and ( $elem/person_id = " + curUserID + " or $elem/person_id = null() )  and $elem/type = 'message' order by $elem/message_date descending return $elem/Fields('person_id','message_date','message_text','file_count','object_id','unread','conversation_state','type')" );
					oConversationData.SetProperty( "unread_message_count", ArrayCount( ArraySelectByKey( xarrPersonMessages, true, "unread" ) ) );
					
					catLastMessage = ArrayOptMax( xarrPersonMessages, "This.message_date" );
					oConversationData.SetProperty( "last_unread_message", "" );
					oConversationData.SetProperty( "last_unread_message_date", "" );
					oConversationData.SetProperty( "last_unread_message_is_file", false );
					if( catLastMessage != undefined )
					{
						if( catLastMessage.message_text.HasValue )
						{
							oConversationData.last_unread_message = catLastMessage.message_text.Value;
						}
						else if( catLastMessage.file_count > 0 )
						{
							oConversationData.last_unread_message = "Файлы" + ": " + catLastMessage.file_count;
							oConversationData.last_unread_message_is_file = true;
						}
						oConversationData.last_unread_message_is_file = catLastMessage.file_count > 0;
						oConversationData.last_unread_message_date = catLastMessage.message_date.Value;
					}
					catParticipant = ArrayOptFind( docConversation.TopElem.participants, "This.state_id == 'active'" );
					if( catParticipant != undefined && catParticipant.object_type == "chat" )
					{
						feObject = catParticipant.object_id.OptForeignElem;
						if( feObject != undefined && feObject.is_personal )
						{
							arrParicipants = String( feObject.collaborators ).split( "," );
							oResF = get_conversations( arrParicipants[0], "active", "", null, false, null, null, null, false, false, null, null, true );
							oResS = get_conversations( arrParicipants[1], "active", "", null, false, null, null, null, false, false, null, null, true );

							arrCommonConversations = ArrayIntersect( oResF.conversations, oResS.conversations, "This.id", "This.id" );
							oConversationData.SetProperty( "common_conversations", arrCommonConversations );
						}
					}
					oConversationData.SetProperty( "keyboards", get_conversation_keyboards( docConversation.TopElem ) );
					oAnswer.SetProperty( "conversation_data", oConversationData );
					break;
				}
				case "get_call_info":
				{
					iCallID = Int( sAction.GetOptProperty( "call_id" ) );
					docCall = tools.open_doc( iCallID );
					if( docCall == undefined )
					{
						set_error( "Звонок не найден" );
					}
					catParticipant = docCall.TopElem.participants.GetOptChildByKey( curUserID );
					if( catParticipant == undefined )
					{
						set_error( "Вы не участвуете в звонке", 403 );
					}
					oAnswer.SetProperty( "call_info", ({}) );
					oAnswer.call_info.SetProperty( "participants", [] );
					xarrCollaborators = XQuery( "for $elem in collaborators where MatchSome( $elem/id, ( " + ArrayMerge( docCall.TopElem.participants, "XQueryLiteral( This.person_id )", "," ) + " ) ) return $elem/Fields('id','fullname')" );
					xarrCollaborators = ArraySort( xarrCollaborators, "This.id", "+" );
					for( _participant in docCall.TopElem.participants )
					{
						oParticipant = new Object();
						oParticipant.id = _participant.person_id.Value;
						oParticipant.fullname = "";
						catCollaborator = ArrayOptFindBySortedKey( xarrCollaborators, _participant.person_id, "id" );
						if( catCollaborator != undefined )
						{
							oParticipant.fullname = catCollaborator.fullname.Value;
						}
						oParticipant.online = _participant.has_entered.Value;
						oParticipant.entered = docCall.TopElem.entered_participants_id.ByValueExists( _participant.person_id );
						oAnswer.call_info.participants.push( oParticipant );
					}
					break;
				}
				case "update_conversation":
				{
					iConversationID = OptInt( sAction.GetOptProperty( 'conversation_id' ) );
					docConversation = tools.open_doc( iConversationID );
					if( docConversation == undefined || docConversation.TopElem.person_id != curUserID )
					{
						set_error( "У вас нет прав на выполнение данного действия", 403 );
					}
					catParticipant = ArrayOptFind( docConversation.TopElem.participants, "This.state_id == 'active'" );
					if( catParticipant == undefined )
					{
						set_error( "Не найден активный участник разговора", 1 );
					}
					if( catParticipant.object_type == "chat" )
					{
						feParticipantObject = catParticipant.object_id.OptForeignElem;
						if( feParticipantObject.is_personal )
						{
							set_error( "Нельзя изменить название персонального диалога.", 1 );
						}
					}
					sConversationName = sAction.GetOptProperty( "conversation_name" );
					docConversation.TopElem.name = sConversationName;
					docConversation.Save();
					oMessage = { action: "update_conversation",
						conversation_id: iConversationID,
						conversation_name: sConversationName
					};
					send_message_to_socket( get_recipients( iConversationID, docConversation.TopElem ).recipients, oMessage );
					break;
				}
				case "message_reaction":
				{
					iConversationID = OptInt( sAction.GetOptProperty( "conversation_id" ) );
					iBlockMessageID = OptInt( sAction.GetOptProperty( "block_message_id" ), null );
					sMessageID = sAction.GetOptProperty( "message_id" );
					oAnswer.conversation_id = iConversationID;
					docConversation = tools.open_doc( iConversationID );
					if( ArrayOptFind( get_recipients( iConversationID, docConversation.TopElem ).recipients, 'This == curUserID' ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( "Вы не можете оставить реакцию на сообщение в этом разговоре", 403 );
					}
					oResMessage = get_message_by_message_id( sMessageID, iBlockMessageID, iConversationID );
					catMessage = oResMessage.cat_message;
					if( catMessage == undefined || !check_user_access_message( catMessage, curUserID, curUser, iConversationID, docConversation.TopElem ) )
					{
						set_error( "Вы не можете оставить реакцию на это сообщение", 403 );
					}
					teCommand = OpenDocFromStr( tools.xml_header() + '<queue_saveblockmessage/>' ).TopElem;
					teCommand.AddChild( 'type', 'string' ).Value = 'messagereaction';
					teCommand.AddChild( 'conversation_id', 'integer' ).Value = iConversationID;
					teCommand.AddChild( 'reaction_type', 'string' ).Value = sAction.GetOptProperty( "type" );
					teCommand.AddChild( 'message_id', 'string' ).Value = sMessageID;
					teCommand.AddChild( 'block_message_id', 'integer' ).Value = oResMessage.doc_block_message.DocID;
					teCommand.AddChild( 'sender_id', 'integer' ).Value = catMessage.object_id;
					teCommand.AddChild( 'user_id', 'integer' ).Value = curUserID;
					teCommand.AddChild( 'user_fullname', 'string' ).Value = curUser.fullname;
					teCommand.AddChild( 'conversation_name', 'string' ).Value = docConversation.TopElem.name;
					teCommand.AddChild( 'reaction_id', 'string' ).Value = sAction.GetOptProperty( "reaction_id" );
					tools.put_message_in_queue( 'chat-saveblockmessage-queue', teCommand.GetXml( { 'tabs': false } ) );
					break;
				}
				case "view_message_reaction":
				{
					iConversationID = OptInt( sAction.GetOptProperty( "conversation_id" ) );
					iBlockMessageID = OptInt( sAction.GetOptProperty( "block_message_id" ), null );
					sMessageID = sAction.GetOptProperty( "message_id", "" );
					arrMessages = sAction.GetOptProperty( "messages", null );
					if( !IsArray( arrMessages ) )
					{
						if( sMessageID != "" )
						{
							arrMessages = new Array();
							arrMessages.push( {message_id: sMessageID, block_message_id: iBlockMessageID} );
						}
						else
						{
							xarrNewMessageReactions = XQuery( "for $elem in person_messages where $elem/type = 'new_reaction' and $elem/object_id = " + iConversationID + " and $elem/person_id = " + curUserID + " return $elem/Fields('message_id','block_message_id')" );
							if( ArrayOptFirstElem( xarrNewMessageReactions ) == undefined )
							{
								break;
							}
							arrMessages = ArrayExtract( xarrNewMessageReactions, "return {message_id: This.message_id.Value, block_message_id: This.block_message_id.Value}" );
						}
					}
					oAnswer.conversation_id = iConversationID;
					docConversation = tools.open_doc( iConversationID );
					if( ArrayOptFind( get_recipients( iConversationID, docConversation.TopElem ).recipients, 'This == curUserID' ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( "Вы не можете просмотреть реакцию на сообщение в этом разговоре", 403 );
					}
					for( _message in arrMessages )
					{
						oResMessage = get_message_by_message_id( _message.message_id, _message.GetOptProperty( "block_message_id" ), iConversationID );
						if( oResMessage.error != 0 )
						{
							continue;
						}
						catMessage = oResMessage.cat_message;
						if( catMessage == undefined || catMessage.object_id != curUserID || !check_user_access_message( catMessage, curUserID, curUser, iConversationID, docConversation.TopElem ) )
						{
							set_error( "Вы не можете просмотреть реакцию на это сообщение", 403 );
						}
						_message.SetProperty( "block_message_id", oResMessage.doc_block_message.DocID );
					}
					teCommand = OpenDocFromStr( tools.xml_header() + '<queue_saveblockmessage/>' ).TopElem;
					teCommand.AddChild( 'type', 'string' ).Value = 'viewmessagereaction';
					teCommand.AddChild( 'conversation_id', 'integer' ).Value = iConversationID;
					teCommand.AddChild( 'messages', 'string' ).Value = EncodeJson( arrMessages );
					teCommand.AddChild( 'user_id', 'integer' ).Value = curUserID;
					tools.put_message_in_queue( 'chat-saveblockmessage-queue', teCommand.GetXml( { 'tabs': false } ) );
					break;
				}
				case "get_reaction_details":
				{
					iConversationID = OptInt( sAction.GetOptProperty( "conversation_id" ) );
					iBlockMessageID = OptInt( sAction.GetOptProperty( "block_message_id" ) );
					sMessageID = String( sAction.GetOptProperty( "message_id" ) );
					sReactionID = String( sAction.GetOptProperty( "reaction_id" ) );
					oAnswer.conversation_id = iConversationID;
					oAnswer.SetProperty( "message_id", sMessageID );
					docConversation = tools.open_doc( iConversationID );
					if( ArrayOptFind( get_recipients( iConversationID, docConversation.TopElem ).recipients, 'This == curUserID' ) == undefined && !docConversation.TopElem.is_public )
					{
						set_error( "Вы не можете просмотреть реакцию на сообщение в этом разговоре", 403 );
					}
					catMessage = get_message_by_message_id( sMessageID, iBlockMessageID, iConversationID ).cat_message;
					if( catMessage == undefined || !check_user_access_message( catMessage, curUserID, curUser, iConversationID, docConversation.TopElem ) )
					{
						set_error( "Вы не можете просмотреть реакцию на это сообщение", 403 );
					}
					iPageNum = OptInt( sAction.GetOptProperty( "page_num" ), 1 );
					iPageSize = OptInt( sAction.GetOptProperty( "page_size" ), 100 );
					xarrLikes = XQuery( "for $elem in likes where $elem/object_id = " + iConversationID + " and $elem/message_id = " + XQueryLiteral( sMessageID ) + " and $elem/reaction = " + XQueryLiteral( sReactionID ) + " order by $elem/create_date return $elem/Fields('person_id','person_fullname')" );
					oAnswer.SetProperty( "has_more", ArrayCount( xarrLikes ) > ( iPageNum*iPageSize ) );
					oAnswer.SetProperty( "persons", ArrayExtract( ArrayRange( xarrLikes, ( iPageNum - 1 )*iPageSize, iPageSize ), "return ({person_id: This.person_id.Value, person_fullname: This.person_fullname.Value, person_icon_url: tools_web.get_object_source_url( 'person', This.person_id )});" ) );
					break;
				}
				default:
					set_error( 'Действие не определено' );
			}
			oAnswer.SetProperty( "action", sAction.action );
		}
		catch( ex )
		{
			if( !StrBegins( ex, '!!!' ) )
			{
				alert( 'conversation_api.html ' + ex )
				oAnswer.error = 1;
				oAnswer.message = String( ex );
			}
		}
		if( bArray )
		{
			if( xHttpStaticAssembly == null )
			{
				xHttpStaticAssembly = tools.get_object_assembly( 'XHTTPMiddlewareStatic' );
			}
			xHttpStaticAssembly.CallClassStaticMethod( 'Datex.XHTTP.WebSocketContext', 'WriteToWebSocketMessageQueue', [ sWebsocketID, EncodeJson( oAnswer, { ExportLargeIntegersAsStrings: true } ), true ] );
		}
	}
	alerd( 'conversation_api finish ');
	if( bArray )
	{
		oAnswer = new Object();
		oAnswer.error = 0;
	}
	return oAnswer;
}

/**
 * @function AddChatbotToConversation
 * @memberof Websoft.WT.Chat
 * @description Подключает чат-бот к разговору.
 * @param {bigint} iConversationID - ID разговора
 * @param {bigint} iChatbotID - ID чатбота
 * @param {bigint} [iChatbotTypeID] - ID типа чатбота
 * @param {boolean} [bClearOldChatbotChat] - закрывать все сценарии
 * @returns {WTChatResult}
 */
function AddChatbotToConversation( iConversationID, iChatbotID, iChatbotTypeID, bClearOldChatbotChat )
{
	return add_chatbot_to_conversation( iConversationID, iChatbotID, iChatbotTypeID, bClearOldChatbotChat )
}

function add_chatbot_to_conversation( iConversationID, iChatbotID, iChatbotTypeID, bClearOldChatbotChat )
{
	/*
		подключает чат-бот к разговору
		iConversationID	- ID разговора
		iChatbotID		- ID чат-бота
		iChatbotTypeID	- ID типа чат-бота

	*/
	alerd( 'add_chatbot_to_conversation start ' )
	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';

	try
	{
		iChatbotID = Int( iChatbotID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID чат-бота';
		alerd( 'add_chatbot_to_conversation finish ' + oRes.message )
		return oRes;
	}

	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID разговора';
		alerd( 'add_chatbot_to_conversation finish ' + oRes.message )
		return oRes;
	}
	try
	{
		iChatbotTypeID = Int( iChatbotTypeID );
	}
	catch( ex )
	{
		catChatBotType = ArrayOptFirstElem( XQuery( 'for $elem in chatbot_types where $elem/code = \'webtutor\' return $elem' ) );
		iChatbotTypeID = catChatBotType.id.Value;
	}
	try
	{
		if( IsEmptyValue( bClearOldChatbotChat ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		bClearOldChatbotChat = false;
	}
	
	catChatBotType = ArrayOptFirstElem( XQuery( 'for $elem in chatbot_chatbot_types where $elem/chatbot_id = ' + iChatbotID + ' and $elem/chatbot_type_id = ' + iChatbotTypeID + ' return $elem' ) );
	del_chatbot_from_conversation( iConversationID, iChatbotID, bClearOldChatbotChat );

	dChat = OpenNewDoc( 'x-local://wtv/wtv_chatbot_chat.xmd' );
	dChat.BindToDb( DefaultDb );
	dChat.TopElem.state_id = 'active';
	dChat.TopElem.chatbot_type_id = iChatbotTypeID;
	dChat.TopElem.chatbot_id = iChatbotID;
	dChat.TopElem.code = tools.random_string( 10 );
	dChat.TopElem.conversation_id = iConversationID;
	dChat.Save();
	try
	{
		var catConversation = ArrayOptFirstElem( XQuery( "for $elem in conversations where $elem/id = " + iConversationID + " return $elem" ) );
		chatbot_request_processing( null, null, { bot_id: catChatBotType.bot_id.Value }, { msg_type: 'start', chat_id: dChat.TopElem.code.Value }, false, ( catConversation != undefined ? catConversation.person_id : null ), iConversationID );
	}
	catch( ex )
	{
		alert( "add_chatbot_to_conversation " + ex );
	}
	return oRes;
}
/**
 * @function DelChatbotFromConversation
 * @memberof Websoft.WT.Chat
 * @description Отключает чат-бот от разговора.
 * @param {bigint} iConversationID - ID разговора
 * @param {bigint} iChatbotID - ID чатбота
 * @param {boolean} [bClearOldChatbotChat] - закрывать все сценарии
 * @returns {WTChatResult}
 */
function DelChatbotFromConversation( iConversationID, iChatbotID, bClearOldChatbotChat )
{
	return del_chatbot_from_conversation( iConversationID, iChatbotID, bClearOldChatbotChat );
}

function del_chatbot_from_conversation( iConversationID, iChatbotID, bClearOldChatbotChat )
{
	/*
		отключает чат-бот от разговора
		iConversationID	- ID разговора
		iChatbotID		- ID чат-бота

	*/
	alerd( "del_chatbot_from_conversation start" );
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = '';

	try
	{
		iChatbotID = Int( iChatbotID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = "Не передан ID чат-бота";
		alerd( "del_chatbot_from_conversation finish " + oRes.message );
		return oRes;
	}

	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID разговора';
		alerd( 'del_chatbot_from_conversation finish ' + oRes.message );
		return oRes;
	}
	try
	{
		if( IsEmptyValue( bClearOldChatbotChat ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		bClearOldChatbotChat = false;
	}
	var conds = new Array();
	conds.push( "$elem/state_id = 'active'" );
	conds.push( "$elem/conversation_id = " + iConversationID );
	if( !bClearOldChatbotChat )
	{
		conds.push( "$elem/chatbot_id = " + iChatbotID );
	}
	var xarrChatbotChats = XQuery( "for $elem in chatbot_chats where " + ArrayMerge( conds, "This", " and " ) + " return $elem/Fields( 'id' )" );
	var docChat;
	for( _chat in xarrChatbotChats )
		try
		{
			docChat = OpenDoc( UrlFromDocID( _chat.id ) );
			docChat.TopElem.state_id = "archive";
			docChat.Save();
		}
		catch( ex )
		{
			alerd( "del_chatbot_from_conversation " + ex );
		}

	return oRes;
}

function hide_conversation_messages_queue( iConversationID, arrMessagesID, bDeleteOnlyForYouself )
{
	/*
		функция помечает сообщения удаленными
		iConversationID	- ID разговора
		arrMessagesID	- массив сообщений
		bDeleteOnlyForYouself	- удалить только у себя
	*/
	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	if ( ( tools.sys_db_capability ) == 0 )
	{
		return hide_conversation_messages( iConversationID, arrMessagesID, bDeleteOnlyForYouself );
	}
	else
	{
		teCommand = OpenDocFromStr( tools.xml_header() + '<queue_saveblockmessage/>' ).TopElem;
		teCommand.AddChild( 'type', 'string' ).Value = 'hideconversationmessages';
		teCommand.AddChild( 'conversation_id', 'integer' ).Value = iConversationID;
		teCommand.AddChild( 'messages_id', 'string' ).Value = EncodeJson( arrMessagesID );
		teCommand.AddChild( 'delete_only_for_yourself', 'bool' ).Value = bDeleteOnlyForYouself;
		tools.put_message_in_queue( 'chat-saveblockmessage-queue', teCommand.GetXml( { 'tabs': false } ) );
	}
	return oRes
}

function hide_conversation_messages( iConversationID, arrMessages, bDeleteOnlyForYouself )
{
	/*
		функция помечает сообщения удаленными
		iConversationID	- ID разговора
		arrMessages	- массив сообщений
		bDeleteOnlyForYouself	- удалить только у себя
	*/
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = "";
	
	try
	{
		if( bDeleteOnlyForYouself == null || bDeleteOnlyForYouself == undefined || bDeleteOnlyForYouself == "" )
		{
			throw "error";
		}
		bDeleteOnlyForYouself = tools_web.is_true( bDeleteOnlyForYouself );
	}
	catch( ex )
	{
		bDeleteOnlyForYouself = false;
	}
	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID разговора';
		return oRes;
	}

	try
	{
		if( arrMessages == null || arrMessages == undefined || arrMessages == "" )
			throw "error";
	}
	catch( ex )
	{
		arrMessages = new Array();
	}

	var arrBlockMessageIds = null;
	var arrObjectBlockMessages = new Array();
	function get_object_block_message( _block_message_id )
	{
		var catBlockMessage = ArrayOptFindByKey( arrObjectBlockMessages, _block_message_id, "id" );
		if( catBlockMessage == undefined )
		{
			catBlockMessage = new Object();
			catBlockMessage.id = _block_message_id;
			catBlockMessage.need_save = false;
			catBlockMessage.doc_block_message = tools.open_doc( _block_message_id );
			arrObjectBlockMessages.push( catBlockMessage );
		}
		return catBlockMessage;
	}

	var conds = new Array();
	var iBlockMessageID, oBlockMessage, _bm_id;
	var bBreak = false;
	var arrHidedMessages = new Array();
	var _message, catMessage, oHideMessage;
	var oMessage = { "conversation_id": iConversationID, "action" : "hide_conversation_messages" };
	for( _message in arrMessages )
	{
		try
		{
			iBlockMessageID = OptInt( _message.GetOptProperty( "block_message_id" ) );
			oBlockMessage = null;
			if( iBlockMessageID == undefined )
			{
				if( arrBlockMessageIds == null )
				{
					conds.push( "$elem/object_id = " + iConversationID );
					conds.push( "$elem/state_id != 'hidden'" );
					arrBlockMessageIds = ArrayExtract( XQuery( "for $elem in block_messages where " + ArrayMerge( conds, "This", " and " ) + " order by $elem/create_date descending return $elem/Fields( 'id' )" ), "This.id" );
				}
				for( _bm_id in arrBlockMessageIds )
				{
					oBlockMessage = get_object_block_message( _bm_id );
					if( oBlockMessage.doc_block_message == undefined || !oBlockMessage.doc_block_message.TopElem.messages.ChildByKeyExists( _message.id ) )
					{
						oBlockMessage = null;
						continue;
					}
					else
					{
						break;
					}
				}
			}
			else
			{
				oBlockMessage = get_object_block_message( iBlockMessageID );
			}
			if( oBlockMessage == null || oBlockMessage.doc_block_message == undefined )
			{
				continue;
			}
			catMessage = oBlockMessage.doc_block_message.TopElem.messages.GetOptChildByKey( _message.id );
			if( catMessage == undefined )
			{
				continue;
			}
			if( bDeleteOnlyForYouself )
			{	
				catMessage.recipients.ObtainChildByKey( _message.user_id ).state_id = "hide";
			}
			else
			{
				catMessage.state_id = "hide";
			}
			oBlockMessage.need_save = true;
			if( bDeleteOnlyForYouself )
			{
				oHideMessage = ArrayOptFind( arrHidedMessages, "This.user_id == _message.user_id" );
				if( oHideMessage == undefined )
				{
					oHideMessage = new Object();
					oHideMessage.user_id = _message.user_id;
					oHideMessage.messages = new Array();
					arrHidedMessages.push( oHideMessage );
				}
				oHideMessage.messages.push( _message.id );
			}
			else
			{
				arrHidedMessages.push( _message.id );
			}
		}
		catch( ex )
		{
			alert( "hide_conversation_messages " + ex )
		}
	}
	
	
	for( oBlockMessage in arrObjectBlockMessages )
	{
		try
		{
			if( oBlockMessage.need_save )
			{
				oBlockMessage.doc_block_message.Save();
			}
		}
		catch( ex )
		{
			alert( "hide_conversation_messages " + ex )
		}
	}
	var teConversation = null;
	function add_last_message( iUserID, oMessage )
	{
		oMessage.SetProperty( "last_unread_message_date", "" );
		oMessage.SetProperty( "last_unread_message", "" );
		oMessage.SetProperty( "last_unread_message_is_file", "" );
		
		try
		{
			teConversation.Name;
		}
		catch( ex )
		{
			teConversation = tools.open_doc( iConversationID ).TopElem;
		}
		var teUser = tools.open_doc( iUserID ).TopElem;
		var oConversationOperationData = get_operations_conversation( iConversationID, iUserID, teConversation, teUser, null, false );

		var aUserRoles = new Array();
		var aUserGroups = null;
		for( _disp_role in oConversationOperationData.disp_roles )
		{
			if( aUserGroups == null )
			{
				aUserGroups = ArrayExtract( XQuery( "for $elem in group_collaborators where $elem/collaborator_id = " + iUserID + "  return $elem/Fields( 'group_id' )" ), "This.group_id.Value" );
			}
			if( check_access_role( _disp_role.access, iUserID, teUser, aUserGroups ) )
			{
				aUserRoles.push( _disp_role.id.Value );
			}
		}
		
		
		if( arrBlockMessageIds == null )
		{
			conds.push( "$elem/object_id = " + iConversationID );
			conds.push( "$elem/state_id != 'hidden'" );
			arrBlockMessageIds = ArrayExtract( XQuery( "for $elem in block_messages where " + ArrayMerge( conds, "This", " and " ) + " order by $elem/create_date descending return $elem/Fields( 'id' )" ), "This.id" );
		}
		var bBreak = false;
		for( _bm_id in arrBlockMessageIds )
		{
			oBlockMessage = get_object_block_message( _bm_id );
			if( oBlockMessage.doc_block_message == undefined )
			{
				continue;
			}
			for( _message in ArraySort( oBlockMessage.doc_block_message.TopElem.messages, "This.ChildIndex", "-" ) )
			{
				if( check_user_access_message( _message, iUserID, null, iConversationID, teConversation, oConversationOperationData, aUserRoles ) )
				{
					if( _message.text.HasValue )
					{
						oMessage.last_unread_message = _message.text.Value;
					}
					else if( ArrayOptFirstElem( _message.files ) != undefined )
					{
						oMessage.last_unread_message = "Файлы" + ": " + ArrayCount( _message.files );
						oMessage.last_unread_message_is_file = true;
					}
					oMessage.last_unread_message_is_file = ArrayCount( _message.files ) > 0;
					oMessage.last_unread_message_date = _message.create_date.Value;
					bBreak = true;
					break;
				}
			}
			if( bBreak )
			{
				break;
			}
		}
		return oMessage;
	}
	if( bDeleteOnlyForYouself )
	{
		for( _hide_message in arrHidedMessages )
		{
			
			oMessage.SetProperty( "messages_id", _hide_message.messages );
			CallServerMethod( "tools", "call_code_library_method", [ "libChat", "send_message_to_socket", [ [ _hide_message.user_id ], add_last_message( _hide_message.user_id, oMessage ) ] ] );
		}
	}
	else
	{
		if( ArrayOptFirstElem( arrHidedMessages ) != undefined )
		{
			oMessage.SetProperty( "messages_id", arrHidedMessages );
			for( _recipient in get_recipients( iConversationID ).recipients )
			{
				CallServerMethod( "tools", "call_code_library_method", [ "libChat", "send_message_to_socket", [ [_recipient], add_last_message( _recipient, oMessage ) ] ] );
			}
		}
	}
	return oRes;
}
function clear_conversation_messages( iConversationID )
{
	/*
		скрывает все сообщения в рамках разговора
		iConversationID	- ID разговора
	*/
	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID разговора';
		return oRes;
	}
	conds = new Array();
	conds.push( "$elem/object_id = " + iConversationID );
	for( _block_message in XQuery( "for $elem in block_messages where " + ArrayMerge( conds, "This", " and " ) + " return $elem/Fields( 'id' )" ) )
		try
		{
			DeleteDoc( UrlFromDocID( _block_message.id ) );
		}
		catch( ex )
		{
			alert( "clear_conversation_messages " + ex )
		}

	oMessage = { "conversation_id": iConversationID, "action" : "clear_conversation_messages" };
	CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "send_message_to_socket", [ get_recipients( iConversationID ).recipients, oMessage ] ] );
	return oRes;
}

function read_conversation_messages_queue( arrMessages, iConversationID, iUserID )
{
	/*
		функция помечает сообщения прочитанными
		arrMessages		- массив сообщений ( [{ "id": "", "block_message_id": "", "user_id": "" }] )
		iConversationID	- ID разговора
		iUserID			- ID сотрудника
	*/
	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	if ( ( tools.sys_db_capability ) == 0 )
		return read_conversation_messages( arrMessages, iConversationID, iUserID );
	else
	{
		teCommand = OpenDocFromStr( tools.xml_header() + '<queue_saveblockmessage/>' ).TopElem;
		teCommand.AddChild( 'type', 'string' ).Value = 'readconversationmessages';
		teCommand.AddChild( 'conversation_id', 'integer' ).Value = iConversationID;
		teCommand.AddChild( 'user_id', 'integer' ).Value = iUserID;
		teCommand.AddChild( 'messages', 'string' ).Value = EncodeJson( arrMessages );
		tools.put_message_in_queue( 'chat-saveblockmessage-queue', teCommand.GetXml( { 'tabs': false } ) );
	}
	return oRes
}

function read_conversation_messages( arrMessages, iConversationID, iUserID, arrBlockMessageObjects, bSave )
{
	/*
		функция помечает сообщения прочитанными
		arrMessages		- массив сообщений ( [{ "id": "", "block_message_id": "", "user_id": "" }] )
		iConversationID	- ID разговора
		iUserID			- ID сотрудника
	*/
	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан ID разговора';
		return oRes;
	}
	try
	{
		if( IsEmptyValue( bSave ) )
		{
			throw "error";
		}
		bSave = tools_web.is_true( bSave );
	}
	catch( ex )
	{
		bSave = true;
	}
	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	oRes.block_message_objects = new Array();
	try
	{
		iUserID = Int( iUserID );
	}
	catch( ex )
	{
		iUserID = undefined;
	}
	try
	{
		if( !IsArray( arrBlockMessageObjects ) )
		{
			throw "error";
		}
		oRes.block_message_objects = arrBlockMessageObjects;
	}
	catch( ex )
	{
	}
	function get_block_message( _bm_id )
	{
		_bm_id = OptInt( _bm_id );
		if( _bm_id == undefined )
		{
			return undefined;
		}
		catBlockMessage = ArrayOptFind( oRes.block_message_objects, "This.id == _bm_id" );
		if( catBlockMessage == undefined )
		{
			catBlockMessage = new Object();
			catBlockMessage.id = _bm_id;
			catBlockMessage.doc_block_message = tools.open_doc( _bm_id );
			catBlockMessage.save = false;

			oRes.block_message_objects.push( catBlockMessage );
		}
		return catBlockMessage;
	}
	/*conds = new Array();
	conds.push( "$elem/object_id = " + iConversationID );
	if( iUserID != undefined )
	{
		conds.push( "MatchSome( $elem/recipient_id, ( " + iUserID + " ) )" );
	}
	var xarrBlockMessages = XQuery( "for $elem in block_messages where " + ArrayMerge( conds, "This", " and " ) + " return $elem" );*/
	var arrUserIDs = ArraySelectDistinct( ArraySelect( ArrayExtract( arrMessages, "OptInt( This.GetOptProperty( 'user_id', '' ), iUserID )" ), "This != undefined" ), "This" );
	if( ArrayOptFirstElem( arrUserIDs ) == undefined )
	{
		return oRes;
	}
	var xarrPersonMessages = XQuery( "for $elem in person_messages where MatchSome( $elem/message_id, ( " + ArrayMerge( arrMessages, "XQueryLiteral( String( This.id ) )" ) + " ) ) and MatchSome( $elem/person_id, ( " + ArrayMerge( arrUserIDs, "This" ) + " ) ) and $elem/object_id = " + iConversationID + " and $elem/unread = true() and $elem/type = 'message' return $elem" );
	xarrPersonMessages = ArraySort( xarrPersonMessages, "This.message_id", "+" );
	var arrSenderMessages = new Array();
	var arrRecipients = null;//arrRecipients = get_recipients( iConversationID ).recipients;
	var catPersonMessage, _bm;
	var xarrBlockMessages = null;
	for( _message in arrMessages )
	{
		iMessageID = _message.GetOptProperty( "id", "" );
		if( iMessageID == "" )
		{
			continue;
		}
		iRecipientID = ( iUserID != undefined ? iUserID : OptInt( _message.GetOptProperty( "user_id", "" ) ) );
		if( iRecipientID == undefined )
		{
			continue;
		}
		iBlockMessageID = OptInt( _message.GetOptProperty( "block_message_id", "" ) );
		_block_message = undefined;
		if( iBlockMessageID != undefined )
		{
			_block_message = get_block_message( iBlockMessageID );
		}
		else
		{
			catPersonMessage = ArrayOptFind( xarrPersonMessages, "This.message_id == iMessageID && This.person_id == iRecipientID" );
			if( catPersonMessage != undefined )
			{
				_block_message = get_block_message( catPersonMessage.block_message_id );
			}
			else
			{
				if( xarrBlockMessages == null )
				{
					xarrBlockMessages = XQuery( "for $elem in block_messages where $elem/object_id = " + iConversationID + " order by $elem/create_date descending return $elem/Fields('id')" );
				}
				for( _bm in xarrBlockMessages )
				{
					_block_message = get_block_message( _bm.id );
					if( !_block_message.doc_block_message.TopElem.messages.ChildByKeyExists( iMessageID ) )
					{
						_block_message = undefined;
					}
					else
					{
						break;
					}
				}
			}
		}
		if( _block_message == undefined || _block_message.doc_block_message == undefined )
		{
			continue;
		}
		catMessage = _block_message.doc_block_message.TopElem.messages.GetOptChildByKey( iMessageID );
		if( catMessage == undefined )
		{
			continue;
		}
		_block_message.save = true;
		catRecipient = catMessage.recipients.GetOptChildByKey( iRecipientID );
		if( catRecipient == undefined || catRecipient.state_id == "read" )
		{
			continue;
		}

		catRecipient.state_id = "read";
		if( catMessage.object_type == "collaborator" && ArrayOptFindByKey( catMessage.recipients, "not_read", "state_id" ) == undefined )
		{
			arrSenderMessages.push( { "user_id": catMessage.object_id.Value, "id": iMessageID, "block_message_id": _block_message.doc_block_message.DocID, "message_state_id": "read" } );
		}
		
	}
	if( bSave )
	{
		for( _block_message in oRes.block_message_objects )
		{
			if( _block_message.save )
			{
				_block_message.doc_block_message.Save();
			}
		}
	}
	if( iUserID != undefined )
	{
		oMessage = { "conversation_id": iConversationID, "messages": arrMessages, "action" : "read_conversation_messages" };
		CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "send_message_to_socket", [ [ iUserID ], oMessage ] ] );
	}
	else
	{
		for( _user in ArraySelectDistinct( arrMessages, "This.GetOptProperty( 'user_id' )" ) )
		{
			_user_id = OptInt( _user.GetOptProperty( 'user_id' ) );
			if( _user_id == undefined )
			{
				continue;
			}
			oMessage = { "conversation_id": iConversationID, "messages": ArraySelect( arrMessages, "This.user_id == _user_id" ), "action" : "read_conversation_messages" };
			CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "send_message_to_socket", [ [ _user_id ], oMessage ] ] );
		}
	}

	for( _user in ArraySelectDistinct( arrSenderMessages, "This.GetOptProperty( 'user_id' )" ) )
	{
		_user_id = OptInt( _user.GetOptProperty( 'user_id' ) );
		if( _user_id == undefined )
		{
			continue;
		}
		oMessage = { "conversation_id": iConversationID, "messages": ArraySelect( arrSenderMessages, "This.user_id == _user_id" ), "action" : "read_conversation_messages" };
		CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "send_message_to_socket", [ [ _user_id ], oMessage ] ] );
	}

	return oRes;
}

function send_message_to_socket( arrRecipients, oMessage )
{
	/*
		отправляет сообщение в сокет
		arrRecipients	- массив адресатов
		oMessage		- сообщение
	*/
	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	try
	{
		if( !IsArray( arrRecipients ) )
			throw "error";
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан массив адресатов';
		return oRes;
	}


	if ( ( tools.sys_db_capability ) == 0 )
	{
		xHttpStaticAssembly = tools.get_object_assembly( 'XHTTPMiddlewareStatic' );
		var datexAssembly = tools.get_object_assembly( 'DatexCore' );
		WebSockets = xHttpStaticAssembly.CallClassStaticMethod( 'Datex.XHTTP.WebSocketContext', 'GetWebSockets').ToArray();
		sUserDataKey = 'chat_conversations_recipients';
		aRecipients = tools_web.get_user_data( sUserDataKey );
		if( aRecipients == undefined || aRecipients == null )
			aRecipients = new Array();
		else
			aRecipients = aRecipients.GetOptProperty( 'result', [] );


		try
		{
			xHttpStaticAssembly.CallClassStaticMethod( 'Datex.XHTTP.WebSocketContext', 'WriteToWebSocketsMessageQueueArray', [ ArrayExtract( ArrayIntersect( WebSockets, ArrayIntersect( aRecipients, arrRecipients, "OptInt( This.person_id )", "OptInt( This )" ), "This.Key", "This.socket_id" ), "This.Key" ), tools.object_to_text( oMessage, "json" ), true ] );
		}
		catch( err )
		{
			alert( 'chat_library.js send_message_to_socket ' + err )
		}
	}
	else
	{
		teCommand = OpenDocFromStr( tools.xml_header() + '<queue_sendtosocket/>' ).TopElem;
		teCommand.AddChild( 'type', 'string' ).Value = 'send_message_tosocket';
		teCommand.AddChild( 'json_message', 'string' ).Value = EncodeJson( oMessage, { ExportLargeIntegersAsStrings: true } );
		teCommand.AddChild( 'json_recipients', 'string' ).Value = tools.object_to_text( arrRecipients, 'json' );
		tools.put_message_in_queue( 'chat-sendtosocket-queue', teCommand.GetXml( { 'tabs': false } ) );
	}
	return oRes;
}
function send_message_by_socket_id( arrSocketsID, oMessage )
{
	/*
		отправляет сообщение в сокет
		arrRecipients	- массив адресатов
		oMessage		- сообщение
	*/
	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	try
	{
		if( !IsArray( arrSocketsID ) )
			throw "error";
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Не передан массив сокетов';
		return oRes;
	}
	if ( ( tools.sys_db_capability ) == 0 )
	{
		xHttpStaticAssembly = tools.get_object_assembly( 'XHTTPMiddlewareStatic' );
		var datexAssembly = tools.get_object_assembly( 'DatexCore' );
		WebSockets = xHttpStaticAssembly.CallClassStaticMethod( 'Datex.XHTTP.WebSocketContext', 'GetWebSockets').ToArray();

		arrSocketsID = ArrayExtract( ArrayIntersect( WebSockets, arrSocketsID, "This.Key", "This" ), "This.Key" );
		if( ArrayOptFirstElem( arrSocketsID ) != undefined )
			try
			{
				xHttpStaticAssembly.CallClassStaticMethod( 'Datex.XHTTP.WebSocketContext', 'WriteToWebSocketsMessageQueueArray', [ arrSocketsID, tools.object_to_text( oMessage, "json" ), true ] );
			}
			catch( err )
			{
				alert( 'chat_library.js send_message_to_socket ' + err )
			}
	}
	else
	{
		teCommand = OpenDocFromStr( tools.xml_header() + '<queue_sendtosocket/>' ).TopElem;
		teCommand.AddChild( 'type', 'string' ).Value = 'send_message_by_socket_id';
		teCommand.AddChild( 'json_message', 'string' ).Value = tools.object_to_text( oMessage, "json" );
		teCommand.AddChild( 'json_recipients', 'string' ).Value = tools.object_to_text( arrSocketsID, 'json' );
		tools.put_message_in_queue( 'chat-sendtosocket-queue', teCommand.GetXml( { 'tabs': false } ) );
	}
	return oRes;
}

/**
 * @function UpdateConversationData
 * @memberof Websoft.WT.Chat
 * @author PL
 * @description Обработка данные разговора в сокетах.
 * @param {bigint} iConversationID - ID разговора
 * @returns {WTChatResult}
 */
function UpdateConversationData( iConversationID )
{
	return update_conversation_data( iConversationID );
}
function update_conversation_data( iConversationID, teConversation, sLngId )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.message = '';

	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Invalid param iConversationID';
		return oRes;
	}
	try
	{
		teConversation.Name;
	}
	catch( ex )
	{
		try
		{
			teConversation = tools.open_doc( iConversationID ).TopElem;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.message = 'Invalid param iConversationID';
			return oRes;
		}
	}
	var arrRecipients = get_recipients( iConversationID, teConversation ).recipients;
	var sUserDataKey = 'chat_conversations_recipients';
	var aRecipients = tools_web.get_user_data( sUserDataKey );
	if( aRecipients == undefined || aRecipients == null )
	{
		aRecipients = new Array();
	}
	else
	{
		aRecipients = aRecipients.GetOptProperty( 'result', [] );
	}
	var catParticipant;
	catParticipant = ArrayOptFind( teConversation.participants, 'This.state_id == \'active\'' );
	for( _recipient in ArrayIntersect( aRecipients, arrRecipients, "This.person_id", "This" ) )
	{
		oSocketMessage = new Object();
		oSocketMessage.action = "update_conversation_data";
		iPersonID = _recipient.person_id;

		oConversationData = new Object();
		oConversationData.id = iConversationID;
		oDataConversation = get_data_conversation( iConversationID, iPersonID, teConversation );
		oConversationData.name = oDataConversation.name;
		oConversationData.state_id = teConversation.state_id.Value;

		oConversationData.icon_url = oDataConversation.pict_url;

		oConversationData.format_id = teConversation.format_id.Value;
		oConversationData.is_public = teConversation.is_public.Value;
		oConversationData.object_id = catParticipant.object_id.Value;
		oConversationData.object_name = catParticipant.object_name.Value;
		oConversationData.object_type = catParticipant.object_type.Value;

		xarrPersonMessages = XQuery( "for $elem in person_messages where $elem/object_id = " + iConversationID + " and ( $elem/person_id = " + iPersonID + " or $elem/person_id = null() )  and $elem/type = 'message' order by $elem/message_date descending return $elem/Fields('person_id','message_date','message_text','file_count','object_id','unread','conversation_state','type')" );
		oConversationData.SetProperty( "unread_message_count", ArrayCount( ArraySelectByKey( xarrPersonMessages, true, "unread" ) ) );
		
		catLastMessage = ArrayOptMax( xarrPersonMessages, "This.message_date" );
		oConversationData.SetProperty( "last_unread_message", "" );
		oConversationData.SetProperty( "last_unread_message_date", "" );
		oConversationData.SetProperty( "last_unread_message_is_file", false );
		if( catLastMessage != undefined )
		{
			if( catLastMessage.message_text.HasValue )
			{
				oConversationData.last_unread_message = catLastMessage.message_text.Value;
			}
			else if( catLastMessage.file_count > 0 )
			{
				oConversationData.last_unread_message = "Файлы" + ": " + catLastMessage.file_count;
				oConversationData.last_unread_message_is_file = true;
			}
			oConversationData.last_unread_message_is_file = catLastMessage.file_count > 0;
			oConversationData.last_unread_message_date = catLastMessage.message_date.Value;
		}
		oConversationData.SetProperty( "keyboards", get_conversation_keyboards( teConversation, sLngId ) );
		oSocketMessage.conversation_data = oConversationData;
		send_message_by_socket_id( [ _recipient.socket_id ], oSocketMessage );
	}

	return oRes;
}

function get_conversation_keyboards( teConversation, sLngId )
{
	var arrKeyboards = new Array();
	var _keyboard;
	for( _keyboard in teConversation.keyboards_block.keyboards )
	{
		arrKeyboards.push( { id: _keyboard.id.Value, text: ( IsEmptyValue( sLngId ) ? _keyboard.text.Value : tools_web.get_cur_lng_name( _keyboard.text.Value, sLngId ) ), next_row: _keyboard.next_row.Value } );
	}
	return arrKeyboards;
}

function send_message_by_socket_type( arrUserIDs, oMessage )
{
	/*
		отправляет сообщение в сокет по socket_type
		arrRecipients	- массив адресатов
		oMessage		- сообщение
	*/
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	var sUserDataKey = oMessage.socket_type + "_recipients";

	oRecipient = undefined;

	var aRecipients = tools_web.get_user_data( sUserDataKey );

	if( aRecipients == undefined || aRecipients == null )
		aRecipients = new Array();
	else
		aRecipients = aRecipients.GetOptProperty( "result", [] );
	send_message_by_socket_id( ArrayExtract( ArrayIntersect( aRecipients, arrUserIDs, "This.person_id", "This" ), "This.socket_id" ), oMessage );

	return oRes;
}

function create_call( iConversationID, docConversation, iUserID, arrParticipants, bSave )
{
	/*
		создает звонок
		iConversationID	- ID разговора
		docConversation	- документ разговора
		iUserID			- ID создателя
		arrParticipants	- массив ID участников (если не задан берется и разговора)
		bSave			- сохранять разговор по завершению
	*/
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	oRes.doc_call = null;
	try
	{
		bSave = bSave != false;
	}
	catch( ex )
	{
		bSave = true;
	}

	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = 'Invalid param iConversationID';
		return oRes;
	}

	try
	{
		docConversation.TopElem;
	}
	catch( ex )
	{
		try
		{
			docConversation = tools.open_doc( iConversationID );
			if( docConversation == undefined )
			{
				throw "error";
			}
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.message = 'Invalid param iConversationID';
			return oRes;
		}
	}

	try
	{
		iUserID = Int( iUserID );
	}
	catch( ex )
	{
		iUserID = null;
	}

	try
	{
		if( !IsArray( arrParticipants ) )
		{
			throw "error";
		}
	}
	catch( err )
	{
		arrParticipants = get_recipients( iConversationID, docConversation.TopElem ).recipients;
	}
	var docCall;
	var catActiveVideoChat = ArrayOptFirstElem( XQuery( "for $elem in calls where $elem/conversation_id = " + iConversationID + " and $elem/state_id = 'active' return $elem/Fields('id')" ) );
	if( catActiveVideoChat != undefined )
	{
		if( iUserID == null )
		{
			oRes.error = 1;
			oRes.message = 'Invalid param iUserID';
			return oRes;
		}
		docCall = tools.open_doc( catActiveVideoChat.id );
		var catParticipant = docCall.TopElem.participants.GetOptChildByKey( iUserID );

		if( catParticipant == undefined )
		{
			oRes.error = 403;
			oRes.message = "У вас нет прав на подключение к звонку";
			return oRes;
		}
		catParticipant.state_id = "active";
		if( bSave )
		{
			docCall.Save();
		}
		return start_call( docCall.DocID, docCall, false, [ iUserID ], bSave, true );
	}
	else
	{
		docCall = tools.new_doc_by_name( "call" );
		docCall.BindToDb( DefaultDb );
	}

	docCall.TopElem.conversation_id = iConversationID;
	
	if( iUserID != null )
	{
		docCall.TopElem.person_id = iUserID;
		tools.common_filling( 'collaborator', docCall.TopElem, iUserID );
	}
	docCall.TopElem.state_id = "active";
	for( _participant_id in arrParticipants )
	{
		docCall.TopElem.participants.ObtainChildByKey( _participant_id )
	}
	if( bSave )
	{
		docCall.Save();
	}

	return start_call( docCall.DocID, docCall, ( iUserID != null ? false : true ), null, bSave );
}

function get_ticket_expire()
{
	var libParam = tools.get_params_code_library( "libChat" );
	var iExpire = OptInt( libParam.GetOptProperty( "ticket_expire", 3600 ) );
	return StrInt( iExpire / 3600, 2 ) + ':' + StrInt( ( iExpire % 3600 ) / 60, 2 ) + ':' + StrInt( ( iExpire % 60 ), 2 );
}

function start_call( iVideoChatID, docVideoChat, bCallOnlyNewTicket, arrParticipants, bSave, bCallOnlyByList, iStartUserID )
{
	/*
		создает звонок
		iVideoChatID	- ID звонка
		docVideoChat	- document звонка
		bCallOnlyNewTicket - вызывать только новые соединения
		arrParticipants	- массив ID участников
		bSave			- сохранять разговор по завершению
		bCallOnlyByList	- вызывать только по списку
		iStartUserID	- пользователь начавший звонок
	*/

	var oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	oRes.doc_call = null;
	try
	{
		bSave = bSave != false;
	}
	catch( ex )
	{
		bSave = true;
	}
	try
	{
		iVideoChatID = Int( iVideoChatID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = "Invalid param iVideoChatID";
		return oRes;
	}
	try
	{
		iStartUserID = Int( iStartUserID );
	}
	catch( ex )
	{
		iStartUserID = null;
	}
	
	try
	{
		docVideoChat.TopElem;
	}
	catch( ex )
	{
		try
		{
			docVideoChat = tools.open_doc( iVideoChatID );
			if( docVideoChat == undefined )
			{
				throw "error";
			}
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.message = "Invalid param iVideoChatID";
			return oRes;
		}
	}
	try
	{
		if( bCallOnlyByList == null || bCallOnlyByList == undefined || bCallOnlyByList == "" )
		{
			throw "error";
		}
		bCallOnlyByList = tools_web.is_true( bCallOnlyByList );
	}
	catch( ex )
	{
		bCallOnlyByList = false;
	}
	try
	{
		if( bCallOnlyNewTicket == null || bCallOnlyNewTicket == undefined || bCallOnlyNewTicket == "" )
		{
			throw "error";
		}
		bCallOnlyNewTicket = tools_web.is_true( bCallOnlyNewTicket );
	}
	catch( ex )
	{
		bCallOnlyNewTicket = false;
	}
	try
	{
		if( !IsArray( arrParticipants ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		arrParticipants = null;
	}
	var bNeedSave = false;
	var bStart = false;
	var bRunPlanCall = false;
	if( !docVideoChat.TopElem.start_date.HasValue )
	{
		if( docVideoChat.TopElem.state_id == "plan" )
		{
			bRunPlanCall = true;
		}
		docVideoChat.TopElem.state_id = "active";
		docVideoChat.TopElem.start_date = Date();
		bNeedSave = true;
		bStart = true;
	}

	var bNewRoom = false;
	try
	{
		var oMediaSoup = tools.dotnet_host.Object.GetAssembly( "Datex.MediaSoup.dll" );
	}
	catch( err )
	{
		alert(err);
		oRes.error = 1;
		oRes.message = "Не загружена библиотека Datex.MediaSoup.dll";
		return oRes;
	}
	try
	{
		var sResGetRoomJson = oMediaSoup.CallClassStaticMethod( "Datex.MediaSoup.InterServices", "GetRoom", [ null, String( iVideoChatID ) ] );
		if( ArrayOptFirstElem( sResGetRoomJson ) == undefined )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		try
		{
			var sResRegisterRoomJson = oMediaSoup.CallClassStaticMethod( "Datex.MediaSoup.InterServices", "RegisterRoom", [ String( docVideoChat.TopElem.person_id.Value ), String( iVideoChatID ) ] );
			oResRegisterRoom = ParseJson( sResRegisterRoomJson );
			bNewRoom = true;
		}
		catch( err )
		{
			alert(err);
			oRes.error = 1;
			oRes.message = "Ошибка при создании комнаты.";
			return oRes;
		}
	}


	try
	{
		var feConversation = docVideoChat.TopElem.conversation_id.OptForeignElem;
		var arrRoomTickets = new Array();
		try
		{
			arrRoomTickets = oMediaSoup.CallClassStaticMethod( "Datex.MediaSoup.InterServices", "GetTickets", [ null, String( iVideoChatID ), null ] );
			if( !IsArray( arrRoomTickets ) )
			{
				throw "error";
			}
		}
		catch( ex )
		{
			arrRoomTickets = new Array();
		}
		arrRoomTickets = ArrayExtract( arrRoomTickets, "ParseJson( This )" );
		var arrParticipantsToRegister = ArraySelect( docVideoChat.TopElem.participants, "This.state_id == 'active'" );
		if( arrParticipants != null )
		{
			arrParticipantsToRegister = ArrayIntersect( arrParticipantsToRegister, arrParticipants, "This.person_id", "This" );
		}
		arrRoomTickets = ArraySort( arrRoomTickets, "This.Id", "+" );
		arrParticipantsToRegister = ArrayExtract( ArraySelect( arrParticipantsToRegister, "( ArrayOptFindBySortedKey( arrRoomTickets, This.ticket_id.Value, 'Id' ) == undefined )" ), "This.person_id.Value" );
		var aTickets = new Array();
		var xarrParticipantCollaborators = new Array();
		if( ArrayOptFirstElem( arrParticipantsToRegister ) != undefined )
		{
			aTickets = oMediaSoup.CallClassStaticMethod( "Datex.MediaSoup.InterServices", "RegisterRoomTickets", [ arrParticipantsToRegister, String( iVideoChatID ), null, get_ticket_expire() ] );
			xarrParticipantCollaborators = XQuery( "for $elem in collaborators where MatchSome( $elem/id, ( " + ArrayMerge( arrParticipantsToRegister, "This", "," ) + " ) ) return $elem/Fields('id','fullname')" )
		}
		xarrParticipantCollaborators = ArraySort( xarrParticipantCollaborators, "This.id", "+" );
		aTickets = ArrayExtract( aTickets, "ParseJson( This )" );
		var oTicket, catParticipant, oMessage, catParticipantCollaborator;
		var docStartUser = undefined;
		if( bRunPlanCall )
		{
			docStartUser = tools.open_doc( iStartUserID );
		}
		for( _participant in docVideoChat.TopElem.participants )
		{
			if( _participant.state_id != "active" )
			{
				continue;
			}
			oTicket = ArrayOptFind( aTickets, "OptInt( This.GetOptProperty( 'UserId' ) ) == _participant.person_id" );
			if( oTicket != undefined )
			{
				_participant.ticket_id = oTicket.Id;
				_participant.hash_id = Md5Hex( oTicket.Id );
				bNeedSave = true;
				if( oTicket.GetOptProperty( "Id" ) != undefined )
				{
					try
					{
						catParticipantCollaborator = ArrayOptFindBySortedKey( xarrParticipantCollaborators, _participant.person_id, "id" );
						if( catParticipantCollaborator != undefined )
						{
							oMediaSoup.CallClassStaticMethod( "Datex.MediaSoup.InterServices", "SetRoomTicketsProperties", [ [ oTicket.GetOptProperty( "Id" ) ], "DisplayName", catParticipantCollaborator.fullname.Value ] );
						}
					}
					catch( ex )
					{
						alert( "SetRoomTicketsProperties " + ex )
					}
				}
			}
			else if( !_participant.ticket_id.HasValue || ( bCallOnlyNewTicket || ( bCallOnlyByList && arrParticipants != null && ArrayOptFind( arrParticipants, "This == _participant.person_id" ) == undefined ) ) )
			{
				continue;
			}
			if( feConversation == undefined || feConversation.active_object_type != "event" )
			{
				oMessage = {
						"action": "call_call",
						"call_type": ( bRunPlanCall ? "plan" : "" ),
						"ticket_id": _participant.ticket_id.Value,
						"call_id": iVideoChatID,
						"conversation_id": docVideoChat.TopElem.conversation_id.Value
				};
				if( bRunPlanCall )
				{
					if( docStartUser != undefined )
					{
						oMessage.SetProperty( "start_user_fullname", RValue( docStartUser.TopElem.fullname ) );
					}
				}
				send_message_to_socket( [ _participant.person_id.Value ], oMessage );
			}
		}
	}
	catch( ex )
	{
		alert(ex);
		oRes.error = 1;
		oRes.message = "Ошибка при регистрации тикетов.";
		return oRes;
	}
	if( bStart && ( feConversation == undefined || feConversation.active_object_type != "event" ) )
	{
		var oCallData = new Object();
		oCallData.id = docVideoChat.DocID;
		oCallData.state_id = "active";
		tools.call_code_library_method( 'libChat', 'write_message', [  "Звонок начат.", docVideoChat.TopElem.conversation_id, null, null, null, [], [], null, ({ data_type: "message_info", call: oCallData }), "system", ArrayExtract( docVideoChat.TopElem.participants, "This.person_id.Value" )  ] );
	}
	if( bNeedSave && bSave )
	{
		docVideoChat.Save();
	}
	oRes.doc_call = docVideoChat;
	return oRes;
}

function close_call( iVideoChatID, docCall, dEndDate, bSave )
{
	/*
		закрывает звонок
		iVideoChatID	- ID звонка
		docCall	- document звонка
		dEndDate		- дата завершения звонка
		bSave			- сохранять разговор по завершению
	*/

	var oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	try
	{
		bSave = bSave != false;
	}
	catch( ex )
	{
		bSave = true;
	}
	try
	{
		iVideoChatID = Int( iVideoChatID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = "Invalid param iVideoChatID";
		return oRes;
	}
	try
	{
		docCall.TopElem;
	}
	catch( ex )
	{
		try
		{
			docCall = tools.open_doc( iVideoChatID );
			if( docCall == undefined )
			{
				throw "error";
			}
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.message = "Invalid param iVideoChatID";
			return oRes;
		}
	}
	try
	{
		dEndDate = Date( dEndDate );
	}
	catch( ex )
	{
		dEndDate = Date();
	}
	if( docCall.TopElem.state_id == "close" )
	{
		oRes.SetProperty( "doc_call", docCall );
		return oRes;
	}
	if( !docCall.TopElem.end_date.HasValue )
	{
		docCall.TopElem.end_date = dEndDate;
	}
	if( docCall.TopElem.end_date.HasValue && docCall.TopElem.start_date.HasValue )
	{
		docCall.TopElem.duration = DateDiff( docCall.TopElem.end_date, docCall.TopElem.start_date );
	}
	
	docCall.TopElem.state_id = "cancel"; 
	sSubject = "Событие \"" +docCall.TopElem.name+ "\" отменено";
	tools.create_notification('modify_event', docCall.TopElem.person_id, sSubject, null, docCall.TopElem);

	docCall.TopElem.state_id = "close";
	var oMediaSoup = tools.dotnet_host.Object.GetAssembly( "Datex.MediaSoup.dll" );
	try
	{
		var sResRemoveRoomJson = oMediaSoup.CallClassStaticMethod( "Datex.MediaSoup.InterServices", "RemoveRoom", [ String( iVideoChatID ) ]);
		var oResRemoveRoom = ParseJson( sResRemoveRoomJson );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = "Ошибка при закрытии комнаты. " + ex;
		return oRes;
	}
	try
	{
		var oMediaSoupService = tools.dotnet_host.Object.GetAssembly( "Datex.MediaSoup.Service.dll" );
		var sResRemovePeerJson = oMediaSoupService.CallClassStaticMethod( "Datex.MediaSoup.Service", "ClosePeerIds", [ String( iVideoChatID ) ] );
		var oResRemovePeer = ParseJson( sResRemovePeerJson );
	}
	catch( ex )
	{
		alert(ex)
	}
	
	var oCallData = new Object();
	oCallData.id = docCall.DocID;
	oCallData.state_id = "close";
	tools.call_code_library_method( 'libChat', 'write_message', [  "Звонок завершен.", docCall.TopElem.conversation_id, null, null, null, [], [], null, ({ data_type: "message_info", call: oCallData }), "system", ArrayExtract( docCall.TopElem.participants, "This.person_id.Value" )  ] );


	if( bSave )
	{
		docCall.Save();
	}
	oRes.SetProperty( "doc_call", docCall );
	return oRes;
}

function is_active_mediasoup()
{
	var bUseMediaSoup = true;
	try
	{
		var oMediaSoup = tools.dotnet_host.Object.GetAssembly( "Datex.MediaSoup.dll" );
		if( oMediaSoup == null )
		{
			throw "error";
		}

		oMediaSoup.CallClassStaticMethod( "Datex.MediaSoup.InterServices", "GetUser", [ null ] );
	}
	catch( ex )
	{
		bUseMediaSoup = false;
	}

	return bUseMediaSoup
}

function GetPersonConversationSettingsObjectDataTypeId()
{
	var catObjectDataType = ArrayOptFirstElem( XQuery( "for $elem in object_data_types where $elem/code = 'person_conversation_settings' return $elem/Fields('id')" ) );
	if( catObjectDataType != undefined )
	{
		return catObjectDataType.id.Value;
	}
	return null;
}

function GetPersonConversationSettings( iUserID )
{
	iUserID = OptInt( iUserID );
	var oPersonConversationSettings = new Object();
	if( iUserID != undefined )
	{
		var iPersonConversationSettingsObjectDataTypeId = GetPersonConversationSettingsObjectDataTypeId();

		if( iPersonConversationSettingsObjectDataTypeId != null )
		{
			var catPersonConversationSettingsObjectData = ArrayOptFirstElem( XQuery( "for $elem in object_datas where $elem/object_data_type_id = " + iPersonConversationSettingsObjectDataTypeId + " and $elem/object_id = " + iUserID + " and $elem/status_id = 'active' return $elem/Fields('id')" ) );
			if( catPersonConversationSettingsObjectData != undefined )
			{
				try
				{
					docPersonConversationSettingsObjectData = tools.open_doc( catPersonConversationSettingsObjectData.id );
					if( docPersonConversationSettingsObjectData != undefined )
					{
						oPersonConversationSettings = ParseJson( docPersonConversationSettingsObjectData.TopElem.data.Value );
					}
				}
				catch( ex )
				{
					oPersonConversationSettings = new Object();
				}
			}
		}
	}
	return oPersonConversationSettings;
}

function SetPersonConversationSettings( iUserID, teUser, oSettings )
{
	iUserID = OptInt( iUserID );
	if( iUserID != undefined )
	{
		var iPersonConversationSettingsObjectDataTypeId = GetPersonConversationSettingsObjectDataTypeId();

		if( iPersonConversationSettingsObjectDataTypeId != null )
		{
			var catPersonConversationSettingsObjectData = ArrayOptFirstElem( XQuery( "for $elem in object_datas where $elem/object_data_type_id = " + iPersonConversationSettingsObjectDataTypeId + " and $elem/object_id = " + iUserID + " and $elem/status_id = 'active' return $elem/Fields('id', 'name')" ) );
			if( catPersonConversationSettingsObjectData != undefined )
			{
				var docPersonConversationSettingsObjectData = tools.open_doc( catPersonConversationSettingsObjectData.id );
			}
			else
			{
				var docPersonConversationSettingsObjectData = tools.new_doc_by_name( "object_data" );
				docPersonConversationSettingsObjectData.BindToDb( DefaultDb );
				docPersonConversationSettingsObjectData.TopElem.object_data_type_id = iPersonConversationSettingsObjectDataTypeId;
				docPersonConversationSettingsObjectData.TopElem.object_type = "collaborator";
				docPersonConversationSettingsObjectData.TopElem.object_id = iUserID;
				try
				{
					teUser.Name;
				}
				catch( ex )
				{
					teUser = tools.open_doc( iUserID ).TopElem;
				}
				docPersonConversationSettingsObjectData.TopElem.object_name = RValue( teUser.fullname );
				docPersonConversationSettingsObjectData.TopElem.name = RValue( teUser.fullname );
			}

			docPersonConversationSettingsObjectData.TopElem.data = EncodeJson( oSettings );
			var arrBaseSettings = [ "state_id" ];
			var oBaseSettings = new Object();
			try
			{
				if( docPersonConversationSettingsObjectData.TopElem.data_str.HasValue )
				{
					oBaseSettings = ParseJson( docPersonConversationSettingsObjectData.TopElem.data_str );
				}
			}
			catch( ex ){}
			var bNeedUpdate = false;
			for( _bs in arrBaseSettings )
			{
				if( oSettings.GetOptProperty( _bs ) != undefined )
				{
					if( oSettings.GetOptProperty( _bs ) != oBaseSettings.GetOptProperty( _bs ) )
					{
						bNeedUpdate = true;
					}
					oBaseSettings.SetProperty( _bs, oSettings.GetOptProperty( _bs ) );
				}
			}
			docPersonConversationSettingsObjectData.TopElem.data_str = EncodeJson( oBaseSettings );
			docPersonConversationSettingsObjectData.Save();
			if( bNeedUpdate )
			{
				var teCommand = OpenDocFromStr( tools.xml_header() + '<queue_call/>' ).TopElem;
				teCommand.AddChild( 'type', 'string' ).Value = 'update_base_settings';
				teCommand.AddChild( 'user_id', 'integer' ).Value = iUserID;
				teCommand.AddChild( 'settings_json', 'string' ).Value = EncodeJson( oBaseSettings );
				tools.put_message_in_queue( 'chat-sendtosocket-queue', teCommand.GetXml( { 'tabs': false } ) );
			}
		}
	}
	return true;
}
/**
 * @typedef {Object} oCall
 * @property {bigint} id
 * @property {bigint} creator_id
 * @property {bigint} conversation_id
 * @property {date} start_date
 * @property {date} end_date
 * @property {number} duration
 * @property {string} duration_str
 * @property {string} state_id
 * @property {boolean} entered
 * @property {boolean} is_group_call
 * @property {string} type
*/
/**
 * @typedef {Object} WTCallResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oCall[]} result – массив
*/
/**
 * @function GetPersonCalls
 * @memberof Websoft.WT.Chat
 * @description Получения списка звонков.
 * @param {bigint} iPersonID - ID пользователя
 * @param {string[]} arrStates - массив статусов
 * @param {number} [iPageSize] - количество сообщений на странице
 * @param {number} [iPageNum] - номер страницы с сообщениями
 * @param {bigint} [iConversationID] - ID разговора
 * @returns {WTCallResult}
 */
function GetPersonCalls( iPersonID, arrStates, iPageNum, iPageSize, iConversationID )
{
	var oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];

	try
	{
		if( !IsArray( arrStates ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		arrStates = null;
	}
	try
	{
		iPageNum = Int( iPageNum )
	}
	catch( ex )
	{
		iPageNum = null;
	}

	try
	{
		iPageSize = Int( iPageSize )
	}
	catch( ex )
	{
		iPageSize = 100;
	}
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID сотрудника";
		return oRes;
	}
	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		iConversationID = undefined;
	}

	var call_conds = new Array();
	if( arrStates != null )
	{
		call_conds.push( "MatchSome( $elem/state_id, ( " + ArrayMerge( arrStates, "XQueryLiteral( This )", "," ) + " ) )" );
	}
	if( iConversationID != undefined )
	{
		call_conds.push( "$elem/conversation_id = " + iConversationID );
	}
	call_conds.push( "MatchSome( $elem/participants_id, ( " + iPersonID + " ) )" );
	var xarrCalls = XQuery( "for $elem in calls where " + ArrayMerge( call_conds, "This", " and " ) + " order by $elem/start_date return $elem/Fields('id','start_date','end_date','duration','state_id','entered_participants_id','conversation_id','person_id')" );
	if( iPageNum != null )
	{
		xarrCalls = ArrayRange( xarrCalls, iPageSize*( iPageNum - 1 ), iPageSize );
	}
	var oCall;
	for( _vc in xarrCalls )
	{
		oCall = new Object();
		oCall.id = _vc.id.Value;
		oCall.start_date = _vc.start_date.Value;
		oCall.end_date = _vc.end_date.Value;
		oCall.duration = _vc.duration.Value;
		oCall.duration_str = tools.call_code_library_method("libSchedule", "get_str_time_from_second", [ _vc.duration.Value ]).time_str;
		oCall.state_id = _vc.state_id.Value;
		oCall.creator_id = _vc.person_id.Value;
		oCall.conversation_id = _vc.conversation_id.Value;
		oCall.is_group_call = false;
		oCall.type = ( iPersonID == _vc.person_id ? "out" : "in" );
		oCall.entered = _vc.entered_participants_id.ByValueExists( iPersonID );
		oRes.array.push( oCall )
	}
	return oRes;
}

function SetStatusCall( iCallID, docCall, sNewStatus )
{
	var oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];

	try
	{
		iCallID = Int( iCallID );
	}
	catch( ex )
	{
		oRes.error = 0;
		oRes.errorText = "Некорректный ID звонка";
		return oRes;
	}
	try
	{
		docCall.TopElem;
	}
	catch( ex )
	{
		try
		{
			docCall = tools.open_doc( iCallID );
			if( docCall == undefined )
			{
				throw "error";
			}
		}
		catch( ex )
		{
			oRes.error = 0;
			oRes.errorText = "Некорректный ID звонка";
			return oRes;
		}
	}

	try
	{
		if( common.event_status_types.GetOptChildByKey( sNewStatus ) == undefined )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oRes.error = 0;
		oRes.errorText = "Некорректный статус звонка";
		return oRes;
	}

	if( sNewStatus == docCall.TopElem.state_id )
	{
		return oRes;
	}

	switch( sNewStatus )
	{
		case "active":
			var oResStart = start_call( iCallID, docCall, false, null, false );
			if( oResStart.error != 0 )
			{
				oRes.error = oResStart.error;
				oRes.errorText = oResStart.message;
				return oRes;
			}
			oResStart.doc_call.TopElem.state_id = sNewStatus;
			oResStart.doc_call.Save();
			break;
		case "close":
		case "cancel":
			var oResStart = close_call( iCallID, docCall, Date(), false );
			if( oResStart.error != 0 )
			{
				oRes.error = oResStart.error;
				oRes.errorText = oResStart.message;
				return oRes;
			}
			oResStart.doc_call.TopElem.state_id = sNewStatus;
			oResStart.doc_call.Save();
			break;
		default:
			docCall.TopElem.state_id = sNewStatus;
			docCall.Save();
			break;
	}

	return oRes;
}

/**
 * @typedef {Object} oConversationFile
 * @property {bigint} id
 * @property {string} name
 * @property {string} url
 * @property {string} type
 * @property {string} type_name
 * @property {date} message_date
*/
/**
 * @typedef {Object} WTGetConversationFilesResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oConversationFile[]} array – массив
*/
/**
 * @function GetConversationFiles
 * @memberof Websoft.WT.Chat
 * @description Получения списка файлов разговора.
 * @param {bigint} iPersonID - ID пользователя
 * @param {XmElem} tePerson - TopElem разговора
 * @param {bigint} iConversationID - ID разговора
 * @param {XmDoc} docConversation - документ разговора
 * @param {number} [iPageSize] - количество сообщений на странице
 * @param {number} [iPageNum] - номер страницы с сообщениями
 * @returns {WTGetConversationFilesResult}
 */
function GetConversationFiles( iPersonID, tePerson, iConversationID, docConversation, iPageNum, iPageSize, Session )
{
	var oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];
	oRes.more = false;

	try
	{
		iPageNum = Int( iPageNum )
	}
	catch( ex )
	{
		iPageNum = 1;
	}

	try
	{
		iPageSize = Int( iPageSize )
	}
	catch( ex )
	{
		iPageSize = 100;
	}
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID сотрудника";
		return oRes;
	}
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID сотрудника";
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
			tePerson = tools.open_doc( iPersonID ).TopElem;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = "Передан некорректный ID сотрудника";
			return oRes;
		}
	}
	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID разговора";
		return oRes;
	}
	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID разговора";
		return oRes;
	}
	try
	{
		docConversation.TopElem;
	}
	catch( err )
	{
		try
		{
			docConversation = tools.open_doc( iConversationID );
			if( docConversation == undefined )
			{
				throw "error";
			}
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = "Передан некорректный ID разговора";
			return oRes;
		}
	}

	var bm_conds = new Array();

	bm_conds.push( "$elem/object_id = " + iConversationID );
	bm_conds.push( "$elem/state_id != 'hidden'" );
	var xarrBlockMessages = XQuery( "for $elem in block_messages where " + ArrayMerge( bm_conds, "This", " and " ) + " order by $elem/create_date descending return $elem/Fields('id')" );

	var aUserRoles = new Array();
	var aUserGroups = null;
	if( docConversation.TopElem.conversation_type_id.HasValue )
	{
		var docConversationType = tools.open_doc( docConversation.TopElem.conversation_type_id );
		if( docConversationType != undefined )
		{
			for( _disp_role in docConversationType.TopElem.disp_roles )
			{
				try
				{
					tePerson.Name
				}
				catch( ex )
				{
					tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
				}
				if( aUserGroups == null )
				{
					aUserGroups = ArrayExtract( XQuery( "for $elem in group_collaborators where $elem/collaborator_id = " + iPersonID + "  return $elem/Fields( 'group_id' )" ), "This.group_id.Value" );
				}
				if( check_access_role( _disp_role.access, iPersonID, tePerson, aUserGroups ) )
				{
					aUserRoles.push( _disp_role.id.Value );
				}
			}
		}
	}
	var oMessage, docBlockMessage, teBlockMessage, aUserMessages;
	var iCurrentMessage = 1;
	var iStartMessage = iPageSize*( iPageNum - 1 ) + 1;
	var iFinishMessage = iStartMessage + iPageSize;
	var bBreak = false;
	var oFile;
	var _file, _message;
	for( _vc in xarrBlockMessages )
	{
		docBlockMessage = OpenDoc( UrlFromDocID( _vc.id ) );
		teBlockMessage = docBlockMessage.TopElem;
		//aUserMessages = ArraySelect( teBlockMessage.messages, "StrContains( This.text, sSearchText, true )" );
		aUserMessages = teBlockMessage.messages;
		aUserMessages = ArraySelect( aUserMessages, 'check_user_access_message( This, iPersonID, tePerson, iConversationID, docConversation.TopElem, null, aUserRoles )' );

		for( _message in ArraySort( aUserMessages, 'This.ChildIndex', '-' ) )
		{
			for( _file in _message.files )
			{
				if( iStartMessage > iCurrentMessage )
				{
					iCurrentMessage++;
					continue;
				}
				if( iCurrentMessage >= iFinishMessage )
				{
					oRes.more = true;
					bBreak = true;
					break;
				}
				oFile = new Object();
				oFile.id = _file.file_id.Value;
				oFile.name = "";
				oFile.type = "";
				oFile.type_name = "";
				oFile.message_date = _message.create_date.Value;
				oFile.message_id = _message.id.Value;
				oFile.message_text = _message.text.Value;
				oFile.block_message_id = _vc.id.Value;
				oFile.url = tools_web.get_resource_url( _file.file_id, Session );;
				oRes.array.push( oFile )

				iCurrentMessage++;
				
			}
			if( bBreak )
			{
				break;
			}
		}
		if( bBreak )
		{
			break;
		}

	}
	if( ArrayOptFirstElem( oRes.array ) != undefined )
	{
		var xarrResource = XQuery( "for $elem in resources where MatchSome( $elem/id, ( " + ArrayMerge( oRes.array, "This.id", "," ) + " ) ) return $elem/Fields('id','name','type')" );
		xarrResource = ArraySort( xarrResource, "This.id", "+" );
		var feFile;
		for( _file in oRes.array )
		{
			feFile = ArrayOptFindBySortedKey( xarrResource, _file.id, "id" );
			if( feFile != undefined )
			{
				_file.name = feFile.name.Value;
				_file.type = feFile.type.Value;
				_file.type_name = feFile.type.ForeignElem.name.Value;
			}
		}
	}
	return oRes;
}

/**
 * @typedef {Object} oConversationLink
 * @property {string} id
 * @property {string} link
 * @property {string} message_text
 * @property {bigint} block_message_id
 * @property {string} message_id
 * @property {date} message_date
*/
/**
 * @typedef {Object} WTGetConversationLinksResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oConversationLink[]} array – массив
*/
/**
 * @function GetConversationLinks
 * @memberof Websoft.WT.Chat
 * @description Получения списка ссылок разговора.
 * @param {bigint} iPersonID - ID пользователя
 * @param {XmElem} tePerson - TopElem разговора
 * @param {bigint} iConversationID - ID разговора
 * @param {XmDoc} docConversation - документ разговора
 * @param {number} [iPageSize] - количество сообщений на странице
 * @param {number} [iPageNum] - номер страницы с сообщениями
 * @returns {WTGetConversationLinksResult}
 */
function GetConversationLinks( iPersonID, tePerson, iConversationID, docConversation, iPageNum, iPageSize, Session )
{
	var oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];
	oRes.more = false;

	try
	{
		iPageNum = Int( iPageNum )
	}
	catch( ex )
	{
		iPageNum = 1;
	}

	try
	{
		iPageSize = Int( iPageSize )
	}
	catch( ex )
	{
		iPageSize = 100;
	}

	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID сотрудника";
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
			tePerson = tools.open_doc( iPersonID ).TopElem;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = "Передан некорректный ID сотрудника";
			return oRes;
		}
	}

	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID разговора";
		return oRes;
	}
	var strSymbols = "!*'();:@&=+$,/?#[]-_.~\"";
	var iStartIndex, iFinishIndex, sMessageText, _protocol, oLink, i;
	var iCurrentMessage = 1;
	var bBreak = false;

	var iStartMessage = iPageSize*( iPageNum - 1 ) + 1;

	var iFinishMessage = iStartMessage + iPageSize;

	var oResMessages = get_conversation_messages( iConversationID, iPersonID, Session, null, tePerson, null, 999999, false, null, null, false, null, null );
	for( _message in oResMessages.messages )
	{
		sMessageText = String( _message.text );
		for( _protocol in [ "http", "https" ] )
		{
			iFinishIndex = 0;
			iStartIndex = sMessageText.indexOf( _protocol + "://", iFinishIndex );

			while( iStartIndex >= 0 )
			{

				/*iFinishIndex = sMessageText.indexOf( " ", iStartIndex );

				if( iFinishIndex < 0 )
				{
					iFinishIndex = StrLen( sMessageText );
				}
				else
				{
					iFinishIndex--;
				}*/
				i = StrLen( _protocol + "://" );
				while( ( iStartIndex + i ) < StrLen( sMessageText ) && ( UrlEncode( sMessageText.charAt( iStartIndex + i ) ) == sMessageText.charAt( iStartIndex + i ) || StrContains( strSymbols, sMessageText.charAt( iStartIndex + i ) ) ) )
				{
					i++;
				}
				/*alert(UrlEncode( sMessageText.charAt( iStartIndex + i ) ) + " - " + sMessageText.charAt( iStartIndex + i ) )
				if( ( iStartIndex + i ) < StrLen( sMessageText ) )
				{
					i--;
				}*/
				iFinishIndex = iStartIndex + i;
				if( iStartMessage > iCurrentMessage )
				{
					iCurrentMessage++;
					iStartIndex = sMessageText.indexOf( _protocol + "://", iFinishIndex );
					continue;
				}
				if( iCurrentMessage >= iFinishMessage )
				{
					oRes.more = true;
					bBreak = true;
					break;
				}
				oLink = new Object();
				oLink.id = Random( 0, 999999999 );
				oLink.link = StrRangePos( sMessageText, iStartIndex, iStartIndex + i - 1 );
				for( i = 0; i < StrLen( strSymbols ); i++ )
				{
					if( StrEnds( oLink.link, strSymbols.charAt( i ) ) )
					{
						oLink.link = oLink.link.substr( 0, StrLen( oLink.link ) - 1 );
						break;
					}
				}
				oLink.message_date = _message.create_date;
				oLink.message_id = _message.id;
				oLink.message_text = sMessageText;
				oLink.block_message_id = _message.block_message_id;
				oRes.array.push( oLink )
				iStartIndex = sMessageText.indexOf( _protocol + "://", iFinishIndex );
				iCurrentMessage++;
				
			}
			if( bBreak )
			{
				break;
			}
		}
		if( bBreak )
		{
			break;
		}
	}
	return oRes;
}

function add_participants_to_call( iCallID, docCall, iConversationID, arrParticipants, bSave, bStart )
{
	/*
		создает звонок
		iCallID				- ID звонка
		docCall				- document звонка
		iConversationID 	- ID разговора
		arrParticipants		- массив ID участников
		bSave				- сохранять звонок по завершению
		bStart				- начинать разговор
	*/

	var oRes = new Object();
	oRes.error = 0;
	oRes.message = '';
	oRes.doc_call = null;
	try
	{
		bSave = bSave != false;
	}
	catch( ex )
	{
		bSave = true;
	}
	try
	{
		bStart = bStart != false;
	}
	catch( ex )
	{
		bStart = true;
	}
	try
	{
		iCallID = Int( iCallID );
	}
	catch( ex )
	{
		try
		{
			iConversationID = Int( iConversationID );
			var catActiveCall = ArrayOptFirstElem( XQuery( "for $elem in calls where $elem/conversation_id = " + iConversationID + " and $elem/state_id = 'active' return $elem" ) );
			if( catActiveCall == undefined )
			{
				oRes.error = 1;
				oRes.message = "Нет активных звонков в разговоре";
				return oRes;
			}
			iCallID = catActiveCall.id;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.message = "Invalid param iCallID";
			return oRes;
		}
	}

	try
	{
		docCall.TopElem;
	}
	catch( ex )
	{
		try
		{
			docCall = tools.open_doc( iCallID );
			if( docCall == undefined )
			{
				throw "error";
			}
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.message = "Invalid param iCallID";
			return oRes;
		}
	}

	try
	{
		if( !IsArray( arrParticipants ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = "Invalid param arrParticipants";
		return oRes;
	}
	var bNeedSave = false;
	for( _participant in arrParticipants )
	{
		if( docCall.TopElem.participants.GetOptChildByKey( _participant ) == undefined )
		{
			docCall.TopElem.participants.ObtainChildByKey( _participant );
			bNeedSave = true;
		}
	}

	if( bNeedSave && bSave )
	{
		docCall.Save();
	}
	oRes.doc_call = docCall;
	if( bNeedSave && bStart )
	{
		return start_call( iCallID, docCall, true );
	}
	return oRes;
}

function check_active_call()
{
	var oRes = new Object();
	oRes.error = 0;
	oRes.message = "";
	
	EnableLog( "call" );
	var iTimeoutLeaved = 10*1000;
	var dCheckDate;
	var oResLibChat;
	var _call, docCall, arrRoomTickets, oRoom, oTicket, _participant, sUserDataKey, oUserData, bNeedSave;
	var oMediaSoup = tools.dotnet_host.Object.GetAssembly( "Datex.MediaSoup.dll" );
	for( _call in XQuery( "for $elem in calls where some $con in conversations satisfies ( $elem/conversation_id = $con/id and $con/active_object_type = 'chat' ) and $elem/state_id = 'active' return $elem" ) )
	{
		try
		{
			docCall = tools.open_doc( _call.id );
			bNeedSave = false;
			try
			{
				oRoom = oMediaSoup.CallClassStaticMethod( "Datex.MediaSoup.InterServices", "GetRoom", [ null, String( _call.id.Value ) ] );
			}
			catch( ex )
			{
				close_call( _call.id, docCall );
				continue;
			}
			arrRoomTickets = oMediaSoup.CallClassStaticMethod( "Datex.MediaSoup.InterServices", "GetTickets", [ null, String( _call.id.Value ) ] );
			arrRoomTickets = ArrayExtract( arrRoomTickets, "ParseJson( This )" );
			for( _participant in docCall.TopElem.participants )
			{
				if( _participant.state_id == "active" && _participant.has_entered )
				{
					oTicket = ArrayOptFind( arrRoomTickets, "OptInt( This.GetOptProperty( 'UserId' ) ) == _participant.person_id" );
					sUserDataKey = "time_out_leaved_call_" + _call.id.Value + "_" +  _participant.person_id.Value;
					if( oTicket == undefined || !tools_web.is_true( oTicket.GetOptProperty( "Ready" ) ) )
					{
						
						oUserData = tools_web.get_user_data( sUserDataKey );
						iCheckTicks = OptInt( oUserData );
						if( iCheckTicks != undefined )
						{
							
							if( ( iCheckTicks + iTimeoutLeaved ) < GetCurTicks() )
							{
								_participant.state_id = "archive";
								//_participant.has_entered = false;
								_participant.ticket_id.Clear();
								_participant.hash_id.Clear();
								oMessage = { "conversation_id": docCall.TopElem.conversation_id.Value, "call_id": _call.id.Value, "action" : "leaved_call", "leaved_recipients": [ _participant.person_id.Value ] };
								CallServerMethod( 'tools', 'call_code_library_method', [ "libChat", "send_message_to_socket", [ ArrayExtract( ArraySelect( docCall.TopElem.participants, "This.person_id != _participant.person_id" ), "This.person_id.Value" ), oMessage ] ] );
								bNeedSave = true;
							}
						}
						else
						{
							tools_web.set_user_data( sUserDataKey, GetCurTicks(), 3600 );
						}
					}
					else
					{
						tools_web.remove_user_data( sUserDataKey );
					}
				}
			}
			if( ArrayOptFind( docCall.TopElem.participants, "This.state_id == 'active' && This.has_entered" ) == undefined && ArrayOptFind( docCall.TopElem.participants, "This.has_entered" ) != undefined )
			{
				oResLibChat = tools.call_code_library_method( "libChat", "close_call", [ docCall.DocID, docCall, Date(), false ] );
				bNeedSave = true;
				if( oResLibChat.error == 0 )
				{
					docCall = oResLibChat.doc_call;
				}
				else
				{
					LogEvent( "call", "leave_call " + oResLibChat.message );
				}
			}
			if( bNeedSave )
			{
				docCall.Save();
			}
		}
		catch( err )
		{
			LogEvent( "call", "check_active_call " + _call.id + " - " + err );
		}
	}
	for( _call in XQuery( "for $elem in calls where some $con in conversations satisfies ( $elem/conversation_id = $con/id and $con/active_object_type = 'chat' ) and $elem/state_id = 'plan' and $elem/plan_start_date < " + XQueryLiteral( Date() ) + " return $elem" ) )
	{
		try
		{
			start_call( _call.id );
		}
		catch( err )
		{
			LogEvent( "call", "check_active_call " + _call.id + " - " + err );
		}
	}
	return oRes;
}

/**
 * @function toLog
 * @memberof Websoft.WT.Chat
 * @author BG
 * @description Запись в лог подсистемы.
 * @param {string} sText - Записываемое сообщение
 * @param {boolean} bDebug - вкл/выкл вывода
*/
function toLog(sText, bDebug)
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
		bDebug = global_settings.debug;
	}
	
	if( bDebug )
	{
		EnableLog('chat_library');
		LogEvent('chat_library', sText )
	}
}
/**
 * @typedef {Object} DeleteBlockMessageResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {number} count – количество удаленных
*/
/**
 * @function DeleteBlockMessage
 * @memberof Websoft.WT.Chat
 * @author IG
 * @description Удаление блоков сообщений
 * @param {bigint[]} arrBlockMessageIDs - Массив ID блоков сообщений, подлежащих удалению
 * @returns {DeleteBlockMessageResult}
*/
function DeleteBlockMessage( arrBlockMessageIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;

	if(!IsArray(arrBlockMessageIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrBlockMessageIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "block_message")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID блоков сообщений или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iBlockMessageID in arrBlockMessageIDs)
	{
		try
		{
			sSQL = "for $elem in block_messages where contains( $elem/id, ('" + XQueryLiteral(iBlockMessageID) + "') ) return $elem"
			oBlockMessageObjectID = ArrayOptFirstElem(tools.xquery(sSQL));

			if(oBlockMessageObjectID == undefined){
				continue;
			}

			DeleteDoc( UrlFromDocID( iBlockMessageID ), false);
			oRes.count++;
		}
		catch(err)
		{
			toLog("ERROR: DeleteBlockMessage: " + ("[" + iBlockMessageID + "]\r\n") + err, true);
		}
	}

	return oRes;
}
/**
 * @typedef {Object} DeleteConversationResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {number} count – количество удаленных
*/
/**
 * @function DeleteConversation
 * @memberof Websoft.WT.Chat
 * @author IG
 * @description Удаление разговоров
 * @param {bigint[]} arrConversationIDs - Массив ID разговоров, подлежащих удалению
 * @returns {DeleteConversationResult}
*/
function DeleteConversation( arrConversationIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;

	if(!IsArray(arrConversationIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrConversationIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "conversation")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID разговоров или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iConversationID in arrConversationIDs)
	{
		try
		{

			sSQL = "for $elem in conversations where contains( $elem/id, ('" + XQueryLiteral(iConversationID) + "') ) return $elem"
			oConversationObjectID = ArrayOptFirstElem(tools.xquery(sSQL));

			if(oConversationObjectID == undefined){
				continue;
			}

			/* Блоки сообщений */
			sSQL = "for $elem in block_messages where contains( $elem/object_id, ('" + XQueryLiteral(iConversationID) + "') ) return $elem";
			aBlockMessageObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");

			for (iBlockMessageObjectID in aBlockMessageObjectIDs)
			{
				DeleteDoc( UrlFromDocID( iBlockMessageObjectID ), false);
			}

			DeleteDoc( UrlFromDocID( iConversationID ), false);
			oRes.count++;

		}
		catch(err)
		{
			toLog("ERROR: DeleteСonversation: " + ("[" + iConversationID + "]\r\n") + err, true);
		}
	}

	return oRes;
}
/**
 * @typedef {Object} DeleteChatResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {number} count – количество удаленных
*/
/**
 * @function DeleteChat
 * @memberof Websoft.WT.Chat
 * @author IG
 * @description Удаление чатов
 * @param {bigint[]} arrChatIDs - Массив ID чатов, подлежащих удалению
 * @returns {DeleteChatResult}
*/
function DeleteChat( arrChatIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	var checkHas = false;

	if(!IsArray(arrChatIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrChatIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "chat")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID чатов или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iChatID in arrChatIDs)
	{
		try
		{
			checkHas = false

			sSQL = "for $elem in chats where contains( $elem/id, ('" + XQueryLiteral(iChatID) + "') ) return $elem"
			oChatObjectID = ArrayOptFirstElem(tools.xquery(sSQL));

			if(oChatObjectID == undefined){
				continue;
			}

			/* Разговоры */
			sSQL = "for $elem in conversations return $elem";
			aConversationObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");

			for (iConversationObjectID in aConversationObjectIDs)
			{
				docConversation = tools.open_doc( iConversationObjectID );
				docConversationTE = docConversation.TopElem;

				if (docConversationTE != null)
				{
					oConversationObject = ArrayOptFind(docConversationTE.participants, "OptInt(This.object_id) == " + iChatID);
					if(oConversationObject != undefined){
						checkHas = true;
						continue;
					}
				}
			}
			
			if(checkHas == true){
				continue;
			} else {
				/* Блоки сообщений */
				sSQL = "for $elem in block_messages where contains( $elem/object_id, ('" + XQueryLiteral(iChatID) + "') ) return $elem";
				aBlockMessageObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");

				for (iBlockMessageObjectID in aBlockMessageObjectIDs)
				{
					// удалить все Блоки сообщений, привязанные к этому чату
					DeleteDoc( UrlFromDocID( iBlockMessageObjectID ), false);
				}

				DeleteDoc( UrlFromDocID( iChatID ), false);
				oRes.count++;
			}

		}
		catch(err)
		{
			toLog("ERROR: DeleteChat: " + ("[" + iChatID + "]\r\n") + err, true);
		}
	}

	return oRes;
}

function chatbot_escalation_process( iChatbotChatID )
{
	function check_command( command, top_elem )
	{
		if( ( top_elem.Name == 'chatbot_stage' && ( top_elem.keyboard_type == 'inline_keyboard' || top_elem.keyboard_type == 'combo' ) ) && command.is_inline_keyboard )
		{
			return message != null && message.inline_keyboard_id == command.inline_keyboard_id;
		}
		else
		{
			return check_code_library_condition( command, top_elem, curChat, TEXT, get_cur_user(), docChatbotStage.TopElem );
		}
		return false;
	}
	var curUser = undefined;
	var curUserID = undefined;
	function get_cur_user()
	{
		if( curUser == undefined && message != null )
		{
			curUser = tools.open_doc( message.person_info.id );
			curUserID = message.person_info.id;
			if( curUser != undefined )
			{
				curUser = curUser.TopElem;
			}
		}
		return curUser;
	}
	
	var oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = new Object();
	try
	{
		iChatbotChatID = Int( iChatbotChatID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Некорректный ID чата чатбота";
		return oRes;
	}
	try
	{
		var docChatbotChat = tools.open_doc( iChatbotChatID );
		if( docChatbotChat == undefined )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Некорректный ID чата чатбота";
		return oRes;
	}
	
	if( !docChatbotChat.TopElem.chatbot_stage_id.HasValue )
	{
		docChatbotChat.TopElem.escalation.Clear();
		docChatbotChat.Save();
		return oRes;
	}
	var docChatbotStage = tools.open_doc( docChatbotChat.TopElem.chatbot_stage_id );
	if( docChatbotStage == undefined )
	{
		docChatbotChat.TopElem.escalation.Clear();
		docChatbotChat.Save();
		return oRes;
	}
	
	var _escalation_stage, dStageDate;
	var bNeedSave = false;
	var sEscalationCommandMessageText;
	var curChat = docChatbotChat.TopElem;
	var message;
	try
	{
		message = OpenDocFromStr( curChat.last_message_xml, 'form=x-local://wtv/wtv_form_chatbot_message.xmd' ).TopElem;
	}
	catch( ex )
	{
		message = null;
	}
	curUser = get_cur_user()
	var TEXT = message != null ? message.text : null;
	var teStage = docChatbotStage.TopElem;
	for( _escalation_stage in docChatbotStage.TopElem.escalation.escalation_stages )
	{
		if( docChatbotChat.TopElem.escalation.worked_escalation_stages.GetOptChildByKey( _escalation_stage.id ) != undefined )
		{
			continue;
		}
		dStageDate = DateOffset( docChatbotChat.TopElem.escalation.start_date, OptReal( _escalation_stage.escalation_hour, 0 )*60*60 );
		if( DateDiff( dStageDate, Date() ) < 0 )
		{
			bNeedSave = true;
			if( check_command( _escalation_stage, docChatbotStage.TopElem ) )
			{
				switch( _escalation_stage.escalation_action_library.eval_code_type )
				{
					case "code_library":
						eval_code_library_code( _escalation_stage.escalation_action_library, curChat, TEXT, get_cur_user(), teStage );
						break;
					default:
						eval( _escalation_stage.escalation_action );
						break;
				}
				sEscalationCommandMessageText = "";
				if( !_escalation_stage.escalation_command_text_library.eval_code_type.HasValue )
				{
					_escalation_stage.escalation_command_text_library.eval_code_type = _escalation_stage.is_eval_escalation_command ? "eval" : "text";
				}
				switch( _escalation_stage.escalation_command_text_library.eval_code_type )
				{
					case "code_library":
						sEscalationCommandMessageText = eval_code_library_code( _escalation_stage.escalation_command_text_library, curChat, TEXT, get_cur_user(), teStage ).result;
						break;
					case "text":
						sEscalationCommandMessageText = _escalation_stage.escalation_command_text.Value;
						break;
					case "eval":
						sEscalationCommandMessageText = eval( _escalation_stage.escalation_command_text.Value );
						break;
				}
				
				if( sEscalationCommandMessageText != "" )
				{
					oRes.result = send_message_to_chatbot( sEscalationCommandMessageText, iChatbotChatID, docChatbotChat, null, docChatbotChat.TopElem.conversation_id );
				}
				if( _escalation_stage.chatbot_stage_id.HasValue )
				{
					oRes.result = send_to_stage( null, iChatbotChatID, _escalation_stage.chatbot_stage_id, docChatbotChat, curChat.chatbot_stage_id, null, false, docChatbotChat.TopElem.conversation_id, null, null, curUserID, curUser );
					return oRes;
				}
			}
			docChatbotChat.TopElem.escalation.worked_escalation_stages.ObtainChildByKey( _escalation_stage.id );
		}
	}
	if( bNeedSave )
	{
		docChatbotChat.TopElem.calculate_escalation_date( docChatbotStage.TopElem );
		docChatbotChat.Save();
	}
	return oRes;
}

function create_chatbot_script( iPersonID, iObjectID, iChatbotID, docPerson, docObject )
{
	var oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Некорректный ID сотрудника";
		return oRes;
	}
	try
	{
		iObjectID = Int( iObjectID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Некорректный ID объекта";
		return oRes;
	}
	var catObjectConversation = ArrayOptFirstElem( XQuery( "for $elem in conversations where $elem/active_object_id = " + iObjectID + " and $elem/person_id = " + iPersonID + " and $elem/state_id = 'active' return $elem/Fields('id')" ) );
	if( catObjectConversation == undefined )
	{
		try
		{
			docObject.TopElem;
		}
		catch( ex )
		{
			try
			{
				docObject = tools.open_doc( iObjectID );
				if( docObject == undefined )
				{
					throw "error";
				}
			}
			catch( ex )
			{
				oRes.error = 1;
				oRes.errorText = "Некорректный ID объекта";
				return oRes;
			}
		}
		var sConversationName = "";
		switch( docObject.TopElem.Name )
		{
			case "event_result":
			{
				sConversationName += "Мероприятие" + " - " + docObject.TopElem.event_name.Value;
				break;
			}
			case "active_learning":
			case "learning":
			{
				sConversationName += "Курс" + " - " + docObject.TopElem.course_name.Value;
				break;
			}
			case "active_test_learning":
			case "test_learning":
			{
				sConversationName += "Тест" + " - " + docObject.TopElem.assessment_name.Value;
				break;
			}
			default:
			{
				var catObjectType = common.exchange_object_types.GetOptChildByKey( _object_type.object_type.Value );
				if( catObjectType != undefined )
				{
					sConversationName += catObjectType.title.Value
				}
				sConversationName += " - " + tools.get_disp_name_value( docObject.TopElem );
				break;
			}
		}
		var oResConversation = change_participants_conversation( null, null, "change_object", null, [iPersonID], null, null, docObject, null, sConversationName, iPersonID );
		if( oResConversation.error == 0 )
		{
			add_chatbot_to_conversation( oResConversation.doc_conversation.DocID, iChatbotID, null, true );
			var feObject;
			switch( docObject.TopElem.Name )
			{
				case "event_result":
				{
					feObject = docObject.TopElem.event_id.OptForeignElem;
					break;
				}
				case "active_learning":
				case "learning":
				{
					feObject = docObject.TopElem.course_id.OptForeignElem;
					break;
				}
				case "active_test_learning":
				case "test_learning":
				{
					feObject = docObject.TopElem.assessment_id.OptForeignElem;
					break;
				}
				default:
				{
					feObject = docObject.TopElem;
					break;
				}
			}
			if( feObject != undefined && feObject.ChildExists( "resource_id" ) && feObject.resource_id.HasValue )
			{
				oResConversation.doc_conversation.TopElem.resource_id = feObject.resource_id;
				oResConversation.doc_conversation.Save();
			}
		}
	}
	else
	{
		add_chatbot_to_conversation( catObjectConversation.id, iChatbotID, null, true );
	}
	
	return oRes;
}
function get_chatbot_stage_variables()
{
	var arrVariables = new Array();
	arrVariables.push( { name: "curChat", title: "Чат-чатбота", type: "doc_top_elem", catalog_name: "chatbot_chat" } );
	arrVariables.push( { name: "teStage", title: "Этап чатбота", type: "doc_top_elem", catalog_name: "chatbot_stage" } );
	arrVariables.push( { name: "curUser", title: "Текущий сотрудник", type: "doc_top_elem", catalog_name: "collaborator" } );
	arrVariables.push( { name: "TEXT", title: "Сообщение", type: "string" } );
	arrVariables.push( { name: "sWebsocketID", title: "ID текущего сокета", type: "string" } );
	return arrVariables;
}

function RunActionInConversation( iConversationID, iUserID, sAction, oParams )
{
	var oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	
	try
	{
		iConversationID = Int( iConversationID );
	}
	catch( ex )
	{
		oRes.error = 0;
		oRes.errorText = "Некорректный iConversationID";
		return oRes;
	}
	try
	{
		iUserID = Int( iUserID );
	}
	catch( ex )
	{
		oRes.error = 0;
		oRes.errorText = "Некорректный iUserID";
		return oRes;
	}
	var oAnswer = new Object();
	oAnswer.error = 0;
	oAnswer.action = sAction;
	oAnswer.socket_type = "chat_conversations";
	oAnswer.conversation_id = iConversationID;
	switch( sAction )
	{
		case "open_url":
			oAnswer.SetProperty( "url", RValue( oParams.GetOptProperty( "url", "" ) ) );
			break;
		case "open_additional_info":
			oAnswer.SetProperty( "url", RValue( oParams.GetOptProperty( "url", "" ) ) );
			break;
		case "open_conversation":
			oAnswer.SetProperty( "conversation_id", RValue( oParams.GetOptProperty( "conversation_id", "" ) ) );
			break;
		case "open_call":
			oAnswer.SetProperty( "conversation_id", RValue( oParams.GetOptProperty( "conversation_id", "" ) ) );
			oAnswer.SetProperty( "call_id", RValue( oParams.GetOptProperty( "call_id", "" ) ) );
			break;
		default:
			oRes.error = 0;
			oRes.errorText = "Некорректный sAction";
			return oRes;
	}
	send_message_by_socket_type( [ iUserID ], oAnswer );
	return oRes;
}

function update_ticket( iCallID, docCall, iUserID, sPeerID )
{
	/*
		обновить тикет сотрудника
		iCallID	- ID звонка
		docCall	- document звонка
		iUserID	- ID сотрудника
	*/

	var oRes = new Object();
	oRes.error = 0;
	oRes.message = '';

	try
	{
		iCallID = Int( iCallID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = "Invalid param iCallID";
		return oRes;
	}
	try
	{
		if( sPeerID == undefined || sPeerID == null || sPeerID == "" )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = "Invalid param sPeerID";
		return oRes;
	}
	try
	{
		iUserID = Int( iUserID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.message = "Invalid param iUserID";
		return oRes;
	}
	try
	{
		docCall.TopElem;
	}
	catch( ex )
	{
		try
		{
			docCall = tools.open_doc( iCallID );
			if( docCall == undefined )
			{
				throw "error";
			}
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.message = "Invalid param iCallID";
			return oRes;
		}
	}
	
	var catParticipant = docCall.TopElem.participants.GetOptChildByKey( iUserID );
	if( catParticipant == undefined || !catParticipant.ticket_id.HasValue )
	{
		oRes.error = 1;
		oRes.message = "Сотрудник не участвует в звонке или у него нет тикета.";
		return oRes;
	}
	var oMediaSoup = tools.dotnet_host.Object.GetAssembly( "Datex.MediaSoup.Service.dll" );
	var oMessage = new Object();
	oMessage.error = 0;
	oMessage.message = "";
	oMessage.action = "updated_ticket";
	oMessage.call_id = iCallID;
	oMessage.conversation_id = docCall.TopElem.conversation_id.Value;
	try
	{
		var sResUpdateTicketJson = oMediaSoup.CallClassStaticMethod( "Datex.MediaSoup.Service", "RestoreTicketByPeerId", [ sPeerID, String( iUserID ), catParticipant.ticket_id.Value, get_ticket_expire() ] );
		var oResUpdateTicket = ParseJson( sResUpdateTicketJson );
	}
	catch( ex )
	{
		
		oRes.error = 1;
		oRes.message = "Ошибка при обновлении тикета. " + ex;
		oMessage.error = 0;
		oMessage.message = oRes.message;
	}
	send_message_to_socket( [ iUserID ], oMessage );
	oRes.SetProperty( "doc_call", docCall );
	return oRes;
}

function clear_html_from_text( sMessageSource )
{
	if ( sMessageSource == "" )
		return "";

	try
	{
		objRegExp.Pattern;
	}
	catch ( err )
	{
		objRegExp = tools_web.reg_exp_init();
	}

	objRegExp.Pattern = '<b>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<b [^>]*>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</b>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<p>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<p [^>]*>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</p>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<strong>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<strong [^>]*>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</strong>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<strike [^>]*>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</strike>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<font [^>]*>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</font>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<span [^>]*>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</span>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');

	objRegExp.Pattern = '<i>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<i [^>]*>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</i>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<em>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<em [^>]*>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</em>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');

	objRegExp.Pattern = '<u>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<u [^>]*>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</u>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');

	objRegExp.Pattern = '<blockquote>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</blockquote>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');

	objRegExp.Pattern = '<code>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</code>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<pre>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</pre>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');

	objRegExp.Pattern = '<ol start=&quot;(.*?)&quot;>(.*?)</ol>';
	sMessageSource = objRegExp.Replace(sMessageSource, '$2');
	objRegExp.Pattern = '<ol>(.*?)</ol>';
	sMessageSource = objRegExp.Replace(sMessageSource, '$1');

	objRegExp.Pattern = '<ul>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '</ul>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');
	objRegExp.Pattern = '<li>(.*?)</li>';
	sMessageSource = objRegExp.Replace(sMessageSource, '$1\n');

	objRegExp.Pattern = '<a href=&quot;(.*?)&quot;>(.*?)</a>';
	sMessageSource = objRegExp.Replace(sMessageSource, '$2');
	objRegExp.Pattern = '<img src=&quot;(.*?)&quot; alt=&quot;&quot;/>';
	sMessageSource = objRegExp.Replace(sMessageSource, '');

	objRegExp.Pattern = '<br *[\/]?>';
	sMessageSource = objRegExp.Replace(sMessageSource, ' ');

	return sMessageSource;
}


/** @typedef {Object} oChat
 * @property {bigint} id
 * @property {string} name
*/
/**
 * @typedef {Object} WTChatesResult
 * @property {number} error
 * @property {string} errorText
 * @property {boolean} result
 * @property {oChat[]} array
*/
/**
 * @function GetChates
 * @memberof Websoft.WT.Chat
 * @description Получения списка чатов
 * @returns {WTChatesResult}
 */
function GetChates( iCurUserID, arrDistinct, arrFilters, oSort, oPaging  )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	oRes.data = {};
	oRes.paging = oPaging;
	
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

	conds = [];
	
	for ( oFilter in arrFilters )
	{
		if ( oFilter.type == 'search' )
		{
			if ( oFilter.value != '' ) conds.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )" );
		}
	}

	var sCondSort = " order by $elem/name";
	if ( ObjectType( oSort ) == 'JsObject' && oSort.FIELD != null && oSort.FIELD != undefined && oSort.FIELD != "" )
	{
		switch ( oSort.FIELD )
		{
			case "name":
				sCondSort = " order by $elem/name" + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "") ;
				break;
		}
	}

	var sConds = ArrayOptFirstElem(conds) == undefined ? "" : " where " + ArrayMerge( conds, "This", " and " );
	
	var sReqChates = "for $elem in chats " + sConds + sCondSort + " return $elem/Fields('id')";
	
	var xarrChates = tools.xquery(sReqChates)
	
	if ( ArrayOptFirstElem( arrDistinct ) != undefined )
	{
		oRes.data.SetProperty( "distincts", {} );
		for ( sFieldName in arrDistinct )
		{
			oRes.data.distincts.SetProperty( sFieldName, [] );
			/* switch( sFieldName )
			{

				case "role_id":
				{
					
					break;
				}
			} */
		}
	}
	
	if ( ObjectType( oPaging ) == 'JsObject' && oPaging.SIZE != null )
	{
		oPaging.MANUAL = true;
		oPaging.TOTAL = ArrayCount( xarrChates );
		oRes.paging = oPaging;
		xarrChates = ArrayRange( xarrChates, OptInt( oPaging.INDEX, 0 ) * oPaging.SIZE, oPaging.SIZE );
	}

	var teChat, oItem;
	for( oChat in xarrChates)
	{
		teChat = tools.open_doc(oChat.id.Value).TopElem;

		oItem = {
			"id": oChat.id.Value
			,"name": teChat.name.Value
		};

		oRes.array.push(oItem);
	}

	return oRes;
}