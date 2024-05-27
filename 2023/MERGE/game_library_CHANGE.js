﻿/**
 * @namespace Websoft.WT.Game
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

// Ситуативно 
/**
 * @typedef {Object} oArguments
*/
/**
 * @typedef {Object} oRequests
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
 * @property {?string} FILTER
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
 * @typedef {Object} FormField
 * @property {string} name  
 * @property {string} label 
 * @property {string} type 
 * @property {string} value 
 * @property {?oSimpleEntrisElem[]} entries 
 * @property {?string} validation  
 * @property {boolean} mandatory 
 * @property {?string} css_class
 * @property {?integer} max_chars
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


function get_object_image_url( catElem )
{
	switch( catElem.Name )
	{            
		case "qualification":
			if ( catElem.ChildExists( "resource_id" ) && catElem.resource_id.HasValue )
				return tools_web.get_object_source_url( 'resource', catElem.resource_id.Value ); 
			else
				return "/design/default/images/standart_badge.png";

		default:
			if ( catElem.ChildExists( "resource_id" ) && catElem.resource_id.HasValue )
				return tools_web.get_object_source_url( 'resource', catElem.resource_id.Value ); 	
	}
	return "/images/" + catElem.Name + ".png";
}

function get_currency_name( sCurrencyID )
{
	if ( ( oCurrency = lists.currency_types.GetOptChildByKey( sCurrencyID ) ) != undefined ) 
		return oCurrency.name.Value;
	else
		return "";
}

function get_currency_short_name( sCurrencyID )
{
	if ( ( oCurrency = lists.currency_types.GetOptChildByKey( sCurrencyID ) ) != undefined ) 
		return oCurrency.short_name.Value;
	else
		return "";
}

function get_qualification_status_name( sStatus )
{
	oStatus = common.qualification_assignment_states.GetOptChildByKey( sStatus );
	if ( oStatus != undefined && oStatus.name.HasValue ) { return oStatus.name.Value }
	
	return "";
}

/**
 * @function toLog
 * @description Запись в лог подсистемы.
 * @param {string} sText - Записываемое сообщение
 * @param {boolean} bDebug - вкл/выкл вывода
*/
function toLog(sText, bDebug)
{
	try
	{
		if(bDebug == undefined || bDebug == null)
			throw "error";
		bDebug = tools_web.is_true(bDebug);
	}
	catch(ex)
	{
		bDebug = global_settings.debug;
	}
	
	if(bDebug)
	{
		EnableLog('lib_game');
		LogEvent('lib_game', sText)
	}
}

/**
 * @typedef {Object} oAccount
 * @property {bigint} id
 * @property {bigint} person_id
 * @property {string} person_fullname
 * @property {string} balance
 * @property {string} code
 * @property {string} currency
 * @property {string} status
 * @property {date} modification_date
*/
/**
 * @typedef {Object} ReturnAccounts
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oAccount[]} array – массив счетов
*/
/**
 * @function GetAccountsApp
 * @memberof Websoft.WT.Game
 * @author AKh
 * @description коллекция счетов сотрудников
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {string} sAccessType - Тип доступа: "admin"/"manager"/"hr"/"observer"/"auto"
 * @param {string} sApplication - Код/ID приложения для определения доступа
 * @param {string[]} aStates - статусы счетов
 * @param {string[]} aTypes - типы валют
 * @param {bigint[]} aPersonIDs - пользователи, для которых отображаются счета
 * @param {string} sXQueryQual - строка XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnAccounts}
 */
function GetAccountsApp( iCurUserID, sAccessType, sApplication, aStates, aTypes, aPersonIDs, sXQueryQual, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	oRes.paging = oCollectionParams.paging;
	
	var arrConds = ["$elem/object_type = 'collaborator'"];
	var arrFilters = oCollectionParams.filters;
	iCurUserID = OptInt( iCurUserID, 0);
	
	iApplicationID = OptInt(sApplication, null);
	if( iApplicationID == null && sApplication != "")
	{
		iApplicationID = ArrayOptFirstElem(tools.xquery("for $elem in applications where $elem/code = " + XQueryLiteral(sApplication) + " return $elem/Fields('id')"), {id: null}).id;
	}
	
	if( iApplicationID != null)
	{
		if (!IsArray(aPersonIDs))
			aPersonIDs = [];
		
		if (ArrayOptFirstElem(aPersonIDs) != undefined)
		{
			arrConds.push("MatchSome($elem/object_id, (" + ArrayMerge(aPersonIDs, 'XQueryLiteral(This)', ',') + "))")
		}
		
		
		if(sAccessType == "auto")
		{
			var iApplLevel = tools.call_code_library_method( "libApplication", "GetPersonApplicationAccessLevel", [ iCurUserID, iApplicationID ] );
			
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
	
		switch(sAccessType)
		{
			case "hr":
				var iAppHRManagerTypeID = tools.call_code_library_method("libApplication", "GetApplicationHRBossTypeID", [ iApplicationID, iCurUserID ])
				var arrSubordinateID = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, '', null, '', true, true, true, true, (iAppHRManagerTypeID == null ? [] : [iAppHRManagerTypeID]) ] );
				arrConds.push("MatchSome($elem/object_id, (" + ArrayMerge(arrSubordinateID, "This", ",") + "))")
				break;
			case "observer":
				var arrSubordinateID = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, '', null, '', true, true, true, true, [] ] );
				arrConds.push("MatchSome($elem/object_id, (" + ArrayMerge(arrSubordinateID, "This", ",") + "))");
				break;
			case "reject":
				arrConds.push("$elem/id = 0");
				break;
		}
	}
	else
	{
		arrConds.push("$elem/object_id = " + XQueryLiteral(iCurUserID));
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
					// arrConds.push("doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )");
					arrConds.push(tools.create_search_condition(oFilter.value, "account"));
				}
			}
		}
	}
	
	if ( aStates != undefined && aStates != null && IsArray(aStates) && ArrayOptFirstElem(aStates) != undefined)
	{
		arrConds.push("MatchSome($elem/status, (" + ArrayMerge(aStates, 'XQueryLiteral(This)', ',') + "))");
	}
	
	if ( aTypes != undefined && aTypes != null && IsArray(aTypes) && ArrayOptFirstElem(aTypes) != undefined)
	{
		aCurrencies = get_currencies();
		aRewards = get_rewards();
		
		if( aTypes.indexOf("currency") >= 0 && aTypes.indexOf("awards") >= 0)
		{
			aCurrencies = ArrayUnion(aCurrencies, aRewards)
			arrConds.push("MatchSome($elem/currency_type_id, (" + ArrayMerge(aCurrencies, 'XQueryLiteral(This.id)', ',') + "))");
		}
		else if( aTypes.indexOf("currency") >= 0 )
		{
			arrConds.push("MatchSome($elem/currency_type_id, (" + ArrayMerge(aCurrencies, 'XQueryLiteral(This.id)', ',') + "))")
		}
		else if ( aTypes.indexOf("awards") >= 0 )
		{
			arrConds.push("MatchSome($elem/currency_type_id, (" + ArrayMerge(aRewards, 'XQueryLiteral(This.id)', ',') + "))")
		}
	}
	
	var sSortConds = "";
	if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		switch(sFieldName)
		{
			case "person_id":
				sSortConds = " order by $elem/object_id"
				break;
			case "person_fullname":
				sSortConds = " order by $elem/name"
				break;
			case "balance":
				sSortConds = " order by $elem/balance"
				break;
			case "code":
				sSortConds = " order by $elem/code"
				break;
			case "currency":
				sSortConds = " order by $elem/currency_type_id"
				break;
			case "status":
				sSortConds = " order by $elem/status"
				break;
			case "modification_date":
				sSortConds = " order by $elem/modification_date"
				break;
			case "default":
				sSortConds = " order by $elem/name"
				break;
		}
		if(sSortConds != "" && oCollectionParams.sort.DIRECTION == "DESC")
			sSortConds += " descending";
	}
	
	var sConds = (ArrayOptFirstElem(arrConds) != undefined) ? " where " + ArrayMerge(arrConds, "This", " and ") : "";
	var sReqAccounts = "for $elem in accounts " + sConds + sSortConds + " return $elem";
// toLog("sReqAccounts: " + sReqAccounts, true)
	var xarrAccounts = tools.xquery(sReqAccounts);

	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		xarrAccounts = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ xarrAccounts, oCollectionParams.paging, ({}) ] ).oResult;
	}
	
	var oPerson, oCurrency, oStatus, dLastAccountTransactionDate;
	for ( catAccount in xarrAccounts )
	{
		docAccount = tools.open_doc(catAccount.id);
		if (docAccount == undefined){
			continue;
		}
		if (!catAccount.object_id.HasValue){
			continue;
		}
		
		// oPerson = ArrayOptFirstElem(tools.xquery("for $elem_qc in collaborators where $elem_qc/id = " + catAccount.object_id.Value + " return $elem_qc"));
		oPerson = catAccount.object_id.HasValue ? catAccount.object_id.OptForeignElem : undefined;
		oCurrency = catAccount.currency_type_id.HasValue ? catAccount.currency_type_id.OptForeignElem : undefined;
		oStatus = catAccount.status.HasValue ? catAccount.status.OptForeignElem : undefined;
		dLastAccountTransactionDate = ArrayOptFirstElem(tools.xquery("for $elem in transactions where $elem/account_id = " + XQueryLiteral(catAccount.id.Value) + " order by $elem/date descending return $elem/Fields('date')"), {date: null}).date;
		
		oElem = {
			id: catAccount.id.Value,
			person_id: catAccount.object_id.Value,
			person_fullname: (oPerson != undefined ? oPerson.fullname.Value : ''),
			balance: catAccount.balance.Value,
			code: catAccount.code.Value,
			currency: (oCurrency != undefined ? oCurrency.name.Value : ''),
			icon : (oCurrency != undefined && oCurrency.image_link.HasValue ? oCurrency.image_link.Value : ''),
			last_date : (dLastAccountTransactionDate != null ? RValue(dLastAccountTransactionDate) : ''),
			status: (oStatus != undefined ? oStatus.name : ''),
			modification_date: (catAccount.modification_date.Value)
		};

		oRes.array.push(oElem);
	}
	
	return oRes;
}

/**
 * @function AccountChangeState
 * @memberof Websoft.WT.Game
 * @author AKh
 * @description Изменение статуса счета
 * @param {bigint[]} arrAccounts - массив ID счетов
 * @param {string} sNewState - новый статус
 * @returns {oSimpleResultCount}
*/
function AccountChangeState( arrAccounts, sNewState ){
	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	
	if(!IsArray(arrAccounts))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrAccounts, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObject = tools.open_doc(Int(catCheckObject));
	if(docObject == undefined || docObject.TopElem.Name != "account")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID счетов";
		return oRes;
	}
	
	if(IsEmptyValue(sNewState))
	{
		oRes.error = 504;
		oRes.errorText = "Не указан новый статус счета";
		return oRes;
	}
	
	for(catAccount in arrAccounts)
	{
		docAccount = tools.open_doc(catAccount);
		if (docAccount == undefined)
			continue
		teAccount = docAccount.TopElem;
		if (teAccount.status != sNewState)
		{	
			teAccount.status = sNewState;
			docAccount.Save();
			oRes.count++;
		}
	}
	return oRes;
}

/**
 * @typedef {Object} WTAccountDeleteResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {int} count - количество удаленных счетов
*/
/**
 * @function AccountDelete
 * @memberof Websoft.WT.Game
 * @author AKh
 * @description удаление счетов
 * @param {bigint[]} arrAccounts - массив ID счетов
 * @returns {WTAccountDeleteResult}
*/
function AccountDelete( arrAccounts ){
	
	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
		
	if(!IsArray(arrAccounts))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrAccounts, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObject = tools.open_doc(Int(catCheckObject));
	if(docObject == undefined || docObject.TopElem.Name != "account")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID счетов";
		return oRes;
	}
		
	for(accountID in arrAccounts)
	{
		xqAccounts = tools.xquery("for $elem in transactions where $elem/account_id = " + OptInt(accountID, 0) + " return $elem/Fields('id')");
		if (ArrayOptFirstElem(xqAccounts) != undefined)
		{
			continue
		}
		else
		{
			DeleteDoc( UrlFromDocID( OptInt(accountID) ), false );
			oRes.count++;
		}
	}
	
	return oRes
}

/**
 * @typedef {Object} oAppGameObjectsContext
 * @property {string} icon – иконка счета
 * @property {string} currency – наименование валюты счета
 * @property {string} currency_code – код валюты счета
 * @property {int} amount – текущий баланс счета
*/
/**
 * @function GetContextAccount
 * @memberof Websoft.WT.Game
 * @author IG
 * @description контекст счета
 * @param {bigint} iPersonID - ID сотрудника
 * @param {bigint} iAccountID - ID счета
 * @param {Object} teAccount - Объект счета
 * @returns {oAppGameObjectsContext}
*/
function GetContextAccount( iPersonID, iAccountID, teAccount )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = new Object;
	
	if(teAccount == undefined)
	{
		try
		{
			teAccount = OpenDoc( UrlFromDocID( iAccountID ) ).TopElem;
		}
		catch ( err )
		{
			oRes.error = 503; 
			oRes.errorText = "{ text: 'Object not found', param_name: 'iAccountID' }";
			return oRes;
		}
	}
	
	oCurrency = ArrayOptFind(lists.currency_types, "This.id == teAccount.currency_type_id")
	
	sImageLink = ''
	if(oCurrency != undefined)
	{
		sImageLink = oCurrency.image_link.Value
	}

	oRes.context = {
		collaborator_id: teAccount.object_id.Value,
		icon: sImageLink,
		currency: teAccount.currency_type_id.OptForeignElem.name.Value,
		currency_code: teAccount.currency_type_id.Value,
		amount: teAccount.balance.Value
	}
	
	return oRes
}

/**
 * @typedef {Object} oCollabQualification
 * @property {bigint} id
 * @property {string} name
 * @property {date} assignment_date
 * @property {string} percent_qlfctn_completed
 * @property {string} percent_qlfctn_lrngs
 * @property {string} percent_qlfctn_tests
 * @property {string} percent_qlfctn_ed_methods
 * @property {string} link
 * @property {string} img_url
*/
/**
 * @typedef {Object} WTCollabQualification
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oCollabQualification[]} array – Массив квалификаций.
*/
/**
 * @function GetPersonQualifications
 * @memberof Websoft.WT.Game
 * @description Получение списка квалификаций сотрудника, в процессе прохождения.
 * @param {bigint} iPersonID - ID сотрудника
 * @param {string} sStatus - Статус присвоенной квалификации сотрудника.
 * @returns {WTCollabQualification}
*/

function GetPersonQualifications( iPersonID, sStatus )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	if ( ( iPersonID = OptInt( iPersonID ) ) == undefined )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}

	try
	{
		if ( sStatus == null || sStatus == undefined )
			throw '';
	}
	catch(e) { sStatus = "in_process" }

	function getPercentLearnings( fldList, sCatalogName, sFieldName, sCondParam ) 
	{
		iAmntPersonObjects = 0;
		iAmntQlfctnObjects = fldList.ChildNum;
		if ( iAmntQlfctnObjects > 0 ) 
		{
			xarrCatalogs = XQuery( "for $elem in " + sCatalogName + " where $elem/person_id = " + iPersonID + " and " + sCondParam + ( iAmntQlfctnObjects == 1 ? " $elem/" + sFieldName + " = " + ArrayFirstElem(fldList).PrimaryKey : " MatchSome( $elem/" + sFieldName + ", (" + ArrayMerge(fldList, "PrimaryKey", ",") + ") )") + " return $elem" );

			iAmntPersonObjects += ArrayCount( ArraySelectDistinct( xarrCatalogs, sFieldName ) );
		}
		iPercent = ( iAmntPersonObjects == 0 || iAmntQlfctnObjects == 0 ) ? 0 : Real( Math.round( ( Real( iAmntPersonObjects ) / Real( iAmntQlfctnObjects ) ) * 1000 ) ) / 10;
		return iPercent;
	}

	function getPercentEdPrograms( fldList, sFieldName ) 
	{
		iAmntPersonEdProgs = 0;
		iAmntQlfctnEdProgs = fldList.ChildNum;
		if ( iAmntQlfctnEdProgs > 0 ) 
		{            
			xarrEvents = ArrayDirect( XQuery( 'for $elem in events where $elem/status_id = \'close\' and' + (iAmntQlfctnEdProgs == 1 ? ' $elem/' + sFieldName + ' = ' + ArrayFirstElem(fldList).PrimaryKey : ' MatchSome( $elem/' + sFieldName + ', (' + ArrayMerge(fldList, 'PrimaryKey', ',') + ') )') + ' order by $elem/' + sFieldName + ' return $elem' ) );

			xarrEventResults = ArrayDirect( XQuery( 'for $elem in event_results where $elem/person_id = ' + iPersonID + ' and $elem/is_assist = true() order by $elem/event_id return $elem' ) );

			iEventCount = ArrayCount( xarrEvents );
			for ( i = 0; i < iEventCount; i++ ) 
			{
				catEvent = xarrEvents[i];

				if ( ArrayOptFindBySortedKey( xarrEventResults, catEvent.id, 'event_id' ) != undefined )
					iAmntPersonEdProgs++;
				else
					continue;

				iLastFieldID = catEvent.Child( sFieldName );
				while ( ( i + 1 ) < iEventCount && iLastFieldID == xarrEvents[i + 1].Child( sFieldName ) )
					i++;
			}
		}

		iPercent = ( iAmntPersonEdProgs == 0 || iAmntQlfctnEdProgs == 0 ) ? 0 : Real( Math.round( ( Real( iAmntPersonEdProgs ) / Real( iAmntQlfctnEdProgs ) ) * 1000 ) ) / 10;
		return iPercent;
	}

	xarrQualifAssignments = XQuery( "for $elem in qualification_assignments where $elem/person_id = "+ iPersonID +" and $elem/status = "+ XQueryLiteral( sStatus ) +" return $elem" )
	for ( elem in xarrQualifAssignments )
	{
		obj = new Object();
		obj.id = elem.qualification_id.Value;
		obj.name = ( ( feQlfctn = elem.qualification_id.OptForeignElem ) != undefined && feQlfctn.name.HasValue ) ? feQlfctn.name.Value : "";
		obj.assignment_date = elem.assignment_date.Value;

		obj.percent_qlfctn_completed = "0";
		obj.percent_qlfctn_lrngs = null;
		obj.percent_qlfctn_tests = null;
		obj.percent_qlfctn_ed_methods = null;

		dQualfctn = tools.open_doc( obj.id )
		if ( dQualfctn != undefined )
		{
			teQualfctn = dQualfctn.TopElem;
			obj.percent_qlfctn_completed = StrReal( teQualfctn.get_scaled_progress( iPersonID, { 
				"check_course": true, 
				"check_test": true, 
				"check_edctn_method": true,
				"check_cmpnd_method": true,
				"check_qualifications": true,
				"check_eval_cndtns": true
			} ), 1 );

			obj.percent_qlfctn_lrngs = StrReal( getPercentLearnings( teQualfctn.courses, "learnings", "course_id", "($elem/state_id = 4 or $elem/state_id = 2) and" ), 1 );
			obj.percent_qlfctn_tests = StrReal( getPercentLearnings( teQualfctn.assessments, "test_learnings", "assessment_id", "($elem/state_id = 4 or $elem/state_id = 2) and" ), 1 );
			obj.percent_qlfctn_ed_methods = StrReal( getPercentEdPrograms( teQualfctn.education_methods, "education_method_id" ), 1 );
			obj.img_url = get_object_image_url( teQualfctn );
		}
		obj.link = tools_web.get_mode_clean_url( null, obj.id );
		obj.status = get_qualification_status_name( sStatus );

		oRes.array.push( obj );
	}
	return oRes;
}

/**
 * @typedef {Object} oCollabQualification
 * @property {bigint} id
 * @property {string} name
 * @property {date} assignment_date
 * @property {string} expiration_date
 * @property {string} state
 * @property {string} link
*/
/**
 * @typedef {Object} WTCollabQualification
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oCollabQualification[]} array – Массив присвоенных квалификаций.
*/
/**
 * @function GetPersonAssignQualifications
 * @memberof Websoft.WT.Game
 * @description Получение списка квалификаций, присвоенных сотруднику.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {string} sStatus - Статус присвоенной квалификации сотрудника.
 * @returns {WTCollabQualification}
*/

function GetPersonAssignQualifications( iPersonID, sStatus )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	if ( ( iPersonID = OptInt( iPersonID ) ) == undefined )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}

	try
	{
		if ( sStatus == null || sStatus == undefined )
			throw '';
	}
	catch(e) { sStatus = "assigned" }

	xarrQualifAssignments = XQuery( "for $elem in qualification_assignments where $elem/person_id = "+ iPersonID +" and $elem/status = "+ XQueryLiteral( sStatus ) +" return $elem" )
	for ( elem in xarrQualifAssignments )
	{
		feQlfctn = elem.qualification_id.OptForeignElem

		obj = new Object();
		obj.id = elem.qualification_id.Value;
		obj.name = ( feQlfctn != undefined && feQlfctn.name.HasValue ) ? feQlfctn.name.Value : "";
		obj.assignment_date = elem.assignment_date.Value;
		obj.expiration_date = elem.expiration_date.Value;
		obj.state = get_qualification_status_name( elem.status.Value );
		obj.link = tools_web.get_mode_clean_url( null, obj.id );

		obj.img = '';
		dQlfctn = tools.open_doc(feQlfctn.id);
		if (dQlfctn != undefined) {
		  teQlfctn = dQlfctn.TopElem;
		  obj.img = get_object_image_url(teQlfctn)
		}

		oRes.array.push( obj );
	}
	return oRes;
}

/**
 * @typedef {Object} oPersonOrders
 * @property {bigint} id
 * @property {string} code
 * @property {string} person_fullname
 * @property {string} sum
 * @property {string} status
 * @property {string} currency
 * @property {string} formed_date
 * @property {string} paid_date
*/
/**
 * @typedef {Object} WTPersonOrders
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPersonOrders[]} orders – Массив заказов.
*/
/**
 * @function GetPersonOrders
 * @memberof Websoft.WT.Game
 * @description Получение списка заказов, оформленных сотрудником.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {string} sStatus - Статус заказа.
 * @param {boolean} isTimeShow - Показывать время в датах.
 * @returns {WTPersonOrders}
*/

function GetPersonOrders( iPersonID, sStatus, isTimeShow )
{
	var oRes = tools.get_code_library_result_object();
	oRes.orders = [];

	if ( ( iPersonID = OptInt( iPersonID ) ) == undefined )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}
	
	try
	{
		if ( sStatus == null || sStatus == undefined )
			throw '';
	}
	catch(e) { sStatus = "formed" }

	try
	{
		isTimeShow = tools_web.is_true( isTimeShow );
	}
	catch(e) { isTimeShow = false }

	xarrPersonOrders = XQuery( "for $elem in orders where $elem/person_id = "+ iPersonID +" and $elem/status = "+ XQueryLiteral( sStatus ) +" return $elem" );
	for ( order in xarrPersonOrders )
	{
		obj = {};
		obj.id = order.id.Value;
		obj.code = order.code.Value;
		obj.person_fullname = order.person_fullname.Value;
		obj.sum = order.sum.Value;
		obj.status = ( order.status.HasValue ) ? common.order_status_types.GetOptChildByKey( order.status.Value, "id" ).name.Value : "";
		obj.currency = ( order.currency_type_id.HasValue ) ? get_currency_name( order.currency_type_id.Value ) : "";
		obj.formed_date = ( order.formed_date.HasValue ) ? StrDate( order.formed_date.Value, isTimeShow ) : "";
		obj.paid_date = ( order.paid_date.HasValue ) ? StrDate( order.paid_date.Value, isTimeShow ) : "";

		oRes.orders.push( obj );
	}
	return oRes;
}

/**
 * @typedef {Object} oPersonBasketGoods
 * @property {bigint} id
 * @property {string} name
 * @property {string} sum
 * @property {string} num
 * @property {string} currency
 * @property {string} url
 * @property {string} date
 * @property {string} img
*/
/**
 * @typedef {Object} WTPersonBasketGoods
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPersonBasketGoods[]} baskets – Массив товаров в корзине.
*/
/**
 * @function GetPersonBasketGoods
 * @memberof Websoft.WT.Game
 * @description Получение списка корзин сотрудника.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {bigint} sBasketCurrency - ID валюты.
 * @param {boolean} isTimeShow - Показывать время в датах.
 * @param {bigint} curDocID
 * @returns {WTPersonBasketGoods}
*/

function GetPersonBasketGoods( iPersonID, sBasketCurrency, isTimeShow, curDocID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.baskets = [];

	if ( ( iPersonID = OptInt( iPersonID ) ) == undefined )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}

	try
	{
		if ( sBasketCurrency == null || sBasketCurrency == undefined )
			throw '';
	}
	catch(e) { sBasketCurrency = "" }

	try
	{
		isTimeShow = tools_web.is_true( isTimeShow );
	}
	catch(e) { isTimeShow = false }

	sCondition = ( sBasketCurrency != "" ) ? ' and $elem/currency_type_id = ' + XQueryLiteral( sBasketCurrency ) : "";
	catPersonBaskets = ArrayOptFirstElem( tools.xquery( 'for $elem in baskets where $elem/person_id = ' + iPersonID + sCondition +' return $elem/id, $elem/__data' ) );
	dBasket = tools.open_doc( catPersonBaskets.id );
	if ( dBasket != undefined )
	{
		teBasket = dBasket.TopElem;
		if ( sBasketCurrency == "" )
		{
			sBasketCurrency = teBasket.currency_type_id.Value;
		}
		for ( good in teBasket.goods )
		{
			dGood = tools.open_doc( good.PrimaryKey );
			if ( dGood == undefined ) { continue }

			teGood = dGood.TopElem;
			oCost = ArrayOptFind( teGood.costs, "This.currency_type_id.Value == sBasketCurrency" );
			if ( oCost == undefined ) { continue }
			
			obj = {};
			obj.id = OptInt( good.PrimaryKey );
			obj.name = teGood.name.HasValue ? teGood.name.Value : "";
			obj.sum = oCost.sum.HasValue ? oCost.sum.Value : "";
			obj.num =  good.number.HasValue ? good.number.Value : "";
			obj.currency = get_currency_name( sBasketCurrency );
			obj.url = ( OptInt( curDocID ) != undefined ) ? tools_web.get_mode_clean_url( null, obj.id, { doc_id: curDocID } ) : tools_web.get_mode_clean_url( null, obj.id );
			obj.date = ( good.reserved_date.HasValue ) ? StrDate( good.reserved_date, isTimeShow ) : "";
			obj.img = get_object_image_url( teGood );

			oRes.baskets.push( obj );
		}
	}
	return oRes;
}

/**
 * @typedef {Object} oGoods
 * @property {bigint} id
 * @property {string} name
 * @property {string} currency
 * @property {string} sum
 * @property {string} instances
 * @property {string} img
 * @property {string} url
*/
/**
 * @typedef {Object} WTGoods
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oGoods[]} goods – Массив товаров.
*/
/**
 * @function GetGoods
 * @memberof Websoft.WT.Game
 * @description Получение списка товаров.
 * @param {bigint} iGoodTypeID - ID типа товара.
 * @param {bigint} iRoleID - ID категории (роли) товара.
 * @param {bigint} sSearch - Строка поиска по наименованию товара.
 * @param {bigint} sTypeCurrency - ID типа валюты товара.
 * @param {bigint} bShowInstances - Показывать экземпляры товара.
 * @returns {WTGoods}
*/

function GetGoods( iGoodTypeID, iRoleID, sSearch, sTypeCurrency, bShowInstances )
{
	var oRes = tools.get_code_library_result_object();
	oRes.goods = [];

	try
	{
		if ( sSearch == null || sSearch == undefined )
			throw '';
	}
	catch(e) { sSearch = "" }

	try
	{
		if ( sTypeCurrency == null || sTypeCurrency == undefined )
			throw '';
	}
	catch(e) { sTypeCurrency = "" }

	try
	{
		if ( bShowInstances == null || bShowInstances == undefined )
			throw '';
		else 
			bShowInstances = tools_web.is_true( bShowInstances );
	}
	catch(e) { bShowInstances = false }

	iGoodTypeID = OptInt( iGoodTypeID );
	iRoleID = OptInt( iRoleID );

	aConditions = [];
	if ( iGoodTypeID != undefined )
		aConditions.push( " $elem/good_type_id = " + iGoodTypeID );
	if ( sSearch != "" )
		aConditions.push( " contains( $elem/name, " + XQueryLiteral( Trim( sSearch ) ) + " ) " );

	xarrGoods = tools.xquery( "for $elem in goods" + ( ArrayOptFirstElem( aConditions ) != undefined ? " where " + ArrayMerge( aConditions, "This", " and " ) : "" ) + " return $elem/id, $elem/__data" );
	for ( good in xarrGoods )
	{
		dGood = tools.open_doc( good.id );
		if ( dGood == undefined ) { continue }
		teGood = dGood.TopElem;
		if ( iRoleID != undefined && teGood.role_id.HasValue && OptInt( teGood.role_id ) != iRoleID ) { continue }

		oGoodCost = ArrayOptFirstElem( teGood.costs );
		sCurrency = "";
		sSum = "";
		if ( sTypeCurrency != "" )
		{
			oGoodCost = ArrayOptFind( teGood.costs, "This.currency_type_id.Value == Trim(sTypeCurrency)" );
			if ( oGoodCost != undefined ) 
			{
				sCurrency = get_currency_name( oGoodCost.currency_type_id.Value );

				if ( oGoodCost.sum.HasValue ) { sSum = oGoodCost.sum.Value }
			}
			else { continue }
		}
		else if ( oGoodCost != undefined )
		{
			if ( oGoodCost.currency_type_id.HasValue ) { sCurrency = get_currency_name( oGoodCost.currency_type_id.Value ) }
			if ( oGoodCost.sum.HasValue ) { sSum = oGoodCost.sum.Value }
		}

		sInstances = "";
		if ( bShowInstances && teGood.delivery_type.HasValue && teGood.delivery_type.Value != "unlimit" )
		{
			sInstances = ArrayCount( XQuery( "for $elem in good_instances where $elem/good_id = "+ good.id +" and $elem/status = 'in_stock' return $elem" ) );
			if ( sInstances == 0 ) { sInstances = "Отсутствуют" }
		}
		else if ( bShowInstances )
		{
			sInstances = "Не ограничено";
		}
		
		obj = {};
		obj.id = good.id.Value;
		obj.name = teGood.name.Value;
		obj.currency = sCurrency;
		obj.sum = sSum;
		obj.instances = sInstances;
		obj.img = get_object_image_url( teGood );
		obj.url = tools_web.get_mode_clean_url( null, obj.id );
		
		if ( teGood.good_type_id.HasValue && teGood.good_type_id.OptForeignElem != undefined ) 
		{ 
			oCustomFields = tools.get_custom_template( "good_type", teGood.good_type_id.Value, teGood );
			if ( oCustomFields != null )
			{
				for ( fld in oCustomFields.fields )
				{
					obj[fld.name.Value] = ( ( fldCustom = teGood.custom_elems.GetOptChildByKey( fld.name.Value ) ) != undefined && fldCustom.value.HasValue ) ? fldCustom.value.Value : "";
				}
			}
		}
			
		oRes.goods.push( obj );
	}

	return oRes;
}

/**
 * @typedef {Object} oPersonAwards
 * @property {bigint} id
 * @property {bigint} qualification_id
 * @property {string} qualification_name
 * @property {string} qualification_url
 * @property {string} qualification_img
 * @property {string} qualification_desc
 * @property {string} status
 * @property {string} assign_date
 * @property {string} progress
 * @property {bigint} level_id
 * @property {bigint} level_name
*/
/**
 * @typedef {Object} WTPersonAwards
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPersonAwards[]} awards – Массив наград (присвоенных квалификаций).
*/
/**
 * @function GetPersonAwards
 * @memberof Websoft.WT.Game
 * @description Получение списка наград (присвоенных квалификаций) сотрудника.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {string} sStatus - Статус присвоенной квалификации.
 * @param {boolean} isTimeShow - Показывать время в датах.
 * @param {string} sMode - Режим показа.
 * @param {string} aType - Тип присвоения квалификации.
 * @returns {WTPersonAwards}
*/

function GetPersonAwards( iPersonID, sStatus, isTimeShow, sMode, aType )
{
	var oRes = tools.get_code_library_result_object();
	oRes.awards = [];

	if ((iPersonID = OptInt(iPersonID)) == undefined) {
		oRes.error = 503;
		oRes.errorText = '{ text: "Object not found.", param_name: "iPersonID" }';
		return oRes;
	}

	try {
		if (sMode == null || sMode == undefined) {
			throw '';
		}
	}
	catch(e) { sMode = 'all' }

	try {
		if (sStatus == null || sStatus == undefined || sMode == 'obtain') {
			throw '';
		}
	}
	catch(e) { sStatus = (sMode == 'obtain') ? 'active' : '' }

	try {
		isTimeShow = tools_web.is_true(isTimeShow);
	}
	catch(e) { isTimeShow = false }

	try
	{
		if ( Trim( String( aType ) ) == '' )
			return oRes;
	}
	catch( ex )
	{
	}

	var sCondition = '';
	var sStatusCondition = (sStatus != '') ? ' $elem/status = ' + XQueryLiteral(sStatus) : '';
	switch (sMode) {
		case 'my':
			if (sStatusCondition != '') {
				sCondition = ' and' + sStatusCondition;
			}
			xarrQAs = XQuery('for $elem in qualification_assignments where $elem/person_id = ' + iPersonID + sCondition +' order by $elem/assignment_date descending return $elem/Fields("id", "qualification_id", "status", "assignment_date")');
			xarrAwardsResult = (ArrayCount(xarrQAs) > 0) ? ArrayExtract(xarrQAs, '({id: This.id, qualification_id: This.qualification_id, status: This.status, assignment_date: This.assignment_date})') : [];
			break;

		case 'all':
			if (sStatusCondition != '') {
				sCondition = ' and' + sStatusCondition;
			}
			xarrQAs = XQuery('for $elem in qualification_assignments where $elem/person_id = ' + iPersonID + sCondition +' order by $elem/assignment_date descending return $elem/Fields("id", "qualification_id", "status", "assignment_date")');
			xarrQAsEssential = (ArrayCount(xarrQAs) > 0) ? ArrayExtract(xarrQAs, '({id: This.id, qualification_id: This.qualification_id, status: This.status, assignment_date: This.assignment_date})') : [];

			xarrQs = XQuery('for $q in qualifications where some $qa in qualification_assignments satisfies ($q/id = $qa/qualification_id and $qa/person_id != ' + iPersonID +') and $q/join_mode = \'open\' order by $q/name descending return $q/Fields("id")');
			xarrQsEssential = (ArrayCount(xarrQs) > 0) ? ArrayExtract(xarrQs, '({id: This.id, qualification_id: This.id, status: null, assignment_date: null})') : [];

			xarrAwardsResult = ArrayUnion(xarrQAsEssential, xarrQsEssential);
			break;

		case 'obtain':
			xarrQs = XQuery('for $q in qualifications where some $qa in qualification_assignments satisfies ($q/id = $qa/qualification_id and $qa/person_id != ' + iPersonID +') and $q/join_mode = \'open\' order by $q/name descending return $q/Fields("id")');
			xarrAwardsResult = (ArrayCount(xarrQs) > 0) ? ArrayExtract(xarrQs, '({id: This.id, qualification_id: This.id, status: null, assignment_date: null})') : [];
			break;
	}

	for (award in xarrAwardsResult) {        
		sImg = '';
		sName = '';
		sDesc = '';
		sProgress = '';
		iQualificationLevelID = '';
		sQualificationLevelName = '';

		obj = {};
		obj.id = award.id;
		obj.status = (award.status != null) ? get_qualification_status_name(award.status) : 'Доступна для получения';
		obj.assign_date = (award.assignment_date != null && OptDate(award.assignment_date, null) != null) ? StrDate(award.assignment_date, isTimeShow) : '';
		obj.qualification_id = award.qualification_id;

		dCurQualification = tools.open_doc( award.qualification_id );
		if ( dCurQualification != undefined )
		{
			teCurQualification = dCurQualification.TopElem;

			if ( aType == 'rewards' && ! teCurQualification.is_reward )
				continue;

			if ( aType == 'badges' && teCurQualification.is_reward )
				continue;

			if (teCurQualification.resource_id.HasValue) { sImg = get_object_image_url(teCurQualification) }
			if (teCurQualification.name.HasValue) { sName = teCurQualification.name.Value }
			if (teCurQualification.desc.HasValue) { sDesc = HtmlToPlainText(teCurQualification.desc.Value) }
			if (teCurQualification.level_id.HasValue) { 
				iQualificationLevelID = teCurQualification.level_id.Value;
				if (teCurQualification.level_id.OptForeignElem != undefined && teCurQualification.level_id.OptForeignElem.name.HasValue) { 
					sQualificationLevelName = teCurQualification.level_id.OptForeignElem.name.Value 
				}
			}
			sProgress = obj.status + (award.status == 'in_process' ? ' (' + StrInt(teCurQualification.get_scaled_progress(iPersonID)) + '%)' : '');
		}
		
		obj.qualification_name = sName;
		obj.qualification_url = tools_web.get_mode_clean_url('qualification', award.qualification_id);
		obj.qualification_img = (sImg != '') ? sImg : '/design/default/images/standart_badge.png';
		obj.qualification_desc = sDesc;
		obj.level_id = iQualificationLevelID;
		obj.level_name = sQualificationLevelName;
		obj.progress = sProgress;
		
		oRes.awards.push(obj);
	}

	return oRes;
}

/**
 * @typedef {Object} oGameLeaders
 * @property {bigint} id
 * @property {string} modification_date
 * @property {string} person_id
 * @property {string} fullname
 * @property {string} level_name
 * @property {string} level_num
 * @property {string} currency_types_array
 * @property {string} person_score
 * @property {string} icon_url
 * @property {string} num
*/
/**
 * @typedef {Object} WTGameLeaders
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oGameLeaders[]} leaders – Массив лидеров (рейтинг).
*/
/**
 * @function GetGameLeaders
 * @memberof Websoft.WT.Game
 * @description Получение списка лидеров (рейтинг сотрудника).
 * @param {Object} tePerson - TopElem сотрудника.
 * @param {boolean} bCheckLevel - Строить рейтинг с учетом последовательности уровней. Если да, то не будет учитываться валюта, заданная в параметре sCurrencyType.
 * @param {string} sCurrencyType - Валюта, по которой будет строиться рейтинг. Обязательный параметр, если bCheckLevel = false.
 * @param {boolean} bAllLevel - Строить рейтинг по сотрудникам с любым уровнем. Если нет, то рейтинг строится по сотрудникам с тем же уровнем, что у текущего.
 * @param {boolean} bDispSub - Строить рейтинг по сотрудникам подразделения. Если да, то рейтинг формируется только по сотрудникам подразделения текущего пользователя.
 * @param {number} iSubDepth - Количество подразделений вверх по иерархии. Применимо для bDispSub = true.
 * @param {bigint} iGrpColl - Группа сотрудников. Если задана, то рейтинг формируется по сотрудникам заданой группы.
 * @param {Object} oPaging - Объект пейджинга ( oPaging.index - Номер страницы; oPaging.size - Размер страницы ).
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {boolean} bRangeRating - Ограничить количество сотрудников. Если да, то список сотрудников в рейтинге ограничивается параметром iRangeRatingPersons.
 * @param {number} iRangeRatingPersons - Ограниченное число сотрудников--Число сотрудников в рейтинге до и после заданного сотрудника в рейтинге. Применимо при bRangeRating = true.
 * @param {boolean} bSamePlace - Одинаковые позиции в рейтинге--Присваивать пользователям одно и тоже место в рейтинге при одинаковом количестве баллов.
 * @param {boolean} bShowTopRating - Показывать первые три места рейтинга.
 * @param {bigint} iOrgID ID организации.
 * @returns {WTGameLeaders}
*/

function GetGameLeaders( tePerson, bCheckLevel, sCurrencyType, bAllLevel, bDispSub, iSubDepth, iGrpColl, oPaging, iPersonID, bRangeRating, iRangeRatingPersons, bSamePlace, bShowTopRating, iOrgID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.leaders = [];

	if ( tePerson == null || tePerson == undefined )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'TopElem not found.', param_name: 'tePerson' }";
		return oRes;
	}

	try
	{
		if ( oPaging == null || oPaging == undefined || oPaging.GetOptProperty( "index" ) == undefined || oPaging.GetOptProperty( "size" ) == undefined )
			throw '';
	}
	catch(e) { oPaging = null }

	if ( ( iPersonID = OptInt( iPersonID ) ) == undefined )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}

	try
	{
		bCheckLevel = tools_web.is_true( bCheckLevel );
	}
	catch(e) { bCheckLevel = true }

	try
	{
		bAllLevel = tools_web.is_true( bAllLevel );
	}
	catch(e) { bAllLevel = true }

	try
	{
		bDispSub = tools_web.is_true( bDispSub );
	}
	catch(e) { bDispSub = false }

	try
	{
		bRangeRating = tools_web.is_true( bRangeRating );
	}
	catch(e) { bRangeRating = false }

	try
	{
		bSamePlace = tools_web.is_true( bSamePlace );
	}
	catch(e) { bSamePlace = false }

	try
	{
		bShowTopRating = tools_web.is_true( bShowTopRating );
	}
	catch(e) { bShowTopRating = false }

	try
	{
		iOrgID = Int( iOrgID );
	}
	catch( ex )
	{
		iOrgID = null;
	}

	try
	{
		if ( sCurrencyType == null || sCurrencyType == undefined )
			throw '';
	}
	catch(e) { sCurrencyType = "" }

	iSubDepth = OptInt( iSubDepth );
	iGrpColl = OptInt( iGrpColl );
	iRangeRatingPersons = OptInt( iRangeRatingPersons, 0 );
	
	oRating = tools_web.get_game_rating( tePerson, bCheckLevel, sCurrencyType, bAllLevel, bDispSub, iSubDepth, iGrpColl, oPaging, iPersonID, bRangeRating, iRangeRatingPersons, null, bSamePlace, bShowTopRating, iOrgID );
	if ( DataType( oRating ) == "object" )
	{
		if ( OptInt( oRating.error ) != 0 )
		{
			oRes.error = oRating.error;
			oRes.errorText = oRating.message;
		}
		else
		{
			oRes.leaders = oRating.array;
		}
	}
	else
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Rating data is nod found' }";
	}
	
	return oRes;
}

/**
 * @typedef {Object} oCurrencyType
 * @property {bigint} id
 * @property {number} person_score
*/
/**
 * @typedef {Object} oGameLeader
 * @property {bigint} id
 * @property {string} modification_date
 * @property {bigint} person_id
 * @property {string} fullname
 * @property {string} level_name
 * @property {number} level_num
 * @property {oCurrencyType[]} currency_types_array
 * @property {number} person_score
 * @property {string} icon_url
 * @property {number} num
*/
/**
 * @typedef {Object} WTGameLeadersAll
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oGameLeaders[]} leaders – Массив лидеров (рейтинг).
*/
/**
 * @function GetGameLeadersAll
 * @memberof Websoft.WT.Game
 * @description Получение списка лидеров по заданной валюте/уровню.
 * @param {boolean} bAllLevel - Cтроить рейтинг по сотрудникам с любым уровнем, иначе только по сотрудникам с заданным уровнем iLevelID, если bCheckLevel = true.
 * @param {boolean} bCheckLevel - Cтроить рейтинг с учетом последовательности уровней, будет учитываться валюта заданного уровня iLevelID.
 * @param {bigint} iLevelID - Уровень, который будет учитываться при расчете рейтинга, если bCheckLevel = true и bAllLevel = false.
 * @param {boolean} bDispSub - Cтроить рейтинг только по сотрудникам заданного подразделения (необязательный).
 * @param {bigint} iSubdivID - Подразделение, по сотрудникам которого будет строиться рейтинг (необязательный).
 * @param {number} iSubdivNum - Количество подразделений вверх по иерархии (если bDispSub = true).
 * @param {string} sCurrencyTypeID - Валюта по которой строится рейтинг (обязательный если bCheckLevel = false).
 * @param {bigint} iGrpColl - Если указана, рейтинг формируется по сотрудникам указанной группы.
 * @param {object} oPaging - Объект пэйджинга для ограничения итераций цикла по массиву биллинговых счетов (применимо если bCheckLevel = false).
 * @param {boolean} bRange - Получить список сотрудников в рейтинге, ограниченный параметром iAmntCollsRating.
 * @param {number} iAmntCollsRating - Количество сотрудников, выводимое в рейтинге от первого.
 * @param {boolean} bSamePlace - Присваивать пользователям одно и тоже место в рейтинге при одинаковом количестве баллов.
 * @param {boolean} bShowTopRating - Показывать первые три места рейтинга (если bRange = false).
 * @param {bigint} iOrgID ID организации.
 * @returns {WTGameLeadersAll}
*/

function GetGameLeadersAll( bAllLevel, bCheckLevel, iLevelID, bDispSub, iSubdivID, iSubdivNum, sCurrencyTypeID, iGrpColl, oPaging, bRange, iAmntCollsRating, bSamePlace, bShowTopRating, iOrgID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.leaders = [];

	try 
	{
		bAllLevel = tools_web.is_true( bAllLevel );
	} 
	catch(e) { bAllLevel = true }

	try 
	{
		bCheckLevel = tools_web.is_true( bCheckLevel );
	} 
	catch(e) { bCheckLevel = true }

	try 
	{
		if ( iLevelID == null || iLevelID == undefined ) 
			throw '';
	} 
	catch(e) { iLevelID = undefined }

	try 
	{
		bDispSub = tools_web.is_true( bDispSub );
	} 
	catch(e) { bDispSub = false }

	try 
	{
		if ( iSubdivID == null || iSubdivID == undefined ) 
			throw '';
	} 
	catch(e) { iSubdivID = undefined }

	iSubdivNum = OptInt( iSubdivNum, 1 );

	try 
	{
		if ( sCurrencyTypeID == null || sCurrencyTypeID == undefined )
			throw '';
	} 
	catch(e) { sCurrencyTypeID = "" }

	iGrpColl = OptInt( iGrpColl );

	try
	{
		if ( oPaging == null || oPaging == undefined || oPaging.GetOptProperty( "index" ) == undefined || oPaging.GetOptProperty( "size" ) == undefined )
			throw '';
	}
	catch(e) { oPaging = null }

	try
	{
		bRange = tools_web.is_true( bRange );
	}
	catch(e) { bRange = false }

	iAmntCollsRating = OptInt(iAmntCollsRating, 100);

	try
	{
		bSamePlace = tools_web.is_true( bSamePlace );
	}
	catch(e) { bSamePlace = false }

	try
	{
		bShowTopRating = tools_web.is_true( bShowTopRating );
	}
	catch(e) { bShowTopRating = false }

	try
	{
		iOrgID = Int( iOrgID );
	}
	catch( ex )
	{
		iOrgID = null;
	}

	oRating = tools_web.get_game_rating_all( bAllLevel, bCheckLevel, iLevelID, bDispSub, iSubdivID, iSubdivNum, sCurrencyTypeID, iGrpColl, oPaging, bRange, iAmntCollsRating, bSamePlace, bShowTopRating, iOrgID );

	if ( DataType( oRating ) == "object" )
	{
		if ( OptInt( oRating.error ) != 0 )
		{
			oRes.error = oRating.error;
			oRes.errorText = oRating.message;
		}
		else
		{
			oRes.leaders = oRating.array;
		}
	}
	else
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Rating data is nod found' }";
	}

	return oRes;
}

// ======================================================================================
// ============================  Объектные показатели ===================================
// ======================================================================================

/**
 * @typedef {Object} oPersonGameRating
 * @property {number} iPoints 
 * @property {number} iPlaceNumber
 * @property {string} sError
*/
/**
 * @typedef {Object} WTPersonGameRating
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPersonGameRating[]} leaders – Массив лидеров (рейтинг).
*/
/**
 * @function GetPersonGameRating
 * @memberof Websoft.WT.Game
 * @description Получение баллов сотрудника и его места в рейтинге.
 * @param {boolean} bCheckLevel - Строить рейтинг с учетом последовательности уровней. Если да, то не будет учитываться валюта, заданная в параметре sCurrencyType.
 * @param {string} sCurrencyType - Валюта, по которой будет строиться рейтинг. Обязательный параметр, если bCheckLevel = false.
 * @param {boolean} bAllLevel - Строить рейтинг по сотрудникам с любым уровнем. Если нет, то рейтинг строится по сотрудникам с тем же уровнем, что у текущего.
 * @param {boolean} bDispSub - Строить рейтинг по сотрудникам подразделения. Если да, то рейтинг формируется только по сотрудникам подразделения текущего пользователя.
 * @param {number} iSubDepth - Количество подразделений вверх по иерархии. Применимо для bDispSub = true.
 * @param {bigint} iGrpColl - Группа сотрудников. Если задана, то рейтинг формируется по сотрудникам заданой группы.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {boolean} bSamePlace - Одинаковые позиции в рейтинге--Присваивать пользователям одно и тоже место в рейтинге при одинаковом количестве баллов.
 * @param {boolean} bShowTopRating - Показывать первые три места рейтинга на каждой странице? (применимо для bRange = false).
 * @returns {oPersonGameRating}
*/

function GetPersonGameRating( bCheckLevel, sCurrencyType, bAllLevel, bDispSub, iSubDepth, iGrpColl, iPersonID, bSamePlace, bShowTopRating ) 
{
	if ( OptInt(iPersonID) == undefined )
	{
		alert('[GetPersonGameRating]: Не задан ID сотрудника - iPersonID, по которому должен строиться рейтинг.');
		throw '[GetPersonGameRating]: Не задан ID сотрудника - iPersonID, по которому должен строиться рейтинг.';
	}

	dPerson = tools.open_doc( iPersonID );
	if ( dPerson != undefined )
	{
		tePerson = dPerson.TopElem;
		oResRating = GetGameLeaders( tePerson, bCheckLevel, sCurrencyType, bAllLevel, bDispSub, iSubDepth, iGrpColl, null, iPersonID, false, null, bSamePlace, bShowTopRating );
	}

	var curApplication = tools_app.get_cur_application( 'websoft_game' );
	sTeamRatingValue = OptInt(curApplication.wvars.GetOptChildByKey("rating").value, 0);

	oMetric = {
		iPoints: 0,
		iPlaceNumber: 0,
		bTeamRating: '',
		sError: ""
	};

	bTeamRating = false;
	if(sTeamRatingValue != 0)
		bTeamRating = true
	
	iError = oResRating.error;
	sErrorMessage = oResRating.errorText;
	aResLeaders = oResRating.leaders;

	if (iError != 0) 
	{
		oMetric.iPoints = sErrorMessage;
		oMetric.iPlaceNumber = sErrorMessage;
		oMetric.sError = sErrorMessage;
		return oMetric;
		// throw sErrorMessage;
	} 

	if ( ( oPersonRating = ArrayOptFindByKey( aResLeaders, iPersonID, "person_id" ) ) != undefined ) 
	{
		oMetric.iPoints = oPersonRating.person_score;
		oMetric.iPlaceNumber = oPersonRating.num;
		oMetric.bTeamRating = bTeamRating;
	}
	else 
	{
		oMetric.sError = oMetric.iPoints = oMetric.iPlaceNumber = "Данные отсутствуют";
	}

	return oMetric;
}

/**
 * @typedef {Object} WTPersonAwardsInfoMetric
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {number} iAwards
 * @property {string} sLevel
*/
/**
 * @function GetPersonAwardsInfo
 * @memberof Websoft.WT.Game
 * @param {bigint} iPersonID - ID сотрудника.
 * @description Возвращает количество полученных наград и текущий уровень сотрудника.
 * @returns {WTPersonAwardsInfoMetric}
*/

function GetPersonAwardsInfo( iPersonID ) 
{
	oMetric = {
		iAwards: 0,
		sLevel: '',
		error: 0,
		errorText: ''
	};

	if ( OptInt(iPersonID) == undefined )
	{
		oMetric.error = 1;
		oMetric.errorText = 'Не задан ID сотрудника';
		return oMetric;
	}

	sStatus = 'assigned';
	sCndtn = " and $elem/status = "+ XQueryLiteral( sStatus );

	iQualAssignments = ArrayCount( XQuery( "for $elem in qualification_assignments where $elem/person_id = "+ iPersonID + sCndtn + " return $elem" ) );
	iQualAssignmentsAwardCount = ArrayCount( XQuery( "for $elem in qualification_assignments where $elem/person_id = "+ iPersonID + sCndtn + " and $elem/is_reward = true() return $elem" ) );
	iQualAssignmentsiBadgesCount = ArrayCount( XQuery( "for $elem in qualification_assignments where $elem/person_id = "+ iPersonID + sCndtn + " and $elem/is_reward = false() return $elem" ) );
	catLevel = ArrayOptFirstElem(XQuery("for $elem in levels where some $person in collaborators satisfies ($person/id = "+ iPersonID +" and $elem/id = $person/level_id) return $elem"));

	if ( iQualAssignments > 0 || catLevel != undefined ) 
	{
		oMetric.iAwards = iQualAssignments;
		oMetric.iAward = iQualAssignmentsAwardCount;
		oMetric.iBadges = iQualAssignmentsiBadgesCount;
		oMetric.sLevel = catLevel.name.Value;
	}
	else
	{
		oMetric.error = 1;
		oMetric.errorText = "Данные отсутствуют";
	}

	return oMetric;
}

/**
 * @typedef {Object} oPersonTransactions
 * @property {bigint} id
 * @property {string} date
 * @property {number} amount
 * @property {string} amount_string
 * @property {string} currency
 * @property {string} comment
 * @property {string} person_id
 * @property {string} person_fullname
 * @property {string} person_img
 * @property {string} account_id
 * @property {string} account_name
 * @property {string} direction
 * @property {string} code
 * @property {number} income
 * @property {number} expense
*/
/**
 * @typedef {Object} WTPersonTransactions
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPersonTransactions[]} transactions – Массив объектов с данными по транзакциям сотрудника.
*/
/**
 * @function GetPersonTransactions
 * @memberof Websoft.WT.Game
 * @description Получение списка транзакций сотрудника.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {string} sCurrency - Валюта счета, по которому проводились транзакции.
 * @param {number} iDirection - Приход/Расход (1/2 или 3, если и те, и те нужны).
 * @param {boolean} isTimeShow - Показывать время в датах.
 * @param {boolean} isShowComment - Показывать комментарий к транзакции.
 * @param {number} sImgSize - Размер картинки получателя/отправителя.
 * @param {number} sObjects - Строка id объектов, связанных с транзакцией.
 * @param {boolean} bReturnAll - Возвращать все транзакции по всем счетам/сотрудникам (учитывается только sLinkType и sObjects).
 * @param {string} sLinkType - Выбор объекта для поиска (счет/сотрудник).
 * @param {bigint[]} aAccountIDs - Массив ID счетов
 * @param {string} sReturnData - Указание, какие поля будет возвращать выборка (Все поля / Указанные поля)
 * @param {string[]} arrFields - Массив возвращаемых полей
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {WTPersonTransactions}
*/
function GetPersonTransactions( iPersonID, sCurrency, iDirection, isTimeShow, isShowComment, sImgSize, sObjects, bReturnAll, sLinkType, aAccountIDs, sReturnData, arrFields, oCollectionParams)
{
	var oRes = tools.get_code_library_result_object();
	oRes.transactions = [];
	oRes.paging = oCollectionParams.paging;
	oRes.data = {};
	
	try
	{
		iPersonID = OptInt( iPersonID );
	}
	catch( err ){ iPersonID = undefined }

	try
	{
		if ( IsEmptyValue(sCurrency) )
			throw "";
	}
	catch(e) { sCurrency = "" }

	try
	{
		isTimeShow = tools_web.is_true( isTimeShow );
	}
	catch(e) { isTimeShow = false }

	try
	{
		if ( IsEmptyValue(sImgSize) )
			throw "";
	}
	catch(e) { sImgSize = "200" }

	try
	{
		if ( IsEmptyValue(sObjects) )
			throw "";
	}
	catch(e) { sObjects == "" }

	try
	{
		bReturnAll = tools_web.is_true( bReturnAll );
	}
	catch(e) { bReturnAll = false }

	try
	{
		if ( IsEmptyValue(sLinkType) )
			throw "";
	}
	catch(e) { sLinkType = "collaborator" }

	try
	{
		if( !IsArray( aAccountIDs ) )
		{
			throw "error";
		}
	}
	catch( err ){ aAccountIDs = new Array() }

	try
	{
		if( IsEmptyValue(sReturnData) )
		{
			throw "error";
		}
	}
	catch( err ){ sReturnData = "all" }

	try
	{
		if( !IsArray( arrFields ) || ArrayOptFirstElem(arrFields) == undefined )
		{
			throw "error";
		}
	}
	catch( err ){ arrFields = tools_web.parse_multiple_parameter( "id;date;amount;amount_string;currency;comment;person_id;person_fullname;person_img" ); }

	try
	{
		if( IsEmptyValue(oCollectionParams.FILTER) )
		{
			throw "error";
		}
		var sFilter = String( oCollectionParams.FILTER );
	}
	catch( err ) { sFilter = "" }

	try
	{
		if( IsEmptyValue(oCollectionParams.fulltext) )
		{
			throw "error";
		}
		var sSearch = String( oCollectionParams.fulltext );
	}
	catch( err ) { sSearch = ""; }

	var xarrTransactions = new Array();
	var conds = new Array();

	if(sFilter != "")
	{
		conds.push( Trim(sFilter) );
	}
	

	if ( IsArray(oCollectionParams.filters) )
	{
		for ( oFilter in oCollectionParams.filters )
		{
			if ( oFilter.type == 'search' )
			{
				if ( oFilter.value != '' )
				{
					sSearch = oFilter.value;
				}
			}
			else if(oFilter.type == 'select')
			{
				switch(oFilter.id)
				{
					case "direction":
					{
						conds.push("$elem/direction = " + oFilter.value);
					}
				}
			}
			else
			{
				switch(oFilter.type)
				{
					case "date":
					{
						paramValueFrom = oFilter.HasProperty("value_from") ? DateNewTime(ParseDate(oFilter.value_from)) : null;
						paramValueTo = oFilter.HasProperty("value_to") ? DateNewTime(ParseDate(oFilter.value_to), 23, 59, 59) : null;
						break;
					}
				}
				
				switch(oFilter.id)
				{
					case "date":
					{
						if(paramValueFrom != null && paramValueTo != null)
						{
							conds.push( "($elem/date >= " + XQueryLiteral(paramValueFrom) + " and $elem/date <= " + XQueryLiteral(paramValueTo) + ")");
						}
						else if(paramValueFrom != null)
						{
							conds.push( "$elem/date >= " + XQueryLiteral(paramValueFrom));
						}
						else if(paramValueTo != null)
						{
							conds.push( "$elem/date <= " + XQueryLiteral(paramValueTo));
						}
						break;
					}
				}
			}
		}
	}

	if( sSearch != "" )
	{
		// conds.push( "doc-contains( $elem/id, 'wt_data', " + XQueryLiteral( sSearch ) + " )" );
		conds.push(tools.create_search_condition(sSearch, "account"));
	}
	
	if( bReturnAll )
	{
		switch (sLinkType) {
			case "collaborator":
				if( sObjects != "" )
					conds.push( "MatchSome($elem/object_id, (" + sObjects + "))" );

				if( iPersonID == undefined )
					xarrTransactions = tools.xquery( "for $elem in transactions " + ( ArrayOptFirstElem( conds ) != undefined ? ( "where " + ArrayMerge( conds, "This", " and " ) ) : "" ) + " order by $elem/date descending return $elem" );
				else
					xarrTransactions = tools.xquery( "for $elem in transactions where some $account in accounts satisfies ($account/object_id = "+ iPersonID + ( ArrayOptFirstElem( conds ) != undefined ? ( " and " + ArrayMerge( conds, "This", " and " ) ) : "" ) + " and $elem/account_id = $account/id ) order by $elem/date descending return $elem" );

				break;
			case "account":
				if( sObjects != "" )
					conds.push( "MatchSome($elem/object_id, (" + sObjects + "))" );

				if( ArrayOptFirstElem( aAccountIDs ) == undefined )
					xarrTransactions = tools.xquery( "for $elem in transactions " + ( ArrayOptFirstElem( conds ) != undefined ? ( "where " + ArrayMerge( conds, "This", " and " ) ) : "" ) + "order by $elem/date descending return $elem" );
				else
					xarrTransactions = tools.xquery( "for $elem in transactions where some $account in accounts satisfies ( MatchSome($account/id, (" + ArrayMerge( aAccountIDs, "This", "," ) + "))" + ( ArrayOptFirstElem( conds ) != undefined ? ( " and " + ArrayMerge( conds, "This", " and " ) ) : "" ) + " and $elem/account_id = $account/id ) order by $elem/date descending return $elem" );

				break;
		}
	}
	else
	{
		switch (sLinkType) {
			case "collaborator":
				if ( iPersonID == undefined )
				{
					oRes.error = 503;
					oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
					return oRes;
				}

				iDirection = OptInt( iDirection, 1 );
				// sCndtnDirection = ( iDirection < 3 ) ? "and $elem/direction = "+ iDirection : "";
				if(iDirection < 3)
					conds.push( "$elem/direction = " + iDirection );
				// sObjectIds = (sObjects != "") ? " and MatchSome($elem/object_id, (" + sObjects + "))" : "";
				if(sObjects != "")
					conds.push( "MatchSome($elem/object_id, (" + sObjects + "))" );

				if(sCurrency != "")
					conds.push( "$account/currency_type_id = "+ XQueryLiteral( sCurrency ) );

				xarrPersonTransactions = tools.xquery
				( "for $elem in transactions where some $account in accounts satisfies ($account/object_id = "+ iPersonID + ( ArrayOptFirstElem( conds ) != undefined ? ( " and " + ArrayMerge( conds, "This", " and " ) ) : "" ) + " and $elem/account_id = $account/id) order by $elem/date descending return $elem" );

				xarrPersonThanksTransactions = ( sCurrency == "thanks" ) ? tools.xquery( "for $elem in transactions where some $account in accounts satisfies ($elem/person_id = "+ iPersonID + ( ArrayOptFirstElem( conds ) != undefined ? ( " and " + ArrayMerge( conds, "This", " and " ) ) : "" ) + " and $elem/account_id = $account/id ) order by $elem/date descending return $elem" ) : [];

				xarrTransactions = ArrayUnion( xarrPersonTransactions, xarrPersonThanksTransactions );
				break;
			case "account":
				if( ArrayOptFirstElem( aAccountIDs ) == undefined )
				{
					oRes.error = 503;
					oRes.errorText = "{ text: 'Object not found.', param_name: 'aAccountIDs' }";
					return oRes;
				}

				if( OptInt( iDirection, 1 ) < 3 )
					conds.push( "$elem/direction = "+ OptInt( iDirection, 1 ) );

				if( sObjects != "" )
					conds.push( "MatchSome($elem/object_id, (" + sObjects + "))" );

				xarrTransactions = tools.xquery( "for $elem in transactions where some $account in accounts satisfies ( MatchSome($account/id, (" + ArrayMerge( aAccountIDs, "This", "," ) + "))" +  ( ArrayOptFirstElem( conds ) != undefined ? ( " and " + ArrayMerge( conds, "This", " and " ) ) : "" ) + " and $elem/account_id = $account/id ) order by $elem/date descending return $elem" );
				break;
		}
	}
	
	for(sFieldName in oCollectionParams.distincts)
	{
		oRes.data.distincts.SetProperty(sFieldName, []);
		switch(sFieldName)
		{
			case "direction":
			{
				oRes.data.distincts.direction = [
					{name:"Приход", value: 1},
					{name:"Расход", value: 2}
				];
				break;
			}
		}
	}
	
	oPagSortRes = tools.call_code_library_method( "libMain", "select_page_sort_params", [ xarrTransactions, oCollectionParams.paging, oCollectionParams.sort ] );
	xarrTransactions = oPagSortRes.oResult;
	oRes.paging = oPagSortRes.oPaging;
	
	for ( transaction in xarrTransactions )
	{
		iTransaction = OptInt( transaction.id.Value );
		if ( iTransaction == undefined ) { continue; }

		obj = {
			id: iTransaction,
			date: "",
			amount: "",
			currency: "",
			comment: "",
			person_id: "",
			person_fullname: "",
			person_img: "",
			account_id: "",
			account_name: "",
			direction: "",
			code: "",
			income: "",
			expense: ""
		};

		switch (sReturnData) 
		{
			case "all":
				sComment = "";
				sCompetence = "";
				sFinalComment = "";
				sAdditionalText = "";

				if ( isShowComment )
				{
					dTransaction = tools.open_doc( iTransaction )
					if ( dTransaction != undefined )
					{
						teTransaction = dTransaction.TopElem;
						sComment = ( teTransaction.comment.HasValue ) ? teTransaction.comment.Value : "";
						
						if ( sCurrency == "thanks" )
						{
							sAdditionalText = ( teTransaction.direction.Value == 2 ) ? "Вы передали благодарность" : "Вы получили благодарность";
							
							if ( transaction.person_fullname.HasValue ) 
							{ 
								sAdditionalText += ( ( teTransaction.direction.Value == 2 ) ? " сотруднику " : " от сотрудника " ) + transaction.person_fullname.Value + ".";
							}
							else 
							{ 
								sAdditionalText += ".";
							}
							if ( teTransaction.object_type.HasValue && teTransaction.object_type.Value == "competence" && teTransaction.object_name.HasValue )
							{
								sCompetence = " По компетенции: " + teTransaction.object_name.Value + ".";
							}
						}
						else
						{
							sAdditionalText = "";
						}
						sComment = ( sCompetence != "" ) ? " Комментарий: " + sComment + "." : sComment;
						sFinalComment = sAdditionalText + sCompetence + sComment;
					}
				}
				
				oAccount = transaction.account_id.OptForeignElem;

				obj.date = ( transaction.date.HasValue ) ? StrDate( transaction.date.Value, isTimeShow ) : "";
				obj.amount = transaction.amount.Value;
				obj.amount_string = ( transaction.direction.Value == 2 ? "-" : "+") + StrReal(transaction.amount.Value, 2);
				obj.currency = ( oAccount != undefined ) ? get_currency_name ( oAccount.currency_type_id ) : "";
				obj.comment = sFinalComment;
				obj.person_id = transaction.person_id.Value;
				obj.person_fullname = transaction.person_fullname.Value;
				obj.person_img = tools_web.get_object_source_url( "person", obj.person_id, sImgSize );
				obj.account_id = transaction.account_id.Value;
				obj.account_name = ( oAccount != undefined ) ? oAccount.name.Value : "";
				obj.direction = ( transaction.direction.Value == 2 ) ? "Списание" : "Начисление";
				obj.code = transaction.code.Value;
				obj.income = ( transaction.direction.Value == 2 ) ? "" : transaction.amount.Value;
				obj.expense = ( transaction.direction.Value == 2 ) ? transaction.amount.Value : "";
				break;
			case "selected":
				for(_field in arrFields)
				{
					switch (_field) 
					{
						case "date":
							obj.SetProperty("date", ( transaction.date.HasValue  ? StrDate( transaction.date.Value, isTimeShow ) : "" ) );
							break;
						case "amount_string":
							obj.SetProperty("amount_string", ( transaction.direction.Value == 2 ? "-" : "+") + StrReal(transaction.amount.Value, 2) );
							break;
						case "currency":
							oAccount = transaction.account_id.OptForeignElem;
							obj.SetProperty("currency", oAccount != undefined ? get_currency_name ( oAccount.currency_type_id ) : "" );
							break;
						case "comment":
							sComment = "";
							sCompetence = "";
							sFinalComment = "";
							sAdditionalText = "";

							if ( isShowComment )
							{
								dTransaction = tools.open_doc( iTransaction )
								if ( dTransaction != undefined )
								{
									teTransaction = dTransaction.TopElem;
									sComment = ( teTransaction.comment.HasValue ) ? teTransaction.comment.Value : "";
									
									if ( sCurrency == "thanks" )
									{
										sAdditionalText = ( teTransaction.direction.Value == 2 ) ? "Вы передали благодарность" : "Вы получили благодарность";
										
										if ( transaction.person_fullname.HasValue ) 
										{ 
											sAdditionalText += ( ( teTransaction.direction.Value == 2 ) ? " сотруднику " : " от сотрудника " ) + transaction.person_fullname.Value + ".";
										}
										else 
										{ 
											sAdditionalText += ".";
										}
										if ( teTransaction.object_type.HasValue && teTransaction.object_type.Value == "competence" && teTransaction.object_name.HasValue )
										{
											sCompetence = " По компетенции: " + teTransaction.object_name.Value + ".";
										}
									}
									else
									{
										sAdditionalText = "";
									}
									sComment = ( sCompetence != "" ) ? " Комментарий: " + sComment + "." : sComment;
									sFinalComment = sAdditionalText + sCompetence + sComment;
								}
							}
							obj.SetProperty( "comment", sFinalComment );
							break;
						case "person_img":
							obj.SetProperty( "person_img", tools_web.get_object_source_url( "person", obj.person_id, sImgSize ) );
							break;
						case "account_name":
							oAccount = transaction.account_id.OptForeignElem;
							obj.SetProperty( "account_name", ( oAccount != undefined ? oAccount.name.Value : "" ) );
							break;
						case "direction":
							obj.SetProperty( "direction", ( transaction.direction.Value == 2 ? "Списание" : "Начисление" ) );
							break;
						case "income":
							obj.SetProperty( "income", ( transaction.direction.Value == 2 ? "" : transaction.ammount ) );
							break;
						case "expense":
							obj.SetProperty( "expense", ( transaction.direction.Value == 2 ? transaction.ammount : "" ) );
							break;
						default:
							if( transaction.ChildExists( _field ) )
								obj.SetProperty( _field, RValue( transaction.Child( _field ) ) );
							break;
					}
				}
				break;
		}
		oRes.transactions.push( obj );
	}

	return oRes;
}
/**
 * @function GetPersonThanks
 * @memberof Websoft.WT.Game
 * @description Получение списка благодарностей сотрудника.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {number} iDirection - Получено - 1/Послано -2.
 * @param {boolean} isTimeShow - Показывать время в датах.
 * @param {boolean} isShowComment - Показывать комментарий к транзакции.
 * @param {number} sImgSize - Размер картинки получателя/отправителя.
 * @returns {WTPersonTransactions}
*/

function GetPersonThanks( iPersonID, iDirection, isTimeShow, isShowComment, sImgSize )
{
	var oRes = tools.get_code_library_result_object();
	oRes.transactions = [];

	if ( ( iPersonID = OptInt( iPersonID ) ) == undefined )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}

	try
	{
		if ( sCurrency == null || sCurrency == undefined || Trim( sCurrency ) == '' )
			throw '';
	}
	catch(e) { sCurrency = "thanks" }

	try
	{
		isTimeShow = tools_web.is_true( isTimeShow );
	}
	catch(e) { isTimeShow = false }

	try
	{
		if ( sImgSize == null || sImgSize == undefined || Trim( sImgSize ) == '' )
			throw '';
	}
	catch(e) { sImgSize = "200" }

	iDirection = OptInt( iDirection, 1 );	
	switch(iDirection)
	{
		case 1:
		{
			var curPersonAccountsIDs = ArrayExtract(XQuery("for $elem in accounts where $elem/currency_type_id = 'thanks' and $elem/object_type='collaborator' and $elem/object_id=" + iPersonID + " return $elem/Fields('id')"), "id");
			
			var xarrPersonTransactions = ArraySelectAll(XQuery( "for $elem in transactions where MatchSome($elem/account_id, (" + ArrayMerge(curPersonAccountsIDs, "This", ",") + ")) order by $elem/date descending return $elem/Fields('id','date','amount','person_id','person_fullname','account_id')" ));
			break;
		}
		case 2:
		{
			
			var xarrPersonTransactions = ArraySelectAll(XQuery( "for $elem in transactions where some $account in accounts satisfies ($account/currency_type_id = 'thanks' and $elem/object_type='collaborator' and $elem/account_id = $account/id ) and $elem/person_id=" + iPersonID + " order by $elem/date descending return $elem/Fields('id','date','amount','person_id','person_fullname','account_id')" ));
			var dAccount
			for ( transaction in xarrPersonTransactions )
			{
				dAccount = tools.open_doc( transaction.account_id )
				transaction.person_id = dAccount.TopElem.object_id;
				transaction.person_fullname = dAccount.TopElem.object_name;
			}
			break;
		}
	}
	
	for ( transaction in xarrPersonTransactions )
	{      
		sComment = "";
		
		iTransaction = OptInt( transaction.id.Value );
		if ( iTransaction == undefined ) { continue; }
		if ( isShowComment )
		{
			dTransaction = tools.open_doc( iTransaction )
			if ( dTransaction != undefined )
			{
				teTransaction = dTransaction.TopElem;
				sComment = ( teTransaction.comment.HasValue ) ? teTransaction.comment.Value : "";
			}
		}

		obj = {};
		obj.id = iTransaction;
		obj.date = ( transaction.date.HasValue ) ? StrDate( transaction.date.Value, isTimeShow ) : "";
		obj.amount = transaction.amount.Value;
		obj.currency = 'thanks';
		obj.comment = sComment;
		obj.person_id = transaction.person_id.Value;
		obj.person_fullname = transaction.person_fullname.Value;
		obj.person_img = tools_web.get_object_source_url( 'person', obj.person_id, sImgSize );
		
		oRes.transactions.push( obj );
	}
	
	
	return oRes;
}

function get_bonus_shop_currency_type()
{
	var sBonus = null;
	try
	{
		var curContext = CurRequest.Session.Env.GetOptProperty("curContext");
	}
	catch(e)
	{
		curContext = undefined;
	}
	
	if(curContext != undefined )
	{
		var CONFIG = ArrayOptFindByKey(curContext, "CONFIG", "name");
		if(CONFIG != undefined)
		{
			if(CONFIG.value_str != "" && DataType(CONFIG.value) == 'object')
			{
				sBonus = CONFIG.value.GetOptProperty("sBonusShopCurrencyType", null)
			}
		}
	}

	if(sBonus != null && sBonus != "")
		return sBonus;
	
	var libParam = tools.get_params_code_library('libGame');
	
	sBonus = libParam.GetOptProperty("sBonusShopCurrencyType", null);
	if(sBonus != null && sBonus != "")
		return sBonus;
		
	sBonus = libParam.GetOptProperty("BonusShopCurrencyType", null);
	if(sBonus != null && sBonus != "")
		return sBonus;
	
	return "bonus";
}

function createGoodRequest( iPersonId, oGood , iOrderId)
{
	var oCreateGoodRequestRes = {request_id: null, error:1, errorText: ""};
			
	try
	{			
		docRequestType = OpenDoc( UrlFromDocID( oGood.request_type_id ) ).TopElem;
		docNewRequest = OpenNewDoc( 'x-local://wtv/wtv_request.xmd' );
		tools.common_filling( 'request_type', docNewRequest.TopElem, oGood.request_type_id, docRequestType );
		
		docNewRequest.TopElem.person_id = iPersonId;
		tools.common_filling( 'collaborator', docNewRequest.TopElem, iPersonId );
		if ( docNewRequest.TopElem.type.HasValue )
		{
			curObject = OpenDoc( UrlFromDocID( oGood.id ) ).TopElem;
			docNewRequest.TopElem.object_id = oGood.id;
			tools.object_filling( docNewRequest.TopElem.type, docNewRequest.TopElem, oGood.id );
			tools.admin_access_copying( null, docNewRequest.TopElem, oGood.id );
			oGood.SetProperty("order_id",iOrderId)
			docNewRequest.TopElem.workflow_state_name=tools.object_to_text(oGood,"json")
		}
		docNewRequest.BindToDb( DefaultDb );
		try
		{
			docNewRequest.Save();
		}
		catch ( err )
		{
			if (  ! IsCancelError( err ) )
				throw err;
		}


		bWorkflowCreateBreak = false;
		sWorkflowActionMessage = '';
		try
		{
			if ( docNewRequest.TopElem.view.workflow_action_result.HasValue )
			{
				bWorkflowCreateBreak = docNewRequest.TopElem.view.workflow_action_result.Object.GetOptProperty( 'workflow_create_break' ) == true;
				sWorkflowActionMessage = docNewRequest.TopElem.view.workflow_action_result.Object.GetOptProperty( 'workflow_action_message' , '' );
			}
		}
		catch ( err )
		{
		}
		
		if (!bWorkflowCreateBreak)
		{
			oCreateGoodRequestRes.error=0;
		}
		oCreateGoodRequestRes.request_id=docNewRequest.DocID
		oCreateGoodRequestRes.errorText=sWorkflowActionMessage;
	}
	catch ( err )
	{
		oCreateGoodRequestRes.errorText=err
	}
	return oCreateGoodRequestRes;

}

/**
 * @function DeleteOrder
 * @memberof Websoft.WT.Game
 * @author EO
 * @description Удаление заказа
 * @param {bigint} iOrderID - ID заказа
 * @returns {WTLPEFormResult}
*/
function DeleteOrder( iOrderID, SCOPE_WVARS )
{
	var oRes = tools.get_code_library_result_object();
	try
	{
		iOrderID = OptInt( iOrderID );
		if ( iOrderID == undefined )
		{
			throw "Не  передан ID заказа"
		}

		docOrder = tools.open_doc( iOrderID );
		if ( docOrder == undefined )
		{
			throw "Неверно передан ID заказа, id: " + iOrderID;
		}

		if ( docOrder.TopElem.Name != 'order' )
		{
			throw "Переданный id: " + iOrderID + " не является id заказа";
		}

if ( docOrder.TopElem.status == "cancel" )
		{
			oRes.action_result = {command: "alert", msg: "Нельзя отменить ранее отмененный заказ"};
			return oRes;
		}
		if ( docOrder.TopElem.status == "paid" && tools_web.is_true ( SCOPE_WVARS.GetOptProperty( "bNoPayed", false ) ))
		{
			oRes.action_result = {command: "alert", msg: "Нельзя отменить уже оплаченный заказ"};
			return oRes;
		}

		var bHasRequests = false;
		arrGoodWithRequests=ArraySelect(docOrder.TopElem.goods,'This.request_id.HasValue')
		for ( itemGood in arrGoodWithRequests )
		{
			fldRequest=itemGood.request_id.OptForeignElem
			if (fldRequest != undefined && (fldRequest.status_id == 'pay' || fldRequest.status_id == 'close'))
			{
				bHasRequests = true
				break;
			}
		}
		if ( !bHasRequests )
		{
			for ( itemGood in arrGoodWithRequests )
			{
				fldRequest=itemGood.request_id.OptForeignElem
				if (fldRequest != undefined && fldRequest.status_id == 'active')
				{
					docRequest = tools.open_doc( fldRequest.id );
					if ( docRequest == undefined )
					{
						continue;
					}
					docRequest.TopElem.status_id='ignore'
					docRequest.Save()
				}
			}
			
			sAddMsg = "";
			if(docOrder.TopElem.status == 'paid')
			{
				var sReqOrderDebetTarnsaction = "for $elem in transactions where $elem/direction = 2 and object_type = 'order' and $elem/object_id = " + iOrderID + "  order by $elem/date descending return $elem";
				var xmOrderDebetTarnsaction = ArrayOptFirstElem(tools.xquery(sReqOrderDebetTarnsaction));
				if(xmOrderDebetTarnsaction != undefined)
				{
					tools.delete_transaction( xmOrderDebetTarnsaction.id.Value );
					sAddMsg += "Средства возвращены на счет."
				}
				else
				{
					sAddMsg += "<br>Не обнаружена транзакция оплаты по заказу. Средства на счет не возвращены."
				}
			}
			
			for ( fldGoodElem in docOrder.TopElem.goods )
			{
				iGoodInstanceCounter = 0;
				for ( fldGoodInstanceElem in fldGoodElem.good_instances )
					if ( tools.clear_good_instance_status( fldGoodInstanceElem.PrimaryKey ) )
						iGoodInstanceCounter++;

				fldGoodElem.good_instances.Clear();
			}
			
			if ( tools_web.is_true ( SCOPE_WVARS.GetOptProperty( "bNoDelete", false ) ) )
			{
				docOrder.TopElem.status = 'cancel';
				docOrder.Save();
			}
			else
			{
				DeleteDoc( UrlFromDocID( iOrderID ) );
			}
			oRes.action_result = { command: "close_form", msg: "Заказ успешно удален. " + sAddMsg, confirm_result: { command: "reload_page" } };
		}
		else
		{
			oRes.action_result = {command: "alert", msg: "Нельзя удалять заказы, по которым есть закрытые заявки"};
		}
	}
	catch( err )
	{
		alert("ERROR: libGame: DeleteOrder: " + err)
		oRes.error = 1;
	 	oRes.action_result = {command: "alert", msg: "ERROR: DeleteOrder:\r\n" + err};
	}
	
	return oRes;
}

/**
 * @typedef {Object} PrizesList
 * @property {integer} id – ID записи
 * @property {string} name – Наименование приза
 * @property {string} img_url - URL изображения приза 
 * @property {string} currency_type_id - ID валюты
 * @property {string} currency_type_name - Наименование валюты
 * @property {real} cost -- Стоимость
 */
/**
 * @typedef {Object} ReturnPrizes
 * @property {integer} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {PrizesList[]} result – Список призов.
*/
/**
 * @function GetPrizes
 * @memberof Websoft.WT.Game
 * @author EO, AZ
 * @description Получение списка призов (всех/из корзины сотрудника)
 * @param {bigint} iBasketID - ID корзины
 * @param {string} sType - что будет возвращать выборка: all_prizes(все призы)/basket_prizes(призы в корзине сотрудника)
 * @param {oSimpleFilterElem[]} arrFilters - набор фильтров
 * @param {oSort} oSort - Информация из рантайма о сортировке
 * @param {oPaging} oPaging - Информация из рантайма о пейджинге
 * @param {bigint} iPersonID - ID текущего пользователя
 * @param {boolean} bEnded - Показывать закончившиеся товары
 * @param {bigint} iRoleID - ID категории товаров
 * @returns {ReturnPrizes}
*/
function GetPrizes( iBasketID, sType, arrDistinct, arrFilters, oSort, oPaging, iPersonID, bEnded, iRoleID )
{
	function check_and_add_good_to_result( iGoodID, sShopCurrencyTypeID, arrBasketgoods, sType, iCurrentGoodNumber, iPersonID, xarrInstances )
	{
		docGood = tools.open_doc( iGoodID );
		if ( docGood == undefined )
		{
			return;
		}

		if ( ! tools_web.check_access( docGood.TopElem, iPersonID ) )
		{
			return;
		}

		oGoodCost = ArrayOptFind( docGood.TopElem.costs, "This.currency_type_id == sShopCurrencyTypeID" );
		if ( oGoodCost != undefined )
		{
			rGoodSum = 0.0;
			if ( oGoodCost.sum.HasValue )
			{
				rGoodSum = oGoodCost.sum.Value;
			}
			
			var sCurrencyTypeName = oGoodCost.currency_type_id.ForeignElem.short_name.Value
			
			var xmSatausName = docGood.TopElem.state_id.OptForeignElem;
			oAddedGood = {
				id: docGood.TopElem.id.Value,
				name: docGood.TopElem.name.Value,
				img_url: ( docGood != undefined ? tools_web.get_object_source_url( 'resource', docGood.TopElem.resource_id.Value ) : "" ),
				status: docGood.TopElem.state_id.Value,
				status_name: (xmSatausName == undefined ? "" : xmSatausName.name.Value),
				is_cant_chose: docGood.TopElem.is_cant_chose.Value, 
				currency_type_id: sShopCurrencyTypeID,
				currency_type_name: sCurrencyTypeName,
				cost: rGoodSum,
				desc: docGood.TopElem.desc.Value,
				ended: ( ArrayOptFind( xarrInstances, "This.good_id == docGood.DocID" ) == undefined ),
				number_in_stock: ( ArrayCount( ArraySelect( xarrInstances, "This.good_id == docGood.DocID" ) ) )
			};

			if ( sType == "all_prizes" || sType == "active_prizes" || sType == "selectable_prizes " )
			{
				if ( ArrayOptFind( arrBasketgoods, "docGood.TopElem.id.Value == This.good_id.Value" ) != undefined )
				{
					oAddedGood.status = "in_basket";
					oAddedGood.status_name = "В корзине";
				}
				else
				{
					oAddedGood.status = "none";
				}
				oAddedGood.number = 1;
				oAddedGood.sum = rGoodSum;
			}
			else
			{
				oAddedGood.number = iCurrentGoodNumber;
				oAddedGood.sum = rGoodSum * iCurrentGoodNumber;
			}

			arrResult.push( oAddedGood );
		}
	}

	try
	{
		iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
		oRes.error = 'Передан некорректный ID текущего пользователя';
		oRes.errorText = err;
		return oRes;
	}

	try
	{
		var oRes = tools.get_code_library_result_object();
		oRes.paging = oPaging;
		arrResult = [];
		oRes.result = arrResult;

		sShopCurrencyTypeID = get_bonus_shop_currency_type();

		var sCurrencyName = lists.currency_types.GetOptChildByKey(sShopCurrencyTypeID).name.Value;
		var sCurrencyShortName = lists.currency_types.GetOptChildByKey(sShopCurrencyTypeID).short_name.Value;

		var itemGood;

		var arrRolesIDs = new Array();
		var xarrRoles = new Array();

		switch( sType )
		{
			case "all_prizes":
			case "active_prizes":
			case "selectable_prizes":
				var arrCond = [];
				arrCond.push("contains($elem/cost_desc," + XQueryLiteral(sCurrencyShortName) + ")");

				switch( sType )
				{
					case "selectable_prizes":
						arrCond.push("$elem/is_cant_chose != true()");
					case "active_prizes":
						arrCond.push("$elem/state_id = 'active'");
				}

				if ( iRoleID != undefined )
				{
					arrCond.push( "MatchSome( $elem/role_id, ( " + iRoleID + " ) )" );
				}

				xarrGoods = tools.xquery( "for $elem in goods where " + ArrayMerge( arrCond, "This", " and " ) + " order by $elem/code, $elem/name return $elem" );

				if ( ! bEnded )
				{
					arrCond.push( "$elem/delivery_type = 'instance'" );
					arrCond.push( "some $good_instance in good_instances satisfies( $elem/id = $good_instance/good_id and $good_instance/status = 'in_stock' )" );

					xarrInstanceGoods = tools.xquery( "for $elem in goods where " + ArrayMerge( arrCond, "This", " and " ) + " order by $elem/id return $elem" );
					xarrGoods = ArrayIntersect( xarrGoods, xarrInstanceGoods );

					xarrInstances = tools.xquery( "for $elem in good_instances where $elem/status = 'in_stock' and MatchSome( $elem/good_id, ( " + ArrayMerge( xarrInstanceGoods, "This.id", "," ) + " ) ) order by $elem/id return $elem" );
				}
				else
				{
					xarrInstances = tools.xquery( "for $elem in good_instances where $elem/status = 'in_stock' and MatchSome( $elem/good_id, ( " + ArrayMerge( xarrGoods, "This.id", "," ) + " ) ) order by $elem/id return $elem" );
				}

				docBasket = tools.open_doc( iBasketID ); 
				if ( docBasket != undefined && docBasket.TopElem.Name != "basket" )
				{
					docBasket = undefined;
				}

				for ( itemGood in xarrGoods )
				{
					check_and_add_good_to_result( itemGood.id.Value, sShopCurrencyTypeID, ( ( docBasket != undefined ) ? docBasket.TopElem.goods : [] ), sType, 1, iPersonID, xarrInstances );
				}
				break;

			case "basket_prizes":

				var arrCond = [];

				if ( iBasketID == undefined )
				{
					throw "Не передан ID корзины"
				}

				docBasket = tools.open_doc( iBasketID ); 
				if ( docBasket == undefined )
				{
					throw "Не удалось открыть карточку документа корзины с id: " + iBasketID;
				}

				if ( docBasket.TopElem.Name != "basket" )
				{
						throw "Переданный id: " + iBasketID + "не является id корзины";
				}

				if ( docBasket.TopElem.currency_type_id != sShopCurrencyTypeID )
				{
					throw "Валюта корзины: '" + docBasket.TopElem.currency_type_id + "' не совпадает с валютой магазина: '" + sShopCurrencyTypeID + "'";
				}

				if ( ! bEnded )
				{
					arrCond.push( "$elem/delivery_type = 'instance'" );
					arrCond.push( "MatchSome( $elem/id, ( " + ArrayMerge( docBasket.TopElem.goods, 'This.good_id', ',' ) + " ) )" );
					arrCond.push( "some $good_instance in good_instances satisfies( $elem/id = $good_instance/good_id and $good_instance/status = 'in_stock' )" );

					xarrInstanceGoods = tools.xquery( "for $elem in goods where " + ArrayMerge( arrCond, "This", " and " ) + " order by $elem/id return $elem" );
					xarrGoods = ArrayIntersect( xarrGoods, xarrInstanceGoods );

					xarrInstances = tools.xquery( "for $elem in good_instances where $elem/status = 'in_stock' and MatchSome( $elem/good_id, ( " + ArrayMerge( xarrInstanceGoods, "This.id", "," ) + " ) ) order by $elem/id return $elem" );

					for ( itemGood in xarrGoods )
					{
						check_and_add_good_to_result( itemGood.id.Value, sShopCurrencyTypeID, [], sType, docBasket.TopElem.goods.GetOptChildByKey( itemGood.id ).number.Value, iPersonID, xarrInstances );
					}
				}
				else
				{
					xarrInstances = tools.xquery( "for $elem in good_instances where $elem/status = 'in_stock' and MatchSome( $elem/good_id, ( " + ArrayMerge( docBasket.TopElem.goods, "This.good_id", "," ) + " ) ) order by $elem/id return $elem" );

					arrCond.push( "MatchSome( $elem/id, ( " + ArrayMerge( docBasket.TopElem.goods, 'This.good_id', ',' ) + " ) )" );
					if ( iRoleID != undefined )
					{
						arrCond.push( "MatchSome( $elem/role_id, ( " + iRoleID + " ) )" );
					}

					xarrGoods = tools.xquery( "for $elem in goods where " + ArrayMerge( arrCond, "This", " and " ) + " order by $elem/id return $elem" );

					for ( itemGood in docBasket.TopElem.goods )
					{
						if ( ArrayOptFind( xarrGoods, 'This.id == itemGood.good_id' ) == undefined )
						{
							continue;
						}

						check_and_add_good_to_result( itemGood.good_id.Value, sShopCurrencyTypeID, [], sType, itemGood.number.Value, iPersonID, xarrInstances );
					}
				}

				break;
		}

		arrRolesIDs = ArrayExtractKeys( xarrGoods, 'role_id' );

		arrRolesIDs2 = [];

		for ( roles in arrRolesIDs )
		{
			for ( role in roles )
			{
				arrRolesIDs2.push( role )
			}
		}

		xarrRoles = XQuery( "for $elem in roles where MatchSome( $elem/id, ( " + ArrayMerge( arrRolesIDs2, 'This', ',' ) + " ) ) return $elem" );

	//фильтрация
		if ( arrFilters != undefined && arrFilters != null && IsArray(arrFilters) )
		{
			for ( oFilter in arrFilters )
			{
				conds = [];
				if ( oFilter.type == 'search' )
				{
					if ( oFilter.value != '' )
					{
						conds.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )" );

						arrGoodsID = ArrayExtract( arrResult, "This.id") ;
						sGoodsID = ArrayMerge(arrGoodsID, "This", ",");
						conds.push( "MatchSome( $elem/id, (" + sGoodsID + ") )" );
					}
					sConds = ArrayOptFirstElem(conds) == undefined ? "" : " where " + ArrayMerge( conds, "This", " and " );
					xarrGoodsByFilters = tools.xquery( "for $elem in goods " + sConds + " return $elem" );

					arrResult = ArrayIntersect( arrResult, xarrGoodsByFilters, "This.id", "This.id.Value" );
				}

				if ( oFilter.id == 'score' )
				{
					iValueFrom = oFilter.HasProperty("value_from") ? OptInt(oFilter.value_from) : undefined;
					iValueTo = oFilter.HasProperty("value_to") ? OptInt(oFilter.value_to) : undefined;
					
					sScoreCond = '';
					if ( iValueFrom != undefined )
					{
						sScoreCond = 'This.cost >= ' + iValueFrom;
					}
	
					if ( iValueTo != undefined)
					{
						if ( sScoreCond != '' )
						{
							sScoreCond += ' && '
						}
						sScoreCond += 'This.cost <= ' + iValueTo;
					}
	
					if ( sScoreCond != '' )
					{
						arrResult = ArraySelect ( arrResult, sScoreCond )
					}
				}

				if ( oFilter.id == 'role_id' )
				{
					if ( oFilter.value != '' )
					{
						conds.push( "MatchSome( $elem/role_id, (" + ArrayMerge( oFilter.value, "This.value", "," ) + ") )" );
						sConds = ArrayOptFirstElem(conds) == undefined ? "" : " where " + ArrayMerge( conds, "This", " and " );
						xarrGoodsByFilters = tools.xquery( "for $elem in goods " + sConds + " return $elem" );
						arrResult = ArrayIntersect( arrResult, xarrGoodsByFilters, "This.id", "This.id.Value" );
					}
				}
			}
		}

	//сортировка
		if ( ObjectType( oSort ) == 'JsObject' && oSort.FIELD != null && oSort.FIELD != undefined && oSort.FIELD != "" )
		{
			switch ( oSort.FIELD )
			{
				case "name":
					arrResult = ArraySort ( arrResult, 'This.name', StrUpperCase(oSort.DIRECTION) == "ASC" ? '+' : '-' );
					break;
			}
		}

	//пейджинг
		if ( ObjectType( oPaging ) == 'JsObject' && oPaging.SIZE != null )
		{
			oPaging.MANUAL = true;
			oPaging.TOTAL = ArrayCount( arrResult );
			oRes.paging = oPaging;
			arrResult = ArrayRange( arrResult, OptInt( oPaging.INDEX, 0 ) * oPaging.SIZE, oPaging.SIZE );
		}

		if ( ArrayOptFirstElem( arrDistinct ) != undefined )
		{
			oRes.data.SetProperty( "distincts", {} );
			for ( sFieldName in arrDistinct )
			{
				oRes.data.distincts.SetProperty( sFieldName, [] );
				switch( sFieldName )
				{
					case 'role_id':
					{
						if ( ArrayCount( xarrRoles ) == 0 )
						{
							oRes.data.distincts.role_id.push( { name: 'Без категории', value: '' } );
						}
	
						for ( role in xarrRoles )
						{
							oRes.data.distincts.role_id.push( { name: role.name.Value, value: role.id.Value } );
						}
						break;
					}
				}
			}
		}

		oRes.result = arrResult;
	}
	catch( err )
	{
		oRes.error = 1;
		oRes.errorText = "ERROR: GetPrizes:\r\n" + err;
	}

	return oRes;
}


/**
 * @function CreateOrderFromBasket
 * @memberof Websoft.WT.Game
 * @author EO
 * @description Cоздание заказ из корзины
 * @param {bigint} iBasketID - ID корзины
 * @property {string} sCommand - Текущий режим удаленного действия
 * @property {string} sFormFields - JSON-строка с возвратом из формы УД
 * @property {string} sCurCurrencyTypeID - ID текущей валюты. Если формирование заказа идет не с портала, а из приложения
 * @returns {WTLPEFormResult}
*/
function CreateOrderFromBasket( iBasketID, sCommand, sFormFields, sCurCurrencyTypeID )
{

	function get_basket_goods_list( docBasket, sShopCurrencyTypeID )
	{
		arrGoods = [];
		for ( itemBasketGood in docBasket.TopElem.goods )
		{
			docGood = tools.open_doc( itemBasketGood.good_id.Value ); 
			if ( docGood == undefined )
			{
				continue;
			}

			oGoodCost = ArrayOptFind( docGood.TopElem.costs, "This.currency_type_id ==  sShopCurrencyTypeID" );
			if ( oGoodCost != undefined )
			{
				iRequestType=null;
				oGoodType=docGood.TopElem.good_type_id.OptForeignElem
				if (oGoodType!=undefined)
				{
					oRequestType=oGoodType.request_type_id.OptForeignElem
					if (oRequestType!=undefined)
					{
						iRequestType=oGoodType.request_type_id.Value
					}
				}
				rGoodSum = 0;
				if ( oGoodCost.sum.HasValue )
				{
					rGoodSum = oGoodCost.sum.Value;
				}

				arrGoods.push( {
					id: docGood.TopElem.id.Value,
					name: docGood.TopElem.name.Value,
					currency_type_id: sShopCurrencyTypeID,
					quantity: itemBasketGood.number.Value,
					sum: rGoodSum,
					reserved_date: itemBasketGood.reserved_date.Value,
					request_type_id: iRequestType,
					delivery_type: docGood.TopElem.delivery_type.Value,
					limit: oGoodCost.limit.Value
				} );
			}
		}

		return arrGoods;
	}


	function get_goods_total_cost( arrGoods )
	{
		rSumGoodsTotalCost = 0;
		rSumGoodsTotalCost = ArraySum( arrGoods, "OptInt(This.quantity, 1) * OptInt(This.sum, 0)" );

		return rSumGoodsTotalCost;
	}


	function get_account_balance_by_basket( docBasket, sShopCurrencyTypeID )
	{
		try
		{
			iPersonId = OptInt( docBasket.TopElem.person_id.Value );
		}
		catch( err )
		{
			return 0.0;
		}

		if ( iPersonId == undefined )
		{
			return 0.0;
		}

		catAccount = ArrayOptFirstElem( tools.xquery( "for $elem in accounts where $elem/object_id = " + XQueryLiteral( docBasket.TopElem.person_id ) + " and $elem/object_type = 'collaborator' and $elem/status = 'active' and $elem/currency_type_id = '"+ sShopCurrencyTypeID +"' return $elem" ) );

		return ( catAccount != undefined ? catAccount.balance : 0.0 );
	}


	function get_personid_by_docBasket( docBasket )
	{
		try
		{
			iPersonId = OptInt( docBasket.TopElem.person_id.Value );
		}
		catch( err )
		{
			iPersonId = undefined;
		}
		return iPersonId;
	}

	function check_good_limit( iPersonId, oGood, newOrderID, iCurrencyTypeID )
	{
		var oRes = {
			"error" : 0,
			"errorText" : "" };

		var iGoodLimit = null;
		if ( oGood.delivery_type == "cost" || oGood.delivery_type == "instance")
		{
			if( OptReal( oGood.limit) != undefined )
			{
				iGoodLimit = OptReal( oGood.limit, null );
			}
		}

		if( iGoodLimit != null )
		{
			var iCurValue = 0;
			if( oGood.delivery_type == "cost" )
			{
				iCurValue += OptReal( oGood.sum );
			}
			else if( oGood.delivery_type == "instance" )
			{
				iCurValue += OptReal( oGood.quantity );
			}
			xarrRequests = tools.xquery("for $elem in orders where $elem/person_id = " + iPersonId + " and $elem/status != 'cancel' return $elem/id" );
			for(_request in xarrRequests)
			{
				if( OptInt( _request.id ) == OptInt( newOrderID, 0 ) )
					continue;

				docPayedRequest = tools.open_doc(_request.id);
				if( docPayedRequest != undefined )
				{
					orderGood = docPayedRequest.TopElem.goods.GetOptChildByKey( oGood.id );
					if ( orderGood != undefined )
					{
						if( oGood.delivery_type == "cost" )
						{
							iCurValue += orderGood.cost;
						}
						else if( oGood.delivery_type == "instance" )
						{
							iCurValue += orderGood.number;
						}
					}
				}
			}
			if(iGoodLimit < iCurValue)
			{
				oRes = {
					"errorText" : "Превышен лимит для заказа " + oGood.name + " в валюте " + get_currency_name( iCurrencyTypeID ) + ".",
					"error" : 1 };
			}
		}

		return oRes;
	}
		
	function create_order_and_clear_basket( iPersonId, docBasket, arrGoods, sComment, sShopCurrencyTypeID )
	{
		var oCreateOrderAndClearBasket = {error: false, errorText: null};
		var arrLinkCreateRequests=[];
		var bSuccess=true
		docNewOrder = OpenNewDoc( 'x-local://wtv/wtv_order.xmd' );
		docNewOrder.BindToDb();
		docNewOrder.TopElem.person_id = iPersonId;
		docNewOrder.TopElem.comment = sComment;
		docNewOrder.TopElem.currency_type_id = sShopCurrencyTypeID;
		docNewOrder.TopElem.code = 'order_' + tools.random_string( 6 );
		docNewOrder.TopElem.formed_date = Date();
		
		for ( oGood in arrGoods )
		{
			child_good = docNewOrder.TopElem.goods.AddChild();
			child_good.good_id = oGood.id;
			child_good.name = oGood.name;
			child_good.number = oGood.quantity;
			child_good.reserved_date = oGood.reserved_date;
			child_good.cost = oGood.sum;
			child_good.delivery_type = oGood.delivery_type;
			if (oGood.request_type_id!=null)
			{
				oNewRequest=createGoodRequest(iPersonId,oGood,docNewOrder.DocID)
				if (oNewRequest.request_id!=null)
				{
					child_good.request_id=oNewRequest.request_id
					arrLinkCreateRequests.push(child_good.request_id)
				}
				if (oNewRequest.error==1)
				{
					bSuccess=false
					oCreateOrderAndClearBasket.errorText=oCreateOrderAndClearBasket.errorText+" "+oNewRequest.errorText;
				}
			}
			else
			{
				oNewRequest = check_good_limit( iPersonId, oGood, docNewOrder.DocID, docNewOrder.TopElem.currency_type_id.Value );
				if (oNewRequest.error==1)
				{
					bSuccess = false;
					oCreateOrderAndClearBasket.errorText = oCreateOrderAndClearBasket.errorText + " " + oNewRequest.errorText;
				}
			}
		}
		
		if (bSuccess)
		{
			docNewOrder.TopElem.name = docBasket.TopElem.person_fullname.Value;
			docNewOrder.Save();

			docBasket.TopElem.goods.Clear()
			docBasket.Save();
		}
		else
		{
			for (iRequestID in arrLinkCreateRequests)
			{
				try
				{
					DeleteDoc(UrlFromDocID(iRequestID))
				}
				catch(ex)
				{
				}
			}
		}
		oCreateOrderAndClearBasket.error=!bSuccess
		return oCreateOrderAndClearBasket
	}

	var oRes = tools.get_code_library_result_object();
	oRes.result = new Object();
	var sShopCurrencyTypeID = null
	try
	{
		if (sCurCurrencyTypeID!=undefined && sCurCurrencyTypeID!=null)
		{
			var fldCurrencyType = lists.currency_types.GetOptChildByKey(sCurCurrencyTypeID)
			if (fldCurrencyType!=undefined)
			{
				sShopCurrencyTypeID = RValue(fldCurrencyType.PrimaryKey)
			}
		}
	}
	catch(ex)
	{
	}
	
	try
	{
		oLngItems = lngs.GetChildByKey( global_settings.settings.default_lng.Value ).items

		if (sShopCurrencyTypeID == null)
		{
		sShopCurrencyTypeID = get_bonus_shop_currency_type();
		}

		docBasket = tools.open_doc( iBasketID );
		if ( docBasket == undefined )
		{
			throw "Неверно передан ID корзины, id: " + iBasketID;
		}

		if ( docBasket.TopElem.Name != 'basket' )
		{
			throw "Переданный id: " + iBasketID + " не является id корзины";
		}

		if ( docBasket.TopElem.currency_type_id != sShopCurrencyTypeID )
		{
			throw "Валюта корзины: '" + docBasket.TopElem.currency_type_id + "' не совпадает с валютой магазина: '" + sShopCurrencyTypeID + "'";
		}

		var arrGoods = get_basket_goods_list( docBasket, sShopCurrencyTypeID );
		if ( ArrayOptFirstElem(arrGoods) == undefined )
		{
			oRes.result = {command: "alert", msg: "В корзине отсутствуют товары."};
			return oRes;
		}
		var iHasBalance = get_account_balance_by_basket( docBasket, sShopCurrencyTypeID )
		var iRequireCost = get_goods_total_cost( arrGoods )
		if ( iRequireCost > iHasBalance )
		{
			oRes.result = {command: "alert", msg: "Недостаточно средств на счету! Требуется " + iRequireCost + " " + get_currency_short_name( sShopCurrencyTypeID ) };
			return oRes;
		}
		
		if ( sCommand == 'eval' )
		{
			oRes.result = { 	command: "display_form",
			title: tools_web.get_web_const( "dc_write_comment", oLngItems ),
			header: tools_web.get_web_const( "c_comment", oLngItems ),
			form_fields: [] };
			oRes.result.form_fields.push( {
				name: "comment",
				label: tools_web.get_web_const( "c_comment", oLngItems ),
				type: "text",
				value: "",
				mandatory: true,
				validation: "nonempty"
			} );
		}

		if ( sCommand == 'submit_form' )
		{
			arrFormFields = null;
			if ( sFormFields != "" )
			{
				try
				{
					arrFormFields = ParseJson( sFormFields );
				}
				catch (err)
				{
					throw 'Ошибка парсинга содержимого полей формы\r\n' + err;
				}

				var sComment = ArrayOptFind( arrFormFields, "This.name == 'comment'" ).value;
				if ( sComment == undefined )
				{
					sComment = "";
				}

				iPersonId = get_personid_by_docBasket( docBasket );
				if ( iPersonId == undefined )
				{
					throw "У корзины с id: " + iBasketID + " не указан сотрудник";
				}

				oCreateResult=create_order_and_clear_basket( iPersonId, docBasket, arrGoods, sComment, sShopCurrencyTypeID );
				if (oCreateResult.error)
				{
					oRes.result = {command: "alert", msg: oCreateResult.errorText};
				}
				else
				{
					oRes.result = { command: "close_form", msg: "Заказ успешно создан", confirm_result: { command: "reload_page" } };
				}
			}
		}
	}
	catch( err )
	{
		oRes.error = 1;
		oRes.errorText = "ERROR: CreateOrderFromBasket:\r\n" + err;
	}
	
	return oRes;
}


/**
 * @typedef {Object} PersonShopContext
 * @property {number} iBasketID - ID корзины
 * @property {number} iScore: - Сумма накопленных сотрудником баллов по счетам в валюте магазина призов
 * @property {number} iBasketPrizesCount: - Количество призов в корзине сотрудника
 * @property {number} iBasketPrizesSum: - Общая стоимость призов в корзине сотрудника
 * @property {number} iActiveOrdersCount: - Количество актуальных заказов сотрудника (сформированных или согласованных)
 * @property {number} iNonCancelledOrdersCount: - Количество неотмененных заказов сотрудника
 */
/**
 * @typedef {Object} ReturnPersonShopContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {PersonShopContext} context – Контекст сотрудника по магазину призов
*/
/**
 * @function GetPersonShopContext
 * @memberof Websoft.WT.Game
 * @author EO
 * @description Получение контекста сотрудника по магазину призов.
 * @param {bigint} iPersonID - ID сотрудника.
 * @returns {ReturnPersonShopContext}
*/
function GetPersonShopContext( iPersonID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = new Object;

	try
	{
		iPersonID = OptInt( iPersonID );
		if ( iPersonID == undefined )
		{
			throw "Не передан ID сотрудника";
		}

		var oContext = {
			iBasketID: 0,
			iScore: 0,
			iBasketPrizesCount: 0,
			iBasketPrizesSum: 0,
			iActiveOrdersCount: 0,
			iNonCancelledOrdersCount: 0,
			bActiveShop: true,
			sCurrencyName: '',
			sCurrencyAbbreviated: '',
			sCommentClose: '',
		};

		bActiveShop = true;
		sCommentClose = '';

		catWebsoftShopApp = ArrayOptFirstElem( XQuery( "for $elem in applications where $elem/code = 'websoft_shop' return $elem/Fields( 'id' )" ) );
		if ( catWebsoftShopApp != undefined )
		{
			docWebsoftShopApp = tools.open_doc( catWebsoftShopApp.id );
			if ( docWebsoftShopApp != undefined )
			{
				wActive = docWebsoftShopApp.TopElem.wvars.GetOptChildByKey( 'active' );
				wCommentClose = docWebsoftShopApp.TopElem.wvars.GetOptChildByKey( 'comment_close' );
				
				if ( wActive != undefined )
					oContext.bActiveShop = tools_web.is_true( wActive.value );

				if ( wCommentClose != undefined )
					oContext.sCommentClose = wCommentClose.value;
			}
		}

		sBasketCurrency = get_bonus_shop_currency_type();

		oCurrencyType = ArrayOptFind( lists.currency_types, 'This.id == sBasketCurrency' );
		if ( oCurrencyType != undefined )
		{
			oContext.sCurrencyName = oCurrencyType.name;
			oContext.sCurrencyAbbreviated = oCurrencyType.short_name;
		}

	//Определяем: ID корзины
		sCondition = ( sBasketCurrency != "" ) ? ' and $elem/currency_type_id = ' + XQueryLiteral( sBasketCurrency ) : "";
		xarrPersonBaskets = tools.xquery( 'for $elem in baskets where $elem/person_id = ' + iPersonID + sCondition +' return $elem/id' );
		if ( xarrPersonBaskets != undefined)
		{
			catPersonBaskets = ArrayOptFirstElem( xarrPersonBaskets );
			if ( catPersonBaskets != undefined )
			{
				oContext.iBasketID = catPersonBaskets.id;
			}
		}

	//Определяем: Сумма накопленных сотрудником баллов по счетам в валюте магазина призов
		xarrAccounts = tools.xquery( "for $elem in accounts where $elem/object_id = " + iPersonID + " and $elem/object_type = 'collaborator' and $elem/status = 'active' and $elem/currency_type_id = "+ XQueryLiteral(sBasketCurrency) +" return $elem" );
		if ( xarrAccounts != undefined)
		{
			arrScores = ArrayExtract(xarrAccounts, 'balance');
			if ( ArrayOptFirstElem( arrScores ) != undefined )
			{
				oContext.iScore = StrSignedInt(ArraySum(arrScores, 'This'));
			}
		}

	//Определяем: Количество призов в корзине сотрудника
		if ( oContext.iBasketID != 0 )
		{
			docBasket =  tools.open_doc( oContext.iBasketID );
			if ( docBasket != undefined )
			{
				// oContext.iBasketPrizesCount = ArrayCount( docBasket.TopElem.goods ) ;
 				var iGoodCount, docGood, curCost;
				for(itemGoog in docBasket.TopElem.goods)
				{
					iGoodCount = OptInt(itemGoog.number.Value, 0);
					docGood = tools.open_doc(itemGoog.good_id.Value);
					if(docGood != undefined)
					{
						curCost = docGood.TopElem.costs.GetOptChildByKey(docBasket.TopElem.currency_type_id.Value);
						if(curCost != undefined)
						{
							oContext.iBasketPrizesSum += OptInt(curCost.sum.Value, 0) * iGoodCount;
						}
					}
					oGoodCost = ArrayOptFind( docGood.TopElem.costs, "This.currency_type_id == docBasket.TopElem.currency_type_id.Value" );
						
					if(oGoodCost != undefined){
						oContext.iBasketPrizesCount += iGoodCount;
					}
				}
			}
		}

	//Определяем: Количество актуальных заказов сотрудника (сформированных или согласованных)
		xarrActOrders = tools.xquery( "for $elem in orders where $elem/person_id = " + iPersonID + " and MatchSome($elem/status, ('formed','agreed')) and $elem/currency_type_id = "+ XQueryLiteral(sBasketCurrency) +" return $elem" );
		if ( xarrActOrders != undefined)
		{
			oContext.iActiveOrdersCount = ArrayCount( xarrActOrders );
		}

	//Определяем: Количество неотмененных заказов сотрудника
		xarrNonCancelledOrders = tools.xquery( "for $elem in orders where $elem/person_id = " + iPersonID + " and $elem/status != 'cancel' and $elem/currency_type_id = "+ XQueryLiteral(sBasketCurrency) +" return $elem" );
		if ( xarrNonCancelledOrders != undefined)
		{
			oContext.iNonCancelledOrdersCount = ArrayCount( xarrNonCancelledOrders );
		}
		oContext.iBasketPrizesCount = StrSignedInt(oContext.iBasketPrizesCount)
		oContext.iBasketPrizesSum = StrSignedInt(oContext.iBasketPrizesSum)

		oRes.context = oContext;
	}
	catch( err )
	{
		oRes.error = 1;
		oRes.errorText = err;
	}

	return oRes;
}

/**
 * @typedef {Object} GoodShopContext
 * @property {boolean} bIsGoodInBasket - Товар находится в корзине магазина
 * @property {number} iBasketID - ID корзины сотрудника в магазине
 * @property {number} rCost - Цена товара в магазине призов
 */
/**
 * @typedef {Object} ReturnGoodShopContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {GoodShopContext} context – Контекст сотрудника по магазину призов
*/
/**
 * @function GetGoodInShopContext
 * @memberof Websoft.WT.Game
 * @author BG
 * @description Получение контекста товара в магазине призов.
 * @param {bigint} iGoodID - ID товара.
 * @param {bigint} iPersonID - ID сотрудника.
 * @returns {ReturnGoodShopContext}
*/
function GetGoodInShopContext( iGoodID, teGood, iPersonID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = new Object;

	try
	{
		iPersonID = OptInt( iPersonID );
		if ( iPersonID == undefined )
		{
			throw "Не передан ID сотрудника";
		}
		
		try
		{
			var sCatalog = teGood.Name;
			iGoodID = teGood.Doc.DocID;
		}
		catch(e)
		{
			teGood = tools.open_doc(iGoodID).TopElem;
			sCatalog = teGood.Name;
		}
		
		if(sCatalog != 'good')
			throw StrReplace('Текущий объект не является товаром: [{PARAM1}]', '{PARAM1}', sCatalog);

		var oContext = {
			bIsGoodInBasket: false,
			iBasketID: 0,
			rCost: 0.0,
		};

		var sShopCurrency = get_bonus_shop_currency_type();
		
		//Определяем корзину
		sCondition = ( sShopCurrency != "" ) ? ' and $elem/currency_type_id = ' + XQueryLiteral( sShopCurrency ) : "";
		catPersonBaskets = ArrayOptFirstElem(tools.xquery( 'for $elem in baskets where $elem/person_id = ' + iPersonID + sCondition +' return $elem/id' ));
		if ( catPersonBaskets != undefined )
		{
			oContext.iBasketID = catPersonBaskets.id.Value;
			teBasket = tools.open_doc(catPersonBaskets.id.Value).TopElem;
			oContext.bIsGoodInBasket = ( ArrayOptFindByKey(teBasket.goods, iGoodID, "good_id") != undefined );
		}		
		
		var curGoodCurrencyCost = ArrayOptFindByKey(teGood.costs, sShopCurrency, "currency_type_id");
		if ( curGoodCurrencyCost != undefined )
		{
			oContext.rCost = curGoodCurrencyCost.sum.Value;
		}
		
		oRes.context = oContext;
	}
	catch( err )
	{
		oRes.error = 1;
		oRes.errorText = err;
	}

	return oRes;
}

/**
 * @typedef {Object} oAppGameObjectsContext
 * @property {int} active_badges_count – количество активных бейджей
 * @property {int} badges_count – количество бейджей
 * @property {int} active_rewards_count – количество активных наград
 * @property {int} rewards_count – количество наград
*/
/**
 * @function GetAppGameObjectsContext
 * @memberof Websoft.WT.Game
 * @author AKh
 * @description рассчет объектной метрики объектов приложения подразделение/организация/группа.
 * @param {string} sTypeObject - тип объекта subdivision/org/group
 * @param {bigint} iObjectIDParam - ID объекта, для которого определяются метрики
 * @returns {oAppGameObjectsContext}
*/
function GetAppGameObjectsContext( sTypeObject, iObjectIDParam )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {};

	switch(sTypeObject)
	{
		case "subdivision":
			xqQualificationAssignments = tools.xquery("for $elem in qualification_assignments where some $coll in collaborators satisfies ($elem/person_id = $coll/id and $coll/position_parent_id = " + iObjectIDParam + " and $coll/is_dismiss = false()) return $elem");
			break;
		case "org":
			xqQualificationAssignments = tools.xquery("for $elem in qualification_assignments where some $coll in collaborators satisfies ($elem/person_id = $coll/id and $coll/org_id = " + iObjectIDParam + " and $coll/is_dismiss = false()) return $elem");
			break;
		case "group":
			xqColls = tools.xquery("for $gc in group_collaborators where some $coll in collaborators satisfies ($gc/collaborator_id = $coll/id and $gc/group_id = " + iObjectIDParam + " and $coll/is_dismiss = false()) return $gc");
			xqQualificationAssignments = tools.xquery("for $elem in qualification_assignments where MatchSome($elem/person_id, (" + ArrayMerge(xqColls, 'This.collaborator_id', ',') + ")) return $elem");
			break;
	}

	oRes.context.SetProperty("active_badges_count", ArrayCount(ArraySelect(xqQualificationAssignments, 'This.status == "assigned" && !tools_web.is_true(This.is_reward)')));
	oRes.context.SetProperty("badges_count", ArrayCount(ArraySelect(xqQualificationAssignments, '!tools_web.is_true(This.is_reward)')));
	oRes.context.SetProperty("active_rewards_count", ArrayCount(ArraySelect(xqQualificationAssignments, 'This.status == "assigned" && tools_web.is_true(This.is_reward)')));
	oRes.context.SetProperty("rewards_count", ArrayCount(ArraySelect(xqQualificationAssignments, 'tools_web.is_true(This.is_reward)')));

	return oRes;
}

/**
 * @function ChangeOrderGoods
 * @deprecated 2022.3 -- В функции реализована интерфейсная часть УД. Код перенесен в файл УД.
 * @memberof Websoft.WT.Game
 * @author EO
 * @description Изменение списка товаров в заказе
 * @param {bigint} iOrderID - ID заказа
 * @property {string} sCommand - Текущий режим удаленного действия
 * @property {string} sFormFields - JSON-строка с возвратом из формы УД
 * @returns {WTLPEFormResult}
*/
function ChangeOrderGoods( iOrderID, sCommand, sFormFields )
{
	try
	{
		var oRes = tools.get_code_library_result_object();

		sShopCurrencyTypeID = get_bonus_shop_currency_type();

		if( iOrderID == undefined )
		{
			throw "Не  передан ID заказа"
		}
		docOrder = tools.open_doc( iOrderID );
		if ( docOrder == undefined )
		{
			throw "Неверно передан ID заказа, id: " + iOrderID;
		}
		if ( docOrder.TopElem.Name != 'order' )
		{
			throw "Переданный id: " + iOrderID + " не является id заказа";
		}

		if ( sCommand == 'eval' )
		{
			oRes.result = {
				command: "display_form",
				title: ( "Список товаров в заказе" ),
				header: "Выберите товары в заказе",
				form_fields: []
			};

			arrGoods = [];
			arrEditGoods=ArraySelect(docOrder.TopElem.goods,"This.request_id.HasValue==false")
			arrDisabledGoods=ArraySelect(docOrder.TopElem.goods,"This.request_id.HasValue")
			iIndex=0
			
			for ( oGood in arrDisabledGoods)
			{
				oRes.result.form_fields.push( { name: "good_title", type: "paragraph", value: (iIndex+1)+'. <a href="'+tools_web.get_mode_clean_url( null, oGood.request_id) +'" target="_blank">'+HtmlEncode(oGood.name)+'</a>. Количество:'+oGood.number.Value } );
				oRes.result.form_fields.push({ name: "id_"+iIndex, type: "hidden", value: oGood.good_id.Value })
				oRes.result.form_fields.push({ name: "quantity_"+iIndex, type: "hidden", value: oGood.number.Value })
				oRes.result.form_fields.push({ name: "request_id_"+iIndex, type: "hidden", value: oGood.request_id.Value })
				iIndex++;
			}
			oRes.result.form_fields.push({ name: "disabled_goods", type: "hidden", value: RValue(iIndex) })
			for ( oGood in  arrEditGoods)
			arrGoods.push([
				{
					name: 'good_id',
					value: oGood.good_id.Value,
				},
				{
					name: 'good_quantity',
					value: oGood.number.Value,
				},
				{
					name: 'request_id',
					value: oGood.request_id.Value,
				}
			]);
			var sAddQuery=ArrayMerge(arrDisabledGoods,"This.good_id"," and $elem/id!=")
			sAddQuery=(sAddQuery!=""?" and $elem/id!="+sAddQuery:"")
			var sCurrencyName = lists.currency_types.GetOptChildByKey(sShopCurrencyTypeID).name.Value;
			var sCurrencyShortName = lists.currency_types.GetOptChildByKey(sShopCurrencyTypeID).short_name.Value;
			oRes.result.form_fields.push( {
				name: "order_goods",
				label: "Товары в заказе",
				type: "array",
				array: 
				[
					{
						name: "good_id",
						label: "Товар",
						type: "foreign_elem",
						mandatory: true,
						validation: "nonempty",
						catalog: "good",
						query_qual: "contains($elem/cost_desc," + XQueryLiteral(sCurrencyShortName) + ")"+sAddQuery,
						multiple: false,
						column: 1
					},
					{
						name: "good_quantity",
						label: "Количество",
						type: "integer",
						mandatory: true,
						validation: "nonempty",
						column: 2
					},
					{
						name: "request_id",
 						label: "ID",
 						type: "hidden",
 					}
				],
				value: arrGoods
			} );
		}

		if ( sCommand == 'submit_form' )
		{
			arrFormFields = null;
			if ( sFormFields != "" )
			{
				try
				{
					arrFormFields = ParseJson( sFormFields );
				}
				catch (err)
				{
					throw 'Ошибка парсинга содержимого полей формы\r\n' + err;
				}
				arrGoods = [];
				iIndex=0
				arrDisabledGoods=ArraySelect(arrFormFields,"This.name!="+CodeLiteral('order_goods'))
				fldDisabledGoods=ArrayOptFindByKey(arrDisabledGoods,"disabled_goods","name")
				if (fldDisabledGoods!=undefined)
				{
					iIndex=OptInt(fldDisabledGoods.value,0)
					ordergoodItem=['id','quantity','request_id']
					for (i=0;i<iIndex;i++)
					{
						oGood = {};
						for ( propItem in ordergoodItem )
						{
							fldProperty=ArrayOptFindByKey(arrDisabledGoods,propItem+'_'+i,"name")
							if (fldProperty!=undefined)
							{
								oGood.SetProperty(propItem,( OptInt(fldProperty.value) != undefined ? OptInt(fldProperty.value) : 0 ))
							}
						}

						if ( oGood.id != 0 && oGood.quantity > 0 )
						{
							arrGoods.push( oGood );
						}
					}
				}

				for(ffItem in arrFormFields)
				{
					if ( ffItem.name != 'order_goods' )
					{
						continue;
					}
					
					for ( ordergoodItem in ffItem.value )
					{
						oGood = {};
						for ( propItem in ordergoodItem )
						{
							if ( propItem.name == 'good_id' )
							{
								oGood.id = ( OptInt(propItem.value) != undefined ? OptInt(propItem.value) : 0 );
							}
							if ( propItem.name == 'good_quantity' )
							{
								oGood.quantity = ( OptInt(propItem.value) != undefined ? OptInt(propItem.value) : 0 );
							}
							if ( propItem.name == 'request_id' )
							{
								oGood.request_id = ( OptInt(propItem.value) != undefined ? OptInt(propItem.value) : 0 );
							}
						}

						if ( oGood.id != 0 && oGood.quantity > 0 )
						{
							arrGoods.push( oGood );
						}
					}

				}
				arrLinkCreateRequests=[];
				bSuccess=true
				sErrorText=""
				docOrder.TopElem.goods.Clear();
				for ( oGood in arrGoods )
				{
					docGood = tools.open_doc( oGood.id );
					if ( docGood == undefined || docGood.TopElem.Name != 'good' )
					{
						continue;
					}
					oCost = ArrayOptFind( docGood.TopElem.costs, "This.currency_type_id.Value == sShopCurrencyTypeID" );
					if ( oCost == undefined ) { continue }

					child_good = docOrder.TopElem.goods.AddChild();
					child_good.good_id = oGood.id;
					child_good.name = docGood.TopElem.name;
					child_good.number = oGood.quantity;
					child_good.reserved_date = CurDate;
					child_good.cost = oCost.sum.HasValue ? oCost.sum.Value : "";
					if (oGood.request_id!=0)
					{
						child_good.request_id=oGood.request_id
					}
					if (!child_good.request_id.HasValue)
					{
						oGoodType=docGood.TopElem.good_type_id.OptForeignElem
						if (oGoodType!=undefined)
						{
							oRequestType=oGoodType.request_type_id.OptForeignElem
							if (oRequestType!=undefined)
							{
								oDummyObject={id: docGood.TopElem.id.Value,
									name: docGood.TopElem.name.Value,
									currency_type_id: sShopCurrencyTypeID,
									quantity: child_good.number.Value,
									sum: child_good.cost.Value,
									reserved_date: child_good.reserved_date.Value,
									request_type_id: oRequestType.id.Value}
								oNewRequest=createGoodRequest(docOrder.TopElem.person_id,oDummyObject,iOrderID)
								if (oNewRequest.request_id!=null)
								{
									child_good.request_id=oNewRequest.request_id
									arrLinkCreateRequests.push(child_good.request_id)
								}
								if (oNewRequest.error==1)
								{
									bSuccess=false
									sErrorText=sErrorText+" "+oNewRequest.errorText;
								}
							}
						}
					}
					 
				}
				var xarrAccounts = tools.xquery( "for $elem in accounts where $elem/object_id = " + docOrder.TopElem.person_id + " and $elem/object_type = 'collaborator' and $elem/status = 'active' and $elem/currency_type_id = "+ XQueryLiteral( sShopCurrencyTypeID ) +" return $elem" );
				var iSumAccount = ArraySum( xarrAccounts, "OptInt( This.balance, 0 )" );
				if( iSumAccount < docOrder.TopElem.sum )
				{
					oRes.result = {command: "alert", msg: "Сумма заказа превышает доступное количество баллов."};
					return oRes;
				}
				if ( ArrayOptFirstElem(docOrder.TopElem.goods) == undefined )
				{
					DeleteDoc( UrlFromDocID( iOrderID ) );
				}
				else
				{
					if (bSuccess)
					{
						docOrder.Save();
					}
					else
					{
						for (iRequestID in arrLinkCreateRequests)
						{
							try
							{
								DeleteDoc( UrlFromDocID(iRequestID))
							}
							catch(ex)
							{
							}
						}
					}
				}
				
				if (bSuccess)
				{
					oRes.result = { command: "close_form", msg: "Заказ успешно изменен", confirm_result: { command: "reload_page" } };
				}
				else
				{
					oRes.result = {command: "alert", msg: "Не удалось изменить заказ: "+sErrorText};
				}
			}
		}
	}
	catch( err )
	{
		oRes.error = 1;
	 	oRes.result = {command: "alert", msg: "ERROR: ChangeOrderGoods:\r\n" + err};
	}

	return oRes;
}

/**
 * @typedef {Object} oFFGood
 * @property {bigint} id
 * @property {int} quantity
*/
/**
 * @typedef {Object} WTSetOrderGoodsResult
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {string} result – Текст результата завершения функции .
*/
/**
 * @function SetOrderGoods
 * @memberof Websoft.WT.Game
 * @author BG
 * @description Изменение списка товаров в заказе
 * @param {bigint} iOrderID - ID заказа
 * @param {oFFGood[]} arrGoods - Коллекция товаров в заказе
 * @returns {WTSetOrderGoodsResult}
*/
function SetOrderGoods( iOrderID, arrGoods )
{
	try
	{
		var oRes = tools.get_code_library_result_object();
		oRes.result = "";

		sShopCurrencyTypeID = get_bonus_shop_currency_type();

		if( iOrderID == undefined )
		{
			oRes.result = "Не передан ID заказа";
			throw "501::Не передан ID заказа"
		}
		docOrder = tools.open_doc( iOrderID );
		if ( docOrder == undefined )
		{
			oRes.result = "Неверно передан ID заказа, id: " + iOrderID;
			throw "501::Неверно передан ID заказа, id: " + iOrderID;
		}
		if ( docOrder.TopElem.Name != 'order' )
		{
			oRes.result = "Переданный id: " + iOrderID + " не является id заказа";
			throw "501::Переданный id: " + iOrderID + " не является id заказа";
		}
		
		if(!IsArray(arrGoods))
		{
			oRes.result = "Переданный id: " + iOrderID + " не является id заказа";
			throw "501::Переданный id: " + iOrderID + " не является id заказа";
		}

		arrLinkCreateRequests=[];
		bSuccess=true
		sErrorText=""
		docOrder.TopElem.goods.Clear();
		for ( oGood in arrGoods )
		{
			docGood = tools.open_doc( oGood.id );
			if ( docGood == undefined || docGood.TopElem.Name != 'good' )
			{
				continue;
			}
			oCost = ArrayOptFind( docGood.TopElem.costs, "This.currency_type_id.Value == " + CodeLiteral(sShopCurrencyTypeID) );
			if ( oCost == undefined ) { continue }

			child_good = docOrder.TopElem.goods.AddChild();
			child_good.good_id = oGood.id;
			child_good.name = docGood.TopElem.name;
			child_good.number = oGood.quantity;
			child_good.reserved_date = CurDate;
			child_good.cost = oCost.sum.HasValue ? oCost.sum.Value : "";
			if (oGood.request_id!=0)
			{
				child_good.request_id=oGood.request_id
			}
			if (!child_good.request_id.HasValue)
			{
				oGoodType=docGood.TopElem.good_type_id.OptForeignElem
				if (oGoodType!=undefined)
				{
					oRequestType=oGoodType.request_type_id.OptForeignElem
					if (oRequestType!=undefined)
					{
						oDummyObject={id: docGood.TopElem.id.Value,
							name: docGood.TopElem.name.Value,
							currency_type_id: sShopCurrencyTypeID,
							quantity: child_good.number.Value,
							sum: child_good.cost.Value,
							reserved_date: child_good.reserved_date.Value,
							request_type_id: oRequestType.id.Value}
						oNewRequest=createGoodRequest(docOrder.TopElem.person_id,oDummyObject,iOrderID)
						if (oNewRequest.request_id!=null)
						{
							child_good.request_id=oNewRequest.request_id
							arrLinkCreateRequests.push(child_good.request_id)
						}
						if (oNewRequest.error==1)
						{
							bSuccess=false
							sErrorText=sErrorText+" "+oNewRequest.errorText;
						}
					}
				}
			}
		}
		var xarrAccounts = tools.xquery( "for $elem in accounts where $elem/object_id = " + docOrder.TopElem.person_id + " and $elem/object_type = 'collaborator' and $elem/status = 'active' and $elem/currency_type_id = "+ XQueryLiteral( sShopCurrencyTypeID ) +" return $elem" );
		var iSumAccount = ArraySum( xarrAccounts, "OptInt( This.balance, 0 )" );

		if( iSumAccount < docOrder.TopElem.sum )
		{
			oRes.result = "Сумма заказа превышает доступное количество баллов";
			throw "503::Сумма заказа превышает доступное количество баллов.";
		}

		if ( ArrayOptFirstElem(docOrder.TopElem.goods) == undefined )
		{
			DeleteDoc( UrlFromDocID( iOrderID ) );
		}
		else
		{
			if (bSuccess)
			{
				docOrder.TopElem.formed_date = Date();
				docOrder.Save();
			}
			else
			{
				for (iRequestID in arrLinkCreateRequests)
				{
					try
					{
						DeleteDoc(UrlFromDocID(iRequestID))
					}
					catch(ex)
					{
					}
				}
				oRes.result = "Не удалось изменить заказ: "+sErrorText;
				throw "501::Не удалось изменить заказ: "+sErrorText
			}
		}
		oRes.result = "Заказ успешно изменен";
	}
	catch( err )
	{
		var oErr = tools.parse_throw_error(err)
		oRes.error = oErr.error;
		oRes.errorText = oErr.errorText;
		alert((oErr.error < 100 ? "ERROR: libGame: ChangeOrderGoods:\r\n" : "") + oErr.errorText)
	}

	return oRes;
}

/**
 * @function AddGoodToBasket
 * @memberof Websoft.WT.TalentPool
 * @author IG
 * @description Добавление в корзину товара/приза
 * @param {integer} iPersonUserID - ID пользователя
 * @param {integer} iBasketID - ID корзины
 * @param {integer} iGoodID - ID товара/приза
 * @returns {WTLPEFormResult}
*/
function AddGoodToBasket(iPersonUserID, iBasketID, iGoodID){
	
	var oRes = tools.get_code_library_result_object();
	oRes.action_result = ({});

	try
	{
		if(iPersonUserID == undefined)
		{
			oRes.error = 502;
			oRes.errorText = "Не задан ID пользователя";
			return oRes;
		}

		iGoodID = OptInt(iGoodID)
		if(iGoodID == undefined)
		{
			oRes.error = 502;
			oRes.errorText = "Некорректный ID товара";
			return oRes;
		}

		docGood = tools.open_doc(iGoodID);
		if(docGood == undefined)
		{
			oRes.error = 502;
			oRes.errorText = "Не удалось добавить товар. Вероятно, указан некорректный ID товара для события Добавить товар в корзину";
			return oRes;
		}

		teGood = docGood.TopElem;
		
		if(tools_web.is_true(teGood.is_cant_chose.Value))
		{
			oRes.action_result = {
				command: "alert",
				msg: "На товар установлен запрет выбора",
			};
			return oRes			
		}
		
		if(teGood.costs == undefined)
		{
			oRes.error = 502;
			oRes.errorText = "Не задана цена у товара ID: " + iGoodID;
			return oRes;
		}

		var curBonusType = get_bonus_shop_currency_type();
		
		iBasketID = OptInt(iBasketID)
		var docBasket = tools.open_doc(iBasketID);
		if(docBasket == undefined)
		{
			docBasket = tools.new_doc_by_name('basket');
			var catPerson = ArrayOptFirstElem(tools.xquery("for $elem in collaborators where $elem/id = " + iPersonUserID + " return $elem"));
			docBasket.TopElem.code = tools.random_string( 5 ) + '#' + catPerson.login.Value;
			
			docBasket.TopElem.name = catPerson.fullname.Value + ' --- ' + curBonusType;
			docBasket.TopElem.person_id = OptInt(iPersonUserID);
			tools.common_filling( 'collaborator', docBasket.TopElem, docBasket.TopElem.person_id);
			docBasket.TopElem.currency_type_id = curBonusType;
			docBasket.BindToDb(DefaultDb)
		}

		var teBasket = docBasket.TopElem;
		
		var oGoodCost = ArrayOptFind( teGood.costs, "This.currency_type_id.Value == '" + teBasket.currency_type_id.Value + "'" );
		if(oGoodCost == undefined)
		{
			oRes.error = 502;
			oRes.errorText = "Типы валют добавляемого товара и корзины не совпадают";
			return oRes;
		}	
		
		var xmGood = ArrayOptFind(teBasket.goods, 'This.good_id == ' + iGoodID)
		
		if(xmGood == undefined)
		{ // товара НЕТ в текущей корзине...добавим
			xmGood = teBasket.goods.AddChild()
			xmGood.good_id = iGoodID;
			xmGood.number = 0;
			xmGood.reserved_date = Date();
			
		}
		
		xmGood.number++ 
		docBasket.Save();
		
		oRes.action_result = {
			command: "alert",
			msg: "Товар добавлен в корзину",
			confirm_result: {
				command: "reload_page"
			}
		};

	}
	catch(err)
	{
		oRes.error = 502;
		oRes.errorText = err;
	}
	
	
	return oRes	
}

/**
 * @typedef {Object} HistoryOrder
 * @property {integer} id – ID записи
 * @property {string} status – Статус заказа
 * @property {string} status_name - Наименование статусак заказа 
 * @property {string} formed_date - Дата формирование
 * @property {string} currency_type_id - ID валюты
 * @property {string} currency_type_name - Наименование валюты
 * @property {real} sum - Сумма заказа
 */
/**
 * @typedef {Object} ReturnHistoryOrders
 * @property {integer} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {HistoryOrder[]} result – Список призов.
*/

/**
 * @function GetHistoryOrders
 * @author IG BG
 * @description Получение списка заказов
 * @param {string} iPersonID - ID текущего пользователя.
 * @param {oCollectionParam} oCollectionParams - Параметры выборки.
 * @returns {ReturnHistoryOrders}
 */
function GetHistoryOrders(iPersonID, oCollectionParams)
{

	var oRes = tools.get_code_library_result_object();
	oRes.orders = [];
	
	var oPaging = oCollectionParams.GetOptProperty("paging");
	oRes.paging = oPaging;

	try
	{
		iPersonID = Int(iPersonID);
	}
	catch (err)
	{
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: 'Invalid param iPersonID.', param_name: 'iPersonID' }";
		return oRes;
	}

	if (oCollectionParams == null || oCollectionParams == "")
	{
		oCollectionParams = new Object;
	}

	var oParams =
	{
		xquery_qual: ("$elem/person_id=" + iPersonID)
	}

	if (get_bonus_shop_currency_type() != undefined)
		oParams.xquery_qual += " and $elem/currency_type_id='" + get_bonus_shop_currency_type() + "'"

		arrDistinct = oCollectionParams.GetOptProperty("distincts", []);
	if (ArrayOptFirstElem(arrDistinct) != undefined)
	{
		oRes.data.SetProperty("distincts", {}
		);

		for (sFieldName in arrDistinct)
		{
			oRes.data.distincts.SetProperty(sFieldName, []);
			switch (sFieldName)
			{
			case "f_status":
				{
					oRes.data.distincts.f_status = [
						{
							name: "Формируется",
							value: "forming"
						},
						{
							name: "Сформирован",
							value: "formed"
						},
						{
							name: "Оплачен",
							value: "paid"
						},
						{
							name: "Согласован",
							value: "agreed"
						},
						{
							name: "Отменен",
							value: "cancel"
						}
					];
					break;
				}
			}
		}
	}

	var arrFilters = oCollectionParams.GetOptProperty("filters", []);

	for (oFilter in arrFilters)
	{

		if (oFilter.type == 'search')
		{
			if (oFilter.value != "")
				oParams.xquery_qual += " and doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral(oFilter.value) + " )";
		}
		else if (oFilter.type == 'select')
		{

			switch (oFilter.id)
			{
			case "f_status":
				{
					if (ArrayOptFind(oFilter.value, "This.value != ''") != undefined)
					{
						oParams.xquery_qual += " and MatchSome( $elem/status, ( " + ArrayMerge(ArraySelect(oFilter.value, "This.value != ''"), "XQueryLiteral(This.value)", ",") + " ) )";
					}
					break;
				}
			}
		}
		else
		{
			switch (oFilter.type)
			{
			case "date":
				{
					paramValueFrom = oFilter.HasProperty("value_from") ? DateNewTime(ParseDate(oFilter.value_from)) : null;
					paramValueTo = oFilter.HasProperty("value_to") ? DateNewTime(ParseDate(oFilter.value_to), 23, 59, 59) : null;
					break;
				}
			case "int":
				{
					paramValueFrom = oFilter.HasProperty("value_from") ? OptInt(oFilter.value_from) : null;
					paramValueTo = oFilter.HasProperty("value_to") ? OptInt(oFilter.value_to) : null;

					if (paramValueFrom != null && paramValueTo != null && paramValueFrom > paramValueTo)
					{
						paramValueFrom = paramValueTo;
						paramValueTo = Int(oFilter.value_from);
					}
					break;
				}
			}

			switch (oFilter.id)
			{
				case "f_formed_date":
					{
						if (paramValueFrom != null && paramValueTo != null)
						{
							oParams.xquery_qual += " and ($elem/formed_date >= " + XQueryLiteral(paramValueFrom) + " and $elem/formed_date <= " + XQueryLiteral(paramValueTo) + ")"
						}
						else if (paramValueFrom != null)
						{
							oParams.xquery_qual += " and $elem/formed_date >= " + XQueryLiteral(paramValueFrom)
						}
						else if (paramValueTo != null)
						{
							oParams.xquery_qual += " and $elem/formed_date <= " + XQueryLiteral(paramValueTo)
						}
						break;
					}
				case "f_sum":
					if (paramValueFrom != null && paramValueTo != null)
					{
						oParams.xquery_qual += " and ($elem/sum >= " + XQueryLiteral(paramValueFrom) + " and $elem/sum <= " + XQueryLiteral(paramValueTo) + ")"
					}
					else if (paramValueFrom != null)
					{
						oParams.xquery_qual += " and $elem/sum >= " + XQueryLiteral(paramValueFrom)
					}
					else if (paramValueTo != null)
					{
						oParams.xquery_qual += " and $elem/sum <= " + XQueryLiteral(paramValueTo)
					}
					break;
			}
		}
	}

	var sCondSort = " order by $elem/formed_date descending";
	var oSort = oCollectionParams.sort;

	if (ObjectType(oSort) == 'JsObject' && oSort.FIELD != null && oSort.FIELD != undefined && oSort.FIELD != "")
	{
		switch (oSort.FIELD)
		{
		case "name":
			sCondSort = " order by $elem/name" + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "");
			break;
		case "status":
			sCondSort = " order by $elem/status" + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "");
			break;
		case "formed_date":
			sCondSort = " order by $elem/formed_date" + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "");
			break;
		case "sum":
			sCondSort = " order by $elem/sum" + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "");
			break;
		default:
			sCondSort = " order by $elem/" + oSort.FIELD + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "");
		}
	}

	var sReqOrders = "for $elem in orders where " + oParams.xquery_qual + sCondSort + " return $elem";
	var xarrOrders = XQuery(sReqOrders);

	var sId,
	orderObjectDoc,
	orderObjectTE,
	oOrderData,
	iOrderSum,
	xmCurrency,
	sCurrencyName,
	xmStatus,
	sStatusName,
	xarrOrderSum
	
	if (oPaging != null && oPaging.SIZE != null)
	{
		oPaging.MANUAL = true;
		oPaging.TOTAL = ArrayCount(xarrOrders);
		oRes.paging = oPaging;
		xarrOrders = ArrayRange(xarrOrders, OptInt(oPaging.INDEX, 0) * oPaging.SIZE, oPaging.SIZE);
	}
	
	for (elemOrders in xarrOrders)
	{

		sId = OptInt(elemOrders.id.Value)

		orderObjectDoc = tools.open_doc(sId)

		if (orderObjectDoc == undefined)
			continue

		orderObjectTE = orderObjectDoc.TopElem

		xmCurrency = orderObjectTE.currency_type_id.OptForeignElem
		sCurrencyName = (xmCurrency != undefined) ? xmCurrency.name.Value : "";
		sCurrencyShortName = (xmCurrency != undefined) ? xmCurrency.short_name.Value : "";

		xmStatus = orderObjectTE.status.OptForeignElem
		sStatusName = (xmStatus != undefined) ? xmStatus.name.Value : "";

		xarrOrderSum = tools.xquery("for $elem in orders where MatchSome($elem/id, (" + XQueryLiteral(sId) + ") ) return $elem/Fields('sum')")
		if (xarrOrderSum == undefined)
			continue;

		oOrderData = ArrayOptFirstElem(xarrOrderSum)
		iOrderSum = oOrderData.sum.Value

		oRes.orders.push({
			"id": sId,
			"status": orderObjectTE.status.Value,
			"status_name": sStatusName,
			"formed_date": orderObjectTE.formed_date.Value,
			"currency_type_id": orderObjectTE.currency_type_id.Value,
			"currency_type_name": sCurrencyName,
			"currency_abbreviated": sCurrencyShortName,
			"sum": oOrderData.sum.Value
		});
	}
	return oRes
}

/**
 * @typedef {Object} ReturnActionResult
 * @property {integer} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {string} result – Сообщение о результате выполнения операции.
*/
/**
 * @function RemoveGoodToOrder
 * @author IG BG
 * @description Удаление товара из корзины
 * @param {number} iBasketIDParam - ID корзины
 * @param {number} iGoodIDParam - ID товара
 * @returns {ReturnActionResult}
*/
function RemoveGoodToOrder(iBasketIDParam, iGoodIDParam){
	
	var oRes = tools.get_code_library_result_object();
	oRes.action_result = "";
	
	var iBasketID = OptInt( iBasketIDParam );
	if(iBasketID == undefined)
		throw 'Invalid param iBasketID: [' + iBasketIDParam + ']'
	
	var iGoodID = OptInt( iGoodIDParam );
	if(iGoodID == undefined)
		throw 'Invalid param iGoodID: [' + iGoodIDParam + ']'
	
	var curBasketObjectDoc = tools.open_doc(iBasketID)
	if(curBasketObjectDoc == undefined)
		throw "Не найдена корзина по указанному ID";
	
	var curGoodObjectDoc = tools.open_doc(iGoodID)
	if(curGoodObjectDoc == undefined)
		throw "Не найден объект товара по указанному ID";
	
	var oGood = ArrayOptFind( curBasketObjectDoc.TopElem.goods, 'This.good_id.Value == ' + iGoodID );
	
	if ( oGood != undefined )
	{
		curBasketObjectDoc.TopElem.goods.DeleteChildByKey(iGoodID);
		curBasketObjectDoc.Save();
		oRes.result = "Товар успешно удален из корзины"
	}
	else
		oRes.result = "Указанный товар в корзине не найден. Обновите содержимое корзины."
	
	return oRes;
}

/**
 * @function editCommentOrders
 * @author IG BG
 * @description Редактирование комментария к заказу
 * @param {number} iOrderIDParam - ID заказа
 * @param {string} sComment - текст комментария
 * @returns {ReturnActionResult}
*/
function ChangeCommentOrders(iOrderIDParam, sComment)
{

	var oRes = tools.get_code_library_result_object();
	oRes.action_result = "";

	var iOrderID = Int(iOrderIDParam);
	if (iOrderID == undefined)
		throw 'Не задан ID заказа: [' + iOrderIDParam + ']'

	var docOrder = tools.open_doc(iOrderID)

	if (docOrder == undefined)
		throw 'Не найден заказ с ID: [' + iOrderID + ']'
	
	docOrder.TopElem.comment.Value = Trim(sComment)
	docOrder.Save()

	oRes.action_result = "Изменения сохранены"

	return oRes
}

// ======================================================================================
// ==========================  Обработчики системных событий ============================
// ======================================================================================

/**
 * @function HandleEventFinishCourse
 * @author RA
 * @memberof Websoft.WT.Game
 * @param {object} courseDoc - TopElem курса.
 * @param {object} learningDoc - TopElem законченного электронного курса.
 * @description Событие "Завершение электронного курса" - начисление баллов в валюте, указанной в разделе "Бонусы" карточки курса.
*/
function HandleEventFinishCourse(courseDoc, learningDoc) 
{
	try 
	{
		if (courseDoc == undefined || courseDoc == null || courseDoc == '') 
		{
			throw '';
		}
	} 
	catch(e) 
	{
		courseDoc = null;
	}

	try 
	{
		if (learningDoc == undefined || learningDoc == null || learningDoc == '') 
		{
			throw '';
		}
	} 
	catch(e) 
	{
		learningDoc = null;
	}

	if (courseDoc != null && learningDoc != null) 
	{
		var iPersonID = learningDoc.person_id.HasValue ? OptInt(learningDoc.person_id.Value) : undefined;
		var iObjectID = learningDoc.course_id.HasValue ? OptInt(learningDoc.course_id.Value) : undefined;

		if (iObjectID == undefined) 
		{
			alert('[HandleEventFinishCourse]: отсутствует id объекта, к которому следует привязать карточку транзакции.')
			return;
		}

		if (courseDoc.game_bonuss.ChildExists('game_bonus')) 
		{
			var bTeamRating = tools_web.is_true(tools.get_process_param("libGame", "rating"));		
			var arrTeamsIDs = tools_web.parse_multiple_parameter(tools.get_process_param("libGame", "teams_list"));		
			var oTransactionParam;
			for (_bonus in courseDoc.game_bonuss) 
			{ 
				iBonusSum = (_bonus.GetOptProperty('sum') != undefined && _bonus.sum.HasValue) ? OptInt(_bonus.sum.Value) : undefined;
				sBonusCurrency = (_bonus.GetOptProperty('currency_type_id') != undefined && _bonus.currency_type_id.HasValue) ? _bonus.currency_type_id.Value : undefined;
				if (iBonusSum != undefined && sBonusCurrency != undefined) 
				{
					sComment = "Бонус за прохождение курса: \""+ courseDoc.name.Value +"\"";
					docTransaction = tools.pay_new_transaction_by_object(iPersonID, sBonusCurrency, iBonusSum, sComment, iObjectID, iPersonID);
					if (docTransaction == null) 
					{
						alert('[HandleEventFinishCourse]: не удалось создать транзакцию. PersonID: [' + iPersonID + ']; Currency: "' + sBonusCurrency + '"')
					}
					else if (bTeamRating)
					{
						oTransactionParam = {
							currency_type_id: sBonusCurrency,
							sum: iBonusSum,
							comment: sComment,
						};
						
						SetTeamRating(iPersonID, arrTeamsIDs, oTransactionParam)
					}
					
				}
			}
		}
	}
}

/**
 * @function HandleEventFinishTest
 * @author RA
 * @memberof Websoft.WT.Game
 * @param {object} assessmentDoc - TopElem теста.
 * @param {object} learningDoc - TopElem законченного теста.
 * @description Событие "Завершение теста" - начисление баллов в валюте, указанной в разделе "Бонусы" карточки теста.
*/
function HandleEventFinishTest(assessmentDoc, learningDoc) 
{
	try 
	{
		if (assessmentDoc == undefined || assessmentDoc == null || assessmentDoc == '') 
		{
			throw '';
		}
	} 
	catch(e) 
	{
		assessmentDoc = null;
	}

	try 
	{
		if (learningDoc == undefined || learningDoc == null || learningDoc == '') 
		{
			throw '';
		}
	}
	catch(e)
	{
		learningDoc = null;
	}

	if (assessmentDoc != null && learningDoc != null) 
	{
		var iPersonID = learningDoc.person_id.HasValue ? OptInt(learningDoc.person_id.Value) : undefined;
		var iObjectID = learningDoc.assessment_id.HasValue ? OptInt(learningDoc.assessment_id.Value) : undefined;

		if (iObjectID == undefined) 
		{
			alert('[HandleEventFinishTest]: отсутствует id объекта, к которому следует привязать карточку транзакции.')
			return;
		}

		if (assessmentDoc.game_bonuss.ChildExists('game_bonus')) 
		{
			var bTeamRating = tools_web.is_true(tools.get_process_param("libGame", "rating"));		
			var arrTeamsIDs = tools_web.parse_multiple_parameter(tools.get_process_param("libGame", "teams_list"));	
			var oTransactionParam;			
			for (_bonus in assessmentDoc.game_bonuss) 
			{ 
				iBonusSum = (_bonus.GetOptProperty('sum') != undefined && _bonus.sum.HasValue) ? OptInt(_bonus.sum.Value) : undefined;
				sBonusCurrency = (_bonus.GetOptProperty('currency_type_id') != undefined && _bonus.currency_type_id.HasValue) ? _bonus.currency_type_id.Value : undefined;
				if (iBonusSum != undefined && sBonusCurrency != undefined) 
				{
					sComment = "Бонус за прохождение теста: \""+ assessmentDoc.name.Value +"\"";
					docTransaction = tools.pay_new_transaction_by_object(iPersonID, sBonusCurrency, iBonusSum, sComment, iObjectID, iPersonID);
					if (docTransaction == null) 
					{
						alert('[HandleEventFinishTest]: не удалось создать транзакцию. PersonID: [' + iPersonID + ']; Currency: "' + sBonusCurrency + '"')
					}
					else if (bTeamRating)
					{
						oTransactionParam = {
							currency_type_id: sBonusCurrency,
							sum: iBonusSum,
							comment: sComment,
						};
						
						SetTeamRating(iPersonID, arrTeamsIDs, oTransactionParam)
					}
					
				}
			}
		}
	}
}

/**
 * @function HandleEventFinishPool
 * @author RA
 * @memberof Websoft.WT.Game
 * @param {object} curSystemEventObject - TopElem результата опроса.
 * @description Событие "Создание результата опроса" - начисление баллов в валюте, указанной в разделе "Бонусы" карточки опроса.
*/
function HandleEventFinishPool(curSystemEventObject) 
{
	try 
	{
		if (curSystemEventObject == undefined || curSystemEventObject == null || curSystemEventObject == '') 
		{
			throw '';
		}
	} 
	catch(e) 
	{
		curSystemEventObject = null;
	}

	if (curSystemEventObject != null) 
	{
		var iPersonID = curSystemEventObject.person_id.HasValue ? OptInt(curSystemEventObject.person_id.Value) : undefined;
		var iObjectID = curSystemEventObject.poll_id.HasValue ? OptInt(curSystemEventObject.poll_id.Value) : undefined;

		if (iObjectID == undefined) 
		{
			alert('[HandleEventFinishPool]: отсутствует id объекта, к которому следует привязать карточку транзакции.')
			return;
		}

		dPoll = tools.open_doc(iObjectID);
		if (dPoll != undefined) 
		{
			tePoll = dPoll.TopElem;
			if (tePoll.game_bonuss.ChildExists('game_bonus')) 
			{
				var bTeamRating = tools_web.is_true(tools.get_process_param("libGame", "rating"));		
				var arrTeamsIDs = tools_web.parse_multiple_parameter(tools.get_process_param("libGame", "teams_list"));	
				var oTransactionParam;			
				for (_bonus in tePoll.game_bonuss) 
				{ 
					iBonusSum = (_bonus.GetOptProperty('sum') != undefined && _bonus.sum.HasValue) ? OptInt(_bonus.sum.Value) : undefined;
					sBonusCurrency = (_bonus.GetOptProperty('currency_type_id') != undefined && _bonus.currency_type_id.HasValue) ? _bonus.currency_type_id.Value : undefined;
					if (iBonusSum != undefined && sBonusCurrency != undefined) 
					{
						sComment = "Бонус за прохождение опроса: \""+ tePoll.name.Value +"\"";
						docTransaction = tools.pay_new_transaction_by_object(iPersonID, sBonusCurrency, iBonusSum, sComment, iObjectID, iPersonID);
						if (docTransaction == null) 
						{
							alert('[HandleEventFinishPool]: не удалось создать транзакцию. PersonID: [' + iPersonID + ']; Currency: "' + sBonusCurrency + '"')
						}
						else if (bTeamRating)
						{
							oTransactionParam = {
								currency_type_id: sBonusCurrency,
								sum: iBonusSum,
								comment: sComment,
							};
							
							SetTeamRating(iPersonID, arrTeamsIDs, oTransactionParam)
						}
					
					}
				}
			}
		} 
		else 
		{
			alert('[HandleEventFinishPool]: не удалось открыть карточку опроса.')
			return;
		}
	}
}

/**
 * @function HandleEventFinishEvent
 * @author RA
 * @memberof Websoft.WT.Game
 * @param {bigint} iEventId - ID проводимого мероприятия.
 * @description Событие "Завершение проведения мероприятия" - начисление баллов в валюте, указанной в разделе "Бонусы" карточки мероприятия.
*/
function HandleEventFinishEvent(iEventId) 
{
	var iObjectID = OptInt(iEventId);
	var dEvent = tools.open_doc(iObjectID);
	var aBonuses = [];

	if (iObjectID == undefined) 
	{
		alert('[HandleEventFinishEvent]: отсутствует id объекта, к которому следует привязать карточку транзакции.');
		return;
	}

	if (dEvent != undefined) 
	{
		teEvent = dEvent.TopElem;
		if (teEvent.game_bonuss.ChildExists('game_bonus')) 
		{
			aBonuses = teEvent.game_bonuss;
		} 
		else if (teEvent.type_id.Value == 'education_method' && teEvent.education_method_id.HasValue) 
		{
			dEdMethod = tools.open_doc(teEvent.education_method_id.Value);
			if (dEdMethod != undefined) 
			{
				teEdMethod = dEdMethod.TopElem;
				aBonuses = teEdMethod.game_bonuss;
			}
		}

		if (ArrayCount(aBonuses) > 0) 
		{
			var xarrEventPersons = XQuery("for $elem in event_results where $elem/event_id = "+ iObjectID +" and $elem/is_assist = true() return $elem/Fields('person_id')");
			var bTeamRating = tools_web.is_true(tools.get_process_param("libGame", "rating"));		
			var arrTeamsIDs = tools_web.parse_multiple_parameter(tools.get_process_param("libGame", "teams_list"));	
			var oTransactionParam;			

			for (_bonus in aBonuses) 
			{ 
				iBonusSum = (_bonus.GetOptProperty('sum') != undefined && _bonus.sum.HasValue) ? OptInt(_bonus.sum.Value) : undefined;
				sBonusCurrency = (_bonus.GetOptProperty('currency_type_id') != undefined && _bonus.currency_type_id.HasValue) ? _bonus.currency_type_id.Value : undefined;

				if (iBonusSum != undefined && sBonusCurrency != undefined) 
				{
					sComment = "Бонус за прохождение мероприятия: \""+ teEvent.name.Value +"\"";
					
					for (_elem in xarrEventPersons) 
					{
						docTransaction = tools.pay_new_transaction_by_object(_elem.person_id.Value, sBonusCurrency, iBonusSum, sComment, iObjectID, _elem.person_id.Value);
						if (docTransaction == null) 
						{
							alert('[HandleEventFinishEvent]: не удалось создать транзакцию. PersonID: [' + _elem.person_id.Value + ']; Currency: "' + sBonusCurrency + '"');
						}
						else if (bTeamRating)
						{
							oTransactionParam = {
								currency_type_id: sBonusCurrency,
								sum: iBonusSum,
								comment: sComment,
							};
							
							SetTeamRating(iPersonID, arrTeamsIDs, oTransactionParam)
						}
					}
				}
			}
		}
	} 
	else 
	{
		alert('[HandleEventFinishEvent]: не удалось открыть документ мероприятия.');
	}
}

/**
 * @function HandleEventFinishLibMaterial
 * @author RA
 * @memberof Websoft.WT.Game
 * @param {bigint} iPersonID - ID текущего пользователя.
 * @param {bigint} iLibraryMaterialID - ID материала библиотеки.
 * @description Событие "Завершение просмотра материала библиотеки" - начисление баллов в валюте, указанной в разделе "Бонусы" карточки материала библиотеки.
*/
function HandleEventFinishLibMaterial(iPersonID, iLibraryMaterialID) 
{
	var curUserID = OptInt(iPersonID);
	var iObjectID = OptInt(iLibraryMaterialID);

	dLibraryMaterial = tools.open_doc(iObjectID);
	if (dLibraryMaterial != undefined) 
	{
		teLibraryMaterial = dLibraryMaterial.TopElem;
		if (curUserID != undefined) 
		{
			if (iObjectID == undefined) 
			{
				alert('[HandleEventFinishLibMaterial]: отсутствует id объекта, к которому следует привязать карточку транзакции.')
				return;
			}
	
			if (teLibraryMaterial.game_bonuss.ChildExists('game_bonus')) 
			{
				var bTeamRating = tools_web.is_true(tools.get_process_param("libGame", "rating"));		
				var arrTeamsIDs = tools_web.parse_multiple_parameter(tools.get_process_param("libGame", "teams_list"));	
				var oTransactionParam;			
				for (_bonus in teLibraryMaterial.game_bonuss) 
				{ 
					iBonusSum = (_bonus.GetOptProperty('sum') != undefined && _bonus.sum.HasValue) ? OptInt(_bonus.sum.Value) : undefined;
					sBonusCurrency = (_bonus.GetOptProperty('currency_type_id') != undefined && _bonus.currency_type_id.HasValue) ? _bonus.currency_type_id.Value : undefined;
					if (iBonusSum != undefined && sBonusCurrency != undefined) 
					{
						sComment = "Бонус за просмотр материала библиотеки: \""+ teLibraryMaterial.name.Value +"\"";
						docTransaction = tools.pay_new_transaction_by_object(curUserID, sBonusCurrency, iBonusSum, sComment, iObjectID, curUserID);
						if (docTransaction == null) 
						{
							alert('[HandleEventFinishLibMaterial]: не удалось создать транзакцию. PersonID: [' + curUserID + ']; Currency: "' + sBonusCurrency + '"')
						}
						else if (bTeamRating)
						{
							oTransactionParam = {
								currency_type_id: sBonusCurrency,
								sum: iBonusSum,
								comment: sComment,
							};
							
							SetTeamRating(iPersonID, arrTeamsIDs, oTransactionParam)
						}
					}
				}
			}
		}
		else 
		{
			alert('[HandleEventFinishLibMaterial]: отсутствует id сотрудника.')
		}
	}
}

// ======================================================================================
// ===============================  Удаленные действия ==================================
// ======================================================================================

/**
 * @author RA
 * @function AssignQualificationByManager
 * @memberof Websoft.WT.Project
 * @description Удалить задачу проекта.
 * @param {string} sCommand - Режим выполнения удаленного действия (показ формы/обработка формы).
 * @param {bigint} iManagerID - ID руководителя.
 * @param {bigint} iPersonID - ID подчиненного.
 * @param {oArguments} SCOPE_WVARS - Переменные УД.
*/
function AssignQualificationByManager(sCommand, iManagerID, iPersonID, SCOPE_WVARS) {
	var oRes = tools.get_code_library_result_object();
	var sTitle = 'Присвоение квалификации';

	if (iManagerID == undefined || iManagerID == null || Trim(iManagerID) == '') {
		return remote_action_alert(oRes, 'Отсутствует ID руководителя.');
	}

	if (iPersonID == undefined || iPersonID == null || Trim(iPersonID) == '') {
		return remote_action_alert(oRes, 'Отсутствует ID подчиненного.');
	}

	if (!tools.is_user_boss(iManagerID, iPersonID)) {
		var catPerson = ArrayOptFirstElem(XQuery("for $elem in collaborators where $elem/id = "+ iPersonID +" return $elem/Fields('fullname')"));
		return remote_action_alert(oRes, 'Вы не являетесь функциональным руководителем сотрудника: '+ catPerson.fullname.Value +'.');
	}

	var sQualificationStatus = 'archive';
	var sQueryQualifications = "$elem/status = " + XQueryLiteral(sQualificationStatus);
	var aFormFields = get_arr_value_form_fields(SCOPE_WVARS);

	if (aFormFields == '') {
		return remote_action_alert(oRes, 'Все поля формы пустые.');
	}

	function checkPersonQA(status, id) {
		return ArrayOptFirstElem(XQuery("for $elem in qualification_assignments where $elem/person_id = "+ iPersonID +" and $elem/qualification_id = "+ id +" and $elem/status = "+ XQueryLiteral(status) +" return $elem"));
	}

	switch(sCommand) {
		case 'eval': 
		{
			oRes.result = {
				command: 'select_object',
				title: sTitle,
				message: "Выберите группы",
				catalog_name: 'qualification',
				mandatory: true,
				xquery_qual: sQueryQualifications,
				value: null,
				field_name: "qualification_id"
			};
			break;
		}
		case 'submit_form':
		{
			var iQualificationID = OptInt(get_form_field_val(aFormFields, 'qualification_id'));
			if (iQualificationID == undefined) {
				return remote_action_alert(oRes, 'Отсутствует id квалификации.');
			} 

			var cUserQualifAssignment = checkPersonQA('assigned', iQualificationID);
			if (cUserQualifAssignment != undefined) {
				return remote_action_alert(oRes, 'Квалификация уже была присвоена сотруднику ранее.');
			}

			var dQualification = tools.open_doc(iQualificationID);
			if (dQualification == undefined) {
				return remote_action_alert(oRes, 'Не удалось открыть карточку квалификации.');
			}
			
			var teQualification = dQualification.TopElem;
			var iExpireDaysSeconds = (teQualification.expires_days.HasValue) ? OptInt(teQualification.expires_days.Value) : undefined;
			var dDateCur = DateNewTime(Date());
			var dDateExpire = (iExpireDaysSeconds != undefined) ? DateOffset(dDateCur, (86400 * iExpireDaysSeconds)) : null;
			var dQualificationAssignment = tools.assign_qualification_to_person(iPersonID, null, iQualificationID, dDateCur, dDateExpire, [], [], 1, 0, false, false, true, null, teQualification);
			dQualificationAssignment.TopElem.reason.Value = "Присвоена руководителем";
			dQualificationAssignment.Save();

			oRes.result = { command: "close_form", msg: "Квалификация присвоена" };
		}
	}

	return oRes;
}

/**
 * @function QualificationChangeState
 * @memberof Websoft.WT.Game
 * @author AKh
 * @description Изменение статуса квалификаций
 * @param {bigint[]} arrQualifications - массив ID квалификаций
 * @param {string} sNewState - новый статус
 * @returns {oSimpleResultCount}
*/
function QualificationChangeState( arrQualifications, sNewState ){
	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	
	if(!IsArray(arrQualifications))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrQualifications, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObject = tools.open_doc(Int(catCheckObject));
	if(docObject == undefined || docObject.TopElem.Name != "qualification")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID квалификаций";
		return oRes;
	}
	
	if(IsEmptyValue(sNewState))
	{
		oRes.error = 504;
		oRes.errorText = "Не указан новый статус квалификации";
		return oRes;
	}
	
	for(catQualification in arrQualifications)
	{
		docQualification = tools.open_doc(catQualification);
		if (docQualification == undefined)
			continue
		teQualification = docQualification.TopElem;
		if (teQualification.status != sNewState)
		{
			if (tools_web.is_true(teQualification.is_reward) && teQualification.reward_params.currency_type_id.HasValue)
			{
				currency_type_id = teQualification.reward_params.currency_type_id;
				oCurrency = ArrayOptFind(lists.currency_types, 'This.id == currency_type_id');		
				if (sNewState == 'archive'){
					oCurrency.archive = true;
					ms_tools.obtain_shared_list_elem( 'lists.currency_types', null, lists.currency_types );
				}
				else{
					oCurrency.archive = false;
					ms_tools.obtain_shared_list_elem( 'lists.currency_types', null, lists.currency_types );
				}
			}
		
			teQualification.status = sNewState;
			docQualification.Save();
			oRes.count++;
		}
	}
	return oRes;
}

/**
 * @function QualificationAssignChangeState
 * @memberof Websoft.WT.Game
 * @author AKh
 * @description Изменение статуса присвоения квалификаций
 * @param {bigint[]} arrObjectIDs - массив ID присвоений квалификаций
 * @param {string} sNewState - новый статус
 * @returns {oSimpleResultCount}
*/
function QualificationAssignChangeState( arrObjectIDs, sNewState ){
	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	
	if(!IsArray(arrObjectIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrObjectIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObject = tools.open_doc(Int(catCheckObject));
	if(docObject == undefined || docObject.TopElem.Name != "qualification_assignment")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID присвоений квалификаций";
		return oRes;
	}
	
	if(IsEmptyValue(sNewState))
	{
		oRes.error = 504;
		oRes.errorText = "Не указан новый статус присвоения квалификации";
		return oRes;
	}
	
	for(object_id in arrObjectIDs)
	{
		docObject = tools.open_doc(object_id);
		if (docObject == undefined)
			continue
		teObject = docObject.TopElem;
		if (teObject.status != sNewState)
		{	
			teObject.status = sNewState;
			docObject.Save();
			oRes.count++;
		}
	}
	return oRes;
}

/**
 * @function QualificationAssignChange
 * @memberof Websoft.WT.Game
 * @author AKh
 * @description Изменение присвоения квалификации
 * @param {bigint} iObjectID - ID присвоения квалификации
 * @param {?FormField[]} form_fields
 * @returns {oSimpleResultCount}
*/
function QualificationAssignChange( iObjectID, form_fields ){
	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	
	var docObject = tools.open_doc(Int(iObjectID));
	var bSave = false;

	if(docObject == undefined || docObject.TopElem.Name != "qualification_assignment")
	{
		oRes.error = 501;
		oRes.errorText = "Переданный ID не является присвоениеи квалификации";
		return oRes;
	}
	
	dAssignDate = ArrayOptFind(form_fields, 'This.name == "assignment_date"').value;
	dExpDate = ArrayOptFind(form_fields, 'This.name == "expiration_date"').value;
	iCompetenceID = ArrayOptFind(form_fields, 'This.name == "competence_id"').value;
	sComment = ArrayOptFind(form_fields, 'This.name == "comment"').value;

	docObject = tools.open_doc(iObjectID);
	teObject = docObject.TopElem;

	if (teObject.assignment_date != dAssignDate){
		teObject.assignment_date = dAssignDate;
		bSave = true;
	}

	if (teObject.expiration_date != dExpDate){
		teObject.expiration_date = dExpDate;
		bSave = true;
	}

	if (teObject.competence_id != iCompetenceID){
		teObject.competence_id = iCompetenceID;
		bSave = true;
	}

	if (teObject.comment != sComment){
		teObject.comment = sComment;
		bSave = true;
	}

	if(bSave)
	{
		docObject.Save();
		oRes.count++;
	}
	return oRes;
}


//Кафетерий Льгот
	// определение подчиненных, в зависимости от доступа к приложению
function GetPersonSubordinatesApp(teApp, aBossTypes, iPersonID, _sCatalog, _sCodeApplication)
{
	var arrCollIds = new Array();
	var sCatalog = "";
	if (_sCatalog != undefined)
		sCatalog = _sCatalog;
	var iAppAccessLevel = 1;
	if (_sCodeApplication != undefined)
	{
		teApp = tools.get_doc_by_key('application', 'code', 'websoft_cafeteria').TopElem;
	}

	if ( teApp != null && teApp != undefined )
	{
		iAppAccessLevel = tools.call_code_library_method( "libApplication", "GetPersonApplicationAccessLevel", [ iPersonID, teApp.code.Value ] ); 
	}
	switch (iAppAccessLevel) 
	{
		case 10:
			break;
		case 7:
		case 5:
			if( ArrayOptFirstElem(aBossTypes) == undefined )
			{
				if( teApp != null && teApp != undefined )
				{
					sBtIds = teApp.wvars.ObtainChildByKey( "boss_types_id" ).value;
					if( OptInt(sBtIds) != undefined )
					{
						aBossTypes.push(sBtIds)
					}
					else
					{
						if(sBtIds != "[]")
							aBossTypes = ArrayMerge(ParseJson(sBtIds), "This.__value", ",").split(",");
					}
				}
			}
			if( ArrayOptFirstElem(aBossTypes) == undefined )
			{
				catEducationManager = ArrayOptFirstElem( XQuery( "for $elem in boss_types where $elem/code = 'education_manager' return $elem/Fields( 'id' )" ) );
				if( catEducationManager != undefined )
				{
					aBossTypes.push(catEducationManager.id.Value);
				}
			}
			arrCollIds = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iPersonID, ["func"], true, "", null, "", true, false, true, true, aBossTypes, true ] );
			if(ArrayOptFirstElem(arrCollIds) == undefined)
				arrCollIds.push("0");
			break;
		case 1:
			arrCollIds = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iPersonID, ["fact","func"], true, "", null, "", true, true, true, true, ([]), true ] );
			if(ArrayOptFirstElem(arrCollIds) == undefined)
				arrCollIds.push("0");
			break;
	}
	if (ArrayCount(arrCollIds) > 0)
	{
		if (sCatalog == "sub")
		{
			var xSub = tools.xquery("for $elem in subs where MatchSome($elem/basic_collaborator_id, (" + ArrayMerge(arrCollIds, "This", ",") + ")) return $elem");
			if (ArrayCount(xSub) > 0)
			{
				xSub = ArraySelectDistinct(xSub, "This.parent_id");
				if (ArrayCount(xSub) > 0)
					return ArrayExtract(xSub, "This.parent_id.Value");
			}
		}
	}
	return arrCollIds;
}
	//функции документооборота
function UpdateCafeteriaWfMatchings( teRequestPARAM )
{
	oRes = {
		"sActionMessage" : "",
		"bActionSuccess" : false,
		"bActionBreak" : false };

	try
	{
		teRequest = teRequestPARAM;
		if(teRequest == undefined || teRequest == null)
		{
			oRes.sActionMessage = "Произошла ошибка при открытии документа заявки.";
			oRes.bActionSuccess = true;
			oRes.bActionBreak = true;
			return oRes;
		}

		if ( teRequest.ChildExists( "workflow_matching_type" ) && teRequest.workflow_matching_type == "" )
		{
			teRequest.workflow_matching_type = "condition_eval";
		}
		teRequest.workflow_matchings.Clear();

		arrMatch = new Array();
		arrMatch.push({"id": teRequest.person_id});

		catBoss = tools.get_uni_user_boss(teRequest.person_id);
		if( catBoss != undefined )
		{
			if( ArrayOptFirstElem(arrMatch) == undefined || ArrayOptFind(arrMatch, "This.id == catBoss.id") == undefined )
				arrMatch.push({"id": catBoss.id});
		}

		iGroupID = 0;
		teApp = tools_app.get_application("websoft_cafeteria");
		if(teApp != undefined && teApp != null)
			iGroupID = OptInt(teApp.wvars.ObtainChildByKey( "workflow_label.manager_group_id" ).value, 0);
		xarrManagers = tools.xquery("for $elem in group_collaborators where $elem/group_id = "+iGroupID+" return $elem");
		for(_person in xarrManagers)
		{
			if( ArrayOptFirstElem(arrMatch) == undefined || ArrayOptFind(arrMatch, "This.id == _person.collaborator_id") == undefined )
				arrMatch.push({"id": _person.collaborator_id});
		}

		for (arrElem in arrMatch)
		{
			fldNewWorkflowMatching = teRequest.workflow_matchings.AddChild();
			fldNewWorkflowMatching.person_id = arrElem.id;			
		}
	}
	catch(err)
	{
		oRes.sActionMessage = "UpdateCafeteriaWfMatchings errror: "+err;
		oRes.bActionSuccess = true;
		oRes.bActionBreak = true;
	}
	return oRes;
}
function CheckCafeteriaGoodLimit( teRequestPARAM )
{
	oRes = {
		"sActionMessage" : "",
		"bActionSuccess" : false,
		"bActionBreak" : false };

	teRequest = teRequestPARAM == null || teRequestPARAM == undefined ? null : teRequestPARAM;
	teGood = null;
	try
	{
		teGood = tools.open_doc( OptInt( teRequest.object_id, 0 ) ).TopElem;
	}
	catch(err){}

	if(teRequest == null || teGood == null)
	{
		oRes = {
			"sActionMessage" : "Недостаточно данных для расчета ограничения по льготе",
			"bActionSuccess" : true,
			"bActionBreak" : true };
		return oRes;
	}

	iGoodLimit = null;
	sCurCurrency = teRequest.workflow_fields.ObtainChildByKey('currency').value;
	if(teGood.delivery_type == "cost" || teGood.delivery_type == "instance")
	{
		oCost = ArrayOptFind(teGood.costs, "This.currency_type_id == '"+sCurCurrency+"'");
		if(oCost == undefined)
		{
			oRes = {
				"sActionMessage" : "Не удалось получить данные о стомости льготы "+teGood.name+" в валюте "+get_currency_name(sCurCurrency),
				"bActionSuccess" : true,
				"bActionBreak" : true };
			return oRes;
		}
		if( OptReal(oCost.limit) != undefined )
		{
			iGoodLimit = OptReal(oCost.limit, null);
		}
	}

	if(iGoodLimit != null)
	{
		iCurValue = 0;
		if(teGood.delivery_type == "cost")
		{
			iCurValue += OptReal(teRequest.workflow_fields.ObtainChildByKey("amount").value);
		}
		else if(teGood.delivery_type == "instance")
		{
			iCurValue += OptReal(teRequest.workflow_fields.ObtainChildByKey("good_number").value);
		}
		xarrRequests = tools.xquery("for $elem in requests where $elem/workflow_id = "+OptInt(teRequest.workflow_id, 0)+" and $elem/person_id = "+OptInt(teRequest.person_id, 0)+" and $elem/budget_period_id = "+OptInt(teRequest.budget_period_id, 0)+" and $elem/request_type_id = "+OptInt(teRequest.request_type_id, 0)+" and $elem/object_id = "+OptInt(teRequest.object_id, 0)+" and ($elem/status_id = 'pay' or $elem/status_id = 'active') return $elem/id");
		for(_request in xarrRequests)
		{
			if(OptInt(_request.id) == OptInt(teRequest.id, 0))
				continue;

			docPayedRequest = tools.open_doc(_request.id);
			if(docPayedRequest != undefined)
			{
				if(teGood.delivery_type == "cost")
				{
					iCurValue += OptReal(docPayedRequest.TopElem.workflow_fields.ObtainChildByKey("amount").value);
				}
				else if(teGood.delivery_type == "instance")
				{
					iCurValue += OptReal(docPayedRequest.TopElem.workflow_fields.ObtainChildByKey("good_number").value);
				}
			}
		}
		if(iGoodLimit < iCurValue)
		{
			oRes = {
				"sActionMessage" : "Превышен лимит для заявок "+teGood.name+" в валюте "+get_currency_name(sCurCurrency)+".",
				"bActionSuccess" : true,
				"bActionBreak" : true };
		}
	}

	return oRes;
}
function CheckCafeteriaWfVisibility(curUserIDPARAM, sourcePARAM, sAppCodePARAM, sActionPARAM)
{
	isVisible = false;
	teRequest = sourcePARAM;
	catBoss = tools.get_uni_user_boss(teRequest.person_id);
	teApp = tools_app.get_application(sAppCodePARAM);
	if(teApp != undefined && teApp != null)
		iGroupID = OptInt(teApp.wvars.ObtainChildByKey( "workflow_label.manager_group_id" ).value, 0);
		
	switch ( sActionPARAM ) 
	{
		case "act_1":
		case "act_10":
		case "act_11":
		case "act_12":
			if ((sActionPARAM == "act_1" && teRequest.workflow_state == "st_1") || (sActionPARAM == "act_12" && teRequest.workflow_state == "st_1") || (sActionPARAM == "act_10" && teRequest.workflow_state == "st_5") || (sActionPARAM == "act_11" && teRequest.workflow_state == "st_3"))
			{
				isVisible = (OptInt(curUserIDPARAM, 0) == OptInt(teRequest.person_id));
			}
			break;
		case "act_2":
		case "act_3":
		case "act_7":
			if ((sActionPARAM == "act_2" && teRequest.workflow_state == "st_2") || (sActionPARAM == "act_3" && teRequest.workflow_state == "st_2") || (sActionPARAM == "act_7" && teRequest.workflow_state == "st_2"))
			{
				isVisible = (catBoss != undefined && OptInt(catBoss.id) == OptInt(curUserIDPARAM, 0));
			}
			break;
		case "act_4":
			if ((sActionPARAM == "act_4" && teRequest.workflow_state == "st_3"))
			{
				isVisible = ArrayOptFirstElem(tools.xquery("for $elem in group_collaborators where $elem/group_id = "+iGroupID+" and $elem/collaborator_id = "+OptInt(curUserIDPARAM, 0)+" return $elem")) != undefined;
			}
			break;
		case "act_5":
		case "act_8":
		case "act_9":
			if ((sActionPARAM == "act_5" && teRequest.workflow_state == "st_4") || (sActionPARAM == "act_8" && teRequest.workflow_state == "st_4") || (sActionPARAM == "act_9" && teRequest.workflow_state == "st_4"))
			{
				isVisible = (OptInt(teRequest.workflow_fields.ObtainChildByKey("manager_id").value) == OptInt(curUserIDPARAM, 0));
			}
			break;
		case "act_6":
			if ((sActionPARAM == "act_6" && teRequest.workflow_state == "st_5"))
			{
				isVisible = ArrayOptFirstElem(tools.xquery("for $elem in group_collaborators where $elem/group_id = "+iGroupID+" and $elem/collaborator_id = "+OptInt(curUserIDPARAM, 0)+" return $elem")) != undefined;
			}
			break;
		default:
			isVisible = OptInt(curUserIDPARAM, 0) == OptInt(teRequest.person_id) || 
				((catBoss != undefined && OptInt(catBoss.id) == OptInt(curUserIDPARAM, 0))&&teRequest.workflow_state == "st_2") 
				|| 
				((ArrayOptFirstElem(tools.xquery("for $elem in group_collaborators where $elem/group_id = "+iGroupID+" and $elem/collaborator_id = "+OptInt(curUserIDPARAM, 0)+" return $elem")) != undefined)&&(teRequest.workflow_state == "st_3"||teRequest.workflow_state == "st_4"||teRequest.workflow_state == "st_5"||teRequest.workflow_state == "st_5"));
			break;
	}
	return isVisible;
}
function DoCafeteriaWfAction(curUserIDPARAM, sourcePARAM, sAppCodePARAM, workflowPARAM, sActionPARAM)
{
	function CreateTransaction(_request, _user_id, _budget_period_id)
	{
		oRes = {
			"sActionMessage" : "",
			"bActionSuccess" : false,
			"bActionBreak" : false };

		sCurrency = _request.workflow_fields.ObtainChildByKey("currency").value;
		iSum = OptReal(_request.workflow_fields.ObtainChildByKey("amount").value, "");
		
		docAccount = null;
		catAccount = ArrayOptFirstElem(tools.xquery("for $elem in accounts where $elem/object_id = "+OptInt(_request.person_id, 0)+" and $elem/currency_type_id = '"+sCurrency+"' and $elem/budget_period_id = "+OptInt(_budget_period_id, 0)+" and $elem/status='active' return $elem"));
		if(catAccount != undefined)
			docAccount = tools.open_doc(catAccount.id);
		if(docAccount == undefined || docAccount == null)
		{
			oRes.sActionMessage = "Не удалось найти счет сотрудника "+_request.person_fullname+" в данной валюте за текущий бюджетный период.";
			oRes.bActionSuccess = true;
			oRes.bActionBreak = true;
		}
		else
		{
			if(OptReal(catAccount.balance, 0) >= iSum && iSum != "")
			{
				docTransaction = createTransaction(docAccount, iSum, "decrease", "Списание по заявке №"+_request.code);
				if(docTransaction == undefined)
				{
					oRes.sActionMessage = "Не удалось создать транзакцию на списание средств со счета";
					oRes.bActionSuccess = true;
					oRes.bActionBreak = true;
				}
			}
			else
			{
				oRes.sActionMessage = "На счете сотрудника недостаточно средств для списания.";
				oRes.bActionSuccess = true;
				oRes.bActionBreak = true;
			}
		}
		return oRes;
	}
	function CreateBonusObject(_request, _good, _budget_period_id)
	{
		oRes = {
			"sActionMessage" : "",
			"bActionSuccess" : false,
			"bActionBreak" : false };

		catGoodType = ArrayOptFirstElem(tools.xquery("for $elem in good_types where $elem/id = "+OptInt(_good.good_type_id, 0)+" return $elem"))
		if(catGoodType == undefined)
		{
			oRes.sActionMessage = "Не удалось вычислить тип льготы, указанной в заказе.";
			oRes.bActionSuccess = true;
			oRes.bActionBreak = true;
			return oRes;
		}

		docObject = null;
		if(catGoodType.object_type.HasValue)
		{
			switch( catGoodType.object_type )
			{
				case "payment_type":
					try
					{
						docObject = OpenNewDoc('x-local://wtv/wtv_payment.xmd');
						docObject.BindToDb(DefaultDb);
						docObject.TopElem.name = _good.name;
						docObject.TopElem.status = "plan";
						docObject.TopElem.pay_date = _request.workflow_fields.ObtainChildByKey("pay_date").value;
						docObject.TopElem.sum = _request.workflow_fields.ObtainChildByKey("amount").value;
						docObject.TopElem.currency_type_id = _request.workflow_fields.ObtainChildByKey("currency").value;
						docObject.TopElem.person_id = _request.person_id;
						docObject.TopElem.budget_period_id = OptInt(_budget_period_id, null);
						docObject.TopElem.payment_type_id = _good.object_id;
						tools.common_filling( 'collaborator', docObject.TopElem, docObject.TopElem.person_id);
						docObject.Save();
					}
					catch(err)
					{
						oRes.sActionMessage = "Произошла ошибка при создании объекта для льготы: "+err;
						oRes.bActionSuccess = true;
						oRes.bActionBreak = true;
					}
					break;
				case "policy_type":
					try
					{
						docObject = OpenNewDoc('x-local://wtv/wtv_policy.xmd');
						docObject.BindToDb(DefaultDb);
						docObject.TopElem.name = _good.name;
						docObject.TopElem.state_id = "active";
						docObject.TopElem.person_id = _request.person_id;
						docObject.TopElem.budget_period_id = OptInt(_budget_period_id, null);
						docObject.TopElem.policy_type_id = _good.object_id;
						tools.common_filling( 'collaborator', docObject.TopElem, docObject.TopElem.person_id);
						docObject.Save();
					}
					catch(err)
					{
						oRes.sActionMessage = "Произошла ошибка при создании объекта для льготы: "+err;
						oRes.bActionSuccess = true;
						oRes.bActionBreak = true;
					}
					break;
				case "benefit":
					try
					{
						docObject = OpenNewDoc('x-local://wtv/wtv_benefit_item.xmd');
						docObject.BindToDb(DefaultDb);
						docObject.TopElem.name = _good.name;
						docObject.TopElem.status = "active";
						docObject.TopElem.person_id = _request.person_id;
						docObject.TopElem.budget_period_id = OptInt(_budget_period_id, null);
						docObject.TopElem.benefit_id = _good.object_id;
						tools.common_filling( 'collaborator', docObject.TopElem, docObject.TopElem.person_id);
						docObject.Save();
					}
					catch(err)
					{
						oRes.sActionMessage = "Произошла ошибка при создании объекта для льготы: "+err;
						oRes.bActionSuccess = true;
						oRes.bActionBreak = true;
					}
					break;
			}
			if(docObject == null)
			{
				oRes.sActionMessage = "Произошла ошибка при создании объекта для льготы.";
				oRes.bActionSuccess = true;
				oRes.bActionBreak = true;
				return oRes;
			}
		}

		return oRes;
	}

	oAction = {
		"sActionMessage" : "",
		"bActionSuccess" : false,
		"bActionBreak" : false };

	teRequest = sourcePARAM;
	if(teRequest == undefined || teRequest == null)
	{
		oAction.sActionMessage = "Произошла ошибка при открытии документа заявки.";
		oAction.bActionSuccess = true;
		oAction.bActionBreak = true;
		return oAction;
	}

	iOrderID = OptInt(teRequest.workflow_fields.ObtainChildByKey("order_id").value, 0);
	docOrder = tools.open_doc( iOrderID );
	teOrder = null;
	if(docOrder != undefined)
		teOrder = docOrder.TopElem;
	if(sActionPARAM != "act_0")
	{
		if(teOrder == undefined || teOrder == null)
		{
			oAction.sActionMessage = "Произошла ошибка при открытии документа заказа.";
			oAction.bActionSuccess = true;
			oAction.bActionBreak = true;
			return oAction;
		}
	}

	iGoodID = OptInt(teRequest.object_id, 0);
	docGood = tools.open_doc( iGoodID );
	teGood = null;
	if(docGood != undefined)
		teGood = docGood.TopElem;
	if(teGood == undefined || teGood == null)
	{
		oAction.sActionMessage = "Произошла ошибка при открытии документа товара.";
		oAction.bActionSuccess = true;
		oAction.bActionBreak = true;
		return oAction;
	}

	iBudgetPeriodID = OptInt(teRequest.budget_period_id, 0);
	if(sActionPARAM != "act_0")
	{
		if(iBudgetPeriodID == 0)
		{
			oAction.sActionMessage = "В заявке не указан бюджетный период.";
			oAction.bActionSuccess = true;
			oAction.bActionBreak = true;
			return oAction;
		}
	}

	curUserIDPARAM = OptInt(curUserIDPARAM, null);

	oAppParams = {
		use_stage_boss: true,
		use_stage_manager: true,
		auto_approve: false,
		request_created: true,
		manager_request_approve: true,
		request_to_payment: true,
		request_returned: true,
		request_approved: true,
		request_rejected: true,
		request_cancelled: true,
		manual_send_request: true,
		current_period: null
	}
	teApp = tools_app.get_application(sAppCodePARAM);
	if(teApp != undefined && teApp != null)
	{
		oAppParams.use_stage_boss = teApp.wvars.ObtainChildByKey( "workflow_label.use_stage_boss").value;
		oAppParams.use_stage_manager = teApp.wvars.ObtainChildByKey( "workflow_label.use_stage_manager").value;
		oAppParams.auto_approve = teApp.wvars.ObtainChildByKey( "workflow_label.auto_approve").value;
		oAppParams.request_created = teApp.wvars.ObtainChildByKey( "notifications_label.request_created").value;
		oAppParams.manager_request_approve = teApp.wvars.ObtainChildByKey( "notifications_label.manager_request_approve").value;
		oAppParams.request_to_payment = teApp.wvars.ObtainChildByKey( "notifications_label.request_to_payment").value;
		oAppParams.request_returned = teApp.wvars.ObtainChildByKey( "notifications_label.request_returned").value;
		oAppParams.request_approved = teApp.wvars.ObtainChildByKey( "notifications_label.request_approved").value;
		oAppParams.request_rejected = teApp.wvars.ObtainChildByKey( "notifications_label.request_rejected").value;
		oAppParams.request_cancelled = teApp.wvars.ObtainChildByKey( "notifications_label.request_cancelled").value;
		oAppParams.manual_send_request = teApp.wvars.ObtainChildByKey( "notifications_label.manual_send_request").value;
		oAppParams.current_period = teApp.wvars.ObtainChildByKey( "budget_period_label.current_period").value;
	}

	switch ( sActionPARAM ) 
	{
		case "act_0":
			oGood=tools.read_object( teRequest.workflow_state_name );

			teRequest.workflow_fields.ObtainChildByKey("pay_date").value = oGood.GetOptProperty("reserved_date", null)
			teRequest.workflow_fields.ObtainChildByKey("currency").value = oGood.GetOptProperty("currency_type_id", null)
			teRequest.workflow_fields.ObtainChildByKey("currency_name").value = get_currency_name(oGood.GetOptProperty("currency_type_id", null));
			teRequest.workflow_fields.ObtainChildByKey("good_number").value = oGood.GetOptProperty("quantity", null)
			teRequest.workflow_fields.ObtainChildByKey("good_cost").value = oGood.GetOptProperty("sum", null)
			teRequest.workflow_fields.ObtainChildByKey("amount").value = OptReal(oGood.GetOptProperty("sum", null), null) != null && OptReal(oGood.GetOptProperty("quantity", null), null) != null ? OptReal(oGood.GetOptProperty("sum", null), null) * OptReal(oGood.GetOptProperty("quantity", null), null) : null;
			teRequest.workflow_fields.ObtainChildByKey("order_id").value=oGood.GetOptProperty("order_id", null)
			teRequest.budget_period_id = oAppParams.current_period;
			oLimit = CheckCafeteriaGoodLimit(teRequest);
			if(oLimit.bActionBreak)
			{
				oAction.sActionMessage = oLimit.sActionMessage;
				oAction.bActionSuccess = oLimit.bActionSuccess;
				oAction.bActionBreak = oLimit.bActionBreak;
				break;
			}

			if( tools_web.is_true(oAppParams.auto_approve) )
			{
				if( tools_web.is_true(oAppParams.use_stage_boss) )
				{
					teRequest.workflow_state = "st_2";
					teRequest.status_id = "active";
					teRequest.get_workflow_state_name( workflowPARAM );
					if(tools_web.is_true(oAppParams.manager_request_approve))
					{
						catBoss = tools.get_uni_user_boss(teRequest.person_id);
						if(catBoss != undefined)
						{
							sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
							sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
							sNotificationText = Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : "");
							tools.create_notification("manager_request_approve", catBoss.id, sNotificationText, teRequest.id);
						}
					}
				}
				else if( !tools_web.is_true(oAppParams.use_stage_boss) && tools_web.is_true(oAppParams.use_stage_manager) )
				{
					teRequest.workflow_state = "st_3";
					teRequest.status_id = "active";
					teRequest.get_workflow_state_name( workflowPARAM );
				}
			}
			else
			{
				if(tools_web.is_true(oAppParams.manual_send_request))
				{
					oText = new Object();
					sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
					sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
					oText.iRequestID = OptInt(teRequest.id, 0);
					oText.sRequest = Trim(teRequest.code) + " от " + Trim(teRequest.create_date);
					oText.sGood = Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : "");
					tools.create_notification("manual_send_request", teRequest.person_id, oText);
				}
			}
			
			break;
		case "act_1":
			teRequest.workflow_fields.ObtainChildByKey("amount").value = OptReal(teRequest.workflow_fields.ObtainChildByKey("good_number").value, null) * OptReal(teRequest.workflow_fields.ObtainChildByKey("good_cost").value, null);
			oLimit = CheckCafeteriaGoodLimit(teRequest);
			if(oLimit.bActionBreak)
			{
				oAction.sActionMessage = oLimit.sActionMessage;
				oAction.bActionSuccess = oLimit.bActionSuccess;
				oAction.bActionBreak = oLimit.bActionBreak;
				break;
			}
			if(tools_web.is_true(oAppParams.request_created))
			{
				sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
				sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
				sNotificationText = Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : "");
				tools.create_notification("request_created", teRequest.person_id, sNotificationText, teRequest.id);
			}
			if( tools_web.is_true(oAppParams.use_stage_boss) )
			{
				teRequest.workflow_state = "st_2";
				teRequest.status_id = "active";
				teRequest.get_workflow_state_name( workflowPARAM );
				if(tools_web.is_true(oAppParams.manager_request_approve))
				{
					catBoss = tools.get_uni_user_boss(teRequest.person_id);
					if(catBoss != undefined)
					{
						sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
						sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
						sNotificationText = Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : "");
						tools.create_notification("manager_request_approve", catBoss.id, sNotificationText, teRequest.id);
					}
				}
			}
			else if( !tools_web.is_true(oAppParams.use_stage_boss) && tools_web.is_true(oAppParams.use_stage_manager) )
			{
				teRequest.workflow_state = "st_3";
				teRequest.status_id = "active";
				teRequest.get_workflow_state_name( workflowPARAM );
			}
			else if( !tools_web.is_true(oAppParams.use_stage_boss) && !tools_web.is_true(oAppParams.use_stage_manager) )
			{
				oTransaction = CreateTransaction(teRequest, curUserIDPARAM, iBudgetPeriodID);
				if(oTransaction.bActionBreak)
				{
					oAction.sActionMessage = oTransaction.sActionMessage;
					oAction.bActionSuccess = oTransaction.bActionSuccess;
					oAction.bActionBreak = oTransaction.bActionBreak;
					break;
				}

				oBonus = CreateBonusObject(teRequest, teGood,  iBudgetPeriodID);
				if(oBonus.bActionBreak)
				{
					oAction.sActionMessage = oBonus.sActionMessage;
					oAction.bActionSuccess = oBonus.bActionSuccess;
					oAction.bActionBreak = oBonus.bActionBreak;
					break;
				}

				oCurGood = ArrayOptFind(teOrder.goods, "This.good_id == teGood.id");
				if(oCurGood != undefined)
				{
					oCurGood.status = "paid";
					docOrder.Save();
				}
				teRequest.workflow_state = "st_6";
				teRequest.status_id = "pay";
				teRequest.get_workflow_state_name( workflowPARAM );
				if(tools_web.is_true(oAppParams.request_to_payment))
				{
					sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
					sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
					sNotificationText = Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : "");
					tools.create_notification("request_to_payment", teRequest.person_id, sNotificationText, teRequest.id);
				}
			}
			break;
		case "act_2":
			if(teRequest.workflow_fields.ObtainChildByKey("boss_comment").value == "")
			{
				oAction.sActionMessage = "Заполните комментарий.";
				oAction.bActionSuccess = true;
				oAction.bActionBreak = true;
			}
			else
			{
				teRequest.workflow_state = "st_1";
				teRequest.status_id = "active";
				teRequest.get_workflow_state_name( workflowPARAM );
				if(tools_web.is_true(oAppParams.request_returned))
				{
					sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
					sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
					oText = {
						sGoodText: Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : ""),
						sComment: teRequest.workflow_fields.ObtainChildByKey("boss_comment").value
					}
					tools.create_notification("request_returned", teRequest.person_id, oText, teRequest.id);
				}
			}
			break;
		case "act_3":
			if( tools_web.is_true(oAppParams.use_stage_manager) )
			{
				teRequest.workflow_state = "st_3";
				teRequest.status_id = "active";
				teRequest.get_workflow_state_name( workflowPARAM );
			}
			else
			{
				oLimit = CheckCafeteriaGoodLimit(teRequest);
				if(oLimit.bActionBreak)
				{
					oAction.sActionMessage = oLimit.sActionMessage;
					oAction.bActionSuccess = oLimit.bActionSuccess;
					oAction.bActionBreak = oLimit.bActionBreak;
					break;
				}

				oTransaction = CreateTransaction(teRequest, curUserIDPARAM, iBudgetPeriodID);
				if(oTransaction.bActionBreak)
				{
					oAction.sActionMessage = oTransaction.sActionMessage;
					oAction.bActionSuccess = oTransaction.bActionSuccess;
					oAction.bActionBreak = oTransaction.bActionBreak;
					break;
				}

				oBonus = CreateBonusObject(teRequest, teGood,  iBudgetPeriodID);
				if(oBonus.bActionBreak)
				{
					oAction.sActionMessage = oBonus.sActionMessage;
					oAction.bActionSuccess = oBonus.bActionSuccess;
					oAction.bActionBreak = oBonus.bActionBreak;
					break;
				}

				oCurGood = ArrayOptFind(teOrder.goods, "This.good_id == teGood.id");
				if(oCurGood != undefined)
				{
					oCurGood.status = "paid";
					docOrder.Save();
				}
				teRequest.workflow_state = "st_6";
				teRequest.status_id = "pay";
				teRequest.get_workflow_state_name( workflowPARAM );
				if(tools_web.is_true(oAppParams.request_to_payment))
				{
					sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
					sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
					sNotificationText = Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : "");
					tools.create_notification("request_to_payment", teRequest.person_id, sNotificationText, teRequest.id);
				}
			}
			break;
		case "act_4":
			teRequest.workflow_state = "st_4";
			teRequest.status_id = "active";
			teRequest.get_workflow_state_name( workflowPARAM );
			teRequest.workflow_fields.ObtainChildByKey("manager_id").value = curUserIDPARAM;
			break;
		case "act_5":
			oCurGood = ArrayOptFind(teOrder.goods, "This.good_id == teGood.id");
			if(oCurGood != undefined)
			{
				oCurGood.status = "agreed";
				docOrder.Save();
			}
			teRequest.workflow_state = "st_5";
			teRequest.close_date = Date();
			teRequest.status_id = "close";
			teRequest.get_workflow_state_name( workflowPARAM );
			if(tools_web.is_true(oAppParams.request_approved))
			{
				sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
				sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
				sNotificationText = Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : "");
				tools.create_notification("request_approved", teRequest.person_id, sNotificationText, teRequest.id);
			}
			break;
		case "act_6":
			oLimit = CheckCafeteriaGoodLimit(teRequest);
			if(oLimit.bActionBreak)
			{
				oAction.sActionMessage = oLimit.sActionMessage;
				oAction.bActionSuccess = oLimit.bActionSuccess;
				oAction.bActionBreak = oLimit.bActionBreak;
				break;
			}

			oTransaction = CreateTransaction(teRequest, curUserIDPARAM, iBudgetPeriodID);
			if(oTransaction.bActionBreak)
			{
				oAction.sActionMessage = oTransaction.sActionMessage;
				oAction.bActionSuccess = oTransaction.bActionSuccess;
				oAction.bActionBreak = oTransaction.bActionBreak;
				break;
			}

			oBonus = CreateBonusObject(teRequest, teGood,  iBudgetPeriodID);
			if(oBonus.bActionBreak)
			{
				oAction.sActionMessage = oBonus.sActionMessage;
				oAction.bActionSuccess = oBonus.bActionSuccess;
				oAction.bActionBreak = oBonus.bActionBreak;
				break;
			}

			oCurGood = ArrayOptFind(teOrder.goods, "This.good_id == teGood.id");
			if(oCurGood != undefined)
			{
				oCurGood.status = "paid";
				docOrder.Save();
			}
			teRequest.workflow_state = "st_6";
			teRequest.status_id = "pay";
			teRequest.get_workflow_state_name( workflowPARAM );
			if(tools_web.is_true(oAppParams.request_to_payment))
			{
				sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
				sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
				sNotificationText = Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : "");
				tools.create_notification("request_to_payment", teRequest.person_id, sNotificationText, teRequest.id);
			}
			break;
		case "act_7":
			if(teRequest.workflow_fields.ObtainChildByKey("boss_comment").value == "")
			{
				oAction.sActionMessage = "Заполните комментарий.";
				oAction.bActionSuccess = true;
				oAction.bActionBreak = true;
			}
			else
			{
				oCurGood = ArrayOptFind(teOrder.goods, "This.good_id == teGood.id");
				if(oCurGood != undefined)
				{
					oCurGood.status = "cancel";
					docOrder.Save();
				}
				teRequest.workflow_state = "st_8";
				teRequest.status_id = "ignore";
				teRequest.get_workflow_state_name( workflowPARAM );
				if(tools_web.is_true(oAppParams.request_rejected))
				{
					sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
					sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
					oText = {
						sGoodText: Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : ""),
						sComment: teRequest.workflow_fields.ObtainChildByKey("boss_comment").value
					}
					tools.create_notification("request_rejected", teRequest.person_id, oText, teRequest.id);
				}
			}
			break;
		case "act_8":
			if(teRequest.workflow_fields.ObtainChildByKey("manager_comment").value == "")
			{
				oAction.sActionMessage = "Заполните комментарий.";
				oAction.bActionSuccess = true;
				oAction.bActionBreak = true;
			}
			else
			{
				oCurGood = ArrayOptFind(teOrder.goods, "This.good_id == teGood.id");
				if(oCurGood != undefined)
				{
					oCurGood.status = "cancel";
					docOrder.Save();
				}
				teRequest.workflow_state = "st_8";
				teRequest.status_id = "ignore";
				teRequest.get_workflow_state_name( workflowPARAM );
				if(tools_web.is_true(oAppParams.request_rejected))
				{
					sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
					sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
					oText = {
						sGoodText: Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : ""),
						sComment: teRequest.workflow_fields.ObtainChildByKey("manager_comment").value
					}
					tools.create_notification("request_rejected", teRequest.person_id, oText, teRequest.id);
				}
			}
			break;
		case "act_9":
			if(teRequest.workflow_fields.ObtainChildByKey("manager_comment").value == "")
			{
				oAction.sActionMessage = "Заполните комментарий.";
				oAction.bActionSuccess = true;
				oAction.bActionBreak = true;
			}
			else
			{
				teRequest.workflow_state = "st_1";
				teRequest.status_id = "active";
				teRequest.get_workflow_state_name( workflowPARAM );
				if(tools_web.is_true(oAppParams.request_returned))
				{
					sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
					sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
					oText = {
						sGoodText: Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : ""),
						sComment: teRequest.workflow_fields.ObtainChildByKey("manager_comment").value
					}
					tools.create_notification("request_returned", teRequest.person_id, oText, teRequest.id);
				}
			}
			break;
		case "act_10":
		case "act_11":
		case "act_12":
			oCurGood = ArrayOptFind(teOrder.goods, "This.good_id == teGood.id");
			if(oCurGood != undefined)
			{
				oCurGood.status = "cancel";
				docOrder.Save();
			}
			teRequest.workflow_state = "st_7";
			teRequest.status_id = "ignore";
			teRequest.get_workflow_state_name( workflowPARAM );
			if(tools_web.is_true(oAppParams.request_cancelled))
			{
				sGoodAmount = teRequest.workflow_fields.ObtainChildByKey("amount").value;
				sGoodCurrency = get_currency_name(teRequest.workflow_fields.ObtainChildByKey("currency").value);
				sNotificationText = Trim(teGood.name) + ((sGoodAmount != "" && sGoodCurrency != "") ? " ("+sGoodAmount+", "+sGoodCurrency+")" : "");
				tools.create_notification("request_cancelled", teRequest.person_id, sNotificationText, teRequest.id);
			}
			break;
		default:
			break;
	}
	if(!oAction.bActionBreak)
	{
		oMatchings = UpdateCafeteriaWfMatchings(teRequest);
		oAction.sActionMessage = oMatchings.sActionMessage;
		oAction.bActionSuccess = oMatchings.bActionSuccess;
		oAction.bActionBreak = oMatchings.bActionBreak;
	}
	
	return oAction;
}
function InitCafeteriaWfAction(curObjectDocParam, curUserIDParam, strActionCodeParam, teWorkflowParam)
{
	oRes = {
		"sActionMessage" : "",
		"bActionSuccess" : false,
		"bActionBreak" : false };
	try
	{
		fldAction = teWorkflowParam.actions.GetChildByKey(strActionCodeParam);
		if (fldAction != undefined)
		{
			curObject = curObjectDocParam.TopElem;
			curUserID = curUserIDParam;
			fldLogEntryChild = curObject.workflow_log_entrys.AddChild();
			fldLogEntryChild.create_date = Date();
			fldLogEntryChild.action_id = fldAction.PrimaryKey;
			fldLogEntryChild.person_id = "";
			fldLogEntryChild.person_fullname = "";
			fldLogEntryChild.begin_state = curObject.workflow_state;
			fldLogEntryChild.submited = false;

			oWorkflowActionResult = tools.workflow_action_process(curObjectDocParam, fldAction.PrimaryKey, curObject.workflow_id, teWorkflowParam, null, false);

			fldLogEntryChild.finish_state = curObject.workflow_state;

			oRes.sActionMessage = oWorkflowActionResult.GetOptProperty('workflow_action_message', '');
			
			if(oRes.sActionMessage == '')
				oRes.sActionMessage = oWorkflowActionResult.GetOptProperty('error_text', '');

			if(oRes.sActionMessage == '' && oWorkflowActionResult.GetOptProperty('error', 0) == 0)
			{
				oRes.bActionSuccess = false;
				oRes.bActionBreak = false;
			}
			else
			{
				oRes.bActionSuccess = true;
				oRes.bActionBreak = true;
			}
		}
	}
	catch(err)
	{
		oRes.bActionBreak = true;
		oRes.sActionMessage = "InitCafeteriaWfAction error: " + err;
	}
	return oRes;
}
function ChangeCafeteriaRequestWfState(docRequestPARAM, workflowPARAM, sStatePARAM, curUserIDPARAM)
{
	oRes = {
		"sActionMessage" : "",
		"bActionSuccess" : false,
		"bActionBreak" : false };

	if(docRequestPARAM == undefined || docRequestPARAM == null)
	{
		oRes.sActionMessage = "Произошла ошибка при открытии документа заявки.";
		oRes.bActionSuccess = true;
		oRes.bActionBreak = true;
		return oRes;
	}
	teRequest = docRequestPARAM.TopElem;

	iOrderID = OptInt(teRequest.workflow_fields.ObtainChildByKey("order_id").value, 0);
	docOrder = tools.open_doc( iOrderID );
	teOrder = null;
	if(docOrder != undefined)
		teOrder = docOrder.TopElem;
	if(teOrder == undefined || teOrder == null)
	{
		oRes.sActionMessage = "Произошла ошибка при открытии документа заказа.";
		oRes.bActionSuccess = true;
		oRes.bActionBreak = true;
		return oRes;
	}

	iGoodID = OptInt(teRequest.object_id, 0);
	docGood = tools.open_doc( iGoodID );
	teGood = null;
	if(docGood != undefined)
		teGood = docGood.TopElem;
	if(teGood == undefined || teGood == null)
	{
		oRes.sActionMessage = "Произошла ошибка при открытии документа товара.";
		oRes.bActionSuccess = true;
		oRes.bActionBreak = true;
		return oRes;
	}

	if(sStatePARAM != "st_6")
	{
		oPerson = ArrayOptFirstElem(tools.xquery("for $elem in collaborators where $elem/id = "+curUserIDPARAM+" return $elem/id, $elem/fullname"))
		fldLogEntryChild = teRequest.workflow_log_entrys.AddChild();
		fldLogEntryChild.create_date = Date();
		fldLogEntryChild.person_id = curUserIDPARAM;
		fldLogEntryChild.person_fullname = oPerson != undefined ? oPerson.fullname : "";
		fldLogEntryChild.begin_state = teRequest.workflow_state;
		fldLogEntryChild.finish_state = sStatePARAM;
	}

	switch (sStatePARAM) {
		case "st_1":
		case "st_2":
		case "st_3":
		case "st_4":
			oCurGood = ArrayOptFind(teOrder.goods, "This.good_id == teGood.id");
			if(oCurGood != undefined)
			{
				oCurGood.status = "forming";
				docOrder.Save();
			}
			teRequest.workflow_state = sStatePARAM;
			teRequest.get_workflow_state_name( workflowPARAM );
			teRequest.status_id = "active";
			break;
		case "st_5":
			oCurGood = ArrayOptFind(teOrder.goods, "This.good_id == teGood.id");
			if(oCurGood != undefined)
			{
				oCurGood.status = "agreed";
				docOrder.Save();
			}
			teRequest.workflow_state = sStatePARAM;
			teRequest.get_workflow_state_name( workflowPARAM );
			teRequest.status_id = "close";
			break;
		case "st_6":
			oAction = InitCafeteriaWfAction(docRequestPARAM, curUserIDPARAM, "act_6", workflowPARAM);
			if(oAction.bActionBreak)
			{
				oRes.sActionMessage = oAction.sActionMessage;
				oRes.bActionSuccess = oAction.bActionSuccess;
				oRes.bActionBreak = oAction.bActionSuccess;
			}
			break;
		case "st_7":
		case "st_8":
			oCurGood = ArrayOptFind(teOrder.goods, "This.good_id == teGood.id");
			if(oCurGood != undefined)
			{
				oCurGood.status = "cancel";
				docOrder.Save();
			}
			teRequest.workflow_state = sStatePARAM;
			teRequest.get_workflow_state_name( workflowPARAM );
			teRequest.status_id = "ignore";
			break;
		default:
			break;
	}
	return oRes;
}
	// выборки
/**
 * @typedef {Object} WTRequests
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oRequests[]} requests – Массив объектов с данными по счетам.
*/
/**
 * @function GetRequestsApp
 * @memberof Websoft.WT.Game
 * @description Получение списка заявок сотрудников.
 * @param {bigint[]} aPersons - Массив ID сотрудников
 * @param {string} sObjects - ID объектов заявки, разделенные запятой 
 * @param {string} sStatusIDs - Коды статуса заявки, разделенные запятой 
 * @param {bigint[]} aBudgetPeriods - Массив ID бюджетных периодов
 * @param {bigint[]} aRequestTypes - Массив ID типов заявки
 * @param {bigint[]} aWorkflows - Массив ID документооборотов
 * @param {string} sWorkflowStates - Коды этапов ДО, разделенные запятой 
 * @param {string} sCustomFields - Список кодов настраиваемых полей, которые выводятся из заявки, разделенные запятой 
 * @param {string} sWorkflowFields - Список кодов полей ДО, которые выводятся из заявки, разделенные запятой 
 * @param {string} sReturnData - Указание, какие поля будет возвращать выборка (Все поля / Указанные поля)
 * @param {string[]} aFields - Массив возвращаемых полей
 * @param {string} sFilter - Строка содержащая условия из фильра
 * @param {string} sSearch - Строка поиска
 * @param {oPaging} oPaging - Информация из рантайма о пейджинге
 * @returns {WTRequests}
*/
function GetRequestsApp( aPersons, sObjects, sStatusIDs, aBudgetPeriods, aRequestTypes, aWorkflows, sWorkflowStates, sCustomFields, sWorkflowFields, sReturnData, aFields, sFilter, sSearch, oPaging, oSort )
{
	function getRequestTopElem(request_id)
	{
		teReq = undefined;
		docRequest = tools.open_doc( OptInt(request_id) );
		if( docRequest != undefined )
			teReq = docRequest.TopElem;

		return teReq;
	}
	function addFields( _fields, _source, _object, _prefix )
	{
		if( _source == null || _source == undefined )
		{
			for( _field in _fields )
			{
				_object.SetProperty( _prefix + "" + _field, "" );
			}
		}
		else
		{
			for( _field in _fields )
			{
				if(OptDate(_source.ObtainChildByKey( _field ).value.Value) != undefined)
					_object.SetProperty( _prefix + "" + _field, StrDate(Date(_source.ObtainChildByKey( _field ).value.Value), false, false) );
				else
					_object.SetProperty( _prefix + "" + _field, _source.ObtainChildByKey( _field ).value.Value );
			}
		}
	}

	var oRes = tools.get_code_library_result_object();
	oRes.requests = [];

	try
	{
		if( !IsArray( aPersons ) )
		{
			throw "error";
		}
	}
	catch( err ){ aPersons = [] }

	try
	{
		if( sObjects == undefined || sObjects == null )
		{
			throw "error";
		}
		sObjects = Trim( sObjects );
	}
	catch( err ) { sObjects = "" }

	try
	{
		if( sStatusIDs == undefined || sStatusIDs == null )
		{
			throw "error";
		}
		sStatusIDs = Trim( sStatusIDs );
	}
	catch( err ) { sStatusIDs = "" }

	try
	{
		if( !IsArray( aBudgetPeriods ) )
		{
			throw "error";
		}
	}
	catch( err ){ aBudgetPeriods = [] }

	try
	{
		if( !IsArray( aRequestTypes ) )
		{
			throw "error";
		}
	}
	catch( err ){ aRequestTypes = [] }

	try
	{
		if( !IsArray( aWorkflows ) )
		{
			throw "error";
		}
	}
	catch( err ){ aWorkflows = [] }

	try
	{
		if( sWorkflowStates == undefined || sWorkflowStates == null )
		{
			throw "error";
		}
		sWorkflowStates = Trim( sWorkflowStates );
	}
	catch( err ) { sWorkflowStates = "" }

	try
	{
		if( sCustomFields == undefined || sCustomFields == null )
		{
			throw "error";
		}
		sCustomFields = Trim( sCustomFields );
	}
	catch( err ) { sCustomFields = "" }

	try
	{
		if( sWorkflowFields == undefined || sWorkflowFields == null )
		{
			throw "error";
		}
		sWorkflowFields = Trim( sWorkflowFields );
	}
	catch( err ) { sWorkflowFields = "" }

	try
	{
		if( sReturnData == undefined || sReturnData == "" || sReturnData == null )
		{
			throw "error";
		}
	}
	catch( err ){ sReturnData = "selected" }

	try
	{
		if( !IsArray( aFields ) )
		{
			throw "error";
		}
	}
	catch( err ){ aFields = new Array(); }

	try
	{
		if( sSearch == undefined || sSearch == null )
		{
			throw "error";
		}
		sSearch = String( sSearch );
	}
	catch( err ) { sSearch = "" }

	try
	{
		if( sFilter == undefined || sFilter == null )
		{
			throw "error";
		}
		sFilter = String( sFilter );
	}
	catch( err ) { sFilter = "" }

	try
	{
		if( ObjectType( oPaging ) != "JsObject" )
		{
			throw "error";
		}
	}
	catch( err ) { oPaging = ({}) }

	try
	{
		if( ObjectType( oSort ) != "JsObject" )
		{
			throw "error";
		}
	}
	catch( err ) { oSort = ({}); }

	var xarrRequests = new Array();
	var conds = new Array();
	
	if( ArrayOptFirstElem(aPersons) != undefined )
	{
		conds.push( "MatchSome( $elem_qc/person_id, ("+ArrayMerge( aPersons, "This", "," )+") )" );
	}

	if( sObjects != "" )
	{
		conds.push( "MatchSome( $elem_qc/object_id, ("+sObjects+") )" );
	}

	if( sStatusIDs != "" )
	{
		conds.push( "MatchSome( $elem_qc/status_id, ('"+StrReplace( sStatusIDs, ",", "','" )+"') )" );
	}

	if( ArrayOptFirstElem(aBudgetPeriods) != undefined )
	{
		conds.push( "MatchSome( $elem_qc/budget_period_id, ("+ArrayMerge( aBudgetPeriods, "This", "," )+") )" );
	}

	if( ArrayOptFirstElem(aRequestTypes) != undefined )
	{
		conds.push( "MatchSome( $elem_qc/request_type_id, ("+ArrayMerge( aRequestTypes, "This", "," )+") )" );
	}

	if( ArrayOptFirstElem(aWorkflows) != undefined )
	{
		conds.push( "MatchSome( $elem_qc/workflow_id, ("+ArrayMerge( aWorkflows, "This", "," )+") )" );
	}

	if( sWorkflowStates != "" )
	{
		conds.push( "MatchSome( $elem_qc/workflow_state, ('"+StrReplace( sWorkflowStates, ",", "','" )+"') )" );
	}

	if(sFilter != "")
	{
		conds.push( Trim(StrReplace(sFilter, "elem", "elem_qc")) );
	}

	if( sSearch != "" )
	{
		conds.push( "doc-contains( $elem_qc/id, 'wt_data', " + XQueryLiteral( sSearch ) + " )" );
	}

	var sOrderQuery = "";
	if( oSort.GetOptProperty( "FIELD" ) != undefined && oSort.GetOptProperty( "FIELD" ) != null )
	{
		if(!StrContains(oSort.GetOptProperty( "FIELD" ), "wf_") && !StrContains(oSort.GetOptProperty( "FIELD" ), "cf_"))
		{
			switch( oSort.GetOptProperty( "FIELD" ) )
			{
				default:
					sOrderQuery = " order by $elem_qc/" + oSort.FIELD;
					break;
			}
		}
		if( sOrderQuery != "" )
		{
			sOrderQuery += ( StrUpperCase( oSort.DIRECTION ) == "DESC" ? " descending" : "" );
		}
	}

	xarrRequests = tools.xquery( "for $elem_qc in requests "+ ( ArrayOptFirstElem( conds ) != undefined ? ( "where " + ArrayMerge( conds, "This", " and " ) ) : "" ) + sOrderQuery + " return $elem_qc" );
	xarrRequests = tools.call_code_library_method( "libMain", "select_page_sort_params", [ xarrRequests, oPaging, ({}) ] ).oResult;

	switch( sReturnData )
	{
		case "all":
			aFields = new Array();
			_array_fields = tools.new_doc_by_name( "request", true ).TopElem.AddChild();
			for( _field in _array_fields )
			{
				if( !_field.IsTemp )
				{
					aFields.push( _field.Name );
				}
			}
			break;
	}
	for( oRequest in xarrRequests )
	{
		oRow = new Object();
		for(_field in aFields)
		{
			switch(_field) 
			{
				case "":
					break;
				default:
					if( oRequest.ChildExists( _field ) )
					{
						if(OptDate(RValue( oRequest.Child( _field ) )) != undefined)
							oRow.SetProperty( _field, StrDate(Date(RValue( oRequest.Child( _field ) )), false, false) );
						else
							oRow.SetProperty( _field, RValue( oRequest.Child( _field ) ) );
					}
					break;
			}
		}
		if(sWorkflowFields != "")
		{
			teRequest = getRequestTopElem(oRequest.id);
			if( teRequest != undefined )
				addFields( sWorkflowFields.split(","), teRequest.workflow_fields, oRow, "wf_" )
			else
				addFields( sWorkflowFields.split(","), null, oRow, "wf_" )
		}
		if(sCustomFields != "")
		{
			teRequest = ( teRequest == undefined ) ? getRequestTopElem(oRequest.id) : teRequest;
			if( teRequest != undefined )
				addFields( sCustomFields.split(","), teRequest.custom_elems, oRow, "cf_" )
			else
				addFields( sCustomFields.split(","), null, oRow, "cf_" );
		}
		oRes.requests.push(oRow);
	}

	return oRes;
}
/**
 * @typedef {Object} oAccounts
 * @property {bigint} id
 * @property {string} fullname
 * @property {string} email
 * @property {string} balance
 * @property {string} summ_spend
 * @property {boolean} is_dismiss
 * @property {string} code
 * @property {number} budget_period
 * @property {string} currency
 * @property {string} status
*/
/**
 * @typedef {Object} WTAccounts
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oAccounts[]} accounts – Массив объектов с данными по счетам.
*/
/**
 * @function GetCafeAccounts
 * @memberof Websoft.WT.Game
 * @description Получение списка счетов сотрудников.
 * @param {bigint[]} arrCollIDs - Массив сотрудников, для которых необходимо вернуть счета
 * @param {XmElem} teApp - TopElem приложения.
 * @param {string} sPersonState - Указание, счета каких сотрудников будут показаны (Все, уволенные, неуволенные)
 * @param {bigint[]} arrBudgetPeriodIDs - Массив ID бюджетных периодов
 * @param {string} sBpSourse - Выбор поля источника БП в приложении 
 * @param {string} sCurrencyTypeIDs - Коды валют счета, разделенные запятой 
 * @param {string} sReturnData - Указание, какие поля будет возвращать выборка (Все поля / Указанные поля)
 * @param {string[]} arrFields - Массив возвращаемых полей
 * @param {string} sFilter - Строка содержащая условия из фильра
 * @param {string} sSearch - Строка поиска
 * @param {oPaging} oPaging - Информация из рантайма о пейджинге
 * @returns {WTAccounts}
*/
function GetCafeAccounts( arrCollIDs, teApp, sPersonState, arrBudgetPeriodIDs, sBpSourse, sCurrencyTypeIDs, sReturnData, arrFields, sFilter, sSearch, oPaging, oSort )
{
	var oRes = tools.get_code_library_result_object();
	oRes.accounts = [];

	try
	{
		if( !IsArray( arrCollIDs ) )
		{
			throw "error";
		}
	}
	catch( err ) { arrCollIDs = new Array(); }

	try
	{
		iApplicationID = OptInt( iApplicationID, null );
	}
	catch( err ) { iApplicationID = null; }

	try
	{
		if( sPersonState == undefined || sPersonState == null || sPersonState == "" )
		{
			throw "error";
		}
		sPersonState = String( sPersonState );
	}
	catch( err ) { sPersonState = "all"; }

	try
	{
		if( !IsArray( arrBudgetPeriodIDs ) )
		{
			throw "error";
		}
	}
	catch( err ) { arrBudgetPeriodIDs = new Array(); }

	try
	{
		if( sBpSourse == undefined || sBpSourse == "" || sBpSourse == null )
		{
			throw "error";
		}
	}
	catch( err ) { sBpSourse = "current"; }
	
	try
	{
		if( sCurrencyTypeIDs == undefined || sCurrencyTypeIDs == "" || sCurrencyTypeIDs == null )
		{
			throw "error";
		}
	}
	catch( err ) { sCurrencyTypeIDs = ""; }

	try
	{
		if( sReturnData == undefined || sReturnData == "" || sReturnData == null )
		{
			throw "error";
		}
	}
	catch( err ) { sReturnData = "all"; }

	try
	{
		if( !IsArray( arrFields ) || ArrayOptFirstElem(arrFields) == undefined )
		{
			throw "error";
		}
	}
	catch( err ) { arrFields = String( "fullname;email;balance;currency;status" ).split( ";" ); }

	try
	{
		if( sFilter == undefined || sFilter == null )
		{
			throw "error";
		}
		sFilter = String( sFilter );
	}
	catch( err ) { sFilter = ""; }

	try
	{
		if( sSearch == undefined || sSearch == null )
		{
			throw "error";
		}
		sSearch = String( sSearch );
	}
	catch( err ) { sSearch = ""; }

	try
	{
		if( ObjectType( oPaging ) != "JsObject" )
		{
			throw "error";
		}
	}
	catch( err ) { oPaging = ({}); }

	try
	{
		if( ObjectType( oSort ) != "JsObject" )
		{
			throw "error";
		}
	}
	catch( err ) { oSort = ({}); }

	var acc_conds = new Array();
	var colls_conds = new Array();
	var xarrAccounts = new Array();
	var xarrColls = new Array();

	if( ArrayOptFirstElem(arrCollIDs) != undefined )
		colls_conds.push( "MatchSome( $elem_qc/id, ("+ArrayMerge(arrCollIDs, "This", ",")+") )" );
	switch (sPersonState)
	{
		case "dismissed":
			colls_conds.push( "$elem_qc/is_dismiss = true()" );
			break;
		case "not_dismissed":
			colls_conds.push( "$elem_qc/is_dismiss = false()" );
			break;
	}

	xarrColls = tools.xquery("for $elem_qc in collaborators "+ ( ArrayOptFirstElem( colls_conds ) != undefined ? ( " where " + ArrayMerge( colls_conds, "This", " and " ) ) : "" ) + " return $elem_qc/Fields( 'id', 'fullname', 'email', 'is_dismiss' )");

	if( ArrayOptFirstElem(xarrColls) != undefined )
	{
		acc_conds.push( "MatchSome( $elem_qc/object_id, ("+ArrayMerge(xarrColls, "This.id", ",")+") )" );
	}
	else
	{
		oRes.error = 1;
		oRes.message = "Не найдено сотрудников, удовлетворяющих условиям поиска.";
		return oRes;
	}

	if(sFilter != "")
	{
		acc_conds.push( Trim(StrReplace(sFilter, "elem", "elem_qc")) );
	}

	if( sSearch != "" )
	{
		acc_conds.push( "doc-contains( $elem_qc/id, 'wt_data', " + XQueryLiteral( sSearch ) + " )" );
	}

	if( ArrayOptFirstElem( arrBudgetPeriodIDs ) != undefined )
	{
		acc_conds.push( "MatchSome( $elem_qc/budget_period_id, ( " + ArrayMerge( arrBudgetPeriodIDs, "This", "," ) + " ) )" );
	}
	else
	{
		if( teApp != null && teApp != undefined )
		{
			switch (sBpSourse) {
				case "current":
					sBpIds = teApp.wvars.ObtainChildByKey( "budget_period_label.current_period" ).value;
					if( OptInt(sBpIds) != undefined )
					{
						arrBudgetPeriodIDs.push(OptInt(sBpIds));
					}
					else
					{
						if(StrBegins(sBpIds, "["))
						{
							for( _bp in ArrayMerge(ParseJson(sBpIds), "This.__value", ",").split(",") )
							{
								arrBudgetPeriodIDs.push(OptInt(_bp, 0));
							}
						}
						else
						{
							arrBudgetPeriodIDs.push(0);
						}
					}
					break;
				case "old":
					sBpIds = teApp.wvars.ObtainChildByKey( "budget_period_label.previous_periods" ).value;
					if( OptInt(sBpIds) != undefined )
					{
						arrBudgetPeriodIDs.push(OptInt(sBpIds));
					}
					else
					{
						if(StrBegins(sBpIds, "["))
						{
							for( _bp in ArrayMerge(ParseJson(sBpIds), "This.__value", ",").split(",") )
							{
								arrBudgetPeriodIDs.push(OptInt(_bp, 0));
							}
						}
						else
						{
							arrBudgetPeriodIDs.push(0);
						}
					}
					break;
				case "all":
					sCurBpIds = teApp.wvars.ObtainChildByKey( "budget_period_label.current_period" ).value;
					if( OptInt(sCurBpIds) != undefined )
					{
						arrBudgetPeriodIDs.push(OptInt(sCurBpIds));
					}
					else
					{
						if(StrBegins(sCurBpIds, "["))
						{
							for( _bp in ArrayMerge(ParseJson(sCurBpIds), "This.__value", ",").split(",") )
							{
								arrBudgetPeriodIDs.push(OptInt(_bp, 0));
							}
						}
						else
						{
							arrBudgetPeriodIDs.push(0);
						}
					}
					sPrevBpIds = teApp.wvars.ObtainChildByKey( "budget_period_label.previous_periods" ).value;
					if( OptInt(sPrevBpIds) != undefined )
					{
						arrBudgetPeriodIDs.push(OptInt(sPrevBpIds));
					}
					else
					{
						if(StrBegins(sPrevBpIds, "["))
						{
							for( _bp in ArrayMerge(ParseJson(sPrevBpIds), "This.__value", ",").split(",") )
							{
								arrBudgetPeriodIDs.push(OptInt(_bp, 0));
							}
						}
						else
						{
							arrBudgetPeriodIDs.push(0);
						}
					}
					break;
			}
		}
		if( ArrayOptFirstElem( arrBudgetPeriodIDs ) != undefined )
		{
			acc_conds.push( "MatchSome( $elem_qc/budget_period_id, ( " + ArrayMerge( arrBudgetPeriodIDs, "This", "," ) + " ) )" );
		}
	}

	if( sCurrencyTypeIDs != "" )
	{
		acc_conds.push( "MatchSome( $elem_qc/currency_type_id, ( '" + StrReplace( sCurrencyTypeIDs, ",", "','" ) + "' ) )" );
	}
	else
	{
		if( teApp != null && teApp != undefined )
		{
			sCurrencyTypeIDs = Trim(teApp.wvars.ObtainChildByKey( "currency_label.currencies" ).value);
		}
		if( sCurrencyTypeIDs != "" )
		{
			acc_conds.push( "MatchSome( $elem_qc/currency_type_id, ( '" + StrReplace( sCurrencyTypeIDs, ",", "','" ) + "' ) )" );
		}
		else
		{
			acc_conds.push( "$elem_qc/currency_type_id = 'thanks'" );
		}
	}

	var sOrderQuery = "";
	var sFullnameSort = "";
	if( oSort.GetOptProperty( "FIELD" ) != undefined && oSort.GetOptProperty( "FIELD" ) != null )
	{
		switch( oSort.GetOptProperty( "FIELD" ) )
		{
			case "fullname":
				sFullnameSort = ", $coll in collaborators ";
				acc_conds.push("$elem_qc/object_id = $coll/id");
				sOrderQuery = " order by $coll/fullname";
				break;
			case "email":
				break;
			case "summ_spend":
				break;
			case "is_dismiss":
				break;
			case "currency":
				sOrderQuery = " order by $elem_qc/currency_type_id";
				break;
			case "budget_period":
				sOrderQuery = " order by ForeignElem( $elem_qc/budget_period_id )/name";
				break;
			default:
				sOrderQuery = " order by $elem_qc/" + oSort.FIELD;
				break;
		}
		if( sOrderQuery != "" )
		{
			sOrderQuery += ( StrUpperCase( oSort.DIRECTION ) == "DESC" ? " descending" : "" );
		}
	}
	xarrAccounts = tools.xquery("for $elem_qc in accounts " + sFullnameSort + ( ArrayOptFirstElem( acc_conds ) != undefined ? ( "where " + ArrayMerge( acc_conds, "This", " and " ) ) : "" ) + sOrderQuery + " return $elem_qc");

	if(sReturnData == "all" || ArrayOptFind(arrFields, "This == 'summ_spend'") != undefined)
	{
		xarrTransactions = tools.xquery("for $elem_qc in transactions where $elem_qc/direction = 2 " + ( ArrayOptFirstElem( xarrAccounts ) != undefined ? ( "and MatchSome( $elem_qc/account_id, ("+ArrayMerge(xarrAccounts, "This.id", ",")+") )" ) : "" ) + " return $elem_qc/Fields('id', 'account_id', 'person_id', 'amount')");
	}

	xarrAccounts = tools.call_code_library_method( "libMain", "select_page_sort_params", [ xarrAccounts, oPaging, ({}) ] ).oResult;

	for(oAcc in xarrAccounts)
	{
		oPerson = ArrayOptFind(xarrColls, "This.id == oAcc.object_id");
		oElem = {
			id: oAcc.id,
			person_id: "",
			fullname: "",
			balance: "",
			summ_spend: "",
			is_dismiss: false,
			code: "",
			budget_period: "",
			currency: "",
			status: ""
		}
		switch (sReturnData) 
		{
			case "all":
				oBudgetPeriod = oAcc.budget_period_id.OptForeignElem;
				oCurrency = lists.currency_types.GetOptChildByKey(oAcc.currency_type_id.Value);
				oStatus = common.account_status_types.GetOptChildByKey(oAcc.status.Value);
				aCurPersonTransactions = ArraySelect(xarrTransactions, "This.account_id == oAcc.id && This.person_id == oAcc.object_id");

				oElem.person_id = ""+oPerson.id.Value;
				oElem.fullname = ""+oPerson.fullname.Value;
				oElem.email = ""+oPerson.email.Value;
				oElem.balance = ""+oAcc.balance.Value;
				oElem.summ_spend = ( ArrayOptFirstElem( aCurPersonTransactions ) != undefined ) ? ArraySum( aCurPersonTransactions, "OptReal(This.amount, 0)") : "-"; 
				oElem.is_dismiss = tools_web.is_true(oPerson.is_dismiss);
				oElem.code = ""+oAcc.code.Value;
				oElem.budget_period = oBudgetPeriod != undefined ? ""+oBudgetPeriod.name.Value : "-";
				oElem.currency = ( oCurrency == undefined ) ? "-" : ""+oCurrency.name.Value;
				oElem.status = ( oStatus == undefined ) ? "-" : ""+oStatus.name.Value;
				break;
			case "selected":
				for(_field in arrFields)
				{
					switch (_field) 
					{
						case "person_id":
							oElem.SetProperty("person_id", ""+oPerson.id.Value);
							break;
						case "fullname":
							oElem.SetProperty("fullname", ""+oPerson.fullname.Value);
							break;
						case "email":
							oElem.SetProperty("email", ""+oPerson.email.Value);
							break;
						case "summ_spend":
							aCurPersonTransactions = ArraySelect(xarrTransactions, "This.account_id == oAcc.id && This.person_id == oAcc.object_id");
							oElem.SetProperty("summ_spend", ( ArrayOptFirstElem( aCurPersonTransactions ) != undefined  ? ArraySum( aCurPersonTransactions, "OptReal(This.amount, 0)") : "-" ) );
							break;
						case "is_dismiss":
							oElem.SetProperty( "is_dismiss", tools_web.is_true(oPerson.is_dismiss) );
							break;
						case "budget_period":
							oBudgetPeriod = oAcc.budget_period_id.OptForeignElem;
							oElem.SetProperty( "budget_period", ( oBudgetPeriod != undefined ? ""+oBudgetPeriod.name.Value : "-" ) );
							break;
						case "status":
							oStatus = common.account_status_types.GetOptChildByKey(oAcc.status.Value);
							oElem.SetProperty( "status", ( oStatus == undefined ? "-" : ""+oStatus.name.Value ) );
							break;
						case "currency":
							oCurrency = lists.currency_types.GetOptChildByKey(oAcc.currency_type_id.Value);
							oElem.SetProperty( "currency", ( oCurrency == undefined ? "-" : ""+oCurrency.name.Value ) );
							break;
						default:
							if( oAcc.ChildExists( _field ) )
								oElem.SetProperty( _field, RValue( oAcc.Child( _field ) ) );
							break;
					}
				}
				break;
		}
		oRes.accounts.push(oElem);
	}
	return oRes;
}
/**
 * @typedef {Object} oCollaborators
 * @property {number} id 
 * @property {string} fullname 
 * @property {string} position_name 
 * @property {string} position_parent_name 
 * @property {string} has_account 
*/
/**
 * @typedef {Object} WTCollaborators
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oCollaborators[]} collaborators – Массив объектов с данными по сотрудникам.
*/
/**
 * @function GetCafeCollaborators
 * @memberof Websoft.WT.Game
 * @description Получение списка сотрудников относительно уровня доступа к приложению Кафетерий льгот
 * @param {bigint} iCurUserID - Массив ID сотрудников
 * @param {string} iApplicationID - ID / код приложения
 * @param {bigint[]} aBossTypes - Массив ID бюджетных периодов
 * @param {boolean} bShowDissmiss - Флаг, показывать уволенных
 * @param {string} sFilter - Строка содержащая условия из фильра
 * @param {string} sSearch - Строка поиска
 * @param {object} oPaging - Информация из рантайма о пейджинге
 * @returns {WTCollaborators}
*/
function GetCafeCollaborators(iCurUserID, iApplicationID, aBossTypes, bShowDissmiss, sFilter, sSearch, oSort, oPaging)
{
	var oRes = tools.get_code_library_result_object();
	oRes.collaborators = [];

	if(OptInt(iCurUserID) == undefined)
	{
		oRes.error = 1;
		oRes.message = "Не определен текущий пользователь.";
		return oRes;
	}
	try
	{
		if( sFilter == undefined || sFilter == null )
		{
			throw "error";
		}
		sFilter = String( sFilter );
	}
	catch( err ) { sFilter = ""; }
	try
	{
		if( sSearch == undefined || sSearch == null )
		{
			throw "error";
		}
		sSearch = String( sSearch );
	}
	catch( err ) { sSearch = ""; }
	try
	{
		if( ObjectType( oSort ) != "JsObject" )
		{
			throw "error";
		}
	}
	catch( err ) { oSort = ({}); }
	try
	{
		if( ObjectType( oPaging ) != "JsObject" )
		{
			throw "error";
		}
	}
	catch( err ) { oPaging = ({}); }

	arrCollIDs = new Array();
	arrCollaborators = new Array();
	arrAccounts = new Array();
	arrBudgetPeriodIDs = new Array();
	conds = new Array();
	
	teApplication = tools_app.get_application(iApplicationID);
	if(teApplication == undefined)
	{
		oRes.error = 1;
		oRes.message = "Не удалось открыть документ приложения.";
		return oRes;
	}

	arrCollIDs = GetPersonSubordinatesApp( teApplication, aBossTypes, iCurUserID );
	if(ArrayOptFirstElem(arrCollIDs) != undefined)
	{
		conds.push("MatchSome( $elem/id, ("+ArrayMerge(arrCollIDs, "This", ",")+") )")
	}
	if(!tools_web.is_true(bShowDissmiss))
	{
		conds.push("$elem/is_dismiss = false()");
	}
	if(sFilter != "")
	{
		conds.push( Trim(sFilter, "elem") );
	}
	if(sSearch != "")
	{
		conds.push( "doc-contains( $elem/id, 'wt_data', " + XQueryLiteral( sSearch ) + " )" );
	}

	var sOrderQuery = "";
	if( oSort.GetOptProperty( "FIELD" ) != undefined && oSort.GetOptProperty( "FIELD" ) != null )
	{
		switch( oSort.GetOptProperty( "FIELD" ) )
		{
			case "has_account":
				break;
			default:
				sOrderQuery = " order by $elem/" + oSort.FIELD;
				break;
		}
		if( sOrderQuery != "" )
		{
			sOrderQuery += ( StrUpperCase( oSort.DIRECTION ) == "DESC" ? " descending" : "" );
		}
	}
	
	arrCollaborators = tools.xquery("for $elem in collaborators "+ ( ArrayOptFirstElem( conds ) != undefined ? ( " where " + ArrayMerge( conds, "This", " and " ) ) : "" ) + sOrderQuery + " return $elem");
	arrCollaborators = tools.call_code_library_method( "libMain", "select_page_sort_params", [ arrCollaborators, oPaging, ({}) ] ).oResult;

	sCurrencyTypeIDs = Trim(teApplication.wvars.ObtainChildByKey( "currency_label.currencies" ).value);
	sBpIds = teApplication.wvars.ObtainChildByKey( "budget_period_label.current_period" ).value;
	if( OptInt(sBpIds) != undefined )
	{
		arrBudgetPeriodIDs.push(sBpIds);
	}
	else
	{
		if(StrBegins(sBpIds, "["))
		{
			for( _bp in ArrayMerge(ParseJson(sBpIds), "This.__value", ",").split(",") )
			{
				arrBudgetPeriodIDs.push(OptInt(_bp, 0));
			}
		}
		else
		{
			arrBudgetPeriodIDs.push(0);
		}
	}
	arrAccounts = tools.xquery("for $elem in accounts where \
MatchSome( $elem/object_id, ("+ArrayMerge(arrCollaborators, "This.id", ",")+") ) and \
MatchSome( $elem/budget_period_id, ( " + ArrayMerge( arrBudgetPeriodIDs, "This", "," ) + " ) ) and \
MatchSome( $elem/currency_type_id, ( '" + StrReplace( sCurrencyTypeIDs, ",", "','" ) + "' ) ) and \
$elem/status = 'active' return $elem/id, $elem/object_id");
	for(_person in arrCollaborators)
	{
		oElem = new Object();
		oElem.id = _person.id;
		oElem.fullname = _person.fullname;
		oElem.position_name = _person.position_name;
		oElem.position_parent_name = _person.position_parent_name;
		oElem.has_account = ArrayOptFind(arrAccounts, "This.object_id == _person.id") != undefined ? "Да" : "Нет";
		oRes.collaborators.push(oElem);
	}
	return oRes;
}

/**
 * @typedef {Object} oQualification
 * @property {bigint} id
 * @property {string} code - Код
 * @property {string} name - Название
 * @property {bool} is_reward - является наградой
 * @property {string} status_name - Название статуса
 * @property {string} status - Код статуса
*/
/**
 * @typedef {Object} ReturnQualifications
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oQualification[]} array – массив квалификаций
*/
/**
 * @function GetQualifications
 * @memberof Websoft.WT.Game
 * @author AKh
 * @description коллекция квалификаций
 * @param {string[]} aStates - статусы квалификаций
 * @param {string[]} aTypes - типы квалификаций
 * @param {string} sXQueryQual - строка XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnQualifications}
 */
function GetQualifications( aStates, aTypes, sXQueryQual, oCollectionParams)
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	oRes.paging = oCollectionParams.paging;
	
	var arrConds = [];
	var arrFilters = oCollectionParams.filters;
	
	if ( aStates != undefined && aStates != null && IsArray(aStates) && ArrayOptFirstElem(aStates) != undefined)
	{
		arrConds.push("MatchSome($elem/status, (" + ArrayMerge(aStates, 'XQueryLiteral(This)', ',') + "))");
	}
	
	if ( aTypes != undefined && aTypes != null && IsArray(aTypes) && ArrayOptFirstElem(aTypes) != undefined)
	{
		if( aTypes.indexOf("badge") >= 0 && aTypes.indexOf("award") >= 0)
		{
			arrConds.push("($elem/is_reward = true() or $elem/is_reward = null())");
		}
		else if( aTypes.indexOf("badge") >= 0 )
		{
			arrConds.push("$elem/is_reward = null()")
		}
		else if ( aTypes.indexOf("award") >= 0 )
		{
			arrConds.push("$elem/is_reward = true()")
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
			case "award":
				sSortConds = " order by $elem/is_reward"
				break;
			case "status_name":
			case "status":
				sSortConds = " order by $elem/status"
				break;
			case "default":
				sSortConds = " order by $elem/name"
				break;
		}
		if(sSortConds != "" && oCollectionParams.sort.DIRECTION == "DESC")
			sSortConds += " descending";
	}
	
	var sConds = (ArrayOptFirstElem(arrConds) != undefined) ? " where " + ArrayMerge(arrConds, "This", " and ") : "";
	var sReqQualifications = "for $elem in qualifications " + sConds + sSortConds + " return $elem";
	var xarrQualifications = tools.xquery(sReqQualifications);
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		xarrQualifications = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ xarrQualifications, oCollectionParams.paging, ({}) ] ).oResult;
	}
	
	for ( catQualification in xarrQualifications )
	{
		docQualification = tools.open_doc(catQualification.id);
		if (docQualification == undefined)
		{
			continue
		}
		
		oElem = {
			id: catQualification.id.Value,
			code: catQualification.code.Value,
			name: catQualification.name.Value,
			is_reward: (tools_web.is_true(catQualification.is_reward.Value) ? true : false),
			status_name: (catQualification.status.OptForeignElem != undefined ? catQualification.status.ForeignElem.name : ''),
			status: catQualification.status.Value
		};
		
		oRes.array.push(oElem);
	}
	
	return oRes;
}

/**
 * @typedef {Object} oQualificationAssignment
 * @property {bigint} id
 * @property {string} person_fullname - ФИО сотрудника в присвоении квалификации
 * @property {string} sender_fullname - ФИО отправителя в присвоении квалификации
 * @property {string} qualification_name - Название квалификации в присвоении квалификации
 * @property {date} assignment_date - дата присвоения квалификации
 * @property {date} expiration_date - дата истечения присвоения квалификации
 * @property {string} competence_name - Компетенция, указанная в присвоении квалификации
 * @property {string} reason - Основание из присвоения квалификации
 * @property {string} status - статус
*/
/**
 * @typedef {Object} ReturnQualificationAssignments
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oQualificationAssignment[]} array – массив присвоений квалификаций
*/
/**
 * @function GetQualificationAssignments
 * @memberof Websoft.WT.Game
 * @author AKh
 * @description коллекция присвоений квалификаций
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {string} sAccessType - Тип доступа: "admin"/"manager"/"hr"/"observer"/"auto"
 * @param {string} sApplication - код приложения для определения доступа
 * @param {string[]} aStates - статусы присвоенных квалификаций
 * @param {string[]} aTypes - типы присвоенных квалификаций
 * @param {string} sXQueryQual - строка XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnQualificationAssignments}
 */
function GetQualificationAssignments( iCurUserID, sAccessType, sApplication, aStates, aTypes, sXQueryQual, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	oRes.paging = oCollectionParams.paging;
	
	var arrConds = [];
	var arrFilters = oCollectionParams.filters;
	iCurUserID = OptInt( iCurUserID, 0);
	if ( sAccessType != "auto" && sAccessType != "admin" && sAccessType != "manager" && sAccessType != "observer" && sAccessType != "hr" )
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
	
	switch(sAccessType)
	{
		case "hr":
		{
			iApplicationID = OptInt(sApplication);
			if(iApplicationID == undefined)
			{
				iApplicationID = ArrayOptFirstElem(tools.xquery("for $elem in applications where $elem/code = " + XQueryLiteral(sApplication) + " return $elem/Fields('id')"), {id: 0}).id
			}
			var iAppHRManagerTypeID = tools.call_code_library_method("libApplication", "GetApplicationHRBossTypeID", [ iApplicationID, iCurUserID ])
			var arrSubordinateID = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, '', null, '', true, true, true, true, (iAppHRManagerTypeID == null ? [] : [iAppHRManagerTypeID]) ] );
			arrConds.push("MatchSome($elem/person_id, (" + ArrayMerge(arrSubordinateID, "This", ",") + "))");
			break;
		}
		case "observer":
		{
			var arrSubordinateID = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, '', null, '', true, true, true, true, [] ] );
			arrConds.push("MatchSome($elem/person_id, (" + ArrayMerge(arrSubordinateID, "This", ",") + "))");
			break;
		}
	}
	
	if ( aStates != undefined && aStates != null && IsArray(aStates) && ArrayOptFirstElem(aStates) != undefined)
	{
		arrConds.push("MatchSome($elem/status, (" + ArrayMerge(aStates, 'XQueryLiteral(This)', ',') + "))");
	}
	
	if ( aTypes != undefined && aTypes != null && IsArray(aTypes) && ArrayOptFirstElem(aTypes) != undefined)
	{
		if( aTypes.indexOf("badge") >= 0 && aTypes.indexOf("reward") >= 0)
		{
			arrConds.push("($elem/is_reward = true() or $elem/is_reward = null() or $elem/is_reward = false())");
		}
		else if( aTypes.indexOf("badge") >= 0 )
		{
			arrConds.push("($elem/is_reward = null() or $elem/is_reward = false())")
		}
		else if ( aTypes.indexOf("reward") >= 0 )
		{
			arrConds.push("$elem/is_reward = true()")
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
	
	var sSortConds = "";
	if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		switch(sFieldName)
		{
			case "person_fullname":
				sSortConds = " order by $elem/person_fullname";
				break;
			case "sender_fullname":
				sSortConds = " order by $elem/sender_id";
				break;
			case "qualification_name":
				sSortConds = " order by $elem/qualification_id";
				break;
			case "assignment_date":	
				sSortConds = " order by $elem/assignment_date";
				break;
			case "expiration_date":	
				sSortConds = " order by $elem/expiration_date";
				break;
			case "competence_name":	
				sSortConds = " order by $elem/competence_id";
				break;
			case "reason":	
				sSortConds = " order by $elem/reason";
				break;
			case "default":
				sSortConds = " order by $elem/name";
				break;
		}
		if(sSortConds != "" && oCollectionParams.sort.DIRECTION == "DESC")
			sSortConds += " descending";
	}
	
	var sConds = (ArrayOptFirstElem(arrConds) != undefined) ? " where " + ArrayMerge(arrConds, "This", " and ") : "";
	var sReqQualificationAssignments = "for $elem in qualification_assignments " + sConds + sSortConds + " return $elem";
	var xarrQualificationAssignments = tools.xquery(sReqQualificationAssignments);
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		xarrQualificationAssignments = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ xarrQualificationAssignments, oCollectionParams.paging, ({}) ] ).oResult;
	}
	
	for ( catQualificationAssignment in xarrQualificationAssignments )
	{
		docQualificationAssignment = tools.open_doc(catQualificationAssignment.id);
		if (docQualificationAssignment == undefined)
		{
			continue
		}
		
		oElem = {
			id: catQualificationAssignment.id.Value,
			person_fullname: (catQualificationAssignment.person_fullname.HasValue != undefined ? catQualificationAssignment.person_fullname.Value : ''),
			sender_fullname: (catQualificationAssignment.sender_id.OptForeignElem != undefined ? catQualificationAssignment.sender_id.ForeignElem.fullname : ''),
			qualification_name: (catQualificationAssignment.qualification_id.OptForeignElem != undefined ? catQualificationAssignment.qualification_id.ForeignElem.name : ''),
			assignment_date: (catQualificationAssignment.assignment_date.HasValue ? StrDate(catQualificationAssignment.assignment_date, false) : ''),
			expiration_date: (catQualificationAssignment.expiration_date.HasValue ? StrDate(catQualificationAssignment.expiration_date, false) : ''),
			competence_name: (catQualificationAssignment.competence_id.OptForeignElem != undefined ? catQualificationAssignment.competence_id.ForeignElem.name : ''),
			reason: catQualificationAssignment.reason,
			status: (catQualificationAssignment.status.OptForeignElem != undefined ? catQualificationAssignment.status.OptForeignElem.name : '' )
		};
		
		oRes.array.push(oElem);
	}
	
	return oRes;
}

/**
 * @typedef {Object} oCurrencie
 * @property {string} code - Код
 * @property {string} name - Название валюты
 * @property {string} short_name - Сокращенное название
 * @property {string} cent_name - Дробное название
 * @property {string} status - Статус
 * @property {bool} is_infinite - Бесконечная
*/
/**
 * @typedef {Object} ReturnCurrencies
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oCurrencie[]} array – массив валют
*/
/**
 * @function GetCurrencies
 * @memberof Websoft.WT.Game
 * @author AKh
 * @description коллекция валют
 * @param {string[]} aStates - статусы валют
 * @param {string[]} aTypes - типы валют
 * @param {string} sSearch - строка поиска
 * @returns {ReturnCurrencies}
 */
function GetCurrencies( aStates, aTypes, sSearch )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	
	var arrRewards = get_rewards();
	var arrCurrencies = get_currencies();	
	
	if ( aTypes != undefined && aTypes != null && IsArray(aTypes) && ArrayOptFirstElem(aTypes) != undefined )
	{
		if ( aTypes.indexOf("currency") >= 0 && aTypes.indexOf("awards") >= 0 )
		{
			arrCurrencies = ArrayUnion(arrRewards, arrCurrencies);
		}
		else if (aTypes.indexOf("currency") < 0 && aTypes.indexOf("awards") >= 0)
		{
			arrCurrencies = arrRewards;
		}
	}
	else
	{
		return oRes;
	}
	
	if ( aStates != undefined && aStates != null && IsArray(aStates) && ArrayOptFirstElem(aStates) != undefined )
	{
		if (aStates.indexOf("active") >= 0 && aStates.indexOf("archive") < 0)
		{
			arrCurrencies = ArraySelect(arrCurrencies, '!tools_web.is_true(This.archive)');
		}
		else if (aStates.indexOf("archive") >= 0 && aStates.indexOf("active") < 0)
		{
			arrCurrencies = ArraySelect(arrCurrencies, 'tools_web.is_true(This.archive)');
		}
	}

	if (sSearch != "")
		arrCurrencies = ArraySelect(arrCurrencies, 'StrContains(This.name, sSearch, true)')

	for (_currency in arrCurrencies)
	{
		oElem = {
			id: _currency.id.Value,
			code: _currency.id.Value,
			name: _currency.name.Value,
			short_name: _currency.short_name,
			cent_name: _currency.cent_name,
			status: (tools_web.is_true(_currency.archive.Value) ? 'Архив' : 'Активная'),
			is_infinite: (tools_web.is_true(_currency.infinite.Value) ? true : false),
		};
		
		oRes.array.push(oElem);
	}

	
	return oRes;
}

/**
 * @typedef {Object} WTCurrencyDeleteResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {int} count - количество удаленных валют
*/
/**
 * @function CurrencyDelete
 * @memberof Websoft.WT.Game
 * @author AKh
 * @description удаление валют
 * @param {bigint[]} aCurrencies - массив ID валют
 * @returns {WTCurrencyDeleteResult}
*/
function CurrencyDelete( aCurrencies )
{
	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
		
	if(!IsArray(aCurrencies))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	for(_currency in aCurrencies)
	{
		xqAccounts = tools.xquery("for $elem in accounts where $elem/currency_type_id = " + XQueryLiteral(_currency) + " return $elem/Fields('id')");
		xqQualifications = tools.xquery("for $elem in qualifications where $elem/currency_type_id = " + XQueryLiteral(_currency) + " return $elem/Fields('id')");
		
		if (ArrayOptFirstElem(xqAccounts) != undefined || ArrayOptFirstElem(xqQualifications) != undefined)
		{
			continue;
		}
		else
		{
			lists.currency_types.DeleteOptChildByKey(_currency);
			ms_tools.obtain_shared_list_elem( 'lists.currency_types', null, lists.currency_types );
			oRes.count++;
		}
	}
	return oRes
}

/**
 * @function CurrencyAddChange
 * @memberof Websoft.WT.Game
 * @author AKh
 * @description добавление/изменение валюты
 * @param {string} sCurrencyID - ID валюты для изменения
 * @param {?FormField[]} form_fields
 * @param {bool} bIsNew - признак создания новой валюты
 * @returns {oSimpleResult}
*/
function CurrencyAddChange( sCurrencyID, form_fields, bIsNew )
{
	var oRes = tools.get_code_library_result_object();
		
	sCode = ArrayOptFind(form_fields, 'This.name == "code"').value;
	sName = ArrayOptFind(form_fields, 'This.name == "name"').value;
	sShortName = ArrayOptFind(form_fields, 'This.name == "short_name"').value;
	sCentName = ArrayOptFind(form_fields, 'This.name == "cent_name"').value;
	bIsInfinite = tools_web.is_true(ArrayOptFind(form_fields, 'This.name == "infinite"').value);
	bIsArchive = tools_web.is_true(ArrayOptFind(form_fields, 'This.name == "archive"').value);
	sImageLink = ArrayOptFind(form_fields, 'This.name == "image_link"').value;
	
	if (tools_web.is_true(bIsNew))
	{
		newCurrency = lists.currency_types.AddChild()
		newCurrency.id = sCode;
		newCurrency.name = sName;
		newCurrency.short_name = sShortName;
		newCurrency.cent_name = sCentName;
		newCurrency.infinite = bIsInfinite;
		newCurrency.archive = bIsArchive;
		newCurrency.image_link = sImageLink;
		ms_tools.obtain_shared_list_elem( 'lists.currency_types', null, lists.currency_types );
	}
	else
	{
		oCurrency = ArrayOptFind(lists.currency_types, "This.id == sCurrencyID");
		oCurrency.id = sCode;
		oCurrency.name = sName;
		oCurrency.short_name = sShortName;
		oCurrency.cent_name = sCentName;
		oCurrency.infinite = bIsInfinite;
		oCurrency.archive = bIsArchive;
		oCurrency.image_link = sImageLink;
		ms_tools.obtain_shared_list_elem( 'lists.currency_types', null, lists.currency_types );
	}
	
	return oRes
}

/**
 * @function CollaboratorQualificationAssign
 * @memberof Websoft.WT.Game
 * @author EO
 * @description Присваивание бейджа сотрудникам
 * @param {bigint[]} arrCollabIDs - массив ID сотрудников
 * @param {bigint} iQualificationID - ID бейджа (квалификации)
 * @param {string} sComment - комментарий (основание)
 * @param {bigint} iCompetenceId - ID компетенции
 * @param {boolean} bNeedSendNotification - отправлять уведомления
 * @param {bigint} iNotificationId - ID типа уведомления
 * @returns {oSimpleResult}
 */
function CollaboratorQualificationAssign(arrCollabIDs, iQualificationID, sComment, iCompetenceId, bNeedSendNotification, iNotificationId)
{
	var oRes = tools.get_code_library_result_object();

	try
	{
		if(!IsArray(arrCollabIDs))
		{
			oRes.error = 501;
			oRes.errorText = "Аргумент функции не является массивом";
			return oRes;
		}
	
		var catCheckObject = ArrayOptFirstElem(ArraySelect(arrCollabIDs, "OptInt(This) != undefined"))
		if(catCheckObject == undefined)
		{
			oRes.error = 502;
			oRes.errorText = "В массиве нет ни одного целочисленного ID";
			return oRes;
		}
		
		var docObject = tools.open_doc(Int(catCheckObject));
		if(docObject == undefined || docObject.TopElem.Name != "collaborator")
		{
			oRes.error = 503;
			oRes.errorText = "Данные не являются массивом ID счетов";
			return oRes;
		}

		bQualificationIdError = false;
		iQualificationID = OptInt(iQualificationID);
		if (iQualificationID == undefined)
		{
			bQualificationIdError = true;
		}
		docQualification = tools.open_doc(iQualificationID);
		if (docQualification == undefined)
		{
			bQualificationIdError = true;
		}
		teQualification = docQualification.TopElem;
		if (teQualification.Name != 'qualification')
		{
			bQualificationIdError = true;
		}
		if (bQualificationIdError)
		{
			oRes.error = 504;
			oRes.errorText = "Не передан/неверно передан ID бейджа (квалификации)";
			return oRes;
		}

		var sQualificationName = teQualification.name;
		bNeedSendNotification = tools_web.is_true(bNeedSendNotification);
		iNotificationId = OptInt(iNotificationId);
		if (bNeedSendNotification && iNotificationId == undefined)
		{
			oRes.error = 505;
			oRes.errorText = "Не передан/неверно передан ID уведомления";
			return oRes;
		}

		iCompetenceId = OptInt(iCompetenceId);
		for ( iCollabID in arrCollabIDs)
		{
			iCollabID = OptInt(iCollabID);
			if (iCollabID == undefined)
			{
				continue;
			}
			docQualAssign = OpenNewDoc('x-local://wtv/wtv_qualification_assignment.xmd');
			docQualAssign.BindToDb();
			teQualAssign = docQualAssign.TopElem;
	
			teQualAssign.qualification_id = iQualificationID;
			teQualAssign.person_id = iCollabID;
			tools.common_filling('collaborator', teQualAssign, iCollabID);
			teQualAssign.status = 'assigned';
			teQualAssign.reason = Trim(sComment);
			sCompetenceName = '';
			if (iCompetenceId != undefined)
			{
				teQualAssign.competence_id = iCompetenceId;
				catCompetence = teQualAssign.competence_id.OptForeignElem;
				if (catCompetence != undefined)
				{
					sCompetenceName = catCompetence.name;
				}
				
			}
			teQualAssign.is_reward = false;
			teQualAssign.assignment_date = Date();
			iExpiresDays = OptInt(teQualification.expires_days);
			if (iExpiresDays != undefined)
			{
				teQualAssign.expiration_date = DateOffset(Date(), 86400*iExpiresDays);
			}
	
			docQualAssign.Save();

			if (bNeedSendNotification)
			{
				oText = {};
				oText.qualification_name = sQualificationName;
				oText.comment = sComment;
				oText.competence_name = sCompetenceName;
				tools.create_notification(iNotificationId, iCollabID, oText);
			}
		}
	}
	catch( err )
	{
		alert("ERROR: libGame: CollaboratorQualificationAssign: " + err)
		oRes = {
			"errorText" : err,
			"error" : 1
		};
	}

	return oRes;
}

/**
 * @function AccountChangeBalance
 * @memberof Websoft.WT.Game
 * @author EO
 * @description Изменить баланс счета
 * @param {bigint} iAccountID -  ID счета
 * @param {string} sOperationType - тип операции: "add"/"withdraw"
 * @param {real} rSum - сумма операции
 * @param {string} sComment - комментарий
 * @param {boolean} bTeamRating - вести учет рейтинга в команде
 * @param {bigint[]} arrTeamsIDs - массив ID команд (подразделений), командный учет ведется только, если команда пользователя присутствует в данном массиве
 * @param {boolean} bNeedSendNotification - отправлять уведомление
 * @param {bigint} iNotificationId - ID типа уведомления
 * @returns {oSimpleResult}
 */
function AccountChangeBalance(iAccountID, sOperationType, rSum, sComment, bTeamRating, arrTeamsIDs, bNeedSendNotification, iNotificationId)
{
	var oRes = tools.get_code_library_result_object();

	try
	{
		var bAccountIdError = false;
		iAccountID = OptInt(iAccountID);
		if (iAccountID == undefined)
		{
			bAccountIdError = true;
		}
		else
		{
			var docAccount = tools.open_doc(iAccountID);
			if(docAccount == undefined || docAccount.TopElem.Name != "account")
			{
				bAccountIdError = true;
			}
		}
		if (bAccountIdError)
		{
			oRes.error = 501;
			oRes.errorText = "Не передан/неверно передан ID счета";
			return oRes;
		}
		teAccount = docAccount.TopElem;

		if (sOperationType != 'add' && sOperationType != 'withdraw')
		{
			oRes.error = 502;
			oRes.errorText = "Неверно передан тип операции";
			return oRes;
		}

		rSum = OptReal(rSum);
		if (rSum == undefined || rSum < 0)
		{
			oRes.error = 503;
			oRes.errorText = "Не передан/неверно передана сумма операции";
			return oRes;
		}
		
		if (sOperationType == 'withdraw')
		{
			if (teAccount.balance.Value < rSum)
			{
				oRes.error = 504;
				oRes.errorText = "На счете недостаточно средств для списания";
				return oRes;
			}
		}

		bTeamRating = tools_web.is_true(bTeamRating);

		arrTeamsIDs = tools_web.parse_multiple_parameter(arrTeamsIDs);

		if (sOperationType == 'withdraw')
			rSum = -rSum;

			
		docTransactionColl = tools.pay_new_transaction_by_object(teAccount.object_id.Value, teAccount.currency_type_id.Value, rSum, sComment);

		if (bTeamRating)
		{
			var oTransactionParam = {
				currency_type_id: teAccount.currency_type_id.Value,
				sum: rSum,
				comment: sComment,
			};
			
			var iCountTeam = SetTeamRating(teAccount.object_id.Value, arrTeamsIDs, oTransactionParam)
		}

		if (bNeedSendNotification && teAccount.object_type == 'collaborator')
		{
			oText = {};
			oText.add = (sOperationType == 'add');
			oText.sum = Math.abs(rSum);
			oText.currency_short_name = '';
			oCurrency = lists.currency_types.GetOptChildByKey( teAccount.currency_type_id.Value );
			if (oCurrency != undefined)
			{
				oText.currency_short_name = oCurrency.name;
			}
			oText.comment = sComment;
			oText.balance = '';
			catCollAccount = docTransactionColl.TopElem.account_id.OptForeignElem;
			if (catCollAccount != undefined)
			{
				oText.balance = catCollAccount.balance;
			}
			tools.create_notification(iNotificationId, teAccount.object_id.Value, oText );
		}
	}
	catch( err )
	{
		alert("ERROR: libGame: AccountChangeBalance: " + err)
		oRes = {
			"errorText" : err,
			"error" : 1
		};
	}

	return oRes;
}

function SetTeamRating(iPersonID, arrTeamsIDs, oTransactionParam)
{
	iPersonID = OptInt(iPersonID);
	if (iPersonID == undefined)
		throw "ID участника команды не является целым числом";
	
	var sObjectType = tools.open_doc(iPersonID).TopElem.Name;
	if (sObjectType != 'collaborator')
		throw "Переданный ID участника команды не является ID из справочника сотрудников";
	
	
	if(!IsArray(arrTeamsIDs) || ArrayOptFirstElem(arrTeamsIDs) == undefined)
		throw "Пустой перечень команд";
	
	if(DataType(oTransactionParam) != 'object' || ObjectType(oTransactionParam) != 'JsObject')
	{
		oTransactionParam = {
			currency_type_id: "ball",
			sum: 0.0,
			comment: "",
		};
	}
	else
	{
		if(!oTransactionParam.HasProperty('currency_type_id'))
			oTransactionParam.SetProperty('currency_type_id', "ball");

		if(!oTransactionParam.HasProperty('sum'))
			oTransactionParam.SetProperty('sum', 0.0);

		if(!oTransactionParam.HasProperty('comment'))
			oTransactionParam.SetProperty('comment', "");
	}
	
	var iCountTeam = 0;
	
	var oGetSubdivPathRes = tools.call_code_library_method("libMain", "GetSubdivisionPath", [iPersonID, false]);
	
	if (ObjectType(oGetSubdivPathRes)=='JsObject' && oGetSubdivPathRes.HasProperty('array') && ObjectType(oGetSubdivPathRes.array)=='JsArray' && ArrayOptFirstElem(oGetSubdivPathRes.array) != undefined)
	{
		arrSubdivs = ArrayIntersect(oGetSubdivPathRes.array, arrTeamsIDs, "This.id", "This");
		for (oSubdiv in arrSubdivs)
		{
			sXQuery = "for $coll in collaborators where some $subs in subs satisfies ( $subs/basic_collaborator_id = $coll/id and MatchSome($subs/parent_id, (" + XQueryLiteral(oSubdiv.id) + ")) ) and $coll/is_dismiss = false() return $coll/Fields('id')";
			iCollabsCount = ArrayCount(tools.xquery(sXQuery));
			if (iCollabsCount != 0)
			{
				docTransactionTeam = tools.pay_new_transaction_by_object(oSubdiv.id, oTransactionParam.currency_type_id, Real(oTransactionParam.sum)/Real(iCollabsCount), oTransactionParam.comment);
				iCountTeam++;
			}
		}
	}
// toLog("SetTeamRating: [" + iPersonID + "]: iCountTeam: " + iCountTeam, true)	
	return iCountTeam;
}

/**
 * @typedef {Object} oAssignmentParam
 * @property {bigint} qualification_id - ID квалификации
 * @property {string} currency_type_id - ID валюты
 * @property {bool} bRatingTeam - вести рейтинг команд
 * @property {bigint[]} arrTeamsList - массив команд из параметров приложения
 * @property {bigint} competence_id - ID компетенции
 * @property {string} comment - комментарий (основание)
 * @property {date} expired_date - дата истечения награды
 * @property {bool} bSentNotificationRecipient - отправка уведомления получателю награды
 * @property {bigint} iNotificationRecipient - ID типа уведомления получателя награды
 * @property {bool} bSentNotificationRecipientBoss - отправка уведомления руководителю получателя награды
 * @property {bigint} iNotificationRecipientBoss - ID типа уведомления руководителя получателя награды
*/
/**
 * @function AwardTransfer
 * @memberof Websoft.WT.Game
 * @author Akh
 * @description передача награды
 * @param {bigint} iSenderID -  ID отправителя награды
 * @param {bigint} iPersonID -  ID получателя награды
 * @param {oAssignmentParam} oAssignmentParams -  параметры присвоения награды
 * @returns {oSimpleResult}
 */
function AwardTransfer( iSenderID, iPersonID, oAssignmentParams)
{
	var oRes = tools.get_code_library_result_object();
	
	try
	{	
		if (DataType(oAssignmentParams) != 'object' || ObjectType(oAssignmentParams) != 'JsObject')
			throw "Отсутствуют параметры присвоения награды"
	
		docTransaction = tools.pay_new_transaction_by_object(iSenderID, oAssignmentParams.currency_type_id, -1, "");
		
		docQualAssignment = OpenNewDoc('x-local://wtv/wtv_qualification_assignment.xmd');
		docQualAssignment.BindToDb();
		teQualAssignment = docQualAssignment.TopElem;
		teQualAssignment.qualification_id = oAssignmentParams.qualification_id;
		teQualAssignment.is_reward = true;
		teQualAssignment.person_id = iPersonID;
		tools.common_filling('collaborator', teQualAssignment, iPersonID);
		teQualAssignment.sender_id = iSenderID;
		teQualAssignment.status = 'assigned';
		teQualAssignment.assignment_date = Date();
		
		if (oAssignmentParams.comment != "" && oAssignmentParams.comment != undefined)
			teQualAssignment.reason = Trim(oAssignmentParams.comment);
		
		if (OptInt(oAssignmentParams.competence_id, null) != null)
			teQualAssignment.competence_id = oAssignmentParams.competence_id;
				
		if (oAssignmentParams.expired_date != '' || oAssignmentParams.expired_date != null)
		{
			teQualAssignment.expiration_date = oAssignmentParams.expired_date;
		}
		
		docQualAssignment.Save();
		
		docQualification = tools.open_doc(oAssignmentParams.qualification_id);
		teQualification = docQualification.TopElem;
		
		if (ArrayOptFirstElem(teQualification.game_bonuss) != undefined)
		{
			for (_bonus in teQualification.game_bonuss)
			{
				docTransaction = tools.pay_new_transaction_by_object(iPersonID, _bonus.currency_type_id, _bonus.sum, "");
				if (oAssignmentParams.bRatingTeam)
				{
					arrTeamsIDs = tools_web.parse_multiple_parameter(oAssignmentParams.arrTeamsList);
					oTransactionParam = {
						currency_type_id: _bonus.currency_type_id,
						sum: _bonus.sum,
						comment: "",
					};
					SetTeamRating(iPersonID, arrTeamsIDs, oTransactionParam)
				}
			}
		}
		
		if (oAssignmentParams.bSentNotificationRecipient)
		{
			tools.create_notification(oAssignmentParams.iNotificationRecipient, iPersonID, "", teQualAssignment.Doc.DocID);
		}
		if (oAssignmentParams.bSentNotificationRecipientBoss)
		{
			catBoss = tools.get_uni_user_boss(iPersonID);
			if (catBoss != undefined)
				tools.create_notification(oAssignmentParams.iNotificationRecipientBoss, catBoss.id, "", teQualAssignment.Doc.DocID);
		}
	}
	catch( err )
	{
		alert("ERROR: libGame: AwardTransfer: " + err)
		oRes = {
			"errorText" : err,
			"error" : 1
		};
	}
	
	return oRes;
	
}

/**
 * @typedef {Object} oCancelParam
 * @property {string} comment - комментарий администратора
 * @property {bool} bSentNotificationSender - отправка уведомления отправителю награды
 * @property {bigint} iNotificationSender - ID типа уведомления для отправителя награды
 * @property {bool} bSentNotificationRecipient - отправка уведомления получателю награды
 * @property {bigint} iNotificationRecipient - ID типа уведомления получателя награды
*/
/**
 * @function AwardCancelTransfer
 * @memberof Websoft.WT.Game
 * @author Akh
 * @description отмена передачи награды
 * @param {bigint[]} arrObjectIDs - массив ID наград
 * @param {oCancelParam} oCancelParams -  параметры отмены
 * @returns {oSimpleResultCount}
 */
function AwardCancelTransfer( arrObjectIDs, oCancelParams)
{
	var oRes = tools.get_code_library_result_object();
	oRes.count = 0;
	
	try
	{	
		if(!IsArray(arrObjectIDs) || ArrayOptFirstElem(arrObjectIDs) == undefined)
			throw "Передан некорректный или пустой массив ID наград"
		if (DataType(oCancelParams) != 'object' || ObjectType(oCancelParams) != 'JsObject')
			throw "Отсутствуют параметры отмены награды"
		
		for ( objectID in arrObjectIDs )
		{
			docQualAssignment = tools.open_doc(objectID);
			if (docQualAssignment == undefined)
				continue;
			teQualAssignment = docQualAssignment.TopElem;
			
			if (teQualAssignment.Name != "qualification_assignment")
				throw "Аргумент функции не является массивом ID наград"
			
			if (!teQualAssignment.is_reward || teQualAssignment.status != "assigned")
				continue;
			
			iSenderID = teQualAssignment.sender_id;
			iRecipientID = teQualAssignment.person_id;
			
			docQualification = tools.open_doc(teQualAssignment.qualification_id);
			if (docQualification == undefined)
				continue;
			
			teQualification = docQualification.TopElem;
			
			docTransaction = tools.pay_new_transaction_by_object(iSenderID, teQualification.reward_params.currency_type_id, 1, "");
			
			if (ArrayOptFirstElem(teQualification.game_bonuss) != undefined)
			{
				for (bonus in teQualification.game_bonuss)
				{
					docTransaction = tools.pay_new_transaction_by_object(iRecipientID, bonus.currency_type_id, -bonus.sum, "");
				}
			}
			
			if (oCancelParams.bSentNotificationSender && oCancelParams.iNotificationSender != null)
			{
				tools.create_notification(oCancelParams.iNotificationSender, iSenderID, oCancelParams.comment, docQualAssignment.DocID)
			}
			
			if (oCancelParams.bSentNotificationRecipient && oCancelParams.iNotificationRecipient != null)
			{
				tools.create_notification(oCancelParams.iNotificationRecipient, iRecipientID,  oCancelParams.comment, docQualAssignment.DocID)
			}
			
			DeleteDoc(UrlFromDocID(docQualAssignment.DocID));
			oRes.count++;
		}
	}
	catch( err )
	{
		alert("ERROR: libGame: AwardCancelTransfer: " + err)
		oRes = {
			"errorText" : err,
			"error" : 1
		};
	}
	
	return oRes;
}

function getXObject(_objectID, _sCatalog, _filters)
{
	var filters = [];
	if (IsArray(_filters))
		filters = _filters;

	if (OptInt(_objectID) != undefined)
		filters.push("$elem/id = " + OptInt(_objectID, 0));
	
	var xqFilters = ArrayCount(filters) > 0 ? " where " + ArrayMerge(filters, "This", " and ") : "";
	var xqQuery = "for $elem in " + _sCatalog + "s " + xqFilters + " return $elem";
	var xObject = undefined;
	try {
		xObject = ArrayOptFirstElem(tools.xquery(xqQuery));
	} catch (error) {
		
	}
	return xObject;
}

function getXObjects(_objectIDs, _sCatalog, _filters)
{
	var filters = [];
	if (IsArray(_filters))
		filters = _filters;

	if (IsArray(_objectIDs) && (ArrayCount(_objectIDs) > 0))
		filters.push("MatchSome($elem/id, (" + ArrayMerge(_objectIDs, "This", ",") + "))");
	else if (OptInt(_objectIDs) != undefined)
		filters.push("$elem/id = " + OptInt(_objectIDs, 0));
	
	var xqFilters = ArrayCount(filters) > 0 ? " where " + ArrayMerge(filters, "This", " and ") : "";
	var xqQuery = "for $elem in " + _sCatalog + "s " + xqFilters + " return $elem";
	var xObjects = [];
	try {
		xObjects = tools.xquery(xqQuery);
	} catch (error) {
		
	}
	return xObjects;
}

function getXBaskets(_collaboratorIDs, _sCurrencyTypeID)
{
	var filters = [];
	if (IsArray(_collaboratorIDs) && (ArrayCount(_collaboratorIDs) > 0))
		filters.push("MatchSome($elem/person_id, (" + ArrayMerge(_collaboratorIDs, "This", ",") + "))");
	else if (OptInt(_collaboratorIDs) != undefined)
		filters.push("$elem/person_id = " + OptInt(_collaboratorIDs, 0));

	if (_sCurrencyTypeID != "" && _sCurrencyTypeID != undefined)
		filters.push("$elem/currency_type_id = " + XQueryLiteral(_sCurrencyTypeID));
	
	var xqFilters = ArrayCount(filters) > 0 ? " where " + ArrayMerge(filters, "This", " and ") : "";
	var xqQuery = "for $elem in baskets " + xqFilters + " return $elem";
	var xObjects = tools.xquery(xqQuery);
	return xObjects;
}

function getXAccounts(_collaboratorIDs, _budgetPeriodID, _sCurrencyTypeID)
{
	var filters = [];
	if (IsArray(_collaboratorIDs) && (ArrayCount(_collaboratorIDs) > 0))
		filters.push("MatchSome($elem/object_id, (" + ArrayMerge(_collaboratorIDs, "This", ",") + "))");
	else if (OptInt(_collaboratorIDs) != undefined)
		filters.push("$elem/object_id = " + OptInt(_collaboratorIDs, 0));

	if (_sCurrencyTypeID != "" && _sCurrencyTypeID != undefined)
		filters.push("$elem/currency_type_id = " + XQueryLiteral(_sCurrencyTypeID));
	
	if (OptInt(_budgetPeriodID) != undefined)
		filters.push("$elem/budget_period_id = " + OptInt(_budgetPeriodID, 0));

	filters.push("$elem/status = 'active'");

	var xqFilters = ArrayCount(filters) > 0 ? " where " + ArrayMerge(filters, "This", " and ") : "";
	var xqQuery = "for $elem in accounts " + xqFilters + " return $elem";
	var xObjects = tools.xquery(xqQuery);
	return xObjects;
}

function getXSubsDownHierarchy(_subdivisionID)
{
	var xqQuery = " \
		for $elem in subs \
		where IsHierChild($elem/id, " + OptInt(_subdivisionID, 0) + " ) \
			and $elem/basic_collaborator_id != null() \
			and $elem/type = 'position' \
		order by $elem/Hier() \
		return $elem \
		";
	var xObjects = tools.xquery(xqQuery);
	return xObjects;
}

function getXSubs(_subdivisionID)
{
	var xqQuery = " \
		for $elem in subs \
		where \
			$elem/parent_id = " + OptInt(_subdivisionID, 0) + " \
			and $elem/basic_collaborator_id != null() \
		return $elem \
		";
	var xObjects = tools.xquery(xqQuery);
	return xObjects;
}

function getXGoods(_goodIDs, _goodTypeIDs, _sCurrencyTypeID)
{
	var filters = [];
	if (IsArray(_goodIDs) && (ArrayCount(_goodIDs) > 0))
		filters.push("MatchSome($elem/id, (" + ArrayMerge(_goodIDs, "This", ",") + "))");
	else if (OptInt(_goodIDs) != undefined)
		filters.push("$elem/id = " + OptInt(_goodIDs, 0));

	if (_sCurrencyTypeID != "" && _sCurrencyTypeID != undefined)
		filters.push("$elem/currency_type_id = " + XQueryLiteral(_sCurrencyTypeID));
	
	if (IsArray(_goodTypeIDs) && (ArrayCount(_goodTypeIDs) > 0))
		filters.push("MatchSome($elem/good_type_id, (" + ArrayMerge(_goodTypeIDs, "This", ",") + "))");
	else if (OptInt(_goodTypeIDs) != undefined)
		filters.push("$elem/good_type_id = " + OptInt(_goodTypeIDs, 0));

	var xqFilters = ArrayCount(filters) > 0 ? " where " + ArrayMerge(filters, "This", " and ") : "";
	var xqQuery = "for $elem in goods " + xqFilters + " return $elem";
	var xObjects = tools.xquery(xqQuery);
	return xObjects;
}

function getXRequests(_collaboratorIDs, _workflowID, _budgetPeriodID, _codeWorkflowStages, _requestTypeIDs, _objectID)
{
	var filters = [];
	if (IsArray(_collaboratorIDs) && (ArrayCount(_collaboratorIDs) > 0))
		filters.push("MatchSome($elem/person_id, (" + ArrayMerge(_collaboratorIDs, "This", ",") + "))");
	else if (OptInt(_collaboratorIDs) != undefined)
		filters.push("$elem/person_id = " + OptInt(_collaboratorIDs, 0));
	
	if (OptInt(_budgetPeriodID) != undefined)
		filters.push("$elem/budget_period_id = " + OptInt(_budgetPeriodID, 0));

	if (OptInt(_workflowID) != undefined)
		filters.push("$elem/workflow_id = " + OptInt(_workflowID, 0));

	if (OptInt(_objectID) != undefined)
		filters.push("$elem/object_id = " + OptInt(_objectID, 0));
	
	if (IsArray(_codeWorkflowStages) && (ArrayCount(_codeWorkflowStages) > 0))
		filters.push("MatchSome($elem/workflow_state, ('" + ArrayMerge(_codeWorkflowStages, "This", "','") + "'))");

	if (IsArray(_requestTypeIDs) && (ArrayCount(_requestTypeIDs) > 0))
		filters.push("MatchSome($elem/request_type_id, ('" + ArrayMerge(_requestTypeIDs, "This", "','") + "'))");

	var xqFilters = ArrayCount(filters) > 0 ? " where " + ArrayMerge(filters, "This", " and ") : "";
	var xqQuery = "for $elem in requests " + xqFilters + " return $elem";
	var xObjects = tools.xquery(xqQuery);
	return xObjects;
}


function createTransaction(_docAccount, _rAmmount, _sAction, _sComment)
{
	var teAccount = {};
	if (_docAccount != undefined)
		teAccount = _docAccount.TopElem;
	else
		return undefined;
	
	var docTransaction = tools.new_doc_by_name("transaction");
	docTransaction.BindToDb(DefaultDb);
	if (docTransaction != undefined)
	{
		var teTransaction = docTransaction.TopElem;

		teTransaction.date = Date();
		teTransaction.account_id = OptInt(teAccount.id, 0);
		teTransaction.direction = (_sAction == "increase") ? 1 : 2;
		teTransaction.amount = OptReal(_rAmmount, 0);
		teTransaction.object_id = OptInt(teAccount.object_id, 0);
		teTransaction.object_type = "collaborator";
		teTransaction.comment = (_sComment != undefined ? _sComment : "");
		var teCurUser = tools.get_cur_user();
		teTransaction.person_id = OptInt(teCurUser.id, 0);
		//tools.common_filling("collaborator", teTransaction, OptInt(teCurUser.id, 0), teCurUser);
		
		docTransaction.Save();
		teAccount.balance = (_sAction == "increase") ? OptReal(teAccount.balance, 0) + OptReal(_rAmmount, 0) : OptReal(teAccount.balance, 0) - OptReal(_rAmmount, 0);
		_docAccount.Save();
	}
	return docTransaction;
}

function createAccount(_xCollaborator, _sCurrencyTypeID, _rAmmount, _budgetPeriodID)
{
	var docAccount = tools.new_doc_by_name("account");
	docAccount.BindToDb(DefaultDb);
	if (docAccount != undefined)
	{
		var teAccount = docAccount.TopElem;

		teAccount.object_type = "collaborator";
		teAccount.status = "active";
		teAccount.object_id = OptInt(_xCollaborator.id, 0);
		teAccount.name = _xCollaborator.fullname;
		teAccount.currency_type_id = _sCurrencyTypeID;
		teAccount.budget_period_id = OptInt(_budgetPeriodID, 0);
	
		if (OptReal(_rAmmount, 0)!=0)
		{
			docTransaction = createTransaction(docAccount, OptReal(_rAmmount, 0), "increase" );
			if (docTransaction == undefined)
			{
				DeleteDoc(UrlFromDocID(docAccount.DocID));
				return undefined
			}
		}
		docAccount.Save();
	}
	return docAccount;
}

function createBasket(_collaboratorID, _sCurrencyTypeID)
{
	var docBasket = tools.new_doc_by_name('basket');
	docBasket.BindToDb(DefaultDb);
	if (docBasket != undefined)
	{
		var teBasket = docBasket.TopElem;
		var catCollaborator = getXObject(_collaboratorID, "collaborator");
		if (catCollaborator != undefined)
		{
			teBasket.code = tools.random_string( 5 ) + '#' + catCollaborator.login.Value;
			teBasket.name = catCollaborator.fullname.Value + ' --- ' + _sCurrencyTypeID;
			teBasket.person_id = OptInt(_collaboratorID);
			teBasket.currency_type_id = _sCurrencyTypeID;

			docBasket.Save();
		}
		else return undefined;
	}
	return docBasket;
}

function closeAccount(_accountID, _isResetAccounts)
{
	var docAccount = tools.open_doc(_accountID);
	if (docAccount != undefined)
	{
		var teAccount = docAccount.TopElem;
		teAccount.status = "close";
		if (tools_web.is_true(_isResetAccounts))
		{
			createTransaction(docAccount, teAccount.balance, "decrease", "Счет обнулен в результате закрытия бюджетного периода");
		}
		docAccount.Save();
		return {
			ok: true,
			code: "success_closed_account",
			info: docAccount
		};
	}
	else 
		return {
			ok: false,
			code: "dont_find_account",
			info: "Не найден счет сотрудника"
		};
}

function cancelRequest(_requestID, _sCodeWorkflowStageCancel)
{
	var docRequest = tools.open_doc(_requestID);
	if (docRequest != undefined)
	{
		var teRequest = docRequest.TopElem;
		teRequest.workflow_state = _sCodeWorkflowStageCancel;
		teRequest.comment = "Отменена в результате закрытия бюджетного периода";
		docRequest.Save();
		return {
			ok: true,
			code: "success_cancel_request",
			info: docRequest
		};
	}
	else 
		return {
			ok: false,
			code: "dont_find_request",
			info: "Не найдена заявка сотрудника"
		};
}

function clearBasket(_basketID)
{
	var docBasket = tools.open_doc(_basketID);
	if (docBasket != undefined)
	{
		var teBasket = docBasket.TopElem;
		teBasket.goods.Clear();
		docBasket.Save();
		return {
			ok: true,
			code: "success_clear_basket",
			info: docBasket
		};
	}
	else 
		return {
			ok: false,
			code: "dont_find_basket",
			info: "Не найдена корзина сотрудника"
		};
}

function setStatusGood(_goodID, _sStatus)
{
	docGood = tools.open_doc(_goodID);
	if (docGood != undefined)
	{
		docGood.TopElem.state_id = _sStatus;
		docGood.TopElem.is_cant_chose = true;
		docGood.Save();
		return {
			ok: true,
			code: "success_set_status_good",
			info: docGood
		};
	}
	else
		return {
			ok: false,
			code: "dont_find_good",
			info: "Не найдена льгота"
		};
}

function deleteGoodType(_goodTypeID)
{
	docGoodType = tools.open_doc(_goodTypeID);
	if (docGoodType != undefined)
	{
		DeleteDoc(UrlFromDocID(docGoodType.TopElem.id));
		return {
			ok: true,
			code: "success_delete_type_good",
			info: "Тип льготы удален"
		};
	}
	else
		return {
			ok: false,
			code: "dont_find_type_good",
			info: "Не найден тип льготы"
		};
}

function addGoodBasket(_docBasket, _docGood, _iCountGood, _dDate)
{
	var result = {
		ok: true,
		code: "success",
		info: "Товар добавлен в корзину"
	};
	var teBasket = _docBasket.TopElem;
	if (_docGood != undefined)
	{
		var teGood = _docGood.TopElem;
		if(tools_web.is_true(teGood.is_cant_chose.Value))
		{
			return {
				ok: false,
				code: "cant_chose_good",
				info: "На товар установлен запрет выбора"
			};			
		}
		var oGoodCost = ArrayOptFind(teGood.costs, "This.currency_type_id.Value == '" + teBasket.currency_type_id.Value + "'");
		if (oGoodCost == undefined)
			return {
				ok: false,
				code: "not_currency_type_good",
				info: "Типы валют добавляемого товара и корзины не совпадают"
			};
		var fldGood = ArrayOptFind(teBasket.goods, 'This.good_id == ' + teGood.id);
		if (fldGood == undefined)
		{ 
			fldGood = teBasket.goods.AddChild();
			fldGood.good_id = teGood.id;
			fldGood.number = OptInt(_iCountGood, 0);
			fldGood.reserved_date = (OptDate(_dDate) == undefined ? Date() : _dDate);
		}
		else
			fldGood.number = OptInt(_iCountGood, 0) + fldGood.number.Value;
		_docBasket.Save();
	}
	return result;
}


function createAccountForCollaborators(_xCollaborators, _sCurrencyTypeID, _rAmmount, _xBudgetPeriod)
{
	var iCountCreateAccount = 0;
	if (_xBudgetPeriod != undefined)
	{
		var xAccounts = getXAccounts(ArrayExtract(_xCollaborators, "This.id"), _xBudgetPeriod.id, _sCurrencyTypeID);
		for (_xCollaborator in _xCollaborators)
			if (ArrayOptFindByKey(xAccounts, OptInt(_xCollaborator.id, 0), "object_id") == undefined)
			{
				docAccount = createAccount(_xCollaborator, _sCurrencyTypeID, _rAmmount, _xBudgetPeriod.id);
				if (docAccount != undefined)
					iCountCreateAccount++;
			}
	}
	else
		return {
			ok: false,
			code: "dont_find_budget_period",
			info: "Не найден текущий бюджетный период"
		};
	return {
		ok: true,
		code: "created_account_" + iCountCreateAccount,
		info: "Создано счетов сотрудникам: " + iCountCreateAccount
	}
}

function createAccountForSubdivisions(_xSubdivisions, _sCurrencyTypeID, _rAmmount, _xBudgetPeriod, _isSubdivisionsDownHierarchy, _isCreateAccountForDismissed, _userID, _iAccessLevel)
{
	var iCountCreateAccount = 0;
	if (_xBudgetPeriod != undefined)
	{
		var xSubs = [];
		for (_xSubdivision in _xSubdivisions)
			if (tools_web.is_true(_isSubdivisionsDownHierarchy))
				xSubs = ArrayUnion(xSubs, getXSubsDownHierarchy(_xSubdivision.id));
			else 
				xSubs = ArrayUnion(xSubs, getXSubs(_xSubdivision.id));

		if (ArrayCount(xSubs) == 0)
			return {
				ok: false,
				code: "dont_find_subs",
				info: "Не найдены сотрудники, указанных подразделений"
			};

		if(OptInt(_iAccessLevel) == undefined || _iAccessLevel < 10)
		{
			arrAllowed = tools.get_all_subs_by_func_manager_id(_userID);
			xSubs = ArraySelect(ArrayIntersect(xSubs, arrAllowed, "This.parent_id", "This.id"), "OptInt(This.basic_collaborator_id) != OptInt(_userID, 0)");
			if (ArrayCount(xSubs) == 0)
				return {
					ok: false,
					code: "dont_find_subs",
					info: "Не найдены сотрудники, входящие в зону ответственности"
				};
		}

		if (tools_web.is_true(_isCreateAccountForDismissed))
			xCollaboratorsInfo = ArrayExtract(xSubs, "({'id': This.basic_collaborator_id.Value, 'fullname': This.basic_collaborator_fullname.Value})");

		xCollaboratorsInfo = getXObjects(ArrayExtractKeys(xSubs, "basic_collaborator_id"), "collaborator", ["$elem/is_dismiss = 'false'"]);
		xAccounts = getXAccounts(ArrayExtract(xCollaboratorsInfo, "This.id"), _xBudgetPeriod.id, _sCurrencyTypeID);
		for (xCollaboratorInfo in xCollaboratorsInfo)
		{
			if (ArrayOptFindByKey(xAccounts, OptInt(xCollaboratorInfo.id, 0), "object_id") == undefined)
			{
				docAccount = createAccount(xCollaboratorInfo, _sCurrencyTypeID, _rAmmount, _xBudgetPeriod.id);
				if (docAccount != undefined)
					iCountCreateAccount++;
			}
		}
	}
	else
		return {
			ok: false,
			code: "dont_find_budget_period",
			info: "Не найден текущий бюджетный период"
		};
	return {
		ok: true,
		code: "created_account_" + iCountCreateAccount,
		info: "Создано счетов сотрудникам: " + iCountCreateAccount
	}
}

function changeAccountForSubdivisions(_xSubdivisions, _oOperation, _xBudgetPeriod, _isCreateAccount, _isSubdivisionsDownHierarchy, _isCreateAccountForDismissed, _userID, _iAccessLevel)
{
	var iCountCreateTransaction = 0;
	if (_xBudgetPeriod != undefined)
	{
		var xSubs = [];
		for (_xSubdivision in _xSubdivisions)
			if (tools_web.is_true(_isSubdivisionsDownHierarchy))
				xSubs = ArrayUnion(xSubs, getXSubsDownHierarchy(_xSubdivision.id));
			else 
				xSubs = ArrayUnion(xSubs, getXSubs(_xSubdivision.id));

		if (ArrayCount(xSubs) == 0)
			return {
				ok: false,
				code: "dont_find_subs",
				info: "Не найдены сотрудники, указанных подразделений"
			};
		
		if(OptInt(_iAccessLevel) == undefined || _iAccessLevel > 10)
		{
			arrAllowed = tools.get_all_subs_by_func_manager_id(_userID);
			xSubs = ArraySelect(ArrayIntersect(xSubs, arrAllowed, "This.parent_id", "This.id"), "OptInt(This.basic_collaborator_id) != OptInt(_userID, 0)");
			if (ArrayCount(xSubs) == 0)
				return {
					ok: false,
					code: "dont_find_subs",
					info: "Не найдены сотрудники, входящие в зону ответственности"
				};
		}

		if (tools_web.is_true(_isCreateAccountForDismissed))
			xCollaboratorsInfo = ArrayExtract(xSubs, "({'id': This.basic_collaborator_id.Value, 'fullname': This.basic_collaborator_fullname.Value})");
		
		xCollaboratorsInfo = getXObjects(ArrayExtractKeys(xSubs, "basic_collaborator_id"), "collaborator", ["$elem/is_dismiss = 'false'"]);
		var xAccounts = getXAccounts(ArrayExtract(xCollaboratorsInfo, "This.id"), _xBudgetPeriod.id, _oOperation.currency);
		for (xCollaboratorInfo in xCollaboratorsInfo)
		{
			docAccount = undefined;
			xAccount = ArrayOptFindByKey(xAccounts, OptInt(xCollaboratorInfo.id, 0), "object_id");
			if (xAccount == undefined)
			{
				if (tools_web.is_true(_isCreateAccount))
					docAccount = createAccount(xCollaboratorInfo, _oOperation.currency, 0, _xBudgetPeriod.id);
			}
			else
				docAccount = tools.open_doc(xAccount.id);
			
			if (docAccount != undefined)
			{
				teAccount = docAccount.TopElem;
				if (_oOperation.action == "decrease")
				{
					if (OptReal(teAccount.balance, 0) - OptReal(_oOperation.ammount, 0) < 0)
						if (ArrayCount(xCollaboratorsInfo) == 1)
							return {
								ok: false,
								code: "negative_transaction",
								info: "Транзакция отрицательного баланса не допускается"
							};
						else
							continue;
				}
				
				docTransaction = createTransaction(docAccount, _oOperation.ammount, _oOperation.action);
				if (docTransaction != undefined)
					iCountCreateTransaction++;
			}
			else if (ArrayCount(_xCollaborators) == 1)
				return {
					ok: false,
					code: "dont_find_account",
					info: "Не найден счет сотрудника"
				};
		}
	}
	else
		return {
			ok: false,
			code: "dont_find_budget_period",
			info: "Не найден текущий бюджетный период"
		};
	return {
		ok: true,
		code: "created_transaction_" + iCountCreateTransaction,
		info: "Изменено остатков на счетах сотрудников: " + iCountCreateTransaction 
	}
}

function changeAccountForCollaborators(_xCollaborators, _xAccounts, _oOperation, _xBudgetPeriod, _isCreateAccount)
{
	var iCountCreateTransaction = 0;
	if (_xBudgetPeriod != undefined)
	{
		var xAccounts = _xAccounts;
		if (ArrayCount(xAccounts) == 0)
			xAccounts = getXAccounts(ArrayExtract(_xCollaborators, "This.id"), _xBudgetPeriod.id, _oOperation.currency);
		
		for (_xCollaborator in _xCollaborators)
		{
			docAccount = undefined;
			xAccount = ArrayOptFindByKey(xAccounts, OptInt(_xCollaborator.id, 0), "object_id");
			if (xAccount == undefined)
			{
				if (tools_web.is_true(_isCreateAccount))
					docAccount = createAccount(_xCollaborator, _oOperation.currency, 0, _xBudgetPeriod.id);
			}
			else
				docAccount = tools.open_doc(xAccount.id);
			
			if (docAccount != undefined)
			{
				teAccount = docAccount.TopElem;
				if (_oOperation.action == "decrease")
				{
					if (OptReal(teAccount.balance, 0) - OptReal(_oOperation.ammount, 0) < 0)
						if (ArrayCount(_xCollaborators) == 1)
							return {
								ok: false,
								code: "negative_transaction",
								info: "Транзакция отрицательного баланса не допускается"
							};
						else
							continue;
				}
				
				docTransaction = createTransaction(docAccount, _oOperation.ammount, _oOperation.action);
				if (docTransaction != undefined)
					iCountCreateTransaction++;
			}
			else if (ArrayCount(_xCollaborators) == 1)
				return {
					ok: false,
					code: "dont_find_account",
					info: "Не найден счет сотрудника"
				};
		}
	}
	else
		return {
			ok: false,
			code: "dont_find_budget_period",
			info: "Не найден текущий бюджетный период"
		};
	return {
		ok: true,
		code: "created_transaction_" + iCountCreateTransaction,
		info: "Изменено остатков на счетах сотрудников: " + iCountCreateTransaction
	}
}

function closeBudgetPeriod(_xBudgetPeriod, _isCancelRequests, _isClearBaskets, _isResetAccounts, _codeWorkflowStages, _sCodeWorkflowStageCancel, _workflowID)
{
	var result = {
		ok: true,
		code: "",
		info: ""
	};
	var iCountResetAccounts = 0;
	var iCountClearBaskets = 0;
	var iCountCancelRequests = 0;

	var xAccounts = getXAccounts([], _xBudgetPeriod.id);
	if (ArrayCount(xAccounts) > 0)
	{
		var collaboratorIDs = ArrayExtract(xAccounts, "This.object_id");
		for (xAccount in xAccounts)
		{
			result = closeAccount(xAccount.id, _isResetAccounts);
			if (result.ok) 
				iCountResetAccounts++;
		}
		if (tools_web.is_true(_isClearBaskets))
		{
			xBaskets = getXBaskets(collaboratorIDs);
			for (xBasket in xBaskets)
			{
				result = clearBasket(xBasket.id);
				if (result.ok) 
					iCountClearBaskets++;
			}
		}
		if (tools_web.is_true(_isCancelRequests))
		{
			xRequests = getXRequests(collaboratorIDs, _workflowID, _xBudgetPeriod.id, _codeWorkflowStages);
			for (xRequest in xRequests)
			{
				result = cancelRequest(xRequest.id, _sCodeWorkflowStageCancel);
				if (result.ok) 
					iCountCancelRequests++;
			}
		}
	}
	else 
		return {
			ok: false,
			code: "dont_find_accounts",
			info: "Не найдены счета сотрудников"
		};
	return {
		ok: true,
		code: "success_closed_budget_period",
		info: "Текущий бюджетный период закрыт:\n" +
				(iCountResetAccounts > 0 ? (_isResetAccounts ? "Обнулено счетов " : "Закрыто счетов ") + iCountResetAccounts + ".\n": "") +
				(iCountClearBaskets > 0 ? "Очищено корзин " + iCountClearBaskets + ".\n": "") +
				(iCountCancelRequests > 0 ? "Заявок отменено " + iCountCancelRequests + ".\n": "")
	};
}

function activeBudgetPeriod(_applicationID, _sBudgetPeriodLabel, _sBudgetPeriodPreviousLabel, _xBudgetPeriod)
{
	var result = {
		ok: true,
		code: "",
		info: ""
	};

	if (_xBudgetPeriod != undefined)
	{
		var hexCurBudgetPeriodID = getApplicationParam(_applicationID, _sBudgetPeriodLabel);
		if(OptInt(hexCurBudgetPeriodID) != undefined)
		{
			var previousBudgetPeriods = null;
			try
			{
				previousBudgetPeriods = DecodeJson(getApplicationParam(_applicationID, _sBudgetPeriodPreviousLabel));
			}
			catch(err){}
			if (IsArray(previousBudgetPeriods) && ArrayOptFindByKey(previousBudgetPeriods, hexCurBudgetPeriodID, "__value") == undefined)
			{
				var previousBudgetPeriod = {
					useStrictProperties: true,
					__value: hexCurBudgetPeriodID,
					comment: ""
				};
				result = setApplicationParam(_applicationID, _sBudgetPeriodPreviousLabel, previousBudgetPeriod);
			}
		}

		if (result.ok)
		{
			var hexBudgetPeriodID = "0x" + StrHexInt(OptInt(_xBudgetPeriod.id, 0));
			result = setApplicationParam(_applicationID, _sBudgetPeriodLabel, hexBudgetPeriodID);
		}
		else
			return {
				ok: false,
				code: "dont_add_previous_budget_period",
				info: "Не удалось добавить бюджетный период в историю"
			};

		if (result.ok)
			return {
				ok: true,
				code: "success_active_budget_period",
				info: "Бюджетный период активирован"
			};
		else
			return {
				ok: false,
				code: "dont_save_budget_period",
				info: "Не удалось сохранить текущий бюджетный период"
			};
	}
	else
		return {
			ok: false,
			code: "dont_find_budget_period",
			info: "Не найден указанный бюджетный период"
		};
}

function deleteGoodTypes(_goodTypeIDs)
{
	var xGoodTypes = getXObjects(_goodTypeIDs, "good_type");
	if (ArrayCount(xGoodTypes) > 0)
	{
		var objectIDs = ArrayExtract(xGoodTypes, "This.id");
		var xGoods = getXGoods([], objectIDs);
		for (xGood in xGoods)
			setStatusGood(xGood.id, "archive");

		for (xGoodType in xGoodTypes)
			deleteGoodType(xGoodType.id);
	}
	else
		return {
			ok: false,
			code: "dont_find_object",
			info: "Не найден тип льготы"
		};
	return {
		ok: true,
		code: "success_delete_type_good",
		info: "Тип льготы удален"
	};
}

function deleteGoods(_goodIDs)
{
	var xGoods = getXGoods(_goodIDs, []);
	if (ArrayCount(xGoods) > 0)
	{
		for (xGood in xGoods)
			setStatusGood(xGood.id, "archive");
	}
	else
		return {
			ok: false,
			code: "dont_find_object",
			info: "Не найдена льгота"
		};
	return {
		ok: true,
		code: "success_delete_good",
		info: "Льгота удалена"
	};
}

function deleteGoodsFromBasket(_goodIDs, _basketID)
{
	if (ArrayCount(_goodIDs) > 0)
	{
		var xBasket = getXObject(_basketID, "basket");
		if (xBasket != undefined)
		{
			docBasket = tools.open_doc(xBasket.id);
			if (docBasket != undefined)
			{
				for (goodID in _goodIDs)
				{
					fldGood = ArrayOptFind(docBasket.TopElem.goods, 'This.good_id == ' + OptInt(goodID, 0));
					if (fldGood != undefined)
						fldGood.Delete();
				}
				docBasket.Save();
			}
		}
		else
			return {
				ok: false,
				code: "dont_find_basket",
				info: "Не найдена корзина"
			};
	}
	else
		return {
			ok: false,
			code: "dont_find_object",
			info: "Не найдена льгота"
		};
	return {
		ok: true,
		code: "success_delete_good",
		info: "Льгота удалена из корзины"
	};
}

function addGoodToBaskets(_xCollaborators, _basketID, _goodID, _iCountGood, _dDate, _sCurrencyTypeID)
{
	var result = {
		ok: false,
		code: "",
		info: ""
	};
	var xGood = getXObject(_goodID, "good");
	
	if (xGood == undefined)
		return {
			ok: false,
			code: "not_find_good",
			info: "Не найден товар"
		};
	var docGood = tools.open_doc(_goodID);
	var docBasket = undefined;
	if (OptInt(_basketID) != undefined)
	{
		var xBasket = getXObject(_basketID, "basket");
		docBasket = tools.open_doc(xBasket.id);
		if (docBasket != undefined)
			result = addGoodBasket(docBasket, docGood, _iCountGood, _dDate);
	}
	else
		for (_xCollaborator in _xCollaborators)
		{
			xBaskets = getXBaskets(_xCollaborator.id, _sCurrencyTypeID);
			if (ArrayCount(xBaskets) > 0)
				docBasket = tools.open_doc(ArrayOptFirstElem(xBaskets).id);
			if (docBasket == undefined)
				docBasket = createBasket(_xCollaborator.id, _sCurrencyTypeID);

			result = addGoodBasket(docBasket, docGood, _iCountGood, _dDate);
		}
	return result;
}


// ======================================================================================
// =================  Внутрибиблиотечные служебные функции (notfordoc) - START ==========
// ======================================================================================

function getApplicationParam(_applicationID, _sName)
{
	var result = "";
	var docCurApplication = _applicationID;
	if (OptInt(_applicationID) != undefined || docCurApplication == undefined)
		docCurApplication = tools.open_doc(_applicationID);
	
	if (docCurApplication != undefined)
	{
		var teCurApplication = docCurApplication.TopElem;
		var wvarApplication = teCurApplication.wvars.GetOptChildByKey(_sName);
		if (wvarApplication != undefined)
			result = wvarApplication.value.Value;
	}
	return result;
}

function setApplicationParam(_applicationID, _sName, _value)
{
	var result = {
		ok: false,
		code: "failure_set_param",
		info: "Параметр не изменен"
	};

	var docCurApplication = tools.open_doc(_applicationID);
	if (docCurApplication != undefined)
	{
		var teCurApplication = docCurApplication.TopElem;
		var wvarApplication = teCurApplication.wvars.GetOptChildByKey(_sName);
		if (wvarApplication != undefined)
		{
			try
			{
				wvarApplicationJson = DecodeJson(wvarApplication.value.Value);
			}
			catch(err)
			{
				wvarApplicationJson = null;
			}
			if (IsArray(wvarApplicationJson))
			{
				wvarApplicationJson.push(_value);
				_value = EncodeJson(wvarApplicationJson);
			}

			wvarApplication.value = _value;
			docCurApplication.Save();
			result = {
				ok: true,
				code: "success_set_param",
				info: wvarApplication.value.Value
			};
		}
	}
	return result;
}

function getFilterBudgetPeriod(_applicationID, _sBudgetPeriodLabel, _sBudgetPeriodPreviousLabel)
{
	var hexCurBudgetPeriodID = getApplicationParam(_applicationID, _sBudgetPeriodLabel);
	var previousBudgetPeriods = DecodeJson(getApplicationParam(_applicationID, _sBudgetPeriodPreviousLabel)); 
	var budgetPeriodIDs = [];
	if (IsArray(previousBudgetPeriods))
	{
		var previousBudgetPeriodIDs = [];
		for (previousBudgetPeriod in previousBudgetPeriods)
			previousBudgetPeriodIDs.push({id: OptInt(previousBudgetPeriod.__value, 0)});
		previousBudgetPeriodIDs.push({id: OptInt(hexCurBudgetPeriodID, 0)});
		var xBudgetPeriods = getXObjects("", "budget_period");
		for (xBudgetPeriods in xBudgetPeriods)
		{
			findBudgetPeriodID = ArrayOptFindByKey(previousBudgetPeriodIDs, OptInt(xBudgetPeriods.id, 0), "id");
			if (findBudgetPeriodID == undefined)
				budgetPeriodIDs.push({id: xBudgetPeriods.id.Value});
		}
	}

	var xqBudgetPeriod = "";
	if (ArrayCount(budgetPeriodIDs) > 0)
		xqBudgetPeriod = "MatchSome($elem/id, (" + ArrayMerge(budgetPeriodIDs, "This.id", ",") + "))";
	return xqBudgetPeriod;
}

function get_arr_value_form_fields(SCOPE_WVARS) {
	var form_fields = SCOPE_WVARS.GetOptProperty('form_fields', '');
	if (form_fields != '') {
		return ParseJson(form_fields);
	}
	return '';
}

function remote_action_alert(oRes, sMsg) {
	oRes.result = { command: 'alert', msg: sMsg };
	return oRes;
}

function get_form_field_val(fields, fld) {
	oFld = ArrayOptFindByKey(fields, fld, 'name');
	if (oFld != undefined) {
		return oFld.value;
	} else {
		return '';
	}
}

function get_currencies() {
	var arrCurrencies = [];
	for (_currency in lists.currency_types)
	{
		xarrQualifications = tools.xquery("for $elem in qualifications where $elem/currency_type_id = " + XQueryLiteral(_currency.id.Value) + " return $elem");
		if (ArrayOptFirstElem(xarrQualifications) != undefined)
			continue;
		else
			arrCurrencies.push(_currency)
	}
	
	return arrCurrencies;
}

function get_rewards() {
	var arrCurrencies = lists.currency_types;
	xarrQualifications = tools.xquery("for $elem in qualifications where MatchSome($elem/currency_type_id, (" + ArrayMerge(arrCurrencies, 'XQueryLiteral(This.id.Value)', ',') + ")) return $elem");
	
	if ( ArrayOptFirstElem(xarrQualifications) == undefined ){
		return [];
	}
	
	return ArrayIntersect(arrCurrencies, xarrQualifications, "This.id", "This.currency_type_id")
}

/**
 * @typedef {Object} WTRatingCurrency
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oSimpleListElem[]} array – Массив валют
*/
/**
 * @typedef {Object} oAddParams
 * @property {bool} bAddAllBadges – Добавлять пункт Все бейджи.
 * @property {bool} bAddAllAwards – Добавлять пункт Все награды.
 * @property {string} sAllBadges – Название пункта Бейджи.
 * @property {string} sAllAwards – Название пункта Все награды.
*/
/**
 * @function GetRatingCurrency
 * @memberof Websoft.WT.Game
 * @description Получение списка валют для рейтинга.
 * @param {oAddParams} oAddParams - Параметры запуска
 * @returns {WTRatingCurrency}
*/
function GetRatingCurrency(oAddParams)
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	
	if(oAddParams.bAddAllBadges)
	{
		oRes.array.push({id: 'websoft_all_badges', name: oAddParams.sAllBadgesTitle})
	}

	if(oAddParams.bAddAllAwards)
	{
		oRes.array.push({id: 'websoft_all_awards', name: oAddParams.sAllAwardsTitle})
	}

	var sRatingCurrency = tools.get_process_param("libGame", "rating_currencies");

	if(!IsEmptyValue(sRatingCurrency))
	{
		var arrRatingCurrencyIDs = tools_web.parse_multiple_parameter(sRatingCurrency);
		var arrRatingCurrency = ArrayIntersect(lists.currency_types, arrRatingCurrencyIDs, "This.id.Value", "This");
		
		for(itemCurrency in arrRatingCurrency)
		{
			oRes.array.push({id: itemCurrency.id.Value, name: itemCurrency.name.Value})
		}
	}	
	
	return oRes;
}
