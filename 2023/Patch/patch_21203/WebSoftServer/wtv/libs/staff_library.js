/**
 * @namespace Websoft.WT.Staff
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

function get_object_image_url( catElem )
{
	switch( catElem.Name )
	{
		case "collaborator" :
			return tools_web.get_object_source_url( 'person', catElem.id );
		default:
		{
			if ( catElem.ChildExists( "resource_id" ) && catElem.resource_id.HasValue )
			{
				return tools_web.get_object_source_url( 'resource', catElem.resource_id );
			}
		}
	}
	return "/images/" + catElem.Name + ".png";
}

/**
 * @function toLog
 * @memberof Websoft.WT.Staff
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
		EnableLog('lib_staff_library');
		LogEvent('lib_staff_library', sText )
	}
}


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
 * @typedef {Object} oPersonGroup
 * @property {bigint} id
 * @property {string} name
 * @property {string} link
*/
/**
 * @typedef {Object} WTPersonGroup
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {boolean} result – Результат.
 * @property {oPersonGroup[]} array
*/
/**
 * @function GetPersonGroups
 * @memberof Websoft.WT.Staff
 * @description Получение списока групп, в которые входит сотрудник.
 * @param {bigint} iCurUserID - ID сотрудника.
 * @param {boolean} bShowMyOwnGrp - Показывать только те группы, владельцем которых является сотрудник.
 * @param {boolean} bShowHideGrp - Показывать скрытые группы.
 * @returns {WTPersonGroup}
*/

function GetPersonGroups( iPersonID, bShowMyOwnGrp, bShowHideGrp, iCurUserID, bCheckAccess )
{
    oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
    oRes.array = [];

    try
	{
		if ( bShowMyOwnGrp == undefined || bShowMyOwnGrp == null )
			throw '';
		bShowMyOwnGrp = tools_web.is_true( bShowMyOwnGrp );
	}
	catch( ex )
	{
		bShowMyOwnGrp = false;
    }

    try
	{
		if ( bShowHideGrp == undefined || bShowHideGrp == null )
			throw '';
		bShowHideGrp = tools_web.is_true( bShowHideGrp );
	}
	catch( ex )
	{
		bShowHideGrp = false;
    }

    try
	{
        iPersonID = Int( iPersonID );
	}
	catch( ex )
	{
        iPersonID = null;
        alert( "[GetPersonGroups]: id сотрудника - null" );
    }

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
		oRes.errorText = "Ошибка открытия документа текущего пользователя, ID: " + iCurUserID;
		return oRes;
	}
	teCurUser = docCurUser.TopElem;

    if ( iPersonID != null )
    {
        sCndtn = "";
        arrFuncManagerGrp = new Array();
        if ( !bShowHideGrp )
        {
            sCndtn += " and $elem/is_hidden != true()";
        }
        xarrGrps = XQuery( "for $elem in group_collaborators where $elem/collaborator_id = " + iPersonID + sCndtn + " return $elem" );
        if ( bShowMyOwnGrp )
        {
            for ( grp in xarrGrps )
                if ( ArrayOptFirstElem( XQuery( "for $elem in func_managers where $elem/catalog = 'group' and $elem/object_id = "+ grp.group_id +" and $elem/person_id = "+ iPersonID +" return $elem" ) ) != undefined )
                    arrFuncManagerGrp.push( grp );
        }
        else
            arrFuncManagerGrp = xarrGrps;

        for ( elem in arrFuncManagerGrp )
        {
			if ( bCheckAccess && ! tools_web.check_access( elem.group_id, iCurUserID, teCurUser ) )
			{
				continue;
			}
            obj = new Object();
            obj.id = elem.group_id.Value;
            obj.name = elem.name.Value;
            obj.link = tools_web.get_mode_clean_url( null, obj.id );
            oRes.array.push( obj );
        }
    }
    return oRes;
}

/**
 * @typedef {Object} oPersonLearning
 * @property {bigint} id
 * @property {string} name
 * @property {string} img_url
 * @property {date} start_usage_date
 * @property {date} start_learning_date
 * @property {date} last_usage_date
 * @property {number} score
 * @property {string} state
 * @property {string} link
 * @property {string} status_learning
 * @property {string} type_assign
 * @property {boolean} is_recommended
 * @property {string} combo_type_assign
 * @property {number} sum_points
*/
/**
 * @typedef {Object} WTTestLearningResult
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {boolean} result – Результат.
 * @property {oPersonLearning[]} array
*/
/**
 * @function GetPersonLearnings
 * @memberof Websoft.WT.Staff
 * @description Получение списка завершенных (незавершенных) сотрудником курсов (тестов).
 * @param {bigint[]} iPersonID - ID сотрудников.
 * @param {boolean} bShowPercentScore - Показывать соотношение набранных баллов к максимальному.
 * @param {string} sType - Наименование/тип активности (learnings, test_learnings, learnings_all - законченные/незаконченные курсы, test_learning_all - законченные/незаконченные тесты).
 * @param {string} sTypeLink - Тип ссылки (ссылка на карточку активного курса/теста или запуск плеера курса/теста).
 * @param {string} sCurrencyType - Валюта, по которой подсчитываются награды за прохождение курсов/тестов. По умолчанию experience
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {WTTestLearningResult}
*/

function GetPersonLearnings( iPersonIDs, bShowPercentScore, sType, sTypeLink, sCurrencyType, oCollectionParams )
{
	var oPaging = oCollectionParams.paging;
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	oRes.data = ({});
	oRes.paging = oPaging;
	if(!IsArray(iPersonIDs))
	{
		if(DataType(iPersonIDs) != 'object' && OptInt(iPersonIDs) != undefined)
		{
			iPersonIDs = [OptInt(iPersonIDs)];
		}
		else
		{
			iPersonIDs = [];
		}
	}

	try {
		if (bShowPercentScore == undefined || bShowPercentScore == null)
			throw '';
		bShowPercentScore = tools_web.is_true(bShowPercentScore);
	} catch(e) {
		bShowPercentScore = false;
	}

	try {
		sTypeLink = sTypeLink;
		if (sTypeLink == undefined || sTypeLink == null || sTypeLink == "")
			throw "[GetPersonLearnings]: sTypeLink is not defined.";
	} catch(e) {
		sTypeLink = undefined;
	}

	try {
		if (sCurrencyType == null || sCurrencyType == undefined || sCurrencyType == "") {
			throw '';
		}
	} catch(e) {
		sCurrencyType = 'experience';
	}

	try
	{
		if( !IsArray( oCollectionParams.filters ) )
		{
			throw "error";
		}
		var arrFilters = oCollectionParams.filters;
	}
	catch( ex )
	{
		var arrFilters = new Array();
	}
	function check_search_value( sCond, sCatalog )
	{
		sFTCond = '';
		if( sNeedSearch != null )
		{
			fldCatalogItem = tools.new_doc_by_name( sCatalog, true ).TopElem.AddChild();

			sFTStr = XQueryLiteral( String( sNeedSearch ) );
			for ( fldItemElem in fldCatalogItem )
			{
				if ( fldItemElem.Type == 'string' && fldItemElem.FormElem.IsIndexed )
				{
					sFTCond += ( sFTCond == '' ? '' : ' or' ) + ' contains($elem/' + fldItemElem.Name + ',' + sFTStr + ')';
				}
			}
			if( sFTCond != "" )
			{
				sFTCond = "( " + sFTCond + " )";
				return sCond + ( sCond == "" ? " where " : " and " ) + sFTCond;
			}

		}
		return sCond;
	}

	var sNeedSearch = null;
	conds = new Array();
//alert("staff_library.js: GetPersonLearnings: arrFilters: " + EncodeJson(arrFilters))
	for( oFilter in arrFilters )
	{
		if( oFilter.type == "search" )
		{
			if( oFilter.value != "" )
			{
				sNeedSearch = oFilter.value;
				//conds.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( String( oFilter.value ) ) + " )" );
			}
		}
		else if(oFilter.type == 'select')
		{
			switch( oFilter.id )
			{
				case "f_status_id":
				{
					aFilterStatuses = ArrayExtract( oFilter.value, "This.value" );
					arrNeedStates = new Array();
					for( _state in aFilterStatuses )
					{
						switch( _state )
						{
							case "active":
								arrNeedStates = ArrayUnion( arrNeedStates, [ 0, 1 ] );
								break;
							case "finished":
								arrNeedStates = ArrayUnion( arrNeedStates, [ 2, 3, 4, 5 ] );
								break;
						}
					}
					if( ArrayOptFirstElem( arrNeedStates ) != undefined )
					{
						conds.push( "MatchSome( $elem/state_id,( " + ArrayMerge( arrNeedStates, "This", "," ) + " ) )" );
					}
					break;
				}
			}
		}
		else if(oFilter.type == 'date')
		{
			paramValueFrom = oFilter.HasProperty("value_from") ? DateNewTime(ParseDate(oFilter.value_from)) : null;
			paramValueTo = oFilter.HasProperty("value_to") ? DateNewTime(ParseDate(oFilter.value_to), 20, 59, 59) : null;
			switch(oFilter.id)
			{
				case "f_data":
				{
					if(paramValueFrom != null && paramValueTo != null)
					{
						conds.push( "( $elem/last_usage_date != null() and $elem/last_usage_date <= " + XQueryLiteral(paramValueTo) + " and $elem/last_usage_date >= " + XQueryLiteral(paramValueFrom) + " )");
					}
					else if(paramValueFrom != null)
					{
						conds.push( "( $elem/last_usage_date != null() and $elem/last_usage_date >= " + XQueryLiteral(paramValueFrom) + " )");
					}
					else if(paramValueTo != null)
					{
						conds.push( "( $elem/last_usage_date != null() and $elem/last_usage_date <= " + XQueryLiteral(paramValueTo) + " )");
					}
					break;
				}
			}
		}
	}


	if(ArrayOptFirstElem(iPersonIDs) != undefined ) {
		conds.push( "MatchSome($elem/person_id, (" + ArrayMerge(iPersonIDs, "This", ",") + "))" );
	}

	sCndtn = "";
	if (ArrayOptFirstElem(conds) != undefined) {
		if (ArrayCount(conds) > 1) {
			sCndtn += " where " + ArrayMerge(conds, "This", " and ");
		} else {
			sCndtn += " where " + conds[0];
		}
	}

	function getCourseParts(curObject) {
		arr = [];

		for (fldPartElem in curObject.parts) {
			if (! fldPartElem.is_visible) {
				continue;
			}

			if (fldPartElem.view.conditions.ChildNum != 0) {
				try {
					if (SafeEval(tools.create_filter_javascript(fldPartElem.view.conditions, null, 'curObject.'), [ { 'curObject': getCurObjectCopy() } ]) == false) {
						throw 'cont';
					}
				} catch (e) {
					continue;
				}
			}

			if (fldPartElem.type == "activity") {
				continue;
			}

			if (fldPartElem.type == 'folder' && (! curObject.disp_folder_desc || ! fldPartElem.desc.HasValue)) {
				continue;
			}

			if (fldPartElem.launch.conditions.ChildNum != 0) {
				try {
					if (SafeEval(tools.create_filter_javascript(fldPartElem.launch.conditions, null, 'curObject.'), [ { 'curObject': getCurObjectCopy() } ]) == false) {
						throw 'cont';
					}
				} catch (e) {
					continue;
				}
			}

			arr.push(fldPartElem);
		}

		return arr;
	}

	function getRecommended(id) {
		return XQuery('for $elem in recommender_select_collaborators where $elem/created_object_id = '+ id +' return $elem/Fields("id")');
	}
	function build_distincts(arrDistincts)
	{
		oRes.data.SetProperty( "distincts", ({}) );
		var xarrStages, xarrTypes, xarrStatuses;
		for(sFieldName in oCollectionParams.distincts)
		{
			oRes.data.distincts.SetProperty(sFieldName, []);
			switch(sFieldName)
			{
				case "f_status_id":
				{
					oRes.data.distincts.f_status_id.push( { "value": "active", "name": "В процессе" } );
					oRes.data.distincts.f_status_id.push( { "value": "finished", "name": "Архив" } );
					break;
				}
			}
		}
	}

	function buildResult(objects, type, iStart, iEnd, iArrFirstEnd) {
		aResult = new Array();
		var sTypeUpdated = '';

		try {
			iEnd = OptInt(iEnd);
		} catch(e) {
			iStart = undefined;
			iEnd = undefined;
		}

		var oState;
		var xarrParentObjects = null;
		for (i = 0; i < ArrayCount(objects); i++) {
			fldObject = objects[i];

			if (iStart != undefined && iEnd != undefined) {
				if (i < iStart || i >= iEnd) {
					continue;
				}
			}

			obj = new Object();
			obj.id = fldObject.id.Value;
			obj.img_url = "";

			iScore = 0;
			iMaxScore = 0;

			switch (type) {
				case "learnings":
					obj.status_learning = 'Изученные';
					obj.status_learning_id = 1;
					break;
				case "active_learnings":
					obj.status_learning = 'Изучаемые';
					obj.status_learning_id = 0;
					break;
				case "test_learnings":
					obj.status_learning = 'Завершенные';
					obj.status_learning_id = 3;
					break;
				case "active_test_learnings":
					obj.status_learning = 'Текущие';
					obj.status_learning_id = 2;
					break;
				case "learnings_all":
					obj.status_learning = (i < iArrFirstEnd) ? 'Изучаемые' : 'Изученные';
					obj.status_learning_id = (i < iArrFirstEnd) ? 0 : 1;
					break;
				case "test_learning_all":
					obj.status_learning = (i < iArrFirstEnd) ? 'Текущие' : 'Завершенные';
					obj.status_learning_id = (i < iArrFirstEnd) ? 2 : 3;
					break;
			}

			if (type == 'learnings_all' || type == 'test_learning_all') {
				switch (obj.status_learning_id) {
					case 0:
						sTypeUpdated = 'active_learnings';
						break;
					case 1:
						sTypeUpdated = 'learnings';
						break;
					case 2:
						sTypeUpdated = 'active_test_learnings';
						break;
					case 3:
						sTypeUpdated = 'test_learnings';
						break;
				}
			}

			switch (type) {
				case "learnings":
				case "active_learnings":
				case "learnings_all":
				{
					obj.name = fldObject.course_name.Value;

					dObject = tools.open_doc(fldObject.course_id.Value);
					if (dObject != undefined) {
						iScore = (fldObject.score.HasValue) ? Real(fldObject.score.Value) : 0;
						iMaxScore = (dObject.TopElem.max_score.HasValue) ? Real(dObject.TopElem.max_score.Value) : 0;
					}
					obj.link = ""; // tools_web.get_mode_clean_url("learning_stat", obj.id);
					if ((type == "active_learnings" || sTypeUpdated == "active_learnings") && sTypeLink == "launch") {
						arrLaunchLearningParts = getCourseParts(dObject.TopElem);
						firstCoursePart = ArrayOptFirstElem(arrLaunchLearningParts);

						sLastPartCode = '';
						sLaunchAction = '';

						if (firstCoursePart != undefined) {
							if (fldObject.state_id == 0) {
								sLastPartCode = firstCoursePart.code.Value;
							} else if (fldObject.state_id == 1) {
								sLastPartCode = fldObject.last_usage_part_code.HasValue ? fldObject.last_usage_part_code.Value : firstCoursePart.code.Value;
							}
						}
						try { __sid = CurRequest.Session.sid } catch(e) { __sid = 0};
						obj.link = "course_launch.html?course_id="+ fldObject.course_id.Value +"&object_id="+ obj.id + (sLastPartCode != "" ? "&part_code="+ UrlEncode16(UrlEncode16(sLastPartCode)) : "") + "&sid="+ tools_web.get_sum_sid(fldObject.course_id.Value, __sid);

						if (dObject.TopElem.view_type != "single") {
							obj.link = "course_launch.html?structure=first&launch_id=" + tools_web.encrypt_launch_id(obj.id, DateOffset(Date(), 86400*365)) + (sLastPartCode == "" ? "" : "&part_code=" + UrlEncode16(UrlEncode16(sLastPartCode)));
						}
					} else {
						obj.link = tools_web.get_mode_clean_url(null, fldObject.course_id.Value);
					}
					break;
				}

				case "test_learnings":
				case "active_test_learnings":
				case "test_learning_all":
				{
					obj.name = fldObject.assessment_name.Value;

					dObject = tools.open_doc(fldObject.assessment_id.Value);
					iScore = (fldObject.score.HasValue) ? Real(fldObject.score.Value) : 0;
					iMaxScore = (fldObject.max_score.HasValue) ? Real(fldObject.max_score.Value) : 0;
					obj.link = ""; // tools_web.get_mode_clean_url("test_learning_stat", obj.id);
					if ((type == "active_test_learnings" || sTypeUpdated == "active_test_learnings") && sTypeLink == "launch") {
							try {__sid = CurRequest.Session.sid } catch(e) {__sid = 0};
							//obj.link = "test_launch.html?assessment_id=" + fldObject.assessment_id.Value + "&object_id=" + obj.id + "&sid=" + tools_web.get_sum_sid(fldObject.assessment_id.Value, __sid);
							obj.link = "test_launch.html?structure=first&assessment_id=" + fldObject.assessment_id + "&object_id=" + obj.id + "&launch_id=" + tools_web.encrypt_launch_id( obj.id, DateOffset( Date(), 86400*365 ) );
					} else {
						obj.link = tools_web.get_mode_clean_url(null, fldObject.assessment_id.Value);
					}
					break;
				}
			}

			if (dObject != undefined) {
				teObject = dObject.TopElem;
				if (teObject.ChildExists("resource_id") && teObject.resource_id.HasValue) {
					obj.img_url = tools_web.get_object_source_url('resource', teObject.resource_id.Value);
				}
			}

			if (bShowPercentScore) 
			{
			 	obj.percent_score = (iMaxScore > 0 && iScore > 0) ? StrReal(Real(Math.round((iScore / iMaxScore) * 1000)) / 10, 1) : 0;
			}

			if (sType == "learnings_all" || sType == "test_learning_all") {
				obj.type_assign = (fldObject.creation_user_id == fldObject.person_id || ( fldObject.ChildExists('is_self_enrolled') &&  tools_web.is_true( fldObject.is_self_enrolled.Value ) ) ) ? 'По собственной инициативе' : 'Обязательный';
				obj.is_recommended = (getRecommended(obj.id) != undefined);
				obj.combo_type_assign = obj.type_assign + '|||' + (obj.is_recommended ? 'Рекомендован' : 'Не рекомендован');

				obj.sum_points = Real(0);
				if (
					(fldObject.state_id.Value == 2 || fldObject.state_id.Value == 4)
					&&	dObject != undefined
					&& teObject.ChildExists('game_bonuss')
					&& teObject.game_bonuss.HasValue
					&& ArrayCount(teObject.game_bonuss) > 0
					&&	ArrayOptFindByKey(teObject.game_bonuss, sCurrencyType, 'currency_type_id') != undefined
					)
				{
					for (elem in teObject.game_bonuss) {
						if (elem.currency_type_id.Value == sCurrencyType) {
							obj.sum_points += Real(elem.sum.Value);
						}
					}
				}
			}

			obj.start_usage_date = fldObject.start_usage_date.Value;
			obj.start_learning_date = fldObject.start_learning_date.Value;
			obj.last_usage_date = (fldObject.last_usage_date.HasValue) ? fldObject.last_usage_date.Value : '';
			obj.score = fldObject.score.Value;
			oState = common.learning_states.GetOptChildByKey(fldObject.state_id.Value);
			obj.state = oState.name.Value;
			obj.state_color = "rgb(" + oState.lpe_color.Value + ")";
			obj.state_code = StrReplace(oState.long_descriptor.Value, " ", "_");
			obj.max_end_date = fldObject.max_end_date.Value;

			aResult.push(obj);
		}
		return aResult;
	}
	build_distincts(oCollectionParams.distincts);
	var sSortCondition = "";
	if (ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		switch(oCollectionParams.sort.FIELD)
		{
			case 'name':
				var sFieldName = ( StrContains( sType, "test_" ) ) ? "assessment_name" : "course_name";
				sSortCondition = " order by $elem/" + sFieldName + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "");
				break;
			default:
				sSortCondition = " order by $elem/" + oCollectionParams.sort.FIELD + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "");
		}
	}

	var iPageStart, iPageEnd, iPageSize;
	var bHasPaging = (ObjectType(oPaging) == 'JsObject' && oPaging.SIZE != null);
	if (bHasPaging) {
		oPaging.MANUAL = true;
		iPageStart = ( OptInt(oPaging.START_INDEX, 0) > 0 ? OptInt(oPaging.START_INDEX, 0): ( OptInt(oPaging.INDEX, 0) * oPaging.SIZE ) );
		iPageSize = oPaging.SIZE;
		iPageEnd = iPageStart + iPageSize;
	}

	if (sType == "learnings_all") {
		xarrActiveLearnings = ArrayDirect(XQuery("for $elem in active_learnings " + check_search_value( sCndtn, "active_learnings" ) + sSortCondition + " return $elem"));
		xarrLearnings = ArrayDirect(XQuery("for $elem in learnings " + check_search_value( sCndtn, "learnings" ) + sSortCondition + " return $elem"));
		unionXarr = ArrayUnion(xarrActiveLearnings, xarrLearnings);
		iTotal = ArrayCount(unionXarr);

		oRes.array = buildResult(unionXarr, sType, iPageStart, iPageEnd, ArrayCount(xarrActiveLearnings));
	} else if (sType == "test_learning_all") {
		xarrActiveTestLearnings = ArrayDirect(XQuery("for $elem in active_test_learnings " + check_search_value( sCndtn, "active_test_learnings" ) + sSortCondition + " return $elem"));
		xarrTestLearnings = ArrayDirect(XQuery("for $elem in test_learnings " + check_search_value( sCndtn, "test_learnings" ) + sSortCondition + " return $elem"));
		unionXarr = ArrayUnion(xarrActiveTestLearnings, xarrTestLearnings);
		iTotal = ArrayCount(unionXarr);

		oRes.array = buildResult(unionXarr, sType, iPageStart, iPageEnd, ArrayCount(xarrActiveTestLearnings));
	} else {
		xarrObjects = ArrayDirect(XQuery("for $elem in " + sType + check_search_value( sCndtn, sType ) + sSortCondition + " return $elem"));
		iTotal = ArrayCount(xarrObjects);

		oRes.array = buildResult(xarrObjects, sType, iPageStart, iPageEnd);
	}

	if (bHasPaging) {
		oPaging.TOTAL = iTotal;
		oRes.paging = oPaging;
	}

	// alert('oRes: ' + EncodeJson(oRes));
	return oRes;
}

/**
 * @typedef {Object} oPersonRequest
 * @property {bigint} id 
 * @property {string} code 
 * @property {date} create_date 
 * @property {bigint} request_type_id 
 * @property {string} request_type_name 
 * @property {string} type 
 * @property {bigint} object_id 
 * @property {string} object_name 
 * @property {string} status_id 
 * @property {string} status_name 
 * @property {string} workflow_state_id 
 * @property {string} workflow_state_name 
 * @property {string} link 
*/
/**
 * @typedef {Object} ReturnPersonRequests
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {Object} data
 * @property {oPaging} paging
 * @property {oPersonRequest[]} requests – Массив заявок.
*/
/**
 * @function GetPersonRequests
 * @memberof Websoft.WT.Staff
 * @author MD
 * @description Получение списка заявок, которые подал сотрудник.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {bigint} iRequestTypeID - ID типа заявки.
 * @param {string} sStatus - Статус заявки.
 * @param {oCollectionParam} oCollectionParams - Параметры выборки.
 * @returns {ReturnPersonRequests}
*/
function GetPersonRequests( iPersonID, iRequestTypeID, sStatus, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.requests = [];
	var oPaging = oCollectionParams.GetOptProperty( "paging" );
	oRes.paging = oPaging;
	oRes.data = {};

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
	iRequestTypeID = OptInt( iRequestTypeID, null );
	if ( sStatus == null )
	{
		sStatus = "";
	}
	if ( oCollectionParams == null || oCollectionParams == "" )
	{
		oCollectionParams = new Object;
	}

	var Env = CurRequest.Session.GetOptProperty( "Env", ({}) );
	var oLngEnv = tools_web.get_cur_lng_obj( Env );
	var curLng = oLngEnv.GetOptProperty( "curLng", null );

	var oParams = {
		xquery_qual: ( "$elem/person_id = " + iPersonID )
	};
	var arrFilters = oCollectionParams.GetOptProperty( "filters", [] );
	if ( iRequestTypeID == null )
	{
		oFilter = ArrayOptFindByKey( arrFilters, "request_type_id", "id" );
		if ( oFilter != undefined && ArrayCount( oFilter.value ) != 0 )
		{
			oParams.xquery_qual += " and MatchSome( $elem/request_type_id, (" + ArrayMerge( oFilter.value, "OptInt(This.value,0)", "," ) + ") )";
		}
	}
	else
	{
		oParams.xquery_qual += " and $elem/request_type_id = " + iRequestTypeID;
	}
	if ( sStatus == "" )
	{
		oFilter = ArrayOptFindByKey( arrFilters, "status_id", "id" );
		if ( oFilter != undefined && ArrayCount( oFilter.value ) != 0 )
		{
			oParams.xquery_qual += " and MatchSome( $elem/status_id, (" + ArrayMerge( oFilter.value, "XQueryLiteral(This.value)", "," ) + ") )";
		}
	}
	else
	{
		oParams.xquery_qual += " and $elem/status_id = " + XQueryLiteral( sStatus );
	}
	oFilter = ArrayOptFindByKey( arrFilters, "search", "type" );
	if ( oFilter != undefined && oFilter.value != "" )
	{
		oParams.xquery_qual += " and doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )";
	}

	var sort_query = "";
	if ( oCollectionParams.HasProperty( "sort" ) )
	{
		oParams.disp_sort = oCollectionParams.sort.FIELD != null;
		oParams.order = oCollectionParams.sort.FIELD;
		oParams.direct = oCollectionParams.sort.DIRECTION == "DESC" ? "-": "+";
		if ( oParams.disp_sort )
		{
			sort_query = " order by $elem/" + oParams.order + ( oParams.direct == "-"? " descending": "" )
		}
	}

	var xarrXQRequests = XQuery( "for $elem in requests where " + oParams.xquery_qual + sort_query + " return $elem/Fields('id','create_date','code','request_type_id','type','object_id','object_name','status_id','workflow_state','workflow_state_name')" );
	
	if ( oPaging != undefined && oPaging.SIZE != null )
	{
		oPaging.MANUAL = true;
		oPaging.TOTAL = ArrayOptSize( xarrXQRequests );
		xarrRequests = ArrayRange( xarrXQRequests, OptInt( oPaging.INDEX, 0 ) * oPaging.SIZE, oPaging.SIZE );
	}
	else
	{
		xarrRequests = xarrXQRequests;
	}
	
	for ( catRequestElem in xarrRequests )
	{
		catRequestType = catRequestElem.request_type_id.OptForeignElem;
		sRequestType = catRequestType == undefined ? "" : catRequestType.name.Value;
		oRes.requests.push({
			"id": catRequestElem.id.Value,
			"create_date": catRequestElem.create_date.Value,
			"code": catRequestElem.code.Value,
			"request_type_id": catRequestElem.request_type_id.Value,
			"request_type_name": ( curLng == null ? sRequestType : tools_web.get_cur_lng_name( sRequestType, curLng.short_id ) ),
			"type": catRequestElem.type.Value,
			"object_id": catRequestElem.object_id.Value,
			"object_name": catRequestElem.object_name.Value,
			"status_id": catRequestElem.status_id.Value,
			"status_name": catRequestElem.status_id.ForeignElem.name.Value,
			"workflow_state_id": catRequestElem.workflow_state.Value,
			"workflow_state_name": ( curLng == null ? catRequestElem.workflow_state_name.Value : tools_web.get_cur_lng_name( catRequestElem.workflow_state_name.Value, curLng.short_id ) ),
			"link": tools_web.get_mode_clean_url( null, catRequestElem.id )
		});
	}

	var arrDistinct = oCollectionParams.GetOptProperty( "distincts", [] );
	if ( ArrayOptFirstElem( arrDistinct ) != undefined )
	{
		oRes.data.distincts = new Object;
		var xarrPositions, xarrSubdivision, xarrStatuses;
		for ( sFieldNameElem in arrDistinct )
		{
			oRes.data.distincts.SetProperty( sFieldNameElem, [] );
			switch ( sFieldNameElem )
			{
				case "request_type_id":
				{
					for ( carRequestTypeElem in request_types )
					{
						oRes.data.distincts.request_type_id.push( {
							name: ( curLng == null ? carRequestTypeElem.name.Value : tools_web.get_cur_lng_name( carRequestTypeElem.name, curLng.short_id ) ),
							value: carRequestTypeElem.id.Value
						} );
					}
					break;
				}
				case "status_id":
				{
					for ( fldTypeElem in common.request_status_types )
					{
						oRes.data.distincts.status_id.push( {
							name: fldTypeElem.name.Value,
							value: fldTypeElem.id.Value
						} );
					}
					break;
				}
			}
		}
	}

//	if ( oPaging != undefined && oPaging.SIZE != null )
//	{
//		oPaging.MANUAL = true;
//		oPaging.TOTAL = ArrayCount( oRes.requests );
//		oRes.requests = ArrayRange( oRes.requests, OptInt( oPaging.INDEX, 0 ) * oPaging.SIZE, oPaging.SIZE );
//	}

	return oRes;
}

/**
 * @function GetPersonWorkflowRequestsEnv
 * @memberof Websoft.WT.Staff
 * @author MD
 * @description Получение списка заявок, которые для пользователя находятся на этапе согласования в соответствии с документооборотом.
 * @param {bigint} iRequestTypeID - ID типа заявки.
 * @param {string} sStatus - Статус заявки.
 * @param {oCollectionParam} oCollectionParams - Параметры выборки.
 * @returns {ReturnPersonRequests}
*/
function GetPersonWorkflowRequestsEnv( iRequestTypeID, sStatus, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.requests = [];
	oRes.data = {};
	var oPaging = oCollectionParams.GetOptProperty( "paging" );
	oRes.paging = oPaging;

	iRequestTypeID = OptInt( iRequestTypeID, null );
	if ( sStatus == null )
	{
		sStatus = "";
	}
	if ( oCollectionParams == null || oCollectionParams == "" )
	{
		oCollectionParams = new Object;
	}

	var Env = CurRequest.Session.GetOptProperty( "Env", null );
	if ( Env == null )
	{
		oRes.error = 502; // Invalid environment
		oRes.errorText = "{ text: 'Invalid environment Env.', param_name: 'Env' }";
		return oRes;
	}

	var oParams = {
		xquery_qual: ""
	};
	var arrFilters = oCollectionParams.GetOptProperty( "filters", [] );
	if ( iRequestTypeID == null )
	{
		oFilter = ArrayOptFindByKey( arrFilters, "request_type_id", "id" );
		if ( oFilter != undefined && ArrayCount( oFilter.value ) != 0 )
		{
			oParams.xquery_qual += "MatchSome( $elem/request_type_id, (" + ArrayMerge( oFilter.value, "OptInt(This.value,0)", "," ) + ") )";
		}
	}
	else
	{
		oParams.xquery_qual = "$elem/request_type_id = " + iRequestTypeID;
	}
	if ( sStatus == "" )
	{
		oFilter = ArrayOptFindByKey( arrFilters, "status_id", "id" );
		if ( oFilter != undefined && ArrayCount( oFilter.value ) != 0 )
		{
			oParams.xquery_qual += ( oParams.xquery_qual == "" ? "" : " and " ) + "MatchSome( $elem/status_id, (" + ArrayMerge( oFilter.value, "XQueryLiteral(This.value)", "," ) + ") )";
		}
	}
	else
	{
		oParams.xquery_qual += ( oParams.xquery_qual == "" ? "" : " and " ) + "$elem/status_id = " + XQueryLiteral( sStatus );
	}
	oFilter = ArrayOptFindByKey( arrFilters, "search", "type" );
	if ( oFilter != undefined && oFilter.value != "" )
	{
		oParams.xquery_qual += ( oParams.xquery_qual == "" ? "" : " and " ) + "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )";
	}
	if ( oParams.xquery_qual == "" )
	{
		oParams.xquery_qual = "$elem/status_id = 'active'";
	}
		
	if ( oCollectionParams.HasProperty( "sort" ) )
	{
		oParams.disp_sort = oCollectionParams.sort.FIELD != null;
		oParams.order = oCollectionParams.sort.FIELD;
		oParams.direct = oCollectionParams.sort.DIRECTION == "DESC" ? "-": "+";
	}
	if ( oCollectionParams.HasProperty( "paging" ) )
	{
		oParams.disp_paging = oCollectionParams.paging.SIZE > 0;
		oParams.paging_size = oCollectionParams.paging.SIZE;
		oParams.paging_index = oCollectionParams.paging.INDEX;
	}
	
	var oLngEnv = tools_web.get_cur_lng_obj( Env );
	var curLng = oLngEnv.GetOptProperty( "curLng", null );

	var oExtRes = tools_web.external_eval( "workflow_condition_requests", oParams, Env );
	for ( catRequestElem in oExtRes.array )
	{
		catRequestType = catRequestElem.request_type_id.OptForeignElem;
		sRequestType = catRequestType == undefined ? "" : catRequestType.name.Value;
		oRes.requests.push({
			"id": catRequestElem.id.Value,
			"create_date": catRequestElem.create_date.Value,
			"code": catRequestElem.code.Value,
			"request_type_id": catRequestElem.request_type_id.Value,
			"request_type_name": ( curLng == null ? sRequestType : tools_web.get_cur_lng_name( sRequestType, curLng.short_id ) ),
			"type": catRequestElem.type.Value,
			"object_id": catRequestElem.object_id.Value,
			"object_name": catRequestElem.object_name.Value,
			"status_id": catRequestElem.status_id.Value,
			"status_name": catRequestElem.status_id.ForeignElem.name.Value,
			"workflow_state_id": catRequestElem.workflow_state.Value,
			"workflow_state_name": ( curLng == null ? catRequestElem.workflow_state_name.Value : tools_web.get_cur_lng_name( catRequestElem.workflow_state_name.Value, curLng.short_id ) ),
			"link": tools_web.get_mode_clean_url( null, catRequestElem.id )
		});
	}
	if ( oCollectionParams.HasProperty( "paging" ) )
	{
		oPaging.MANUAL = true;
		oPaging.TOTAL = oExtRes.total;
		oRes.paging = oPaging;
	}

	var arrDistinct = oCollectionParams.GetOptProperty( "distincts", [] );
	if ( ArrayOptFirstElem( arrDistinct ) != undefined )
	{
		oRes.data.distincts = new Object;
		var xarrPositions, xarrSubdivision, xarrStatuses;
		for ( sFieldNameElem in arrDistinct )
		{
			oRes.data.distincts.SetProperty( sFieldNameElem, [] );
			switch ( sFieldNameElem )
			{
				case "request_type_id":
				{
					for ( carRequestTypeElem in request_types )
					{
						oRes.data.distincts.request_type_id.push( {
							name: ( curLng == null ? carRequestTypeElem.name.Value : tools_web.get_cur_lng_name( carRequestTypeElem.name, curLng.short_id ) ),
							value: carRequestTypeElem.id.Value
						} );
					}
					break;
				}
				case "status_id":
				{
					for ( fldTypeElem in common.request_status_types )
					{
						oRes.data.distincts.status_id.push( {
							name: fldTypeElem.name.Value,
							value: fldTypeElem.id.Value
						} );
					}
					break;
				}
			}
		}
	}

//	if ( oPaging != undefined && oPaging.SIZE != null )
//	{
//		oPaging.MANUAL = true;
//		oPaging.TOTAL = ArrayCount( oRes.requests );
//		oRes.paging = oPaging;
//		oRes.requests = ArrayRange( oRes.requests, OptInt( oPaging.INDEX, 0 ) * oPaging.SIZE, oPaging.SIZE );
//	}

	return oRes;
}

/**
 * @typedef {Object} oPortalAction
 * @property {string} id
 * @property {string} title
 * @property {string} action_id
*/
/**
 * @typedef {Object} ReturnPortalActions
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPortalAction[]} actions – Массив действий.
*/
/**
 * @function GetPersonRequestWorkflowActionsEnv
 * @memberof Websoft.WT.Staff
 * @description Получение списка действий заявки, которые доступны для пользователя на этапе согласования в соответствии с документооборотом.
 * @param {bigint} iRequestID - ID заявки.
 * @returns {ReturnPortalActions}
*/
function GetPersonRequestWorkflowActionsEnv( iRequestID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.actions = [];
/*
	try
	{
		var iRequestID = Int( iRequestID );
	}
	catch ( err )
	{
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: 'Invalid param iRequestID.', param_name: 'iRequestID' }";
		return oRes;
	}
*/
	try
	{
		var teRequest = OpenDoc( UrlFromDocID( iRequestID ) ).TopElem;
	}
	catch ( err )
	{
		oRes.error = 503; // Param object not found
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iRequestID' }";
		return oRes;
	}

	var Env = CurRequest.Session.GetOptProperty( "Env", null );
	if ( Env == null )
	{
		oRes.error = 502; // Invalid environment
		oRes.errorText = "{ text: 'Invalid environment Env.', param_name: 'Env' }";
		return oRes;
	}

	var oLngEnv = tools_web.get_cur_lng_obj( Env );
	var curLng = oLngEnv.GetOptProperty( "curLng", null );
	var curObjectID = iRequestID;
	var curObject = teRequest;
	var curUserID = Env.GetOptProperty( "curUserID", null );
	var curUser = Env.GetOptProperty( "curUser", null );

	var iWorkflowID = teRequest.workflow_id.Value;
	var teWorkflow = OpenDoc( UrlFromDocID( iWorkflowID ) ).TopElem;
	var sCustomStateActionID = '';
	for ( fldActionElem in teWorkflow.actions )
	{
		if ( ! tools.safe_execution( fldActionElem.condition_eval_str ) )
		{
			continue;
		}
		if ( ArrayOptFindByKey( fldActionElem.operations, 'set_workflow_custom_state', 'type' ) != undefined )
		{
			sCustomStateActionID = fldActionElem.PrimaryKey.Value;
		}

		oRes.actions.push({
			"id": fldActionElem.PrimaryKey.Value,
			"title": ( curLng == null ? fldActionElem.name.Value : tools_web.get_cur_lng_name( fldActionElem.name, curLng.short_id ) ),
			"action_id": fldActionElem.PrimaryKey.Value
		});
	}
	return oRes;
}

/**
 * @typedef {Object} oPortalField
 * @property {string} id
 * @property {string} title
 * @property {string} value
 * @property {string} type
 * @property {string} catalog
 * @property {string} tooltip
*/
/**
 * @typedef {Object} ReturnPoltalFields
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPortalField[]} fields – Массив заявок.
*/
/**
 * @function GetPersonRequestWorkflowFieldsEnv
 * @memberof Websoft.WT.Staff
 * @description Получение списка полей заявки, которые доступны на чтение для пользователя на этапе согласования в соответствии с документооборотом.
 * @author MD
 * @param {bigint} iRequestID - ID заявки.
 * @returns {ReturnPoltalFields}
*/
function GetPersonRequestWorkflowFieldsEnv( iRequestID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.fields = [];

	try
	{
		iRequestID = Int( iRequestID );
	}
	catch ( err )
	{
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: 'Invalid param iRequestID.', param_name: 'iRequestID' }";
		return oRes;
	}
	try
	{
		var teRequest = OpenDoc( UrlFromDocID( iRequestID ) ).TopElem;
	}
	catch ( err )
	{
		oRes.error = 503; // Param object not found
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iRequestID' }";
		return oRes;
	}

	var Env = CurRequest.Session.GetOptProperty( "Env", null );
	if ( Env == null )
	{
		oRes.error = 502; // Invalid environment
		oRes.errorText = "{ text: 'Invalid environment Env.', param_name: 'Env' }";
		return oRes;
	}

	var oLngEnv = tools_web.get_cur_lng_obj( Env );
	var curLng = oLngEnv.GetOptProperty( "curLng", null );
	var curObjectID = iRequestID;
	var curObject = teRequest;
	var curUserID = Env.GetOptProperty( "curUserID", null );
	var curUser = Env.GetOptProperty( "curUser", null );

	var iWorkflowID = teRequest.workflow_id.Value;
	var teWorkflow = OpenDoc( UrlFromDocID( iWorkflowID ) ).TopElem;
	var arrWorkflowFields = [];
	for ( fldGroupElem in teWorkflow.field_groups )
	{
		if ( ! tools.safe_execution( fldGroupElem.read_conditions.condition_eval_str ) )
		{
			continue;
		}

		for ( fldFieldElem in ArraySelectByKey( teWorkflow.workflow_fields, fldGroupElem.code, 'field_group_id' ) )
		{
			arrWorkflowFields.push( fldFieldElem );
		}
	}

	for ( fldWorkflowFieldElem in arrWorkflowFields )
	{
		sValue = "";
		fldWorkflowField = teRequest.workflow_fields.GetOptChildByKey( fldWorkflowFieldElem.PrimaryKey );
		if ( fldWorkflowField != undefined )
		{
			sValue = fldWorkflowField.value.Value;
		}

		oRes.fields.push({
			"id": fldWorkflowFieldElem.PrimaryKey.Value,
			"title": ( curLng == null ? fldWorkflowFieldElem.title.Value : tools_web.get_cur_lng_name( fldWorkflowFieldElem.title, curLng.short_id ) ),
			"value": sValue,
			"type": fldWorkflowFieldElem.type.Value,
			"catalog": fldWorkflowFieldElem.catalog.Value,
			"tooltip": fldWorkflowFieldElem.tooltip.Value
		});
	}
	return oRes;
}

/**
 * @typedef {Object} ReturnPoltalFields
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {PortalField[]} fields – Массив заявок.
*/
/**
 * @function GetPersonRequestActionWorkflowFieldsEnv
 * @memberof Websoft.WT.Staff
 * @description Получение списка действий заявки, которые доступны для пользователя на этапе согласования в соответствии с документооборотом.
 * @param {bigint} iRequestID - ID заявки.
 * @returns {ReturnPoltalFields}
*/
function GetPersonRequestActionWorkflowFieldsEnv( iRequestID )
{
	var oRes = tools.get_code_library_result_object();
	oRes.fields = [];
/*
	try
	{
		var iRequestID = Int( iRequestID );
	}
	catch ( err )
	{
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: 'Invalid param iRequestID.', param_name: 'iRequestID' }";
		return oRes;
	}
*/
	try
	{
		var teRequest = OpenDoc( UrlFromDocID( iRequestID ) ).TopElem;
	}
	catch ( err )
	{
		oRes.error = 503; // Param object not found
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iRequestID' }";
		return oRes;
	}

	var Env = CurRequest.Session.GetOptProperty( "Env", null );
	if ( Env == null )
	{
		oRes.error = 502; // Invalid environment
		oRes.errorText = "{ text: 'Invalid environment Env.', param_name: 'Env' }";
		return oRes;
	}

	var oLngEnv = tools_web.get_cur_lng_obj( Env );
	var curLng = oLngEnv.GetOptProperty( "curLng", null );
	var curObjectID = iRequestID;
	var curObject = teRequest;
	var curUserID = Env.GetOptProperty( "curUserID", null );
	var curUser = Env.GetOptProperty( "curUser", null );

	var iWorkflowID = teRequest.workflow_id.Value;
	var teWorkflow = OpenDoc( UrlFromDocID( iWorkflowID ) ).TopElem;
	var arrWorkflowFields = [];
	for ( fldGroupElem in teWorkflow.field_groups )
	{
		if ( ! tools.safe_execution( fldGroupElem.read_conditions.condition_eval_str ) )
		{
			continue;
		}
		if ( ! tools.safe_execution( fldGroupElem.write_conditions.condition_eval_str ) )
		{
			continue;
		}

		for ( fldFieldElem in ArraySelectByKey( teWorkflow.workflow_fields, fldGroupElem.code, 'field_group_id' ) )
		{
			arrWorkflowFields.push( fldFieldElem );
		}
	}

	for ( fldWorkflowFieldElem in arrWorkflowFields )
	{
		sValue = "";
		fldWorkflowField = teRequest.workflow_fields.GetOptChildByKey( fldWorkflowFieldElem.PrimaryKey );
		if ( fldWorkflowField != undefined )
		{
			sValue = fldWorkflowField.value.Value;
		}

		oRes.fields.push({
			"id": fldWorkflowFieldElem.PrimaryKey.Value,
			"title": ( curLng == null ? fldWorkflowFieldElem.title.Value : tools_web.get_cur_lng_name( fldWorkflowFieldElem.title.Value, curLng.short_id ) ),
			"value": sValue,
			"type": fldWorkflowFieldElem.type.Value,
			"catalog": fldWorkflowFieldElem.catalog.Value,
			"tooltip": fldWorkflowFieldElem.tooltip.Value,
			"query_qual": fldWorkflowFieldElem.xquery_qual.Value

		});
	}
	return oRes;
}

/**
 * @typedef {Object} oProfessionalArea
 * @property {bigint} id
 * @property {string} name
 * @property {bigint} parent_id
 * @property {string} link
*/
/**
 * @typedef {Object} WTProfessionalAreaResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oProfessionalArea[]} array – массив
*/
/**
 * @function GetProfessionalAreas
 * @memberof Websoft.WT.Staff
 * @description Получения списка профессиональных областей.
 * @param {boolean} [bCheckAcess] - Проверять права доступа
 * @param {bigint} [iPersonID] - ID сотрудника
 * @returns {WTProfessionalAreaResult}
*/
function GetProfessionalAreas( bCheckAcess, iPersonID )
{
	return get_professional_areas( bCheckAcess, iPersonID );
}

function get_professional_areas( bCheckAcess, iPersonID, tePerson, bShowWithVac, bShowOnlyParent, sParentCode, sSortField, sSortDirection )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];
	try
	{
		if ( bCheckAcess == undefined || bCheckAcess == null )
			throw "";
		bCheckAcess = tools_web.is_true( bCheckAcess );
	}
	catch( ex )
	{
		bCheckAcess = false;
	}
	try
	{
		if ( sParentCode == undefined || sParentCode == null || sParentCode == ""  )
			throw "";
	}
	catch( ex )
	{
		sParentCode = null;
	}
	try
	{
		if ( bShowOnlyParent == undefined || bShowOnlyParent == null )
			throw "";
		bShowOnlyParent = tools_web.is_true( bShowOnlyParent );
	}
	catch( ex )
	{
		bShowOnlyParent = false;
	}
	try
	{
		if ( bShowWithVac == undefined || bShowWithVac == null || sParentCode == "" )
			throw "";
		bShowWithVac = tools_web.is_true( bShowWithVac );
	}
	catch( ex )
	{
		bShowWithVac = false;
	}
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
		if( iPersonID != null )
			tePerson.Name;
	}
	catch( ex )
	{
		if ( iPersonID != null )
			try
			{
				tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
			}
			catch( ex )
			{
				oRes.action_result = { command: "error", msg: "Некорректный ID сотрудника" };
				return oRes;
			}
		else
			tePerson = null;
	}
	try
	{
		if( sSortField == undefined || sSortField == "" )
			throw "error";
	}
	catch( ex )
	{
		sSortField = null;
	}
	try
	{
		if( sSortDirection == undefined || sSortDirection == "" )
			throw "error";
	}
	catch( ex )
	{
		sSortDirection = null;
	}

	function add_childs( parent_id )
	{
		var obj;
		for( elem in XQuery( "for $elem in professional_areas where $elem/parent_id = " + parent_id + " return $elem" ) )
		{
			if ( bShowWithVac && ArrayOptFind( arrProfAreaVacancys, "This.profession_id == elem.id" ) == undefined )
				continue;
			if ( bCheckAcess && !tools_web.check_access( elem.id, iPersonID, tePerson ) )
				continue;
			if ( ArrayOptFind( oRes.array, "This.id == elem.id" ) != undefined )
				continue;
			obj = new Object();
			obj.id = elem.id.Value;
			obj.name = elem.name.Value;
			obj.parent_id = elem.parent_id.Value;
			obj.image_url = tools_web.get_object_source_url( 'resource', elem.resource_id.Value );
			obj.comment = elem.comment.Value;
			obj.link = tools_web.get_mode_clean_url( null, elem.id );
			oRes.array.push( obj );
			add_childs( obj.id );
		}
	}

	var conds = new Array();

	if ( sParentCode != null )
	{
		catParent = ArrayOptFirstElem( XQuery( "for $elem in professional_areas where $elem/code = " + XQueryLiteral( sParentCode ) + " return $elem" ) );
		if ( catParent != undefined )
		{
			conds.push( "$elem/parent_id = " + catParent.id );
		}
		else
		{
			return oRes;
		}
	}
	else
	{
		conds.push( "$elem/parent_id = null()" );
	}

	arrProfAreaVacancys = new Array();

	if ( bShowWithVac )
	{
		arrProfAreaVacancys = ArraySelectDistinct( XQuery( "for $elem in vacancys where $elem/profession_id != null() return $elem/Fields( 'profession_id' )" ), "This.profession_id" );
	}

	for ( elem in XQuery( "for $elem in professional_areas where " + ArrayMerge( conds, "This", " and " ) + " return $elem" ) )
	{
		if ( bShowWithVac && ArrayOptFind( arrProfAreaVacancys, "This.profession_id == elem.id" ) == undefined )
			continue;
		if ( bCheckAcess && !tools_web.check_access( elem.id, iPersonID, tePerson ) )
			continue;
		obj = new Object();
		obj.id = elem.id.Value;
		obj.name = elem.name.Value;
		obj.parent_id = elem.parent_id.Value;
		obj.image_url = tools_web.get_object_source_url( 'resource', elem.resource_id.Value );
		obj.comment = elem.comment.Value;
		obj.link = tools_web.get_mode_clean_url( null, elem.id );
		oRes.array.push( obj );
		if ( !bShowOnlyParent )
			add_childs( obj.id );
	}
	if( sSortField != null )
	{
		oRes.array = ArraySort( oRes.array, sSortField, ( sSortDirection == "asc" ? "+" : "-" ) );
	}
	return oRes
}

/**
 * @typedef {Object} oVacancy
 * @property {bigint} id
 * @property {string} name
 * @property {integer} professional_area_id
 * @property {string} professional_area_name
 * @property {integer} region_id
 * @property {string} region_name
 * @property {integer} min_wage
 * @property {integer} max_wage
 * @property {string} full_wage
 * @property {string} employment
 * @property {date} publication_date
 * @property {string} image_url
 * @property {string} comment
 * @property {string} description
 * @property {string} link
*/
/**
 * @typedef {Object} WTVacancyResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {oVacancy[]} array – массив
*/
/**
 * @function GetVacancys
 * @memberof Websoft.WT.Staff
 * @description Получение списка вакансий.
 * @author PL, AZ
 * @param {bigint} [iProfessionalAreaID] - ID профессиональной области.
 * @param {bigint} [iRegionID] - ID региона.
 * @param {string} [sSearch] - Полнотекстовый поиск по каталогу вакансий.
 * @param {boolean} [bShowOnlyCurrentSiteVacancies] - Показывать только те вакансии, которые относятся к текущему сайту.
 * @param {bigint} [iRecruitmentSystemID] - Система подбора персонала.
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {WTVacancyResult}
*/
function GetVacancys( iProfessionalAreaID, iRegionID, sSearch, bShowOnlyCurrentSiteVacancies, iRecruitmentSystemID, oCollectionParams  )
{
	return get_vacancys( iProfessionalAreaID, iRegionID, sSearch, '', '', bShowOnlyCurrentSiteVacancies, iRecruitmentSystemID );
}

function get_vacancys( iProfessionalAreaID, iRegionID, sSearch, sXqueryQual, sHrefMode, bShowOnlyCurrentSiteVacancies, iRecruitmentSystemID, oCollectionParams )
{
	if(DataType(oCollectionParams) != 'object' || ObjectType(oCollectionParams) != 'JsObject')
	{
		oCollectionParams = {
			paging: null,
			sort: null,
			filters: [],
			distincts: []
		};
	}
	else
	{
		if(!oCollectionParams.HasProperty('paging'))
			oCollectionParams.SetProperty('paging', null);

		if(!oCollectionParams.HasProperty('sort'))
			oCollectionParams.SetProperty('sort', null);

		if(!oCollectionParams.HasProperty('filters') || !IsArray( oCollectionParams.filters ))
			oCollectionParams.SetProperty('filters', []);

		if(!oCollectionParams.HasProperty('distincts') || !IsArray( oCollectionParams.distincts ))
			oCollectionParams.SetProperty('distincts', []);
	}


	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];
	oRes.paging = oCollectionParams.paging;
	oRes.data = {};

	var conds = new Array();

	var Env = CurRequest.Session.GetOptProperty( "Env", ({}) );
	var curSiteID = OptInt( Env.GetOptProperty( "curSiteID" ), null );

	try
	{
		iProfessionalAreaID = Int( iProfessionalAreaID );
		conds.push( "$elem/profession_id = " + iProfessionalAreaID );
	}
	catch( ex )
	{
	}

	try
	{
		iRegionID = Int( iRegionID );
		conds.push( "$elem/region_id = " + iRegionID );
	}
	catch( ex )
	{
	}

	try
	{
		if ( sXqueryQual == undefined || sXqueryQual == null || sXqueryQual == "" )
			throw "";
		conds.push( "( " + sXqueryQual + " )" );
	}
	catch( ex )
	{}

	try
	{
		if ( sHrefMode == undefined )
			throw "";
	}
	catch( ex )
	{
		sHrefMode = null;
	}

	try
	{
		if ( sSearch == undefined || sSearch == '' )
			throw '';

		conds.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( sSearch ) + " )" );
	}
	catch( ex )
	{
	}

	try
	{
		if ( bShowOnlyCurrentSiteVacancies == null || bShowOnlyCurrentSiteVacancies == undefined )
			throw '';
		else
			bShowOnlyCurrentSiteVacancies = tools_web.is_true( bShowOnlyCurrentSiteVacancies );

		if ( bShowOnlyCurrentSiteVacancies && curSiteID != null )
			conds.push( "$elem/site_id = " + curSiteID );

	}
	catch( ex )
	{
		bShowOnlyCurrentSiteVacancies = false
	}

	try
	{
		iRecruitmentSystemID = Int( iRecruitmentSystemID );
	}
	catch( ex )
	{
		try
		{
			iRecruitmentSystemID = Int( global_settings.settings.recruitment.recruitment_system_id )
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = "Не указана система подбора персонала";
			return oRes;
		}
	}

	for ( oFilter in oCollectionParams.filters )
	{
		if ( oFilter.type == 'search' && ( sSearch == undefined || sSearch == '' ) )
		{
			if ( oFilter.value != '' )
				conds.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )" );
		}
		else if ( oFilter.type == 'select' )
		{
			switch ( oFilter.id )
			{
				case 'professional_area_id':
				{
					if ( ArrayOptFind( oFilter.value, "This.value != ''" ) != undefined )
					{
						conds.push( "MatchSome( $elem/profession_id, ( " + ArrayMerge( ArraySelect( oFilter.value, "This.value != ''"), "This.value", "," ) + " ) )" );
					}
					break;
				}
				case 'region_id':
				{
					if ( ArrayOptFind( oFilter.value, "This.value != ''" ) != undefined )
					{
						conds.push( "MatchSome( $elem/region_id, ( " + ArrayMerge( ArraySelect( oFilter.value, "This.value != ''"), "This.value", "," ) + " ) )" );
					}
					break;
				}
				case 'employment_id':
				{
					if ( ArrayOptFind( oFilter.value, "This.value != ''" ) != undefined )
					{
						conds.push( "MatchSome( $elem/schedule_work_id, ( " + ArrayMerge( ArraySelect( oFilter.value, "This.value != ''"), "This.value", "," ) + " ) )" );
					}
					break;
				}
			}
		}
		else if ( oFilter.type == 'int' )
		{
			switch ( oFilter.id )
			{
				case 'wage':
					try
					{
						if ( oFilter.value_from != '' )
						{
							conds.push( "$elem/min_wage >= " + oFilter.value_from );
						}
					}
					catch( e )
					{}
					try
					{
						if ( oFilter.value_to != '' )
						{
							conds.push( "$elem/max_wage <= " + oFilter.value_to );
						}
					}
					catch( e )
					{}
					break;
			}
		}
		else if ( oFilter.type == 'date' )
		{
			try
			{
				if ( oFilter.value_from != '' )
				{
					conds.push( "$elem/pub_date >= " + XQueryLiteral( Date( oFilter.value_from ) ) );
				}
			}
			catch( e )
			{}
			try
			{
				if ( oFilter.value_to != '' )
				{
					conds.push( "$elem/pub_date <= " + XQueryLiteral( Date( oFilter.value_to ) ) );
				}
			}
			catch( e )
			{}
		}
	}

	function get_vacancy_foreign_object_name( iObjectID )
	{
		if ( ! iObjectID.HasValue )
			return "";

		var oForeignObject = ArrayOptFind( arrVacancyForeignObjects, "This.id == iObjectID" );
		if ( oForeignObject == undefined )
		{
			oForeignObject = new Object();
			oForeignObject.id = iObjectID.Value;
			try
			{
				oForeignObject.name = iObjectID.ForeignElem.name.Value;
			}
			catch( ex )
			{
				oForeignObject.name = global_settings.object_deleted_str.Value;
			}
			arrVacancyForeignObjects.push( oForeignObject );
		}
		return oForeignObject.name;
	}

	var arrVacancyForeignObjects = new Array();

	var arrVacancies = new Array();

	var sCondSort = " order by $elem/creation_date descending";
	if ( ObjectType( oCollectionParams.sort ) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		switch ( oCollectionParams.sort.FIELD )
		{
			case "professional_area_id":
				sCondSort = " order by $elem/profession_area_id" + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "") ;
				break;
			case "publication_date":
				sCondSort = " order by $elem/pub_date" + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "") ;
				break;
			case "professional_area_name":
			case "region_name":
			case "full_wage":
			case "employment":
			case "image_url":
			case "comment":
			case "description":
			case "link":
				break;
			default:
				sCondSort = " order by $elem/" + oCollectionParams.sort.FIELD + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "") ;
		}
	}

	catRecruitmentSystem = ArrayOptFirstElem( XQuery( "for $elem in recruitment_systems where $elem/id = " + iRecruitmentSystemID + " return $elem/Fields( 'code' )" ) )
	if ( catRecruitmentSystem != undefined && catRecruitmentSystem.code == 'websoft_hcm' )
	{
		arrVacancies = XQuery( "for $elem in vacancys " + ( ArrayOptFirstElem( conds ) != undefined ? " where " + ArrayMerge( conds, "This", " and " ) : "" ) + sCondSort + " return $elem" );
	}

	arrRegions = XQuery( "for $elem in regions where MatchSome( $elem/id, ( " + ArrayMerge( ArrayExtract( arrVacancies, 'This.region_id' ) , 'This', ',' ) + " ) ) return $elem/Fields( 'id', 'name' )" );
	arrProfessionAreas = XQuery( "for $elem in professional_areas where MatchSome( $elem/id, ( " + ArrayMerge( ArrayExtract( arrVacancies, 'This.profession_id' ) , 'This', ',' ) + " ) ) return $elem/Fields( 'id', 'name' )" );

	if ( ArrayOptFirstElem( oCollectionParams.distincts ) != undefined )
	{
		oRes.data.SetProperty( "distincts", {} );
		for ( sFieldName in arrDistincts )
		{
			oRes.data.distincts.SetProperty( sFieldName, [] );
			switch( sFieldName )
			{
				case 'professional_area_id':
				{
					for ( catProfession in arrProfessionAreas )
					{
						oRes.data.distincts.professional_area_id.push( { name: catProfession.name.Value, value: catProfession.id.Value } );
					}
					break;
				}
				case 'region_id':
				{
					for ( catRegion in arrRegions )
					{
						oRes.data.distincts.region_id.push( { name: catRegion.name.Value, value: catRegion.id.Value } );
					}
					break;
				}
				case 'employment_id':
				{
					for ( fldEmployment in common.employment_kinds )
					{
						oRes.data.distincts.employment_id.push( { name: fldEmployment.name.Value, value: fldEmployment.id.Value } );
					}
					break;
				}
			}
		}
	}

	if ( ObjectType( oCollectionParams.paging ) == 'JsObject' && oCollectionParams.paging.SIZE != null )
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount( arrVacancies );
		oRes.paging = oCollectionParams.paging;
		arrVacancies = ArrayRange( arrVacancies, OptInt( oCollectionParams.paging.INDEX, 0 ) * oCollectionParams.paging.SIZE, oCollectionParams.paging.SIZE );
	}

	for ( catVacancy in arrVacancies )
	{
		obj = new Object();
		obj.id = catVacancy.id.Value;
		obj.name = catVacancy.name.Value;
		obj.professional_area_id = catVacancy.profession_id.Value;
		obj.professional_area_name = get_vacancy_foreign_object_name( catVacancy.profession_id );
		obj.region_id = catVacancy.region_id.Value;
		obj.region_name = get_vacancy_foreign_object_name( catVacancy.region_id );
		obj.image_url = tools_web.get_object_source_url( 'resource', catVacancy.resource_id.Value );
		obj.comment = catVacancy.comment.Value;

		obj.max_wage = catVacancy.max_wage.Value;
		obj.min_wage = catVacancy.min_wage.Value;

		obj.min_wage_desc = ! catVacancy.max_wage.HasValue ? ( catVacancy.min_wage.HasValue ? 'от ' + catVacancy.min_wage.Value : '' ) : catVacancy.min_wage.Value;

		sCurrencyType = catVacancy.currency_type_id.HasValue ? ' ' + lists.currency_types.GetOptChildByKey( catVacancy.currency_type_id ).short_name : '';

		if ( catVacancy.min_wage.HasValue && catVacancy.max_wage.Value )
		{
			obj.full_wage = 'от ' + catVacancy.min_wage.Value + ' до ' + catVacancy.max_wage.Value + sCurrencyType;
		}
		else if ( catVacancy.min_wage.HasValue && ! catVacancy.max_wage.Value )
		{
			obj.full_wage = 'от ' + catVacancy.min_wage.Value + sCurrencyType;
		}
		else if ( ! catVacancy.min_wage.HasValue && catVacancy.max_wage.Value )
		{
			obj.full_wage = 'до ' + catVacancy.max_wage.Value + sCurrencyType;
		}
		else
		{
			obj.full_wage = 'з/п не указана';
		}

		obj.employment_id = catVacancy.schedule_work_id.Value;
		obj.employment = catVacancy.schedule_work_id.HasValue ? catVacancy.schedule_work_id.ForeignElem.name.Value : 'Не указано';
		obj.publication_date = catVacancy.pub_date.Value;

		docVacancy = tools.open_doc( obj.id );
		if ( docVacancy != undefined )
		{
			obj.description = HtmlToPlainText( docVacancy.TopElem.desc.Value );
			obj.link = sHrefMode == null ? ( docVacancy.TopElem.access.web_mode_id.HasValue ? tools_web.get_mode_clean_url( docVacancy.TopElem.access.web_mode_id.ForeignElem.code, catVacancy.id ) : tools_web.get_mode_clean_url( 'cp_vacancy', catVacancy.id ) ) : tools_web.get_mode_clean_url( sHrefMode, catVacancy.id );
		}
		oRes.array.push( obj );
	}

	return oRes
}

/**
 * @typedef {Object} oSimilarVacancies
 * @property {bigint} id
 * @property {string} name
 * @property {integer} professional_area_id
 * @property {string} professional_area_name
 * @property {integer} region_id
 * @property {string} region_name
 * @property {integer} min_wage
 * @property {integer} max_wage
 * @property {integer} full_wage
 * @property {string} employment
 * @property {date} publication_date
 * @property {string} image_url
 * @property {string} comment
 * @property {string} description
 * @property {string} link
*/
/**
 * @typedef {Object} ReturnSimilarVacancies
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {oSimilarVacancies[]} array – массив
*/
/**
 * @function GetSimilarVacancies
 * @memberof Websoft.WT.Staff
 * @description Получение списка похожих вакансий.
 * @author AZ
 * @param {boolean} [bShowOnlyCurrentSiteVacancies] - Показывать только те вакансии, которые относятся к текущему сайту.
 * @param {bigint} [iRecruitmentSystemID] - Система подбора персонала.
 * @param {string[]} arrDistincts - перечень полей для формирования дополнительных списков для виджета фильтров
 * @param {oSimpleFilterElem[]} arrFilters - набор фильтров
 * @param {oSort} oSort - Информация из рантайма о сортировке
 * @param {oPaging} oPaging - Информация из рантайма о пейджинге
 * @returns {ReturnSimilarVacancies}
*/

function GetSimilarVacancies( iVacancyID, bShowOnlyCurrentSiteVacancies, iRecruitmentSystemID, arrDistincts, arrFilters, oSort, oPaging )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];
	oRes.paging = oPaging;
	oRes.data = {};

	var Env = CurRequest.Session.GetOptProperty( "Env", ({}) );
	var curSiteID = OptInt( Env.GetOptProperty( "curSiteID" ), null );

	var arrXQueryConditions = new Array();

	try
	{
		if ( iVacancyID == null )
			throw ''
		else
			iVacancyID = Int( iVacancyID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID вакансии";
		return oRes;
	}

	try
	{
		if ( bShowOnlyCurrentSiteVacancies == null || bShowOnlyCurrentSiteVacancies == undefined )
			throw '';
		else
			bShowOnlyCurrentSiteVacancies = tools_web.is_true( bShowOnlyCurrentSiteVacancies );

		if ( bShowOnlyCurrentSiteVacancies && curSiteID != null )
			arrXQueryConditions.push( "$elem/site_id = " + curSiteID );
	}
	catch( ex )
	{
		bShowOnlyCurrentSiteVacancies = false
	}

	try
	{
		iRecruitmentSystemID = Int( iRecruitmentSystemID );

	}
	catch( ex )
	{
		try
		{
			iRecruitmentSystemID = Int( global_settings.settings.recruitment.recruitment_system_id )
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = "Не указана система подбора персонала";
			return oRes;
		}
	}

	try
	{
		if ( ! IsArray( arrFilters ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		arrFilters = new Array();
	}

	for ( oFilter in arrFilters )
	{
		if ( oFilter.type == 'search' && ( sSearch == undefined || sSearch == '' ) )
		{
			if ( oFilter.value != '' )
			arrXQueryConditions.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )" );
		}
		else if ( oFilter.type == 'select' )
		{
			switch ( oFilter.id )
			{

				case 'professional_area_id':
				{
					if ( ArrayOptFind( oFilter.value, "This.value != ''" ) != undefined )
					{
						arrXQueryConditions.push( "MatchSome( $elem/profession_id, ( " + ArrayMerge( ArraySelect( oFilter.value, "This.value != ''"), "This.value", "," ) + " ) )" );
					}
					break;
				}
				case 'region_id':
				{
					if ( ArrayOptFind( oFilter.value, "This.value != ''" ) != undefined )
					{
						arrXQueryConditions.push( "MatchSome( $elem/region_id, ( " + ArrayMerge( ArraySelect( oFilter.value, "This.value != ''"), "This.value", "," ) + " ) )" );
					}
					break;
				}
				case 'employment_id':
				{
					if ( ArrayOptFind( oFilter.value, "This.value != ''" ) != undefined )
					{
						arrXQueryConditions.push( "MatchSome( $elem/schedule_work_id, ( " + ArrayMerge( ArraySelect( oFilter.value, "This.value != ''"), "This.value", "," ) + " ) )" );
					}
					break;
				}
			}
		}
		else if ( oFilter.type == 'int' )
		{
			switch ( oFilter.id )
			{
				case 'wage':
					try
					{
						if ( oFilter.value_from != '' )
						{
							arrXQueryConditions.push( "$elem/min_wage >= " + oFilter.value_from );
						}
					}
					catch( e )
					{}
					try
					{
						if ( oFilter.value_to != '' )
						{
							arrXQueryConditions.push( "$elem/max_wage <= " + oFilter.value_to );
						}
					}
					catch( e )
					{}
					break;
			}
		}
		else if ( oFilter.type == 'date' )
		{
			try
			{
				if ( oFilter.value_from != '' )
				{
					arrXQueryConditions.push( "$elem/pub_date >= " + XQueryLiteral( Date( oFilter.value_from ) ) );
				}
			}
			catch( e )
			{}
			try
			{
				if ( oFilter.value_to != '' )
				{
					arrXQueryConditions.push( "$elem/pub_date <= " + XQueryLiteral( Date( oFilter.value_to ) ) );
				}
			}
			catch( e )
			{}
		}
	}

	arrSimilarVacanciesByProfArea = new Array();
	arrSimilarVacanciesByEmployment = new Array();
	arrSimilarVacanciesByRegion = new Array();
	arrResultVacancies = new Array();

	var sCondSort = " order by $elem/creation_date descending";
	if ( ObjectType( oSort ) == 'JsObject' && oSort.FIELD != null && oSort.FIELD != undefined && oSort.FIELD != "" )
	{
		switch ( oSort.FIELD )
		{
			case "professional_area_id":
				sCondSort = " order by $elem/profession_area_id" + ( StrUpperCase( oSort.DIRECTION ) == "DESC" ? " descending" : "" );
				break;
			case "publication_date":
				sCondSort = " order by $elem/pub_date" + ( StrUpperCase( oSort.DIRECTION ) == "DESC" ? " descending" : "" );
				break;
			case "professional_area_name":
			case "region_name":
			case "full_wage":
			case "employment":
			case "image_url":
			case "comment":
			case "description":
			case "link":
				break;
			default:
				sCondSort = " order by $elem/" + oSort.FIELD + ( StrUpperCase( oSort.DIRECTION ) == "DESC" ? " descending" : "" );
		}
	}

	docVacancy = tools.open_doc( iVacancyID );
	if ( docVacancy != undefined )
	{
		teVacancy = docVacancy.TopElem;

		catRecruitmentSystem = ArrayOptFirstElem( XQuery( "for $elem in recruitment_systems where $elem/id = " + iRecruitmentSystemID + " return $elem/Fields( 'code' )" ) )
		if ( catRecruitmentSystem != undefined && catRecruitmentSystem.code == 'websoft_hcm' )
		{
			arrXQueryConditions.push( "$elem/id != " + teVacancy.id );

			if ( teVacancy.profession_area_id.HasValue )
			{
				arrXQueryConditions.push( "$elem/profession_area_id = '" + teVacancy.profession_area_id + "'" );
			}

			sXQueryConditions = ArrayCount( arrXQueryConditions ) > 0 ? ' where ' + ArrayMerge( arrXQueryConditions, 'This', ' and ' ) : '';

			arrSimilarVacanciesByProfArea = XQuery( "for $elem in vacancys " + sXQueryConditions + sCondSort + " return $elem" );

			if ( teVacancy.schedule_work_id.HasValue )
			{
				arrSimilarVacanciesByEmployment = ArraySelect( arrSimilarVacanciesByProfArea, "This.schedule_work_id == teVacancy.schedule_work_id" );
			}

			if ( teVacancy.region_id.HasValue )
			{
				if ( ArrayCount( arrSimilarVacanciesByEmployment ) > 0 )
				{
					arrSimilarVacanciesByRegion = ArraySelect( arrSimilarVacanciesByEmployment, "This.region_id == teVacancy.region_id" );
				}
				else
				{
					arrSimilarVacanciesByRegion = ArraySelect( arrSimilarVacanciesByProfArea, "This.region_id == teVacancy.region_id" );
				}
			}
		}

		arrResultVacancies = ArraySelectDistinct( ArrayUnion( arrSimilarVacanciesByRegion, arrSimilarVacanciesByEmployment, arrSimilarVacanciesByProfArea ), 'This.id' );

	}

	function get_vacancy_foreign_object_name( iObjectID )
	{
		if ( ! iObjectID.HasValue )
			return "";

		var oForeignObject = ArrayOptFind( arrVacancyForeignObjects, "This.id == iObjectID" );
		if ( oForeignObject == undefined )
		{
			oForeignObject = new Object();
			oForeignObject.id = iObjectID.Value;
			try
			{
				oForeignObject.name = iObjectID.ForeignElem.name.Value;
			}
			catch( ex )
			{
				oForeignObject.name = global_settings.object_deleted_str.Value;
			}
			arrVacancyForeignObjects.push( oForeignObject );
		}
		return oForeignObject.name;
	}

	var arrVacancyForeignObjects = new Array();

	arrRegions = XQuery( "for $elem in regions where MatchSome( $elem/id, ( " + ArrayMerge( ArrayExtract( arrResultVacancies, 'This.region_id' ) , 'This', ',' ) + " ) ) return $elem/Fields( 'id', 'name' )" );
	arrProfessionAreas = XQuery( "for $elem in professional_areas where MatchSome( $elem/id, ( " + ArrayMerge( ArrayExtract( arrResultVacancies, 'This.profession_id' ) , 'This', ',' ) + " ) ) return $elem/Fields( 'id', 'name' )" );

	if ( ArrayOptFirstElem( arrDistincts ) != undefined )
	{
		oRes.data.SetProperty( "distincts", {} );
		for ( sFieldName in arrDistincts )
		{
			oRes.data.distincts.SetProperty( sFieldName, [] );
			switch( sFieldName )
			{
				case 'professional_area_id':
				{
					for ( catProfession in arrProfessionAreas )
					{
						oRes.data.distincts.professional_area_id.push( { name: catProfession.name.Value, value: catProfession.id.Value } );
					}
					break;
				}
				case 'region_id':
				{
					for ( catRegion in arrRegions )
					{
						oRes.data.distincts.region_id.push( { name: catRegion.name.Value, value: catRegion.id.Value } );
					}
					break;
				}
				case 'employment_id':
				{
					for ( fldEmployment in common.employment_kinds )
					{
						oRes.data.distincts.employment_id.push( { name: fldEmployment.name.Value, value: fldEmployment.id.Value } );
					}
					break;
				}
			}
		}
	}

	if ( ObjectType( oPaging ) == 'JsObject' && oPaging.SIZE != null )
	{
		oPaging.MANUAL = true;
		oPaging.TOTAL = ArrayCount( arrResultVacancies );
		oRes.paging = oPaging;
		arrResultVacancies = ArrayRange( arrResultVacancies, OptInt( oPaging.INDEX, 0 ) * oPaging.SIZE, oPaging.SIZE );
	}

	for ( catVacancy in arrResultVacancies )
	{
		obj = new Object();
		obj.id = catVacancy.id.Value;
		obj.name = catVacancy.name.Value;
		obj.professional_area_id = catVacancy.profession_id.Value;
		obj.professional_area_name = get_vacancy_foreign_object_name( catVacancy.profession_id );
		obj.region_id = catVacancy.region_id.Value;
		obj.region_name = get_vacancy_foreign_object_name( catVacancy.region_id );
		obj.image_url = tools_web.get_object_source_url( 'resource', catVacancy.resource_id.Value );
		obj.comment = catVacancy.comment.Value;

		obj.min_wage = catVacancy.min_wage.Value;
		obj.max_wage = catVacancy.max_wage.Value;

		sCurrencyType = catVacancy.currency_type_id.HasValue ? ' ' + lists.currency_types.GetOptChildByKey( catVacancy.currency_type_id ).short_name : '';

		if ( catVacancy.min_wage.HasValue && catVacancy.max_wage.Value )
		{
			obj.full_wage = 'от ' + catVacancy.min_wage.Value + ' до ' + catVacancy.max_wage.Value + sCurrencyType;
		}
		else if ( catVacancy.min_wage.HasValue && ! catVacancy.max_wage.Value )
		{
			obj.full_wage = 'от ' + catVacancy.min_wage.Value + sCurrencyType;
		}
		else if ( ! catVacancy.min_wage.HasValue && catVacancy.max_wage.Value )
		{
			obj.full_wage = 'до ' + catVacancy.max_wage.Value + sCurrencyType;
		}
		else
		{
			obj.full_wage = 'з/п не указана';
		}

		obj.employment_id = catVacancy.schedule_work_id.Value;
		obj.employment = catVacancy.schedule_work_id.HasValue ? catVacancy.schedule_work_id.ForeignElem.name.Value : '';
		obj.publication_date = catVacancy.pub_date.Value;

		docCurVacancy = tools.open_doc( obj.id );
		if ( docCurVacancy != undefined )
		{
			obj.description = HtmlToPlainText( docCurVacancy.TopElem.desc.Value );
			obj.link = docCurVacancy.TopElem.access.web_mode_id.HasValue ? tools_web.get_mode_clean_url( docCurVacancy.TopElem.access.web_mode_id.ForeignElem.code, catVacancy.id ) : tools_web.get_mode_clean_url( 'cp_vacancy', catVacancy.id );
		}
		oRes.array.push( obj );
	}

	return oRes
}

function lp_create_response_vacancy( iVacancyID, sUserAgreementLink, sCustomFieldsPageName, sSetNewVariablesValues, sCommand, iPersonID, tePerson, SCOPE_WVARS, curLngWeb )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = ({});

	var Env = CurRequest.Session.GetOptProperty( "Env", ({}) );
	var curSiteID = OptInt( Env.GetOptProperty( "curSiteID" ), null );

	try
	{
		if ( ObjectType( SCOPE_WVARS ) != "JsObject" )
			throw "";
	}
	catch( ex )
	{
		 SCOPE_WVARS = ({});
	}

	try
	{
		iVacancyID = Int( iVacancyID );
	}
	catch( ex )
	{
		oRes.result = { command: "alert", msg: "Некорректный ID вакансии" };
		return oRes;
	}

	docVacancy = tools.open_doc( iVacancyID );
	if ( docVacancy != undefined )
	{
		teVacancy = docVacancy.TopElem;
	}
	else
	{
		teVacancy = null;
	}

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
				oRes.result = { command: "alert", msg: "Некорректный ID сотрудника" };
				return oRes;
			}
		else
			tePerson = null;
	}

	try
	{
		sUserAgreementLink = Trim( String( sUserAgreementLink ) );
		if ( sUserAgreementLink == '' )
			throw ''
	}
	catch( e )
	{
		sUserAgreementLink = '';
	}

	try
	{
		sCustomFieldsPageName = Trim( String( sCustomFieldsPageName ) );
		if ( sCustomFieldsPageName == '' )
			throw ''
	}
	catch( e )
	{
		sCustomFieldsPageName = '';
	}

	try
	{
		arrNewVariablesValues = ParseJson( sSetNewVariablesValues );
	}
	catch( ex )
	{
		arrNewVariablesValues = [];
	}

	function get_form_field( field_name )
	{
		catElem = ArrayOptFind( oFormFields, "This.name == field_name" );
		return catElem == undefined ? "" : catElem.value
	}

	var arrRegions = new Array();
	for ( catRegion in XQuery( "for $elem in regions return $elem/Fields( 'id', 'name' )" ) )
	{
		arrRegions.push( { name: catRegion.name.Value, value: catRegion.id.Value } )
	}

	switch( sCommand )
	{
		case "eval":

			oRes.result = {
									command: "display_form",
									title: "Отклик на вакансию",
									header: "Заполните поля",
									form_fields: [],
									buttons:
									[
										{ name: "cancel", label: "Отмена", type: "cancel" },
										{ name: "submit", label: "Откликнуться", type: "submit" }
									]
			};

			if ( iPersonID == null )
			{

				oRes.result.form_fields.push( { "name": "lastname", "label": "Фамилия", "type": "string", "mandatory" : true, "validation": "nonempty" } );
				oRes.result.form_fields.push( { "name": "firstname", "label": "Имя", "type": "string", "mandatory" : true, "validation": "nonempty" } );
				oRes.result.form_fields.push( { "name": "middlename", "label": "Отчество", "type": "string", "mandatory" : false, "validation": "" } );
				oRes.result.form_fields.push( { "name": "email", "label": "Адрес эл. почты", "type": "string", "mandatory" : true, "validation": "nonempty" } );
				oRes.result.form_fields.push( { "name": "phone", "label": "Телефон", "type": "string", "mandatory" : true, "validation": "nonempty" } );
				oRes.result.form_fields.push( { "name": "city", "label": "Город", "type": "select", "placeholder" : "Город", "entries": arrRegions, "mandatory" : false, "validation": "", "no_placeholder": true } );
				oRes.result.form_fields.push( { "name": "resume_file_id", "label": "Резюме", "type": "file", "mandatory" : false, "validation": "" } );
				oRes.result.form_fields.push( { "name": "portfolio_file_id", "label": "Портфолио", "type": "file", "mandatory" : false, "validation": "" } );

				oCustomElems = tools.get_custom_template( 'vacancy_response', null, null );
				if ( oCustomElems != null )
				{
					if ( ArrayOptFind( oCustomElems.sheets, 'This.title == sCustomFieldsPageName' ) != undefined )
					{
						for ( field in ArraySelectByKey( oCustomElems.fields, true, 'disp_web' ) )
						{
							obj = {
									name: "custom_field_" + field.name.Value,
									label: field.title.Value,
									type: field.type.Value,
									value: "",
									catalog_name: field.catalog.Value,
									mandatory: field.is_required.Value,
									validation: ( field.is_required.Value ? "nonempty" : "" ),
									entries: []
								};

							for ( entry in field.entries )
								obj.entries.push( { name: entry.value.Value, value: entry.value.Value } );

							oRes.result.form_fields.push( obj );
						}
					}
				}

				oRes.result.form_fields.push( { "name": "is_confirm", "label": "Даю согласие на обработку персональных данных и принимаю условия " + ( sUserAgreementLink != '' ? "<a href='" + sUserAgreementLink + "' target='_blank'>пользовательского соглашения<\/a>" : "пользовательского соглашения" ), "type": "bool", "mandatory" : false, "validation": "" } );

				break;
			}
			else
			{
				oRes.result.form_fields.push( { "name": "comment", "label": "Сопроводительный текст", "type": "text", "mandatory" : false, "validation": "" } );
				break;
			}

		case "submit_form":
			arr_need_fields = [ "lastname", "firstname", "email", "phone" ];
			oFormFields = parse_form_fields( SCOPE_WVARS.GetOptProperty( "form_fields" ) );

			catCandidate = undefined;

			if ( iPersonID == null )
			{
				for ( field in arr_need_fields )
				{
					if ( get_form_field( field ) == "" )
					{
						oRes.result = { command: "alert", msg: "Необходимо заполнить все обязательные поля" };
						return oRes;
					}
				}

				if ( ! tools_web.is_true( get_form_field( "is_confirm", "" ) ) )
				{
					oRes.result = { command: "alert", msg: "Необходимо подтвердить разрешение на обработку персональных данных" };
					break;
				}

				arr_fullname = new Array();
				if( get_form_field( "lastname", "" ) != "" )
					arr_fullname.push( get_form_field( "lastname", "" ) );
				if( get_form_field( "firstname", "" ) != "" )
					arr_fullname.push( get_form_field( "firstname", "" ) );
				if( get_form_field( "middlename", "" ) != "" )
					arr_fullname.push( get_form_field( "middlename", "" ) );

				var conds = new Array();

				conds.push( "$elem/is_candidate = true()" );
				conds.push( "$elem/fullname = " + XQueryLiteral( String( ArrayMerge( arr_fullname, "This", " " ) ) ) );

				if ( get_form_field( "email", "" ) != "" )
					conds.push( "$elem/email = " + XQueryLiteral( String( get_form_field( "email", "" ) ) ) );

				catCandidate = ArrayOptFirstElem( XQuery( "for $elem in collaborators where " + ArrayMerge( conds, "This", " and " ) + " return $elem" ) );

				if ( catCandidate == undefined )
				{

					docNewCollab = OpenNewDoc("x-local://wtv/wtv_collaborator.xmd");
					docNewCollab.BindToDb(DefaultDb);

					docNewCollab.TopElem.lastname = get_form_field( "lastname", "" );
					docNewCollab.TopElem.firstname = get_form_field( "firstname", "" );
					docNewCollab.TopElem.middlename = get_form_field( "middlename", "" );
					docNewCollab.TopElem.phone = get_form_field( "phone", "" );
					docNewCollab.TopElem.email = get_form_field( "email", "" );

					docNewCollab.TopElem.is_candidate = true;
					docNewCollab.TopElem.allow_personal_chat_request = false;
					tePerson = docNewCollab.TopElem;
					docNewCollab.Save();

					iPersonID = docNewCollab.DocID;
				}
				else
				{
					iPersonID = catCandidate.id;
					tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
				}
			}

			if ( teVacancy == null )
				catVacancyResponse = undefined;
			else
				catVacancyResponse = ArrayOptFirstElem( XQuery( "for $elem in vacancy_responses where $elem/vacancy_id = " + iVacancyID + " and $elem/person_id = " + iPersonID + " return $elem/Fields( 'id' )" ) );

			if ( catVacancyResponse != undefined )
			{
				oRes.result = { command: "alert", msg: "Вы уже откликнулись на данную вакансию", confirm_result : { command: "close_form" } };

				return oRes;
			}

			catPersonalDataProcessingConsent = ArrayOptFirstElem( XQuery( "for $elem in personal_data_processing_consents where $elem/person_id = " + iPersonID + " return $elem/Fields( 'id' )" ) );
			if ( catPersonalDataProcessingConsent == undefined )
			{
				try
				{
					docPDPC = OpenNewDoc("x-local://wtv/wtv_personal_data_processing_consent.xmd");
					docPDPC.BindToDb( DefaultDb );
					docPDPC.TopElem.person_id = iPersonID;
					docPDPC.TopElem.person_type = ( catCandidate != undefined ? 'candidate' : 'collaborator' );
					docPDPC.TopElem.consent_date = Date();
					docPDPC.TopElem.site_id = curSiteID;
					docPDPC.Save();
				}
				catch( ex )
				{
					alert( ex );
				}
			}

			try
			{
				catEstaffEventType = ArrayOptFirstElem( XQuery( "for $elem in estaff_event_types where $elem/code = 'vacancy_response' return $elem/Fields( 'id' )" ) );

				docRecruitmentEvent = OpenNewDoc( "x-local://wtv/wtv_recruitment_event.xmd" );
				docRecruitmentEvent.BindToDb( DefaultDb );
				docRecruitmentEvent.TopElem.start_date = Date();
				docRecruitmentEvent.TopElem.person_id = iPersonID;
				docRecruitmentEvent.TopElem.vacancy_id = iVacancyID;
				docRecruitmentEvent.TopElem.site_id = curSiteID;
				docRecruitmentEvent.TopElem.estaff_event_type_id = catEstaffEventType != undefined ? catEstaffEventType.id : null;

				catRecruitmentSystem = ArrayOptFirstElem( XQuery( "for $elem in recruitment_systems where $elem/code = 'websoft_hcm' return $elem/Fields( 'id' )" ) );
				if ( catRecruitmentSystem != undefined )
					docRecruitmentEvent.TopElem.recruitment_system_id = catRecruitmentSystem.id;

				docRecruitmentEvent.Save();
			}
			catch( ex )
			{
				alert( ex );
			}

			docResume = OpenNewDoc( 'x-local://wtv/wtv_resume.xmd' );
			docResume.TopElem.AssignElem( tePerson );
			docResume.TopElem.id.Clear();
			docResume.BindToDb( DefaultDb );
			docResume.TopElem.filling_type = "file";
			docResume.TopElem.name = teVacancy.name;

			docResume.TopElem.person_id = iPersonID;
			tools.common_filling ('collaborator', docResume.TopElem.person_id, iPersonID, tePerson );
			docResume.TopElem.creator_person_id = iPersonID;
			tools.common_filling ('collaborator', docResume.TopElem.creator_person_id, iPersonID, tePerson );

			docResponse = OpenNewDoc( 'x-local://wtv/wtv_vacancy_response.xmd' );
			docResponse.BindToDb( DefaultDb );

			try
			{
				if ( teVacancy == null )
					throw '';

				docResponse.TopElem.vacancy_id = iVacancyID;
				docResponse.TopElem.vacancy_name = teVacancy.name;
				docResponse.TopElem.resume_id = docResume.DocID;

				docResponse.TopElem.person_id = iPersonID;
				docResponse.TopElem.response_author_person_id = iPersonID;
				tools.common_filling ('collaborator', docResponse.TopElem, iPersonID, tePerson );

				docResponse.TopElem.desc = ( get_form_field( "comment", "" ) );
				docResponse.TopElem.date = Date();

				for ( _field in oFormFields )
				{
					if ( StrBegins( _field.name, "custom_field_" ) )
					{
						if ( IsArray( _field.value ) )
						{
							docResponse.TopElem.custom_elems.ObtainChildByKey( StrReplace( _field.name, "custom_field_", "" ), ArrayMerge( _field.value, "This", ";" ) )
						}
						else
						{
							docResponse.TopElem.custom_elems.ObtainChildByKey( StrReplace( _field.name, "custom_field_", "" ), _field.value );
						}
					}
				}

				catResumeFile = ArrayOptFind( oFormFields, "This.name == 'resume_file_id'" );
				if ( catResumeFile != undefined && catResumeFile.HasProperty( "url" ) && catResumeFile.url != "" )
				{
					docResource = OpenNewDoc( 'x-local://wtv/wtv_resource.xmd' );

					if ( iPersonID != null )
					{
						docResource.TopElem.person_id = iPersonID;
						tools.common_filling( 'collaborator', docResource.TopElem, iPersonID, tePerson );
					}

					docResource.BindToDb();
					docResource.TopElem.put_data( catResumeFile.url );
					docResource.Save();
					docResponse.TopElem.files.ObtainChildByKey( docResource.DocID );
					docResume.TopElem.files.ObtainChildByKey( docResource.DocID );
				}

				catPortfolioFile = ArrayOptFind( oFormFields, "This.name == 'portfolio_file_id'" );
				if ( catPortfolioFile != undefined && catPortfolioFile.HasProperty( "url" ) && catPortfolioFile.url != "" )
				{
					docResource = OpenNewDoc( 'x-local://wtv/wtv_resource.xmd' );

					if ( iPersonID != null )
					{
						docResource.TopElem.person_id = iPersonID;
						tools.common_filling( 'collaborator', docResource.TopElem, iPersonID, tePerson );
					}

					docResource.BindToDb();
					docResource.TopElem.put_data( catPortfolioFile.url );
					docResource.Save();
					docResponse.TopElem.files.ObtainChildByKey( docResource.DocID );
					docResume.TopElem.files.ObtainChildByKey( docResource.DocID );
				}

				docResponse.Save();
				docResume.Save();

				tools.create_notification( "estaff_api_002", docResponse.DocID, "", iVacancyID, docResponse.TopElem, teVacancy );

				tools.create_notification( "candidate_vacancy_response", docResponse.DocID, "", iVacancyID, docResponse.TopElem, teVacancy );

				oRes.result = {
					command: "close_form", msg: tools_web.get_web_const( 'otklikuspeshnos', curLngWeb ),
					confirm_result:
					{
						command: "set_variable",
						vars: arrNewVariablesValues
					}
				};
			}
			catch( err )
			{
				alert( err );
				oRes.result = { command: "alert", msg: tools_web.get_web_const( 'vozniklaoshibka_1', curLngWeb ) };
			}
			break;
		default:
			oRes.result = { command: "alert", msg: "Неизвестная команда" };
			break;
	}
	return oRes;
}

/**
 * @typedef {Object} oVacancyRecommendation
 * @property {bigint} id
 * @property {string} name
 * @property {string} parent_id
*/
/**
 * @typedef {Object} WTVacancyRecommendationResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {oVacancyRecommendation[]} array – массив
*/
/**
 * @function CreateRecommendation
 * @memberof Websoft.WT.Staff
 * @description Создание рекомендации на вакансию.
 * @param {bigint} [iVacancyID] - ID вакансии.
 * @returns {WTVacancyRecommendationResult}
*/

function CreateRecommendation( iVacancyID, sCommand, iPersonID, tePerson, SCOPE_WVARS, curLngWeb )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = ({});

	try
	{
		if ( ObjectType( SCOPE_WVARS ) != "JsObject" )
			throw "";
	}
	catch( ex )
	{
		 SCOPE_WVARS = ({});
	}
	try
	{
		iVacancyID = Int( iVacancyID );
	}
	catch( ex )
	{
		oRes.result = { command: "alert", msg: "Некорректный ID вакансии" };
		return oRes;
	}
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
		if ( iPersonID != null )
			tePerson.Name;
	}
	catch( ex )
	{
		if ( iPersonID != null )
			try
			{
				tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
			}
			catch( ex )
			{
				oRes.result = { command: "alert", msg: "Некорректный ID сотрудника" };
				return oRes;
			}
		else
			tePerson = null;
	}

	function get_form_field( field_name )
	{
		catElem = ArrayOptFind( oFormFields, "This.name == field_name" );
		return catElem == undefined ? "" : catElem.value
	}

	switch( sCommand )
	{
		case "eval":
			oRes.result = { 	command: "display_form",
									title: "Рекомендация на вакансию",
									header: "Заполните поля",
									form_fields: []
								};

			oRes.result.form_fields.push( { "name": "lastname", "label": "Фамилия", "type": "string", "mandatory" : true, "validation": "nonempty" } );
			oRes.result.form_fields.push( { "name": "firstname", "label": "Имя", "type": "string", "mandatory" : true, "validation": "nonempty" } );
			oRes.result.form_fields.push( { "name": "middlename", "label": "Отчество", "type": "string", "mandatory" : false, "validation": "" } );
			oRes.result.form_fields.push( { "name": "mobile_phone", "label": "Мобильный телефон", "type": "string", "mandatory" : true, "validation": "nonempty" } );
			oRes.result.form_fields.push( { "name": "phone", "label": "Домашний телефон", "type": "string", "mandatory" : false, "validation": "" } );
			oRes.result.form_fields.push( { "name": "work_phone", "label": "Рабочий телефон", "type": "string", "mandatory" : false, "validation": "nonmpty" } );
			oRes.result.form_fields.push( { "name": "email", "label": "Email", "type": "string", "mandatory" : true, "validation": "nonempty" } );
			oRes.result.form_fields.push( { "name": "letter_text", "label": "Сопроводительное письмо", "type": "text", "mandatory" : true, "validation": "nonempty" } );
			oRes.result.form_fields.push( { "name": "resume", "label": "Резюме", "type": "text", "mandatory" : true, "validation": "nonempty" } );
			oRes.result.form_fields.push( { "name": "file_id", "label": "Файл", "type": "file", "mandatory" : false, "validation": "" } );
			break;

		case "submit_form":
			oFormFields = parse_form_fields( SCOPE_WVARS.GetOptProperty( "form_fields" ) );
			arr_need_fields = [ "lastname", "firstname", "email", "mobile_phone", "letter_text", "resume" ];

			for ( field in arr_need_fields )
			{
				if ( get_form_field( field ) == "" )
				{
					oRes.result = { command: "alert", msg: "Необходимо заполнить все обязательные поля" };
					return oRes;
				}
			}

			try
			{
				docRecommendation = OpenNewDoc( "x-local://wtv/wtv_recommendation.xmd" );
				docRecommendation.BindToDb( DefaultDb );

				iVacancyID = Int( iVacancyID );
				teVacancy = OpenDoc( UrlFromDocID( iVacancyID ) ).TopElem;

				docRecommendation.TopElem.vacancy_id = iVacancyID;
				docRecommendation.TopElem.vacancy_name = teVacancy.name;
				docRecommendation.TopElem.lastname = ( get_form_field( "lastname", "" ) );
				docRecommendation.TopElem.firstname = ( get_form_field( "firstname", "" ) );
				docRecommendation.TopElem.middlename = ( get_form_field( "middlename", "" ) );
				docRecommendation.TopElem.mobile_phone = ( get_form_field( "mobile_phone", "" ) );
				docRecommendation.TopElem.phone = ( get_form_field( "phone", "" ) );
				docRecommendation.TopElem.work_phone = ( get_form_field( "work_phone", "" ) );
				docRecommendation.TopElem.email = ( get_form_field( "email", "" ) );
				docRecommendation.TopElem.letter_text = ( get_form_field( "letter_text", "" ) );
				docRecommendation.TopElem.desc = ( get_form_field( "resume", "" ) );
				docRecommendation.TopElem.src_person_id = iPersonID;
				docRecommendation.TopElem.src_person_fullname = tePerson.fullname;

				catFile = ArrayOptFind( oFormFields, "This.name == 'file_id'" );
				if ( catFile != undefined && catFile.HasProperty( "url" ) && catFile.url != "" )
				{
					docResource = OpenNewDoc( 'x-local://wtv/wtv_resource.xmd' );

					if ( iPersonID != null )
					{
						docResource.TopElem.person_id = iPersonID;
						tools.common_filling( 'collaborator', docResource.TopElem, iPersonID, tePerson );
					}
					docResource.BindToDb();
					docResource.TopElem.put_data( catFile.url );
					docResource.Save();
					docRecommendation.TopElem.files.ObtainChildByKey( docResource.DocID );
				}

				docRecommendation.Save();

				oRes.result = { command: "close_form", msg: "Рекомендация успешно создана" };

			}
			catch( e )
			{
				alert( err );
				oRes.result = { command: "alert", msg: tools_web.get_web_const( 'vozniklaoshibka', curLngWeb ) };
			}
			break;
		default:
			oRes.result = { command: "alert", msg: "Неизвестная команда" };
			break;
	}
	return oRes;
}


/**
 * @typedef {Object} Position
 * @property {string} id – ID.
 * @property {string} name – Название.
 * @property {bigint} org_id – ID организации.
 * @property {string} org_name – Название организации.
 * @property {bigint} subdivision_id – ID подразделения.
 * @property {string} subdivision_name – Название подразделения.
 * @property {bigint} position_common_id – ID типовой должности.
 * @property {string} position_common_name – Название типовой должности.
 * @property {bool} is_boss – Является руководителем.
*/
/**
 * @typedef {Object} ReturnVacantPositions
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {Position[]} positions – Массив должностей.
*/
/**
 * @function GetVacantPositions
 * @memberof Websoft.WT.Staff
 * @description Получение списка вакантных должностей.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {bool} bOnlyOwnSubdivision - Только собственное подразделение.
 * @param {bool} bHierarchy - Учитывать иерархию.
 * @param {boolean} bNotShowClosed - Если установлен, в результаты не попадают закрытые вакансии
 * @returns {ReturnVacantPositions}
*/
function GetVacantPositions( iPersonID, bOnlyOwnSubdivision, bHierarchy, bNotShowClosed )
{
	var oRes = tools.get_code_library_result_object();
	oRes.positions = [];

	try
	{
		iPersonID = Int( iPersonID );
	}
	catch ( err )
	{
		oRes.error = 503; // Param object not found
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}
	try
	{
		var tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
	}
	catch ( err )
	{
		oRes.error = 503; // Param object not found
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}

	try
	{
		bNotShowClosed = tools_web.is_true( bNotShowClosed );
	}
	catch( ex )
	{
		bNotShowClosed = false;
	}

	var arrSubIDs = [];
	var arrAllSubIDs = [];
	var arrAllOrgIDs = [];

	var oCurrentManagementObject = tools.call_code_library_method( 'libMain', 'get_current_management_object', [ iPersonID ] );
	var sCatalogName = "";
	try
	{
		sCatalogName = oCurrentManagementObject.catalog_name;
	}
	catch( err )
	{
		sCatalogName = "";
	}

	switch( sCatalogName )
	{
		case "subdivision":
		{
			arrAllSubIDs.push( oCurrentManagementObject.object_id );
			break;
		}
		case "org":
		{
			arrAllOrgIDs.push( oCurrentManagementObject.object_id );
			break;
		}
		default:
		{
			if ( ! bOnlyOwnSubdivision )
			{
				arrSubIDs = ArrayUnion(
					ArrayExtract( XQuery( "for $elem in func_managers where $elem/person_id = " + iPersonID + " and $elem/catalog = 'subdivision' return $elem/Fields('object_id')" ), "object_id" ),
					ArrayExtract( XQuery( "for $elem in func_managers where $elem/person_id = " + iPersonID + " and $elem/catalog = 'position' and $elem/parent_id != null() return $elem/Fields('parent_id')" ), "parent_id" )
				);
			}

			if ( tePerson.position_parent_id.HasValue )
			{
				arrSubIDs.push( tePerson.position_parent_id.Value );
			}

			arrAllSubIDs = arrSubIDs;
			if ( bHierarchy )
			{
				for ( iSubIDElem in arrSubIDs )
				{
					arrAllSubIDs = ArrayUnion( arrAllSubIDs, ArrayExtract( tools.xquery( "for $elem in subdivisions where IsHierChild( $elem/id, " + iSubIDElem + " ) order by $elem/Hier() return $elem/Fields('id')" ), "id" ) );
				}
			}
			break;
		}

	}

	var conds = new Array();
	if( ArrayOptFirstElem( arrAllSubIDs ) != undefined )
	{
		conds.push( "MatchSome( $elem/parent_object_id, (" + ArrayMerge( arrAllSubIDs, "This", "," ) + ") )" );
	}
	if( ArrayOptFirstElem( arrAllOrgIDs ) != undefined )
	{
		conds.push( "MatchSome( $elem/org_id, (" + ArrayMerge( arrAllOrgIDs, "This", "," ) + ") )" );
	}
	if( ArrayOptFirstElem( conds ) == undefined )
	{
		return oRes;
	}
	conds.push( "$elem/basic_collaborator_id = null()" );

	if ( bNotShowClosed )
	{
		conds.push( "$elem/is_closed = false()" );
	}

	var xarrPositions = XQuery( "for $elem in positions where  " + ArrayMerge( conds, "This", " and " ) + "  return $elem/Fields('id','name','org_id','parent_object_id','position_common_id','is_boss')" );

	for ( catPositionElem in xarrPositions )
	{
		oRes.positions.push( {
			"id": catPositionElem.id.Value,
			"name": catPositionElem.name.Value,
			"org_id": catPositionElem.org_id.Value,
			"org_name": ( catObject = catPositionElem.org_id.OptForeignElem, ( catObject == undefined ? "" : catObject.disp_name.Value ) ),
			"subdivision_id": catPositionElem.parent_object_id.Value,
			"subdivision_name": ( catObject = catPositionElem.parent_object_id.OptForeignElem, ( catObject == undefined ? "" : catObject.name.Value ) ),
			"position_common_id": catPositionElem.position_common_id.Value,
			"position_common_name": ( catObject = catPositionElem.position_common_id.OptForeignElem, ( catObject == undefined ? "" : catObject.name.Value ) ),
			"is_boss": catPositionElem.is_boss.Value
		} );
	}

	return oRes;
}


/**
 * @typedef {Object} ComparePerson
 * @property {bigint} id – ID.
 * @property {string} fullname – ФИО.
 * @property {bigint} org_id – ID организации.
 * @property {string} org_name – Название организации.
 * @property {bigint} subdivision_id – ID подразделения.
 * @property {string} subdivision_name – Название подразделения.
 * @property {bigint} position_id – ID должности.
 * @property {string} position_name – Название должности.
 * @property {string} statistic_recs – Объект с результатами показателей.
*/
/**
 * @typedef {Object} ReturnComparePersons
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {ComparePerson[]} persons – Массив сотрудников.
*/
/**
 * @function ComparePersons
 * @memberof Websoft.WT.Staff
 * @description Сравнение сотрудников по показателям.
 * @param {string} sTargets - Только собственное подразделение.
 * @param {string} sStatisticRecs - Учитывать иерархию.
 * @returns {ReturnComparePersons}
*/
function ComparePersons( sTargets, sStatisticRecs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.persons = [];

	var arrPersonIDs = [];
	if ( StrContains( sTargets, ";" ) )
	{
		arrPersonIDs = String( sTargets ).split( ";" );
	}
	else
	{
		try
		{
			var teObject = OpenDoc( UrlFromDocID( Int( sTargets ) ) ).TopElem;
		}
		catch ( err )
		{
			oRes.error = 503; // Param object not found
			oRes.errorText = "{ text: 'Object not found.', param_name: 'sTargets' }";
			return oRes;
		}

		switch ( teObject.Name )
		{
			case "collaborator":
			{
				arrPersonIDs.push( sTargets );
				break;
			}
			case "group":
			{
				arrPersonIDs = ArrayExtract( teObject.collaborators, "collaborator_id" );
				break;
			}
			case "subdivision":
			{
				arrPersonIDs = ArrayExtract( XQuery( "for $elem in positions where $elem/parent_object_id = " + sTargets + " and $elem/basic_collaborator_id != null() return/Fields('basic_collaborator_id')" ), "basic_collaborator_id" );
				break;
			}
		}
	}

	var arrStatisticRecIDs = String( sStatisticRecs ).split( ";" );
	var arrStatisticRecTEs = [];
	for ( sStatisticRecIDElem in arrStatisticRecIDs )
	{
		try
		{
			var teStatisticRec = OpenDoc( UrlFromDocID( Int( sStatisticRecIDElem ) ) ).TopElem;
		}
		catch ( err )
		{
			continue;
		}
		arrStatisticRecTEs.push( teStatisticRec );
	}

	for ( sPersonIDElem in arrPersonIDs )
	{
		try
		{
			iPersonID = Int( sPersonIDElem );
			tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
		}
		catch ( err )
		{
			continue;
		}

		oStatisticRecs = [];
		for ( teStatisticRecElem in arrStatisticRecTEs )
		{
			arrStatisticRec = teStatisticRecElem.calculate( iPersonID, null, null, null, ({ 'return_data': true, 'virtual': true, 'backcheck': false, 'curUser': tePerson }) );
			if ( arrStatisticRec == null )
			{
				continue;
			}
			oStatisticData = ArrayOptFirstElem( arrStatisticRec );
			if ( oStatisticData == undefined )
			{
				continue;
			}

			oStatisticRecs.push( {
				id: teStatisticRecElem.id.Value,
				name: teStatisticRecElem.code.Value,
				type: teStatisticRecElem.informer.output_type.Value,
				title: teStatisticRecElem.name.Value,
				desc: teStatisticRecElem.comment.Value,
				value: oStatisticData.value.Value,
				value_str: oStatisticData.value_str.Value
			} );
		}

		oRes.persons.push( {
			"id": tePerson.id.Value,
			"fullname": RValue( tePerson.fullname ),
			"org_id": tePerson.org_id.Value,
			"org_name": tePerson.org_name.Value,
			"subdivision_id": tePerson.position_parent_id.Value,
			"subdivision_name": tePerson.position_parent_name.Value,
			"position_id": tePerson.position_id.Value,
			"position_name": tePerson.position_name.Value,
			"statistic_recs": EncodeJson( oStatisticRecs )
		} );
	}

	return oRes;
}

/**
 * @typedef {Object} PersonHistoryChanges
 * @property {bigint} id – ID изменения.
 * @property {string} date – Дата изменения.
 * @property {string} date_end – Дата завершения.
 * @property {bigint} position_id – ID должности.
 * @property {string} position_name – Название должности.
 * @property {bigint} position_parent_id – ID подразделения.
 * @property {string} position_parent_name – Название подразделения.
 * @property {bigint} org_id – ID организации.
 * @property {string} org_name – Название организации.
 * @property {string} comment – Комментарий к изменению.
*/
/**
 * @typedef {Object} ReturnPersonHistoryChanges
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {PersonHistoryChanges[]} changes – Массив изменений в карьерной истории сотрудника.
*/
/**
 * @function GetPersonHistoryChanges
 * @memberof Websoft.WT.Staff
 * @description Получение списка изменений из истории изменений карточки сотрудника.
 * @param {string} iPersonID - ID сотрудника.
 * @param {string} dStartPeriod - Дата начала периода дат, по которому будут отсеиваться изменения.
 * @param {string} dEndPeriod - Дата окончания периода дат, по которому будут отсеиваться изменения.
 * @param {string} sSortDirection - Направление сортировки ('-' по убыванию, '+' по возрастанию).
 * @returns {ReturnPersonHistoryChanges}
*/
function GetPersonHistoryChanges( iPersonID, dStartPeriod, dEndPeriod, sSortDirection )
{
	var oRes = tools.get_code_library_result_object();
	oRes.changes = [];
	try
	{
		if ( sSortDirection == undefined || sSortDirection == null )
			throw "";
	}
	catch(e) { sSortDirection = "-" }

	dPerson = tools.open_doc( iPersonID )
	if ( dPerson == undefined )
	{
		oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}
	else
	{
		try { dStartPeriod = StrDate( Date( dStartPeriod ) ) + " 00:00:00"; }
		catch(e) { dStartPeriod = null; }

		try { dEndPeriod = StrDate( Date( dEndPeriod ) ) + " 23:59:59"; }
		catch(e) { dEndPeriod = null; }

		tePerson = dPerson.TopElem;
		aPersonChanges = ArraySort( tePerson.change_logs, "This.date", "-" );
		if ( dStartPeriod != null && dEndPeriod != null )
		{
			aPersonChanges = ArraySelect( aPersonChanges, "This.date >= Date( '" + dStartPeriod + "' ) && This.date <= Date( '" + dEndPeriod + "' )" );
		}
		else if ( dStartPeriod != null )
		{
			aPersonChanges = ArraySelect( aPersonChanges, "This.date >= Date( '" + dStartPeriod + "' )" );
		}
		else if ( dEndPeriod != null )
		{
			aPersonChanges = ArraySelect( aPersonChanges, "This.date <= Date( '" + dEndPeriod + "' )" );
		}

		dPersonPositionDate = null;
		iPersonPosition = ( tePerson.position_id.HasValue && ( fePersonPosition = tePerson.position_id.OptForeignElem ) != undefined ) ? tePerson.position_id.Value : undefined;
		if ( iPersonPosition != undefined && fePersonPosition.position_date.HasValue )
		{
			dPersonPositionDate = fePersonPosition.position_date.Value;
		}
		else if ( tePerson.position_date.HasValue )
		{
			dPersonPositionDate = tePerson.position_date.Value;
		}
		var oChange, iChangePos, dChangePos;
		//var  dChangePosPrev = DateNewTime(Date(), 23, 59, 59);
		var  dChangePosPrev = null;
		var arrLog = [];
		for ( _change in aPersonChanges )
		{
			oChange = {};
			oChange.id = tools_web.get_md5_id('' +  _change.date.Value + _change.id.Value);
			if ( _change.date.HasValue )
			{
				iChangePos = ( _change.position_id.HasValue && _change.position_id.OptForeignElem != undefined ) ? _change.position_id.Value : undefined;
				if ( iChangePos != iPersonPosition || ( iChangePos == iPersonPosition && ( dPersonPositionDate == "" || dPersonPositionDate == null ) ) )
				{
					dChangePos = _change.date.Value;
				}
				else if ( dPersonPositionDate != "" && dPersonPositionDate != null )
				{
					dChangePos = dPersonPositionDate;
				}
				else
				{
					alert( "[GetPersonHistoryChanges]: Отсутствует дата вступления в должность в карточке должности." );
					continue;
				}
				oChange.date =  DateNewTime(dChangePos);
				oChange.date_begin =  StrDate(oChange.date, false);
			}
			else
			{
				alert( "[GetPersonHistoryChanges]: Отсутствует дата изменения в истории изменений карточки сотрудника." );
				continue;
			}

			oChange.date_end = dChangePosPrev == null ? "по настоящее время" : StrDate(dChangePosPrev, false);
			oChange.position_id = ( OptInt( iChangePos ) != undefined ) ? iChangePos : "";
			oChange.position_name = ( _change.position_name.HasValue ) ?_change.position_name.Value : "";
			oChange.position_parent_id = ( _change.position_parent_id.HasValue ) ?_change.position_parent_id.Value : "";
			oChange.position_parent_name = ( _change.position_parent_name.HasValue ) ?_change.position_parent_name.Value : "";
			oChange.org_id =  ( _change.org_id.HasValue ) ?_change.org_id.Value : "";
			oChange.org_name = ( _change.org_name.HasValue ) ?_change.org_name.Value : "";
			oChange.comment = ( _change.comment.HasValue ) ?_change.comment.Value : "";

			dChangePosPrev = DateNewTime(DateOffset(Date( dChangePos ), -86400 ), 23, 59, 59)

			arrLog.push(oChange);
		}
	}
	oRes.changes = ArraySort( arrLog, "This.date", sSortDirection )
	return oRes;
}

/**
 * @typedef {Object} oPersonBlogs
 * @property {bigint} id
 * @property {string} blog_name
 * @property {string} blog_url
 * @property {string} blog_autor_fullname
 * @property {string} blog_autor_url
 * @property {string} blog_autor_img
 * @property {string} blog_entries
*/
/**
 * @typedef {Object} WTPersonBlogs
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPersonBlogs[]} blogs – Массив блогов.
*/
/**
 * @function GetPersonBlogs
 * @memberof Websoft.WT.Staff
 * @description Получение списока блогов сотрудника.
 * @param {bigint} iPersonID - ID сотрудника.
 * @param {boolean} bShowAmntEntries - Показывать количество сообщений блога.
 * @returns {WTPersonBlogs}
*/

function GetPersonBlogs( iPersonID, bShowAmntEntries, iCurUserID, bCheckAccess )
{
    var oRes = tools.get_code_library_result_object();
    oRes.blogs = [];

    if ( ( iPersonID = OptInt( iPersonID ) ) == undefined )
    {
        oRes.error = 503;
		oRes.errorText = "{ text: 'Object not found.', param_name: 'iPersonID' }";
		return oRes;
	}

	try
    {
        if ( bShowAmntEntries == null || bShowAmntEntries == undefined )
            throw '';
        else
            bShowAmntEntries = tools_web.is_true( bShowAmntEntries );
    }
    catch(e) { bShowAmntEntries = false }

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
		oRes.errorText = "Ошибка открытия документа текущего пользователя, ID: " + iCurUserID;
		return oRes;
	}
	teCurUser = docCurUser.TopElem;

	xarrPersonBlogs = XQuery( "for $elem in blogs where some $autor in blog_authors satisfies ( $autor/person_id = "+ iPersonID +" and $autor/blog_id = $elem/id ) return $elem" );
	if ( ArrayOptFirstElem( xarrPersonBlogs ) == undefined )
	{
		aTemp = tools.xquery( "for $elem in blogs return $elem" );
		xarrPersonBlogs = [];

		var sShortForm = '<?xml version="1.0" encoding="utf-8"?>\r\n';
		sShortForm += '		<SPXML-FORM>\r\n';
		sShortForm += '			<blog>\r\n';
		sShortForm += '				<authors>\r\n';
		sShortForm += '					<author MULTIPLE="1" PRIMARY-KEY="person_id">\r\n';
		sShortForm += '						<person_id TYPE="integer" FOREIGN-ARRAY="collaborators"/>\r\n';
		sShortForm += '					</author>\r\n';
		sShortForm += '				</authors>\r\n';
		sShortForm += '			</blog>\r\n';
		sShortForm += '		</SPXML-FORM>';
		var sNameForm = "x:\\" + Md5Hex( sShortForm );
		try
		{
			RegisterFormFromStr( sNameForm, sShortForm );
		}
		catch(e)
		{
			alert( "[GetPersonBlogs]: Ошибка при регистрации сокращенной формы " + e );
		}

		for ( blog in aTemp )
		{
			teBlog = OpenDoc( UrlFromDocID( blog.id ), "form=" + sNameForm ).TopElem;
			if ( ArrayOptFindByKey( teBlog.authors, iPersonID, "PrimaryKey" ) != undefined ) { xarrPersonBlogs.push( blog ) }
		}

		DropFormsCache( sNameForm );
	}

    for ( blog in xarrPersonBlogs )
    {
		if ( bCheckAccess && ! tools_web.check_access( blog.id, iCurUserID, teCurUser ) )
		{
			continue;
		}
		sCreatorFullname = "";
		sCreatorUrl = "";
		sCreatorImg = "";
		iCreatorID = OptInt( blog.creator_id );
		if ( iCreatorID != undefined && ( feCreator = blog.creator_id.OptForeignElem ) != undefined )
		{
			sCreatorFullname = ( feCreator.fullname.HasValue ) ? feCreator.fullname.Value : "";
			sCreatorUrl = tools_web.get_mode_clean_url( null, iCreatorID );
			sCreatorImg = ( feCreator.pict_url.HasValue ) ? feCreator.pict_url.Value : "";
		}

        obj = {};
        obj.id = blog.id.Value;
        obj.blog_name = blog.name.Value;
        obj.blog_url = tools_web.get_mode_clean_url( null, obj.id );
        obj.blog_autor_fullname = sCreatorFullname;
        obj.blog_autor_url = sCreatorUrl;
		obj.blog_autor_img = sCreatorImg;

		if ( bShowAmntEntries )
		{
			obj.blog_entries = ArrayCount( XQuery( "for $elem in blog_entrys where $elem/blog_id = "+ obj.id +" return $elem/Fields('id')" ) );
		}

        oRes.blogs.push( obj );
    }

    return oRes;
}



function get_position_common(iObjectID, iPersonID)
{
	iObjectID = OptInt(iObjectID);
	if(iObjectID == undefined)
	{
		if(OptInt(iPersonID) == undefined)
			throw StrReplace("Значение ID текущего сотрудника не является корректым ID: [{PARAM1}]", "{PARAM1}", iPersonID);

		var sReq = "for $elem in positions where some $coll in collaborators satisfies ( $elem/id = $coll/position_id and $coll/id = " + iPersonID + " ) return $elem/Fields('position_common_id')";

		iObjectID = ArrayOptFirstElem(tools.xquery(sReq), {position_common_id: null}).position_common_id;

		if(iObjectID == null)
			throw StrReplace("Невозможно получить типовую должность по ID сотрудника: [{PARAM1}]", "{PARAM1}", iPersonID);
	}

	var docPositionCommon = tools.open_doc(iObjectID);

	if(docPositionCommon == undefined)
		throw StrReplace("Невозможно получить документ типовой должности по текущему ID: [{PARAM1}]", "{PARAM1}", iObjectID);

	if(docPositionCommon.TopElem.Name != "position_common")
		throw StrReplace("Текущий ID: [{PARAM1}] не является ID типовой должности", "{PARAM1}", iObjectID);

	return docPositionCommon.TopElem
}

/**
 * @typedef {Object} oSimpleObjectInPositionCommon
 * @property {bigint} ID
 * @property {string} name – Наименование.
 * @property {string} link – Ссылка на карточку.
*/
/**
 * @typedef {Object} ReturnSimpleObjectInPositionCommon
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oSimpleObjectInPositionCommon[]} result – Коллекция объектов.
*/
/**
 * @function GetPositionCommonEducationMethods
 * @memberof Websoft.WT.Staff
 * @description Учебные программы в типовой должности.
 * @property {bigint} iObjectID – ID типовой должности
 * @property {bigint} iPersonID – ID текущего сотрудника
 * @returns {ReturnSimpleObjectInPositionCommon}
*/
function GetPositionCommonEducationMethods(iObjectID, iPersonID)
{
    var oRes = tools.get_code_library_result_object();
	oRes.result = []

	try
	{
		var tePositionCommon = get_position_common(iObjectID, iPersonID)
	}
	catch(err)
	{
		oRes.error = 1
		oRes.errorText = err
		return oRes;
	}

	var sReq = "for $elem in education_methods where MatchSome($elem/id, (" + ArrayMerge(tePositionCommon.education_methods, "This.education_method_id.Value", ",") + ")) return $elem/Fields('id','name')";

	var itemRec;
	for(itemEducationMethod in tools.xquery(sReq))
	{
		itemRec = {};
		itemRec.id = itemEducationMethod.id.Value;
		itemRec.name = itemEducationMethod.name.Value;
		itemRec.link = tools_web.get_mode_clean_url(null, itemEducationMethod.id.Value);

		oRes.result.push(itemRec);
	}

	return oRes;
}

/**
 * @typedef {Object} oRequirementsInPositionCommon
 * @property {string} ID
 * @property {string} name – Требование.
 * @property {string} comment – Комментарий.
*/
/**
 * @typedef {Object} ReturnRequirementsInPositionCommon
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oRequirementsInPositionCommon[]} result – Коллекция учебных программ.
*/
/**
 * @function GetPositionCommonRequirements
 * @memberof Websoft.WT.Staff
 * @description Требования в типовой должности.
 * @property {bigint} iObjectID – ID типовой должности
 * @property {bigint} iPersonID – ID текущего сотрудника
 * @returns {ReturnRequirementsInPositionCommon}
*/
function GetPositionCommonRequirements(iObjectID, iPersonID)
{
    var oRes = tools.get_code_library_result_object();
	oRes.result = []

	try
	{
		var tePositionCommon = get_position_common(iObjectID, iPersonID)
	}
	catch(err)
	{
		oRes.error = 1
		oRes.errorText = err
		return oRes;
	}

	var itemRec;
	for(itemRequirement in tePositionCommon.requirements)
	{
		itemRec = {};
		itemRec.id = itemRequirement.id.Value;
		itemRec.name = itemRequirement.name.Value;
		itemRec.comment = itemRequirement.comment.Value;

		oRes.result.push(itemRec);
	}

	return oRes;
}

/**
 * @typedef {Object} oBenefitsInPositionCommon
 * @property {bigint} ID
 * @property {string} name – Наименование.
 * @property {number} weight – Вес.
 * @property {string} link – Ссылка на карточку.
*/
/**
 * @typedef {Object} ReturnBenefitsInPositionCommon
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oBenefitsInPositionCommon[]} result – Коллекция учебных программ.
*/
/**
 * @function GetPositionCommonBenefits
 * @memberof Websoft.WT.Staff
 * @description Привилегии в типовой должности.
 * @property {bigint} iObjectID – ID типовой должности
 * @property {bigint} iPersonID – ID текущего сотрудника
 * @returns {ReturnBenefitsInPositionCommon}
*/
function GetPositionCommonBenefits(iObjectID, iPersonID)
{
    var oRes = tools.get_code_library_result_object();
	oRes.result = []

	try
	{
		var tePositionCommon = get_position_common(iObjectID, iPersonID)
	}
	catch(err)
	{
		oRes.error = 1
		oRes.errorText = err
		return oRes;
	}

	var sReq = "for $elem in benefits where MatchSome($elem/id, (" + ArrayMerge(tePositionCommon.benefits, "This.id.Value", ",") + ")) return $elem/Fields('id','name','weight')";

	var itemRec;
	for(itemEducationMethod in tools.xquery(sReq))
	{
		itemRec = {};
		itemRec.id = itemEducationMethod.id.Value;
		itemRec.name = itemEducationMethod.name.Value;
		itemRec.weight = itemEducationMethod.weight.Value;
		itemRec.link = tools_web.get_mode_clean_url(null, itemEducationMethod.id.Value);

		oRes.result.push(itemRec);
	}

	return oRes;
}

/**
 * @function GetPositionCommonCompetences
 * @memberof Websoft.WT.Staff
 * @description Компетенции в типовой должности.
 * @property {bigint} iObjectID – ID типовой должности
 * @property {bigint} iPersonID – ID текущего сотрудника
 * @returns {ReturnSimpleObjectInPositionCommon}
*/
function GetPositionCommonCompetences(iObjectID, iPersonID)
{
    var oRes = tools.get_code_library_result_object();
	oRes.result = []

	try
	{
		var tePositionCommon = get_position_common(iObjectID, iPersonID)
	}
	catch(err)
	{
		oRes.error = 1
		oRes.errorText = err
		return oRes;
	}

	if(tePositionCommon.competence_profile_id.HasValue)
	{
		var docCompetenceProfile = tools.open_doc(tePositionCommon.competence_profile_id.Value)

		if(docCompetenceProfile == undefined)
		{
			oRes.error = 1
			oRes.errorText = StrReplace("Невозможно получить документ профиля компетенций по ID: [{PARAM1}]", "{PARAM1}", tePositionCommon.competence_profile_id.Value);
			return oRes;
		}

		var sReq = "for $elem in competences where MatchSome($elem/id, (" + ArrayMerge(docCompetenceProfile.TopElem.competences, "This.competence_id.Value", ",") + ")) return $elem/Fields('id','name')";

		var itemRec;
		for(itemCompetence in tools.xquery(sReq))
		{
			itemRec = {};
			itemRec.id = itemCompetence.id.Value;
			itemRec.name = itemCompetence.name.Value;
			itemRec.link = tools_web.get_mode_clean_url(null, itemCompetence.id.Value);

			oRes.result.push(itemRec);
		}
	}

	return oRes;
}


/**
 * @typedef {Object} oCompetence
 * @property {bigint} id
 * @property {string} name
 * @property {string} desc
 * @property {string} comment
 * @property {string} link
 * @property {string} image_url
 * @property {string} roles_names
*/
/**
 * @typedef {Object} WTCompetenceResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oCompetence[]} array – массив
*/
/**
 * @function GetCompetencesByRoles
 * @memberof Websoft.WT.Staff
 * @description Получение списка компетенций.
 * author BG
 * @param {string} aRoleIds ID категорий компетенций, для которых не будет учтена иерархия..
 * @param {string} aHierRoleIds ID категорий компетенций, для которых будет учтена иерархия..
 * @returns {WTCompetenceResult}
*/

function GetCompetencesByRoles(aRoleIds, aHierRoleIds)
{
    var oRes = tools.get_code_library_result_object();
	oRes.result = []

	var aRoleIDsFinal = null;
	var catComp, teComp, oElem, sRole, iRole;

	if (aRoleIds != null)
	{
		aRoleIDsFinal = ArraySelect(ArrayExtract(aRoleIds, "OptInt(This, null)"), "This > 0");
	}
	if (aHierRoleIds != null)
	{
		if (aRoleIDsFinal == null)
			aRoleIDsFinal = new Array();

		for (sRole in aHierRoleIds)
		{
			iRole = OptInt(sRole, null);
			if (iRole > 0)
			{
				aRoleIDsFinal.push(iRole);
				aRoleIDsFinal = ArrayUnion(aRoleIDsFinal, ArrayExtract(tools.xquery( "for $elem in roles where IsHierChild( $elem/id, " + iRole + " ) order by $elem/Hier() return $elem/Fields('id')" ), "This.PrimaryKey.Value"));
			}
		}
	}

	var sQuery = "for $elem in competences "

	if (aRoleIDsFinal != null)
	{
		var cond = ArrayOptFirstElem(aRoleIDsFinal) == undefined ? "where IsEmpty($elem/role_id)=true() " : "where MatchSome($elem/role_id, (" +ArrayMerge(ArraySelectDistinct(aRoleIDsFinal, "This"), "This", ",")+ ")) ";

		sQuery += cond;
	}


	sQuery += "return $elem/id,$elem/__data";

	var aSearchRole = [];
	for (catComp in tools.xquery(sQuery))
	{
		teComp = OpenDoc(UrlFromDocID(catComp.PrimaryKey)).TopElem;
		oElem = ({
			"id": StrInt(catComp.PrimaryKey),
			"name": teComp.name.Value,
			"desc": teComp.desc.Value,
			"comment": teComp.comment.Value,
			"link": tools_web.get_mode_clean_url( "competence_info",  catComp.PrimaryKey),
			"image_url": (teComp.resource_id.HasValue ? "/download_file.html?file_id=" + teComp.resource_id.Value : null)
		});

		oElem.roles_names = [];
		for (iRole in teComp.role_id)
		{
			if (iRole.Value > 0)
			{
				oElem.roles_names.push(iRole.Value);
				if (aSearchRole.indexOf(iRole.Value) < 0)
					aSearchRole.push(iRole.Value);
			}
		}

		oRes.result.push(oElem);
	}

	if (ArrayOptFirstElem(aSearchRole) != undefined)
	{
		aSearchRole = tools.xquery("for $elem in roles where MatchSome($elem/id, ("+ArrayMerge(aSearchRole, "This", ",")+")) return $elem/Fields('id','name')");
		var oRole;
		for (oElem in oRes.result)
		{
//			if (ArrayOptFirstElem(oElem.roles_names) != undefined)
				oElem.roles_names = ArrayMerge(ArrayIntersect(aSearchRole, oElem.roles_names, "This.id.Value"), "This.name.Value", "|||");
		}
	}

	return oRes;
}

/**
 * @typedef {Object} oResume
 * @property {bigint} id
 * @property {string} name
 * @property {string} parent_id
*/
/**
 * @typedef {Object} WTResumeResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {oResume[]} array – массив
*/
/**
 * @function GetResumes
 * @memberof Websoft.WT.Staff
 * @description Получения списка резюме.
 * @param {string} sSearchString Поисковый запрос.
 * @returns {WTResumeResult}
*/

function GetResumes( iCurUserID, bCheckAccess, sSearchString )
{
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
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: 'Invalid param iCurUserID.', param_name: 'iCurUserID' }";
		return oRes;
	}

	try
	{
		if ( sSearchString == undefined || sSearchString == '' || StrLen( sSearchString ) < 3 )
			throw '';

		sSearchString = ' where doc-contains( $elem/id, "' + DefaultDb + '", ' + CodeLiteral( sSearchString ) + ' )';
	}
	catch( ex )
	{
		sSearchString = '';
	}

	xarrResumes = XQuery( "for $elem in resumes " + sSearchString + " return $elem/Fields('id','person_fullname','creation_date','modification_date','name','profession_id','education_type_id')" )

	if(bCheckAccess){
		var arrResumesPush = new Array()
		for(oResume in xarrResumes){

			if(tools_web.check_access( oResume.id.Value, iCurUserID )){
				arrResumesPush.push(oResume)
			}
		}
		xarrResumes = arrResumesPush
	}

	for ( oResume in xarrResumes )
	{
		obj = new Object();
		obj.id = oResume.id.Value;
		obj.fullname = oResume.person_fullname.Value;
		obj.creation_date = StrDate( oResume.creation_date.Value, true, false );
		obj.modification_date = StrDate( oResume.modification_date.Value, true, false );
		obj.position = oResume.name.Value;
		obj.professional_area_id = oResume.profession_id.Value;
		obj.education_type_id = oResume.education_type_id.Value;
		try
		{
			obj.professional_area_name = oResume.profession_id.ForeignElem.name;
		}
		catch( e )
		{
			obj.professional_area_name = global_settings.object_deleted_str.Value
		}
		try
		{
			obj.education_type_name = oResume.education_type_id.ForeignElem.name;
		}
		catch( e )
		{
			obj.education_type_name = global_settings.object_deleted_str.Value;
		}
		obj.link = tools_web.get_mode_clean_url( null, oResume.id );
		oRes.array.push( obj );
	}

	return oRes
}

/**
 * @typedef {Object} oResume
 * @property {bigint} id
 * @property {string} name
 * @property {string} parent_id
*/
/**
 * @typedef {Object} WTMyResumeResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {oResume[]} array – массив
*/
/**
 * @function GetMyResumes
 * @memberof Websoft.WT.Staff
 * @description Получения списка резюме сотрудника.
 * @param {integer} iCurUserID ID текущего пользователя.
 * @param {string} sResumeStatus Поисковый запрос.
 * @param {string} sSortType Тип сортировки.
 * @returns {WTMyResumeResult}
*/

function GetMyResumes( iCurUserID, sResumeStatus, sSortType )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];

	var arrXQueryConditions = new Array();

	try
	{
		iCurUserID = Int( iCurUserID );
		arrXQueryConditions.push( '$elem/person_id = ' + iCurUserID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID текущего пользователя";
		return oRes;
	}

	try
	{
		if ( sResumeStatus == undefined || sResumeStatus == '' )
			throw '';

		switch ( sResumeStatus )
		{
			case 'active':
				arrXQueryConditions.push( '$elem/is_archive != true()' );
			case 'archive':
				arrXQueryConditions.push( '$elem/is_archive = true()' );
		}
	}
	catch( ex )
	{
		sResumeStatus = '';
	}

	try
	{
		if ( sSortType == undefined || sSortType == '' )
			throw '';

		sSortType = ' order by $elem/' + sSortType + ' descending';
	}
	catch( ex )
	{
		sSortType = ' order by $elem/modification_date descending';
	}

	var sXQueryConditions = ArrayCount( arrXQueryConditions ) > 0 ? ' where ' + ArrayMerge( arrXQueryConditions, 'This', ' and ' ) : '';

	for ( catResume in XQuery( "for $elem in resumes " + sXQueryConditions + sSortType + " return $elem/Fields('id','person_fullname','creation_date','modification_date','name','profession_id','education_type_id','is_archive')" ) )
	{
		obj = new Object();
		obj.id = catResume.id.Value;
		obj.fullname = catResume.person_fullname.Value;
		obj.creation_date = StrDate( catResume.creation_date.Value, true, false );
		obj.modification_date = StrDate( catResume.modification_date.Value, true, false );
		obj.position = catResume.name.Value;
		obj.professional_area_id = catResume.profession_id.Value;
		obj.education_type_id = catResume.education_type_id.Value;
		try
		{
			obj.professional_area_name = catResume.profession_id.HasValue ? catResume.profession_id.ForeignElem.name : '';
		}
		catch( e )
		{
			obj.professional_area_name = global_settings.object_deleted_str.Value
		}
		try
		{
			obj.education_type_name = catResume.education_type_id.HasValue ? catResume.education_type_id.ForeignElem.name : '';
		}
		catch( e )
		{
			obj.education_type_name = global_settings.object_deleted_str.Value;
		}

		obj.status = catResume.is_archive ? 'Архивное' : 'Действующее';

		obj.link = tools_web.get_mode_clean_url( null, catResume.id );
		oRes.array.push( obj );
	}

	return oRes
}

/**
 * @typedef {Object} oVacancy
 * @property {bigint} id
 * @property {string} name
 * @property {string} parent_id
*/
/**
 * @typedef {Object} WTMyVacanciesResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {oVacancy[]} array – массив
*/
/**
 * @function GetMyVacancies
 * @memberof Websoft.WT.Staff
 * @description Получения списка вакансий по заявке сотрудника.
 * @param {integer} iCurUserID ID текущего пользователя.
 * @param {boolean} bNotShowClosed Если установлен, в результаты не попадают закрытые вакансии
 * @returns {WTMyVacanciesResult}
*/

function GetMyVacancies( iCurUserID, bNotShowClosed )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];

	var arrXQueryConditions = new Array();

	try
	{
		iCurUserID = Int( iCurUserID );
		arrXQueryConditions.push( '$elem/collaborator_id = ' + iCurUserID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID текущего пользователя";
		return oRes;
	}

	try
	{
		bNotShowClosed = tools_web.is_true( bNotShowClosed );
	}
	catch( ex )
	{
		bNotShowClosed = false;
	}

	if ( bNotShowClosed )
	{
		arrXQueryConditions.push( "$elem/is_closed = false()" );
	}

	var sXQueryConditions = ArrayCount( arrXQueryConditions ) > 0 ? ' where ' + ArrayMerge( arrXQueryConditions, 'This', ' and ' ) : '';

	for ( catVacancy in XQuery( "for $elem in vacancys " + sXQueryConditions + " return $elem" ) )
	{
		obj = new Object();
		obj.id = catVacancy.id.Value;
		obj.name = catVacancy.name.Value;
		obj.creation_date = StrDate( catVacancy.creation_date.Value, true, false );
		obj.modification_date = StrDate( catVacancy.modification_date.Value, true, false );
		obj.professional_area_id = catVacancy.profession_id.Value;
		obj.education_type_id = catVacancy.educ_type_id.Value;
		try
		{
			obj.professional_area_name = catVacancy.profession_id.ForeignElem.name;
		}
		catch( e )
		{
			obj.professional_area_name = global_settings.object_deleted_str.Value
		}
		try
		{
			obj.education_type_name = catVacancy.educ_type_id.ForeignElem.name;
		}
		catch( e )
		{
			obj.education_type_name = global_settings.object_deleted_str.Value;
		}
		obj.link = tools_web.get_mode_clean_url( null, catVacancy.id );
		obj.image_url = tools_web.get_object_source_url( 'resource', catVacancy.resource_id.Value );
		obj.comment = catVacancy.comment.Value;
		oRes.array.push( obj );
	}

	return oRes
}

/**
 * @typedef {Object} oVacancy
 * @property {bigint} id
 * @property {string} name
 * @property {string} parent_id
*/
/**
 * @typedef {Object} WTMyVacanciesResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {oVacancy[]} array – массив
*/
/**
 * @function GetCandidatesForMyVacancy
 * @memberof Websoft.WT.Staff
 * @description Получение списка кандидатов для вакансии, опубликованной сотрудником.
 * @param {integer} iVacancyID ID текущего пользователя.
 * @returns {WTMyVacanciesResult}
*/

function GetCandidatesForMyVacancy( iVacancyID )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];

	try
	{
		iVacancyID = Int( iVacancyID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID вакансии";
		return oRes;
	}

	for ( catVacancyResponse in XQuery( "for $elem in vacancy_responses where $elem/vacancy_id = " + iVacancyID + " return $elem/Fields('person_id','person_fullname','status','date')" ) )
	{
		obj = new Object();
		obj.id = catVacancyResponse.person_id.Value;
		obj.fullname = catVacancyResponse.person_fullname.Value;
		try
		{
			obj.status = catVacancyResponse.status.ForeignElem.name;
		}
		catch( e )
		{
			obj.status = '';
		}
		obj.date = StrDate( catVacancyResponse.date.Value, false, false );
		obj.link = tools_web.get_mode_clean_url( 'candidate', obj.id );
		oRes.array.push( obj );
	}

	return oRes
}

function lp_create_resume( sCommand, iPersonID, tePerson, SCOPE_WVARS, curLngWeb )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = ({});

	try
	{
		if ( ObjectType( SCOPE_WVARS ) != "JsObject" )
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
		oRes.result = { command: "alert", msg: "Некорректный ID сотрудника" };
		return oRes;
	}
	try
	{
		if ( iPersonID != null )
			tePerson.Name;
	}
	catch( ex )
	{
		if ( iPersonID != null )
			try
			{
				tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
			}
			catch( ex )
			{
				oRes.result = { command: "alert", msg: "Некорректный ID сотрудника" };
				return oRes;
			}
		else
			tePerson = null;
	}

	function get_form_field( field_name )
	{
		catElem = ArrayOptFind( oFormFields, "This.name == field_name" );
		return catElem == undefined ? "" : catElem.value
	}

	arrExistsResumes = ArraySelectAll( XQuery( "for $elem in resumes where $elem/person_id = " + iPersonID + " and $elem/filling_type = 'file' and $elem/is_archive != true() order by $elem/creation_date descending return $elem/Fields('id')" ) );

	switch( sCommand )
	{
		case "eval":

			if ( ArrayCount( arrExistsResumes ) > 0 )
			{
				oRes.result = {
					command: "confirm",
					msg: "Перевести существующие резюме в статус \"Архив\"?",
					confirm_result: {
						command		: "display_form",
						title		: "Добавить новый файл резюме",
						header		: "Заполните поля",
						form_fields : [
							{ "name": "position_name", "label": "Желаемая должность", "type": "string", "mandatory" : true, "validation": "" },
							{ "name": "file_id", "label": "Файл", "type": "file", "mandatory" : true, "validation": "" },
							{ "name": "comment", "label": "Комментарий", "type": "string", "mandatory" : false, "validation": "" }
						]
					}
				};
			}
			else
			{
				oRes.result = {
							command		: "display_form",
							title		: "Добавить файл резюме",
							header		: "Заполните поля",
							form_fields : []
				};

				oRes.result.form_fields.push( { "name": "position_name", "label": "Желаемая должность", "type": "string", "mandatory" : true, "validation": "" } );
				oRes.result.form_fields.push( { "name": "file_id", "label": "Файл", "type": "file", "mandatory" : true, "validation": "" } );
				oRes.result.form_fields.push( { "name": "comment", "label": "Комментарий", "type": "string", "mandatory" : false, "validation": "" } );
			}
			break;

		case "submit_form":

			oFormFields = parse_form_fields( SCOPE_WVARS.GetOptProperty( "form_fields" ) );

			arrNeededFields = [ "position_name", "file_id" ];

			for ( sField in arrNeededFields )
			{
				if ( get_form_field( sField ) == "" )
				{
					oRes.result = { command: "alert", msg: "Необходимо заполнить все обязательные поля" };
					return oRes;
				}
			}

			if ( ArrayCount( arrExistsResumes ) > 0 )
			{
				for ( catExistsResume in arrExistsResumes )
				{
					docExistsResume = tools.open_doc( catExistsResume.id )
					if ( docExistsResume != undefined )
					{
						docExistsResume.TopElem.is_archive = true;
						docExistsResume.Save();
					}
				}
			}

			docResume = OpenNewDoc( 'x-local://wtv/wtv_resume.xmd' );
			docResume.TopElem.AssignElem( tePerson );
			docResume.TopElem.id.Clear();
			docResume.BindToDb( DefaultDb );
			docResume.TopElem.doc_info.creation.date = Date();
			docResume.TopElem.name = get_form_field( "position_name", "" );
			docResume.TopElem.filling_type = "file";
			docResume.TopElem.person_id = iPersonID;
			tools.common_filling ( 'collaborator', docResume.TopElem.person_id, iPersonID, tePerson );
			docResume.TopElem.creator_person_id = iPersonID;
			tools.common_filling ( 'collaborator', docResume.TopElem.creator_person_id, iPersonID, tePerson );

			docResume.TopElem.desc = HtmlEncode( get_form_field( "comment", "" ) );

			try
			{
				catFile = ArrayOptFind( oFormFields, "This.name == 'file_id'" );
				if ( catFile != undefined && catFile.HasProperty( "url" ) && catFile.url != "" )
				{
					docResource = OpenNewDoc( 'x-local://wtv/wtv_resource.xmd' );

					if ( iPersonID != null )
					{
						docResource.TopElem.person_id = iPersonID;
						tools.common_filling( 'collaborator', docResource.TopElem, iPersonID, tePerson );
					}
					docResource.BindToDb();
					docResource.TopElem.put_data( catFile.url );
					docResource.Save();

					docResume.TopElem.files.ObtainChildByKey( docResource.DocID );
				}

				docResume.Save();

				oRes.result = { command: "close_form", msg: "Резюме успешно добавлено", confirm_result : { command: "reload_page" } };
			}
			catch( err )
			{
				alert( err );
				oRes.result = { command: "alert", msg: tools_web.get_web_const( 'vozniklaoshibka_1', curLngWeb ), confirm_result : { command: "reload_page" } };

			}
			break;
		default:
			oRes.result = { command: "alert", msg: "Неизвестная команда" };
			break;
	}

	return oRes;
}
/**
 * @author BG
*/
function parse_form_fields(sFormFields)
{
	var arrFormFields = undefined;
	try
	{
		arrFormFields = ParseJson( sFormFields );
	}
	catch(e)
	{
		arrFormFields = [];
	}

	return arrFormFields;
}

/**
 * @author BG
*/
function form_fields_to_object(sFormFields)
{
	var oFormField = {};
	for(ffItem in parse_form_fields(sFormFields))
	{
		if(ffItem.type == "file")
			oFormField.SetProperty(ffItem.name, ({value:ffItem.value, url: (ffItem.HasProperty("url") ? ffItem.url : "")}));
		else
			oFormField.SetProperty(ffItem.name, ffItem.value);
	}

	return oFormField;
}

function resume_params(iResumeID, teResume, arrFields)
{
	try
	{
		teResume.Name
	}
	catch(e)
	{
		iResumeID = OptInt(iResumeID);
		var docResume = iResumeID != undefined ? tools.open_doc(iResumeID) : undefined;
		teResume = docResume != undefined ? docResume.TopElem : undefined;
	}

	var arrResumeParam = [];

	var Value, XmElem, sXmElemTitle, feXmElem, XmCatalog, XmTitle, XmEntrys;
	var XmType = "";
	var XmForm = teResume != undefined ? teResume.Form.TopElem : OpenDoc("x-local://wtv/wtv_resume.xmd").TopElem.Child('resume');
	for(itemField in arrFields)
	{
		XmElem = teResume != undefined ? teResume.Child(itemField) : null;;
		XmEntrys = [];
		XmElemForm = XmForm.Child(itemField);

		XmType = teResume != undefined ?  XmElemForm.Type : XmElemForm.GetOptAttr('TYPE');
		XmTitle = teResume != undefined ? XmElemForm.Title : XmElemForm.GetOptAttr('TITLE');
		XmCatalog = teResume != undefined ? XmElem.FormElem.ForeignArrayExpr : XmElemForm.GetOptAttr('FOREIGN-ARRAY');

		if(XmCatalog != undefined && XmCatalog != null && XmCatalog != "")
		{
			if(StrBegins(XmCatalog, "common.") || StrBegins(XmCatalog, "lists."))
			{
				XmType = "select";
				XmEntrys = ArrayExtract(eval(XmCatalog), "({name:This.name.Value,value:This.id.Value})")
			}
			else
			{
				XmType = "foreign_elem";
				if(StrEnds(XmCatalog, "s"))
					XmCatalog = StrLeftRange(XmCatalog, StrCharCount(XmCatalog)-1)
			}
		}

		if(StrBegins(XmTitle, "const="))
		{
			XmTitle = ms_tools.get_const(StrReplace(XmTitle, "const=", ""))
		}
		else if(StrBegins(XmTitle, "ms_tools.get_const"))
		{
			XmTitle = eval(XmTitle)
		}
		else if(StrBegins(XmTitle, "##'"))
		{
			XmTitle = StrReplace(StrReplace(XmTitle, "##'", ""), "'##", "")
		}

		if(teResume != undefined)
		{
			feXmElem = XmElem.OptForeignElem;
			if(feXmElem == undefined)
			{
				switch(itemField)
				{
					case "is_willing_relocate":
					{
						Value = tools_web.is_true(XmElem.Value) ? "Готов" : "Не готов";
						break;
					}
					default:
					{
						Value = RValue(XmElem);
					}
				}
			}
			else
			{
				Value = RValue(feXmElem.name);
			}
		}
		arrResumeParam.push({"name": itemField, "title": XmTitle, "type": XmType, "entries": XmEntrys, "catalog": XmCatalog, "value": RValue(XmElem), "display_value": Value});
	}

	return arrResumeParam
}

function AddChangeResume(sFormCommand, sFormFields, iResumeID, iPersonID)
{
	var oRes = tools.get_code_library_result_object();
	oRes.result = []

	var arrFormFields = [];
	try
	{
		iPersonID = OptInt(iPersonID);
		iResumeID = OptInt(iResumeID);
		var docResume = null;
		var teResume = null;
		if(iResumeID != undefined)
		{
			docResume = tools.open_doc(iResumeID);

			if(docResume == undefined )
				throw StrReplace("Не найден объект с ID: [{PARAM1}]", "{PARAM1}", iResumeID);

			teResume = docResume.TopElem;
			if(teResume.Name != 'resume')
				throw StrReplace("Объект с ID: [{PARAM1}] не является резюме", "{PARAM1}", iResumeID);
		}

		var arrFields = [
			"name",
			"profession_id",
			"employment_type_id",
			"schedule_work_id",
			"willingness_travel_type_id",
			"is_willing_relocate",
			"relocate_name",
			"mobile_phone"
			// "min_wage",
			// "max_wage",
			// "currency_type_id",
			// "education_type_id",
			// "schedule_id",
			// "exp_years",
			// "academic_degree",
			// "academic_heading",
			// "main_lng",
			// "phone",
			// "work_phone",
			// "email",
			// "location_id",
			// "address"
		];

		if(sFormCommand == "eval")
		{
			var sTitle, fValue, oFormElem;

			if(teResume != null)
			{
				oFormElem = {
					name: 'person_id',
					type: 'hidden',
					value: teResume.person_id.Value
					};
				arrFormFields.push(oFormElem);

				var catPerson = teResume.person_id.OptForeignElem;
				if(catPerson != undefined)
				{
					oFormElem = {
						name: 'paragraph_person_id',
						type: 'paragraph',
						value: "<b>Сотрудник:</b>&nbsp;" + catPerson.fullname.Value
						};
					arrFormFields.push(oFormElem);
				}

			}
			else if(iPersonID != undefined)
			{
				oFormElem = {
					name: 'person_id',
					type: 'hidden',
					value: iPersonID
					};
				arrFormFields.push(oFormElem);
				var catPerson = ArrayOptFirstElem(tools.xquery(tools.create_xquery( 'collaborator', " $elem/id=" + iPersonID, "" )));
				if(catPerson != undefined)
				{
					oFormElem = {
						name: 'paragraph_person_id',
						type: 'paragraph',
						value: "<b>Сотрудник:</b>&nbsp;" + catPerson.fullname.Value
						};
					arrFormFields.push(oFormElem);
				}
			}
			else
			{
				oFormElem = {
							name: "person_id",
							label: "Сотрудник",
							type: "foreign_elem",
							catalog: "collaborator",
							mandatory: true
						};
				arrFormFields.push(oFormElem);
			}

			arrFormFields.push({name: 'paragraph_main', type: 'paragraph', value: '<h4 style="border-bottom: 1px solid #000000;">Основные сведения</h4>'});
			var arrResumeParam = resume_params(iResumeID, teResume, arrFields);
			var iColumnCount = 1;
			for(itemField in arrResumeParam)
			{
				sTitle = "Введите значение";
				fValue = itemField.value;
				switch(itemField.type)
				{
					case "foreign_elem":
						sTitle = "Выберите элемент";
						fValue = OptInt(itemField.value, null);
						break;
				}

				oFormElem = {
					name: itemField.name,
					label: itemField.title,
					title: sTitle,
					type: itemField.type,
					entries: itemField.entries,
					mandatory: false,
					multiple: false,
					catalog: itemField.catalog,
					value: itemField.value,
					display_value: itemField.display_value
					}

				if(itemField.name == "name")
				{
					oFormElem.mandatory = true;
					iColumnCount = 1;
				}
				else if(itemField.name == "address")
				{
					oFormElem.type = "text";
				}
				else
				{
					oFormElem.column = 2 - iColumnCount % 2;
					iColumnCount++;
				}

				if(itemField.name == "relocate_name")
				{
					oFormElem.visibility = [{ parent: "is_willing_relocate", value: true }];
				}

				arrFormFields.push(oFormElem);
			}

			// Профессиональный опыт
			arrFormFields.push({name: 'paragraph_main', type: 'paragraph', value: '<h4 style="border-bottom: 1px solid #000000;">Опыт работы</h4>'});
			oFormElem = {
				name: "work_experiences",
				//label: "Профессиональный опыт",
				label: "",
 				type: "array",
 				array: [
					{
						name: "start_date",
 						label: "Начало работы",
 						type: "date",
 						mandatory: true,
 						column: 1
 					},
					{
						name: "finish_date",
 						label: "Окончание работы",
 						type: "date",
						mandatory: false,
 						column: 2
 					},
					{
						name: "org_name",
 						label: "Организация",
 						type: "string",
						mandatory: true,
 						column: 1
 					},
					{
						name: "position_name",
 						label: "Должность",
 						type: "string",
						mandatory: false,
 						column: 2
 					},
					{
						name: "profession_id",
 						label: "Профессиональная область",
 						type: "foreign_elem",
						catalog: "professional_area",
						mandatory: false,
 						column: 1
 					},
					{
						name: "region_id",
 						label: "Регион",
 						type: "foreign_elem",
						catalog: "region",
						mandatory: false,
 						column: 2
 					},
					{
						name: "desc",
 						label: "Описание",
 						type: "text",
						mandatory: false
 					},
					/*{
						name: "org_phone",
 						label: "Телефон",
 						type: "string",
						mandatory: false,
 						column: 1
 					},
					{
						name: "org_fax",
 						label: "Факс",
 						type: "string",
						mandatory: false,
 						column: 2
 					},
					{
						name: "org_email",
 						label: "EMail",
 						type: "string",
						mandatory: false,
 						column: 1
 					},
					{
						name: "org_site",
 						label: "Сайт",
 						type: "string",
						mandatory: false,
 						column: 2
 					},
					{
						name: "org_address",
 						label: "Адрес",
 						type: "string",
						mandatory: false,
 						column: 1
 					},
					{
						name: "comment",
 						label: "Комментарий",
 						type: "text",
						mandatory: false
 					},*/
					{
						name: "id",
 						label: "ID",
 						type: "hidden",
 					}
				],
				value: []
			};

			if(teResume != null)
			{
				var xmProffession, xmRegion;
				for (itemWEResume in teResume.work_experiences)
				{
					xmProffession = itemWEResume.profession_id.OptForeignElem;
					xmRegion = itemWEResume.region_id.OptForeignElem;
					oFormElem.value.push([
						{name: "id", value: itemWEResume.id.Value},
						{name: "start_date", value: itemWEResume.start_date.Value},
						{name: "finish_date",  value: itemWEResume.finish_date.Value},
						{name: "org_name",  value: itemWEResume.org_name.Value},
						{name: "position_name",  value: itemWEResume.position_name.Value},
						{name: "profession_id",  value: itemWEResume.profession_id.Value, display_value: (xmProffession != undefined ? xmProffession.name.Value : "")},
						{name: "region_id",  value: itemWEResume.region_id.Value, display_value: (xmRegion != undefined ? xmRegion.name.Value : "")},
						{name: "desc",  value: itemWEResume.desc.Value}
						// {name: "org_phone",  value: itemWEResume.org_phone.Value},
						// {name: "org_fax",  value: itemWEResume.org_fax.Value},
						// {name: "org_email",  value: itemWEResume.org_email.Value},
						// {name: "org_site",  value: itemWEResume.org_site.Value},
						// {name: "org_address",  value: itemWEResume.org_address.Value},
						// {name: "comment",  value: itemWEResume.comment.Value}
						]);
				}
			}
			arrFormFields.push(oFormElem);

			// Навыки
			arrFormFields.push({name: 'paragraph_main', type: 'paragraph', value: '<h4 style="border-bottom: 1px solid #000000;">Навыки</h4>'});
			var sXQueryQual = "$elem/parent_id != null()";
			if (teResume != null)
				sXQueryQual += " and some $rs in resume_skills satisfies ( $rs/skill_id = $elem/id and $rs/resume_id = " + iResumeID + " )";

			oFormElem = {
				name: "skills",
				// label: "Навыки",
				label: "",
 				type: "array",
 				array: [
					{
						name: "id",
 						label: "ID",
 						type: "hidden",
 					},
					{
						name: "skill_id",
 						label: "Навык",
 						type: "foreign_elem",
						catalog: "skill",
						query_qual: sXQueryQual,
 						mandatory: true,
 						column: 1
 					}
				],
				value: []
			};

			if(teResume != null)
			{
				var arrSkillInResume = tools.xquery("for $elem in resume_skills where $elem/resume_id = " + iResumeID + " order by $elem/skill_name return $elem");
				var LevelsContainerID = ArrayOptFirstElem(ArraySelectDistinct(ArraySelect(arrSkillInResume, "This.skill_id_with_levels.HasValue"), "This.skill_id_with_levels"), {skill_id_with_levels: null}).skill_id_with_levels;
				if(LevelsContainerID != undefined)
				{
					var docLevelsContainer = tools.open_doc(LevelsContainerID);
					if(docLevelsContainer != undefined)
					{
						var arrLevelEntris = ArrayExtract(ArraySort(docLevelsContainer.TopElem.levels, "name", "+"), "({name:This.name.Value,value:This.id.Value})");
						oFormElem.array.push({
							name: "level_id",
							label: "Степень владения",
							type: "select",
							entries: arrLevelEntris,
							mandatory: false,
							column: 2
						});
					}
				}

				var arrCurSkills = tools.xquery("for $elem in skills where MatchSome($elem/id, (" + ArrayMerge(arrSkillInResume, "This.skill_id.Value", ",") + ")) and $elem/parent_id != null() order by $elem/name return $elem");
				var xmSkill;
				for (itemSkillResume in ArrayIntersect(teResume.skills, arrCurSkills, "This.skill_id.Value", "This.id.Value"))
				{
					xmSkill = itemSkillResume.skill_id.OptForeignElem;
					oFormElem.value.push([
						{name: "id", value: itemSkillResume.id.Value},
						{name: "skill_id", value: itemSkillResume.skill_id.Value, display_value: (xmSkill != undefined ? xmSkill.name.Value : "")},
						{name: "level_id", value: itemSkillResume.level_id.Value}
						]);
				}
			}
			arrFormFields.push(oFormElem);

			// Образование
			arrFormFields.push({name: 'paragraph_main', type: 'paragraph', value: '<h4 style="border-bottom: 1px solid #000000;">Образование</h4>'});
			oFormElem = {
				name: "educations",
				// label: "Образование, повышение квалификации, курсы, тесты, экзамены",
 				label: "",
				type: "array",
 				array: [
					{
						name: "id",
 						label: "ID",
 						type: "hidden",
 					},
					{
						name: "name",
 						label: "Наименование",
 						type: "string",
 						mandatory: true
 					},
					{
						name: "education_type_id",
 						label: "Тип образования",
 						type: "foreign_elem",
						catalog: "education_type",
						mandatory: true,
 						column: 1
 					},
					{
						name: "professional_area_id",
 						label: "Специальность по диплому",
 						type: "foreign_elem",
						catalog: "professional_area",
						mandatory: false,
 						column: 2
 					},
					{
						name: "specialisation",
 						label: "Обучающая организация, факультет",
 						type: "string",
						mandatory: false,
 						column: 1
 					},
					{
						name: "date",
 						label: "Год окончания",
 						type: "integer",
						mandatory: false,
 						column: 2
 					},
					/*{
						name: "form",
 						label: "Форма обучения",
 						type: "foreign_elem",
						catalog: "education_form",
						mandatory: false,
 						column: 2
 					},
					{
						name: "mode",
 						label: "Способ получения образования",
 						type: "foreign_elem",
						catalog: "education_mode",
						mandatory: false,
 						column: 1
 					},
					{
						name: "result",
 						label: "Результат/диплом/степень",
 						type: "string",
						mandatory: false,
 						column: 1
 					},
					{
						name: "site",
 						label: "Сайт ВУЗа",
 						type: "string",
						mandatory: false,
 						column: 1
 					},
					{
						name: "comment",
 						label: "Комментарий",
 						type: "text",
						mandatory: false
 					}*/
				],
				value: []
			};

			if(teResume != null)
			{
				var xmEducationType, xmProfessionalArea;
				for (itemEduResume in teResume.educations)
				{
					xmEducationType = itemEduResume.education_type_id.OptForeignElem;
					xmProfessionalArea = itemEduResume.professional_area_id.OptForeignElem;
					oFormElem.value.push([
						{name: "id", value: itemEduResume.id.Value},
						{name: "name", value: itemEduResume.name.Value},
						{name: "education_type_id",  value: itemEduResume.education_type_id.Value, display_value: (xmEducationType != undefined ? xmEducationType.name.Value : "")},
						{name: "professional_area_id",  value: itemEduResume.professional_area_id.Value, display_value: (xmProfessionalArea != undefined ? xmProfessionalArea.name.Value : "")},
						{name: "date",  value: itemEduResume.date.Value},
						{name: "specialisation",  value: itemEduResume.specialisation.Value},
						// {name: "form",  value: itemEduResume.form.Value},
						// {name: "mode",  value: itemEduResume.mode.Value},
						// {name: "result",  value: itemEduResume.result.Value},
						// {name: "comment",  value: itemEduResume.comment.Value}
						]);
				}
			}
			arrFormFields.push(oFormElem);

			arrFormFields.push({name: 'paragraph_main', type: 'paragraph', value: '<h4 style="border-bottom: 1px solid #000000;">Знание языков</h4>'});
			// Языки
			oFormElem = {
				name: "lngs",
				// label: "Иностранные языки",
 				label: "",
				type: "array",
 				array: [
					{
						name: "id",
 						label: "ID",
 						type: "hidden",
 						value: "",
 						mandatory: false,
 						validation: "",
 					},
					{
						name: "lng_id",
 						label: "Иностранный язык",
 						type: "select",
 						value: "-",
						entries: ArrayExtract(ArraySort(common.languages, "name", "+"), "({name:This.name.Value,value:This.id.Value})"),
 						mandatory: false,
 						column: 1
 					},
					{
						name: "level",
 						label: "Степень владения",
 						type: "select",
 						value: "-",
 						entries: ArrayExtract(ArraySort(common.language_levels, "name", "+"), "({name:This.name.Value,value:This.id.Value})"),
						mandatory: false,
 						column: 2
 					}
				],
				value: []
			};

			if(teResume != null)
			{
				for (itemLngResume in teResume.lngs)
				{
					oFormElem.value.push([
						{name: "id", value: itemLngResume.id.Value},
						{name: "lng_id", value: itemLngResume.lng_id.Value},
						{name: "level",  value: itemLngResume.level.Value}
						]);
				}
			}

			arrFormFields.push(oFormElem);
			var sFormTitle = teResume != null ? "Изменение резюме" : "Создание резюме";
			var oForm = {
				command: "display_form",
				title: sFormTitle,
				form_fields: arrFormFields,
				buttons: [{ name: "submit", label: "Сохранить", type: "submit" },{ name: "cancel", label: "Отменить", type: "cancel"}]
			};

			oRes.result = oForm;
		}
		else if(sFormCommand == "submit_form")
		{

			var oFormField = form_fields_to_object(sFormFields);

			oRes.result = set_resume(docResume, oFormField, arrFields);
		}
	}
	catch(err)
	{
		oRes.error = 1;
		oRes.errorText = "Ошибка вызова удаленного действия \"AddChangeResume\"\r\n" + err;
		oRes.result = {command: "close_form", msg: oRes.errorText};
		alert("ERROR: AddChangeResume: " + oRes.errorText);
	}
	return oRes;
}

function set_resume(docResume, oFormField, arrFields)
{
	function convert_array_field(arrField)
	{
		var oRow;
		var arrRet = [];
		for(itemRow in arrField)
		{
			oRow = {};
			for(itemField in itemRow)
			{
				oRow.SetProperty(itemField.name, ({value: itemField.value, type: itemField.type}));
			}
			arrRet.push(oRow);
		}
		return arrRet;
	}

	var sFinalMsg = "Резюме изменено успешно";
	if(docResume == null || docResume == undefined)
	{
		docResume = tools.new_doc_by_name( 'resume', false );
		docResume.BindToDb( DefaultDb );
		sFinalMsg = "Резюме сохранено успешно";
		var iPersonID = OptInt(oFormField.GetOptProperty('person_id'));
		if(iPersonID != undefined)
		{
			docResume.TopElem.person_id = iPersonID;
			docPerson = tools.open_doc(iPersonID);
			docResume.TopElem.sex = docPerson.TopElem.sex.Value;
			docResume.TopElem.birth_date = docPerson.TopElem.birth_date.Value;
		}
	}

	var teResume = docResume.TopElem;
	var arrResumeParam = resume_params(null, teResume, arrFields);
	var Value;
	for(itemFieldResume in arrResumeParam)
	{
		switch(itemFieldResume.type)
		{
			case "int":
			case "foreign_elem":
				Value = OptInt(oFormField.GetOptProperty(itemFieldResume.name));
				break;
			case "real":
				Value = OptReal(oFormField.GetOptProperty(itemFieldResume.name));
				break;
			case "date":
				Value = OptDate(oFormField.GetOptProperty(itemFieldResume.name));
				break;
			default:
				Value = oFormField.GetOptProperty(itemFieldResume.name);
		}
		if(Value != undefined)
			teResume.Child(itemFieldResume.name).Value = Value;
	}

	var xmArray, xmItem, cellValue;
	for(itemBlock in ["work_experiences","skills","educations","lngs"])
	{
		formArray = convert_array_field(ArraySelect(oFormField.GetOptProperty(itemBlock), "IsArray(This)"));
		if(formArray != undefined && IsArray(formArray) && ArrayOptFirstElem(formArray) != undefined)
		{
			xmArray = teResume.Child(itemBlock);
			xmArray.DeleteChildren("ArrayOptFind(formArray, 'This.id.value == ' + CodeLiteral(This.id.Value)) == undefined");
			for(arrRow in formArray)
			{
				xmItem = ArrayOptFind(xmArray, "This.id.Value == arrRow.id.value")
				if(arrRow.id.value == "" || xmItem == undefined)
				{
					xmItem = xmArray.AddChild();
				}

				for(itemRow in arrRow)
				{
					if(itemRow == 'id')
						continue;
					xmTargetField = xmItem.Child(itemRow);
					switch(xmTargetField.Type)
					{
						case "date":
							cellValue = OptDate(arrRow[itemRow].value, null);
							break;
						case "integer":
							cellValue = OptInt(arrRow[itemRow].value, null);
							break;
						case "real":
							cellValue = OptReal(arrRow[itemRow].value, null);
							break;
						default:
							cellValue = arrRow[itemRow].value;
					}
					xmTargetField.Value = cellValue;
				}
			}
		}
	}

	docResume.Save();
	return {command: "close_form", msg: sFinalMsg, confirm_result : { command: "reload_page" }};
}

/**
 * @typedef {Object} NewEmployees
 * @property {bigint} id
 * @property {string} fullname
 * @property {string} image
 * @property {string} desc
 * @property {string} link
*/
/**
 * @typedef {Object} ReturnNewEmployees
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {NewEmployees[]} array – массив
*/
/**
 * @function GetNewEmployees
 * @memberof Websoft.WT.Staff
 * @description Получение списка новых сотрудников за период.
 * @author AZ BG
 * @param {bigint} iPeriod Количество дней, за которые сотрудник считается новым.
 * @param {bigint} iOrgID ID организации.
 * @param {oSort} oSort - Информация из рантайма о сортировке
 * @param {oPaging} oPaging - Информация из рантайма о пейджинге
 * @returns {ReturnNewEmployees}
*/

function GetNewEmployees( iPeriod, iOrgID, oSort, oPaging )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];
	oRes.paging = oPaging;

	try
	{
		iPeriod = Int( iPeriod );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Не указан период";
		return oRes;
	}

	try
	{
		iOrgID = Int( iOrgID );
	}
	catch( ex )
	{
		iOrgID = null;
	}

	dStartDate = DateNewTime( DateOffset( Date(), -86400 * iPeriod ), 0, 0, 0 );

	if(ObjectType(oSort) == 'JsObject' && oSort.FIELD != null && oSort.FIELD != undefined && oSort.FIELD != "" )
	{
		var sFieldName = oSort.FIELD;
		switch(oSort.FIELD)
		{
			case "desc":
				sFieldName = "";
				break
			case "hire_date_str":
				sFieldName = "hire_date";
				break
		}
		if(sFieldName != "")
			arrPerson = ArraySort(arrPerson, sFieldName, ((oSort.DIRECTION == "DESC") ? "-" : "+"));
	}

	xarrNewEmployees = XQuery( "for $elem in collaborators where " + ( iOrgID != null ? ( "$elem/org_id = " + iOrgID + " and " ) : "" ) + "$elem/hire_date >= " + XQueryLiteral( dStartDate ) + " and $elem/hire_date <= " + XQueryLiteral(Date()) + " and $elem/is_dismiss = false() order by $elem/hire_date descending return $elem/Fields( 'id', 'fullname', 'hire_date', 'pict_url', 'position_name' )" );

	if ( ObjectType( oPaging ) == 'JsObject' && oPaging.SIZE != null )
	{
		oPaging.MANUAL = true;
		oPaging.TOTAL = ArrayCount( xarrNewEmployees );
		oRes.paging = oPaging;
		xarrNewEmployees = ArrayRange( xarrNewEmployees, OptInt( oPaging.INDEX, 0 ) * oPaging.SIZE, oPaging.SIZE );
	}

	var docPerson;
	for ( catNewEmployee in xarrNewEmployees )
	{
		obj = new Object();

		obj.id = catNewEmployee.id.Value;
		obj.fullname = catNewEmployee.fullname.Value;
		obj.position_name = catNewEmployee.position_name.Value;
		obj.hire_date = catNewEmployee.hire_date.Value;
		obj.hire_date_str = StrDate(catNewEmployee.hire_date.Value);
		obj.image = catNewEmployee.pict_url.Value;
		obj.link = tools_web.get_mode_clean_url( null, obj.id  );

		docPerson = tools.open_doc( obj.id );
		obj.desc = docPerson != undefined ? docPerson.TopElem.desc : "";

		oRes.array.push( obj );
	}

	return oRes;
}

/**
 * @typedef {Object} oMetricPerson
 * @memberof Websoft.WT.Staff
 * @property {string} sSex – Пол сотрудника
 * @property {string} sAge – Возраст сотрудника
 * @property {boolean} isBitrhday – В указанной окрестности текущей даты - день рожденья сотрудника
 * @property {int} iTutorTotalAdaptationNum – Количество адаптаций, где сотрудник - наставник
 * @property {int} iTutorPlanAdaptationNum – Количество адаптаций в статусе "Планируется", где сотрудник - наставник
 * @property {int} iTutorActiveAdaptationNum – Количество адаптаций в статусе "В работе", где сотрудник - наставник
 * @property {int} iTutorPassedAdaptationNum – Количество адаптаций в статусе "Завершено успешно", где сотрудник - наставник
 * @property {int} iTutorFailedAdaptationNum – Количество адаптаций в статусе "Завершено не успешно", где сотрудник - наставник
 * @property {boolean} isSuccessor – Сотрудник является актуальным преемникаом
 * @property {string} sGrageName – Наименование грейда сотрудника
 * @property {int} iGrageLevel – Уровень грейда сотрудника
 * @property {string} sGrageLevelDesc – Описание уровня грейда сотрудника
 * @property {bigint} iWorkingConditionID – ID условий труда
 * @property {bigint} iResumeID – ID Резюме
 * @property {boolean} isAdapatationTutor – Сотрудник - наставник в адаптациях
 * @property {boolean} isCareerReserveTutor – Сотрудник - наставник в прочих этапах развития карьеры
 * @property {string} name
 * @property {string} min_wage
 * @property {string} max_wage
 * @property {string} currency_type_id
 * @property {string} employment_type_id
 * @property {string} schedule_work_id
 * @property {string} education_type_id
 * @property {string} profession_id
 * @property {string} exp_years
 * @property {string} academic_degree
 * @property {string} academic_heading
 * @property {string} main_lng
 * @property {string} phone
 * @property {string} work_phone
 * @property {string} mobile_phone
 * @property {string} email
 * @property {string} location_id
 * @property {string} address
 * @property {string} exist_adaptation - проходит ли сотрудник адаптацию
 * @property {int} complete_adaptation_count - число адаптаций со статусами Завершено успешно и Завершено неуспешно
 * @property {int} typical_developmend_program_count - общее количество типовых программ развития, которые соответствуют сотруднику
*/
/**
 * @function GetCollaboratorContext
 * @memberof Websoft.WT.Staff
 * @author BG AKH
 * @description Рассчет объектной метрики (контекста) сотрудника.
 * @param {bigint} PersonIDParam - ID текущего или указанного сотрудника, для которого определяются метрики
 * @param {string[]} arrCaclulateParam - перечень атрибутов, которые будут вычисляться
 * @param {bigint} iApplicationID - ID приложения
 * @returns {oMetricPerson}
*/
function GetCollaboratorContext(PersonIDParam, arrCaclulateParam, iApplicationID)
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {};

	var iPersonID = OptInt(PersonIDParam);
	if(iPersonID == undefined)
	{
		oRes.error = 501;
		oRes.errorText = StrReplace("Передан некорректный ID [{PARAM1}]", "{PARAM1}", PersonIDParam);
		return oRes;
	}

	var arrFields = [
		"name",
		"min_wage",
		"max_wage",
		"currency_type_id",
		"education_type_id",
		"employment_type_id",
		"schedule_work_id",
		"schedule_id",
		"profession_id",
		"exp_years",
		"willingness_travel_type_id",
		"is_willing_relocate",
		"relocate_name",
		"academic_degree",
		"academic_heading",
		"main_lng",
		"phone",
		"work_phone",
		"mobile_phone",
		"email",
		"location_id",
		"address"
	];

	var libParam = tools.get_params_code_library('libStaff');
	try
	{
		var bCalcPersonInherent = (ArrayOptFind(arrCaclulateParam, "This == 'inherent'") != undefined);
		var bCalcPersonBirthday = (ArrayOptFind(arrCaclulateParam, "This == 'birthday'") != undefined);
		var bCalcPersonTutors = (ArrayOptFind(arrCaclulateParam, "This == 'tutor'") != undefined);
		var bCalcPersonSuccessors = (ArrayOptFind(arrCaclulateParam, "This == 'successor'") != undefined);
		var bCalcPersonGrade = (ArrayOptFind(arrCaclulateParam, "This == 'grade'") != undefined);
		var bCalcPersonWorkCondition = (ArrayOptFind(arrCaclulateParam, "This == 'working_condition'") != undefined);
		var bCalcPersonResume = (ArrayOptFind(arrCaclulateParam, "This == 'resume'") != undefined);
		var bCalcTutoring = (ArrayOptFind(arrCaclulateParam, "This == 'tutoring'") != undefined);
		var bCalcPersonAdaptation = (ArrayOptFind(arrCaclulateParam, "This == 'adaptation'") != undefined);
		var bCalcPersonCareerRoutes = (ArrayOptFind(arrCaclulateParam, "This == 'career_routes'") != undefined);
		var bCalcPersonPersonnelDoc = (ArrayOptFind(arrCaclulateParam, "This == 'personnel_document'") != undefined);

		var bCalcInherent = (bCalcPersonBirthday || bCalcPersonGrade || bCalcPersonInherent);

		if(bCalcInherent)
		{
			var docPerson = tools.open_doc(iPersonID);
			var tePerson = docPerson.TopElem;

			if(tePerson.Name != "collaborator")
				throw StrReplace(StrReplace("Переданный ID ({PARAM1}) не является ID сотрудника: [{PARAM2}]", "{PARAM1}", PersonIDParam), "{PARAM2}", teCareerPlan.Name);
		}

		if ( bCalcPersonBirthday )
		{
			var sSex;
			switch( tePerson.sex.Value )
			{
				case "w":
				{
					sSex = "женщина";
					break;
				}
				case "m":
				{
					sSex = "мужчина";
					break;
				}
				default:
				{
					sSex = ms_tools.get_const( "netdannyh" );
				}
			}

			oRes.context.SetProperty( "sSex", sSex );

			if ( tePerson.birth_date.HasValue )
			{
				var dBirthDate = OptDate( tePerson.birth_date.Value );
				var iAge = Year( Date() ) - Year( dBirthDate );

				if ( DateDiff( Date(), Date( Year( Date() ), Month( dBirthDate ), Day( dBirthDate ) ) ) < 0 )
					iAge -= 1;

				var sAgeSuffix = tools.call_code_library_method( "libMain", "GetNumSuffix", [ iAge, "year" ] );

				oRes.context.SetProperty( "sAge", iAge + sAgeSuffix );
			}
			else
			{
				oRes.context.SetProperty( "sAge", ms_tools.get_const( "netdannyh" ) );
			}
		}

		if(bCalcPersonBirthday)
		{
			var iDaysBefore = libParam.GetOptProperty("iCongratDaysBefore", 1);
			var iDaysAfter = libParam.GetOptProperty("iBDCongatDaysAfter", 5);

			// *** isBitrhday
			var dPersonBirthdayDate = OptDate(tePerson.birth_date.Value);
			if(dPersonBirthdayDate != undefined)
			{
				var curPersonBirthdayDate = OptDate(Year(Date()), Month(dPersonBirthdayDate), Day(dPersonBirthdayDate));
				var curDateDiffDays = DateDiff(curPersonBirthdayDate, DateNewTime(Date()))/84600;
				oRes.context.SetProperty("isBitrhday", ((curDateDiffDays + iDaysAfter) >= 0 && (curDateDiffDays - iDaysBefore) <= 0));
			}
		}

		if(bCalcPersonTutors)
		{
			var iTutorID = ArrayOptFirstElem(tools.xquery("for $elem in boss_types where $elem/code='talent_pool_tutor' return $elem"), {id:tools.get_default_object_id('boss_type','talent_pool_tutor')}).id;

			var sReqAdaptation = "for $elem in career_reserves where $elem/position_type='adaptation' and some $fm in talent_pool_func_managers satisfies ($elem/id=$fm/object_id and $fm/person_id=" + iPersonID + " and $fm/boss_type_id=" + iTutorID + ") return $elem";
			var xqAdaptation = tools.xquery(sReqAdaptation);

			oRes.context.SetProperty("iTutorTotalAdaptationNum", ArrayCount(xqAdaptation));
			oRes.context.SetProperty("iTutorPlanAdaptationNum", ArrayCount(ArraySelect(xqAdaptation, "This.status == 'plan'")));
			oRes.context.SetProperty("iTutorActiveAdaptationNum", ArrayCount(ArraySelect(xqAdaptation, "This.status == 'active'")));
			oRes.context.SetProperty("iTutorPassedAdaptationNum", ArrayCount(ArraySelect(xqAdaptation, "This.status == 'passed'")));
			oRes.context.SetProperty("iTutorFailedAdaptationNum", ArrayCount(ArraySelect(xqAdaptation, "This.status == 'failed'")));
		}

		if(bCalcPersonSuccessors)
		{
			var sReqSuccessor = "for $elem in successors where $elem/person_id=" + iPersonID + " and $elem/status='approved' return $elem";
			var xqSuccessor = tools.xquery(sReqSuccessor);
			oRes.context.SetProperty("isSuccessor", (ArrayOptFirstElem(xqSuccessor) != undefined));
		}

		if(bCalcPersonGrade)
		{
			if(tePerson.grade_id.HasValue)
			{
				var docGrade = tools.open_doc(tePerson.grade_id.Value);
				if(docGrade != undefined)
				{
					var teGrade = docGrade.TopElem;
					oRes.context.SetProperty("sGrageName", teGrade.name.Value);
					oRes.context.SetProperty("iGrageLevel", OptInt(teGrade.level.Value, 0));
					oRes.context.SetProperty("sGrageLevelDesc", teGrade.desc.Value);
				}
			}
		}

		if(bCalcPersonWorkCondition)
		{
			var sReqWorkCondition = "for $elem in working_conditions where $elem/person_id = " + iPersonID + " and $elem/is_model != true() and $elem/state_id = 'active' and ($elem/start_date = null() or $elem/start_date <= " + XQueryLiteral(Date()) + ") and ($elem/finish_date = null() or $elem/finish_date >= " + XQueryLiteral(Date()) + ") return $elem";
			var catWorkCondition = ArrayOptFirstElem(tools.xquery(sReqWorkCondition));
			if(catWorkCondition != undefined)
			{
				oRes.context.SetProperty("iWorkingConditionID", catWorkCondition.id.Value);
			}
		}

		if(bCalcPersonResume)
		{
			for ( _field in arrFields )
			{
				oRes.context.SetProperty( _field, ms_tools.get_const( "netdannyh" ) );
			}
			
			var sReqResume = "for $elem in resumes where $elem/person_id = " + iPersonID + " and $elem/is_archive  != true() return $elem";
			var catResume = ArrayOptFirstElem(tools.xquery(sReqResume));
			if(catResume != undefined)
			{
				oRes.context.SetProperty("iResumeID", catResume.id.Value);
				var arrParams = resume_params(catResume.id.Value, null, arrFields);
				for (_param in arrParams)
				{
					oRes.context.SetProperty(_param.name, _param.display_value);
				}
			}
		}

		if(bCalcTutoring)
		{
			var sReqTutors = "for $elem in career_reserves where some $fm in talent_pool_func_managers satisfies ($fm/object_id = $elem/id and $fm/catalog = 'career_reserve' and $fm/person_id = " + iPersonID + " ) order by $elem/position_type return $elem/Fields('id','position_type')";
			
			var arrCareerReseves = ArrayDirect(tools.xquery(sReqTutors));
			var iSum = ArrayCount(arrCareerReseves);
			var iNumAdaptation = ArrayCount(ArraySelectBySortedKey(arrCareerReseves, "adaptation", "position_type"))
			oRes.context.SetProperty("isAdapatationTutor", (iNumAdaptation > 0));
			oRes.context.SetProperty("isCareerReserveTutor", ((iSum - iNumAdaptation) > 0));
		}
		
		if(bCalcPersonAdaptation)
		{
			var sReqCareerReserve = "for $elem in career_reserves where $elem/person_id = " + iPersonID + " and $elem/position_type = 'adaptation' return $elem";
			xarrCareerReserve = tools.xquery(sReqCareerReserve);

			arrActiveCareerReserve = ArraySelect(xarrCareerReserve, 'This.status == "active"');
			oRes.context.SetProperty("exist_adaptation", ArrayOptFirstElem(arrActiveCareerReserve) != undefined ? 'Да' : 'Нет');

			arrCompleteAdaptation = ArraySelect(xarrCareerReserve, 'This.status == "passed" || This.status == "failed"');
			oRes.context.SetProperty("complete_adaptation_count", ArrayCount(arrCompleteAdaptation));

			Result = get_person_development_program_count( iPersonID, iApplicationID );

			oRes.context.SetProperty("ext_typical_developmend_program_count", Result.context.ext_typical_developmend_program_count);
			oRes.context.SetProperty("int_typical_developmend_program_count", Result.context.int_typical_developmend_program_count);
			oRes.context.SetProperty("any_typical_developmend_program_count", Result.context.any_typical_developmend_program_count);
			oRes.context.SetProperty("typical_developmend_program_count", Result.context.typical_developmend_program_count);	
		}

		if(bCalcPersonCareerRoutes)
		{
			var sReqCareerPlan = "for $elem in career_plans where $elem/object_id = " + iPersonID + " and $elem/object_type = 'collaborator' return $elem";
			xarrCareerPlan = tools.xquery(sReqCareerPlan);
			oRes.context.SetProperty("career_routes_count", ArrayCount(xarrCareerPlan));
			
			oRes.context.SetProperty("active_routes_count", ArrayCount(ArraySelect(xarrCareerPlan, "This.status == 'active'")));
			oRes.context.SetProperty("failed_routes_count", ArrayCount(ArraySelect(xarrCareerPlan, "This.status == 'failed'")));
			oRes.context.SetProperty("passed_routes_count", ArrayCount(ArraySelect(xarrCareerPlan, "This.status == 'passed'")));
			
			if ( OptInt(iApplicationID) != undefined )
			{
				teApplication = tools_app.get_cur_application(OptInt(iApplicationID));

				if (teApplication != null)
				{
					if ( teApplication.wvars.GetOptChildByKey( 'request_type' ) != undefined )
					{
						iReqTypeID = (OptInt( teApplication.wvars.GetOptChildByKey( 'request_type' ).value, 0 ));
						
						var sReqRequest = "for $elem in requests where $elem/person_id = " + iPersonID + " and $elem/request_type_id = " + iReqTypeID + " return $elem";
						xarrRequest = tools.xquery(sReqRequest);
						
						oRes.context.SetProperty("request_count", ArrayCount(xarrRequest));
						oRes.context.SetProperty("active_request_count", ArrayCount(ArraySelect(xarrRequest, "This.status_id == 'active'")));
						oRes.context.SetProperty("close_request_count", ArrayCount(ArraySelect(xarrRequest, "This.status_id == 'close'")));
						oRes.context.SetProperty("ignore_request_count", ArrayCount(ArraySelect(xarrRequest, "This.status_id == 'ignore'")));
					}
				}
			}
		}
		
		if (bCalcPersonPersonnelDoc)
		{
			var sReqPersonnelDocuments = "for $elem in personnel_documents where $elem/person_id = " + iPersonID + " return $elem";
			xarrPersonnelDocuments = tools.xquery(sReqPersonnelDocuments);
			oRes.context.SetProperty("personnel_documents_count", ArrayCount(xarrPersonnelDocuments));
			oRes.context.SetProperty("active_personnel_documents_count", ArrayCount(ArraySelect(xarrPersonnelDocuments, "This.state_id == 'active'")));
			oRes.context.SetProperty("project_personnel_documents_count", ArrayCount(ArraySelect(xarrPersonnelDocuments, "This.state_id == 'project'")));
			oRes.context.SetProperty("process_personnel_documents_count", ArrayCount(ArraySelect(xarrPersonnelDocuments, "This.state_id == 'process'")));
			oRes.context.SetProperty("annul_personnel_documents_count", ArrayCount(ArraySelect(xarrPersonnelDocuments, "This.state_id == 'annul'")));
			oRes.context.SetProperty("cancel_personnel_documents_count", ArrayCount(ArraySelect(xarrPersonnelDocuments, "This.state_id == 'cancel'")));
		}

		return oRes;
	}
	catch ( err )
	{
		oRes.error = 501;
		oRes.errorText = err;
		return oRes;
	}
}

/**
 * @typedef {Object} oDevelopmentProgramCount
 * @memberof Websoft.WT.Staff
 * @property {int} ext_typical_developmend_program_count - Число типовых программ развития для внешнего перемещения
 * @property {int} int_typical_developmend_program_count - Число типовых программ развития для внутреннего перемещения
 * @property {int} any_typical_developmend_program_count - Число типовых программ развития для любого перемещения
 * @property {int} typical_developmend_program_count - Общее число типовых программ развития (сумма предыдущих)
*/
/**
 * @function get_person_development_program_count
 * @memberof Websoft.WT.Staff
 * @author AKH
 * @description Количество типовых программ развития по сотруднику.
 * @param {bigint} iPersonID - ID сотрудника, для которого определяются метрики
 * @param {bigint} iApplicationID - ID приложения для доступа к параметрам external_depth, internal_depth
 * @returns {oDevelopmentProgramCount}
*/
function get_person_development_program_count( iPersonID, iApplicationID)
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {};

	arrExtDevelopmentProgram = [];
	arrIntDevelopmentProgram = [];
	arrAnyDevelopmentProgram = [];
	xarrPositions = XQuery("for $elem in positions where $elem/basic_collaborator_id = " + iPersonID + " return $elem/Fields('id','position_common_id','position_family_id','parent_object_id','basic_collaborator_id')");
	if (ArrayOptFirstElem(xarrPositions) != undefined)
	{
		for (_position in xarrPositions)
		{
			_position_common_id = OptInt(_position.position_common_id, 0);
			_basic_collaborator_id = OptInt(_position.basic_collaborator_id, 0);
			_position_subdivision_id = OptInt(_position.parent_object_id, 0);

			if ( _position_common_id != 0 && _basic_collaborator_id != 0 && _position_subdivision_id != 0)
			{
				tePositionCommon = tools.open_doc(_position_common_id).TopElem;
				tePerson = tools.open_doc(_position.basic_collaborator_id).TopElem;
				
				iApplicationID = OptInt(iApplicationID);
				if (iApplicationID != undefined)
				{
					var teApplication = tools_app.get_application(iApplicationID);

					external_depth = OptInt( teApplication.wvars.GetOptChildByKey( 'external_depth' ).value, 0 ) * 86400;
					internal_depth = OptInt( teApplication.wvars.GetOptChildByKey( 'internal_depth' ).value, 0 ) * 86400;

					if ( DateDiff(Date(), Date(tePerson.hire_date)) < external_depth )
					{
						arrExtDevelopmentProgramPosition = ArraySelect(tePositionCommon.typical_development_programs, "job_transfer_type_id == 'ext'")
						arrExtDevelopmentProgram = ArrayUnion(arrExtDevelopmentProgram, arrExtDevelopmentProgramPosition);

						arrPositionFamilys = ArraySelectAll(tePositionCommon.position_familys);
						for (_family in arrPositionFamilys)
						{
							docPositionFamily = tools.open_doc(_family.position_family_id);
							tePositionFamily = docPositionFamily.TopElem;
							arrExtDevelopmentProgramFamily = ArraySelect(tePositionFamily.typical_development_programs, "job_transfer_type_id == 'ext'")
							arrExtDevelopmentProgram = ArrayUnion(arrExtDevelopmentProgram, arrExtDevelopmentProgramFamily);
						}

						xarrSubdivisionsGroup = XQuery("for $elem in subdivision_group_subdivisions where $elem/subdivision_id = " + _position_subdivision_id + " return $elem/Fields('subdivision_group_id')");
						for (_el in xarrSubdivisionsGroup)
						{
							teSubdivisionGroup = tools.open_doc(_el.subdivision_group_id).TopElem;
							arrExtDevelopmentProgramSubdivision = ArraySelect(teSubdivisionGroup.typical_development_programs, "job_transfer_type_id == 'ext'")
							arrExtDevelopmentProgram = ArrayUnion(arrExtDevelopmentProgram, arrExtDevelopmentProgramSubdivision)
						}
					}

					if ( DateDiff(Date(), Date(tePerson.position_date)) < internal_depth && DateDiff(Date(), Date(tePerson.hire_date)) > external_depth)
					{
						arrIntDevelopmentProgramPosition = ArraySelect(tePositionCommon.typical_development_programs, "job_transfer_type_id == 'int'")
						arrIntDevelopmentProgram = ArrayUnion(arrIntDevelopmentProgram, arrIntDevelopmentProgramPosition);

						arrPositionFamilys = ArraySelectAll(tePositionCommon.position_familys);
						for (_family in arrPositionFamilys)
						{
							docPositionFamily = tools.open_doc(_family.position_family_id);
							tePositionFamily = docPositionFamily.TopElem;
							arrIntDevelopmentProgramFamily = ArraySelect(tePositionFamily.typical_development_programs, "job_transfer_type_id == 'int'")
							arrIntDevelopmentProgram = ArrayUnion(arrIntDevelopmentProgram, arrIntDevelopmentProgramFamily);
						}

						xarrSubdivisionsGroup = XQuery("for $elem in subdivision_group_subdivisions where $elem/subdivision_id = " + _position_subdivision_id + " return $elem/Fields('subdivision_group_id')");
						for (_el in xarrSubdivisionsGroup)
						{
							teSubdivisionGroup = tools.open_doc(_el.subdivision_group_id).TopElem;
							arrIntDevelopmentProgramSubdivision = ArraySelect(teSubdivisionGroup.typical_development_programs, "job_transfer_type_id == 'int'")
							arrIntDevelopmentProgram = ArrayUnion(arrIntDevelopmentProgram, arrIntDevelopmentProgramSubdivision)
						}
					}

					if ( DateDiff(Date(), Date(tePerson.position_date)) < internal_depth || DateDiff(Date(), Date(tePerson.hire_date)) < external_depth )
					{
						arrAnyDevelopmentProgramPosition = ArraySelect(tePositionCommon.typical_development_programs, "job_transfer_type_id == 'any'")
						arrAnyDevelopmentProgram = ArrayUnion(arrAnyDevelopmentProgram, arrAnyDevelopmentProgramPosition);

						arrPositionFamilys = ArraySelectAll(tePositionCommon.position_familys);
						for (_family in arrPositionFamilys)
						{
							docPositionFamily = tools.open_doc(_family.position_family_id);
							tePositionFamily = docPositionFamily.TopElem;
							arrAnyDevelopmentProgramFamily = ArraySelect(tePositionFamily.typical_development_programs, "job_transfer_type_id == 'any'")
							arrAnyDevelopmentProgram = ArrayUnion(arrAnyDevelopmentProgram, arrAnyDevelopmentProgramFamily);
						}

						xarrSubdivisionsGroup = XQuery("for $elem in subdivision_group_subdivisions where $elem/subdivision_id = " + _position_subdivision_id + " return $elem/Fields('subdivision_group_id')");
						for (_el in xarrSubdivisionsGroup)
						{
							teSubdivisionGroup = tools.open_doc(_el.subdivision_group_id).TopElem;
							arrAnyDevelopmentProgramSubdivision = ArraySelect(teSubdivisionGroup.typical_development_programs, "job_transfer_type_id == 'any'")
							arrAnyDevelopmentProgram = ArrayUnion(arrAnyDevelopmentProgram, arrAnyDevelopmentProgramSubdivision)
						}
					}

				}
			}
		}

		arrExtDevelopmentProgram = ArraySelectDistinct(arrExtDevelopmentProgram, 'typical_development_program_id');
		arrIntDevelopmentProgram = ArraySelectDistinct(arrIntDevelopmentProgram, 'typical_development_program_id');
		arrAnyDevelopmentProgram = ArraySelectDistinct(arrAnyDevelopmentProgram, 'typical_development_program_id');

		iCountExtDevelopmentProgram = ArrayCount(arrExtDevelopmentProgram);
		iCountIntDevelopmentProgram = ArrayCount(arrIntDevelopmentProgram);
		iCountAnyDevelopmentProgram = ArrayCount(arrAnyDevelopmentProgram);
		iCountAllProgram = iCountExtDevelopmentProgram + iCountIntDevelopmentProgram + iCountAnyDevelopmentProgram;

		oRes.context.SetProperty("ext_typical_developmend_program_count", iCountExtDevelopmentProgram);
		oRes.context.SetProperty("int_typical_developmend_program_count", iCountIntDevelopmentProgram)
		oRes.context.SetProperty("any_typical_developmend_program_count", iCountAnyDevelopmentProgram)
		oRes.context.SetProperty("typical_developmend_program_count", iCountAllProgram)
	}

	return oRes
}

/**
 * @typedef {Object} oRequirement
 * @property {bigint} id – ID требования.
 * @property {string} type – Код типа требования.
 * @property {bigint} type_name – Наименование типа требования.
 * @property {string} name – Наименование требования.
 * @property {int} checked – Соответствие требованию. 1 - соответствует, 0 - не соответствует
 * @property {string} check_comment – Сообщение о соответствии требованию.
 * @property {string} activity_name – Наименование активности.
 * @property {string} activity_url – Ссылка на прохождение активности.
*/
/**
 * @typedef {Object} oCheckRequirement
 * @memberof Websoft.WT.Staff
 * @property {boolean} done_checked – Все проверки пройдены
 * @property {oRequirement[]} requirements – Массив требований.
*/
/**
 * @function GetPositionCommomRequirements
 * @memberof Websoft.WT.Staff
 * @author BG
 * @description Коллекция требований в типовой должности.
 * @param {bigint} iPositionCommonID - ID типовой должности
 * @param {XmElem?} tePositionCommon - TopElem типовой должности
 * @param {bigint} iPersonID - ID сотрудника, для котоого проверяются требования
 * @param {boolean} bStrongObligatory - Проверять только обязательные параметры
 * @returns {oCheckRequirement}
*/
function GetPositionCommomRequirements(iPositionCommonIDParam, tePositionCommon, iPersonIDParam, bStrongObligatory)
{
	if(bStrongObligatory == null || bStrongObligatory == undefined)
		bStrongObligatory = true;
	else
		bStrongObligatory = tools_web.is_true(bStrongObligatory);

	var iPersonID = OptInt(iPersonIDParam);
	if(iPersonID == undefined)
		throw StrReplace("Передан некорректный ID сотрудника: [{PARAM!}]", "{PARAM!}", iPersonIDParam);
	var xqPerson = ArrayOptFirstElem(tools.xquery("for $elem in collaborators where $elem/id = " + iPersonID + " return $elem/Fields('birth_date','position_date','hire_date')"));
	if(xqPerson == undefined)
		throw StrReplace("Не найден сотрудник с указанным ID: [{PARAM!}]", "{PARAM!}", iPersonIDParam);

	try
	{
		if(tePositionCommon.Name != 'position_common')
			throw 'fck'

		var iPositionCommonID = tePositionCommon.id.Value;
	}
	catch(e)
	{
		var iPositionCommonID = OptInt(iPositionCommonIDParam);
		if(iPositionCommonID == undefined)
			throw StrReplace("Передан некорректный ID типовой должности: [{PARAM!}]", "{PARAM!}", iPositionCommonIDParam);

		var docPositionCommon = tools.open_doc(iPositionCommonID);
		if(docPositionCommon == undefined)
			throw StrReplace("Не найдена типовая должность с указанным ID: [{PARAM!}]", "{PARAM!}", iPositionCommonID);

		tePositionCommon = docPositionCommon.TopElem;
	}

	function diff_in_month(dDateStart, dDateEnd)
	{
		return (Year(dDateEnd)-Year(dDateStart))*12 + (Month(dDateEnd)-Month(dDateStart));
	}

	var libMain = tools.get_code_library( "libMain" );

	var bCheck = true;
	var arrCheck = [];

	// Возраст
	var iAgeMin = OptInt(tePositionCommon.age_min.Value, null);
	var iAgeMax = OptInt(tePositionCommon.age_max.Value, null);
	if(xqPerson.birth_date.HasValue && (iAgeMin != null || iAgeMax != null))
	{
		var dBirthDate = Date(xqPerson.birth_date.Value);
		var iAge = Year(Date())-Year(dBirthDate);
		if(DateDiff(Date(), Date(Year(Date()), Month(dBirthDate), Day(dBirthDate))) < 0)
				iAge -= 1;
		var sAgeSuffix = tools.call_code_library_method( libMain, "GetNumSuffix", [ iAge, "year" ] );

		var oCheck = {id: tools_web.get_md5_id("age" + iPersonID + iPositionCommonID), type: "age", type_name: "Возраст", name: "Возраст", checked: 1, s_checked: 'Соответствует', check_comment:"Соответствует требованиям", activity_name: "", activity_url:""};
		if(iAgeMin != null && iAge < iAgeMin)
		{
			oCheck.checked = 0;
			oCheck.s_checked = "Не соответствует";
			oCheck.check_comment = "Возраст менее требуемого. (" + iAge + sAgeSuffix + ", требуется более " + tePositionCommon.age_min.Value + ")";
			bCheck = false;
		}

		if(iAgeMax != null && iAge > iAgeMax)
		{
			oCheck.checked = 0;
			oCheck.s_checked = "Не соответствует";
			oCheck.check_comment = "Возраст превышает требуемый. (" + iAge + sAgeSuffix + ", требуется менее " + tePositionCommon.age_max.Value + ")";
			bCheck = false;
		}
		arrCheck.push(oCheck);
	}

	// Стаж в компании
	var iExpYear, iExpMonth, iExpTargetYear, iExpTargetMonth;
	var sExpYearSuffix, sExpMonthSuffix, sExpTargetYearSuffix, sExpTargetMonthSuffix;
	var iExpInCompany = OptInt(tePositionCommon.experience_in_company.Value, null)
	if(iExpInCompany != null && xqPerson.hire_date.HasValue)
	{
		oCheck = {id: tools_web.get_md5_id("experience_in_company" + iPersonID + iPositionCommonID), type: "experience", type_name: "Стаж", name: "Стаж в компании", checked: 1, s_checked: 'Соответствует', check_comment:"Соответствует требованиям", activity_name: "", activity_url:""};
		var iExperience = diff_in_month(Date(xqPerson.hire_date.Value), Date());
		if(iExperience < iExpInCompany)
		{
			oCheck.checked = 0;
			oCheck.s_checked = "Не соответствует";
			iExpYear = iExperience / 12;
			iExpMonth = iExperience % 12;
			iExpTargetYear = tePositionCommon.experience_in_company.Value / 12;
			iExpTargetMonth = tePositionCommon.experience_in_company.Value % 12;
			sExpYearSuffix = tools.call_code_library_method( libMain, "GetNumSuffix", [ iExpYear, "year" ] );
			sExpMonthSuffix = tools.call_code_library_method( libMain, "GetNumSuffix", [ iExpMonth, "month" ] );
			sExpTargetYearSuffix = tools.call_code_library_method( libMain, "GetNumSuffix", [ iExpTargetYear, "year" ] );
			sExpTargetMonthSuffix = tools.call_code_library_method( libMain, "GetNumSuffix", [ iExpTargetMonth, "month" ] );
			oCheck.check_comment = "Стаж работы в компании меньше требуемого. (" + iExpYear + sExpYearSuffix + (iExpMonth > 0 ? " " + iExpMonth + sExpMonthSuffix : "") + ", требуется более чем " + iExpTargetYear + sExpTargetYearSuffix + (iExpTargetMonth > 0 ? " " + iExpTargetMonth + sExpTargetMonthSuffix : "") + ")";
			bCheck = false;
		}
		arrCheck.push(oCheck);
	}

	// Стаж на должности
	var iExpInPosition = OptInt(tePositionCommon.experience_in_current_position.Value, null);
	if(iExpInPosition != null && (xqPerson.position_date.HasValue || xqPerson.hire_date.HasValue))
	{
		oCheck = {id: tools_web.get_md5_id("experience_in_current_position" + iPersonID + iPositionCommonID), type: "experience", type_name: "Стаж", name: "Стаж на текущей должности", checked: 1, s_checked: 'Соответствует', check_comment:"Соответствует требованиям", activity_name: "", activity_url:""};
		var dExperienceDate = xqPerson.position_date.HasValue ? xqPerson.position_date.Value : xqPerson.hire_date.Value;
		iExperience = diff_in_month(Date(dExperienceDate), Date());
		if(iExperience < iExpInPosition)
		{
			oCheck.checked = 0;
			oCheck.s_checked = "Не соответствует";
			iExpYear = iExperience / 12;
			iExpMonth = iExperience % 12;
			iExpTargetYear = tePositionCommon.experience_in_current_position.Value / 12;
			iExpTargetMonth = tePositionCommon.experience_in_current_position.Value % 12;
			sExpYearSuffix = tools.call_code_library_method( libMain, "GetNumSuffix", [ iExpYear, "year" ] );
			sExpMonthSuffix = tools.call_code_library_method( libMain, "GetNumSuffix", [ iExpMonth, "month" ] );
			sExpTargetYearSuffix = tools.call_code_library_method( libMain, "GetNumSuffix", [ iExpTargetYear, "year" ] );
			sExpTargetMonthSuffix = tools.call_code_library_method( libMain, "GetNumSuffix", [ iExpTargetMonth, "month" ] );
			oCheck.check_comment = "Стаж работы на текущей должности меньше требуемого. (" + iExpYear + sExpYearSuffix + (iExpMonth > 0 ? " " + iExpMonth + sExpMonthSuffix : "") + ", требуется более " + iExpTargetYear + sExpTargetYearSuffix + (iExpTargetMonth > 0 ? " " + iExpTargetMonth + sExpTargetMonthSuffix : "") + ")";
			bCheck = false;
		}
		arrCheck.push(oCheck);
	}

	var arrRequireCollectionRecords, arrRequireds, sReqItems;

	// Сертификаты
	arrRequireCollectionRecords = bStrongObligatory ? ArraySelect(tePositionCommon.certificate_types, "tools_web.is_true(This.obligatory)") : tePositionCommon.certificate_types;
	if(ArrayOptFirstElem(arrRequireCollectionRecords) != undefined)
	{
		arrRequireds = tools.xquery("for $elem in certificate_types where MatchSome($elem/id, (" + ArrayMerge(arrRequireCollectionRecords, "This.certificate_type_id.Value", ",") + ") ) return $elem")
		for(itemRequire in arrRequireds)
		{
			oCheck = {id: itemRequire.id.Value, type: "certificate", type_name: "Сертификат", name: itemRequire.name.Value, checked: 1, s_checked: 'Соответствует', check_comment:"Соответствует требованиям", activity_name: "", activity_url:""};
			sReqItems = "for $elem in certificates where $elem/type_id = " + itemRequire.id.Value + " and $elem/person_id = " + iPersonID + " and $elem/valid = true() and ( $elem/delivery_date = null() or $elem/delivery_date <= " + XQueryLiteral(Date()) + " ) and ( $elem/expire_date = null() or $elem/expire_date >= " + XQueryLiteral(Date()) + " ) return $elem";
			if(ArrayOptFirstElem(tools.xquery(sReqItems)) == undefined)
			{
				oCheck.checked = 0;
				oCheck.s_checked = "Не соответствует";
				oCheck.check_comment = "Сертификат данного типа отсутствует";
				oCheck.activity_name = itemRequire.name.Value;
				oCheck.activity_url = tools_web.get_mode_clean_url( null, itemRequire.id.Value );
				bCheck = false;
			}
			arrCheck.push(oCheck);
		}
	}

	// Модульные программы
	arrRequireCollectionRecords = bStrongObligatory ? ArraySelect(tePositionCommon.compound_programs, "tools_web.is_true(This.obligatory)") : tePositionCommon.compound_programs;
	if(ArrayOptFirstElem(arrRequireCollectionRecords) != undefined)
	{
		arrRequireds = tools.xquery("for $elem in compound_programs where MatchSome($elem/id, (" + ArrayMerge(arrRequireCollectionRecords, "This.compound_program_id.Value", ",") + ") ) return $elem")
		for(itemRequire in arrRequireds)
		{
			oCheck = {id: itemRequire.id.Value, type: "compound_program", type_name: "Модульная программа", name: itemRequire.name.Value, checked: 1, s_checked: 'Соответствует', check_comment:"Соответствует требованиям", activity_name: "", activity_url:""};
			sReqItems = "for $elem in education_plans where $elem/type = 'collaborator' and MatchSome($elem/state_id, (2,4,5) ) and $elem/compound_program_id = " + itemRequire.id.Value + " and $elem/person_id = " + iPersonID + " return $elem";
			if(ArrayOptFirstElem(tools.xquery(sReqItems)) == undefined)
			{
				oCheck.checked = 0;
				oCheck.s_checked = "Не соответствует";
				oCheck.check_comment = "Отсутствует пройденный учебный план";
				oCheck.activity_name = itemRequire.name.Value;
				oCheck.activity_url = tools_web.get_mode_clean_url( null, itemRequire.id.Value );
				bCheck = false;
			}
			arrCheck.push(oCheck);
		}
	}

	// Учебные программы
	arrRequireCollectionRecords = bStrongObligatory ? ArraySelect(tePositionCommon.education_methods, "tools_web.is_true(This.obligatory)") : tePositionCommon.education_methods;
	if(ArrayOptFirstElem(arrRequireCollectionRecords) != undefined)
	{
		arrRequireds = tools.xquery("for $elem in education_methods where $elem/type = 'org' and MatchSome($elem/id, (" + ArrayMerge(arrRequireCollectionRecords, "This.education_method_id.Value", ",") + ") ) return $elem")
		for(itemRequire in arrRequireds)
		{
			oCheck = {id: itemRequire.id.Value, type: "education_method", type_name: "Учебная программа (очная)", name: itemRequire.name.Value, checked: 1, s_checked: 'Соответствует', check_comment:"Соответствует требованиям", activity_name: "", activity_url:""};
			sReqItems = "for $evr in event_results where some $event in events satisfies ($event/id = $evr/event_id and $event/education_method_id = " + itemRequire.id.Value + ") and $evr/is_assist = true() and $evr/person_id = " + iPersonID + " return $evr";
			if(ArrayOptFirstElem(tools.xquery(sReqItems)) == undefined)
			{
				oCheck.checked = 0;
				oCheck.s_checked = "Не соответствует";
				oCheck.activity_name = itemRequire.name.Value;
				oCheck.activity_url = tools_web.get_mode_clean_url( null, itemRequire.id.Value );
				oCheck.check_comment = "Отсутствует посещение мероприятия по учебной программе";
				bCheck = false;
			}

			arrCheck.push(oCheck);
		}
	}

	// Курсы
	arrRequireCollectionRecords = bStrongObligatory ? ArraySelect(tePositionCommon.education_methods, "tools_web.is_true(This.obligatory)") : tePositionCommon.education_methods;
	if(ArrayOptFirstElem(arrRequireCollectionRecords) != undefined)
	{
		arrRequireds = tools.xquery("for $elem in education_methods where $elem/type = 'course' and $elem/state_id = 'active' and some $cours in courses satisfies ($cours/id = $elem/course_id and MatchSome($cours/status, ('publish','secret') ) ) and MatchSome($elem/id, (" + ArrayMerge(arrRequireCollectionRecords, "This.education_method_id.Value", ",") + ") ) return $elem")
		for(itemRequire in arrRequireds)
		{
			oCheck = {id: itemRequire.id.Value, type: "course", type_name: "Электронный курс", name: itemRequire.name.Value, checked: 1, s_checked: 'Соответствует', check_comment:"Соответствует требованиям", activity_name: "", activity_url:""};
			sReqItems = "for $elem in learnings where some $em in education_methods satisfies ($em/id = " + itemRequire.id.Value + " and $em/course_id = $elem/course_id) and $elem/state_id = 4 and $elem/person_id = " + iPersonID + " return $elem";
			if(ArrayOptFirstElem(tools.xquery(sReqItems)) == undefined)
			{
				oCheck.checked = 0;
				oCheck.s_checked = "Не соответствует";
				oCheck.check_comment = "Отсутствует успешно пройденный курс";
				oCheck.activity_name = itemRequire.name.Value;
				oCheck.activity_url = tools_web.get_mode_clean_url( null, itemRequire.id.Value );
				bCheck = false;
			}
			arrCheck.push(oCheck);
		}
	}

	// Тесты
	//arrRequireCollectionRecords = bStrongObligatory ? ArraySelect(tePositionCommon.assessments, "tools_web.is_true(This.obligatory)") : tePositionCommon.assessments;
	if(!bStrongObligatory)
	{
		arrRequireCollectionRecords = tePositionCommon.assessments;
		if(ArrayOptFirstElem(arrRequireCollectionRecords) != undefined)
		{
			arrRequireds = tools.xquery("for $elem in assessments where MatchSome($elem/id, (" + ArrayMerge(arrRequireCollectionRecords, "This.assessment_id.Value", ",") + ") ) and MatchSome($elem/status, ('publish','secret') ) return $elem")
			for(itemRequire in arrRequireds)
			{
				oCheck = {id: itemRequire.id.Value, type: "assessment", type_name: "Тест", name: itemRequire.title.Value, checked: 1, s_checked: 'Соответствует', check_comment:"Соответствует требованиям", activity_name: "", activity_url:""};
				sReqItems = "for $elem in test_learnings where some $asm in assessments satisfies ($asm/id = " + itemRequire.id.Value + " and $asm/id = $elem/assessment_id ) and $elem/state_id = 4 and $elem/person_id = " + iPersonID + " return $elem"
				if(ArrayOptFirstElem(tools.xquery(sReqItems)) == undefined)
				{
					oCheck.checked = 0;
					oCheck.s_checked = "Не соответствует";
					oCheck.check_comment = "Отсутствует успешно пройденный тест";
					oCheck.activity_name = itemRequire.title.Value;
					oCheck.activity_url = tools_web.get_mode_clean_url( null, itemRequire.id.Value );
					bCheck = false;
				}
				arrCheck.push(oCheck);
			}
		}
	}

	// Квалификации
	arrRequireCollectionRecords = bStrongObligatory ? ArraySelect(tePositionCommon.qualifications, "tools_web.is_true(This.obligatory)") : tePositionCommon.qualifications;
	if(ArrayOptFirstElem(arrRequireCollectionRecords) != undefined)
	{
		arrRequireds = tools.xquery("for $elem in qualifications where MatchSome($elem/id, (" + ArrayMerge(arrRequireCollectionRecords, "This.qualification_id.Value", ",") + ") ) return $elem")
		for(itemRequire in arrRequireds)
		{
			oCheck = {id: itemRequire.id.Value, type: "qualification", type_name: "Квалификация", name: itemRequire.name.Value, checked: 1, s_checked: 'Соответствует', check_comment:"Соответствует требованиям", activity_name: "", activity_url:""};
			sReqItems = "for $elem in qualification_assignments where $elem/status = 'assigned' and ( $elem/assignment_date = null() or $elem/assignment_date <= " + XQueryLiteral(Date()) + " ) and ( $elem/expiration_date = null() or $elem/expiration_date >= " + XQueryLiteral(Date()) + " ) and $elem/qualification_id = " + itemRequire.id.Value + " and $elem/person_id = " + iPersonID + " return $elem"
			if(ArrayOptFirstElem(tools.xquery(sReqItems)) == undefined)
			{
				oCheck.checked = 0;
				oCheck.s_checked = "Не соответствует";
				oCheck.check_comment = "Отсутствует актуальная присвоенная квалификация";
				oCheck.activity_name = itemRequire.name.Value;
				oCheck.activity_url = tools_web.get_mode_clean_url( null, itemRequire.id.Value );
				bCheck = false;
			}
			arrCheck.push(oCheck);
		}
	}

	// Материалы библиотеки
	arrRequireCollectionRecords = bStrongObligatory ? ArraySelect(tePositionCommon.recomended_library_materials, "tools_web.is_true(This.obligatory)") : tePositionCommon.recomended_library_materials;
	if(ArrayOptFirstElem(arrRequireCollectionRecords) != undefined)
	{
		arrRequireds = tools.xquery("for $elem in library_materials where MatchSome($elem/id, (" + ArrayMerge(arrRequireCollectionRecords, "This.material_id.Value", ",") + ") ) return $elem")
		for(itemRequire in arrRequireds)
		{
			oCheck = {id: itemRequire.id.Value, type: "library_material", type_name: "Материал библиотеки", name: itemRequire.name.Value, checked: 1, s_checked: 'Соответствует', check_comment:"Соответствует требованиям", activity_name: "", activity_url:""};
			sReqItems = "for $elem in library_material_viewings where $elem/material_id = " + itemRequire.id.Value + " and $elem/person_id = " + iPersonID + " and $elem/state_id = 'finished' return $elem";
			if(ArrayOptFirstElem(tools.xquery(sReqItems)) == undefined)
			{
				oCheck.checked = 0;
				oCheck.s_checked = "Не соответствует";
				oCheck.check_comment = "Отсутствует завершенный просмотр материала библиотеки";
				oCheck.activity_name = itemRequire.name.Value;
				oCheck.activity_url = tools_web.get_mode_clean_url( null, itemRequire.id.Value );
				bCheck = false;
			}
			arrCheck.push(oCheck);
		}
	}

	// КПЭ
	arrRequireCollectionRecords = bStrongObligatory ? ArraySelect(tePositionCommon.kpi_profiles, "tools_web.is_true(This.obligatory)") : tePositionCommon.kpi_profiles;
	if(ArrayOptFirstElem(arrRequireCollectionRecords) != undefined)
	{
//		arrRequireds = tools.xquery("for $elem in kpi_profiles where MatchSome($elem/id, (" + ArrayMerge(arrRequireCollectionRecords, "This.id.Value", ",") + ") ) return $elem");
		arrRequireds = arrRequireCollectionRecords
//		var rAvgOverall, arrPAs;
		var teKPIProfile, rKPIValue, bCurCheck, sCurCheck;
		for(itemRequire in arrRequireds)
		{

/*
			oCheck = {id: itemRequire.id.Value, type: "kpi", type_name: "Профиль KPI", name: itemRequire.name.Value, checked: 1, s_checked: 'Соответствует', check_comment:"Соответствует требованиям", activity_name: "", activity_url:""};
			sReqItems = "for $elem in pas where $elem/is_done = true() and $elem/assessment_appraise_type = 'activity_appraisal' and $elem/kpi_profile_id = " + itemRequire.id.Value + " and $elem/person_id = " + iPersonID + " return $elem";
			arrPAs = tools.xquery(sReqItems);
			if(ArrayOptFirstElem(arrPAs) == undefined)
			{
				oCheck.checked = 0;
				oCheck.s_checked = "Не соответствует";
				oCheck.check_comment = "Отсутствуют оценки по профилю КПЭ";
				bCheck = false;
			}
			else
			{
				rAvgOverall = Real(ArraySum(arrPAs, "This.overall.Value"))/Real(ArrayCount(arrPAs));
				if(rAvgOverall < 80)
				{
					oCheck.checked = 0;
					oCheck.s_checked = "Не соответствует";
					oCheck.check_comment = "Оценка по профилю КПЭ ниже требуемой";
					bCheck = false;
				}
			}
*/
			teKPIProfile = tools.open_doc(itemRequire.id.Value).TopElem;
			oCheck = {id: itemRequire.id.Value, type: "kpi", type_name: "Профиль KPI", name: teKPIProfile.name.Value, checked: 1, s_checked: 'Соответствует', check_comment:"Соответствует требованиям", activity_name: "", activity_url:""};
			bCurCheck = true;
			sCurCheck = "";
			for(itemKPI in teKPIProfile.kpis)
			{
				rKPIValue = tools.call_code_library_method("libKPI", "CalculateKPIValue", [ itemKPI.kpi_id.Value, iPersonID, itemKPI.plan.Value ] );
				if(rKPIValue < 1.0)
				{
					bCurCheck = false;
					sCurCheck += 'КПЭ "' + itemKPI.kpi_id.ForeignDispName + '": ' + StrReal(rKPIValue, 2) + ', требуется не менее 1.0<br>\r\n';
				}
			}

			if(!bCurCheck)
			{
				oCheck.checked = 0;
				oCheck.s_checked = "Не соответствует";
				oCheck.check_comment = "Один или несколько КПЭ в профиле ниже требуемого:<br>\r\n" + sCurCheck;
				bCheck = false;
			}
			arrCheck.push(oCheck);
		}
	}

	var oRet = {
		done_checked: bCheck,
		requirements: arrCheck
	};

	return oRet;
}
/**
 * @typedef {Object} oMetricPositionCommon
 * @memberof Websoft.WT.Staff
 * @property {string} code – код типовой должности
 * @property {string} name – название типовой должности
 * @property {int} position_count – число должностей, отнесенных к данной типовой должности
 * @property {int} typical_development_program_count - общее количество типовых программ
 * @property {int} typical_development_program_any_count - общее число типовых программ в требованиях с типом назначения Любое перемещение
 * @property {int} typical_development_program_ext_count - общее число типовых программ в требованиях с типом назначения Внешнее перемещение
 * @property {int} typical_development_program_int_count - общее число типовых программ в требованиях с типом назначения Внутреннее перемещение
 * @property {int} position_familys_count - количество семейств, в которые входит типовая должность
*/

/**
 * @function GetPositionCommonContext
 * @memberof Websoft.WT.Staff
 * @author BG
 * @description Рассчет объектной метрики (контекста) типовой должности.
 * @param {bigint} iPositionCommonIDParam - ID типовой должности, для которого определяются метрики
 * @param {bigint} iCurUserID - ID текущего сотрудника
 * @param {string} iApplicationID - ID приложения lля которого вычисляется контекст
 * @returns {oMetricPositionCommon}
*/
function GetPositionCommonContext(iPositionCommonIDParam, iCurUserID, iApplicationID)
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {};

	var iPositionCommonID = OptInt(iPositionCommonIDParam);
	if(iPositionCommonID == undefined)
	{
		oRes.error = 501;
		oRes.errorText = StrReplace("Передан некорректный ID [{PARAM1}]", "{PARAM1}", iPositionCommonIDParam);
		return oRes;
	}
	var docPositionCommon = tools.open_doc(iPositionCommonID);
	if(docPositionCommon == undefined)
	{
		oRes.error = 501;
		oRes.errorText = StrReplace("Не найдена типовая должность с ID [{PARAM1}]", "{PARAM1}", iPositionCommonID);
		return oRes;
	}
	var tePositionCommon = docPositionCommon.TopElem;
	if(tePositionCommon.Name != "position_common")
	{
		oRes.error = 502;
		oRes.errorText = StrReplace(StrReplace("Объект с ID [{PARAM1}] не является типовой должностью: {PARAM2}", "{PARAM1}", iPositionCommonID), tePositionCommon.Name);
		return oRes;
	}

	oRes.context.SetProperty("code", tePositionCommon.code.Value);
	oRes.context.SetProperty("name", tePositionCommon.name.Value);

	var arrConds = [];
	arrConds.push("$elem/position_common_id = " + iPositionCommonID);

	var iApplLevel = tools.call_code_library_method( "libApplication", "GetPersonApplicationAccessLevel", [ iCurUserID, iApplicationID ] );
	if(iApplLevel == 5)
	{
		var iAppHRManagerTypeID = tools.call_code_library_method("libApplication", "GetApplicationHRBossTypeID", [ iApplicationID, iCurUserID ])
		var arrSubordPositionID = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, 'position', null, '', true, true, true, true, (iAppHRManagerTypeID == null ? [] : [iAppHRManagerTypeID]) ] );
		arrConds.push("MatchSome($elem/id, (" + ArrayMerge(arrSubordPositionID, "This", ",") + "))");
	}
	if(iApplLevel == 1)
	{
		var arrSubordPositionID = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, 'position', null, '', true, true, true, true, [] ] );
		arrConds.push("MatchSome($elem/id, (" + ArrayMerge(arrSubordPositionID, "This", ",") + "))");
	}

	var sConds = (ArrayOptFirstElem(arrConds) != undefined) ? " where " + ArrayMerge(arrConds, "This", " and ") : "";
	var sReqPosition = "for $elem in positions" + sConds + " return $elem";
	var arrPosition = tools.xquery(sReqPosition);

	oRes.context.SetProperty("position_count", ArrayCount(arrPosition));
	oRes.context.SetProperty("typical_development_program_count", ArrayCount(tePositionCommon.typical_development_programs));
	oRes.context.SetProperty("typical_development_program_any_count", ArrayCount(ArraySelectByKey(tePositionCommon.typical_development_programs, 'any', 'job_transfer_type_id')));
	oRes.context.SetProperty("typical_development_program_ext_count", ArrayCount(ArraySelectByKey(tePositionCommon.typical_development_programs, 'ext', 'job_transfer_type_id')));
	oRes.context.SetProperty("typical_development_program_int_count", ArrayCount(ArraySelectByKey(tePositionCommon.typical_development_programs, 'int', 'job_transfer_type_id')));
	oRes.context.SetProperty("position_familys_count", ArrayCount(tePositionCommon.position_familys));



	return oRes;
}


/**
 * @typedef {Object} oSkillsResume
 * @memberof Websoft.WT.Staff
 * @property {bigint} id
 * @property {string} name
 * @property {bigint} parent_id
 * @property {string} level_id
 * @property {string} level_name
*/
/**
 * @function GetSkillsResume
 * @memberof Websoft.WT.Staff
 * @description Навыки из резюме.
 * @param {bigint} iResumeID - ID резюме, для которого определяются метрики
 * @returns {oSkillsResume}
*/
function GetSkillsResume( iResumeID )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];

	try
	{
		iResumeID = Int( iResumeID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Не указан ID резюме";
		return oRes;
	}

	arrResumeSkills = ArraySelectAll(XQuery("for $elem in resume_skills where $elem/resume_id = " + iResumeID + " return $elem"));

	for (_resume in arrResumeSkills)
	{
		oSkill = ArrayOptFirstElem(XQuery("for $elem in skills where $elem/id = " + OptInt(_resume.skill_id) + " and $elem/parent_id != null() return $elem"));
		if (oSkill != undefined)
		{
			_skills = {};
			_skills.id = _resume.skill_id.Value;
			_skills.name = _resume.skill_name.Value;
			_skills.parent_id = oSkill.parent_id.Value;
			_skills.level_id = _resume.level_id.Value;

			arrLevels = OpenDoc( UrlFromDocID( _resume.skill_id_with_levels ) ).TopElem.levels;

			if (_resume.level_id != '')
				_skills.level_name = String(ArrayOptFindByKey ( arrLevels, _skills.level_id, 'id' ).name);
			else
				_skills.level_name = '';

			oRes.array.push( _skills )
		}

	}

	return oRes;
}

/**
 * @typedef {Object} oLangsResume
 * @memberof Websoft.WT.Staff
 * @property {bigint} id - ID языка
 * @property {string} name - Наименование языка
 * @property {string} level - ID уровня владения
 * @property {string} level_name - Наименование уровня владения
*/
/**
 * @function GetLangsResume
 * @memberof Websoft.WT.Staff
 * @description Языки из резюме.
 * @param {bigint} iResumeID - ID резюме, для которого определяются метрики
 * @returns {oLangsResume}
*/
function GetLangsResume( iResumeID )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];

	try
	{
		iResumeID = Int( iResumeID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Не указан ID резюме";
		return oRes;
	}

	docResume = tools.open_doc(iResumeID);
	if (docResume != undefined)
	{
		for (_resume in docResume.TopElem.lngs)
		{
			_lngName = ArrayOptFindByKey(common.languages, _resume.lng_id, 'id').name;
			_lngLevelName = ArrayOptFindByKey(common.language_levels, _resume.level, 'id').name;

			_langs = {};

			_langs.id = _resume.lng_id.Value;
			_langs.name = _lngName.Value;
			_langs.level = _resume.level.Value;
			_langs.level_name = _lngLevelName.Value;

			oRes.array.push( _langs )
		}
	}

	return oRes;

}


/**
 * @typedef {Object} oEducationResume
 * @memberof Websoft.WT.Staff
 * @property {bigint} id
 * @property {string} name - Название
 * @property {bigint} education_type_id - ID типа образования
 * @property {string} education_type_name - Наименование типа образования
 * @property {string} form - Форма обучения
 * @property {string} mode - Способ получения образования
 * @property {string} date - Год окончания
 * @property {string} professional_area_id - Специальность по диплому
 * @property {string} specialisation - Обучающая организация, факультет
 * @property {string} result - Результат/диплом/степень
 * @property {string} site - URL сайта обучающей организации
 * @property {string} comment - Комментарий
*/
/**
 * @function GetEducationResume
 * @memberof Websoft.WT.Staff
 * @description Образование из резюме.
 * @param {bigint} iResumeID - ID резюме, для которого определяются метрики
 * @returns {oEducationResume}
*/
function GetEducationResume(iResumeID)
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];

	try
	{
		iResumeID = Int( iResumeID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Не указан ID резюме";
		return oRes;
	}

	arrResumeEducations = tools.open_doc(iResumeID).TopElem.educations;

	for (_educ in arrResumeEducations)
	{
		_educations = {};
		_educations.id = _educ.id.Value;
		_educations.name = _educ.name.Value;
		_educations.education_type_id = _educ.education_type_id.Value;

		oEducTypeName = ArrayOptFirstElem(XQuery("for $elem in education_types where $elem/id = " + OptInt(_educ.education_type_id) + " return $elem/Fields('name')"));
		_educations.education_type_name = (oEducTypeName != undefined) ? String(oEducTypeName.name) : '';

		oFormName = ArrayOptFirstElem(XQuery("for $elem in education_forms where $elem/id = " + OptInt(_educ.form) + " return $elem/Fields('name')"));
		_educations.form = (oFormName != undefined) ? String(oFormName.name) : '';

		oEducMode = ArrayOptFirstElem(XQuery("for $elem in education_modes where $elem/id = " + OptInt(_educ.mode) + " return $elem/Fields('name')"));
		_educations.mode = (oEducMode != undefined) ? String(oEducMode.name) : '';

		_educations.date = _educ.date.Value;

		oProfArea = ArrayOptFirstElem(XQuery("for $elem in professional_areas where $elem/id = " + OptInt(_educ.professional_area_id) + " return $elem/Fields('name')"));
		_educations.professional_area_id = (oProfArea != undefined) ? String(oProfArea.name) : '';;

		_educations.specialisation = _educ.specialisation.Value;
		_educations.result = _educ.result.Value;
		_educations.site = _educ.site.Value;
		_educations.comment = _educ.comment.Value;

		oRes.array.push( _educations )
	}

	return oRes;
}

/**
 * @typedef {Object} oWorkExperienceResume
 * @memberof Websoft.WT.Staff
 * @property {bigint} id
 * @property {string} start_date - Начало работы
 * @property {string} finish_date - Окончание работы
 * @property {string} org_name - Название организации
 * @property {bigint} profession_id - ID профессиональной области
 * @property {string} profession_name - Наименование профессиональной области
 * @property {bigint} region_id - ID региона
 * @property {string} region_name - Наименование региона
 * @property {string} org_phone - Рабочий телефон организации
 * @property {string} org_fax - Факс организации
 * @property {string} org_email - Email организации
 * @property {string} org_address - Адрес организации
 * @property {string} org_site - URL сайта организации
 * @property {string} position_name - Занимаемая должность
 * @property {string} desc - Описание
 * @property {string} comment - Комментарий
*/
/**
 * @function GetWorkExperienceResume
 * @memberof Websoft.WT.Staff
 * @description Образование из резюме.
 * @param {bigint} iResumeID - ID резюме, для которого определяются метрики
 * @returns {oWorkExperienceResume}
*/
function GetWorkExperienceResume( iResumeID )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];

	try
	{
		iResumeID = Int( iResumeID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Не указан ID резюме";
		return oRes;
	}

	arrWorkExperience = tools.open_doc(iResumeID).TopElem.work_experiences;

	for (_exp in arrWorkExperience)
	{
		_experiences = {};

		_experiences.id = _exp.id.Value;
		_experiences.start_date = String(Month(_exp.start_date.Value) + '.' + Year(_exp.start_date.Value));
		_experiences.finish_date = String(Month(_exp.finish_date.Value) + '.' + Year(_exp.finish_date.Value));
		_experiences.org_name = _exp.org_name.Value;

		_experiences.profession_id = _exp.profession_id.Value;
		oProfName = ArrayOptFirstElem(XQuery("for $elem in professional_areas where $elem/id = " + OptInt(_exp.profession_id, 0) + " return $elem/Fields('name')"));
		_experiences.profession_name = (oProfName != undefined) ? String(oProfName.name) : '';

		_experiences.region_id = _exp.region_id.Value;
		oRegionName = ArrayOptFirstElem(XQuery("for $elem in regions where $elem/id = " + OptInt(_exp.region_id, 0) + " return $elem/Fields('name')"));
		_experiences.region_name = (oRegionName != undefined) ? String(oRegionName.name) : '';

		_experiences.org_phone = _exp.org_phone.Value;
		_experiences.org_fax = _exp.org_fax.Value;
		_experiences.org_email = _exp.org_email.Value;
		_experiences.org_address = _exp.org_address.Value;
		_experiences.org_site = _exp.org_site.Value;
		_experiences.position_name = _exp.position_name.Value;
		_experiences.desc = _exp.desc.Value;
		_experiences.comment = _exp.comment.Value;

		oRes.array.push( _experiences )
	}

	return oRes;
}

/**
 * @typedef {Object} oMetricPositionFamily
 * @memberof Websoft.WT.Staff
 * @property {string} code – код семейства должностей
 * @property {string} name – название семейства должностей
 * @property {int} position_common_count – число типовых должностей в требованиях к семейству
 * @property {int} typical_development_program_count - общее количество типовых программ
 * @property {int} typical_development_program_any_count - общее число типовых программ в требованиях с типом назначения Любое перемещение
 * @property {int} typical_development_program_ext_count - общее число типовых программ в требованиях с типом назначения Внешнее перемещение
 * @property {int} typical_development_program_int_count - общее число типовых программ в требованиях с типом назначения Внутреннее перемещение
*/

/**
 * @function GetPositionFamilyContext
 * @memberof Websoft.WT.Staff
 * @author AKh
 * @description Рассчет объектной метрики (контекста) семейства должностей.
 * @param {bigint} iPositionFamilyIDParam - ID семейства должностей, для которого определяются метрики
 * @returns {oMetricPositionFamily}
*/
function GetPositionFamilyContext(iPositionFamilyIDParam)
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {};

	var iPositionFamilyID = OptInt(iPositionFamilyIDParam);
	if(iPositionFamilyID == undefined)
	{
		oRes.error = 501;
		oRes.errorText = StrReplace("Передан некорректный ID [{PARAM1}]", "{PARAM1}", iPositionFamilyIDParam);
		return oRes;
	}
	var docPositionFamily = tools.open_doc(iPositionFamilyID);
	if(docPositionFamily == undefined)
	{
		oRes.error = 501;
		oRes.errorText = StrReplace("Не найдено семейство должностей с ID [{PARAM1}]", "{PARAM1}", iPositionFamilyID);
		return oRes;
	}
	var tePositionFamily = docPositionFamily.TopElem;
	if(tePositionFamily.Name != "position_family")
	{
		oRes.error = 502;
		oRes.errorText = StrReplace(StrReplace("Объект с ID [{PARAM1}] не является семейством должностей: {PARAM2}", "{PARAM1}", iPositionFamilyID), tePositionFamily.Name);
		return oRes;
	}

	oRes.context.SetProperty("code", tePositionFamily.code.Value);
	oRes.context.SetProperty("name", tePositionFamily.name.Value);

	var sReqPositionCommon = "for $elem in position_commons where contains ($elem/position_familys, " + iPositionFamilyID + ") return $elem";
	var arrPositionCommon = tools.xquery(sReqPositionCommon);

	oRes.context.SetProperty("position_common_count", ArrayCount(arrPositionCommon));
	oRes.context.SetProperty("typical_development_program_count", ArrayCount(tePositionFamily.typical_development_programs));
	oRes.context.SetProperty("typical_development_program_any_count", ArrayCount(ArraySelectByKey(tePositionFamily.typical_development_programs, 'any', 'job_transfer_type_id')));
	oRes.context.SetProperty("typical_development_program_ext_count", ArrayCount(ArraySelectByKey(tePositionFamily.typical_development_programs, 'ext', 'job_transfer_type_id')));
	oRes.context.SetProperty("typical_development_program_int_count", ArrayCount(ArraySelectByKey(tePositionFamily.typical_development_programs, 'int', 'job_transfer_type_id')));

	return oRes;
}

/**
 * @typedef {Object} oMetricPosition
 * @memberof Websoft.WT.Staff
 * @property {string} code – код должности
 * @property {string} name – название должности
 * @property {int} position_family_count – число семейств должностей, в которые входит типовая должность, к которой относится данная должность
 * @property {int} group_subdivision_count - число групп подразделений, в которые входит подразделение, к которому относится данная должность
 * @property {int} typical_development_program_count - общее количество типовых программ развития
 * @property {int} typical_development_program_any_count - общее число типовых программ развития со способом назначения Любое перемещение. Считается как сумма программ развития с этим способом назначения, указанных в требованиях к типовой должности (к которой относится должность), к семействам должностей (к которым относится типовая должность) и к группам подразделений (к которым относится подразделение должности)
 * @property {int} typical_development_program_ext_count - общее число типовых программ с типом назначения Внешнее перемещение.
 * @property {int} typical_development_program_int_count - общее число типовых программ с типом назначения Внутреннее перемещение
*/

/**
 * @function GetPositionContext
 * @memberof Websoft.WT.Staff
 * @author AKh
 * @description Рассчет объектной метрики (контекста) должности.
 * @param {bigint} iPositionIDParam - ID должности, для которого определяются метрики
 * @returns {oMetricPosition}
*/
function GetPositionContext(iPositionIDParam)
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {};

	var iPositionID = OptInt(iPositionIDParam);
	if(iPositionID == undefined)
	{
		oRes.error = 501;
		oRes.errorText = StrReplace("Передан некорректный ID [{PARAM1}]", "{PARAM1}", iPositionIDParam);
		return oRes;
	}
	var docPosition = tools.open_doc(iPositionID);
	if(docPosition == undefined)
	{
		oRes.error = 501;
		oRes.errorText = StrReplace("Не найдена должность с ID [{PARAM1}]", "{PARAM1}", iPositionID);
		return oRes;
	}
	var tePosition = docPosition.TopElem;
	if(tePosition.Name != "position")
	{
		oRes.error = 502;
		oRes.errorText = StrReplace(StrReplace("Объект с ID [{PARAM1}] не является должностью: {PARAM2}", "{PARAM1}", iPositionID), tePosition.Name);
		return oRes;
	}

	oRes.context.SetProperty("code", tePosition.code.Value);
	oRes.context.SetProperty("name", tePosition.name.Value);

	position_family_count = 0;
	group_subdivision_count = 0;
	typical_development_program_count = 0;
	typical_development_program_any_count = 0;
	typical_development_program_ext_count = 0;
	typical_development_program_int_count = 0;

	//position_family_count
	iPositionCommonID = OptInt(tePosition.position_common_id, 0);
	if (iPositionCommonID > 0)
	{
		xarrPositionCommon = tools.xquery("for $elem in position_commons where $elem/id = " + iPositionCommonID + " return $elem");
		sPositionFamilys = ArrayOptFirstElem(xarrPositionCommon).position_familys;
		arrPositionFamilys = String(sPositionFamilys).split(';');
		position_family_count += ArrayCount(arrPositionFamilys);

		tePositionCommon = tools.open_doc(iPositionCommonID).TopElem;
		typical_development_program_count += ArrayCount(tePositionCommon.typical_development_programs);
		typical_development_program_any_count += ArrayCount(ArraySelectByKey(tePositionCommon.typical_development_programs, 'any', 'job_transfer_type_id'));
		typical_development_program_ext_count += ArrayCount(ArraySelectByKey(tePositionCommon.typical_development_programs, 'ext', 'job_transfer_type_id'));
		typical_development_program_int_count += ArrayCount(ArraySelectByKey(tePositionCommon.typical_development_programs, 'int', 'job_transfer_type_id'));


		for(_position_family in arrPositionFamilys)
		{
			tePositionFamily = tools.open_doc(_position_family).TopElem;
			typical_development_program_count += ArrayCount(tePositionFamily.typical_development_programs);
			typical_development_program_any_count += ArrayCount(ArraySelectByKey(tePositionFamily.typical_development_programs, 'any', 'job_transfer_type_id'));
			typical_development_program_ext_count += ArrayCount(ArraySelectByKey(tePositionFamily.typical_development_programs, 'ext', 'job_transfer_type_id'));
			typical_development_program_int_count += ArrayCount(ArraySelectByKey(tePositionFamily.typical_development_programs, 'int', 'job_transfer_type_id'));
		}
	}

	//group_subdivision_count
	iSubdivisionID = OptInt(tePosition.parent_object_id, 0);
	if (iSubdivisionID > 0)
	{
		xarrSubdivisionGroups = tools.xquery("for $elem in subdivision_group_subdivisions where $elem/subdivision_id = " + iSubdivisionID + " return $elem");
		group_subdivision_count += ArrayCount(xarrSubdivisionGroups);

		if (ArrayOptFirstElem(xarrSubdivisionGroups) != undefined)
		{
			for (_sub_group in xarrSubdivisionGroups)
			{
				teSubdivisionGroup = tools.open_doc(_sub_group.subdivision_group_id).TopElem;
				typical_development_program_count += ArrayCount(teSubdivisionGroup.typical_development_programs);
				typical_development_program_any_count += ArrayCount(ArraySelectByKey(teSubdivisionGroup.typical_development_programs, 'any', 'job_transfer_type_id'));
				typical_development_program_ext_count += ArrayCount(ArraySelectByKey(teSubdivisionGroup.typical_development_programs, 'ext', 'job_transfer_type_id'));
				typical_development_program_int_count += ArrayCount(ArraySelectByKey(teSubdivisionGroup.typical_development_programs, 'int', 'job_transfer_type_id'));
			}
		}

	}

	oRes.context.SetProperty("position_family_count", position_family_count);
	oRes.context.SetProperty("group_subdivision_count", group_subdivision_count);
	oRes.context.SetProperty("typical_development_program_count", typical_development_program_count);
	oRes.context.SetProperty("typical_development_program_any_count", typical_development_program_any_count);
	oRes.context.SetProperty("typical_development_program_ext_count", typical_development_program_ext_count);
	oRes.context.SetProperty("typical_development_program_int_count", typical_development_program_int_count);

	return oRes;
}

/**
 * @typedef {Object} oMetricGroupSubdivision
 * @memberof Websoft.WT.Staff
 * @property {string} code – код группы подразделений
 * @property {string} name – название группы подразделений
 * @property {int} subdivision_count –  число подразделений в группе
 * @property {int} typical_development_program_count - общее количество типовых программ
 * @property {int} typical_development_program_any_count - общее число типовых программ в требованиях с типом назначения Любое перемещение
 * @property {int} typical_development_program_ext_count - общее число типовых программ в требованиях с типом назначения Внешнее перемещение
 * @property {int} typical_development_program_int_count - общее число типовых программ в требованиях с типом назначения Внутреннее перемещение
*/

/**
 * @function GetGroupSubdivisionContext
 * @memberof Websoft.WT.Staff
 * @author AKh
 * @description Рассчет объектной метрики (контекста) группы подразделений.
 * @param {bigint} iGroupSubdivisionIDParam - ID семейства должностей, для которого определяются метрики
 * @returns {oMetricGroupSubdivision}
*/
function GetGroupSubdivisionContext(iGroupSubdivisionIDParam)
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {};

	var iGroupSubdivisionID = OptInt(iGroupSubdivisionIDParam);
	if(iGroupSubdivisionID == undefined)
	{
		oRes.error = 501;
		oRes.errorText = StrReplace("Передан некорректный ID [{PARAM1}]", "{PARAM1}", iGroupSubdivisionIDParam);
		return oRes;
	}
	var docGroupSubdivision = tools.open_doc(iGroupSubdivisionID);
	if(docGroupSubdivision == undefined)
	{
		oRes.error = 501;
		oRes.errorText = StrReplace("Не найдена группа подразделений с ID [{PARAM1}]", "{PARAM1}", iGroupSubdivisionID);
		return oRes;
	}
	var teGroupSubdivision = docGroupSubdivision.TopElem;
	if(teGroupSubdivision.Name != "subdivision_group")
	{
		oRes.error = 502;
		oRes.errorText = StrReplace(StrReplace("Объект с ID [{PARAM1}] не является группой подразделений: {PARAM2}", "{PARAM1}", iGroupSubdivisionID), teGroupSubdivision.Name);
		return oRes;
	}

	oRes.context.SetProperty("code", teGroupSubdivision.code.Value);
	oRes.context.SetProperty("name", teGroupSubdivision.name.Value);

	oRes.context.SetProperty("subdivision_count", ArrayCount(teGroupSubdivision.subdivisions));
	oRes.context.SetProperty("typical_development_program_count", ArrayCount(teGroupSubdivision.typical_development_programs));
	oRes.context.SetProperty("typical_development_program_any_count", ArrayCount(ArraySelectByKey(teGroupSubdivision.typical_development_programs, 'any', 'job_transfer_type_id')));
	oRes.context.SetProperty("typical_development_program_ext_count", ArrayCount(ArraySelectByKey(teGroupSubdivision.typical_development_programs, 'ext', 'job_transfer_type_id')));
	oRes.context.SetProperty("typical_development_program_int_count", ArrayCount(ArraySelectByKey(teGroupSubdivision.typical_development_programs, 'int', 'job_transfer_type_id')));

	return oRes;
}


/**
 * @function DeleteTutor
 * @memberof Websoft.WT.Staff
 * @description Удаление наставника.
 * @param {bigint[]} arrTutorIDs - Массив ID наставников, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteTutor( arrTutorIDs ){

	var oRes = tools.get_code_library_result_object();
	oRes.count = 0;

	if(!IsArray(arrTutorIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrTutorIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "tutor")
	{
		oRes.error = 503;
		oRes.errorText = "Массив не является массивом ID наставников";
		return oRes;
	}

	for(itemTutorID in arrTutorIDs)
	{
		try
		{
			iTutorID = OptInt(itemTutorID);

			sSQL = "for $elem in tutors where MatchSome( $elem/id, (" + XQueryLiteral(iTutorID) + ") ) return $elem/Fields('person_id')"
			sPersonID = ArrayOptFirstElem(ArrayExtract(tools.xquery(sSQL), "This.person_id.Value"));

			sSQL = "for $elem in talent_pool_func_managers where $elem/catalog = 'career_reserve' and MatchSome( $elem/person_id, (" + sPersonID + ") ) and $elem/is_native = false() return $elem"
			sCareerReserveID = ArrayOptFirstElem(tools.xquery(sSQL));

			if(sCareerReserveID == undefined){
				DeleteDoc( UrlFromDocID( OptInt(iTutorID)), false);
				oRes.count++;
			}
		}
		catch(err)
		{
			toLog("ERROR: DeleteTutors: " + ("[" + itemTutorID + "]\r\n") + err, true);
		}
	}

	return oRes;
}


/**
 * @function DeleteCareerReserve
 * @memberof Websoft.WT.Staff
 * @description Удаление развитие карьеры.
 * @param {bigint[]} arrTutorIDs - Массив ID записей развития карьеры, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteCareerReserve( arrCareerReserveIDs ){
	var oRes = tools.get_code_library_result_object();
	oRes.count = 0;

	if(!IsArray(arrCareerReserveIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrCareerReserveIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "career_reserve")
	{
		oRes.error = 503;
		oRes.errorText = "Массив не является массивом ID наставников";
		return oRes;
	}

	for(itemCareerReserveID in arrCareerReserveIDs)
	{
		try
		{
			iCareerReserveID = OptInt(itemCareerReserveID);

			sSQL = "for $elem in career_reserves where MatchSome( $elem/id, (" + XQueryLiteral(iCareerReserveID) + ") ) return $elem/Fields('id')"
			sCareerReserveID = ArrayOptFirstElem(ArrayExtract(tools.xquery(sSQL), "This.id.Value"));

			if(sCareerReserveID != undefined){
				DeleteDoc( UrlFromDocID( OptInt(iCareerReserveID)), false);
				oRes.count++;
			}
		}
		catch(err)
		{
			toLog("ERROR: DeleteCareerReserves: " + ("[" + itemCareerReserveID + "]\r\n") + err, true);
		}
	}

	return oRes;
}

/**
 * @typedef {Object} oVacancyResponse
 * @property {bigint} id
 * @property {string} name
 * @property {string} status
 * @property {string} status_name
 * @property {date} response_date
 * @property {date} invitation_date
 * @property {string} link
*/
/**
 * @typedef {Object} VacancyResponsesReturn
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {oVacancyResponse[]} array – массив
*/
/**
 * @function GetVacanciesResponses
 * @memberof Websoft.WT.Staff
 * @description Получение списка откликов текущего пользователя.
 * @author AZ
 * @param {bigint} [iPersonID] - ID сотрудника/кандидата.
 * @param {string[]} arrDistincts - перечень полей для формирования дополнительных списков для виджета фильтров
 * @param {oSimpleFilterElem[]} arrFilters - набор фильтров
 * @param {oSort} oSort - Информация из рантайма о сортировке
 * @param {oPaging} oPaging - Информация из рантайма о пейджинге
 * @returns {VacancyResponsesReturn}
*/

function GetVacanciesResponses( iPersonID, arrDistincts, arrFilters, oSort, oPaging )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];
	oRes.paging = oPaging;
	oRes.data = {};

	var arrXQueryConditions = new Array();

	try
	{
		if ( iPersonID == null )
			throw ''
		else
			iPersonID = Int( iPersonID );
			arrXQueryConditions.push( "$elem/person_id = " + iPersonID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID сотрудника/кандидата";
		return oRes;
	}

	try
	{
		if ( ! IsArray( arrFilters ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		arrFilters = new Array();
	}

	for ( oFilter in arrFilters )
	{
		if ( oFilter.type == 'search' && ( sSearch == undefined || sSearch == '' ) )
		{
			if ( oFilter.value != '' )
				arrXQueryConditions.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )" );
		}
		else if ( oFilter.type == 'select' )
		{
			switch ( oFilter.id )
			{
				case 'status':
				{
					if ( ArrayOptFind( oFilter.value, "This.value != ''" ) != undefined )
					{
						arrXQueryConditions.push( "MatchSome( $elem/status, ( '" + ArrayMerge( ArraySelect( oFilter.value, "This.value != ''"), "This.value", "," ) + "' ) )" );
					}
					break;
				}
			}
		}
		else if ( oFilter.type == 'date' )
		{
			switch ( oFilter.id )
			{
				case 'response_date':
				{
					try
					{
						if ( oFilter.value_from != '' )
						{
							arrXQueryConditions.push( "$elem/date >= " + XQueryLiteral( Date( oFilter.value_from ) ) );
						}
					}
					catch( e )
					{}
					try
					{
						if ( oFilter.value_to != '' )
						{
							arrXQueryConditions.push( "$elem/date <= " + XQueryLiteral( Date( oFilter.value_to ) ) );
						}
					}
					catch( e )
					{}
					break;
				}
				case 'invitation_date':
				{
					try
					{
						if ( oFilter.value_from != '' )
						{
							arrXQueryConditions.push( "$elem/date_invitation >= " + XQueryLiteral( Date( oFilter.value_from ) ) );
						}
					}
					catch( e )
					{}
					try
					{
						if ( oFilter.value_to != '' )
						{
							arrXQueryConditions.push( "$elem/date_invitation <= " + XQueryLiteral( Date( oFilter.value_to ) ) );
						}
					}
					catch( e )
					{}
					break;
				}
			}
		}
	}

	function get_vacancy_foreign_object_name( iObjectID )
	{
		if ( ! iObjectID.HasValue )
			return "";

		var oForeignObject = ArrayOptFind( arrVacancyForeignObjects, "This.id == iObjectID" );
		if ( oForeignObject == undefined )
		{
			oForeignObject = new Object();
			oForeignObject.id = iObjectID.Value;
			try
			{
				oForeignObject.name = iObjectID.ForeignElem.name.Value;
			}
			catch( ex )
			{
				oForeignObject.name = global_settings.object_deleted_str.Value;
			}
			arrVacancyForeignObjects.push( oForeignObject );
		}
		return oForeignObject.name;
	}

	var arrVacancyForeignObjects = new Array();

	var arrVacanciesResponses = new Array();

	var sCondSort = " order by $elem/creation_date descending";
	if ( ObjectType( oSort ) == 'JsObject' && oSort.FIELD != null && oSort.FIELD != undefined && oSort.FIELD != "" )
	{
		switch ( oSort.FIELD )
		{
			case "response_date":
				sCondSort = " order by $elem/date" + ( StrUpperCase( oSort.DIRECTION ) == "DESC" ? " descending" : "" );
				break;
			case "invitation_date":
				sCondSort = " order by $elem/date_invitation" + ( StrUpperCase( oSort.DIRECTION ) == "DESC" ? " descending" : "" );
				break;
			default:
				sCondSort = " order by $elem/" + oSort.FIELD + ( StrUpperCase( oSort.DIRECTION ) == "DESC" ? " descending" : "" );
		}
	}

	var sXQueryConditions = ArrayCount( arrXQueryConditions ) > 0 ? ' where ' + ArrayMerge( arrXQueryConditions, 'This', ' and ' ) : '';

	arrVacanciesResponses = XQuery( "for $elem in vacancy_responses " + sXQueryConditions + sCondSort + " return $elem" );

	if ( ArrayOptFirstElem( arrDistincts ) != undefined )
	{
		oRes.data.SetProperty( "distincts", {} );
		for ( sFieldName in arrDistincts )
		{
			oRes.data.distincts.SetProperty( sFieldName, [] );
			switch( sFieldName )
			{
				case 'status':
				{
					for ( oStatus in common.vacancy_response_status_types )
					{
						oRes.data.distincts.status.push( { name: oStatus.name.Value, value: oStatus.id.Value } );
					}
					break;
				}
			}
		}
	}

	if ( ObjectType( oPaging ) == 'JsObject' && oPaging.SIZE != null )
	{
		oPaging.MANUAL = true;
		oPaging.TOTAL = ArrayCount( arrVacanciesResponses );
		oRes.paging = oPaging;
		arrVacanciesResponses = ArrayRange( arrVacanciesResponses, OptInt( oPaging.INDEX, 0 ) * oPaging.SIZE, oPaging.SIZE );
	}

	for ( catVacancyResponse in arrVacanciesResponses )
	{
		obj = new Object();
		obj.id = catVacancyResponse.id.Value;
		obj.name = catVacancyResponse.vacancy_name.Value;
		obj.status = catVacancyResponse.status.Value;
		obj.status_name = get_vacancy_foreign_object_name( catVacancyResponse.status );
		obj.response_date = catVacancyResponse.date.Value;
		obj.invitation_date = catVacancyResponse.date_invitation.Value;
		obj.link = tools_web.get_mode_clean_url( null, catVacancyResponse.vacancy_id );

		oRes.array.push( obj );
	}

	return oRes
}

/**
 * @function CreateNewCandidate
 * @memberof Websoft.WT.Staff
 * @author AZ
 * @description Создание карточки кандидата
 * @param {string} sCustomFieldsPageName - Название страницы с допполями для объекта Сотрудник
 * @returns {WTLPEFormResult}
*/

function CreateNewCandidate( sCustomFieldsPageName, sCommand, SCOPE_WVARS, curLngWeb )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = ({});

	try
	{
		if ( ObjectType( SCOPE_WVARS ) != "JsObject" )
			throw "";
	}
	catch( ex )
	{
		 SCOPE_WVARS = ({});
	}

	try
	{
		sCustomFieldsPageName = Trim( String( sCustomFieldsPageName ) );
		if ( sCustomFieldsPageName == '' )
			throw ''
	}
	catch( e )
	{
		sCustomFieldsPageName = '';
	}

	function get_form_field( field_name )
	{
		catElem = ArrayOptFind( oFormFields, "This.name == field_name" );
		return catElem == undefined ? "" : catElem.value
	}

	switch( sCommand )
	{
		case "eval":

			oRes.result = {
									command: "display_form",
									title: "Регистрация нового пользователя",
									header: "Заполните поля",
									form_fields: [],
									buttons:
									[
										{ name: "cancel", label: "Отмена", type: "cancel" },
										{ name: "submit", label: "Сохранить", type: "submit" }
									]
			};

			oRes.result.form_fields.push( { "name": "lastname", "label": "Фамилия", "type": "string", "mandatory" : true, "validation": "nonempty" } );
			oRes.result.form_fields.push( { "name": "firstname", "label": "Имя", "type": "string", "mandatory" : true, "validation": "nonempty" } );
			oRes.result.form_fields.push( { "name": "middlename", "label": "Отчество", "type": "string", "mandatory" : false, "validation": "" } );
			oRes.result.form_fields.push( { "name": "sex", "label": "Пол", "type": "select", "entries": [ { name: 'мужской', value: 'm'}, { name: 'женский', value: 'w'} ], "mandatory" : false, "validation": "" } );
			oRes.result.form_fields.push( { "name": "birth_date", "label": "Дата рождения", "type": "date", "mandatory" : false, "validation": "" } );
			oRes.result.form_fields.push( { "name": "email", "label": "Адрес эл. почты", "type": "string", "mandatory" : true, "validation": "email" } );
			oRes.result.form_fields.push( { "name": "password", "label": "Пароль", "type": "string", "mandatory" : true, "validation": "nonempty" } );
			oRes.result.form_fields.push( { "name": "confirm_password", "label": "Пароль повторно", "type": "string", "mandatory" : true, "validation": "nonempty" } );

			oCustomElems = tools.get_custom_template( 'collaborator', null, null );
			if ( oCustomElems != null )
			{
				if ( ArrayOptFind( oCustomElems.sheets, 'This.title == sCustomFieldsPageName' ) != undefined )
				{
					for ( field in ArraySelectByKey( oCustomElems.fields, true, 'disp_web' ) )
					{
						obj = {
								name: "custom_field_" + field.name.Value,
								label: field.title.Value,
								type: field.type.Value,
								value: "",
								catalog_name: field.catalog.Value,
								mandatory: field.is_required.Value,
								validation: ( field.is_required.Value ? "nonempty" : "" ),
								entries: []
							};

						for ( entry in field.entries )
							obj.entries.push( { name: entry.value.Value, value: entry.value.Value } );

						oRes.result.form_fields.push( obj );
					}
				}
			}

			break;

		case "submit_form":

			arrMandatoryFields = [ "lastname", "firstname", "email", "password", "confirm_password" ];
			oFormFields = parse_form_fields( SCOPE_WVARS.GetOptProperty( "form_fields" ) );

			for ( field in arrMandatoryFields )
			{
				if ( get_form_field( field ) == "" )
				{
					oRes.result = { command: "alert", msg: "Необходимо заполнить все обязательные поля" };
					return oRes;
				}

			}

			if ( get_form_field( "password" ) != '' && get_form_field( "password" ) != get_form_field( "confirm_password" ) )
			{
				oRes.result = { command: "alert", msg: "Введенные пароли не совпадают" };
				return oRes;
			}

			arrFullname = new Array();
			if ( get_form_field( "lastname", "" ) != "" )
				arrFullname.push( get_form_field( "lastname", "" ) );
			if ( get_form_field( "firstname", "" ) != "" )
				arrFullname.push( get_form_field( "firstname", "" ) );
			if ( get_form_field( "middlename", "" ) != "" )
				arrFullname.push( get_form_field( "middlename", "" ) );

			var arrXQueryConditions = new Array();

			arrXQueryConditions.push( "$elem/is_candidate = true()" );
			arrXQueryConditions.push( "$elem/fullname = " + XQueryLiteral( String( ArrayMerge( arrFullname, "This", " " ) ) ) );

			if ( get_form_field( "email", "" ) != "" )
			{
				arrXQueryConditions.push( "$elem/login = " + XQueryLiteral( String( get_form_field( "email", "" ) ) ) );
				arrXQueryConditions.push( "$elem/email = " + XQueryLiteral( String( get_form_field( "email", "" ) ) ) );
			}

			catCandidate = ArrayOptFirstElem( XQuery( "for $elem in collaborators where " + ArrayMerge( arrXQueryConditions, "This", " and " ) + " return $elem" ) );

			if ( catCandidate == undefined )
			{
				try
				{
					docNewCollab = OpenNewDoc( "x-local://wtv/wtv_collaborator.xmd" );
					docNewCollab.BindToDb( DefaultDb );

					docNewCollab.TopElem.lastname = get_form_field( "lastname", "" );
					docNewCollab.TopElem.firstname = get_form_field( "firstname", "" );
					docNewCollab.TopElem.middlename = get_form_field( "middlename", "" );
					docNewCollab.TopElem.sex = get_form_field( "sex", "" );
					docNewCollab.TopElem.birth_date = get_form_field( "birth_date", "" );
					docNewCollab.TopElem.login = get_form_field( "email", "" );
					docNewCollab.TopElem.password = get_form_field( "password", "" );
					docNewCollab.TopElem.email = get_form_field( "email", "" );

					docNewCollab.TopElem.is_candidate = true;
					docNewCollab.TopElem.allow_personal_chat_request = false;

					for ( _field in oFormFields )
					{
						if ( StrBegins( _field.name, "custom_field_" ) )
						{
							if ( IsArray( _field.value ) )
							{
								docNewCollab.TopElem.custom_elems.ObtainChildByKey( StrReplace( _field.name, "custom_field_", "" ), ArrayMerge( _field.value, "This", ";" ) )
							}
							else
							{
								docNewCollab.TopElem.custom_elems.ObtainChildByKey( StrReplace( _field.name, "custom_field_", "" ), _field.value );
							}
						}
					}

					docNewCollab.Save();

					oRes.result = { command: "close_form", msg: "Пользователь успешно создан" };

				}
				catch( e )
				{
					oRes.result = { command: "alert", msg: "Не удалось создать карточку нового пользователя" };
					return oRes;
				}

			}
			else
			{
				oRes.result = { command: "alert", msg: "Пользователь с указанными данными уже существует" };
				return oRes;
			}
			break;
		default:
			oRes.result = { command: "alert", msg: "Неизвестная команда" };
			break;
	}
	return oRes;
}

/**
 * @typedef {Object} oMetricTypicalDevelopmentProgram
 * @memberof Websoft.WT.Staff
 * @property {string} name – название типовой программы развития
 * @property {int} count - общее число объектов, в которых используется типовая программа (сумма трех последующих)
 * @property {int} position_common_count – число типовых должностей, в требованиях которых прописана типовая программа
 * @property {int} position_family_count – число семейств должностей, в требованиях которых прописана типовая программа
 * @property {int} position_group_subdivision_count – число групп подразделений, в требованиях которых прописана типовая программа
*/
/**
 * @function GetTypicalDevelopmentProgramContext
 * @memberof Websoft.WT.Staff
 * @author AKh
 * @description Рассчет объектной метрики (контекста) типовой программы развития
 * @param {bigint} iTypicalDevelopmentProgram - ID типовой программы развития
 * @returns {oMetricTypicalDevelopmentProgram}
*/
function GetTypicalDevelopmentProgramContext( iTypicalDevelopmentProgram )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {};

	try
	{
		iTypicalDevelopmentProgram = Int(iTypicalDevelopmentProgram);
	}
	catch(_err)
	{
		oRes.error = 501;
		oRes.errorText = StrReplace("Передан некорректный ID [{PARAM1}]", "{PARAM1}", iTypicalDevelopmentProgram);
		return oRes;
	}

	var docTypicalDevelopmentProgram = tools.open_doc(iTypicalDevelopmentProgram);
	if(docTypicalDevelopmentProgram == undefined)
	{
		oRes.error = 501;
		oRes.errorText = StrReplace("Не найдена типовая программа развития с ID [{PARAM1}]", "{PARAM1}", iTypicalDevelopmentProgram);
		return oRes;
	}

	var teTypicalDevelopmentProgram = docTypicalDevelopmentProgram.TopElem;
	if(teTypicalDevelopmentProgram.Name != "typical_development_program")
	{
		oRes.error = 502;
		oRes.errorText = StrReplace(StrReplace("Объект с ID [{PARAM1}] не является типовой программой развития: {PARAM2}", "{PARAM1}", iTypicalDevelopmentProgram), teTypicalDevelopmentProgram.Name);
		return oRes;
	}


	oRes.context.SetProperty("name", teTypicalDevelopmentProgram.name.Value);

	//position_common_count
	position_common_count = 0;
	arrPositionCommon = tools.xquery("for $elem in position_commons return $elem/Fields('id')");
	for (_elem in arrPositionCommon)
	{
		tePositionCommon = tools.open_doc(_elem.id).TopElem;
		if (ArrayOptFind(tePositionCommon.typical_development_programs, 'OptInt(This.typical_development_program_id, 0) == iTypicalDevelopmentProgram') != undefined)
			position_common_count++;
	}

	oRes.context.SetProperty("position_common_count", position_common_count);

	//position_family_count
	position_family_count = 0;
	arrPositionFamily = tools.xquery("for $elem in position_familys return $elem/Fields('id')");
	for (_elem in arrPositionFamily)
	{
		tePositionFamily = tools.open_doc(_elem.id).TopElem;
		if (ArrayOptFind(tePositionFamily.typical_development_programs, 'OptInt(This.typical_development_program_id, 0) == iTypicalDevelopmentProgram') != undefined)
			position_family_count++;
	}

	oRes.context.SetProperty("position_family_count", position_family_count);

	//position_group_subdivision_count
	position_group_subdivision_count = 0;
	arrGroupSub = tools.xquery("for $elem in subdivision_groups return $elem/Fields('id')");
	for (_elem in arrGroupSub)
	{
		teGroupSub = tools.open_doc(_elem.id).TopElem;
		if (ArrayOptFind(teGroupSub.typical_development_programs, 'OptInt(This.typical_development_program_id, 0) == iTypicalDevelopmentProgram') != undefined)
			position_group_subdivision_count++;
	}

	oRes.context.SetProperty("position_group_subdivision_count", position_group_subdivision_count);

	//count
	oRes.context.SetProperty("count", position_group_subdivision_count + position_family_count + position_common_count);

	return oRes;
}

/**
 * @function CreateVacancyResponseForReserve
 * @memberof Websoft.WT.Staff
 * @author AZ
 * @description Создание отклика в резерв
 * @param {string} sAlertText - Текст сообщения, которое будет показано пользователю, если он не подтвердит согласие на обработку данных.
 * @param {string} sUserAgreementLink - Ссылка на пользовательское соглашение.
 * @returns {WTLPEFormResult}
*/

function CreateVacancyResponseForReserve( sAlertText, sUserAgreementLink, sSetNewVariablesValues, sCommand, SCOPE_WVARS, curLngWeb )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = ({});


	var Env = CurRequest.Session.GetOptProperty( "Env", ({}) );
	var curSiteID = OptInt( Env.GetOptProperty( "curSiteID" ), null );
	var iPersonID = null;

	try
	{
		if ( ObjectType( SCOPE_WVARS ) != "JsObject" )
			throw "";
	}
	catch( ex )
	{
		 SCOPE_WVARS = ({});
	}

	try
	{
		sAlertText = Trim( String( sAlertText ) );
		if ( sAlertText == '' )
			throw ''
	}
	catch( e )
	{
		sAlertText = 'Необходимо подтвердить разрешение на обработку персональных данных';
	}

	try
	{
		sUserAgreementLink = Trim( String( sUserAgreementLink ) );
		if ( sUserAgreementLink == '' )
			throw ''
	}
	catch( e )
	{
		sUserAgreementLink = '';
	}

	try
	{
		arrNewVariablesValues = ParseJson( sSetNewVariablesValues );
	}
	catch( ex )
	{
		arrNewVariablesValues = [];
	}

	function get_form_field( field_name )
	{
		catElem = ArrayOptFind( oFormFields, "This.name == field_name" );
		return catElem == undefined ? "" : catElem.value
	}

	var arrRegions = new Array();
	for ( catRegion in XQuery( "for $elem in regions return $elem/Fields( 'id', 'name' )" ) )
	{
		arrRegions.push( { name: catRegion.name.Value, value: catRegion.id.Value } )
	}

	var arrProfessionalAreas = new Array();
	for ( catProfessionalArea in XQuery( "for $elem in professional_areas return $elem/Fields( 'id', 'name' )" ) )
	{
		arrProfessionalAreas.push( { name: catProfessionalArea.name.Value, value: catProfessionalArea.id.Value } )
	}

	function create_response( oFormFields )
	{
		arrMandatoryFields = [ "lastname", "firstname", "email", "phone" ];

		for ( field in arrMandatoryFields )
		{
			if ( get_form_field( field ) == "" )
			{
				oRes.result = { command: "alert", msg: "Необходимо заполнить все обязательные поля" };
				return oRes;
			}
		}

		sEmail = get_form_field( 'email' );

		oRegExp = tools.get_object_assembly( 'RegExp' );
		oRegExp.Global = true;
		oRegExp.IgnoreCase = true;
		oRegExp.MultiLine = false;
		oRegExp.Pattern = String( "^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$" );

		oMatches = oRegExp.Execute( sEmail );

		if ( oMatches.Count == 0 )
		{
			oRes.result = { command: "alert", msg: "Введите корректный email" };
			return oRes;
		}

		sPhone = get_form_field( 'phone' );
		sPhone = Trim( String( sPhone ) );
		sPhone = StrReplace( StrReplace( StrReplace( StrReplace( sPhone, '+', '' ), '(', '' ), ')', '' ), '-', '' );

		if ( OptInt( sPhone, null ) == null || StrCharCount( sPhone ) > 15 || StrCharCount( sPhone ) < 5 )
		{
			oRes.result = { command: "alert", msg: "Введите корректный номер телефона" };
			return oRes;
		}

		if ( ! tools_web.is_true( get_form_field( "is_confirm", "" ) ) )
		{
			oRes.result = { command: "alert", msg: sAlertText };
			return oRes;
		}

		arrFullname = new Array();
		if ( get_form_field( "lastname", "" ) != "" )
			arrFullname.push( get_form_field( "lastname", "" ) );
		if ( get_form_field( "firstname", "" ) != "" )
			arrFullname.push( get_form_field( "firstname", "" ) );
		if ( get_form_field( "middlename", "" ) != "" )
			arrFullname.push( get_form_field( "middlename", "" ) );

		var arrXQueryConditions = new Array();

		arrXQueryConditions.push( "$elem/is_candidate = true()" );
		arrXQueryConditions.push( "$elem/fullname = " + XQueryLiteral( String( ArrayMerge( arrFullname, "This", " " ) ) ) );

		if ( get_form_field( "email", "" ) != "" )
		{
			arrXQueryConditions.push( "$elem/email = " + XQueryLiteral( String( get_form_field( "email", "" ) ) ) );
		}

		if ( get_form_field( "phone", "" ) != "" )
		{
			arrXQueryConditions.push( "$elem/phone = " + XQueryLiteral( String( get_form_field( "phone", "" ) ) ) );
		}

		catCandidate = ArrayOptFirstElem( XQuery( "for $elem in collaborators where " + ArrayMerge( arrXQueryConditions, "This", " and " ) + " return $elem" ) );

		if ( catCandidate == undefined )
		{
			try
			{
				docNewCollab = OpenNewDoc( "x-local://wtv/wtv_collaborator.xmd" );
				docNewCollab.BindToDb( DefaultDb );

				docNewCollab.TopElem.lastname = get_form_field( "lastname", "" );
				docNewCollab.TopElem.firstname = get_form_field( "firstname", "" );
				docNewCollab.TopElem.middlename = get_form_field( "middlename", "" );
				docNewCollab.TopElem.phone = get_form_field( "phone", "" );
				docNewCollab.TopElem.email = get_form_field( "email", "" );
				docNewCollab.TopElem.region_id = get_form_field( "city", "" );
				docNewCollab.TopElem.is_candidate = true;

				docNewCollab.Save();

				iPersonID = docNewCollab.DocID;
				tePerson = docNewCollab.TopElem;
			}
			catch( e )
			{
				oRes.result = { command: "alert", msg: "Не удалось создать карточку нового кандидата" };
				return oRes;
			}

		}
		else
		{
			iPersonID = catCandidate.id;
			tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
		}

		catPersonalDataProcessingConsent = ArrayOptFirstElem( XQuery( "for $elem in personal_data_processing_consents where $elem/person_id = " + iPersonID + " return $elem/Fields( 'id' )" ) );
		if ( catPersonalDataProcessingConsent == undefined )
		{
			try
			{
				docPDPC = OpenNewDoc("x-local://wtv/wtv_personal_data_processing_consent.xmd");
				docPDPC.BindToDb( DefaultDb );
				docPDPC.TopElem.person_id = iPersonID;
				docPDPC.TopElem.person_type = 'candidate';
				docPDPC.TopElem.consent_date = Date();
				docPDPC.TopElem.site_id = curSiteID;
				docPDPC.Save();
			}
			catch( ex )
			{
				alert( ex );
			}
		}

		try
		{
			catEstaffEventType = ArrayOptFirstElem( XQuery( "for $elem in estaff_event_types where $elem/code = 'response_for_reserve' return $elem/Fields( 'id' )" ) );

			docRecruitmentEvent = OpenNewDoc( "x-local://wtv/wtv_recruitment_event.xmd" );
			docRecruitmentEvent.BindToDb( DefaultDb );
			docRecruitmentEvent.TopElem.start_date = Date();
			docRecruitmentEvent.TopElem.person_id = iPersonID;
			docRecruitmentEvent.TopElem.site_id = curSiteID;
			docRecruitmentEvent.TopElem.estaff_event_type_id = catEstaffEventType != undefined ? catEstaffEventType.id : null;

			catRecruitmentSystem = ArrayOptFirstElem( XQuery( "for $elem in recruitment_systems where $elem/code = 'websoft_hcm' return $elem/Fields( 'id' )" ) );
			if ( catRecruitmentSystem != undefined )
				docRecruitmentEvent.TopElem.recruitment_system_id = catRecruitmentSystem.id;

			docRecruitmentEvent.Save();
		}
		catch( ex )
		{
			alert( ex );
		}


		docResume = OpenNewDoc( 'x-local://wtv/wtv_resume.xmd' );
		docResume.TopElem.AssignElem( tePerson );
		docResume.TopElem.id.Clear();
		docResume.BindToDb( DefaultDb );
		docResume.TopElem.filling_type = "file";
		docResume.TopElem.name = 'Резюме для отклика в резерв';
		docResume.TopElem.region_id = get_form_field( "city", "" );
		docResume.TopElem.profession_id = get_form_field( "profession_id", "" );

		docResume.TopElem.person_id = iPersonID;
		tools.common_filling ('collaborator', docResume.TopElem.person_id, iPersonID, tePerson );
		docResume.TopElem.creator_person_id = iPersonID;
		tools.common_filling ('collaborator', docResume.TopElem.creator_person_id, iPersonID, tePerson );

		try
		{
			catResumeFile = ArrayOptFind( oFormFields, "This.name == 'resume_file_id'" );
			if ( catResumeFile != undefined && catResumeFile.HasProperty( "url" ) && catResumeFile.url != "" )
			{
				docResource = OpenNewDoc( 'x-local://wtv/wtv_resource.xmd' );

				if ( iPersonID != null )
				{
					docResource.TopElem.person_id = iPersonID;
					tools.common_filling( 'collaborator', docResource.TopElem, iPersonID, tePerson );
				}

				docResource.BindToDb();
				docResource.TopElem.put_data( catResumeFile.url );
				docResource.Save();
				docResume.TopElem.files.ObtainChildByKey( docResource.DocID );
			}

			catPortfolioFile = ArrayOptFind( oFormFields, "This.name == 'portfolio_file_id'" );
			if ( catPortfolioFile != undefined && catPortfolioFile.HasProperty( "url" ) && catPortfolioFile.url != "" )
			{
				docResource = OpenNewDoc( 'x-local://wtv/wtv_resource.xmd' );

				if ( iPersonID != null )
				{
					docResource.TopElem.person_id = iPersonID;
					tools.common_filling( 'collaborator', docResource.TopElem, iPersonID, tePerson );
				}

				docResource.BindToDb();
				docResource.TopElem.put_data( catPortfolioFile.url );
				docResource.Save();
				docResume.TopElem.files.ObtainChildByKey( docResource.DocID );
			}

			docResume.Save();

			tools.create_notification( "candidate_response_for_reserve", docResume.DocID, "", iPersonID, docResume.TopElem, tePerson );

			oRes.result = {
				command: "close_form", msg: tools_web.get_web_const( 'otklikuspeshnos', curLngWeb ),
				confirm_result:
				{
					command: "set_variable",
					vars: arrNewVariablesValues
				}
			};
		}
		catch( ex )
		{
			alert( ex );
			oRes.result = { command: "alert", msg: tools_web.get_web_const( 'vozniklaoshibka_1', curLngWeb ) };
		}
	}

	switch( sCommand )
	{
		case "eval":

			arrFormFields = parse_form_fields( SCOPE_WVARS.GetOptProperty( "form_fields" ) );

			if ( SCOPE_WVARS.GetOptProperty( "form_fields" ) != undefined && ArrayOptFirstElem( arrFormFields ) != undefined )
			{
				create_response( arrFormFields );
			}
			else
			{
				oRes.result = {
										command: "display_form",
										title: "Создание отклика в резерв",
										header: "Заполните поля",
										form_fields: [],
										buttons:
										[
											// { name: "cancel", label: "Отмена", type: "cancel" },
											{ name: "submit", label: "Отправить заявку", type: "submit" }
										]
				};

				oRes.result.form_fields.push( { name: "lastname", label: "Фамилия", type: "string", mandatory : true, validation: "nonempty" } );
				oRes.result.form_fields.push( { name: "firstname", label: "Имя", type: "string", mandatory : true, validation: "nonempty" } );
				oRes.result.form_fields.push( { name: "middlename", label: "Отчество", type: "string", mandatory : false, validation: "" } );
				oRes.result.form_fields.push( { name: "email", label: "Адрес эл. почты", type: "string", mandatory : true, validation: "email" } );
				oRes.result.form_fields.push( { name: "phone", label: "Телефон", type: "string", mandatory : true, validation: "number" } );
				oRes.result.form_fields.push( { name: "city", label: "Город", type: "select", "entries": arrRegions, mandatory : false, validation: "" } );
				oRes.result.form_fields.push( { name: "profession_id", label: "Направление", type: "select", "entries": arrProfessionalAreas, mandatory : false, validation: "" } );
				oRes.result.form_fields.push( { name: "resume_file_id", label: "Резюме", type: "file", mandatory : false, validation: "" } );
				oRes.result.form_fields.push( { name: "portfolio_file_id", label: "Портфолио", type: "file", mandatory : false, validation: "" } );
				oRes.result.form_fields.push( { name: "is_confirm", label: "Даю согласие на обработку персональных данных и принимаю условия " + ( sUserAgreementLink != '' ? "<a href='" + sUserAgreementLink + "' target='_blank'>пользовательского соглашения<\/a>" : "пользовательского соглашения" ), type: "bool", mandatory : false, validation: "" } );
			}

			break;

		case "submit_form":

			create_response( parse_form_fields( SCOPE_WVARS.GetOptProperty( "form_fields" ) ) );

			break;
		default:
			oRes.result = { command: "alert", msg: "Неизвестная команда" };
			break;
	}
	return oRes;
}


/**
 * @typedef {Object} oRegionsList
 * @property {bigint} id
 * @property {string} code
 * @property {string} name
*/
/**
 * @typedef {Object} ReturnRegionsList
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {oRegionsList[]} array – массив
*/
/**
 * @function GetRegionsList
 * @memberof Websoft.WT.Staff
 * @description Получение списка регионов.
 * @author AZ
 * @param {bool} [bAnonymousAccess] - Показывать список регионов для неавторизованных пользователей.
 * @param {string[]} arrDistincts - Перечень полей для формирования дополнительных списков для виджета фильтров
 * @param {oSimpleFilterElem[]} arrFilters - Набор фильтров
 * @param {oSort} oSort - Информация из рантайма о сортировке
 * @param {oPaging} oPaging - Информация из рантайма о пейджинге
 * @returns {ReturnRegionsList}
*/

function GetRegionsList( iCurUserID, bAnonymousAccess, arrDistincts, arrFilters, oSort, oPaging )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];
	oRes.paging = oPaging;
	oRes.data = {};

	var	arrXQueryConditions = new Array();

	try
	{
		if ( bAnonymousAccess == null || bAnonymousAccess == undefined )
			throw '';
		else
			bAnonymousAccess = tools_web.is_true( bAnonymousAccess );
	}
	catch( ex )
	{
		bAnonymousAccess = false
	}

	if ( ! bAnonymousAccess )
	{
		try
		{
			iCurUserID = Int( iCurUserID );
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = "Доступ запрещен";
			return oRes;
		}
	}

	try
	{
		if ( ! IsArray( arrFilters ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		arrFilters = new Array();
	}

	for ( oFilter in arrFilters )
	{
		if ( oFilter.type == 'search' && ( sSearch == undefined || sSearch == '' ) )
		{
			if ( oFilter.value != '' )
				arrXQueryConditions.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )" );
		}
		else if ( oFilter.type == 'select' )
		{
			switch ( oFilter.id )
			{
				case 'code':
				{
					if ( ArrayOptFind( oFilter.value, "This.value != ''" ) != undefined )
					{
						arrXQueryConditions.push( "MatchSome( $elem/code, ( " + ArrayMerge( ArraySelect( oFilter.value, "This.value != ''" ), "This.value", "," ) + " ) )" );
					}
					break;
				}
				case 'name':
				{
					if ( ArrayOptFind( oFilter.value, "This.value != ''" ) != undefined )
					{
						arrXQueryConditions.push( "MatchSome( $elem/name, ( " + ArrayMerge( ArraySelect( oFilter.value, "This.value != ''" ), "This.value", "," ) + " ) )" );
					}
					break;
				}
			}
		}
	}

	var sCondSort = " order by $elem/name ascending";
	if ( ObjectType( oSort ) == 'JsObject' && oSort.FIELD != null && oSort.FIELD != undefined && oSort.FIELD != "" )
	{
		switch ( oSort.FIELD )
		{
			default:
				sCondSort = " order by $elem/" + oSort.FIELD + ( StrUpperCase( oSort.DIRECTION ) == "DESC" ? " descending" : "" );
		}
	}

	sXQueryConditions = ArrayCount( arrXQueryConditions ) > 0 ? ' where ' + ArrayMerge( arrXQueryConditions, 'This', ' and ' ) : '';

	arrRegions = XQuery( "for $elem in regions " + sXQueryConditions + sCondSort + " return $elem/Fields( 'id', 'code', 'name' )" );

	if ( ArrayOptFirstElem( arrDistincts ) != undefined )
	{
		oRes.data.SetProperty( "distincts", {} );
		for ( sFieldName in arrDistincts )
		{
			oRes.data.distincts.SetProperty( sFieldName, [] );
			switch( sFieldName )
			{
				case 'code':
				{
					for ( catRegion in arrRegions )
					{
						oRes.data.distincts.code.push( { name: catRegion.code.Value, value: catRegion.id.Value } );
					}
					break;
				}
				case 'name':
				{
					for ( catRegion in arrRegions )
					{
						oRes.data.distincts.name.push( { name: catRegion.name.Value, value: catRegion.id.Value } );
					}
					break;
				}
			}
		}
	}

	if ( ObjectType( oPaging ) == 'JsObject' && oPaging.SIZE != null )
	{
		oPaging.MANUAL = true;
		oPaging.TOTAL = ArrayCount( arrRegions );
		oRes.paging = oPaging;
		arrRegions = ArrayRange( arrRegions, OptInt( oPaging.INDEX, 0 ) * oPaging.SIZE, oPaging.SIZE );
	}

	for ( catRegion in arrRegions )
	{
		obj = new Object();
		obj.id = catRegion.id.Value;
		obj.code = catRegion.code.Value;
		obj.name = catRegion.name.Value;

		oRes.array.push( obj );
	}

	return oRes
}

/**
 * @typedef {Object} oEmployeePersonalData
 * @property {bigint} name
 * @property {string} value
*/
/**
 * @typedef {Object} ReturnEmployeePersonalData
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {boolean} result – результат
 * @property {oEmployeePersonalData[]} array – массив
*/
/**
 * @function GetEmployeePersonalData
 * @memberof Websoft.WT.Staff
 * @description Получение личных данных сотрудника.
 * @author AZ
 * @param {string} [sDisplayFields] - Отображаемые поля
 * @returns {ReturnEmployeePersonalData}
*/

function GetEmployeePersonalData( iCurUserID, sDisplayFields )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.array = [];

	try
	{
		iCurUserID = Int( iCurUserID );

		teCollaborator = OpenDoc( UrlFromDocID( iCurUserID ) ).TopElem;
		if ( teCollaborator.Name != 'collaborator' )
		{
			oRes.error = 1;
			oRes.errorText = "Переданный ID объекта не принадлежит сотруднику";
			return oRes;
		}

		try
		{
			if ( sDisplayFields == '' )
				throw ''

			arrDisplayFields = sDisplayFields.split( ';' );
		}
		catch( ex )
		{
			arrDisplayFields = [];
		}

		sValue = '';

		if ( ArrayOptFind( arrDisplayFields, "This == 'login' " ) != undefined )
		{
			if ( tools_web.is_true( teCollaborator.disp_login ) && teCollaborator.login.HasValue )
				sValue = teCollaborator.login.Value;
			else
				sValue = '';
	
			oRes.array.push( { id: teCollaborator.id.Value, name: 'login', title: ms_tools.get_const( 'uf_login' ), value: sValue } );
		}

		if ( ArrayOptFind( arrDisplayFields, "This == 'sex' " ) != undefined )
		{
			if ( tools_web.is_true( teCollaborator.disp_sex ) && teCollaborator.sex.HasValue )
				sValue = teCollaborator.sex.Value == 'm' ? 'Мужской' : 'Женский';
			else
				sValue = '';

			oRes.array.push( { id: teCollaborator.id.Value, name: 'sex', title: ms_tools.get_const( 'vpb_sex' ), value: sValue } );
		}

		if ( ArrayOptFind( arrDisplayFields, "This == 'birth_date' " ) != undefined )
		{
			if ( tools_web.is_true( teCollaborator.disp_birthdate ) && teCollaborator.birth_date.HasValue )
			{
				if ( tools_web.is_true( teCollaborator.disp_birthdate_year ) )
				{
					sValue = StrDate( teCollaborator.birth_date.Value, false );
				}
				else
				{
					sValue = StrLeftRange( StrDate( teCollaborator.birth_date.Value, false ), 5 );
				}
			}
			else
				sValue = '';

			oRes.array.push( { id: teCollaborator.id.Value, name: 'birth_date', title: ms_tools.get_const( 'vpb_birthday' ), value: sValue } );
		}

		if ( ArrayOptFind( arrDisplayFields, "This == 'work_address' " ) != undefined )
		{
			try
			{
				sPlaceName = ( teCollaborator.place_id.HasValue ? teCollaborator.place_id.ForeignElem.name.Value : '' );
			}
			catch( ex )
			{
				sPlaceName = '';
			}

			try
			{
				sRegionName = ( teCollaborator.region_id.HasValue ? teCollaborator.region_id.ForeignElem.name.Value : '' );
			}
			catch( ex )
			{
				sRegionName = '';
			}

			sValue = ( sPlaceName != '' ? sPlaceName + ( sRegionName != '' ? ( ', ' + sRegionName ) : '' ) : sRegionName );

			oRes.array.push( { id: teCollaborator.id.Value, name: 'work_address', title: 'Рабочий адрес', value: sValue } );
		}

		if ( ArrayOptFind( arrDisplayFields, "This == 'email' " ) != undefined )
			oRes.array.push( { id: teCollaborator.id.Value, name: 'email', title: ms_tools.get_const( 'uf_email' ), value: teCollaborator.email.Value } );

		if ( ArrayOptFind( arrDisplayFields, "This == 'phone' " ) != undefined )
			oRes.array.push( { id: teCollaborator.id.Value, name: 'phone', title: ms_tools.get_const( 'uf_phone' ), value: teCollaborator.phone.Value } );

		if ( ArrayOptFind( arrDisplayFields, "This == 'position_name' " ) != undefined )
			oRes.array.push( { id: teCollaborator.id.Value, name: 'position_name', title: ms_tools.get_const( 'c_position' ), value: teCollaborator.position_name.Value } );

		if ( ArrayOptFind( arrDisplayFields, "This == 'position_parent_name' " ) != undefined )
			oRes.array.push( { id: teCollaborator.id.Value, name: 'position_parent_name', title: ms_tools.get_const( 'c_subd' ), value: teCollaborator.position_parent_name.Value } );

		if ( ArrayOptFind( arrDisplayFields, "This == 'org_name' " ) != undefined )
			oRes.array.push( { id: teCollaborator.id.Value, name: 'org_name', title: ms_tools.get_const( 'c_org' ), value: teCollaborator.org_name.Value } );

	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID сотрудника";
		return oRes;
	}

	return oRes
}

/**
 * @function ShowRecruitmentEventInfo
 * @memberof Websoft.WT.Staff
 * @author AZ
 * @param {bigint} [iRecruitmentEventID] - ID события.
 * @description Показ информации из карточки события
 * @returns {WTLPEFormResult}
*/

function ShowRecruitmentEventInfo( iRecruitmentEventID, sCommand, SCOPE_WVARS, curLngWeb )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = ({});

	try
	{
		iRecruitmentEventID = Int( iRecruitmentEventID );

		teRecruitmentEvent = OpenDoc( UrlFromDocID( iRecruitmentEventID ) ).TopElem;

		try
		{
			sStatus = teRecruitmentEvent.estaff_event_type_status_id.ForeignElem.name.Value;
		}
		catch( ex )
		{
			sStatus = '';
		}

		try
		{
			sVacancyName = teRecruitmentEvent.vacancy_id.ForeignElem.name.Value;
		}
		catch( ex )
		{
			sVacancyName = '';
		}
		
		sStartDate = teRecruitmentEvent.start_date.HasValue ? StrDate( teRecruitmentEvent.start_date, true, false ) : '';
		sFinishDate = teRecruitmentEvent.finish_date.HasValue ? StrDate( teRecruitmentEvent.finish_date, true, false ) : '';
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID события";
		return oRes;
	}

	switch( sCommand )
	{
		case "eval":

			oRes.result = {
									command: "display_form",
									title: "Подробная информация",
									header: "",
									form_fields: [],
									buttons:
									[
										// { name: "cancel", label: "Отмена", type: "cancel" },
										{ name: "submit", label: "Закрыть", type: "submit" }
									]
			};

			oRes.result.form_fields.push( { name: "status", label: "Статус", type: "paragraph", value: "<strong>Статус</strong><br>" + sStatus } );
			oRes.result.form_fields.push( { name: "vacancy_name", label: "Вакансия", type: "paragraph", value: "<strong>Вакансия</strong><br>" + sVacancyName } );
			oRes.result.form_fields.push( { name: "start_date", label: "Дата начала", type: "paragraph", value: "<strong>Дата начала</strong><br>" + sStartDate } );
			oRes.result.form_fields.push( { name: "finish_date", label: "Дата окончания", type: "paragraph", value: "<strong>Дата окончания</strong><br>" + sFinishDate } );
			oRes.result.form_fields.push( { name: "comment", label: "Комментарий", type: "paragraph", value: "<strong>Комментарий</strong><br>" + teRecruitmentEvent.comment.Value } );

			break;

		case "submit_form":

			oRes.result = {
				command: "close_form"
			};
			
			break;
		default:
			oRes.result = { command: "alert", msg: "Неизвестная команда" };
			break;
	}
	return oRes;
}

/**
 * @typedef {Object} RequestContext
 * @property {bool} bAccess – Есть доступ к заявке.
 * @property {string} sPersonRole – возвращать кем является текущий пользователь по отношению к заявке (person/tutor/none).
 * @property {bool} bCanCancel – Может отменить заявку.
*/
/**
 * @typedef {Object} ReturnRequestContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {RequestContext} context – Контекст заявки.
*/
/**
 * @function GetRequestContext
 * @memberof Websoft.WT.Staff
 * @description Получение контекста заявки.
 * @param {bigint} iRequestID - ID заявки.
 * @param {bigint} iPersonID - ID сотрудника.
 * @returns {ReturnRequestContext}
*/
function GetRequestContext( iRequestID, iPersonID )
{
	return get_request_context( iRequestID, null, iPersonID );
}
function get_request_context( curObjectID, curObject, curUserID, curUser )
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = new Object();

	try
	{
		curObjectID = Int( curObjectID );
	}
	catch( ex )
	{
		oRes.error = 503; 
		oRes.errorText = "{ text: 'Object not found.', param_name: 'curObjectID' }";
		return oRes;
	}
	try
	{
		curObject.Name;
	}
	catch( ex )
	{
		try
		{
			curObject = OpenDoc( UrlFromDocID( curObjectID ) ).TopElem;
		}
		catch ( err )
		{
			oRes.error = 503; 
			oRes.errorText = "{ text: 'Object not found.', param_name: 'curObjectID' }";
			return oRes;
		}
	}
	
	try
	{
		curUserID = Int( curUserID );
	}
	catch( ex )
	{
		oRes.error = 503; 
		oRes.errorText = "{ text: 'Object not found.', param_name: 'curUserID' }";
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
			tePerson = OpenDoc( UrlFromDocID( curUserID ) ).TopElem;
		}
		catch ( err )
		{
			oRes.error = 503; 
			oRes.errorText = "{ text: 'Object not found.', param_name: 'curUserID' }";
			return oRes;
		}
	}

	var oContext = {
		bAccess: false,
		sPersonRole: "none",
		bCanCancel: false
	};
	if( curObject.person_id == curUserID )
	{
		oContext.bAccess = true;
		oContext.sPersonRole = "person";
		var feRequestType = curObject.request_type_id.OptForeignElem;
		if( feRequestType != undefined )
		{
			oContext.bCanCancel = feRequestType.forbid_rejection.Value;
		}
	}
	else if( curObject.workflow_id.HasValue )
	{
		var teWorkflow = null;
		try
		{
			teWorkflow = OpenDoc( UrlFromDocID( curObject.workflow_id ) ).TopElem;
		}
		catch ( err )
		{
			alert( err );
		}
		if ( teWorkflow != null )
		{
			var sCustomEval = "";
			fldWorkflowCustomState = curObject.workflow_custom_states.GetOptChildByKey( curObject.workflow_state );
			if ( fldWorkflowCustomState != undefined && fldWorkflowCustomState.condition_eval_str.HasValue )
				sCustomEval = "(" + fldWorkflowCustomState.condition_eval_str.Value + ")";

			oContext.bAccess = ! teWorkflow.condition_eval_str.HasValue && sCustomEval == "";
			if ( !oContext.bAccess )
			{
				sCustomEval += ( sCustomEval == "" ? "" : "||" ) + ( teWorkflow.condition_eval_str.HasValue ? "(" + teWorkflow.condition_eval_str + ")" : "false" );
				oContext.bAccess = tools.safe_execution( sCustomEval );
			}
		}
		if( oContext.bAccess )
		{
			oContext.sPersonRole = "tutor";
		}
	}
	
	oRes.context = oContext;

	return oRes;
}

/**
 * @function DeleteWorkingCondition
 * @memberof Websoft.WT.Staff
 * @author IG
 * @description Удаление условия работы
 * @param {bigint[]} arrWorkingConditionIDs - Массив ID условий труда, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteWorkingCondition( arrWorkingConditionIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	var countHasObject = 0

	if(!IsArray(arrWorkingConditionIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrWorkingConditionIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "working_condition")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID условий труда или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iWorkingConditionID in arrWorkingConditionIDs)
	{
		try
		{
			sSQL = "for $elem in working_conditions where contains( $elem/id, ('" + XQueryLiteral(iWorkingConditionID) + "') ) return $elem"
			sWorkingConditionObjectID = ArrayOptFirstElem(tools.xquery(sSQL));

			if(sWorkingConditionObjectID == undefined){
				continue;
			}
			
			DeleteDoc( UrlFromDocID( iWorkingConditionID ), false);
			oRes.count++;
		}
		catch(err)
		{
			toLog("ERROR: DeleteWorkingCondition: " + ("[" + iWorkingConditionID + "]\r\n") + err, true);
		}
	}

	return oRes;
}

/**
 * @function DeleteWorkingConditionType
 * @memberof Websoft.WT.Staff
 * @author IG
 * @description Удаление типов условий труда
 * @param {bigint[]} arrWorkingConditionTypeIDs - Массив ID типов условий труда, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteWorkingConditionType( arrWorkingConditionTypeIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	var countHasObject = 0

	if(!IsArray(arrWorkingConditionTypeIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}
	
	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrWorkingConditionTypeIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "working_condition_type")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID типов условий труда или неверно определен тип документа для обработки";
		return oRes;
	}
	
	for(iWorkingConditionTypeID in arrWorkingConditionTypeIDs)
	{
		try
		{
			iWorkingConditionTypeID = OptInt(iWorkingConditionTypeID);

			sSQL = "for $elem in working_conditions return $elem"
			sWorkingConditionObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
			
			count = 0
			for (iWorkingConditionObjectID in sWorkingConditionObjectIDs)
			{
				
				docWorkingCondition = tools.open_doc( iWorkingConditionObjectID );
				if( docWorkingCondition == undefined )
				{
					continue;
				}
				
				/*
					Для каждого типа условий труда проверяется, используется ли он хотя бы в одном объекте Условия работы. 
					Если нет, то тип удаляется, иначе пропускается.
				*/
				if(docWorkingCondition.TopElem.working_condition_type_id.HasValue && docWorkingCondition.TopElem.working_condition_type_id.Value == iWorkingConditionTypeID)
				{
					count++
				}
			}

			if(count == 0)
			{
				DeleteDoc( UrlFromDocID( iWorkingConditionTypeID ), false);
				oRes.count++;
			}
		}
		catch(err)
		{
			toLog("ERROR: DeleteWorkingConditionType: " + ("[" + iWorkingConditionTypeID + "]\r\n") + err, true);
		}
	}

	return oRes;
}

/**
 * @function DeleteSalaryPaymentType
 * @memberof Websoft.WT.Staff
 * @author IG
 * @description Удаление типов графика выплаты заработной платы
 * @param {bigint[]} arrSalaryPaymentTypeIDs - Массив ID типов графика выплаты заработной платы, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteSalaryPaymentType( arrSalaryPaymentTypeIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	var countHasObject = 0

	if(!IsArray(arrSalaryPaymentTypeIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrSalaryPaymentTypeIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "salary_payment_type")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID типов графика выплаты заработной платы или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iSalaryPaymentTypeID in arrSalaryPaymentTypeIDs)
	{
		try
		{
			iSalaryPaymentTypeID = OptInt(iSalaryPaymentTypeID);

			sSQL = "for $elem in working_conditions return $elem"
			sSalaryPaymentTypeObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
			
			count = 0
			for (iSalaryPaymentTypeObjectID in sSalaryPaymentTypeObjectIDs)
			{
				
				docSalaryPaymentType = tools.open_doc( iSalaryPaymentTypeObjectID );
				if( docSalaryPaymentType == undefined )
				{
					continue;
				}
				
				/*
					Для каждого типа графика выплаты заработной платы проверяется, используется ли он хотя бы в одном объекте Условия работы. 
					Если нет, то тип удаляется, иначе пропускается.
				*/
				if(docSalaryPaymentType.TopElem.salary_payment_type_id.HasValue && docSalaryPaymentType.TopElem.salary_payment_type_id.Value == iSalaryPaymentTypeID)
				{
					count++
				}
			}

			if(count == 0)
			{
				DeleteDoc( UrlFromDocID( iSalaryPaymentTypeID ), false);
				oRes.count++;
			}
		}
		catch(err)
		{
			toLog("ERROR: DeleteSalaryPaymentType: " + ("[" + iSalaryPaymentTypeID + "]\r\n") + err, true);
		}
	}

	return oRes;
}

/**
 * @function DeleteWorkForm
 * @memberof Websoft.WT.Staff
 * @author IG
 * @description Удаление форм работы
 * @param {bigint[]} arrWorkFormIDs - Массив ID форм работы, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteWorkForm( arrWorkFormIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	var countHasObject = 0

	if(!IsArray(arrWorkFormIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrWorkFormIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "work_form")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID форм работы или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iWorkFormID in arrWorkFormIDs)
	{
		try
		{
			iWorkFormID = OptInt(iWorkFormID);

			sSQL = "for $elem in working_conditions return $elem"
			sWorkFormObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
			
			count = 0
			for (iWorkFormObjectID in sWorkFormObjectIDs)
			{
				
				docWorkForm = tools.open_doc( iWorkFormObjectID );
				if( docWorkForm == undefined )
				{
					continue;
				}
				
				/*
					Для каждой формы работы проверяется, используется ли она хотя бы в одном объекте Условия работы. 
					Если нет, то форма удаляется, иначе пропускается.
				*/
				if(docWorkForm.TopElem.work_form_id.HasValue && docWorkForm.TopElem.work_form_id.Value == iWorkFormID)
				{
					count++
				}
			}

			if(count == 0)
			{
				DeleteDoc( UrlFromDocID( iWorkFormID ), false);
				oRes.count++;
			}
		}
		catch(err)
		{
			toLog("ERROR: DeleteWorkForm: " + ("[" + iWorkFormID + "]\r\n") + err, true);
		}
	}

	return oRes;
}

/**
 * @function DeleteWorkScheduleType
 * @memberof Websoft.WT.Staff
 * @author IG
 * @description Удаление типов графика работы
 * @param {bigint[]} arrWorkScheduleTypeIDs - Массив ID типов графика работы, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteWorkScheduleType( arrWorkScheduleTypeIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	var countHasObject = 0

	if(!IsArray(arrWorkScheduleTypeIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrWorkScheduleTypeIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "work_form")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID форм работы или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iWorkScheduleTypeID in arrWorkScheduleTypeIDs)
	{
		try
		{
			iWorkScheduleTypeID = OptInt(iWorkScheduleTypeID);

			sSQL = "for $elem in working_conditions return $elem"
			sWorkScheduleTypeObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
			
			count = 0
			for (iWorkScheduleTypeObjectID in sWorkScheduleTypeObjectIDs)
			{
				
				docWorkScheduleType = tools.open_doc( iWorkScheduleTypeObjectID );
				if( docWorkScheduleType == undefined )
				{
					continue;
				}
				
				/*
					Для каждого типа графика работы проверяется, используется ли он хотя бы в одном объекте Условия работы.
					Если нет, то форма удаляется, иначе пропускается.
				*/
				if(docWorkScheduleType.TopElem.work_schedule_type_id.HasValue && docWorkScheduleType.TopElem.work_schedule_type_id.Value == iWorkScheduleTypeID)
				{
					count++
				}
			}

			if(count == 0)
			{
				DeleteDoc( UrlFromDocID( iWorkScheduleTypeID ), false);
				oRes.count++;
			}
		}
		catch(err)
		{
			toLog("ERROR: DeleteWorkScheduleType: " + ("[" + iWorkScheduleTypeID + "]\r\n") + err, true);
		}
	}

	return oRes;
}


/**
 * @function DeleteCompetenceProfileFamily
 * @memberof Websoft.WT.Staff
 * @author IG
 * @description Удаление семейства профилей
 * @param {bigint[]} arrCompetenceProfileFamilyIDs - Массив ID семейств профилей, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteCompetenceProfileFamily( arrCompetenceProfileFamilyIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;

	if(!IsArray(arrCompetenceProfileFamilyIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrCompetenceProfileFamilyIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "competence_profile_family")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID семейства профилей или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iCompetenceProfileFamilyID in arrCompetenceProfileFamilyIDs)
	{
		try
		{
			/*
				Для каждого семейства профиля проверяется, есть ли в нем хотя бы один профиль компетенций. 
				Если есть, то семейство пропускается, если нет, то удаляется.
			*/
			sSQL = "for $elem in competence_profile_familys where contains( $elem/id, ('" + XQueryLiteral(iCompetenceProfileFamilyID) + "') ) and $elem/competence_profiles = '' return $elem"
			aCompetenceProfileFamilyObjectID = ArrayOptFirstElem(tools.xquery(sSQL));
			
			if(aCompetenceProfileFamilyObjectID == undefined){
				continue;
			}

			DeleteDoc( UrlFromDocID( iCompetenceProfileFamilyID ), false);
			oRes.count++;
		}
		catch(err)
		{
			toLog("ERROR: DeleteCompetenceProfileFamily: " + ("[" + iCompetenceProfileFamilyID + "]\r\n") + err, true);
		}
	}
	
	return oRes;
}


/**
 * @function DeleteCompetenceProfile
 * @memberof Websoft.WT.Staff
 * @author IG
 * @description Удаление профилей компетенций
 * @param {bigint[]} arrCompetenceProfileIDs - Массив ID профилей компетенций, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteCompetenceProfile( arrCompetenceProfileIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;

	if(!IsArray(arrCompetenceProfileIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrCompetenceProfileIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "competence_profile")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID профилей компетенций или неверно определен тип документа для обработки";
		return oRes;
	}

	checkHas = false

	for(iCompetenceProfileID in arrCompetenceProfileIDs)
	{
		try
		{
			checkHas = false
			
			/*
				Для каждого профиля компетенций проверяется, есть ли его упоминания в других объектах. 
				Если есть хотя бы одно упоминание, то профиль пропускается, если нет, то удаляется. Проверяются объекты следующих каталогов:
					
					Семейства должностей * position_familys
					Должности * positions
					Типовые должности * position_commons
					Позиции штатного расписания * staff_positions
					Процедуры оценки * assessment_appraises
					Анкеты (pa) * pas
			*/

			sSQL = "for $elem in competence_profiles where contains( $elem/id, ('" + XQueryLiteral(iCompetenceProfileID) + "') ) return $elem";
			oCompetenceProfileObjectID = ArrayOptFirstElem(tools.xquery(sSQL));

			if(oCompetenceProfileObjectID == undefined){
				continue;
			}

			/* Семейства должностей */
			if(checkHas == false){
				sSQL = "for $elem in position_familys return $elem";
				aPositionFamilyObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
				for (iPositionFamilyObjectID in aPositionFamilyObjectIDs)
				{
					docPositionFamily = tools.open_doc( iPositionFamilyObjectID );
					docPositionFamilyTE = docPositionFamily.TopElem;
					
					if(docPositionFamilyTE != null){
						bCompetenceProfileHas = ArrayOptFind(docPositionFamilyTE.competence_profiles, "OptInt(This.id) == " + iCompetenceProfileID);
						if(bCompetenceProfileHas != undefined){
							checkHas = true;
							continue;
						}
					}
				}
			}

			/* Должности */
			if(checkHas == false){ // если не обнаружено присутствие записи в предыдущем списке, продолжим поиск в следующем
				sSQL = "for $elem in positions return $elem";
				aPositionObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
				
				for (iPositionObjectID in aPositionObjectIDs)
				{
					docPosition = tools.open_doc( iPositionObjectID );
					docPositionTE = docPosition.TopElem;
					
					if(docPositionTE != null){
						bCompetenceProfileHas = ArrayOptFind(docPositionTE.competence_profiles, "OptInt(This.id) == " + iCompetenceProfileID);
						if(bCompetenceProfileHas != undefined){
							checkHas = true;
							continue;
						}
					}
				}
			}
			
			/* Типовые должности */
			if(checkHas == false){ // если не обнаружено присутствие записи в предыдущем списке, продолжим поиск в следующем
				sSQL = "for $elem in position_commons return $elem";
				aPositionCommonObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
				
				for (iPositionCommonObjectID in aPositionCommonObjectIDs)
				{
					docPositionCommon = tools.open_doc( iPositionCommonObjectID );
					docPositionCommonTE = docPositionCommon.TopElem;
					
					if(docPositionCommonTE != null){
						bCompetenceProfileHas = ArrayOptFind(docPositionCommonTE.competence_profiles, "OptInt(This.id) == " + iCompetenceProfileID);
						if(bCompetenceProfileHas != undefined){
							checkHas = true;
							continue;
						}
					}
				}
			}
			
			
			/* Позиции штатного расписания */
			if(checkHas == false){ // если не обнаружено присутствие записи в предыдущем списке, продолжим поиск в следующем
				sSQL = "for $elem in staff_positions return $elem";
				aStaffPositionObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
				
				for (iStaffPositionObjectID in aStaffPositionObjectIDs)
				{
					docStaffPosition = tools.open_doc( iStaffPositionObjectID );
					docStaffPositionTE = docStaffPosition.TopElem;

					if(docStaffPositionTE != null){
						bCompetenceProfileHas = ArrayOptFind(docStaffPositionTE.competence_profiles, "OptInt(This.id) == " + iCompetenceProfileID);
						if(bCompetenceProfileHas != undefined){
							checkHas = true;
							continue;
						}
					}
				}
			}

			/* Анкеты (pa) */
			if(checkHas == false){ // если не обнаружено присутствие записи в предыдущем списке, продолжим поиск в следующем
				sSQL = "for $elem in pas where contains( $elem/competence_profile_id, ('" + XQueryLiteral(iCompetenceProfileID) + "') )return $elem"
				aPAObjectID = ArrayOptFirstElem(tools.xquery(sSQL));
				if(aPAObjectID != undefined){
					checkHas = true;
					continue;
				}
			}
			
			/* Процедуры оценки */
			if(checkHas == false){ 
				sSQL = "for $elem in assessment_appraises return $elem";
				aAssessmentAppraiseObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
				
				for (iAssessmentAppraiseObjectID in aAssessmentAppraiseObjectIDs)
				{
					docAssessmentAppraise = tools.open_doc( iAssessmentAppraiseObjectID );
					docAssessmentAppraiseTE = docAssessmentAppraise.TopElem;
					
					if (docAssessmentAppraiseTE != null){
						oParticipant = ArrayFind(docAssessmentAppraiseTE.participants, "participant_id != ''");
						oAssessmentAppraiseTypes = oParticipant.assessment_appraise_types;
						
						if( ArrayCount(oParticipant.assessment_appraise_types) > 0){
							aAssessmentAppraiseTypesIDs = ArrayExtract(oAssessmentAppraiseTypes, "This.competence_profile_id.Value");
							bAssessmentAppraiseTypesIDs = ArrayOptFind( aAssessmentAppraiseTypesIDs, "This == iCompetenceProfileID" )
							
							if ( bAssessmentAppraiseTypesIDs ){
								checkHas = true;
								continue;
							}
						}
					}
				}
			}
			
			if ( checkHas == false ) {
				DeleteDoc( UrlFromDocID( iCompetenceProfileID ), false);
				oRes.count++;
			}
		}
		catch(err)
		{
			toLog("ERROR: DeleteCompetenceProfile: " + ("[" + iCompetenceProfileID + "]\r\n") + err, true);
		}
	}
	
	return oRes;
}
/**
 * @function DeleteCompetence
 * @memberof Websoft.WT.Staff
 * @author IG
 * @description Удаление компетенций
 * @param {bigint[]} arrCompetenceIDs - Массив ID компетенций, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteCompetence( arrCompetenceIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
		checkHas = false;

	if(!IsArray(arrCompetenceIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrCompetenceIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "competence")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID компетенций или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iCompetenceID in arrCompetenceIDs)
	{
		try
		{
			checkHas = false
			
			/*
				Для каждой компетенции проверяется, есть ли его упоминания в других объектах. 
				Если есть хотя бы одно упоминание, то запись пропускается, если нет, то удаляется. Проверяются объекты следующих каталогов:
					
					Индикаторы * indicator
					Профили компетенций * competence_profile
					Анкеты (pa) * pas
					Оценки по мероприятию * event_assessment_plan
					Учебные программы * education_method
			*/

			sSQL = "for $elem in competences where contains( $elem/id, ('" + XQueryLiteral(iCompetenceID) + "') ) return $elem";
			oCompetenceObjectID = ArrayOptFirstElem(tools.xquery(sSQL));

			if(oCompetenceObjectID == undefined){
				continue;
			}

			/* Индикаторы */
			if(checkHas == false){ // если не обнаружено присутствие записи в предыдущем списке, продолжим поиск в следующем
				sSQL = "for $elem in indicators where contains( $elem/competence_id, ('" + XQueryLiteral(iCompetenceID) + "') ) return $elem";
				oIndicatorObjectID = ArrayOptFirstElem(tools.xquery(sSQL));
				if(oIndicatorObjectID != undefined){
					checkHas = true;
					continue;
				}
			}
			
			/* Профили компетенций */
			if(checkHas == false){
				// FIND competences * competence_id
				sSQL = "for $elem in competence_profiles return $elem";
				aCompetenceProfileObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
				
				for (iCompetenceProfileObjectID in aCompetenceProfileObjectIDs)
				{
					docCompetenceProfile = tools.open_doc( iCompetenceProfileObjectID );
					docCompetenceProfileTE = docCompetenceProfile.TopElem;
					
					if (docCompetenceProfileTE != null){
						bCompetenceProfileHas = ArrayOptFind(docCompetenceProfileTE.competences, "OptInt(This.competence_id) == " + iCompetenceID);
						if(bCompetenceProfileHas != undefined){
							checkHas = true;
							continue;
						}
					}
				}
			}
			
			/* Анкеты (pa) */
			if(checkHas == false){ // если не обнаружено присутствие записи в предыдущем списке, продолжим поиск в следующем
				// FIND competences * competence_id
				sSQL = "for $elem in pas return $elem";
				aPAObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
				
				for (iPAObjectID in aPAObjectIDs)
				{
					docPA = tools.open_doc( iPAObjectID );
					docPATE = docPA.TopElem;
					
					if (docPATE != null){
						bPAHas = ArrayOptFind(docPATE.competences, "OptInt(This.competence_id) == " + iCompetenceID);
						if(bPAHas != undefined){
							checkHas = true;
							continue;
						}
					}
				}
			}

			/* Оценки по мероприятию */
			if(checkHas == false){
				// FIND competences * competence_id
				sSQL = "for $elem in event_assessment_plans return $elem";
				aEventAssessmentPlanObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
				
				for (iEventAssessmentPlanObjectID in aEventAssessmentPlanObjectIDs)
				{
					docEventAssessmentPlan = tools.open_doc( iEventAssessmentPlanObjectID );
					docEventAssessmentPlanTE = docEventAssessmentPlan.TopElem;
					
					if (docEventAssessmentPlanTE != null){
						bEventAssessmentPlanHas = ArrayOptFind(docEventAssessmentPlanTE.competences, "OptInt(This.competence_id) == " + iCompetenceID);
						if(bEventAssessmentPlanHas != undefined){
							checkHas = true;
							continue;
						}
					}
				}
			}
			
			/* Учебные программы */
			if(checkHas == false){
				// FIND competences * competence_id
				sSQL = "for $elem in education_methods return $elem";
				aEducationMethodObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
				
				for (iEducationMethodObjectID in aEducationMethodObjectIDs)
				{
					docEducationMethod = tools.open_doc( iEducationMethodObjectID );
					docEducationMethodTE = docEducationMethod.TopElem;
					
					if (docEducationMethodTE != null){
						bEducationMethodHas = ArrayOptFind(docEducationMethodTE.competences, "OptInt(This.competence_id) == " + iCompetenceID);
						if(bEducationMethodHas != undefined){
							checkHas = true;
							continue;
						}
					}
				}
			}
			
			if ( checkHas == false ) {
				DeleteDoc( UrlFromDocID( iCompetenceID ), false);
				oRes.count++;
			}
		}
		catch(err)
		{
			toLog("ERROR: DeleteCompetence: " + ("[" + iCompetenceID + "]\r\n") + err, true);
		}
	}
	
	return oRes;
}


/**
 * @function DeleteIndicator
 * @memberof Websoft.WT.Staff
 * @author IG
 * @description Удаление индикаторов
 * @param {bigint[]} arrIndicatorIDs - Массив ID индикаторов, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteIndicator( arrIndicatorIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
		checkHas = false;

	if(!IsArray(arrIndicatorIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrIndicatorIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "indicator")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID индикаторов или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iIndicatorID in arrIndicatorIDs)
	{
		try
		{
			checkHas = false
			
			/*
				Для каждого профиля компетенций проверяется, есть ли его упоминания в других объектах. 
				Если есть хотя бы одно упоминание, то профиль пропускается, если нет, то удаляется. Проверяются объекты следующих каталогов:
					
					Профили компетенций * competence_profile
					Анкеты (pa) * pas
					Оценки по мероприятию * event_assessment_plan
					Учебные программы * education_method
			*/

			sSQL = "for $elem in indicators where contains( $elem/id, ('" + XQueryLiteral(iIndicatorID) + "') ) return $elem";
			oIndicatorObjectID = ArrayOptFirstElem(tools.xquery(sSQL));

			if(oIndicatorObjectID == undefined){
				continue;
			}

			/* Профили компетенций */
			if(checkHas == false){ // если не обнаружено присутствие записи в предыдущем списке, продолжим поиск в следующем
				sSQL = "for $elem in competence_profiles return $elem";
				aCompetenceProfileObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");

				for (iCompetenceProfileObjectID in aCompetenceProfileObjectIDs)
				{
					docCompetenceProfile = tools.open_doc( OptInt(iCompetenceProfileObjectID) );
					docCompetenceProfileTE = docCompetenceProfile.TopElem;

					if (docCompetenceProfileTE != null)
					{
						for (oCompetenceProfileObject in docCompetenceProfileTE.competences)
						{
							oIndicator = ArrayOptFind( oCompetenceProfileObject.indicators, "This.indicator_id == iIndicatorID" )
							
							if(oIndicator != undefined)
							{
								checkHas = true;
								continue;
							}
						}
					}
				}
			}

			/* Анкеты (pa) */
			if(checkHas == false){ 
				sSQL = "for $elem in pas return $elem";
				aPAObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");

				for (iPAObjectID in aPAObjectIDs)
				{
					docPA = tools.open_doc( OptInt(iPAObjectID) );
					docPATE = docPA.TopElem;

					if (docPATE != null)
					{
						oCompetences = docPATE.competences;

						if (ArrayCount(oCompetences) > 0){

							oIndicators = ArrayExtract(oCompetences, "This.indicators");
							for(oIndicator in oIndicators)
							{
								if(ArrayOptFind(oIndicator, 'This.indicator_id == iIndicatorID') != undefined){
									checkHas = true;
									continue;
								}
							}
						}
					}
				}
			}

			/* Оценки по мероприятию */
			if(checkHas == false){
				sSQL = "for $elem in event_assessment_plans return $elem";
				aEventAssessmentPlanObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
				
				for (iEventAssessmentPlanObjectID in aEventAssessmentPlanObjectIDs)
				{
					docEventAssessmentPlan = tools.open_doc( iEventAssessmentPlanObjectID );
					docEventAssessmentPlanTE = docEventAssessmentPlan.TopElem;
					
					if (docEventAssessmentPlanTE != null)
					{
						oCompetences = docEventAssessmentPlanTE.competences;
						
						if (ArrayCount(oCompetences) > 0){

							oIndicators = ArrayExtract(oCompetences, "This.indicators");
							for(oIndicator in oIndicators)
							{
								if(ArrayOptFind(oIndicator, 'This.indicator_id == iIndicatorID') != undefined){
									checkHas = true;
									continue;
								}
							}
						}
					}
				}
			}
			
			/* Учебные программы */
			if(checkHas == false){
				sSQL = "for $elem in education_methods return $elem";
				aEducationMethodObjectIDs = ArrayExtract(tools.xquery(sSQL), "This.id.Value");
				
				for (iEducationMethodObjectID in aEducationMethodObjectIDs)
				{
					docEducationMethod = tools.open_doc( iEducationMethodObjectID );
					docEducationMethodTE = docEducationMethod.TopElem;

					if (docEducationMethodTE != null)
					{
						oCompetences = docEducationMethodTE.competences;
						
						if (ArrayCount(oCompetences) > 0){

							oIndicators = ArrayExtract(oCompetences, "This.indicators");
							for(oIndicator in oIndicators)
							{
								if(ArrayOptFind(oIndicator, 'This.indicator_id == iIndicatorID') != undefined){
									checkHas = true;
									continue;
								}
							}
						}
					}
				}
			}

			if ( checkHas == false ) {
				DeleteDoc( UrlFromDocID( iIndicatorID ), false);
				oRes.count++;
			}
		}
		catch(err)
		{
			toLog("ERROR: DeleteIndicator: " + ("[" + iIndicatorID + "]\r\n") + err, true);
		}
	}
	
	return oRes;
}

/**
 * @function DeleteCompetenceBlock
 * @memberof Websoft.WT.Staff
 * @author IG
 * @description Удаление блоков компетенций
 * @param {bigint[]} arrCompetenceBlockIDs - Массив ID блоков компетенций, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteCompetenceBlock( arrCompetenceBlockIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
		checkHas = false;

	if(!IsArray(arrCompetenceBlockIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrCompetenceBlockIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "competence_block")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID блоков компетенций или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iCompetenceBlockID in arrCompetenceBlockIDs)
	{
		try
		{
			checkHas = false
			
			/*
				Для каждого блока компетенций проверяется, есть ли его упоминания в других объектах. 
				Если есть хотя бы одно упоминание, то блок компетенций пропускается, если нет, то удаляется. 
				Проверяются объекты следующих каталогов:
					* Блоки компетенций (это родительский блок)
					* Компетенции
			*/

			sSQL = "for $elem in competence_blocks where contains( $elem/id, ('" + XQueryLiteral(iCompetenceBlockID) + "') ) return $elem";
			oCompetenceBlockObjectID = ArrayOptFirstElem(tools.xquery(sSQL));

			if(oCompetenceBlockObjectID == undefined){
				continue;
			}

			/* Блоки компетенций (если это родительский блок) */
			if(checkHas == false){ // если не обнаружено присутствие записи в предыдущем списке, продолжим поиск в следующем
				sSQL = "for $elem in competence_blocks where contains( $elem/parent_object_id, ('" + XQueryLiteral(iCompetenceBlockID) + "') ) return $elem";
				oCompetenceBlockParentObject = ArrayOptFirstElem(tools.xquery(sSQL));
				
				if(oCompetenceBlockParentObject != undefined){
					checkHas = true;
					continue;
				}
			}

			/* Компетенции */
			if(checkHas == false){
				sSQL = "for $elem in competences where contains( $elem/competence_block_id, ('" + XQueryLiteral(iCompetenceBlockID) + "') ) return $elem";
				oCompetenceObject = ArrayOptFirstElem(tools.xquery(sSQL));
				
				if(oCompetenceObject != undefined){
					checkHas = true;
					continue;
				}
			}

			if ( checkHas == false ) {
				DeleteDoc( UrlFromDocID( iCompetenceBlockID ), false);
				oRes.count++;
			}
		}
		catch(err)
		{
			toLog("ERROR: DeleteCompetenceBlock: " + ("[" + iCompetenceBlockID + "]\r\n") + err, true);
		}
	}
	
	return oRes;
}
