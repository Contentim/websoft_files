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
 * @typedef {Object} GetPersonContinuousFeedbackResultElem
 * @property {number} id – ID отзыва
 * @property {string} code – Код отзыва
 * @property {string} status – Статус отзыва
 * @property {string} status_id – Код статуса отзыва
 * @property {date} plan_date – Плановая дата заполнения отзыва
 * @property {date} done_date – Фактическая дата заполнения отзыва
 * @property {string} person_fullname – ID респондента
 * @property {string} person_pict_url – Фото респондента
 * @property {string} object_fullname – ID оцениваемого
 * @property {string} object_pict_url – Фото оцениваемого
 * @property {string} owner_person_fullname – ID инициатора
 * @property {string} owner_person_pict_url – Фото инициатора
 * @property {string} project_name – Название проекта
 * @property {string} text_html – HTML для тайла
 * @property {string} basic_score – Оценка
 * @property {string} basic_desc – Отзыв
*/
/**
 * @typedef {Object} GetPersonContinuousFeedbackResult
 * @property {number} error – Код ошибки
 * @property {string} errorText – Текст ошибки
 * @property {GetPersonContinuousFeedbackResultElem[]} array – Массив результата
*/
/**
 * @function GetPersonContinuousFeedback
 * @memberof Websoft.WT.Component.ContinuousFeedback
 * @author MDG
 * @description Выборка Непрерывная обратная связь / Отзывы.
 * @param {bigint} iPersonID - ID респондента
 * @param {bigint} iInitiatorID - ID инициатора
 * @param {bigint} iObjectID - ID оцениваемого
 * @param {string[]} arrObjectTypes - Типы обьектов оцениваемого
 * @param {bigint} sApplicationID - ID приложения, по которому определяется доступ
 * @param {string} sApplicationAccessType - Роль, для которой отображается информация в приложении
 * @param {oCollectionParam} oCollectionParam - Параметры выборки
 * @returns {GetPersonContinuousFeedbackResult}
 */
function GetPersonContinuousFeedback( iPersonID, iInitiatorID, iObjectID, arrObjectTypes, iApplicationID, sApplicationAccessType, oCollectionParam )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	if ( iPersonID != null )
	{
		try
		{
			iPersonID = Int( iPersonID );
		}
		catch ( err )
		{
			oRes.error = 1;
			oRes.errorText = i18n.t( 'peredannekorre' );
			return oRes;
		}
	}
	if ( iInitiatorID != null )
	{
		try
		{
			iInitiatorID = Int( iInitiatorID );
		}
		catch ( err )
		{
			oRes.error = 1;
			oRes.errorText = i18n.t( 'peredannekorre' );
			return oRes;
		}
	}
	if ( iObjectID != null )
	{
		try
		{
			iObjectID = Int( iObjectID );
		}
		catch ( err )
		{
			oRes.error = 1;
			oRes.errorText = i18n.t( 'peredannekorre' );
			return oRes;
		}
	}
	if ( arrObjectTypes == "" || arrObjectTypes == null )
	{
		arrObjectTypes = [];
	}
	else if ( ObjectType( arrObjectTypes ) != "JsArray" )
	{
		arrObjectTypes = arrObjectTypes.split( ";" );
	}
	if ( oCollectionParam == undefined )
	{
		oCollectionParam = new Object;
	}

	var arrApplicationResponseTypes = continuous_feedback.get_component_application_response_types();
	if ( ArrayCount( arrApplicationResponseTypes ) == 0 )
	{
		oRes.error = 2;
		oRes.errorText = "Не указаны типы отзывов в базовом приложении компонента";
		return oRes;
	}

	var arrCondition = [];
	if ( ArrayCount( arrApplicationResponseTypes ) == 1 )
	{
		arrCondition.push( "$elem/response_type_id = " + ArrayFirstElem( arrApplicationResponseTypes ).response_type_id );
	}
	else
	{
		arrCondition.push( "MatchSome( $elem/response_type_id, (" + ArrayMerge( arrApplicationResponseTypes, "Int(This.response_type_id)", "," ) + ") )" );
	}
	if ( ArrayCount( arrObjectTypes ) > 1 )
	{
		arrCondition.push( "MatchSome( $elem/type, (" + ArrayMerge( arrObjectTypes, "XQueryLiteral(This)", "," ) + ") )" );
	}
	else if ( ArrayCount( arrObjectTypes ) == 1 )
	{
		arrCondition.push( "$elem/type = " + XQueryLiteral( ArrayFirstElem( arrObjectTypes ) ) );
	}
	if ( iPersonID != null )
	{
		arrCondition.push( "$elem/person_id = " + iPersonID );
	}
	if ( iInitiatorID != null )
	{
		arrCondition.push( "$elem/owner_person_id = " + iInitiatorID );
	}
	for ( oFilterElem in oCollectionParam.GetOptProperty( "filters", [] ) )
	{
		sFieldNameElem = oFilterElem.GetOptProperty( "id", "" );
		if ( sFieldNameElem == "" )
		{
			continue;
		}
		sTypeElem = oFilterElem.GetOptProperty( "type", "string" );
		oValueElem = oFilterElem.GetOptProperty( "value", "" );
		if ( sTypeElem == "string" && oValueElem != "" )
		{
			if ( ObjectType( oValueElem ) == "JsArray" )
			{
				arrCondition.push( "MatchSome( $elem/" + sFieldNameElem + ", (" + ArrayMerge( oValueElem, "XQueryLiteral(String(This))", "," ) + ") )" );
			}
			else
			{
				arrCondition.push( "$elem/" + sFieldNameElem + " = " + XQueryLiteral( String( oValueElem ) ) );
			}
		}
	}
	var sFulltext = oCollectionParam.GetOptProperty( "fulltext", "" );
	if ( sFulltext != "" )
	{
		arrCondition.push( "doc-contains( $elem/id, '" + DefaultDb + "', " + XQueryLiteral( String( sFulltext ) ) + " )" );
	}
	var sConditions = ArrayMerge( arrCondition, "This", " and " );	
	var sXquery = '';
	if ( iObjectID == null )
	{
		sXquery = "for $elem in responses where " + sConditions + " return $elem/Fields('id','response_type_id','person_id','owner_person_id','object_id')";
	}
	else
	{
		sXquery = "for $elem in responses, $participant in project_participants where " + sConditions + " and ( $elem/object_id = " + iObjectID + " or ( $participant/object_id = " + iObjectID + " and $elem/object_id = $participant/id ) ) return distinct $elem/Fields('id','response_type_id','person_id','owner_person_id','object_id')";
	}

	var xarrResponses = ArraySelectAll( tools.xquery( sXquery ) );
	if ( ArrayCount( xarrResponses ) != 0 )
	{
		var xarrResponseTypes = ArraySelectAll( XQuery( "for $elem in response_types where MatchSome( $elem/id, (" + ArrayMerge( ArraySelectDistinct( xarrResponses, "response_type_id" ), "This.response_type_id", "," ) + ") ) return $elem/Fields('id','basic_desc_field','basic_score_field')" ) );
		var xarrProjectParticipants = ArraySelectAll( XQuery( "for $elem in project_participants where MatchSome( $elem/id, (" + ArrayMerge( ArraySelectDistinct( xarrResponses, "object_id" ), "This.object_id", "," ) + ") ) return $elem/Fields('id','project_id','object_id')" ) );
		var arrPersonIDs = ArraySelect(
				ArraySelectDistinct(
					ArrayUnion(
						ArrayExtract( xarrResponses, "This.person_id.Value" ),
						ArrayExtract( xarrResponses, "This.owner_person_id.Value" ),
						ArrayExtract( xarrResponses, "This.object_id.Value" ),
						ArrayExtract( xarrProjectParticipants, "This.object_id.Value" )
					),
				"This" ),
			"This!=null" );
		var xarrColloborators = ArraySelectAll( XQuery( "for $elem in collaborators where MatchSome( $elem/id, (" + ArrayMerge( arrPersonIDs, "This", "," ) + ") ) return $elem/Fields('id','fullname','pict_url')" ) );
		for ( catResponseElem in xarrResponses )
		{
			teResponseElem = OpenDoc( UrlFromDocID( catResponseElem.id ) ).TopElem;
			catResponseTypeElem = ArrayOptFindByKey( xarrResponseTypes, teResponseElem.response_type_id, "id" );
			oResponseTypeElem = ArrayOptFind( arrApplicationResponseTypes, "Int(This.response_type_id)==" + teResponseElem.response_type_id );
			bShowAuthorElem = ( oResponseTypeElem == undefined ? true : tools_web.is_true( oResponseTypeElem.GetOptProperty( "show_author", true ) ) );
			catPersonElem = ArrayOptFindByKey( xarrColloborators, teResponseElem.person_id, "id" );
			catOwnerPersonElem = ArrayOptFindByKey( xarrColloborators, teResponseElem.owner_person_id, "id" );
			catObjectElem = undefined;
			catProjectElem = undefined;
			if ( teResponseElem.type == "project_participant" )
			{
				catProjectParticipantElem = ArrayOptFindByKey( xarrProjectParticipants, teResponseElem.object_id, "id" );
				if ( catProjectParticipantElem != undefined )
				{
					catObjectElem = ArrayOptFindByKey( xarrColloborators, catProjectParticipantElem.object_id, "id" );
					catProjectElem = catProjectParticipantElem.project_id.OptForeignElem;
				}
			}
			else
			{
				catObjectElem = ArrayOptFindByKey( xarrColloborators, teResponseElem.object_id, "id" );
			}
			oRes.array.push( {
				id: teResponseElem.id.Value,
				code: teResponseElem.code.Value,
				status: ( teResponseElem.status == "plan" ? "Ждет обратной связи" : ( teResponseElem.status == "done" ? "Обратная связь дана" : ( teResponseElem.status == "cancel" ? "Отменено" : teResponseElem.status.Value ) ) ),
				status_id: teResponseElem.status.Value,
				plan_date: teResponseElem.plan_date.Value,
				done_date: teResponseElem.done_date.Value,
				person_fullname: ( catPersonElem == undefined || ! bShowAuthorElem ? "" : catPersonElem.fullname.Value ),
				person_pict_url: ( catPersonElem == undefined || ! bShowAuthorElem ? "" : catPersonElem.pict_url.Value ),
				object_fullname: ( catObjectElem == undefined ? "" : catObjectElem.fullname.Value ),
				object_pict_url: ( catObjectElem == undefined ? "" : catObjectElem.pict_url.Value ),
				owner_person_fullname: ( catOwnerPersonElem == undefined ? "" : catOwnerPersonElem.fullname.Value ),
				owner_person_pict_url: ( catOwnerPersonElem == undefined ? "" : catOwnerPersonElem.pict_url.Value ),
				project_name: ( catProjectElem == undefined ? "" : catProjectElem.name.Value ),
				text_html: "",
				basic_score: ( catResponseTypeElem == undefined || ! catResponseTypeElem.basic_score_field.HasValue ? "" : teResponseElem.custom_elems.ObtainChildByKey( catResponseTypeElem.basic_score_field ).value.Value ),
				basic_desc: ( catResponseTypeElem == undefined || ! catResponseTypeElem.basic_desc_field.HasValue ? "" : teResponseElem.custom_elems.ObtainChildByKey( catResponseTypeElem.basic_desc_field ).value.Value )

			} );
		}
	}
alert(EncodeJson(oRes.array))
	return oRes;
}



/**
 * @typedef {Object} GetPersonContinuousFeedbackContextResultElem
 * @property {boolean} bCanResponse – Значение параметра can_response приложения websoft_continuous_feedback
 * @property {boolean} bCanRequestResponse – Значение параметра can_request_response приложения websoft_continuous_feedback
 * @property {boolean} bCanRequestResponseOther – Значение параметра can_request_response_other приложения websoft_continuous_feedback
*/
/**
 * @typedef {Object} GetPersonContinuousFeedbackContextResult
 * @property {number} error – Код ошибки
 * @property {string} errorText – Текст ошибки
 * @property {GetPersonContinuousFeedbackContextResultElem} result – Объект результата
*/
/**
 * @function GetPersonContinuousFeedbackContext
 * @memberof Websoft.WT.Component.ContinuousFeedback
 * @author MDG
 * @description Контекст непрерывной обратной связи.
 * @returns {GetPersonContinuousFeedbackContextResult}
 */
function GetPersonContinuousFeedbackContext()
{
	var oRes = tools.get_code_library_result_object();
	oRes.result = new Object;

	var teApplication = continuous_feedback.get_component_application();
	oRes.result.bCanResponse = tools_web.is_true( teApplication.wvars.ObtainChildByKey( "can_response" ).value );
	oRes.result.bCanRequestResponse = tools_web.is_true( teApplication.wvars.ObtainChildByKey( "can_request_response" ).value );
	oRes.result.bCanRequestResponseOther = tools_web.is_true( teApplication.wvars.ObtainChildByKey( "can_request_response_other" ).value );

	return oRes;
}



/**
 * @typedef {Object} CreatePersonContinuousFeedbackResponseResult
 * @property {number} error – Код ошибки
 * @property {string} errorText – Текст ошибки
 * @property {bigint} response_id – ID отзыва
*/
/**
 * @function CreatePersonContinuousFeedbackResponse
 * @memberof Websoft.WT.Component.ContinuousFeedback
 * @author MDG
 * @description Удаленное действие Дать обратную связь (универсальное)
 * @param {bigint} iPersonID - ID респондента
 * @param {bigint} iInitiatorID - ID инициатора
 * @param {bigint} iObjectID - ID оцениваемого
 * @param {?oFormField[]} form_fields - Параметры формы
 * @param {string} sNotificationType - Код типа уведомления
 * @param {string} sNotifyResponse - Режим уведомления
 * @returns {CreatePersonContinuousFeedbackResponseResult}
 */
function CreatePersonContinuousFeedbackResponse( iPersonID, iInitiatorID, iObjectID, oFormFields, sNotificationType, sNotifyResponse )
{
	var oRes = tools.get_code_library_result_object();
	oRes.response_id = null;

	if ( iPersonID != null )
	{
		try
		{
			iPersonID = Int( iPersonID );
		}
		catch ( err )
		{
			oRes.error = 1;
			oRes.errorText = i18n.t( 'peredannekorre' );
			return oRes;
		}
	}
	if ( iInitiatorID != null )
	{
		try
		{
			iInitiatorID = Int( iInitiatorID );
		}
		catch ( err )
		{
			oRes.error = 1;
			oRes.errorText = i18n.t( 'peredannekorre' );
			return oRes;
		}
	}
	if ( iObjectID != null )
	{
		try
		{
			iObjectID = Int( iObjectID );
		}
		catch ( err )
		{
			oRes.error = 1;
			oRes.errorText = i18n.t( 'peredannekorre' );
			return oRes;
		}
	}
	try
	{
		var iResponseTypeID = Int( get_form_fields_param( oFormFields, "response_type_id" ) );
	}
	catch ( err )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'peredannekorre' );
		return oRes;
	}

	var teApplication = continuous_feedback.get_component_application();
	var arrApplicationResponseTypes = continuous_feedback.get_component_application_response_types();
	var oApplicationResponseType = ArrayOptFind( arrApplicationResponseTypes, 'OptInt(This.response_type_id)==' + iResponseTypeID );
	var bSaveAuthor = tools_web.is_true( oApplicationResponseType.save_author );
	var bNotifyResponse = tools_web.is_true( teApplication.wvars.ObtainChildByKey( "notify_response" ).value );
	var dtPlanDate = OptDate( get_form_fields_param( oFormFields, "plan_date" ), null );

	var docResponse = OpenNewDoc( "x-local://wtv/wtv_response.xmd" );
	teResponse = docResponse.TopElem;

	teResponse.response_type_id = iResponseTypeID;
	teResponse.owner_person_id = iInitiatorID;

	if ( dtPlanDate == null )
	{
		teResponse.status = "done";
		teResponse.done_date = CurDate;
	}
	else
	{
		teResponse.status = "plan";
		teResponse.plan_date = dtPlanDate;
	}

	if ( bSaveAuthor )
	{
		teResponse.person_id = iPersonID;
		tools.common_filling( 'collaborator', teResponse, iPersonID );
	}

	if ( iObjectID != null )
	{
		var teObject = OpenDoc( UrlFromDocID( iObjectID ) ).TopElem;
		teResponse.type = teObject.Name;
		teResponse.object_id = iObjectID;
		tools.common_filling( 'object', teResponse, iObjectID, teObject );
	}

	if ( oFormFields != null )
	{
		tools_web.custom_elems_filling( teResponse, oFormFields, null, {
			sCatalogName: "response_type",
			iObjectID: iResponseTypeID,
			bCheckMandatory: false,
			bCheckCondition: false
		} );
	}

	docResponse.BindToDb( DefaultDb );
	docResponse.Save();

	if ( sNotificationType == '' )
	{
		sNotificationType = null;
	}
	if ( sNotificationType != null )
	{
		if ( sNotifyResponse == "send" || ( sNotifyResponse == "default" && bNotifyResponse ) )
		{
			iNotification = OptInt( sNotificationType, null );
			if ( iNotification == null )
			{
				sNotificationTypeCode = sNotificationType;
			}
			else
			{
				teNotification = OpenDoc( UrlFromDocID( iNotification ) ).TopElem;
				sNotificationTypeCode = teNotification.code.Value;
			}
			switch ( sNotificationTypeCode )
			{
				case "continuous_feedback_response":
				{
					tools.create_notification( sNotificationTypeCode, iObjectID, "", null );
					break;
				}
				case "continuous_feedback_request":
				{
					tools.create_notification( sNotificationTypeCode, iPersonID, "", iObjectID );
					break;
				}
				default:
				{
					tools.create_notification( sNotificationTypeCode, iPersonID, "", null );
					break;
				}
			}
		}
	}

	oRes.response_id = docResponse.DocID;
	return oRes;
}



/**
 * @typedef {Object} EditResponseContinuousFeedbackeResult
 * @property {number} error – Код ошибки
 * @property {string} errorText – Текст ошибки
 * @property {bigint} response_id – ID отзыва
*/
/**
 * @function EditResponseContinuousFeedback
 * @memberof Websoft.WT.Component.ContinuousFeedback
 * @author MDG
 * @description Удаленное действие Редактировать обратную связь
 * @param {bigint} iResponseID - ID отзыва
 * @param {?oFormField[]} form_fields - Параметры формы
 * @returns {EditResponseContinuousFeedbackeResult}
 */
function EditResponseContinuousFeedback( iResponseID, oFormFields )
{
	var oRes = tools.get_code_library_result_object();
	oRes.response_id = null;

	try
	{
		iResponseID = Int( iResponseID );
	}
	catch ( err )
	{
		oRes.error = 1;
		oRes.errorText = i18n.t( 'peredannekorre' );
		return oRes;
	}


	var teApplication = continuous_feedback.get_component_application();
	var bNotifyResponse = tools_web.is_true( teApplication.wvars.ObtainChildByKey( "notify_response" ).value );
	var bNotifyResponseRequestInitiator = tools_web.is_true( teApplication.wvars.ObtainChildByKey( "notify_response_request_initiator" ).value );

	var docResponse = OpenDoc( UrlFromDocID( iResponseID ) );
	teResponse = docResponse.TopElem;
	var bIsPlan = teResponse.status == "plan";
	var iResponseTypeID = teResponse.response_type_id.Value;
	var iObjectID = teResponse.object_id.Value;

	if ( bIsPlan )
	{
		teResponse.status = "done";
		teResponse.done_date = CurDate;
	}

	if ( oFormFields != null )
	{
		tools_web.custom_elems_filling( teResponse, oFormFields, null, {
			sCatalogName: "response_type",
			iObjectID: iResponseTypeID,
			bCheckMandatory: false,
			bCheckCondition: false
		} );
	}

	docResponse.Save();

	if ( bIsPlan )
	{
		var iNotification = null;
		if ( bNotifyResponse )
		{
			iNotification = OptInt( teApplication.wvars.ObtainChildByKey( "notify_response_type" ).value, null );
			if ( iNotification != null )
			{
				tools.create_notification( iNotification, iObjectID, "", null );
			}
		}
		if ( bNotifyResponseRequestInitiator && teResponse.owner_person_id != teResponse.person_id )
		{
			var catObject = teResponse.object_id.OptForeignElem;
			iNotification = OptInt( teApplication.wvars.ObtainChildByKey( "notify_response_request_initiator_type" ).value, null );
			if ( iNotification != null )
			{
				tools.create_notification( iNotification, teResponse.owner_person_id, catObject.fullname, teResponse.person_id );
			}
		}
	}

	oRes.response_id = docResponse.DocID;
	return oRes;
}

/**
 * @typedef {Object} oProjectParticipant
 * @property {bigint} id – ID участника проекта
 * @property {bigint} project_id – ID проекта
 * @property {string} project_name – Название проекта
 * @property {string} state – Название статуса участника
 * @property {string} fullname – ФИО участника проекта
 * @property {string} position_name – Название основной должности
 * @property {string} subdivision_name – Название подразделения основной должности
 * @property {int} response_received – Получено оценок обратной связи
 * @property {int} response_requested – Запрошено оценок обратной связи
*/
/**
 * @typedef {Object} ReturnProjectParticipants
 * @property {number} error – Код ошибки
 * @property {string} errorText – Текст ошибки
 * @property {oProjectParticipant[]} array – Коллекция звонков
*/
/**
 * @function GetProjectParticipantsApp
 * @memberof Websoft.WT.Component.ContinuousFeedback
 * @author EO
 * @description Участники проектов
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {string} sAccessType - Тип доступа: "admin"/"manager"/"hr"/"observer"/"auto"
 * @param {string} sApplication - код приложения для определения доступа
 * @param {string} sXQueryQual - строка XQuery-фильтра
 * @param {boolean} bShowDismiss - Показывать уволенных участников
 * @param {string[]} aStateParticipants - статусы участников проекта
 * @param {string[]} aAdditionalFields - дополнительные поля
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnProjectParticipants}
 */
function GetProjectParticipantsApp( iCurUserID, sAccessType, sApplication, sXQueryQual, bShowDismiss, aStateParticipants, aAdditionalFields, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	oRes.paging = oCollectionParams.paging;
	
	var arrConds = [];
	var arrFilters = oCollectionParams.filters;
	var arrFrom = [];
	iCurUserID = OptInt( iCurUserID, 0);
	var bCollaboratorsAdded = false;

	try
	{
		bShowDismiss = tools_web.is_true( bShowDismiss );
	}
	catch( ex )
	{
		bShowDismiss = false;
	}
	if (!bShowDismiss)
	{
		arrFrom.push(", $coll in collaborators ");
		arrConds.push( "$elem/object_id = $coll/id" );
		arrConds.push( "$coll/is_dismiss != true()" );
		bCollaboratorsAdded = true;
	}
	
	if ( sAccessType != "admin" && sAccessType != "manager" && sAccessType != "hr" && sAccessType != "observer" && sAccessType != "auto" )
		sAccessType = "auto";

	if(sAccessType == "auto")
	{
		iApplicationID = OptInt(sApplication);
		if(iApplicationID != undefined)
		{
			sApplication = ArrayOptFirstElem(tools.xquery("for $elem in applications where $elem/id = " + iApplicationID + " return $elem/Fields('code')"), {code: ""}).code;
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
			sAccessType = "hr";
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

	var oSubordinateParams = {
			arrTypeSubordinate: ['fact','func'],
			bReturnIDs: true,
			sCatalog: '',
			arrFieldsNames: null,
			xQueryCond: '',
			bGetOrgSubordinate: true,
			bGetGroupSubordinate: true,
			bGetPersonSubordinate: true,
			bInHierSubdivision: true,
			arrBossTypeIDs: [],
			bWithoutUseManagementObject: true,
	};
	switch(sAccessType)
	{
		case "hr":
			arrBossType = tools.call_code_library_method( "libApplication", "GetApplicationHRBossTypes", [ sApplication, iCurUserID ] );
			oSubordinateParams.arrTypeSubordinate = ['func'];
			oSubordinateParams.arrBossTypeIDs = arrBossType;
			var arrCollabsIDs = tools.call_code_library_method( "libMain", "GetSubordinateRecords", [ iCurUserID, oSubordinateParams ] );
			if (ArrayOptFirstElem(arrCollabsIDs) == undefined)
			{
				return oRes;
			}
			if (!bCollaboratorsAdded)
			{
				arrFrom.push(", $coll in collaborators ");
			}
			arrConds.push("MatchSome( $coll/id, (" + ArrayMerge( arrCollabsIDs, "This", "," ) + ") )");
			break;
		case "observer":
			var arrCollabsIDs = tools.call_code_library_method( "libMain", "GetSubordinateRecords", [ iCurUserID, oSubordinateParams ] );
			if (!bCollaboratorsAdded)
			{
				arrFrom.push(", $coll in collaborators ");
			}
			arrConds.push("MatchSome( $coll/id, (" + ArrayMerge( arrCollabsIDs, "This", "," ) + ") )");
			break;
		case "reject":
			return oRes;
	}

	var arrStateProjects = [];
	var teAppl = continuous_feedback.get_component_application();
	if (teAppl != undefined)
	{
		var oStateProjectsWvar = ArrayOptFind(teAppl.wvars, "This.name.Value == 'state_projects'")
		if (oStateProjectsWvar != undefined)
		{
			arrStateProjects = tools_web.parse_multiple_parameter(oStateProjectsWvar.value.Value);
			if (ArrayOptFirstElem(arrStateProjects) != undefined)
			{
				arrFrom.push(", $proj in projects ");
				arrConds.push("$proj/id = $elem/project_id");
				arrConds.push("MatchSome( $proj/status, (" + ArrayMerge(arrStateProjects, "XQueryLiteral(This)", ",") + ") )");
			}
		}
	}

	if (ArrayCount(arrStateProjects) == 0)
	{
		oRes.error = 1;
		oRes.errorText = "Не указаны статусы проектов в базовом приложении компонента";
		return oRes;
	}

	if ( aStateParticipants != undefined && aStateParticipants != null && IsArray(aStateParticipants) && ArrayOptFirstElem(aStateParticipants) != undefined)
	{
		arrConds.push("MatchSome($elem/status_id, (" + ArrayMerge(aStateParticipants, 'XQueryLiteral(This)', ',') + "))");
	}

	if ( !IsEmptyValue(sXQueryQual) )
	{
		arrConds.push(sXQueryQual);
	}

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

	var sSortConds = "";
	if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" && oCollectionParams.sort.FIELD != 'response_received' && oCollectionParams.sort.FIELD != 'response_requested')
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		switch(sFieldName)
		{
			case "project_id":
				sSortConds = " order by $elem/project_id"
				break;
			case "project_name":
				sSortConds = " order by ForeignElem( $elem/project_id )/name"
				break;
			case "state":
				sSortConds = " order by ForeignElem( $elem/status_id )/name"
				break;
			case "fullname":
				sSortConds = " order by $elem/object_name"
				break;
			case "position_name":
				sSortConds = " order by $elem/person_position_name"
				break;
			case "subdivision_name":
				sSortConds = " order by $elem/person_subdivision_name"
				break;
			case "default":
				sSortConds = " order by $elem/object_name"
				break;
		}
		if(sSortConds != "" && oCollectionParams.sort.DIRECTION == "DESC")
			sSortConds += " descending";
	}

	arrConds.push("$elem/catalog = 'collaborator'");

	var sConds = (ArrayOptFirstElem(arrConds) != undefined) ? " where " + ArrayMerge(arrConds, "This", " and ") : "";
	var sXQueryProjectParticipants = "for $elem in project_participants " + ArrayMerge(arrFrom, "This", "") + sConds + sSortConds + " return $elem";
	var xarrProjectParticipants = tools.xquery(sXQueryProjectParticipants);
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null && oCollectionParams.sort.FIELD != 'response_received' && oCollectionParams.sort.FIELD != 'response_requested' )
	{
		xarrProjectParticipants = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ xarrProjectParticipants, oCollectionParams.paging, ({}) ] ).oResult;
	}

	if ( ArrayOptFirstElem(ArrayIntersect(["response_received","response_requested"], aAdditionalFields)) != undefined )
	{
		xarrResponseType = tools.xquery("for $elem in response_types where $elem/code = 'responce_project_participant' return $elem/Fields('id')");
		if (ArrayOptFirstElem(xarrResponseType) != undefined)
		{
			iResponseTypesIdsTypeProj = ArrayOptFirstElem(xarrResponseType).id.Value;
			if (iResponseTypesIdsTypeProj != undefined)
			{
				var sMergedProjectParticipantsIds = ArrayMerge(xarrProjectParticipants, "This.id.Value", ",");
				if ( ArrayOptFirstElem(ArrayIntersect(["response_received"], aAdditionalFields)) != undefined )
				{
					var sResponseReceivedXQuery = "for $pp in project_participants, $resp in responses where $pp/catalog = 'collaborator' and MatchSome( $pp/id,(" + sMergedProjectParticipantsIds + ") ) and $resp/status = 'done' and $resp/response_type_id = " + iResponseTypesIdsTypeProj + " and $resp/object_id = $pp/id order by $pp/id return $pp/Fields('id')";
					var xarrResponseReceived = tools.xquery(sResponseReceivedXQuery);
				}
				if ( ArrayOptFirstElem(ArrayIntersect(["response_requested"], aAdditionalFields)) != undefined )
				{
					var sResponseRequestedXQuery = "for $pp in project_participants, $resp in responses where $pp/catalog = 'collaborator' and MatchSome( $pp/id,(" + sMergedProjectParticipantsIds + ") ) and $resp/status = 'plan' and $resp/response_type_id = " + iResponseTypesIdsTypeProj + " and $resp/object_id = $pp/id order by $pp/id return $pp/Fields('id')";
					var xarrResponseRequested = tools.xquery(sResponseRequestedXQuery);
				}
			}
		}
	}

	for ( catProjectParticipant in xarrProjectParticipants )
	{
		docProjectParticipant = tools.open_doc(catProjectParticipant.id);
		if (docProjectParticipant == undefined)
		{
			continue;
		}

		oElem = {
			id: catProjectParticipant.id.Value,
			project_id: catProjectParticipant.project_id.Value,
			project_name: (catProjectParticipant.project_id.HasValue ? catProjectParticipant.project_id.OptForeignElem.name : ""),
			state: ( catProjectParticipant.status_id.HasValue ? catProjectParticipant.status_id.OptForeignElem.name : ""),
			fullname: catProjectParticipant.object_name.Value,
			position_name: catProjectParticipant.person_position_name.Value,
			subdivision_name: catProjectParticipant.person_subdivision_name.Value,
		};

		for( _field in aAdditionalFields )
		{
			iCountValue = 0;
			switch( _field )
			{
				case "response_received":
					iCountValue = ArrayCount( ArraySelectBySortedKey( xarrResponseReceived, catProjectParticipant.id.Value, "id" ) );
					break;
				case "response_requested":
					iCountValue = ArrayCount( ArraySelectBySortedKey( xarrResponseRequested, catProjectParticipant.id.Value, "id" ) );
					break;
				}
			oElem.SetProperty( _field, iCountValue );
		}

		oRes.array.push(oElem);
	}

	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null && (oCollectionParams.sort.FIELD == 'response_received' || oCollectionParams.sort.FIELD == 'response_requested') )
	{
		oRes.array = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ oRes.array, oCollectionParams.paging, oCollectionParams.sort ] ).oResult;
	}

	return oRes;
}

/**
 * @function ResponseChangeState
 * @memberof Websoft.WT.Component.ContinuousFeedback
 * @author EO
 * @description Изменение статуса отзыва
 * @param {bigint[]} arrResponseIDs - массив ID отзывов
 * @param sState - "cancel"(Отменить)/"return_to_work"(Вернуть в работу)
 * @returns {oSimpleResult}
 */
function ResponseChangeState(arrResponseIDs, sState)
{
	var oRes = tools.get_code_library_result_object();
	
	if(!IsArray(arrResponseIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrResponseIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "response")
	{
		oRes.error = 503;
		oRes.errorText = "Массив не является массивом ID отзывов";
		return oRes;
	}

	if (sState != "cancel" && sState != "return_to_work")
	{
		sState = "cancel";
	}

	for ( itemResponseID in arrResponseIDs )
	{
		try
		{
			iResponseID = OptInt(itemResponseID);
			if(iResponseID == undefined)
			{
				throw "Элемент массива не является целым числом";
			}

			docResponse = tools.open_doc(iResponseID);
			if (docResponse == undefined)
			{
				continue;
			}

			teResponse = docResponse.TopElem;
			if (sState == "cancel")
			{
				teResponse.status = "cancel";
			}
			else
			{//return_to_work
				if (teResponse.done_date.HasValue)
				{
					teResponse.status = "done";
				}
				else
				{
					teResponse.status = "plan";
				}
			}
			docResponse.Save();
		}
		catch( err )
		{
			oRes.error = 504;
			oRes.errorText = ''+err;
		}
	}

	return oRes;
}

/**
 * @function GetRequestContinuousFeedbackCollaborator
 * @memberof Websoft.WT.Component.ContinuousFeedback
 * @author EO
 * @description Запросить обратную связь по сотруднику/сотрудникам
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {bigint} iResponsePersonID - сотрудник, у кого запрашивается обратная связь по сотрудникам
 * @param {bigint[]} arrCollIDs - массив ID сотрудников, для которых запрашивается обратная связь
 * @param {bigint} iResponseTypeID - ID типа отзыва
 * @param {date} dtPlanDate - Плановая дата заполнения
 * @param {string} sNotifyResponse - "send"(Отправлять уведомления)/"not_send"(Не отправлять уведомления)/"default"(По параметрам приложения)
 * @param {bigint} iNotifyResponseType - ID типа уведомления
 * @returns {oSimpleResultCount}
 */
function GetRequestContinuousFeedbackCollaborator(iCurUserID, iResponsePersonID, arrCollIDs, iResponseTypeID, dtPlanDate, sNotifyResponse, iNotifyResponseType)
{
	var oRes = tools.get_code_library_result_object();
	oRes.count = 0;

	iCurUserID = OptInt(iCurUserID);

	if (iCurUserID == undefined)
	{
		oRes.error = 501;
		oRes.errorText = "Неверно передан ID текущего пользователя";
		return oRes;
	}

	if(!IsArray(arrCollIDs))
	{
		oRes.error = 502;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrCollIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 503;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "collaborator")
	{
		oRes.error = 504;
		oRes.errorText = "Массив не является массивом ID сотрудников";
		return oRes;
	}

	iResponsePersonID = OptInt(iResponsePersonID);
	if (iResponsePersonID == undefined)
	{
		oRes.error = 505;
		oRes.errorText = "Неверно передан ID сотрудника, у кого запрашивается обратная связь";
		return oRes;
	}

	docObj = tools.open_doc(iResponsePersonID);
	if(docObj == undefined || docObj.TopElem.Name != "collaborator")
	{
		oRes.error = 506;
		oRes.errorText = "Неверно передан ID сотрудника, у кого запрашивается обратная связь";
		return oRes;
	}

	iResponseTypeID = OptInt(iResponseTypeID);
	if (iResponseTypeID == undefined)
	{
		oRes.error = 507;
		oRes.errorText = "Неверно передан ID типа отзыва";
		return oRes;
	}

	docObj = tools.open_doc(iResponseTypeID);
	if(docObj == undefined || docObj.TopElem.Name != "response_type")
	{
		oRes.error = 508;
		oRes.errorText = "Неверно передан ID типа отзыва";
		return oRes;
	}

	dtPlanDate = OptDate(dtPlanDate);

	if (sNotifyResponse != "send" && sNotifyResponse != "not_send" && sNotifyResponse != "default")
	{
		sNotifyResponse = "default";
	}

	iNotifyResponseType = OptInt(iNotifyResponseType);

	var teApplication = continuous_feedback.get_component_application();
	var iDaysBetween = OptInt(teApplication.wvars.ObtainChildByKey( "days_between" ).value, 0);

	if (iDaysBetween > 0)
	{
		sResponsesXQuery = "for $elem in responses where $elem/response_type_id = " + iResponseTypeID + " and $elem/person_id = " + iResponsePersonID + " and MatchSome( $elem/object_id, ( " + ArrayMerge(arrCollIDs, "This", ",") + ") ) and $elem/done_date != null() and $elem/done_date > " + XQueryLiteral( DateOffset(Date(), -86400*iDaysBetween) ) + " and MatchSome( $elem/status, ('done','plan')) order by $elem/object_id return $elem/Fields('object_id')";
		xarrResponses = tools.xquery(sResponsesXQuery);
	}

	for ( itemCollID in arrCollIDs )
	{
		try
		{
			iCollID = OptInt(itemCollID);
			if(iCollID == undefined)
			{
				throw "Элемент массива не является целым числом";
			}

			if (iCollID == iResponsePersonID)
			{
				continue;
			}
			if (iDaysBetween > 0)
			{
				if (ArrayOptFindBySortedKey( xarrResponses, iCollID, "object_id" ) != undefined)
				{
					continue;
				}
			}

			var docResponse = OpenNewDoc( "x-local://wtv/wtv_response.xmd" );
			docResponse.BindToDb( DefaultDb );
			teResponse = docResponse.TopElem;
			teResponse.response_type_id = iResponseTypeID;
			teResponse.status = "plan";					
			teResponse.person_id = iResponsePersonID;
			tools.common_filling( 'collaborator', teResponse, iResponsePersonID );
			teResponse.owner_person_id = iCurUserID;
			if (dtPlanDate != undefined)
			{
				teResponse.plan_date = dtPlanDate;
			}
			teResponse.type = "collaborator";
			teResponse.object_id = iCollID;
			tools.common_filling( 'object', teResponse, iCollID );
			docResponse.Save();
			oRes.count++;

			switch ( sNotifyResponse )
			{
				case "send":
					if (iNotifyResponseType != undefined)
					{
						tools.create_notification( iNotification, iResponsePersonID, "", iCollID );
					}
					break
				case "default":
					if ( tools_web.is_true(teApplication.wvars.ObtainChildByKey( "notify_response_request" ).value) )
					{
						var iNotification = OptInt( teApplication.wvars.ObtainChildByKey( "notify_response_request_type" ).value );
						if ( iNotification != undefined) 
						{
							tools.create_notification( iNotification, iResponsePersonID, "", iCollID );
						}
					}
					break
			}
		}
		catch( err )
		{
			oRes.error = 509;
			oRes.errorText = ''+err;
		}
	}

	return oRes;
}

/**
 * @function GetRequestContinuousFeedbackProjectParticipant
 * @memberof Websoft.WT.Component.ContinuousFeedback
 * @author EO
 * @description Запросить обратную связь по участнику проекта/участникам проекта
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {bigint} iResponsePersonID - сотрудник, у кого запрашивается обратная связь по участникам проекта
 * @param {bigint[]} arrProjectParticipantIDs - массив ID участникам проекта, для которых запрашивается обратная связь
 * @param {bigint} iResponseTypeID - ID типа отзыва
 * @param {date} dtPlanDate - Плановая дата заполнения
 * @param {string} sNotifyResponse - "send"(Отправлять уведомления)/"not_send"(Не отправлять уведомления)/"default"(По параметрам приложения)
 * @param {bigint} iNotifyResponseType - ID типа уведомления
 * @returns {oSimpleResultCount}
 */
function GetRequestContinuousFeedbackProjectParticipant(iCurUserID, iResponsePersonID, arrProjectParticipantIDs, iResponseTypeID, dtPlanDate, sNotifyResponse, iNotifyResponseType)
{
	var oRes = tools.get_code_library_result_object();
	oRes.count = 0;

	iCurUserID = OptInt(iCurUserID);

	if (iCurUserID == undefined)
	{
		oRes.error = 501;
		oRes.errorText = "Неверно передан ID текущего пользователя";
		return oRes;
	}

	if(!IsArray(arrProjectParticipantIDs))
	{
		oRes.error = 502;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrProjectParticipantIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 503;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "project_participant")
	{
		oRes.error = 504;
		oRes.errorText = "Массив не является массивом ID участников проекта";
		return oRes;
	}

	iResponsePersonID = OptInt(iResponsePersonID);
	if (iResponsePersonID == undefined)
	{
		oRes.error = 505;
		oRes.errorText = "Неверно передан ID сотрудника, у кого запрашивается обратная связь";
		return oRes;
	}

	docObj = tools.open_doc(iResponsePersonID);
	if(docObj == undefined || docObj.TopElem.Name != "collaborator")
	{
		oRes.error = 506;
		oRes.errorText = "Неверно передан ID сотрудника, у кого запрашивается обратная связь";
		return oRes;
	}

	iResponseTypeID = OptInt(iResponseTypeID);
	if (iResponseTypeID == undefined)
	{
		oRes.error = 507;
		oRes.errorText = "Неверно передан ID типа отзыва";
		return oRes;
	}

	docObj = tools.open_doc(iResponseTypeID);
	if(docObj == undefined || docObj.TopElem.Name != "response_type")
	{
		oRes.error = 508;
		oRes.errorText = "Неверно передан ID типа отзыва";
		return oRes;
	}

	dtPlanDate = OptDate(dtPlanDate);

	if (sNotifyResponse != "send" && sNotifyResponse != "not_send" && sNotifyResponse != "default")
	{
		sNotifyResponse = "default";
	}

	iNotifyResponseType = OptInt(iNotifyResponseType);

	var teApplication = continuous_feedback.get_component_application();
	bProjectResponseRepeat = tools_web.is_true(teApplication.wvars.ObtainChildByKey( "project_response_repeat" ).value);

	sMergedProjectParticipantIDs = ArrayMerge(arrProjectParticipantIDs, "This", ",")
	var sXQuery = "for $elem in project_participants where MatchSome( $elem/id, (" + sMergedProjectParticipantIDs + ") ) order by $elem/id return $elem/Fields('id','object_id')";
	xarrProjectParticipants = ArrayDirect(tools.xquery(sXQuery));

	if (!bProjectResponseRepeat)
	{
		sResponsesXQuery = "for $elem in responses where $elem/response_type_id = " + iResponseTypeID + " and $elem/person_id = " + iResponsePersonID + " and MatchSome( $elem/object_id, ( " + sMergedProjectParticipantIDs + ") ) and MatchSome( $elem/status, ('done','plan')) order by $elem/object_id return $elem/Fields('object_id')";
		xarrResponses = tools.xquery(sResponsesXQuery);
	}

	for ( itemProjectParticipantID in arrProjectParticipantIDs )
	{
		try
		{
			iProjectParticipantID = OptInt(itemProjectParticipantID);
			if(iProjectParticipantID == undefined)
			{
				throw "Элемент массива не является целым числом";
			}

			catProjectParticipant = ArrayOptFindBySortedKey( xarrProjectParticipants, iProjectParticipantID, "id" );
			if (catProjectParticipant != undefined && catProjectParticipant.object_id.Value == iResponsePersonID)
			{
				continue;
			}

			if (!bProjectResponseRepeat)
			{
				if (ArrayOptFindBySortedKey( xarrResponses, iProjectParticipantID, "object_id" ) != undefined)
				{
					continue;
				}
			}

			var docResponse = OpenNewDoc( "x-local://wtv/wtv_response.xmd" );
			docResponse.BindToDb( DefaultDb );
			teResponse = docResponse.TopElem;
			teResponse.response_type_id = iResponseTypeID;
			teResponse.status = "plan";					
			teResponse.person_id = iResponsePersonID;
			tools.common_filling( 'collaborator', teResponse, iResponsePersonID );
			teResponse.owner_person_id = iCurUserID;
			if (dtPlanDate != undefined)
			{
				teResponse.plan_date = dtPlanDate;
			}
			teResponse.type = "project_participant";
			teResponse.object_id = iProjectParticipantID;
			tools.common_filling( 'object', teResponse, iProjectParticipantID );
			docResponse.Save();
			oRes.count++;

			switch ( sNotifyResponse )
			{
				case "send":
					if (iNotifyResponseType != undefined)
					{
						tools.create_notification( iNotification, iResponsePersonID, "", iProjectParticipantID );
					}
					break
				case "default":
					if ( tools_web.is_true(teApplication.wvars.ObtainChildByKey( "notify_response_request" ).value) )
					{
						var iNotification = OptInt( teApplication.wvars.ObtainChildByKey( "notify_response_request_type" ).value );
						if ( iNotification != undefined) 
						{
							tools.create_notification( iNotification, iResponsePersonID, "", iProjectParticipantID );
						}
					}
					break
			}
		}
		catch( err )
		{
			oRes.error = 509;
			oRes.errorText = ''+err;
		}
	}

	return oRes;
}


/**
 * @typedef {Object} oShortCustomField
 * @property {string} name
 * @property {string} value
*/
/**
 * @typedef {Object} AddResponseContinuousFeedbackCollaboratorResult
 * @property {number} error – Код ошибки
 * @property {string} errorText – Текст ошибки
 * @property {bigint} response_id – ID отзыва
*/
/**
 * @function AddResponseContinuousFeedbackCollaborator
 * @memberof Websoft.WT.Component.ContinuousFeedback
 * @author EO
 * @description Удаленное действие Дать обратную связь сотруднику
 * @param {bigint} iPersonID - ID респондента
 * @param {bigint} iResponseTypeID - ID типа отзыва
 * @param {bigint} iObjectID - ID оцениваемого
 * @param {oShortCustomField[]} arrCustomFields - массив значений настраиваемых полей
 * @param {string} sNotifyResponse - Режим уведомления
 * @param {bigint} iNotifyResponseType - ID типа уведомления
 * @returns {AddResponseContinuousFeedbackCollaboratorResult}
 */
function AddResponseContinuousFeedbackCollaborator(iPersonID, iResponseTypeID, iObjectID, arrCustomFields, sNotifyResponse, iNotifyResponseType)
{
	var oRes = tools.get_code_library_result_object();

	iPersonID = OptInt(iPersonID);
	if (iPersonID == undefined)
	{
		oRes.error = 501;
		oRes.errorText = "Неверно передан ID респондента";
		return oRes;
	}
	iResponseTypeID = OptInt(iResponseTypeID);
	if (iResponseTypeID == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "Неверно передан ID типа отзыва";
		return oRes;
	}
	iObjectID = OptInt(iObjectID);
	if (iObjectID == undefined)
	{
		oRes.error = 503;
		oRes.errorText = "Неверно передан ID оцениваемого";
		return oRes;
	}

	var teApplication = continuous_feedback.get_component_application();
	var arrApplicationResponseTypes = continuous_feedback.get_component_application_response_types();
	var oApplicationResponseType = ArrayOptFind( arrApplicationResponseTypes, 'OptInt(This.response_type_id)==' + iResponseTypeID );
	var bSaveAuthor = tools_web.is_true( oApplicationResponseType.save_author );
	var bNotifyResponse = tools_web.is_true( teApplication.wvars.ObtainChildByKey( "notify_response" ).value );

	var docResponse = OpenNewDoc( "x-local://wtv/wtv_response.xmd" );
	teResponse = docResponse.TopElem;
	teResponse.response_type_id = iResponseTypeID;
	teResponse.status = "done";
	teResponse.done_date = CurDate;

	if ( bSaveAuthor )
	{
		teResponse.person_id = iPersonID;
		tools.common_filling( 'collaborator', teResponse, iPersonID );
	}

	if ( iObjectID != null )
	{
		var docObject = tools.open_doc(iObjectID);
		if (docObject != undefined)
		{
			teObject = docObject.TopElem;
			teResponse.type = teObject.Name;
			teResponse.object_id = iObjectID;
			tools.common_filling( 'object', teResponse, iObjectID, teObject );
		}
	}

	if ( arrCustomFields != null )
	{
		tools_web.custom_elems_filling( teResponse, arrCustomFields, null, {
			sCatalogName: "response_type",
			iObjectID: iResponseTypeID,
			bCheckMandatory: false,
			bCheckCondition: false
		} );
	}

	docResponse.BindToDb( DefaultDb );
	docResponse.Save();

	if ( iNotifyResponseType == '' )
	{
		iNotifyResponseType = null;
	}
	if ( iNotifyResponseType != null )
	{
		if ( sNotifyResponse == "send" || ( sNotifyResponse == "default" && bNotifyResponse ) )
		{
			iNotification = OptInt( iNotifyResponseType, null );
			if ( iNotification == null )
			{
				sNotificationTypeCode = iNotifyResponseType;
			}
			else
			{
				teNotification = OpenDoc( UrlFromDocID( iNotification ) ).TopElem;
				sNotificationTypeCode = teNotification.code.Value;
			}
			switch ( sNotificationTypeCode )
			{
				case "continuous_feedback_response":
				{
					tools.create_notification( sNotificationTypeCode, iObjectID, "", null );
					break;
				}
				case "continuous_feedback_request":
				{
					tools.create_notification( sNotificationTypeCode, iPersonID, "", iObjectID );
					break;
				}
				default:
				{
					tools.create_notification( sNotificationTypeCode, iPersonID, "", null );
					break;
				}
			}
		}
	}

	oRes.response_id = docResponse.DocID;

	return oRes;
}

//////////////////////////////////////////////////////////////
function get_form_fields_param( oFormFieldsParam, sFieldName )
{
	var oField = ArrayOptFindByKey( oFormFieldsParam, sFieldName, 'name' );
	if ( oField == undefined )
	{
		return undefined;
	}
	return oField.value;
}