
/**
 * @namespace Websoft.WT.Succession
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
 * @property {string} name
 * @property {string} type
 * @property {string|number|oSimpleElem[]} [value]
 * @property {number|data} [value_from]
 * @property {number|data} [value_to]
*/
/**
 * @typedef {Object} oCollectionParam
 * @property {?bigint} [personID]
 * @property {?oPaging} paging
 * @property {?oSort} sort 
 * @property {?string[]} [distincts]
 * @property {?oSimpleFilterElem[]} [filters ]
 * @property {?string} [fulltext]
 * @property {?bigint} [management_object_ids]
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
 * @property {string} result – Текст
*/
/**
 * @typedef {Object} WTLPEBlankResult
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
*/



/**
 * @function toLog
 * @memberof Websoft.WT.Succession
 * @description Запись в лог подсистемы.
 * @author BG
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
		EnableLog('lib_succession');
		LogEvent('lib_succession', sText )
	}
}
	
// ======================================================================================
// =====================  Функции приведения типов (CAST) ===============================
// ======================================================================================
/**
 * @typedef {Object} KeyPositionObject
 * @property {bigint} id
 * @property {string} name
 * @property {bigint} person_id – ID сотрудника на ключевой должности.
 * @property {bigint} position_id
 * @property {string} person_fullname – ФИО сотрудника на ключевой должности.
 * @property {string} person_position_name – Наименование должности.
 * @property {string} person_subdivision_name
 * @property {string} image_url
 * @property {string} status
 * @property {string} description
 * @property {string} link
 * @property {int} person_age – Возраст сотрудника.
 * @property {string} position_age – Срок нахождения на должности.
 * @property {int} risk_levels_count - общее число факторов риска в ключевой должности
 * @property {int} successors_count - общее число преемников
 * @property {int} active_successor_count - число преемников на ключевую должность в статусе На согласовании
 * @property {int} approved_successor_count - число преемников на ключевую должность в статусе Согласован
 */
function cast_KeyPosition(teKeyPosition)
{
	function get_risk_levels(teKeyPosition)
	{
		var arrRiskLevelNames = [];
		var fldRiskLevel;
		for(itemLevelID in teKeyPosition.risk_levels)
		{
			fldRiskLevel = itemLevelID.risk_level_id.OptForeignElem;
			if(fldRiskLevel != undefined && fldRiskLevel.name.Value != "") 
			{
				arrRiskLevelNames.push(fldRiskLevel.name.Value);
			}
		}
		
		return ArrayMerge(arrRiskLevelNames, "This", ", ")		
	}
	
	function get_successors(key_position_id)
	{
		return ArrayExtract(get_successors_by_key_position(key_position_id), "({successor_id: This.id.Value, successor_name: This.name.Value, status: This.status.Value})");
	}
	
	function has_success(arrSuccessors)
	{
		if(ArrayOptFind(arrSuccessors, "This.status == 'inposition' || This.status == 'approved'") != undefined)
			return "Eсть согласованные";

		if(ArrayOptFind(arrSuccessors, "This.status == 'active'") != undefined)
			return "На согласовании";
		
		return "Нет преемников";
	}
	
	var fldRiskPerspective = teKeyPosition.risk_perspective_id.OptForeignElem;
	var fldKeyPositionThreat = teKeyPosition.key_position_threat_id.OptForeignElem;
	var fldCareerReserveType = teKeyPosition.career_reserve_type_id.OptForeignElem;
	var arrSuccessors = get_successors(teKeyPosition.id.Value);

	oItem = {
		id: teKeyPosition.id.Value,
		object_id: teKeyPosition.id.Value,
		name: teKeyPosition.name.Value,
		person_id: teKeyPosition.person_id.Value,
		position_id: teKeyPosition.position_id.Value,
		person_fullname: teKeyPosition.person_fullname.Value,
		person_position_name: teKeyPosition.person_position_name.Value,
		person_subdivision_name: teKeyPosition.person_subdivision_name.Value,
		person_org_name: teKeyPosition.person_org_name.Value,
		status: common.key_position_status_types.GetChildByKey( teKeyPosition.status ).name.Value,
		risk_perspective: (fldRiskPerspective != undefined ? fldRiskPerspective.name.Value : ""),
		key_position_threat: (fldKeyPositionThreat != undefined ? fldKeyPositionThreat.name.Value : ""),
		key_position_threat_color: (fldKeyPositionThreat != undefined ? fldKeyPositionThreat.color.Value : ""),
		career_reserve_type: (fldCareerReserveType != undefined ? fldCareerReserveType.name.Value : ""),
		risk_levels: get_risk_levels(teKeyPosition),
		risk_levels_count: ArrayCount(teKeyPosition.risk_levels),
		successors: ArrayMerge(arrSuccessors, "This.successor_name", ", "),
		successors_count: ArrayCount(arrSuccessors),
		active_successor_count: ArrayCount(ArraySelect(arrSuccessors, 'This.status == "active"')),
		approved_successor_count: ArrayCount(ArraySelect(arrSuccessors, 'This.status == "approved"')),
		has_success: has_success(arrSuccessors),
		description: teKeyPosition.desc.Value,
		image_url: tools_web.get_object_source_url( 'person', teKeyPosition.person_id.Value, '200' ),
		link: tools_web.get_mode_clean_url( null, teKeyPosition.id.Value )
		//link: tools_web.get_mode_clean_url( 'talent_pool_key_position', teKeyPosition.id.Value )
	};
	
	var fldPerson = teKeyPosition.person_id.OptForeignElem;
	if(fldPerson != undefined)
	{
		var curDate = DateNewTime(Date());

		if(fldPerson.birth_date.HasValue)
		{
			iAge = Year(curDate)-Year(fldPerson.birth_date.Value);
			if(DateDiff(curDate, Date(Year(curDate), Month(fldPerson.birth_date.Value), Day(fldPerson.birth_date.Value))) < 0)
				iAge -= 1;
			oItem.SetProperty('person_age', iAge);
		}
		
		var sDateInterval = "";
		if(fldPerson.position_date.HasValue && DateNewTime(fldPerson.position_date.Value) <= curDate)
			sDateInterval = tools.call_code_library_method( "libMain", "StrDateInterval", [ fldPerson.position_date.Value ] );
		else if(fldPerson.hire_date.HasValue && DateNewTime(fldPerson.hire_date.Value) <= curDate)
			sDateInterval = tools.call_code_library_method( "libMain", "StrDateInterval", [ fldPerson.hire_date.Value ] );
		
		oItem.SetProperty('position_age', sDateInterval);
	}
	
	oItem.text_html = "<div class=\"text_html key_position\">\n"
	oItem.text_html += "<p class=\"person_subdivision_name\"><span class=\"title\">Подразделение:</span><span class=\"text\">" + oItem.person_subdivision_name + "</span></p>\n";
	oItem.text_html += "<p class=\"successors\"><span class=\"title\">Преемники:</span><span class=\"text\">" + oItem.successors + "</span></p>\n";
	oItem.text_html += "<p class=\"has_success\"><span class=\"title\">Есть преемник:</span><span class=\"text\">" + oItem.has_success + "</span></p>\n";
	oItem.text_html += "<p class=\"career_reserve_type\"><span class=\"title\">Кадровый резерв:</span><span class=\"text\">" + oItem.career_reserve_type + "</span></p>\n";
	oItem.text_html += "<p class=\"risk_levels\"><span class=\"title\">" + ms_tools.get_const('faktoryriska') + ":</span><span class=\"text\">" + oItem.risk_levels + "</span></p>\n";
	oItem.text_html += "<p class=\"key_position_threat\"><span class=\"title\">Актуальная угроза:</span><span class=\"text\" style=\"color: rgb(" + oItem.key_position_threat_color + ")\">" + oItem.key_position_threat + "</span></p>\n";
	oItem.text_html += "<p class=\"risk_perspective\"><span class=\"title\">Уровень угрозы:</span><span class=\"text\">" + oItem.risk_perspective + "</span></p>\n";
	oItem.text_html += "</div>";	
	return oItem
}

/**
 * @typedef {Object} SuccessorObject
 * @property {bigint} id
 * @property {bigint} key_position_id
 * @property {string} key_position_name
 * @property {string} key_position_person
 * @property {string} key_position_position
 * @property {string} key_position_subdivision
 * @property {string} key_position_person_image_url
 * @property {bigint} person_id
 * @property {bigint} position_id
 * @property {string} person_fullname
 * @property {string} person_position_name
 * @property {string} person_subdivision_name
 * @property {string} person_org_name
 * @property {string} person_img
 * @property {string} career_reserve_type
 * @property {string} status
 * @property {string} status_color
 * @property {string} development_potential
 * @property {string} efficiency_estimation
 * @property {string} readiness_level
 * @property {string} description
 * @property {string} link
*/
function cast_Successor(teSuccessor)
{
	var fldSuccessorKeyPosition = teSuccessor.key_position_id.OptForeignElem;
	var fldCareerReserveType = undefined;
	var fldSuccessorKeyPositionSubdivision = undefined;
	if(fldSuccessorKeyPosition != undefined)
	{
		fldCareerReserveType = fldSuccessorKeyPosition.career_reserve_type_id.OptForeignElem;
		var fldSuccessorKeyPosition_Position = fldSuccessorKeyPosition.position_id.OptForeignElem
		if(fldSuccessorKeyPosition_Position != undefined)
			fldSuccessorKeyPositionSubdivision = fldSuccessorKeyPosition_Position.parent_object_id.OptForeignElem
	}
	
	var fldSuccessorDevelopmentPotential = teSuccessor.development_potential_id.OptForeignElem;
	var fldSuccessorEfficiencyEstimation = teSuccessor.efficiency_estimation_id.OptForeignElem;
	var fldSuccessorReadinessLevel = teSuccessor.readiness_level_id.OptForeignElem;
	var fldSuccessorStatus = teSuccessor.status.OptForeignElem;

	oItem = {
		id: teSuccessor.id.Value,
		object_id: teSuccessor.id.Value,
		key_position_id: teSuccessor.key_position_id.Value,
		key_position_name: (fldSuccessorKeyPosition != undefined ? fldSuccessorKeyPosition.name.Value : ""),
		key_position_person: (fldSuccessorKeyPosition != undefined ? fldSuccessorKeyPosition.person_fullname.Value : ""),
		key_position_person_id: (fldSuccessorKeyPosition != undefined ? fldSuccessorKeyPosition.person_id.Value : ""),
		key_position_position: (fldSuccessorKeyPosition != undefined ? fldSuccessorKeyPosition.position_name.Value : ""),
		key_position_subdivision: (fldSuccessorKeyPositionSubdivision != undefined ? fldSuccessorKeyPositionSubdivision.name.Value : ""),
		key_position_person_image_url: (fldSuccessorKeyPositionSubdivision != undefined ? tools_web.get_object_source_url( 'person', fldSuccessorKeyPosition.person_id.Value, '200' ) : ""),
		person_id: teSuccessor.person_id.Value,
		position_id: teSuccessor.person_position_id.Value,
		person_fullname: teSuccessor.person_fullname.Value,
		person_position_name: teSuccessor.person_position_name.Value,
		person_subdivision_name: teSuccessor.person_subdivision_name.Value,
		person_org_name: teSuccessor.person_org_name.Value,
		person_img: tools_web.get_object_source_url( 'person', teSuccessor.person_id.Value ),
		career_reserve_type: (fldCareerReserveType != undefined ? fldCareerReserveType.name.Value : ""),
		status: (fldSuccessorStatus != undefined ? fldSuccessorStatus.name.Value : ""),
		status_color: (fldSuccessorStatus != undefined ? fldSuccessorStatus.bk_color.Value : ""),
		development_potential_id: teSuccessor.development_potential_id.Value,
		development_potential: (fldSuccessorDevelopmentPotential != undefined ? fldSuccessorDevelopmentPotential.name.Value : ""),
		efficiency_estimation_id: teSuccessor.efficiency_estimation_id.Value,
		efficiency_estimation: (fldSuccessorEfficiencyEstimation != undefined ? fldSuccessorEfficiencyEstimation.name.Value : ""),
		readiness_level: (fldSuccessorReadinessLevel != undefined ? fldSuccessorReadinessLevel.name.Value : ""),
		description: teSuccessor.desc.Value,
		image_url: tools_web.get_object_source_url( 'person', teSuccessor.person_id.Value, '200' ),
		link: tools_web.get_mode_clean_url( 'talent_pool_successor', teSuccessor.id.Value )
	};
	
	oItem.text_html = "<div class=\"text_html successors\">\n"
	oItem.text_html += "<p class=\"key_position_name\"><span class=\"title\">Ключевая должность:</span><span class=\"text\">" + oItem.key_position_name + "</span></p>\n";
	oItem.text_html += "<p class=\"key_position_subdivision\"><span class=\"title\">Подразделение:</span><span class=\"text\">" + oItem.key_position_subdivision + "</span></p>\n";
	oItem.text_html += "<p class=\"career_reserve_type\"><span class=\"title\">Кадровый резерв:</span><span class=\"text\">" + oItem.career_reserve_type + "</span></p>\n";
	var sFormattedStatus = oItem.status_color != "" ? ' style="padding: 2px 5px; background-color: rgb(' + oItem.status_color + ')"'  : "";
	oItem.text_html += "<p class=\"status\"><span class=\"title\">Статус:</span><span class=\"text\"" + sFormattedStatus + ">" + oItem.status + "</span></p>\n";
	oItem.text_html += "<p class=\"development_potential\"><span class=\"title\">Потенциал развития:</span><span class=\"text\">" + oItem.development_potential  + "</span></p>\n";
	oItem.text_html += "<p class=\"efficiency_estimation\"><span class=\"title\">Оценка эффективности:</span><span class=\"text\">" + oItem.efficiency_estimation  + "</span></p>\n";
	oItem.text_html += "<p class=\"readiness_level\"><span class=\"title\">Уровень готовности:</span><span class=\"text\">" + oItem.readiness_level  + "</span></p>\n";
	oItem.text_html += "</div>";	
	
	
	return oItem
}

// ======================================================================================
// ==================================  Выборки ==========================================
// ======================================================================================


/**
 * @typedef {Object} ReturnKeyPositionObjects
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {KeyPositionObject[]} array – результат
*/
/**
 * @function GetEmployeesSubdivisionKeyPositions
 * @memberof Websoft.WT.Succession
 * @description Получение списка ключевых должностей в подразделении сотрудника.
 * @author BG
 * @param {bigint} iPersonID - ID сотрудника, в подразделении которого ищутся ключевые должности
 * @param {boolean} bOnlyDirectSubdivisions - Искать только подразделения верхнего уровня, в которых сотрудник является руководителем, без учёта подчинённых подразделений.
 * @param {boolean} bIncludeOrgsWhereUserIsBoss - Учитывать организации, где сотрудник является руководителем.
 * @returns {ReturnKeyPositionObjects}
*/

function GetEmployeesSubdivisionKeyPositions( iPersonID, bOnlyDirectSubdivisions, bIncludeOrgsWhereUserIsBoss )
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
		oRes.errorText = "Передан некорректный ID сотрудника";
		return oRes;
	}
	
	try
	{
		if ( bOnlyDirectSubdivisions == undefined || bOnlyDirectSubdivisions == null )
			throw '';

		bOnlyDirectSubdivisions = tools_web.is_true( bOnlyDirectSubdivisions );
	}
	catch( ex )
	{
		bOnlyDirectSubdivisions = false;
	}
	
	try
	{
		if ( bIncludeOrgsWhereUserIsBoss == undefined || bIncludeOrgsWhereUserIsBoss == null )
			throw '';

		bIncludeOrgsWhereUserIsBoss = tools_web.is_true( bIncludeOrgsWhereUserIsBoss );
	}
	catch( ex )
	{
		bIncludeOrgsWhereUserIsBoss = false;
	}

	var sPersonSubdivisionsIDs = get_subdivisions_ids_where_person_is_boss( iPersonID, bOnlyDirectSubdivisions, bIncludeOrgsWhereUserIsBoss );

	var sKeyPositionsReq = "for $elem in key_positions where some $position in positions satisfies ($elem/position_id=$position/id and MatchSome( $position/parent_object_id, ( " + sPersonSubdivisionsIDs + " ) ) ) return $elem/Fields('id')";

	var xarrKeyPositions = tools.xquery( sKeyPositionsReq );

	for ( catKeyPosition in xarrKeyPositions )
	{
		docKeyPosition = tools.open_doc( catKeyPosition.id );
		if ( docKeyPosition != undefined )
		{
			teKeyPosition = docKeyPosition.TopElem;
			oRes.array.push( cast_KeyPosition(teKeyPosition) );
		}
	}

	return oRes;
}

/**
 * @typedef {Object} ReturnSuccessorObjects
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {SuccessorObject[]} array – результат
*/
/**
 * @function GetSuccessorsToKeyPosition
 * @memberof Websoft.WT.Succession
 * @description Получение списка преемников на ключевой должности.
 * @author BG
 * @param {bigint} iKeyPositionID - ID ключевой должности
 * @returns {ReturnSuccessorObjects}
*/

function GetSuccessorsToKeyPosition( iKeyPositionID )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];

	try
	{
		iKeyPositionID = Int( iKeyPositionID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = StrReplace( "Передан некорректный ID ключевой должности: [{PARAM1}]", "{PARAM1}", iKeyPositionID);
		return oRes;
	}
	xarrSuccessorsByKeyPositionID = get_successors_by_key_position(iKeyPositionID);

	for ( catSuccessor in xarrSuccessorsByKeyPositionID )
	{
		docSuccessor = tools.open_doc( catSuccessor.id );
		if ( docSuccessor != undefined )
		{
			teSuccessor = docSuccessor.TopElem;
			oRes.array.push( cast_Successor(teSuccessor) );
		}
	}

	return oRes;
}

/**
 * @function GetKeyPositions
 * @memberof Websoft.WT.Succession
 * @description Получение списка ключевых должностей по подчиненным сотрудника
 * @author BG
 * @param {bigint} iPersonID - ID сотрудника
 * @param {string} sTypeCollaborator - Выбор, по кому осуществлять выборку ( subordinates/main_subordinates/func_subordinates/all_subordinates )
 * @param {int[]} arrBossTypesID - массив ID типов руководителя.
 * @param {boolean} bReturnByBoss - возвращать ключевые должности, для которых сотрудник является руководителем
 * @param {boolean} bReturnByHR - возвращать ключевые должности, для которых сотрудник является HR'ом
 * @param {string} iAppLevel - Роль, для которой отображается информация. Если выбрано Получать автоматически, то роль передается из приложения.
 * @param {string} sState - Статус ключевой должности.
 * @param {string} sFilter - Дополнительные условия для xquery-запроса по каталогу ключевых должностей.
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnKeyPositionObjects}
*/

function GetKeyPositions( iPersonID, sTypeCollaborator, arrBossTypesID, bReturnByBoss, bReturnByHR, iAppLevel, sState, sFilter, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	
	var oPaging = ( DataType( oCollectionParams ) == 'object' && ObjectType( oCollectionParams ) == 'JsObject' ) ? oCollectionParams.GetOptProperty("paging", {SIZE: null, INDEX: 0}) : {SIZE: null, INDEX: 0};

	oRes.paging = oPaging;


	var arrXQConds = [];

	if ( sFilter == null || sFilter == undefined )
		sFilter = "";

	if ( sFilter != "" )
	{
		arrXQConds.push( sFilter );
	}

	if ( oCollectionParams.HasProperty( "filters" ) && IsArray( oCollectionParams.filters ) )
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
				arrXQConds.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )" );
		}
	}

	try
	{
		var arrStates = sState.split( ';' );
		if ( ArrayCount( arrStates ) > 0 )
		{
			arrXQConds.push( "MatchSome( $elem/status, ( " + ArrayMerge( arrStates, 'XQueryLiteral( This )', ',' ) + " ) )" );
		}
	}
	catch( ex )
	{
	}

	var arrPositionIDs = [];
	var libParamMain = tools.get_params_code_library( 'libMain' );

	if ( IsEmptyValue(iAppLevel) )
	{
		if ( tools_web.is_true( bReturnByBoss ) )
		{
			if ( sTypeCollaborator == "" || sTypeCollaborator == null || sTypeCollaborator == undefined )
			{
				var sTypeCollaborator = libParamMain.GetOptProperty( "DefaultSubordinateType", "all_subordinates" ); //by default: Непосредственные и функциональные подчиненные с иерархией
			}

			try
			{
				arrPositionIDs = ArrayUnion( arrPositionIDs, ArrayExtract( tools.call_code_library_method( "libMain", "GetTypicalSubordinates", [ iPersonID, sTypeCollaborator, arrBossTypesID ] ), "This.position_id.Value"));
			}
			catch( ex )
			{
				oRes.error = 1;
				oRes.errorText = ex;
				return oRes;
			}
		}
		
		if ( tools_web.is_true( bReturnByHR ) )
		{
			var libParamSucc = tools.get_params_code_library( 'libSuccession' );
			var iBossTypeID = libParamSucc.GetOptProperty( "iHRBossTypeID", 2691248884100914019 ); //by default: Менеджер по персоналу

			var arrHRBossTypesID = [];
			arrHRBossTypesID.push( iBossTypeID )

			try
			{
				arrPositionIDs = ArrayUnion( arrPositionIDs, ArrayExtract( tools.call_code_library_method( "libMain", "GetTypicalSubordinates", [ iPersonID, "func_subordinates", arrHRBossTypesID ] ), "This.position_id.Value" ) );
			}
			catch( ex )
			{
				oRes.error = 1;
				oRes.errorText = ex;
				return oRes;
			}
		}
	}
	else
	{
		switch ( iAppLevel )
		{
			case 10:
			case 7:
				break;

			case 5:
					if ( oCollectionParams.manager_type_id != null )
					{
						arrKeyPositionsIDs = [];

						arrPersons = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iPersonID, [ 'func' ], false, '', [ 'id' ], '', true, true, true, true, [ oCollectionParams.manager_type_id ], true ] )

						arrKeyPositions = ArrayDirect( tools.xquery( "for $elem_qc in key_positions where MatchSome( $elem_qc/person_id, ( " + ArrayMerge( arrPersons, 'This.id', ',' ) + " ) ) return $elem_qc/Fields( 'id' )" ) );
						
						if ( ArrayOptFirstElem ( arrKeyPositions ) != undefined )
							arrXQConds.push( 'MatchSome( $elem/id, ( ' + ArrayMerge( arrKeyPositions, 'This.id.Value', ',' ) + ' ) )' )
						else
							arrXQConds.push( '$elem/id = 0' )
					}

					break;
			case 3:
						oExpert = ArrayOptFirstElem( tools.xquery( "for $elem in experts where $elem/type = 'collaborator' and $elem/person_id = " + iPersonID + " return $elem/Fields( 'id' )" ) );

						arrRoles = [];
						if ( oExpert != undefined )
						{
							arrRoles = tools.xquery("for $elem in roles where $elem/catalog_name = 'key_position' and contains($elem/experts," + OptInt( oExpert.id, 0 ) + ") return $elem/Fields('id')");
						}

						if ( ArrayCount( arrRoles ) > 0 )
							arrXQConds.push( 'MatchSome( $elem/role_id, ( ' + ArrayMerge( arrRoles, 'This.id', ',' ) + ' ) )' )
						else
							arrXQConds.push( '$elem/role_id = 0' )

					break;
			case 1:
						arrPersons = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iPersonID, [ 'func' ], false, '', [ 'id' ], '', true, true, true, true, [], true ] );
						
						arrKeyPositionsIDs = ArrayExtract( XQuery( "for $elem in successors where MatchSome( $elem/person_id, ( " + ArrayMerge( arrPersons, 'This.id', ',' ) + " ) ) order by $elem/id return $elem/Fields( 'key_position_id' )" ), 'This.key_position_id' );
						
						if ( ArrayCount( arrKeyPositionsIDs ) > 0 )
							arrXQConds.push( 'MatchSome( $elem/id, ( ' + ArrayMerge( arrKeyPositionsIDs, 'This', ',' ) + ' ) )' )
						else
							arrXQConds.push( '$elem/id = 0' )
					
					break;
		}
	}
	
	var iHighEffectivenessLevel = OptInt( libParamMain.GetOptProperty( "DefaultHighEffectivenessLevel", 80 ), 80 );
	var iEffectivenessPeriod = OptInt( libParamMain.GetOptProperty( "EffectivenessPeriod", 365 ), 365 );
	var arrAssessmentAppraiseTypes = tools_web.parse_multiple_parameter( libParamMain.GetOptProperty( "sDefaultAssessmentAppraiseTypes", "[]" ) );

	if ( ! IsArray( arrAssessmentAppraiseTypes ) || ArrayOptFirstElem( arrAssessmentAppraiseTypes ) == undefined )
		arrAssessmentAppraiseTypes = ['activity_appraisal'];

	var iHighEffectivenessSuccessorMinNum = OptInt( libParamMain.GetOptProperty( "DefaultHighEffectivenessSuccessorMinNum", 1 ), 1 );
	
	if ( IsEmptyValue(iAppLevel) )
	{
		arrXQConds.push( "MatchSome( $elem_qc/position_id,(" + ArrayMerge( arrPositionIDs, 'This', ',' ) + " ) )" )
		var sXQConds = StrReplace(ArrayMerge( arrXQConds, "This", " and " ), "$elem/","$elem_qc/");
		var sReqLongListKeyPosition = "for $elem_qc in key_positions where " + sXQConds + " return $elem_qc ";
		var xarrKeyPositions = tools.xquery( sReqLongListKeyPosition );
	}
	else
	{
		var sXQConds = ArrayOptFirstElem( arrXQConds ) == undefined ? "" : " where " + ArrayMerge( arrXQConds, "This", " and " );
		var sReqKeyPosition = "for $elem in key_positions " + sXQConds + " order by $elem/id return $elem";
		var xarrKeyPositions = tools.xquery( sReqKeyPosition );
	}

	var sReqAssessmentForms, iCountAssessmentForms;

	for ( catKeyPosition in xarrKeyPositions )
	{
		docKeyPosition = tools.open_doc( catKeyPosition.id );
		if ( docKeyPosition != undefined )
		{
			castKeyPosition = cast_KeyPosition( docKeyPosition.TopElem );

			sReqAssessmentForms = "for $elem in pas where MatchSome( $elem/assessment_appraise_type, (" + ArrayMerge( arrAssessmentAppraiseTypes, "XQueryLiteral(This)" ) + ") ) and $elem/is_done = true() and $elem/overall >= " + iHighEffectivenessLevel + " and some $appr in assessment_appraises satisfies ($elem/assessment_appraise_id = $appr/id and $appr/status = '1' and ($appr/end_date > " + XQueryLiteral(DateOffset(Date(), (0-iEffectivenessPeriod)*86400)) + " or $appr/end_date = null())) and some $succ in successors satisfies ($succ/person_id = $elem/person_id and MatchSome($succ/status, ('approved','inposition') ) and $succ/key_position_id = " + catKeyPosition.id + ") return $elem";
			iCountAssessmentForms = ArrayCount( tools.xquery( sReqAssessmentForms ) );
			castKeyPosition.SetProperty( "color_high_effectiveness", ( iCountAssessmentForms >= iHighEffectivenessSuccessorMinNum ? "green" : "red" ) );

			oRes.array.push( castKeyPosition );
		}
	}

	if ( ObjectType( oCollectionParams.sort ) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		switch( sFieldName )
		{
			case "code":
			case "name":
			case "color":
				sFieldName = "StrUpperCase(" + sFieldName + ")";
		}
		oRes.array = ArraySort( oRes.array, sFieldName, ( ( oCollectionParams.sort.DIRECTION == "DESC" ) ? "-" : "+" ) );
	}
	
	if ( ObjectType( oCollectionParams.paging ) == 'JsObject' && oCollectionParams.paging.SIZE != null )
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount( oRes.array );
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange( oRes.array, ( OptInt( oCollectionParams.paging.START_INDEX, 0 ) > 0 ? oCollectionParams.paging.START_INDEX : OptInt( oCollectionParams.paging.INDEX, 0 ) * oCollectionParams.paging.SIZE ), oCollectionParams.paging.SIZE );
	}

	return oRes
}

/**
 * @function GetSuccessors
 * @memberof Websoft.WT.Succession
 * @description Получение списка преемников по подчиненным сотрудника
 * @author BG
 * @param {bigint} iPersonID - ID сотрудника
 * @param {string} sTypeCollaborator - Выбор, по кому осуществлять выборку ( subordinates/main_subordinates/func_subordinates/all_subordinates )
 * @param {int[]} arrBossTypesID - массив ID типов руководителя.
 * @param {boolean} bReturnByBoss - возвращать преемников, для которых сотрудник является руководителем
 * @param {boolean} bReturnByHR - возвращать преемников, для которых сотрудник является HR'ом
 * @param {string} iAppLevel - Роль, для которой отображается информация. Если выбрано Получать автоматически, то роль передается из приложения.
 * @param {string} sState - Статус ключевой должности.
 * @param {string} sFilter - Дополнительные условия для xquery-запроса по каталогу ключевых должностей.
 * @param {string[]} arrReturnData - Массив флагов расчёта дополнительных результатов.
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnSuccessorObjects}
*/
function GetSuccessors( iPersonID, sTypeCollaborator, arrBossTypesID, bReturnByBoss, bReturnByHR, iAppLevel, sState, sFilter, arrReturnData, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	
	var oPaging = ( DataType( oCollectionParams ) == 'object' && ObjectType( oCollectionParams ) == 'JsObject' ) ? oCollectionParams.GetOptProperty("paging", {SIZE: null, INDEX: 0}) : {SIZE: null, INDEX: 0};

	oRes.paging = oPaging;

	var arrXQConds = [];

	if ( sFilter == null || sFilter == undefined )
		sFilter = "";

	if ( sFilter != "" )
	{
		arrXQConds.push( sFilter );
	}

	if ( oCollectionParams.HasProperty( "filters" ) && IsArray( oCollectionParams.filters ) )
	{
		arrFilters = oCollectionParams.filters;
	}
	else
	{
		arrFilters = [];
	}
	
	if( !IsArray(arrReturnData) )
		arrReturnData = [];

	for ( oFilter in arrFilters )
	{
		if ( oFilter.type == 'search' )
		{
			if ( oFilter.value != '' ) 
				arrXQConds.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )" );
		}
	}

	try
	{
		var arrStates = sState.split( ';' );
		if ( ArrayCount( arrStates ) > 0 )
		{
			arrXQConds.push( "MatchSome( $elem/status, ( " + ArrayMerge( arrStates, 'XQueryLiteral( This )', ',' ) + " ) )" );
		}
	}
	catch( ex )
	{
	}

	var arrPersonIDs = [];
	var libParam;

	if ( iAppLevel == null || iAppLevel == undefined )
	{
		if ( tools_web.is_true( bReturnByBoss ) )
		{
			if ( sTypeCollaborator == "" || sTypeCollaborator == null || sTypeCollaborator == undefined )
			{
				libParam = tools.get_params_code_library('libMain');
				var sTypeCollaborator = libParam.GetOptProperty("DefaultSubordinateType", "all_subordinates"); //by default: Непосредственные и функциональные подчиненные с иерархией
			}
			
			try
			{
				arrPersonIDs = ArrayUnion(arrPersonIDs, ArrayExtract(tools.call_code_library_method( "libMain", "GetTypicalSubordinates", [ iPersonID, sTypeCollaborator, arrBossTypesID ] ), "This.id.Value"));
			}
			catch(err)
			{
				oRes.error = 1;
				oRes.errorText = err;
				return oRes;
			}
		}
		
		if ( tools_web.is_true( bReturnByHR ) )
		{
			libParam = tools.get_params_code_library('libSuccession');
			var iBossTypeID = libParam.GetOptProperty("iHRBossTypeID", 2691248884100914019); //by default: Менеджер по персоналу
			var arrHRBossTypesID = [];
			arrHRBossTypesID.push(iBossTypeID)
			
			try
			{
				arrPersonIDs = ArrayUnion(arrPersonIDs, ArrayExtract(tools.call_code_library_method( "libMain", "GetTypicalSubordinates", [ iPersonID, "func_subordinates", arrHRBossTypesID ] ), "This.id.Value"));
			}
			catch(err)
			{
				oRes.error = 1;
				oRes.errorText = err;
				return oRes;
			}
		}
	}
	else
	{
		switch ( iAppLevel )
		{
			case 10:
			case 7:
				break;

			case 5:
					if ( oCollectionParams.manager_type_id != null )
					{
						arrSuccessorsIDs = [];

						arrPersons = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iPersonID, [ 'func' ], false, '', [ 'id' ], '', true, true, true, true, oCollectionParams.manager_type_id , true ] )

						arrSuccessors = ArrayDirect( tools.xquery( "for $elem_qc in successors where MatchSome( $elem_qc/key_person_id, ( " + ArrayMerge( arrPersons, 'This.id', ',' ) + " ) ) return $elem_qc/Fields( 'id' )" ) );
						
						if ( ArrayOptFirstElem ( arrSuccessors ) != undefined )
							arrXQConds.push( 'MatchSome( $elem/id, ( ' + ArrayMerge( arrSuccessors, 'This.id.Value', ',' ) + ' ) )' )
						else
							arrXQConds.push( '$elem/id = 0' )
					}

					break;
			case 3:
						oExpert = ArrayOptFirstElem( tools.xquery( "for $elem in experts where $elem/type = 'collaborator' and $elem/person_id = " + iPersonID + " return $elem/Fields( 'id' )" ) );

						arrRoles = [];
						if ( oExpert != undefined )
						{
							arrRoles = tools.xquery( "for $elem in roles where $elem/catalog_name = 'key_position' and contains($elem/experts," + OptInt( oExpert.id, 0 ) + ") return $elem/Fields('id')" );
						}

						if ( ArrayCount( arrRoles ) > 0 )
						{
							arrKeyPositions = XQuery( 'for $elem in key_positions where MatchSome( $elem/role_id, ( ' + ArrayMerge( arrRoles, 'This.id', ',' ) + ' ) ) order by $elem/id return $elem/Fields( \'id\' )' );
							arrXQConds.push( 'MatchSome( $elem/key_position_id, ( ' + ArrayMerge( arrKeyPositions, 'This.id', ',' ) + ' ) )' )
						}
						else
							arrXQConds.push( '$elem/key_position_id = 0' )

					break;
			case 1:
						arrSuccessorsIDs = [];

						arrPersons = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iPersonID, [ 'func' ], false, '', [ 'id' ], '', true, true, true, true, [], true ] );
						
						arrSuccessorsIDs = ArrayExtract( XQuery( "for $elem in successors where MatchSome( $elem/person_id, ( " + ArrayMerge( arrPersons, 'This.id', ',' ) + " ) ) order by $elem/id return $elem/Fields( 'id' )" ), 'This.id' );
						
						if ( ArrayCount( arrSuccessorsIDs ) > 0 )
							arrXQConds.push( 'MatchSome( $elem/id, ( ' + ArrayMerge( arrSuccessorsIDs, 'This', ',' ) + ' ) )' )
						else
							arrXQConds.push( '$elem/id = 0' )
					
					break;
		}
	}

	var sXQConds = ArrayOptFirstElem( arrXQConds ) == undefined ? "" : " where " + ArrayMerge( arrXQConds, "This", " and " );

	if ( iAppLevel == null || iAppLevel == undefined )
	{
		sReqLongListSuccessors = "for $elem_qc in successors where MatchSome( $elem_qc/key_person_id, ( " + ArrayMerge( arrPersonIDs, 'This', ',' ) + " ) ) return $elem_qc";
		xarrSuccessors = tools.xquery( sReqLongListSuccessors );
	}
	else
	{
		xarrSuccessors = XQuery( "for $elem in successors " + sXQConds + " return $elem" );
	}
	var arrCareerReserves = [];
	if(ArrayOptFirstElem(arrReturnData) != undefined)
	{
		var sReqCR = "for $elem_qc in career_reserves where $elem_qc/position_type != 'adaptation' and MatchSome($elem_qc/person_id, (" + ArrayMerge(xarrSuccessors, "This.person_id.Value", ",") + ")) and MatchSome($elem_qc/status, ('active','failed','passed')) order by $elem_qc/person_id, $elem_qc/status return $elem_qc/Fields('id','person_id','status')";
		
		arrCareerReserves = ArrayDirect(tools.xquery(sReqCR));
	}
	
	var arrCareerReservesPerson;
	for ( catSuccessor in xarrSuccessors )
	{
		docSuccessor = tools.open_doc( catSuccessor.id );
		if ( docSuccessor != undefined )
		{
			teSuccessor = docSuccessor.TopElem;
			oElemSuccessor = cast_Successor(teSuccessor)
			arrCareerReservesPerson = ArraySelectBySortedKey(arrCareerReserves, teSuccessor.person_id.Value, "person_id");
			for(itemCalc in arrReturnData)
			{
				switch(itemCalc)
				{
					case "active":
					{
						oElemSuccessor.career_reserve_active = ArrayCount(ArraySelectBySortedKey(arrCareerReservesPerson, 'active', "status"));
						break;
					}
					case "finished":
					{
						oElemSuccessor.career_reserve_finished = ArrayCount(ArraySelectBySortedKey(arrCareerReservesPerson, 'failed', "status"));
						oElemSuccessor.career_reserve_finished += ArrayCount(ArraySelectBySortedKey(arrCareerReservesPerson, 'passed', "status"));
						break;
					}
				}
			}
			oRes.array.push( oElemSuccessor );
		}
	}

	if ( ObjectType( oCollectionParams.sort ) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		switch( sFieldName )
		{
			case "code":
			case "name":
			case "color":
				sFieldName = "StrUpperCase(" + sFieldName + ")";
		}
		oRes.array = ArraySort( oRes.array, sFieldName, ( ( oCollectionParams.sort.DIRECTION == "DESC" ) ? "-" : "+" ) );
	}
	
	if ( ObjectType( oCollectionParams.paging ) == 'JsObject' && oCollectionParams.paging.SIZE != null )
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount( oRes.array );
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange( oRes.array, ( OptInt( oCollectionParams.paging.START_INDEX, 0 ) > 0 ? oCollectionParams.paging.START_INDEX : OptInt( oCollectionParams.paging.INDEX, 0 ) * oCollectionParams.paging.SIZE ), oCollectionParams.paging.SIZE );
	}

	return oRes
}

/**
 * @function GetSuccessorsKeyPositionByPerson
 * @memberof Websoft.WT.Succession
 * @description Ключевые должности сотрудника как преемника
 * @author BG
 * @param {bigint} iPersonID - ID сотрудника
 * @param {string} sStatus - ограничение по статусам
 * @returns {ReturnSuccessorObjects}
*/

function GetSelfSuccessorsKeyPosition( iPersonID, sStatus )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	
	var sCond = "";
	if(sStatus != "all")
	{
		//sCond = " and $elem/status != 'rejected' and $elem/status != 'archive' "
		sCond = " and MatchSome($elem/status, ('approved', 'inposition') ) "
	}
	
	sReqSuccessors = "for $elem in successors where $elem/person_id=" + iPersonID + sCond + " return $elem ";

	xarrSuccessors = tools.xquery(sReqSuccessors);
	
	for ( catSuccessor in xarrSuccessors )
	{
		docSuccessor = tools.open_doc( catSuccessor.id );
		if ( docSuccessor != undefined )
		{
			teSuccessor = docSuccessor.TopElem;
			oRes.array.push( cast_Successor(teSuccessor) );
		}
	}

	return oRes

}

// ======================================================================================
// ==============================  Удаленные действия ===================================
// ======================================================================================

function AppraiseSuccessor(sFormCommand, Param, PersonIDParam)
{
	return set_operation_key_position(sFormCommand, Param, PersonIDParam, "assessment")
}


/**
 * @function AddChangeKeyPosition
 * @memberof Websoft.WT.Succession
 * @description Добавить/изменить ключевую должность.
 * @author BG
 * @param {string} sFormCommand - Текущий режим удаленного действия
 * @param {string} sFormFields - JSON-строка с возвратом из формы УД
 * @param {bigint} iKeyPositionIDParam - ID ключевой должности
 * @param {bool} bSendBossNotification - Отправлять уведомления при изменении ключевой должности
 * @param {bigint} iCurUserID - Текущий пользователь
 * @param {bigint} iCurCareerReserveTypeID - Контекстное значение типа кадрового резерва
 * @param {bigint} sStateCreate - Статус при создании ключевой должности
 * @returns {WTLPEFormResult}
*/
function AddChangeKeyPosition(sFormCommand, sFormFields, iKeyPositionIDParam, bSendBossNotification, iCurUserID, iCurCareerReserveTypeID, sStateCreate, iAppLevel, iManagerTypeID )
{
	var oRet = tools.get_code_library_result_object();
	oRet.result = {};

	var arrFormFields = [];
	var libParam = tools.get_params_code_library('libSuccession');
	
	iCurUserID = OptInt(iCurUserID);
	iCurCareerReserveTypeID = OptInt(iCurCareerReserveTypeID);

	try
	{	
		var oFormField = form_fields_to_object(sFormFields);
		
		var iKeyPositionID = OptInt(iKeyPositionIDParam);
		
		if(iKeyPositionID == undefined )
		{
			
			iKeyPositionID = OptInt(oFormField.GetOptProperty("cur_key_position_id"));
			
			if(iKeyPositionID != undefined )
			{
				arrFormFields.push({
							name: "cur_key_position_id",
							type: "hidden",
							value: iKeyPositionID
						});
			}
		}
		var docKeyPosition = null;
		var teKeyPosition = null;
		if(iKeyPositionID != undefined)
		{
			docKeyPosition = tools.open_doc(iKeyPositionID);
			
			if(docKeyPosition == undefined )
				throw StrReplace("Не найден объект с ID: [{PARAM1}]", "{PARAM1}", iKeyPositionID);
			
			teKeyPosition = docKeyPosition.TopElem;
			if(teKeyPosition.Name != 'key_position')
				throw StrReplace("Объект с ID: [{PARAM1}] не является ключевой должностью", "{PARAM1}", iKeyPositionID);
		}

		if(iAppLevel < 3){
			if(ArrayOptFirstElem( XQuery( "for $elem in func_managers where $elem/person_id = " + iCurUserID + " return $elem/Fields('id')" ) ) == undefined)
			{
				oRet.error = 503;
				oRet.errorText = "Не руководителю возможность изменения/добавления ключевых должностей недоступна.";
				oRet.result = close_form(oRet.errorText);
				return oRet;
			}
		}

		var bCreateKeyPosition = libParam.GetOptProperty("BossRights.bCreateKeyPosition", true);
		if(!bCreateKeyPosition && teKeyPosition == null)
		{
			oRet.error = 503;
			oRet.errorText = "Возможность создания ключевых должностей отключена в настройках.";
			oRet.result = close_form(oRet.errorText);
			return oRet;
		}
		
		var sCareerReserveTypeName = "";
		var sRiskPerspectiveName = "";
		var sKeyPositionThreatName = "";
		var arrSuccessors = [];
		if(teKeyPosition != null)
		{
			var CareerReserveType = teKeyPosition.career_reserve_type_id.OptForeignElem
			sCareerReserveTypeName = CareerReserveType == undefined ? "" : CareerReserveType.name.Value;

			var RiskPerspective = teKeyPosition.risk_perspective_id.OptForeignElem
			sRiskPerspectiveName = RiskPerspective == undefined ? "" : RiskPerspective.name.Value;

			var KeyPositionThreat = teKeyPosition.key_position_threat_id.OptForeignElem
			sKeyPositionThreatName = KeyPositionThreat == undefined ? "" : KeyPositionThreat.name.Value;
			arrSuccessors = tools.xquery("for $elem in successors where $elem/key_position_id=" + teKeyPosition.id.Value + " and $elem/status='active' return $elem")
		}
		
		var bChangeKeyPosition = libParam.GetOptProperty("BossRights.bChangeKeyPosition", true);
		var bIsReadOnly = (!bChangeKeyPosition && teKeyPosition != null);

		var bChangeSuccessorKeyPosition = libParam.GetOptProperty("BossRights.bChangeSuccessorKeyPosition", true);

		var sNextStep = oFormField.GetOptProperty("step_next", "form");

		if ( sFormCommand == "eval" || ( sFormCommand == "submit_form" && sNextStep == "form" ) )
		{
			arrFormFields.push({name: "step_next", type: "hidden", value: "do"});
	
			if ( teKeyPosition == null )
			{
				sXQueryConds = '$elem/id = 0';
				if ( iAppLevel == null || iAppLevel == undefined )
				{
					arrPersons = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iCurUserID, [ 'func', 'fact' ], true, '', [ 'id' ], '', true, true, true, true, [ ], true ] )

					if ( ArrayCount( arrPersons ) > 0 )
						sXQueryConds = ( 'MatchSome( $elem/basic_collaborator_id, ( ' + ArrayMerge( arrPersons, 'This', ',' ) + ' ) )' );

					arrFormFields.push({name: "position_id", label: "Должность", title: "Выберите элемент", type: "foreign_elem", mandatory: true, query_qual: sXQueryConds, multiple: false, catalog: "position"}); 
				}
				else
				{
					if ( iAppLevel == 10 || iAppLevel == 7 || iAppLevel == 3 )
					{
						sXQueryConds = '';
					}

					if ( iAppLevel == 5 )
					{
						if ( iManagerTypeID != null )
						{
							arrPersons = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iCurUserID, [ 'func' ], true, '', [ 'id' ], '', true, true, true, true, [ iManagerTypeID ], true ] )
	
							if ( ArrayCount( arrPersons ) > 0 )
								sXQueryConds = ( 'MatchSome( $elem/basic_collaborator_id, ( ' + ArrayMerge( arrPersons, 'This', ',' ) + ' ) )' );
						}
					}

					arrFormFields.push({name: "position_id", label: "Должность", title: "Выберите элемент", type: "foreign_elem", mandatory: true, query_qual: sXQueryConds, multiple: false, catalog: "position"}); 

				}
			}
			else
			{
				arrFormFields.push({name: "paragraph_position_id", type: "paragraph", value: "<b>Ключевая должность:</b>&nbsp;" + teKeyPosition.person_position_name.Value + "("+ teKeyPosition.person_fullname.Value +")"}); 
			}
			
			if(	iCurCareerReserveTypeID != undefined)
			{
				arrFormFields.push({name: "career_reserve_type_id", type: "hidden", value: iCurCareerReserveTypeID}); 
				var sContextCareerReserveTypeName = ArrayOptFirstElem(tools.xquery("for $elem in career_reserve_types where $elem/id=" + iCurCareerReserveTypeID + " return $elem/Fields('name')"), {name: ""}).name;
				arrFormFields.push({name: "paragraph_career_reserve_type_id", type: "paragraph", value: "<b>Кадровый резерв:</b>&nbsp;" + sContextCareerReserveTypeName }); 
			}
			else if(!bIsReadOnly)
			{
				arrFormFields.push({name: "career_reserve_type_id", label: "Тип кадрового резерва", title: "Выберите элемент", type: "foreign_elem", mandatory: false, multiple: false, catalog: "career_reserve_type", display_value: sCareerReserveTypeName, value: (teKeyPosition != null ? teKeyPosition.career_reserve_type_id.Value : null)}); 
			}
			else
			{
				arrFormFields.push({name: "paragraph_career_reserve_type_id", type: "paragraph", value: "<b>Тип кадрового резерва:</b>&nbsp;" + sCareerReserveTypeName }); 
			}
				
			if(!bIsReadOnly)
			{
				
				//arrFormFields.push({name: "risk_perspective_id", label: ms_tools.get_const('gorizontriska'), title: "Выберите элемент", type: "foreign_elem", multiple: false, catalog: "risk_perspective", display_value: sRiskPerspectiveName, value: (teKeyPosition != null ? teKeyPosition.risk_perspective_id.Value : null), column : 2}); 
				//arrFormFields.push({name: "key_position_threat_id", label: "Актуальная угроза", title: "Выберите элемент", type: "foreign_elem", multiple: false, catalog: "key_position_threat", display_value: sKeyPositionThreatName, value: (teKeyPosition != null ? teKeyPosition.key_position_threat_id.Value : null), column : 2}); 
				//arrFormFields.push({name: "risk_levels", label: ms_tools.get_const('faktoryriska'), title: "Выберите элемент", type: "foreign_elem", multiple: true, catalog: "risk_level", display_value: (teKeyPosition != null ? ArrayMerge(teKeyPosition.risk_levels, "This.risk_level_id.ForeignElem.name.Value", "|||") : ""), value: (teKeyPosition != null ? ArrayMerge(teKeyPosition.risk_levels, "This.risk_level_id", ";") : ""), column : 2}); 

				var arrRiskPerspectiveEntrys = ArrayExtract(XQuery("for $elem in risk_perspectives order by $elem/name return $elem/Fields('id','name')"), "({name:This.name.Value,value:This.id.Value})");
				arrFormFields.push({name: "risk_perspective_id", label: ms_tools.get_const('gorizontriska'), type: "select", entries: arrRiskPerspectiveEntrys, value: (teKeyPosition != null ? teKeyPosition.risk_perspective_id.Value : null)}); 

				var arrKeyPositionThreatEntrys = ArrayExtract(XQuery("for $elem in key_position_threats order by $elem/name return $elem/Fields('id','name')"), "({name:This.name.Value,value:This.id.Value})");
				arrFormFields.push({name: "key_position_threat_id", label: "Актуальная угроза", type: "select", entries: arrKeyPositionThreatEntrys, value: (teKeyPosition != null ? teKeyPosition.key_position_threat_id.Value : null)}); 

				var arrRiskLevelsEntrys = ArrayExtract(XQuery("for $elem in risk_levels order by $elem/name return $elem/Fields('id','name')"), "({name:This.name.Value,value:This.id.Value})");
				arrFormFields.push({name: "risk_levels", label: ms_tools.get_const('faktoryriska'), type: "list", entries: arrRiskLevelsEntrys, value: (teKeyPosition != null ? ArrayExtract(teKeyPosition.risk_levels, "This.risk_level_id.Value") : [])}); 

			}
			else
			{
				arrFormFields.push({name: "paragraph_risk_perspective_id", type: "paragraph", value: "<b>" + ms_tools.get_const('gorizontriska') + ":</b>&nbsp;" + sRiskPerspectiveName }); 

				arrFormFields.push({name: "paragraph_key_position_threat_id", type: "paragraph", value: "<b>Актуальная угроза:</b>&nbsp;" + sKeyPositionThreatName }); 

				arrFormFields.push({name: "paragraph_risk_levels", type: "paragraph", value: (teKeyPosition != null ? "<b>" + ms_tools.get_const('faktoryriska') + ":</b><br>" + ArrayMerge(teKeyPosition.risk_levels, "This.risk_level_id.ForeignElem.name.Value", ", ") : "") }); 
			}
			
			
			if(teKeyPosition == null && bChangeSuccessorKeyPosition)
			{
				arrFormFields.push({name: "successors", label: "Преемники", title: "Выберите элемент", type: "foreign_elem", multiple: true, catalog: "collaborator", display_value: ArrayMerge(arrSuccessors, "This.name.Value", "|||"), value: ArrayMerge(arrSuccessors, "This.person_id.Value", ";")}); 
			}
			else if(teKeyPosition != null)
			{
				if (bChangeSuccessorKeyPosition)
				{
					arrFormFields.push({name: "successors", label: "Преемники", title: "Выберите элемент", type: "foreign_elem", multiple: true, catalog: "collaborator", display_value: ArrayMerge(arrSuccessors, "This.name.Value", "|||"), value: ArrayMerge(arrSuccessors, "This.person_id.Value", ";")}); 
				}
				else
				{
					arrFormFields.push({name: "paragraph_successors", type: "paragraph", value: "<b>Преемники: </b><br>" + ArrayMerge(arrSuccessors, "This.name.Value", "<br>") });
				}
					
			}
			
			if(!bIsReadOnly)
			{
				/*
				if(teKeyPosition != null)
				{
					for(itemFile in teKeyPosition.files)
					{
						arrFormFields.push({name: "paragraph_file_name_" + itemFile.file_id.Value, type: "paragraph", value: itemFile.file_id.ForeignElem.name.Value });
					}
				}
				*/
				arrFormFields.push({name: "paragraph_file_names", type: "paragraph", value: (teKeyPosition != null && ArrayOptFirstElem(teKeyPosition.files) != undefined ? "<b>Файлы:</b><br>" + ArrayMerge(teKeyPosition.files, "'<a href=\"/download_file.html?file_id=' + This.file_id.Value + '\">' + This.file_id.ForeignElem.name.Value + '</a>'", "<br>") : "") }); 
				
				arrFormFields.push({name: "file", label: "Добавить файл", title: "Добавить файл", type: "file"}); 
			}

			var sTitle = teKeyPosition != null ? "Изменение ключевой должности" : "Создание ключевой должности";
			var arrButtons = [];
			var oForm = {
				command: "display_form",
				height: 650,
				title: sTitle,
				form_fields: arrFormFields,
				buttons: [{ name: "submit", label: "Сохранить", type: "submit" },{ name: "cancel", label: "Отменить", type: "cancel"}]
			};
			
			oRet.result = oForm;
		}
		else if(sFormCommand == "submit_form" && sNextStep == "do")
		{
			oRet.result = set_key_position( docKeyPosition, oFormField, bSendBossNotification, iCurUserID, sStateCreate );
		}
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = "Ошибка вызова удаленного действия \"AddChangeKeyPosition\"\r\n" + err;
		oRet.result = close_form(oRet.errorText);
		toLog("ERROR: AddChangeKeyPosition: " + oRet.errorText, true);
	}
	return oRet;
}


/**
 * @function AddChangeSuccessor
 * @deprecated 2023.2 -- В функции реализована интерфейсная часть УД. Код перенесен в файл УД.
 * @memberof Websoft.WT.Succession
 * @description Добавить/изменить преемника.
 * @author BG
 * @param {string} sFormCommand - Текущий режим удаленного действия
 * @param {string} sFormFields - JSON-строка с возвратом из формы УД
 * @param {bigint} iSuccessorIDParam - ID преемника
 * @param {bool} bSendPersonNotificationOnCreate - Отправлять уведомления преемнику при добавлении преемника
 * @param {bool} bSendHRNotificationOnChange - Отправлять уведомления HR'у при изменении преемника
 * @param {bool} bSendOwnerNotificationOnChangeCreate - Отправлять владельцу ключевой должности при создании или изменении преемника
 * @param {bigint} iCurUserID - Текущий пользователь
 * @param {bigint} iCurKeyPositionID - Контекстное значение ключевой должности
 * @param {bigint} iPersonNotificationID - ID типа уведомления сотруднику при назначении его преемником
 * @param {bigint} iHRNotificationID - ID типа уведомления HR при изменении преемника
 * @param {bigint} iOwnerNotificationIDOnCreate - ID типа уведомления владельцу ключевой должности при создании преемника 
 * @param {bigint} iOwnerNotificationIDOnChange - ID типа уведомления владельцу ключевой должности при изменении преемника 
 * @param {bool} bCheckEfficiencyCollaboratorParam - Проверка параметра efficiency_collaborator приложения websoft_succession_plan
 * @param {bool} bCheckEfficiencyCanChangeParam - Проверка параметра efficiency_can_change приложения websoft_succession_plan
 * @param {bool} bCheckPotentialCollaboratorParam - Проверка параметра potential_collaborator приложения websoft_succession_plan
 * @param {bool} bCheckPotentialCanChangeParam - Проверка параметра potential_can_change приложения websoft_succession_plan
 * @returns {WTLPEFormResult}
*/

function AddChangeSuccessor(sFormCommand, sFormFields, iSuccessorIDParam, bSendPersonNotificationOnCreate, bSendHRNotificationOnChange, iCurUserID, iCurKeyPositionID, bSendOwnerNotificationOnChangeCreate, iPersonNotificationID, iHRNotificationID, iOwnerNotificationIDOnCreate, iOwnerNotificationIDOnChange, bCheckEfficiencyCollaboratorParam, bCheckEfficiencyCanChangeParam, bCheckPotentialCollaboratorParam, bCheckPotentialCanChangeParam, iAppLevel, iManagerTypeID )
{
	var oRet = tools.get_code_library_result_object();
	oRet.result = {};

	var arrFormFields = [];
	var libParam = tools.get_params_code_library('libSuccession');

	iCurUserID = OptInt(iCurUserID);
	iCurKeyPositionID = OptInt(iCurKeyPositionID);

	try
	{
		bSendOwnerNotificationOnChangeCreate = tools_web.is_true( bSendOwnerNotificationOnChangeCreate );
	}
	catch( ex )
	{
		bSendOwnerNotificationOnChangeCreate = false;
	}

	try
	{
		iPersonNotificationID = Int( iPersonNotificationID );
	}
	catch( ex )
	{
		iPersonNotificationID = null;
	}

	try
	{
		iHRNotificationID = Int( iHRNotificationID );
	}
	catch( ex )
	{
		iHRNotificationID = null;
	}

	try
	{
		iOwnerNotificationIDOnCreate = Int( iOwnerNotificationIDOnCreate );
	}
	catch( ex )
	{
		iOwnerNotificationIDOnCreate = null;
	}

	try
	{
		iOwnerNotificationIDOnChange = Int( iOwnerNotificationIDOnChange );
	}
	catch( ex )
	{
		iOwnerNotificationIDOnChange = null;
	}

	try
	{
		bCheckEfficiencyCollaboratorParam = tools_web.is_true( bCheckEfficiencyCollaboratorParam );
	}
	catch( ex )
	{
		bCheckEfficiencyCollaboratorParam = false;
	}

	try
	{
		bCheckEfficiencyCanChangeParam = tools_web.is_true( bCheckEfficiencyCanChangeParam );
	}
	catch( ex )
	{
		bCheckEfficiencyCanChangeParam = false;
	}

	try
	{
		bCheckPotentialCollaboratorParam = tools_web.is_true( bCheckPotentialCollaboratorParam );
	}
	catch( ex )
	{
		bCheckPotentialCollaboratorParam = false;
	}

	try
	{
		bCheckPotentialCanChangeParam = tools_web.is_true( bCheckPotentialCanChangeParam );
	}
	catch( ex )
	{
		bCheckPotentialCanChangeParam = false;
	}

	bEfficiencyCollaborator = false;
	bEfficiencyCanChange = false;
	bPotentialCollaborator = false;
	bPotentialCanChange = false;

	catApplication = ArrayOptFirstElem( XQuery( "for $elem in applications where $elem/code = 'websoft_succession_plan' return $elem/Fields( 'id' )" ) );
	if ( catApplication != undefined )
	{
		docApplication = tools.open_doc( catApplication.id );
		if ( docApplication != undefined )
		{
			wEfficiencyCollaborator = docApplication.TopElem.wvars.GetOptChildByKey( 'efficiency_collaborator' );
			wEfficiencyCanChange = docApplication.TopElem.wvars.GetOptChildByKey( 'efficiency_can_change' );
			wPotentialCollaborator = docApplication.TopElem.wvars.GetOptChildByKey( 'potential_collaborator' );
			wPotentialCanChange = docApplication.TopElem.wvars.GetOptChildByKey( 'potential_can_change' );

			if ( bCheckEfficiencyCollaboratorParam && wEfficiencyCollaborator != undefined && tools_web.is_true( wEfficiencyCollaborator.value ) )
				bEfficiencyCollaborator = true;

			if ( bCheckEfficiencyCanChangeParam && wEfficiencyCanChange != undefined && tools_web.is_true( wEfficiencyCanChange.value ) )
				bEfficiencyCollaborator = true;

			if ( bCheckPotentialCollaboratorParam && wPotentialCollaborator != undefined && tools_web.is_true( wPotentialCollaborator.value ) )
				bEfficiencyCollaborator = true;

			if ( bCheckPotentialCanChangeParam && wPotentialCanChange != undefined && tools_web.is_true( wPotentialCanChange.value ) )
				bEfficiencyCollaborator = true;
		}
	}

	try
	{	
		var oFormField = form_fields_to_object(sFormFields);
		
		var iSuccessorID = OptInt(iSuccessorIDParam);
		
		if(iSuccessorID == undefined )
		{
			
			iSuccessorID = OptInt(oFormField.GetOptProperty("cur_successor_id"));
			
			if(iSuccessorID != undefined )
			{
				arrFormFields.push({
							name: "cur_successor_id",
							type: "hidden",
							value: iSuccessorID
						});
			}
		}

		var docSuccessor = null;
		var teSuccessor = null;

		if ( iSuccessorID != undefined )
		{
			docSuccessor = tools.open_doc(iSuccessorID);

			if ( docSuccessor == undefined )
				throw StrReplace( "Не найден объект с ID: [{PARAM1}]", "{PARAM1}", iSuccessorID );

			teSuccessor = docSuccessor.TopElem;
			if ( teSuccessor.Name != 'successor' )
				throw StrReplace( "Объект с ID: [{PARAM1}] не является преемником", "{PARAM1}", iSuccessorID );
		}
		
		if(iAppLevel < 3)
		{
			if ( ArrayOptFirstElem( XQuery( "for $elem in func_managers where $elem/person_id = " + iCurUserID + " return $elem/Fields( 'id' )" ) ) == undefined)
			{
				oRet.error = 503;
				oRet.errorText = "Не руководителю возможность изменения/добавления преемников недоступна.";
				oRet.result = close_form( oRet.errorText );
				return oRet;
			}
			
			var bCreateSuccessor = libParam.GetOptProperty( "BossRights.bCreateSuccessor", true );
			if ( ! bCreateSuccessor && teSuccessor == null )
			{
				oRet.error = 503;
				oRet.errorText = "Возможность создания преемников отключена в настройках.";
				oRet.result = close_form( oRet.errorText );
				return oRet;
			}
		}

		var sDevelopmentPotentialName = "";
		var sEfficiencyEstimationName = "";
		var sReadinessLevelName = "";

		if ( teSuccessor != null )
		{
			var DevelopmentPotential = teSuccessor.development_potential_id.OptForeignElem
			sDevelopmentPotentialName = DevelopmentPotential == undefined ? "" : DevelopmentPotential.name.Value;

			var EfficiencyEstimation = teSuccessor.efficiency_estimation_id.OptForeignElem
			sEfficiencyEstimationName = EfficiencyEstimation == undefined ? "" : EfficiencyEstimation.name.Value;
 
			var ReadinessLevel = teSuccessor.readiness_level_id.OptForeignElem
			sReadinessLevelName = ReadinessLevel == undefined ? "" : ReadinessLevel.name.Value;
		}

		var bChangeSuccessor = libParam.GetOptProperty( "BossRights.bChangeSuccessor", true );
		var bIsReadOnly = ( ! bChangeSuccessor && teSuccessor != null );

		var bChangeStatusSuccessor = libParam.GetOptProperty( "BossRights.bChangeStatusSuccessor", true );

		var sNextStep = oFormField.GetOptProperty( "step_next", "form" );

		if ( sFormCommand == "eval" || ( sFormCommand == "submit_form" && sNextStep == "form" ) )
		{
			arrFormFields.push( {name: "step_next", type: "hidden", value: "do"} );
	
			if ( teSuccessor == null && iCurKeyPositionID == undefined )
			{
				sXQueryConds = '$elem/id = 0';

				if ( iAppLevel == null || iAppLevel == undefined )
				{
					arrPersons = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iCurUserID, [ 'func', 'fact' ], true, '', [ 'id' ], '', true, true, true, true, [ ], true ] )

					if ( ArrayCount( arrPersons ) > 0 )
						sXQueryConds = ( 'MatchSome( $elem/person_id, ( ' + ArrayMerge( arrPersons, 'This', ',' ) + ' ) )' );

					arrFormFields.push({name: "key_position_id", label: "Ключевая должность", title: "Выберите элемент", type: "foreign_elem", mandatory: true, query_qual: sXQueryConds, multiple: false, catalog: "key_position"});
				}
				else
				{
					if ( iAppLevel == 10 || iAppLevel == 7 )
					{
						sXQueryConds = '';
					}

					if ( iAppLevel == 5 )
					{
						if ( iManagerTypeID != null )
						{
							arrPersons = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iCurUserID, [ 'func' ], true, '', [ 'id' ], '', true, true, true, true, [ iManagerTypeID ], true ] )
	
							if ( ArrayCount( arrPersons ) > 0 )
								sXQueryConds = ( 'MatchSome( $elem/person_id, ( ' + ArrayMerge( arrPersons, 'This', ',' ) + ' ) )' );
						}
					}

					arrFormFields.push({name: "key_position_id", label: "Ключевая должность", title: "Выберите элемент", type: "foreign_elem", mandatory: true, query_qual: sXQueryConds, multiple: false, catalog: "key_position"});
				}
			}
			else if ( iCurKeyPositionID != undefined )
			{
				arrFormFields.push({name: "key_position_id", type: "hidden", value: iCurKeyPositionID});
				var sKeyPositionName = ArrayOptFirstElem( tools.xquery( "for $elem in key_positions where $elem/id=" + iCurKeyPositionID + " return $elem/Fields('name')" ), { name: "" } ).name.Value;
				arrFormFields.push({name: "paragraph_key_position_id", type: "paragraph", value: "<b>Ключевая должность:</b>&nbsp;" + sKeyPositionName }); 
			}
			else
			{
				arrFormFields.push({name: "paragraph_key_position_id", type: "paragraph", value: "<b>Ключевая должность:</b>&nbsp;" + teSuccessor.key_position_id.person_position_name.Value +" (" + teSuccessor.key_position_id.person_fullname.Value + ")"}); 
			}

			if ( teSuccessor == null )
			{
				sXQueryConds = '$elem/id = 0';

				if ( iAppLevel == null || iAppLevel == undefined )
				{
					arrPersons = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iCurUserID, [ 'func', 'fact' ], true, '', [ 'id' ], '', true, true, true, true, [ ], true ] )

					if ( ArrayCount( arrPersons ) > 0 )
						sXQueryConds = ( 'MatchSome( $elem/id, ( ' + ArrayMerge( arrPersons, 'This', ',' ) + ' ) )' );

					arrFormFields.push({name: "person_id", label: "Сотрудник", title: "Выберите элемент", type: "foreign_elem", mandatory: true, query_qual: sXQueryConds, multiple: false, catalog: "collaborator"});
				}
				else
				{
					if ( iAppLevel == 10 || iAppLevel == 7 || iAppLevel == 3 )
					{
						sXQueryConds = '';
					}

					if ( iAppLevel == 5 )
					{
						if ( iManagerTypeID != null )
						{
							arrPersons = tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ iCurUserID, [ 'func' ], true, '', [ 'id' ], '', true, true, true, true, [ iManagerTypeID ], true ] )
	
							if ( ArrayCount( arrPersons ) > 0 )
								sXQueryConds = ( 'MatchSome( $elem/person_id, ( ' + ArrayMerge( arrPersons, 'This', ',' ) + ' ) )' );
						}
					}

					arrFormFields.push({name: "person_id", label: "Сотрудник", title: "Выберите элемент", type: "foreign_elem", mandatory: true, query_qual: sXQueryConds, multiple: false, catalog: "collaborator"});
				}
			}
			else
			{
				arrFormFields.push({name: "paragraph_person_id", type: "paragraph", value: "<b>Сотрудник:</b>&nbsp;" + teSuccessor.person_fullname.Value}); 
			}

			if ( teSuccessor == null || bChangeStatusSuccessor )
			{
				var oStatusField = { name: "status", label: "Статус", type: "select", value: (teSuccessor != null ? teSuccessor.status.Value: null), mandatory: false, entries: [] };
				for ( _status in common.successor_status_types )
				{
					oStatusField.entries.push( { name: _status.name.Value, value: _status.id.Value } );
				}
				arrFormFields.push( oStatusField );
			}
			else if ( teSuccessor != null )
			{
				var fldSuccessorStatus = teSuccessor.status.OptForeignElem;
				var sFormattedStatus = fldSuccessorStatus.bk_color.Value != "" ? '<span style="padding: 2px 5px; background-color: rgb(' + fldSuccessorStatus.bk_color.Value + ')">' + fldSuccessorStatus.name.Value + "</span>" : fldSuccessorStatus.name.Value;
				arrFormFields.push({name: "paragraph_status", type: "paragraph", value: "<b>Статус:</b>&nbsp;" + sFormattedStatus }); 
			}
			
			if ( ! bIsReadOnly )
			{
				//arrFormFields.push({name: "development_potential_id", label: "Потенциал развития", title: "Выберите элемент", type: "foreign_elem", mandatory: false, multiple: false, catalog: "development_potential", display_value: sDevelopmentPotentialName, value: (teSuccessor != null ? teSuccessor.development_potential_id.Value : null), column : 2}); 
				//arrFormFields.push({name: "efficiency_estimation_id", label: "Оценка эффективности", title: "Выберите элемент", type: "foreign_elem", multiple: false, catalog: "efficiency_estimation", display_value: sEfficiencyEstimationName, value: (teSuccessor != null ? teSuccessor.efficiency_estimation_id.Value : null), column : 2}); 
				//arrFormFields.push({name: "readiness_level_id", label: "Уровень готовности", title: "Выберите элемент", type: "foreign_elem", multiple: false, catalog: "readiness_level", display_value: sReadinessLevelName, value: (teSuccessor != null ? teSuccessor.readiness_level_id.Value : null), column : 2}); 

				if ( teSuccessor != null )
				{
					var arrDevelopmentPotentialEntrys = ArrayExtract(XQuery("for $elem in development_potentials order by $elem/name return $elem/Fields('id','name')"), "({name:This.name.Value,value:This.id.Value})")

					if ( bCheckPotentialCollaboratorParam && ! bPotentialCollaborator )
					{
						arrFormFields.push({name: "development_potential_id", label: "Потенциал развития", type: "select", entries: arrDevelopmentPotentialEntrys, value: (teSuccessor != null ? teSuccessor.development_potential_id.Value : null)}); 
					}

					if ( bCheckPotentialCanChangeParam && ! bPotentialCanChange && oApplication == null )
					{
						arrFormFields.push({name: "development_potential_id", label: "Потенциал развития", disabled: true, type: "select", entries: arrDevelopmentPotentialEntrys, value: (teSuccessor != null ? teSuccessor.development_potential_id.Value : null)}); 
					}
				}

				if ( teSuccessor != null )
				{
					var arrEfficiencyEstimationEntrys = ArrayExtract( XQuery( "for $elem in efficiency_estimations order by $elem/name return $elem/Fields('id','name')"), "({name:This.name.Value,value:This.id.Value})" )

					if ( bCheckEfficiencyCollaboratorParam && ! bEfficiencyCollaborator )
					{
						arrFormFields.push({name: "efficiency_estimation_id", label: "Оценка эффективности", type: "select", entries: arrEfficiencyEstimationEntrys, value: (teSuccessor != null ? teSuccessor.efficiency_estimation_id.Value : null)});
					}

					if ( bCheckEfficiencyCanChangeParam && ! bEfficiencyCanChange && oApplication == null )
					{
						arrFormFields.push({name: "efficiency_estimation_id", label: "Оценка эффективности", disabled: true, type: "select", entries: arrEfficiencyEstimationEntrys, value: (teSuccessor != null ? teSuccessor.efficiency_estimation_id.Value : null)});
					}
				}

				var arrReadinessLevelEntrys = ArrayExtract(XQuery("for $elem in readiness_levels order by $elem/name return $elem/Fields('id','name')"), "({name:This.name.Value,value:This.id.Value})")
				arrFormFields.push({name: "readiness_level_id", label: "Уровень готовности", type: "select", entries: arrReadinessLevelEntrys, value: (teSuccessor != null ? teSuccessor.readiness_level_id.Value : null)}); 
			}
			else
			{
				arrFormFields.push({name: "paragraph_development_potential_id", type: "paragraph", value: "<b>Потенциал развития:</b>&nbsp;" + sDevelopmentPotentialName }); 

				arrFormFields.push({name: "paragraph_efficiency_estimation_id", type: "paragraph", value: "<b>Оценка эффективности:</b>&nbsp;" + sEfficiencyEstimationName }); 

				arrFormFields.push({name: "paragraph_readiness_level_id", type: "paragraph", value: "<b>Уровень готовности:</b>&nbsp;" + sReadinessLevelName }); 
			}
			
			
			if(!bIsReadOnly)
			{
				/*
				if(teSuccessor != null)
				{
					for(itemFile in teSuccessor.files)
					{
						arrFormFields.push({name: "paragraph_file_name_" + itemFile.file_id.Value, type: "paragraph", value: itemFile.file_id.ForeignElem.name.Value });
					}
				}
				*/
				arrFormFields.push({name: "paragraph_file_names", type: "paragraph", value: (teSuccessor != null ? "<b>Файлы:</b><br>" + ArrayMerge(teSuccessor.files, "'<a href=\"/download_file.html?file_id=' + This.file_id.Value + '\">' + This.file_id.ForeignElem.name.Value + '</a>'", "<br>") : "") }); 
				
				arrFormFields.push({name: "file", label: "Добавить файл", title: "Добавить файл", type: "file" }); 
			}

			var sTitle = teSuccessor != null ? "Редактировать" : "Добавить";
			var arrButtons = [];
			var oForm = {
				command: "display_form",
				title: sTitle,
				form_fields: arrFormFields,
				buttons: [{ name: "submit", label: "Сохранить", type: "submit" },{ name: "cancel", label: "Отменить", type: "cancel"}]
			};
			
			oRet.result = oForm;
		}
		else if ( sFormCommand == "submit_form" && sNextStep == "do" )
		{
			var oParam = {
				send_on_create: tools_web.is_true(bSendPersonNotificationOnCreate),
				person_notification_id: iPersonNotificationID,
				send_on_change: tools_web.is_true(bSendHRNotificationOnChange),
				hr_notification_id: iHRNotificationID,
				send_owner: bSendOwnerNotificationOnChangeCreate,
				owner_notification_id_on_create: iOwnerNotificationIDOnCreate,
				owner_notification_id_on_change: iOwnerNotificationIDOnChange,
				efficiency_collaborator: bEfficiencyCollaborator,
				potential_collaborator: bPotentialCollaborator,
				cur_user_id: iCurUserID
			}

			var sRes = set_successor( docSuccessor, null, oFormField, oParam );
			oRet.result = close_form(sRes, (sRes != null));
		}
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = "Ошибка вызова удаленного действия \"AddChangeSuccessor\"\r\n" + err;
		oRet.result = close_form(oRet.errorText);
		toLog("ERROR: AddChangeSuccessor: " + oRet.errorText, true);
	}
	return oRet;
}

/**
 * @function DeleteSuccessors
 * @memberof Websoft.WT.Succession
 * @description Удалить преемника.
 * @author BG
 * @param {bigint[]} arrSuccessorIDs - Массив ID преемников, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteSuccessors(arrSuccessorIDs)
{
	var oRes = tools.get_code_library_result_object();
	oRes.count = 0;
	
	if(!IsArray(arrSuccessorIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}
	
	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrSuccessorIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "successor")
	{
		oRes.error = 503;
		oRes.errorText = "Массив не является массивом ID преемников";
		return oRes;
	}
	
	for(itemSuccessorID in arrSuccessorIDs)
	{
		try
		{
			iSuccessorID = OptInt(itemSuccessorID);
			if(iSuccessorID == undefined)
			{
				throw "Элемент массива не является целым числом";
			}
			
			DeleteDoc( UrlFromDocID( OptInt(iSuccessorID)), false);
			
			oRes.count++;
		}
		catch(err)
		{
			toLog("ERROR: DeleteSuccessors: " + ("[" + itemSuccessorID + "]\r\n") + err, true);
		}
	}
	
	return oRes;
}

/**
 * @function DeleteSuccessorsSubObjects
 * @memberof Websoft.WT.Succession
 * @description Удалить записи из каталогов-свойств преемника: "Уровень готовности", "Оценка эффективности", "Потенциал развития".
 * @author BG
 * @param {bigint[]} arrDelRecordIDs - Массив ID записей, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteSuccessorsSubObjects(arrDelRecordIDs)
{
	var oRes = tools.get_code_library_result_object();
	oRes.count = 0;
	
	if(!IsArray(arrDelRecordIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}
	
	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrDelRecordIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var oStrConst = {
		"readiness_level" : "Уровень готовности",
		"efficiency_estimation" : "Оценка эффективности",
		"development_potential" : "Потенциал развития"
	};
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined)
	{
		oRes.error = 503;
		oRes.errorText = "Невозможно определить тип удаляемой записи";
		return oRes;
	}
	
	var sRecordType = docObj.TopElem.Name;
	var oCurRecordType = oStrConst.GetOptProperty(sRecordType)
	if(oCurRecordType == undefined)
	{
		oRes.error = 504;
		oRes.errorText = "Массив не является массивом ID свойств преемника ('Уровень готовности', 'Оценка эффективности' или 'Потенциал развития')";
		return oRes;
	}
	
	var arrSuccessors = tools.xquery("for $elem in successors where MatchSome($elem/" + sRecordType + "_id, (" + ArrayMerge(arrDelRecordIDs, "This", ",") + ")) return $elem");
	
	for(itemDelRecordID in arrDelRecordIDs)
	{
		try
		{
			iDelRecordID = OptInt(itemDelRecordID);
			if(iDelRecordID == undefined)
			{
				throw "Элемент массива не является целым числом.";
			}
			
			if(ArrayOptFind(arrSuccessors, "This." + sRecordType + "_id.Value == " + iDelRecordID) != undefined)
			{
				throw oCurRecordType + " используется в преемниках.";
			}
			try
			{
				DeleteDoc( UrlFromDocID( OptInt(iDelRecordID)), false);
			}
			catch(err1)
			{
				throw "Не удалось удалить " + StrLowerCase(oCurRecordType) + " с ID " + iDelRecordID;
			}
			
			oRes.count++;
		}
		catch(err)
		{
			toLog("ERROR: DeleteSuccessors: " + ("[" + itemDelRecordID + "]\r\n") + err, true);
		}
	}
	
	return oRes;
}

// ======================================================================================
// ==================================  Показатели ==========================================
// ======================================================================================

/**
 * @typedef {Object} ReturnKeyPositionContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {KeyPositionObject} context – Контекст .
*/
/**
 * @function GetKeyPositionContext
 * @memberof Websoft.WT.Succession
 * @author BG
 * @description Получение контекста ключевой должности.
 * @param {bigint} iKeyPositionIDParam - ID ключевой должности.
 * @returns {ReturnKeyPositionContext}
*/
function GetKeyPositionContext(iKeyPositionIDParam)
{
	var oRet = tools.get_code_library_result_object();
	oRet.context = {};
	
	var iKeyPositionID = OptInt( iKeyPositionIDParam );
	if(iKeyPositionID == undefined)
		throw StrReplace( "Некорректный ID ключевой должности: [{PARAM1}]", "{PARAM1}", iKeyPositionIDParam );
	
	var docKeyPosition = tools.open_doc(iKeyPositionID);
	if(docKeyPosition == undefined || docKeyPosition.TopElem.Name != 'key_position')
		throw StrReplace( StrReplace( "Переданный ID не является ID ключевой должности: [{PARAM1}] --> {PARAM2}", "{PARAM1}", iKeyPositionID ), "{PARAM2}", docKeyPosition.TopElem.Name );
	
	var teKeyPosition = docKeyPosition.TopElem;
	
	oRet.context = cast_KeyPosition(teKeyPosition)

	return oRet;
}

/**
 * @typedef {Object} oReturnReadinessLevel
 * @property {bigint} id
 * @property {string} code - код уровня готовности
 * @property {string} name - название уровня готовности
*/

/**
 * @typedef {Object} ReturnReadinessLevel
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPaging} paging - Пейджинг.
 * @property {oReturnReadinessLevel[]} array – Коллекция уровней готовности
*/

/**
 * @function GetReadinessLevel
 * @memberof Websoft.WT.Succession
 * @author EO
 * @description Получение списка уровней готовности
 * @param {string} sXQueryQual строка для XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnReadinessLevel}
*/
function GetReadinessLevel( sXQueryQual, oCollectionParams )
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
	var sReq = "for $elem in readiness_levels" + sXQConds + " order by $elem/name return $elem/Fields('id','code','name')";
	var xarrReadinessLevels = tools.xquery(sReq);

    for ( oItem in xarrReadinessLevels )
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
		switch(sFieldName)
		{
			case "code":
			case "name":
				sFieldName = "StrUpperCase("+sFieldName+")";
		}
		oRes.array = ArraySort(oRes.array, sFieldName, ((oCollectionParams.sort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(oRes.array);
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange(oRes.array, ( OptInt(oCollectionParams.paging.START_INDEX, 0) > 0 ? oCollectionParams.paging.START_INDEX : OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE ), oCollectionParams.paging.SIZE);
	}

	return oRes;
}

/**
 * @typedef {Object} oReturnRiskPerspective
 * @property {bigint} id
 * @property {string} code - код уровня риска
 * @property {string} name - название уровня риска
*/
/**
 * @typedef {Object} ReturnRiskPerspective
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPaging} paging - Пейджинг.
 * @property {oReturnRiskPerspective[]} array – Коллекция уровней риска
*/
/**
 * @function GetRiskPerspective
 * @memberof Websoft.WT.Succession
 * @author AKh
 * @description Получение списка уровней риска
 * @param {string} sXQueryQual строка для XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnRiskPerspective}
*/
function GetRiskPerspective( sXQueryQual, oCollectionParams )
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
	var sReq = "for $elem in risk_perspectives" + sXQConds + " order by $elem/name return $elem/Fields('id','code','name')";
	var xarrRiskPerspective = tools.xquery(sReq);

    for ( oItem in xarrRiskPerspective )
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
		switch(sFieldName)
		{
			case "code":
			case "name":
				sFieldName = "StrUpperCase("+sFieldName+")";
		}
		oRes.array = ArraySort(oRes.array, sFieldName, ((oCollectionParams.sort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(oRes.array);
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange(oRes.array, ( OptInt(oCollectionParams.paging.START_INDEX, 0) > 0 ? oCollectionParams.paging.START_INDEX : OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE ), oCollectionParams.paging.SIZE);
	}

	return oRes;
}

/**
 * @typedef {Object} oReturnKeyPositionThreat
 * @property {bigint} id
 * @property {string} code - код угрозы
 * @property {string} name - название угрозы
 * @property {string} color - код цвета
 * @property {string} color_name - название цвета
*/
/**
 * @typedef {Object} ReturnKeyPositionThreat
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPaging} paging - Пейджинг.
 * @property {oReturnKeyPositionThreat[]} array – Коллекция угроз
*/
/**
 * @function GetKeyPositionThreat
 * @memberof Websoft.WT.Succession
 * @author AKh
 * @description Получение списка угроз ключевым должностям
 * @param {string} sXQueryQual строка для XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnKeyPositionThreat}
*/
function GetKeyPositionThreat( sXQueryQual, oCollectionParams )
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
	var sReq = "for $elem in key_position_threats " + sXQConds + " order by $elem/name return $elem/Fields('id','code','name')";
	var xarrRiskPerspective = tools.xquery(sReq);
	
	var arrColors = [
						{'id':'255,0,0','name':'Красный'},
						{'id':'255,255,0','name':'Желтый'},
						{'id':'0,255,0','name':'Зеленый'},
						{'id':'0,0,255','name':'Синий'},
						{'id':'150,75,0','name':'Коричневый'},
						{'id':'0,0,0','name':'Черный'},
						{'id':'255,255,255','name':'Белый'}
					]

    for ( oItem in xarrRiskPerspective )
	{
		oElem = {
			id: oItem.id.Value,
			code: oItem.code.Value,
			name: oItem.name.Value,
			color: oItem.color.Value
		};
		colorName = ArrayOptFind(arrColors, 'This.id == oItem.color.Value') != undefined ?  ArrayOptFind(arrColors, 'This.id == oItem.color.Value').name : ''
		oElem.SetProperty("color_name", colorName)
		oRes.array.push(oElem);
	}

	if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		switch(sFieldName)
		{
			case "code":
			case "name":
			case "color":
				sFieldName = "StrUpperCase("+sFieldName+")";
		}
		oRes.array = ArraySort(oRes.array, sFieldName, ((oCollectionParams.sort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(oRes.array);
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange(oRes.array, ( OptInt(oCollectionParams.paging.START_INDEX, 0) > 0 ? oCollectionParams.paging.START_INDEX : OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE ), oCollectionParams.paging.SIZE);
	}

	return oRes;
}


/**
 * @typedef {Object} oReturnEfficiencyEstimation
 * @property {bigint} id
 * @property {string} code - код оценки эффективности
 * @property {string} name - название оценки эффективности
*/

/**
 * @typedef {Object} ReturnEfficiencyEstimation
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPaging} paging - Пейджинг.
 * @property {oReturnEfficiencyEstimation[]} array – Коллекция оценок эффективности
*/

/**
 * @function GetEfficiencyEstimation
 * @memberof Websoft.WT.Succession
 * @author EO
 * @description Получение списка оценок эффективности
 * @param {string} sXQueryQual строка для XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnEfficiencyEstimation}
*/
function GetEfficiencyEstimation( sXQueryQual, oCollectionParams )
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
	var sReq = "for $elem in efficiency_estimations" + sXQConds + " order by $elem/name return $elem/Fields('id','code','name')";
	var xarrEfficiencyEstimations = tools.xquery(sReq);

    for ( oItem in xarrEfficiencyEstimations )
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
		switch(sFieldName)
		{
			case "code":
			case "name":
				sFieldName = "StrUpperCase("+sFieldName+")";
		}
		oRes.array = ArraySort(oRes.array, sFieldName, ((oCollectionParams.sort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(oRes.array);
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange(oRes.array, ( OptInt(oCollectionParams.paging.START_INDEX, 0) > 0 ? oCollectionParams.paging.START_INDEX : OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE ), oCollectionParams.paging.SIZE);
	}

	return oRes;
}


/**
 * @typedef {Object} oReturnDevelopmentPotential
 * @property {bigint} id
 * @property {string} code - код потенциала развития
 * @property {string} name - название потенциала развития
*/

/**
 * @typedef {Object} ReturnDevelopmentPotential
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPaging} paging - Пейджинг.
 * @property {oReturnDevelopmentPotential[]} array – Коллекция потенциалов развития
*/

/**
 * @function GetDevelopmentPotential
 * @memberof Websoft.WT.Succession
 * @author EO
 * @description Получение списка потенциалов развития
 * @param {string} sXQueryQual строка для XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnDevelopmentPotential}
*/
function GetDevelopmentPotential( sXQueryQual, oCollectionParams )
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
	var sReq = "for $elem in development_potentials" + sXQConds + " order by $elem/name return $elem/Fields('id','code','name')";
	var xarrDevelopmentPotentials = tools.xquery(sReq);

    for ( oItem in xarrDevelopmentPotentials )
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
		switch(sFieldName)
		{
			case "code":
			case "name":
				sFieldName = "StrUpperCase("+sFieldName+")";
		}
		oRes.array = ArraySort(oRes.array, sFieldName, ((oCollectionParams.sort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(oRes.array);
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange(oRes.array, ( OptInt(oCollectionParams.paging.START_INDEX, 0) > 0 ? oCollectionParams.paging.START_INDEX : OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE ), oCollectionParams.paging.SIZE);
	}

	return oRes;
}


/**
 * @typedef {Object} WTReadinessLevelDeleteResult
 * @memberof Websoft.WT.Succession
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {integer} ReadinessLevelDeletedCount – количество удаленных уровней готовности
*/
/**
 * @function ReadinessLevelDelete
 * @memberof Websoft.WT.Succession
 * @description Удаляет уровни готовности
 * @author EO
 * @param {bigint[]} arrReadinessLevelIDs - массив ID уровней готовности
 * @returns {WTReadinessLevelDeleteResult}
*/
function ReadinessLevelDelete( arrReadinessLevelIDs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.ReadinessLevelDeletedCount = 0;

	if(!IsArray(arrReadinessLevelIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrReadinessLevelIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "readiness_level")
	{
		oRes.error = 503;
		oRes.errorText = "Массив не является массивом ID уровней готовности";
		return oRes;
	}

	var xarrSuccessors = ArraySelectAll( tools.xquery("for $elem in successors where MatchSome($elem/readiness_level_id, (" +  ArrayMerge( arrReadinessLevelIDs, "This", "," ) + ")) return $elem/Fields('readiness_level_id')") );

	for ( itemReadinessLevelID in arrReadinessLevelIDs )
	{
		try
		{
			iReadinessLevelID = OptInt(itemReadinessLevelID);
			if(iReadinessLevelID == undefined)
			{
				throw "Элемент массива не является целым числом";
			}

			if ( ArrayOptFind( xarrSuccessors, "OptInt(This.readiness_level_id.Value, -1) == iReadinessLevelID" ) != undefined )
			{
				continue;
			}

			DeleteDoc( UrlFromDocID( Int( iReadinessLevelID ) ) );
			oRes.ReadinessLevelDeletedCount++;
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
 * @function DeleteRiskLevel
 * @memberof Websoft.WT.Succession
 * @author IG
 * @description Удаление фактора риска
 * @param {bigint[]} arrRiskLevelIDs - Массив ID факторов риска, подлежащих удалению
 * @returns {WTLPECountResult}
*/
function DeleteRiskLevel( arrRiskLevelIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	var countHasObject = 0

	if(!IsArray(arrRiskLevelIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrRiskLevelIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "risk_level")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID просмотра(ов) материалов или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iRiskLevelID in arrRiskLevelIDs)
	{
		try
		{
			sSQL = "for $elem in risk_levels where contains( $elem/id, ('" + XQueryLiteral(iRiskLevelID) + "') ) return $elem"
			sRiskLevelObjectID = ArrayOptFirstElem(tools.xquery(sSQL));

			if(sRiskLevelObjectID == undefined){
				continue;
			}
			
			sSQL = "for $elem in key_positions where contains( $elem/risk_levels, ('" + XQueryLiteral(iRiskLevelID) + "') ) return $elem"
			oKeyPositionsObject = ArrayOptFirstElem(tools.xquery(sSQL));
			
			if(oKeyPositionsObject != undefined){
				continue;
			}

			DeleteDoc( UrlFromDocID( iRiskLevelID ), false);
			oRes.count++;
		}
		catch(err)
		{
			toLog("ERROR: DeleteRiskLevel: " + ("[" + iRiskLevelID + "]\r\n") + err, true);
		}
	}

	return oRes;
}

/**
 * @typedef {Object} WTRiskPerspectiveDeleteResult
 * @memberof Websoft.WT.Succession
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {integer} RiskPerspectiveDeletedCount – количество удаленных уровней риска
*/
/**
 * @function RiskPerspectiveDelete
 * @memberof Websoft.WT.Succession
 * @description удаление уровней риска
 * @author AKh
 * @param {bigint[]} arrRiskPerspectiveIDs - массив ID уровней риска
 * @returns {WTRiskPerspectiveDeleteResult}
*/
function RiskPerspectiveDelete( arrRiskPerspectiveIDs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.RiskPerspectiveDeletedCount = 0;

	if(!IsArray(arrRiskPerspectiveIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrRiskPerspectiveIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "risk_perspective")
	{
		oRes.error = 503;
		oRes.errorText = "Массив не является массивом ID уровней риска";
		return oRes;
	}

	var xarrKeyPositions = ArraySelectAll( tools.xquery("for $elem in key_positions where MatchSome($elem/risk_perspective_id, (" +  ArrayMerge( arrRiskPerspectiveIDs, "This", "," ) + ")) return $elem/Fields('risk_perspective_id')") );

	for ( itemRiskPerspectiveID in arrRiskPerspectiveIDs )
	{
		try
		{
			iRiskPerspectiveID = OptInt(itemRiskPerspectiveID);
			if(iRiskPerspectiveID == undefined)
			{
				throw "Элемент массива не является целым числом";
			}

			if ( ArrayOptFind( xarrKeyPositions, "OptInt(This.risk_perspective_id.Value, 0) == iRiskPerspectiveID" ) != undefined )
			{
				continue;
			}

			DeleteDoc( UrlFromDocID( Int( iRiskPerspectiveID ) ) );
			oRes.RiskPerspectiveDeletedCount++;
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
 * @typedef {Object} WTKeyPositionThreatDeleteResult
 * @memberof Websoft.WT.Succession
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {integer} KeyPositionThreatDeletedCount – количество удаленных угроз ключевым должностям
*/
/**
 * @function KeyPositionThreatDelete
 * @memberof Websoft.WT.Succession
 * @description удаление угроз ключевым должностям
 * @author AKh
 * @param {bigint[]} arrKeyPositionThreatIDs - массив ID угроз ключевым должностям
 * @returns {WTKeyPositionThreatDeleteResult}
*/
function KeyPositionThreatDelete( arrKeyPositionThreatIDs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.KeyPositionThreatDeletedCount = 0;

	if(!IsArray(arrKeyPositionThreatIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrKeyPositionThreatIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "key_position_threat")
	{
		oRes.error = 503;
		oRes.errorText = "Массив не является массивом ID угроз ключевым должностям";
		return oRes;
	}

	var xarrKeyPositions = ArraySelectAll( tools.xquery("for $elem in key_positions where MatchSome($elem/key_position_threat_id, (" +  ArrayMerge( arrKeyPositionThreatIDs, "This", "," ) + ")) return $elem/Fields('key_position_threat_id')") );

	for ( itemKeyPositionThreatID in arrKeyPositionThreatIDs )
	{
		try
		{
			iKeyPositionThreatID = OptInt(itemKeyPositionThreatID);
			if(iKeyPositionThreatID == undefined)
			{
				throw "Элемент массива не является целым числом";
			}

			if ( ArrayOptFind( xarrKeyPositions, "OptInt(This.key_position_threat_id.Value, 0) == iKeyPositionThreatID" ) != undefined )
			{
				continue;
			}

			DeleteDoc( UrlFromDocID( Int( iKeyPositionThreatID ) ) );
			oRes.KeyPositionThreatDeletedCount++;
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
 * @function ReadinessLevelCreateChange
 * @memberof Websoft.WT.Succession
 * @description Создает/изменяет уровень готовности
 * @author EO
 * @param {bigint[]} iReadinessLevelID -  ID уровня готовности
 * @param {string} sName - название уровня готовности
 * @param {string} sCode - код уровня готовности
 * @returns {WTLPEBlankResult}
*/
function ReadinessLevelCreateChange( iReadinessLevelID, sName, sCode )
{
	var oRes = tools.get_code_library_result_object();

	try
	{
		if ( sName == null || sName == undefined)
			sName = "";

		if ( sCode == null || sCode == undefined)
			sCode = "";

		if ( iReadinessLevelID != null && iReadinessLevelID != undefined )
		{
			iReadinessLevelID = OptInt( iReadinessLevelID );
			if ( iReadinessLevelID == undefined )
			{
				oRes.error = 501;
				oRes.errorText = "Не передан / передан некорректный ID уровня готовности";
				return oRes;
			}
			docReadinessLevel = tools.open_doc( iReadinessLevelID );
			if ( docReadinessLevel == undefined || docReadinessLevel.TopElem.Name != "readiness_level" )
			{
				oRes.error = 502;
				oRes.errorText = "Передан некорректный ID уровня готовности";
				return oRes;
			}
// изменение
			docReadinessLevel.TopElem.name = sName;
			docReadinessLevel.TopElem.code = sCode;

			docReadinessLevel.Save();
		}
		else
		{
// создание
			var docNewReadinessLevel = tools.new_doc_by_name("readiness_level");
			docNewReadinessLevel.BindToDb(DefaultDb);
			docNewReadinessLevel.TopElem.name = sName;
			docNewReadinessLevel.TopElem.code = sCode;
			docNewReadinessLevel.Save();
		}
	
	}
	catch( err )
	{
		oRes.error = 504;
		oRes.errorText = err;
	}

	return oRes;
}

/**
 * @function DevelopmentPotentialCreateChange
 * @memberof Websoft.WT.Succession
 * @description Создает/изменяет потенциал развития
 * @author EO
 * @param {bigint[]} iDevelopmentPotentialID -  ID потенциала развития
 * @param {string} sName - название потенциала развития
 * @param {string} sCode - код потенциала развития
 * @returns {WTLPEBlankResult}
*/
function DevelopmentPotentialCreateChange( iDevelopmentPotentialID, sName, sCode )
{
	var oRes = tools.get_code_library_result_object();

	try
	{
		if ( sName == null || sName == undefined)
			sName = "";

		if ( sCode == null || sCode == undefined)
			sCode = "";

		if ( iDevelopmentPotentialID != null && iDevelopmentPotentialID != undefined )
		{
			iDevelopmentPotentialID = OptInt( iDevelopmentPotentialID );
			if ( iDevelopmentPotentialID == undefined )
			{
				oRes.error = 501;
				oRes.errorText = "Не передан / передан некорректный ID потенциала развития";
				return oRes;
			}
			var docDevelopmentPotential = tools.open_doc( iDevelopmentPotentialID );
			if ( docDevelopmentPotential == undefined || docDevelopmentPotential.TopElem.Name != "development_potential" )
			{
				oRes.error = 502;
				oRes.errorText = "Передан некорректный ID потенциала развития";
				return oRes;
			}
// изменение
			docDevelopmentPotential.TopElem.name = sName;
			docDevelopmentPotential.TopElem.code = sCode;

			docDevelopmentPotential.Save();
		}
		else
		{
// создание
			var docNewDevelopmentPotential = tools.new_doc_by_name("development_potential");
			docNewDevelopmentPotential.BindToDb(DefaultDb);
			docNewDevelopmentPotential.TopElem.name = sName;
			docNewDevelopmentPotential.TopElem.code = sCode;
			docNewDevelopmentPotential.Save();
		}
	
	}
	catch( err )
	{
		oRes.error = 504;
		oRes.errorText = err;
	}

	return oRes;
}

/**
 * @function EfficiencyEstimationCreateChange
 * @memberof Websoft.WT.Succession
 * @description Создает/изменяет оценку эффективности
 * @author EO
 * @param {bigint[]} iEfficiencyEstimationID - ID оценки эффективности
 * @param {string} sName - название оценки эффективности
 * @param {string} sCode - код оценки эффективности
 * @returns {WTLPEBlankResult}
*/
function EfficiencyEstimationCreateChange( iEfficiencyEstimationID, sName, sCode )
{
	var oRes = tools.get_code_library_result_object();

	try
	{
		if ( sName == null || sName == undefined)
			sName = "";

		if ( sCode == null || sCode == undefined)
			sCode = "";

		if ( iEfficiencyEstimationID != null && iEfficiencyEstimationID != undefined )
		{
			iEfficiencyEstimationID = OptInt( iEfficiencyEstimationID );
			if ( iEfficiencyEstimationID == undefined )
			{
				oRes.error = 501;
				oRes.errorText = "Не передан / передан некорректный ID оценки эффективности";
				return oRes;
			}
			docEfficiencyEstimation = tools.open_doc( iEfficiencyEstimationID );
			if ( docEfficiencyEstimation == undefined || docEfficiencyEstimation.TopElem.Name != "efficiency_estimation" )
			{
				oRes.error = 502;
				oRes.errorText = "Передан некорректный ID оценки эффективности";
				return oRes;
			}
// изменение
			docEfficiencyEstimation.TopElem.name = sName;
			docEfficiencyEstimation.TopElem.code = sCode;

			docEfficiencyEstimation.Save();
		}
		else
		{
// создание
			var docNewEfficiencyEstimation = tools.new_doc_by_name("efficiency_estimation");
			docNewEfficiencyEstimation.BindToDb(DefaultDb);
			docNewEfficiencyEstimation.TopElem.name = sName;
			docNewEfficiencyEstimation.TopElem.code = sCode;
			docNewEfficiencyEstimation.Save();
		}
	
	}
	catch( err )
	{
		oRes.error = 504;
		oRes.errorText = err;
	}

	return oRes;
}


/**
 * @function ChangeCreateRiskLevel
 * @memberof Websoft.WT.Succession
 * @author IG
 * @description Удаление фактора риска
 * @param {bigint[]} iObjectID - ID фактора риска
 * @param {string} sCodeValue - Код фактора риска (code)
 * @param {string} sNameValue - Название фактора риска (name)
 * @returns {WTLPETextResult}
*/
function ChangeCreateRiskLevel(iObjectID, sCodeValue, sNameValue){
	var oRes = tools.get_code_library_result_object();
	oRes.result = "";
	
	if(IsArray(iObjectID))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции 'iObjectID' является массивом";
		return oRes;
	}
	
	if(IsArray(sCodeValue))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции 'sCodeValue' является массивом";
		return oRes;
	}
	
	if(IsArray(sNameValue))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции 'sNameValue' является массивом";
		return oRes;
	}
	
	if ( iObjectID == null || iObjectID == undefined || iObjectID == "" )
	{
		newDoc = tools.new_doc_by_name('risk_level', false);
		newDoc.BindToDb();
		newDoc.TopElem.code = sCodeValue;
		newDoc.TopElem.name = sNameValue;		
		newDoc.Save();
		
		oRes.result = "Фактор риска успешно создан"
	}
	else
	{
		docObject = tools.open_doc(iObjectID);
		if (docObject != undefined)
		{
			var sRiskLevelReq = "for $elem in risk_levels where MatchSome($elem/id, (" + iObjectID + ")) return $elem";
			var oRiskLevel = ArrayOptFirstElem(tools.xquery(sRiskLevelReq));
			
			if(oRiskLevel == undefined)
			{
				oRes.error = 501;
				oRes.errorText = "Не удалось открыть документ фактора риска с ID: " + iObjectID + ". Обратитесь к администратору.";
				return oRes;
			}

			docRiskLevel = tools.open_doc(iObjectID)

			if(docRiskLevel == undefined)
			{
				oRes.error = 501;
				oRes.errorText = "Не удалось открыть документ фактора риска с ID: " + iObjectID + ". Обратитесь к администратору.";
				return oRes;
			}

			var docRiskLevelTE = docRiskLevel.TopElem

			docRiskLevelTE.code.Value = sCodeValue
			docRiskLevelTE.name.Value = sNameValue
			docRiskLevel.Save();
		
			oRes.result = "Фактор риска успешно отредактирован"
		}
	}
	
	return oRes;
}


/**
 * @typedef {Object} WTEfficiencyEstimationDeleteResult
 * @memberof Websoft.WT.Succession
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {integer} EfficiencyEstimationDeletedCount – количество удаленных оценок эффективности
*/
/**
 * @function EfficiencyEstimationDelete
 * @memberof Websoft.WT.Succession
 * @description Удаляет оценки эффективности
 * @author EO
 * @param {bigint[]} arrEfficiencyEstimationIDs - массив ID оценок эффективности
 * @returns {WTEfficiencyEstimationDeleteResult}
*/
function EfficiencyEstimationDelete( arrEfficiencyEstimationIDs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.EfficiencyEstimationDeletedCount = 0;

	if(!IsArray(arrEfficiencyEstimationIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrEfficiencyEstimationIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "efficiency_estimation")
	{
		oRes.error = 503;
		oRes.errorText = "Массив не является массивом ID оценок эффективности";
		return oRes;
	}

	var xarrSuccessors = ArraySelectAll( tools.xquery("for $elem in successors where MatchSome($elem/efficiency_estimation_id, (" +  ArrayMerge( arrEfficiencyEstimationIDs, "This", "," ) + ")) return $elem/Fields('efficiency_estimation_id')") );

	for ( itemEfficiencyEstimationID in arrEfficiencyEstimationIDs )
	{
		try
		{
			iEfficiencyEstimationID = OptInt(itemEfficiencyEstimationID);
			if(iEfficiencyEstimationID == undefined)
			{
				throw "Элемент массива не является целым числом";
			}

			if ( ArrayOptFind( xarrSuccessors, "OptInt(This.efficiency_estimation_id.Value, -1) == iEfficiencyEstimationID" ) != undefined )
			{
				continue;
			}

			DeleteDoc( UrlFromDocID( Int( iEfficiencyEstimationID ) ) );
			oRes.EfficiencyEstimationDeletedCount++;
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
 * @typedef {Object} oReturnRiskLevel
 * @property {bigint} id
 * @property {string} code - код фактора риска
 * @property {string} name - название фактора риска
*/
/**
 * @typedef {Object} ReturnRiskLevel
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oReturnRiskLevel[]} array – Коллекция факторов риска
*/
/**
 * @function GetRiskLevel
 * @memberof Websoft.WT.Succession
 * @author IG
 * @description Получение списка факторов риска
 * @param {string} sXQueryQual строка для XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnRiskLevel}
*/
function GetRiskLevel( sXQueryQual, oCollectionParams )
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
	var sReq = "for $elem in risk_levels " + sXQConds + " order by $elem/name return $elem/Fields('id','code','name')";
	var xarrDevelopmentPotentials = tools.xquery(sReq);

    for ( oItem in xarrDevelopmentPotentials )
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
		switch(sFieldName)
		{
			case "code":
			case "name":
				sFieldName = "StrUpperCase("+sFieldName+")";
		}
		oRes.array = ArraySort(oRes.array, sFieldName, ((oCollectionParams.sort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(oRes.array);
		oRes.paging = oCollectionParams.paging;
		oRes.array = ArrayRange(oRes.array, ( OptInt(oCollectionParams.paging.START_INDEX, 0) > 0 ? oCollectionParams.paging.START_INDEX : OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE ), oCollectionParams.paging.SIZE);
	}

	return oRes;
}


/**
 * @typedef {Object} WTDevelopmentPotentialDeleteResult
 * @memberof Websoft.WT.Succession
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {integer} DevelopmentPotentialDeletedCount – количество удаленных потенциалов развития
*/
/**
 * @function DevelopmentPotentialDelete
 * @memberof Websoft.WT.Succession
 * @description Удаляет потенциалы развития
 * @author EO
 * @param {bigint[]} arrDevelopmentPotentialIDs - массив ID потенциалов развития
 * @returns {WTDevelopmentPotentialDeleteResult}
*/
function DevelopmentPotentialDelete( arrDevelopmentPotentialIDs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.DevelopmentPotentialDeletedCount = 0;

	if(!IsArray(arrDevelopmentPotentialIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrDevelopmentPotentialIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "development_potential")
	{
		oRes.error = 503;
		oRes.errorText = "Массив не является массивом ID потенциалов развития";
		return oRes;
	}

	var xarrSuccessors = ArraySelectAll( tools.xquery("for $elem in successors where MatchSome($elem/development_potential_id, (" +  ArrayMerge( arrDevelopmentPotentialIDs, "This", "," ) + ")) return $elem/Fields('development_potential_id')") );

	for ( itemDevelopmentPotentialID in arrDevelopmentPotentialIDs )
	{
		try
		{
			iDevelopmentPotentialID = OptInt(itemDevelopmentPotentialID);
			if(iDevelopmentPotentialID == undefined)
			{
				throw "Элемент массива не является целым числом";
			}

			if ( ArrayOptFind( xarrSuccessors, "OptInt(This.development_potential_id.Value, -1) == iDevelopmentPotentialID" ) != undefined )
			{
				continue;
			}

			DeleteDoc( UrlFromDocID( Int( iDevelopmentPotentialID ) ) );
			oRes.DevelopmentPotentialDeletedCount++;
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
 * @function ContextChangeSuccessor
 * @memberof Websoft.WT.Succession
 * @description контекстное изменение карточки преемника
 * @author AKh
 * @param {XmDoc} docSuccessor - doc преемника
 * @param {FormField[]} arrFormFields - форма из УД
 * @param {bool} bSendOwnerNotificationOnChangeCreate - отправка уведомлений владельцу при изменении преемника
 * @param {bigint} iOwnerNotificationOnChangeCreate - тип уведомления для отправки
 * @returns {WTLPEFormResult}
*/
function ContextChangeSuccessor (docSuccessor, arrFormFields, bSendOwnerNotificationOnChangeCreate, iOwnerNotificationOnChangeCreate)
{
	var teSuccessor = docSuccessor.TopElem;
	
	if( ArrayOptFind(arrFormFields, "This.name == 'status'") != undefined )
	{
		teSuccessor.status = ArrayOptFind(arrFormFields, "This.name == 'status'").value;
		bDoSave = true;
	}
	
	if( ArrayOptFind(arrFormFields, "This.name == 'development_potential_id'") != undefined )
	{
		teSuccessor.development_potential_id = ArrayOptFind(arrFormFields, "This.name == 'development_potential_id'").value;
		bDoSave = true;
	}
	
	if( ArrayOptFind(arrFormFields, "This.name == 'efficiency_estimation_id'") != undefined )
	{
		teSuccessor.efficiency_estimation_id = ArrayOptFind(arrFormFields, "This.name == 'efficiency_estimation_id'").value;
		bDoSave = true;
	}
	
	if( ArrayOptFind(arrFormFields, "This.name == 'readiness_level_id'") != undefined )
	{
		teSuccessor.readiness_level_id = ArrayOptFind(arrFormFields, "This.name == 'readiness_level_id'").value;
		bDoSave = true;
	}
	
	if(bDoSave)
	{
		docSuccessor.Save();
		if(bSendOwnerNotificationOnChangeCreate && OptInt(iOwnerNotificationOnChangeCreate) != undefined)
		{
			
			tools.create_notification(iOwnerNotificationOnChangeCreate, teSuccessor.id.Value, "", null, teSuccessor);
		}
		
		return close_form("Информация о преемнике изменена", true);
	}
	else return close_form(null, false);

}


/**
 * @typedef {Object} WTKeyPositionDeleteResult
 * @memberof Websoft.WT.Succession
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {integer} KeyPositionDeletedCount – количество удаленных ключевых должностей
*/
/**
 * @function KeyPositionDelete
 * @memberof Websoft.WT.Succession
 * @description Удаляет ключевые должности
 * @author EO
 * @param {bigint[]} arrKeyPositionIDs - массив ID ключевых должностей
 * @returns {WTKeyPositionDeleteResult}
*/
function KeyPositionDelete( arrKeyPositionIDs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.KeyPositionDeletedCount = 0;

	if(!IsArray(arrKeyPositionIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrKeyPositionIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "key_position")
	{
		oRes.error = 503;
		oRes.errorText = "Массив не является массивом ID ключевых должностей";
		return oRes;
	}

	var xarrSuccessors = ArraySelectAll( tools.xquery("for $elem in successors where MatchSome($elem/key_position_id, (" +  ArrayMerge( arrKeyPositionIDs, "This", "," ) + ")) return $elem/Fields('key_position_id')") );

	for ( itemKeyPositionID in arrKeyPositionIDs )
	{
		try
		{
			iKeyPositionID = OptInt(itemKeyPositionID);
			if(iKeyPositionID == undefined)
			{
				throw "Элемент массива не является целым числом";
			}

			if ( ArrayOptFind( xarrSuccessors, "OptInt(This.key_position_id.Value, -1) == iKeyPositionID" ) != undefined )
			{
				continue;
			}

			DeleteDoc( UrlFromDocID( Int( iKeyPositionID ) ) );
			oRes.KeyPositionDeletedCount++;
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
 * @typedef {Object} WTKeyPositionChangeStateResult
 * @memberof Websoft.WT.Succession
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {integer} key_positions_changed_num – количество удаленных ключевых должностей
*/
/**
 * @function KeyPositionChangeState
 * @memberof Websoft.WT.Succession
 * @description Изменение статуса ключевых должностей и преемников
 * @author AZ
 * @param {bigint[]} arrKeyPositionIDs - массив ID ключевых должностей
 * @returns {WTKeyPositionChangeStateResult}
*/

function KeyPositionChangeState( arrKeyPositionIDs, sState, bChangeSuccessorsState, bSendNotificationSuccessor, iTypeNotificationSuccessor, bSendNotificationOwner, iTypeNotificationOwner )
{
	var oRes = tools.get_code_library_result_object();
	oRes.key_positions_changed_num = 0;

	if ( ! IsArray( arrKeyPositionIDs ) )
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem( ArraySelect( arrKeyPositionIDs, "OptInt(This) != undefined" ) )
	if ( catCheckObject == undefined )
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc( Int( catCheckObject ) );
	if ( docObj == undefined || docObj.TopElem.Name != "key_position" )
	{
		oRes.error = 503;
		oRes.errorText = "Массив не является массивом ID ключевых должностей";
		return oRes;
	}

	try
	{
		sState = Trim( String( sState ) )
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Не указан новый статус ключевой должности";
		return oRes;
	}

	var arrSuccessors = ArraySelectAll( tools.xquery( "for $elem in successors where MatchSome( $elem/key_position_id, (" + ArrayMerge( arrKeyPositionIDs, "This", "," ) + ") ) return $elem/Fields( 'key_position_id' )" ) );

	for ( iKeyPositionID in arrKeyPositionIDs )
	{
		docKeyPosition = tools.open_doc( iKeyPositionID );
		if ( docKeyPosition != undefined )
		{
			docKeyPosition.TopElem.status = sState;
			docKeyPosition.Save();

			oRes.key_positions_changed_num++;
		}
	}

	
	if ( bChangeSuccessorsState )
	{
		for ( iSuccessorID in arrSuccessors )
		{
			docSuccessor = tools.open_doc( iSuccessorID );
			if ( docSuccessor != undefined )
			{
				// switch ( sState )
				// {
				// 	case ''
				// }
				docSuccessor.TopElem.status = sState;
				docSuccessor.Save();
	
				oRes.key_positions_changed_num++;
			}
		}
	}

	return oRes;
}


// /**
//  * @typedef {Object} WTSuccessorChangeStateResult
//  * @memberof Websoft.WT.Succession
//  * @property {integer} error – код ошибки
//  * @property {string} errorText – текст ошибки
//  * @property {integer} successors_states_changed – количество измененных статусов преемников
// */
// /**
//  * @function SucсessorChangeState
//  * @memberof Websoft.WT.Succession
//  * @description Изменение статуса ключевых должностей и преемников
//  * @author AZ
//  * @param {bigint[]} arrSuccessorsIDs - массив ID преемников
//  * @returns {WTSuccessorChangeStateResult}
// */

// function SucсessorChangeState( arrSuccessorsIDs, oFormFields )
// {
// 	try
// 	{
// 		var oRes = tools.get_code_library_result_object();
// 		oRes.successors_states_changed = 0;
	
// 		if ( ! IsArray( arrSuccessorsIDs ) )
// 		{
// 			oRes.error = 501;
// 			oRes.errorText = "Аргумент функции не является массивом";
// 			return oRes;
// 		}
	
// 		// alert( tools.object_to_text( oFormFields, 'json' )  );
	
// 		for ( iSuccessorID in arrSuccessorsIDs )
// 		{
// 			docSuccessor = tools.open_doc( iSuccessorID );
// 			if ( docSuccessor != undefined )
// 			{
// 				docSuccessor.TopElem.status = ''
// 				docSuccessor.Save();
	
// 				oRes.successors_states_changed++;
// 			}
// 		}
// 	}
// 	catch( ex )
// 	{
// 		alert( ex );
// 	}

// }



// ======================================================================================
// =================  Внутрибиблиотечные служебные функции (notfordoc) ==================
// ======================================================================================

function set_message_action(sMsg, bDoReload)
{
	var oRet = {command: "alert", msg: sMsg};
	if(tools_web.is_true(bDoReload))
			oRet.confirm_result = {command: "reload_page"};
		
	return sMsg != "" ? oRet : {};
}

function close_form(sMsg, bDoReload)
{
	var oRet = {command: "close_form", msg: sMsg};
	if(tools_web.is_true(bDoReload))
			oRet.confirm_result = {command: "reload_page"};
		
	return sMsg != "" ? oRet : {};
}

function get_orgs_ids_where_person_is_boss( iPersonID )
{
	sOrgsWherePersonIsBoss = "for $elem in positions where $elem/basic_collaborator_id = " + iPersonID + " and $elem/is_boss = true() and $elem/parent_object_id = null() order by $elem/org_id return $elem/Fields('org_id')";
	sOrgsWherePersonIsFuncManager = "for $elem in func_managers where $elem/catalog = 'org' order by $elem/object_id return $elem/Fields('object_id')";
	
	arrOrgsIDsWherePersonIsBoss = ArraySelectDistinct( ArrayExtractKeys( tools.xquery( sOrgsWherePersonIsBoss ), 'org_id' ), 'This' );
	arrOrgsIDsWherePersonIsFuncManager = ArraySelectDistinct( ArrayExtractKeys( tools.xquery( sOrgsWherePersonIsFuncManager ), 'object_id' ), 'This' );

	arrAllOrgsIDsWhereUserIsBoss = ArrayUnion( arrOrgsIDsWherePersonIsBoss, arrOrgsIDsWherePersonIsFuncManager );

	return arrAllOrgsIDsWhereUserIsBoss;
}

function get_subdivisions_ids_where_person_is_boss( iPersonID, bOnlyDirectSubdivisions, bIncludeOrgsWhereUserIsBoss )
{
	sPersonSubdivisionsIDs = '';
	
	oCurrentManagementObject = tools.call_code_library_method( "libMain", "get_current_management_object", [ iPersonID ] );
	var iOrgID = null;
	if(oCurrentManagementObject != null)
	{
		if(oCurrentManagementObject.catalog == 'subdivision')
			return '' + oCurrentManagementObject.object_id; 
		
		if(oCurrentManagementObject.catalog == 'org')
			iOrgID = oCurrentManagementObject.object_id;
	}
	
	sSubsWherePersonIsBoss = "for $elem in positions where $elem/basic_collaborator_id = " + iPersonID + " and $elem/is_boss = true() and $elem/parent_object_id != null()" + (iOrgID == null ? "" : " and $elem/org_id = " + iOrgID) + " order by $elem/parent_object_id return $elem/Fields('parent_object_id')";
	sSubsWherePersonIsFuncManager = "for $elem in func_managers where $elem/catalog = 'subdivision' and $elem/person_id = " + iPersonID + (iOrgID == null ? "" : " and $elem/org_id = " + iOrgID) + " order by $elem/object_id return $elem/Fields('object_id')";

	arrSubsIDsWherePersonIsBoss = ArraySelectDistinct( ArrayExtractKeys( tools.xquery( sSubsWherePersonIsBoss ), 'parent_object_id' ), 'This' ); 
	arrSubsIDsWherePersonIsFuncManager = ArraySelectDistinct( ArrayExtractKeys( tools.xquery( sSubsWherePersonIsFuncManager ), 'object_id' ), 'This' );

	arrAllSubsIDsWhereUserIsBoss = ArrayUnion( arrSubsIDsWherePersonIsBoss, arrSubsIDsWherePersonIsFuncManager );

	arrOrgsIDsWherePersonIsBoss = new Array();

	if ( bIncludeOrgsWhereUserIsBoss )
	{
		arrOrgsIDsWherePersonIsBoss = get_orgs_ids_where_person_is_boss( iPersonID );
		if(iOrgID != null)
			arrOrgsIDsWherePersonIsBoss = ArraySelect(arrOrgsIDsWherePersonIsBoss, "This == " + iOrgID);
	}

	arrAllSubsIDsWhereUserIsBoss = ArrayUnion( arrAllSubsIDsWhereUserIsBoss, arrOrgsIDsWherePersonIsBoss );
	
	if ( ! bOnlyDirectSubdivisions )
	{
		arrAllHierSubs = new Array();

		for ( id in arrAllSubsIDsWhereUserIsBoss )
		{
			arrCurHierSubs = ArrayExtractKeys( tools.xquery( "for $elem in subs where IsHierChild( $elem/id, " + id + " ) and $elem/type = 'subdivision'" + (iOrgID == null ? "" : " and $elem/org_id = " + iOrgID) + " order by $elem/Hier() return $elem/id" ), "id" );
			arrAllHierSubs = ArrayUnion( arrAllHierSubs, arrCurHierSubs );
		}

		arrAllHierSubs = ArraySelectDistinct( arrAllHierSubs, 'This' );
		arrAllSubsIDsWhereUserIsBoss = ArrayUnion( arrAllSubsIDsWhereUserIsBoss, arrAllHierSubs );
	}

	sPersonSubdivisionsIDs = ArrayMerge( arrAllSubsIDsWhereUserIsBoss, 'This', ',' );

	return sPersonSubdivisionsIDs;

}

function get_successors_by_key_position(iKeyPositionID)
{
	var xarrSuccessorsByKeyPositionID = XQuery( "for $elem in successors where $elem/key_position_id = " + iKeyPositionID + " return $elem" );
	
	return xarrSuccessorsByKeyPositionID;
}

function set_operation_key_position(sFormCommand, Param, PersonIDParam, sOperation)
{
	var oRet = {
		error: 0,
		result: {},
		errorText: ""
	};
	
	iPersonID = OptInt(Param.person_id, OptInt(PersonIDParam));
	if(iPersonID == undefined)
	{
		oRet.error = 1;
		oRet.errorText = "Не указан ID текущего пользователя"
		oRet.result = close_form(oRet.errorText);
		toLog("ERROR: set_operation_key_position: " + oRet.errorText, true);
		return oRet;
	}
	
	try
	{
		var docObject = open_object(Param.object_id);
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = StrReplace("Не удалось открыть объект модуля с ID [{PARAM1}]:\r\n", "{PARAM1}", Param.object_id) + err;
		oRet.result = close_form(oRet.errorText);
		toLog("ERROR: set_operation_key_position: " + oRet.errorText, true);
		return oRet;
	}

	switch(sFormCommand)
	{
		case "eval":
		{
			var oOperationForm = get_operation_form_param(sOperation, docObject.TopElem, null, iPersonID);
			oRet.result = {
				command: oOperationForm.command,
				title: oOperationForm.title,
				message: oOperationForm.message,
				form_fields: oOperationForm.fields,
				buttons: [{ name: "submit", label: "Сохранить", type: "submit" },{ name: "cancel", label: "Отменить", type: "cancel"}]
			};
			break;
		}
		case "submit_form":
		{
			var arrFormFields = undefined;
			var oFormField = {};
			var form_fields = Param.GetOptProperty("form_fields", "[]" );
			if ( form_fields != "[]" )
			{
				arrFormFields = ParseJson( form_fields );
				
				for(ffItem in arrFormFields)
				{
					oFormField.SetProperty(ffItem.name, ffItem.value);
				}
			}

			if ( arrFormFields != undefined )
			{
				switch(sOperation)
				{
					case "assessment":
					{
						try
						{
							try
							{
								appraise_successor(docObject, oFormField)
								oRet.result = close_form("Оценка преемника успешно сохранена", true);
							}
							catch(err)
							{
								oRet.result = set_message_action(err, false)
							}
						}
						catch(err)
						{
							oRet.result = close_form("При оценке преемника произошла ошибка:\r\n" + err, true);
						}

						break;
					}
					case "add_successor":
					{
						try
						{
							try
							{
								set_successor(null, docObject, oFormField)
								oRet.result = close_form("Преемник успешно добавлен", true);
							}
							catch(err)
							{
								oRet.result = set_message_action(err, false)
							}
						}
						catch(err)
						{
							oRet.result = close_form("При добавлении преемника произошла ошибка:\r\n" + err, true);
						}
						break;
					}
				}	
			}

			break;
		}
	}

	return oRet;
}

function get_operation_form_param(sOperation, oCurObject, ListElemID, iPersonID)
{
	var oForm = {
		command: "display_form",
		title: "",
		message: "",
		fields: []
	};
	
	switch(sOperation)
	{
		case "assessment":
		{
			oForm.title = "Оценить преемника";
			oForm.message = "Преемник: " + oCurObject.person_fullname.Value;
			oForm.fields.push({ 
				name: "readiness_level_id", 
				label: "Уровень готовности", 
				type: "foreign_elem", 
				catalog: "readiness_level", 
				value: oCurObject.readiness_level_id.Value, 
				display_value: "", 
				title: "Выберите уровень готовности сотрудника" 
			});
			oForm.fields.push({ 
				name: "development_potential_id", 
				label: "Потенциал развития", 
				type: "foreign_elem", 
				catalog: "development_potential", 
				value: oCurObject.development_potential_id.Value, 
				display_value: "", 
				title: "Укажите потенциал развития сотрудника" 
			});
			oForm.fields.push({ 
				name: "efficiency_estimation_id", 
				label: "Оценка эффективности", 
				type: "foreign_elem", 
				catalog: "efficiency_estimation", 
				value: oCurObject.efficiency_estimation_id.Value, 
				display_value: "", 
				title: "Оцените эффективность сотрудника" 
			});
			break;
		}
		case "add_successor":
		{
			oForm.title = "Добавить преемника";
			oForm.fields.push({ 
				name: "successor_id", 
				label: "Преемник", 
				type: "foreign_elem", 
				catalog: "collaborator", 
				value: null, 
				display_value: "", 
				title: "Выберите сотрудника" 
			});
			oForm.fields.push({ 
				name: "readiness_level_id", 
				label: "Уровень готовности", 
				type: "foreign_elem", 
				catalog: "readiness_level", 
				value: null, 
				display_value: "", 
				title: "Выберите уровень готовности сотрудника" 
			});
			oForm.fields.push({ 
				name: "development_potential_id", 
				label: "Потенциал развития", 
				type: "foreign_elem", 
				catalog: "development_potential", 
				value: null, 
				display_value: "", 
				title: "Укажите потенциал развития сотрудника" 
			});
			oForm.fields.push({ 
				name: "efficiency_estimation_id", 
				label: "Оценка эффективности", 
				type: "foreign_elem", 
				catalog: "efficiency_estimation", 
				value: null, 
				display_value: "", 
				title: "Оцените эффективность сотрудника" 
			});
			break;
		}
	}
	return oForm;
}

function open_object(ID)
{
	var iObjectID = OptInt(ID);
	
	if(iObjectID == undefined )
		throw StrReplace("Некорректный ID объекта: [{PARAM1}]", "{PARAM1}", ID);
	
	var docObject = tools.open_doc(iObjectID);
	
	if(docObject == undefined )
		throw StrReplace("Не найден объект с ID: [{PARAM1}]", "{PARAM1}", iObjectID);
	
	switch(docObject.TopElem.Name)
	{
		case "key_position":
		case "key_position_threat":
		case "successor":
		case "development_potential":
		case "efficiency_estimation":
		case "risk_perspective":
		case "risk_level":
		case "readiness_level":
			break;
		default:
			throw StrReplace("Объект с ID: [{PARAM1}] не является объектом модуля \"План преемственности\"", "{PARAM1}", iObjectID);
	}
	
	return docObject;
}

/**
 * @author BG
*/
function set_key_position( docKeyPosition, oSetParams, bSendBossNotification, iPersonID, sStateCreate )
{
	
	var bDoSave = false
	var bIsNew = false;

	if ( docKeyPosition == null )
	{
		var sFormPositionID = oSetParams.GetOptProperty("position_id", "");
		if(OptInt(sFormPositionID) == undefined)
		{
			return set_message_action("При создании ключевой должности не была указана должность", false)
		}
		
		var xqExistKeyPosition = ArrayOptFirstElem(tools.xquery("for $elem in key_positions where $elem/position_id=" + sFormPositionID + " order by $elem/position_id return $elem"))
		if(xqExistKeyPosition != undefined)
		{
			return set_message_action(StrReplace("Для указанной должности уже существует ключевая должность: [{PARAM1}]", "{PARAM1}", xqExistKeyPosition.name.Value), false)
		}

		bDoSave = true;
		bIsNew = true;
		docKeyPosition = tools.new_doc_by_name( 'key_position', false );
		docKeyPosition.BindToDb(DefaultDb);
		
		var teKeyPosition = docKeyPosition.TopElem;
		
		if ( sStateCreate != undefined && sStateCreate != '' )
			teKeyPosition.status = sStateCreate;

		var fldPosition = ArrayOptFirstElem(tools.xquery("for $elem in positions where $elem/id=" + sFormPositionID + " return $elem"))
		if(fldPosition != undefined)
		{
			teKeyPosition.position_id = fldPosition.id.Value;
			teKeyPosition.position_name = fldPosition.name.Value;
			teKeyPosition.person_id = fldPosition.basic_collaborator_id.Value;
			tools.common_filling("collaborator", teKeyPosition, fldPosition.basic_collaborator_id.Value);
		}
	}
	else
		var teKeyPosition = docKeyPosition.TopElem;

	var bChangeCareerReserveType = false;
	if(oSetParams.HasProperty("career_reserve_type_id"))
	{
		var iNewCareerReserveType = OptInt(oSetParams.GetOptProperty("career_reserve_type_id"));
		bChangeCareerReserveType = (teKeyPosition.career_reserve_type_id.Value != iNewCareerReserveType);
		teKeyPosition.career_reserve_type_id = iNewCareerReserveType != undefined ? iNewCareerReserveType : null;
		bDoSave = true;
	}

	if(oSetParams.HasProperty("risk_perspective_id"))
	{
		teKeyPosition.risk_perspective_id = oSetParams.GetOptProperty("risk_perspective_id", null);
		bDoSave = true;
	}

	if(oSetParams.HasProperty("key_position_threat_id"))
	{
		teKeyPosition.key_position_threat_id = oSetParams.GetOptProperty("key_position_threat_id", null);
		bDoSave = true;
	}

	if(oSetParams.HasProperty("risk_levels") && oSetParams.GetOptProperty("risk_levels", "") != "")
	{
		try
		{
			arrRiskLevelIds = tools_web.parse_multiple_parameter( oSetParams.risk_levels );
		}
		catch ( err )
		{
			arrRiskLevelIds = [];
		}
		
		for(itemRiskLevelID in arrRiskLevelIds)
		//for(itemRiskLevelID in oSetParams.risk_levels.split(";"))
		//for(itemRiskLevelID in oSetParams.risk_levels)
		{
			xRiskLevelItem = teKeyPosition.risk_levels.ObtainChildByKey(OptInt(itemRiskLevelID));
		}

		teKeyPosition.risk_levels.DeleteChildren("ArrayOptFind(arrRiskLevelIds, 'OptInt(This) == ' + This.risk_level_id.Value) == undefined")
		//teKeyPosition.risk_levels.DeleteChildren("ArrayOptFind(oSetParams.risk_levels.split(';'), 'OptInt(This) == ' + This.risk_level_id.Value) == undefined")
		//teKeyPosition.risk_levels.DeleteChildren("ArrayOptFind(oSetParams.risk_levels, 'OptInt(This) == ' + This.risk_level_id.Value) == undefined")
		bDoSave = true;
	}

	if(oSetParams.HasProperty("file"))
	{
		oFile = oSetParams.GetOptProperty( "file", "" )
		if( oFile.url != "" )
		{
			docResource = OpenNewDoc( 'x-local://wtv/wtv_resource.xmd' );

			if( iPersonID != null )
			{
				docResource.TopElem.person_id = iPersonID;
 			}
			docResource.BindToDb();
			docResource.TopElem.put_data( oFile.url );
			docResource.TopElem.name = oFile.value;
			docResource.TopElem.file_name = oFile.value;
			docResource.Save();
			teKeyPosition.files.ObtainChildByKey(OptInt(docResource.DocID));
			bDoSave = true;
		}
	}

	if(oSetParams.HasProperty("successors") && oSetParams.GetOptProperty("successors", "") != "")
	{
		var arrFormSuccessorIDs = ArraySelect(oSetParams.successors.split(";"), "OptInt(This) != undefined");
		var arrBaseSuccessors = ArraySelectAll(tools.xquery("for $elem in successors where $elem/key_position_id=" + teKeyPosition.id.Value + " return $elem/Fields('id, person_id')"));
		var sBaseSuccessorIDs = ArrayMerge(arrBaseSuccessors, "This.person_id.Value", ";");
		var iCurSuccessorID, xqExistPersonnelReserve;
		var libTalentPool = tools.get_code_library("libTalentPool");
		for(itemSuccessorID in arrFormSuccessorIDs)
		{
			iCurSuccessorID = OptInt(itemSuccessorID, null);
			if(bIsNew)
			{
				xqExistPersonnelReserve = ArrayOptFirstElem(tools.xquery("for $elem in personnel_reserves where $elem/career_reserve_type_id=" + teKeyPosition.career_reserve_type_id.Value + " and $elem/person_id=" + iCurSuccessorID + " and ($elem/status='in_reserve' or $elem/status='candidate') return $elem"));

				if(xqExistPersonnelReserve == undefined)
					tools.call_code_library_method(libTalentPool, "SetPersonnelReserve", [null, teKeyPosition.career_reserve_type_id.Value, iCurSuccessorID, {status: 'in_reserve'}]);
			}
			else if(bChangeCareerReserveType)
			{
				if (teKeyPosition.career_reserve_type_id.Value == null)
					return set_message_action("Не все преемники ключевой должности состоят в кадровом резерве выбранного типа", false)
				
				xqExistPersonnelReserve = ArrayOptFirstElem(tools.xquery("for $elem in personnel_reserves where $elem/career_reserve_type_id=" + teKeyPosition.career_reserve_type_id.Value + " and $elem/person_id=" + iCurSuccessorID + " and ($elem/status='in_reserve' or $elem/status='candidate') return $elem"));
				if(xqExistPersonnelReserve == undefined)
					return set_message_action("Не все преемники ключевой должности состоят в кадровом резерве выбранного типа", false)						
			}

			if(!StrContains(sBaseSuccessorIDs, itemSuccessorID))
			{
				set_successor(null, docKeyPosition, {person_id: iCurSuccessorID})
				bDoSave = true;
			}
		}
		
		for(itemSuccessor in arrBaseSuccessors)
		{
			if(!StrContains(oSetParams.successors, String(itemSuccessor.person_id)))
			{
				DeleteDoc(UrlFromDocID(itemSuccessor.id.Value))
				bDoSave = true;
			}
		}
	}


	if(bDoSave)
	{
		docKeyPosition.Save();
		
		if(!bIsNew && bSendBossNotification)
		{
			var curPerson = ArrayOptFirstElem(XQuery("for $elem in collaborators where $elem/id=" + XQueryLiteral(OptInt(iPersonID)) + " return $elem")) ;
			var oCurHR = get_hr_by_person(teKeyPosition.position_id.Value);
			
			tools.create_notification("succession_KeyPosition_change", oCurHR.id, "", 0, null, {OperatorName: (curPerson != undefined ? curPerson.fullname.Value: "***"), HRName: oCurHR.name})
		}
		
		return close_form((bIsNew ? "Ключевая должность создана" : "Ключевая должность успешно изменена"), true);
	}
	else
		return close_form(null, false);
}

/**
 * @typedef {Object} SetSuccessorAddParam
 * @property {bigint} cur_user_id – ID текущего пользователя
 * @property {bool} send_on_create – посылать уведомление при создании
 * @property {bigint} person_notification_id – Тип уведомления преемника
 * @property {bool} send_on_change – посылать уведомление при изменении
 * @property {bigint} hr_notification_id – Тип уведомления HR
 * @property {bool} send_owner – посылать уведомление сотруднику на ключевой должности
 * @property {bigint} owner_notification_id_on_create – Тип уведомления сотруднику на ключевой должности при создании
 * @property {bigint} owner_notification_id_on_change – Тип уведомления сотруднику на ключевой должности при изменении
 * @property {bool} efficiency_collaborator – брать оценку эффективности из карточки сотрудника
 * @property {bool} potential_collaborator – брать потенцивл развития из карточки сотрудника
*/
/**
 * @function SetSuccessor
 * @memberof Websoft.WT.Succession
 * @description Добавить/изменить преемника.
 * @author BG
 * @param {bigint?} iSuccessorIDParam - ID изменяемого преемника или null
 * @param {Object} oFormField - Объект с полями возврата из формы УД
 * @param {SetSuccessorAddParam} oAddParam - Параметры выполнения 
 * @returns {WTLPEFormResult}
*/

function SetSuccessor(iSuccessorIDParam, oFormField, oAddParam)
{
	var oRet = tools.get_code_library_result_object();
	oRet.result = {};
	
	var iSuccessorID = OptInt(iSuccessorIDParam)
	
	try
	{
		if(iSuccessorID == undefined)
		{
			var sRes = set_successor( null, null, oFormField, oAddParam );
		}
		else
		{
			var docSuccessor = tools.open_doc(iSuccessorID);
			var sRes = set_successor( docSuccessor, null, oFormField, oAddParam );
		}
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = err;
		return oRet
	}
	oRet.result = close_form(sRes, (sRes != null));

	return oRet
}

function set_successor(docSuccessor, docKeyPosition, oFormField, oAddParam)
{
	function filling_person(xPerson)
	{
		qPerson = ArrayOptFirstElem(XQuery("for $elem in collaborators where $elem/id=" + XQueryLiteral(Int(xPerson.person_id.Value)) + " return $elem")) ;
		if(qPerson != undefined )
		{
			xPerson.person_fullname = qPerson.fullname;
			xPerson.person_position_id = qPerson.position_id;
			xPerson.person_position_name = qPerson.position_name;
			xPerson.person_org_id = qPerson.org_id;
			xPerson.person_org_name = qPerson.org_name;
			xPerson.person_subdivision_id = qPerson.position_parent_id;
			xPerson.person_subdivision_name = qPerson.position_parent_name;
			xPerson.person_code = qPerson.code;
		}
	}

	var iPersonID = null;
	var bSendPersonNotificationOnCreate = true;
	var bSendHRNotificationOnChange = true;
	var bEfficiencyCollaborator = false;
	var bPotentialCollaborator = false;

	if ( oAddParam != undefined && oAddParam != null )
	{
		iPersonID = oAddParam.cur_user_id;
		bSendPersonNotificationOnCreate = oAddParam.send_on_create;
		bSendHRNotificationOnChange = oAddParam.send_on_change;

		iPersonNotificationID = oAddParam.person_notification_id;
		iHRNotificationID = oAddParam.hr_notification_id;

		bSendOwnerNotificationOnChangeCreate = oAddParam.send_owner;
		iOwnerNotificationIDOnCreate = oAddParam.owner_notification_id_on_create;
		iOwnerNotificationIDOnChange = oAddParam.owner_notification_id_on_change;

		bEfficiencyCollaborator = oAddParam.efficiency_collaborator;
		bPotentialCollaborator = oAddParam.potential_collaborator;
	}

	var bSendNotifi = true;
	var bDoSave = false;
	var bIsNew = false;
	
	if ( docSuccessor == null )
	{
		if ( docKeyPosition != null )
		{
			var teKeyPosition = docKeyPosition.TopElem;
			var iKeyPositionID = docKeyPosition.DocID;
			var iKeyPositionPersonID = docKeyPosition.TopElem.person_id;
			bSendNotifi = false;
		}
		else if ( oFormField.HasProperty( "key_position_id" ) )
		{
			iKeyPositionID = oFormField.GetProperty( "key_position_id" );
			var teKeyPosition = tools.open_doc( iKeyPositionID ).TopElem;
			var iKeyPositionPersonID = teKeyPosition.person_id;
		}
		else
			throw "Не передан обрабатываемый объект";
		
		var iFormSuccessorID = oFormField.GetOptProperty("person_id", null);
		
		if ( iFormSuccessorID == null || iFormSuccessorID == "" )
			throw "Не выбран сотрудник в преемники"

		xqExistSuccessor = ArrayOptFirstElem( tools.xquery( "for $elem in successors where $elem/key_position_id=" + iKeyPositionID + " and $elem/person_id=" + iFormSuccessorID + " and $elem/status='active' return $elem" ) );
		if ( xqExistSuccessor != undefined )
		{
			throw "Выбранный вами сотрудник уже является преемником на эту ключевую должность"; 
			/*
			var docSuccessor = tools.open_doc(xqExistSuccessor.id.Value);
			var iSuccessorID = xqExistSuccessor.id.Value;
			var teSuccessor = docSuccessor.TopElem;
			*/
		}
		else
		{
			var docSuccessor = tools.new_doc_by_name( "successor", false );
			docSuccessor.BindToDb();
			var iSuccessorID = docSuccessor.DocID;
			var teSuccessor = docSuccessor.TopElem;
			
			teSuccessor.status = "active";

			teSuccessor.key_position_id = iKeyPositionID;
			teSuccessor.key_position_id.person_id = iKeyPositionPersonID;
			filling_person(teSuccessor.key_position_id);
			
			teSuccessor.person_id = iFormSuccessorID;
			filling_person(teSuccessor);
			bDoSave = true;
			bIsNew = true;
		}
	}
	else
	{
		var iSuccessorID = docSuccessor.DocID;
		var teSuccessor = docSuccessor.TopElem;
	}
	
	if ( oFormField.HasProperty( "readiness_level_id" ) )
	{
		teSuccessor.readiness_level_id = oFormField.GetProperty("readiness_level_id");
		bDoSave = true;
	}
	
	if ( bPotentialCollaborator )
	{
		try
		{
			teSuccessor.development_potential_id = teSuccessor.person_id.ForeignElem.development_potential_id;
		}
		catch( ex )
		{
			teSuccessor.development_potential_id = null;
		}

		bDoSave = true;
	}
	else if ( oFormField.HasProperty( "development_potential_id" ) )
	{
		teSuccessor.development_potential_id = oFormField.GetProperty("development_potential_id");
		bDoSave = true;
	}

	if ( bEfficiencyCollaborator )
	{
		try
		{
			teSuccessor.efficiency_estimation_id = teSuccessor.person_id.ForeignElem.efficiency_estimation_id;
		}
		catch( ex )
		{
			teSuccessor.efficiency_estimation_id = null;
		}

		bDoSave = true;
	}
	else if ( oFormField.HasProperty( "efficiency_estimation_id" ) )
	{
		teSuccessor.efficiency_estimation_id = oFormField.GetProperty( "efficiency_estimation_id" );
		bDoSave = true;
	}
	
	if(oFormField.HasProperty("status"))
	{
		var sFormStatus = oFormField.GetProperty("status");
		if(sFormStatus != null)
			teSuccessor.status = sFormStatus;
		bDoSave = true;
	}

	if(oFormField.HasProperty("file"))
	{
		var oFile = oFormField.GetOptProperty( "file", null )
		if( oFile != null && oFile.url != "" )
		{
			var docResource = OpenNewDoc( 'x-local://wtv/wtv_resource.xmd' );

			if( iPersonID != null )
			{
				docResource.TopElem.person_id = iPersonID;
 			}
			docResource.BindToDb();
			docResource.TopElem.put_data( oFile.url );
			docResource.TopElem.name = oFile.value;
			docResource.TopElem.file_name = oFile.value;
			docResource.Save();
			teSuccessor.files.ObtainChildByKey(OptInt(docResource.DocID));
			bDoSave = true;
		}
	}

	var xqCurBudgetPeriod = get_budget_period();
	if(xqCurBudgetPeriod != undefined)
	{
		teSuccessor.budget_period_id = xqCurBudgetPeriod.id;
		bDoSave = true;
	}
	
//toLog(teSuccessor.Xml )	

	if ( bDoSave )
	{
		docSuccessor.Save();
		if ( bSendNotifi )
		{
			if ( ! bIsNew && bSendHRNotificationOnChange )
			{
				var oCurHR = get_hr_by_person(teSuccessor.person_id.Value);
				if ( oCurHR.id != null )
				{
					catNotification = undefined;

					if ( iHRNotificationID != null )
						catNotification = ArrayOptFirstElem( XQuery( "for $elem in notifications where $elem/id = " + iHRNotificationID + " return $elem/Fields( 'code' )" ) );

					var curPerson = ArrayOptFirstElem(XQuery("for $elem in collaborators where $elem/id=" + XQueryLiteral(OptInt(iPersonID)) + " return $elem")) ;
					
					tools.create_notification( ( catNotification != undefined ? catNotification.code.Value : "succession_successor_change" ), oCurHR.id, "", 0, null, {OperatorName: (curPerson != undefined ? curPerson.fullname.Value: "***"), SuccessorName: teSuccessor.person_fullname.Value, KeyPositionName:  teSuccessor.key_position_id.person_position_name.Value + " (" + teSuccessor.key_position_id.person_fullname.Value + ")"});
				}
			}

			if ( bIsNew && bSendPersonNotificationOnCreate )
			{
				catNotification = undefined;

				if ( iPersonNotificationID != null )
					catNotification = ArrayOptFirstElem( XQuery( "for $elem in notifications where $elem/id = " + iPersonNotificationID + " return $elem/Fields( 'code' )" ) );

				tools.create_notification( ( catNotification != undefined ? catNotification.code.Value : "succession_successor_became" ), teSuccessor.id.Value, "", null, teSuccessor );
			}

			if ( bIsNew && bSendOwnerNotificationOnChangeCreate )
			{
				catNotification = undefined;

				if ( iOwnerNotificationIDOnCreate != null )
					catNotification = ArrayOptFirstElem( XQuery( "for $elem in notifications where $elem/id = " + iOwnerNotificationIDOnCreate + " return $elem/Fields( 'code' )" ) );

				tools.create_notification( ( catNotification != undefined ? catNotification.code.Value : "succession_successor_became" ), iKeyPositionPersonID, "", null, teKeyPosition );
			}
		}
		
		return (bIsNew ? "Для ключевой должности добавлен преемник" : "Информация о преемнике изменена");
	}
	else return null;

}

function appraise_successor(docSuccessor, oFormField)
{
	var teSuccessor = docSuccessor.TopElem;

	teSuccessor.readiness_level_id = oFormField.GetOptProperty("readiness_level_id", null);
	teSuccessor.development_potential_id = oFormField.GetOptProperty("development_potential_id", null);
	teSuccessor.efficiency_estimation_id = oFormField.GetOptProperty("efficiency_estimation_id", null);
	
	docSuccessor.Save();
	
	return true;
}

/**
 * @author BG
*/
function get_budget_period(sDate)
{
	dCurDate = OptDate(sDate, Date());
	
	sDateReq = "for $elem in budget_periods where $elem/start_date < " + XQueryLiteral(dCurDate) + " and $elem/finish_date > " + XQueryLiteral(dCurDate) + " return $elem/Fields('id','name')";
	
	return ArrayOptFirstElem(tools.xquery(sDateReq));
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

/**
 * @author BG
*/
function is_hr_to_user(iCheckUserID, iCurUserID)
{

	var libParam = tools.get_params_code_library('libSuccession');
	var iBossTypeID = libParam.GetOptProperty("iHRBossTypeID", 2691248884100914019); //by default: Менеджер по персоналу
	
	return tools.is_user_boss(iCheckUserID, iCurUserID, "collaborator,org,subdivision", iBossTypeID );
}

/**
 * @author BG
*/
function is_some_hr(iCheckUserID)
{

	var libParam = tools.get_params_code_library('libSuccession');
	var iBossTypeID = libParam.GetOptProperty("iHRBossTypeID", 2691248884100914019); //by default: Менеджер по персоналу
	
	var sHRReq = "for $elem in func_managers where $elem/person_id=" + iCheckUserID + " and $elem/boss_type_id=" + iBossTypeID + " return $elem";
	
	return (ArrayOptFirstElem(tools.xquery(sHRReq)) != undefined);
}

function get_hr_by_person(object_id)
{
	var oRet = {
		id: null,
		name: ""
	}

	var iObjectID = OptInt(object_id);
	if(iObjectID == undefined)
		throw "Параметр функции не является корректным ID";
	
	var docObject = tools.open_doc(iObjectID);
	if(docObject == undefined)
		throw "Не удалось открыть документ с переданным значением ID";
	
	var teObject = docObject.TopElem;
	
	var curSubdivisionID = null;
	var curOrgID = null;
	switch(teObject.Name)
	{
		case "position":
			curSubdivisionID = teObject.parent_object_id.HasValue ? teObject.parent_object_id : null;
			curOrgID = teObject.org_id.Value;
			break;
		case "collaborator":
			curSubdivisionID = teObject.position_parent_id.HasValue ? teObject.position_parent_id : null;
			curOrgID = teObject.org_id.Value;
			break;
	}
	
	if(curSubdivisionID == null)
		return oRet;

	var libParam = tools.get_params_code_library('libSuccession');
	var iBossTypeID = libParam.GetOptProperty("iHRBossTypeID", 2691248884100914019); //by default: Менеджер по персоналу
	var arrHRs = tools.xquery("for $elem in func_managers where $elem/catalog='subdivision' and $elem/boss_type_id=" + iBossTypeID + " return $elem")

	var curFM = undefined;
	var curSubdivision = curSubdivisionID.OptForeignElem;
	while(curSubdivision != undefined)
	{
		curOrgID = curSubdivision.org_id.Value;
		curFM = ArrayOptFind(arrHRs, "This.object_id.Value == curSubdivisionID.Value");
		if(curFM != undefined)
			break;

		curSubdivisionID = curSubdivision.parent_object_id;
		curSubdivision = curSubdivisionID.OptForeignElem;
	}
	
	if(curFM == undefined)
	{
		curFM = ArrayOptFirstElem(tools.xquery("for $elem in func_managers where $elem/catalog='org' and $elem/object_id=" + curOrgID + "  and $elem/boss_type_id=" + iBossTypeID + " return $elem"));
	}
	
	if(curFM != undefined)
	{
		oRet.id = curFM.person_id.Value;
		oRet.name = curFM.person_fullname.Value;
	}
	return oRet;
}

function CheckSuccessorApproveWFVisibility( iCurUserID, curObject )
{
	try
	{
		iCurUserID = Int( iCurUserID )
	}
	catch( ex )
	{
		return false;
	}

	try
	{
		iSuccessorID = Int( curObject.custom_elems.ObtainChildByKey( 'person_id' ).value )
	}
	catch( ex )
	{
		return false;
	}

	iManagerTypeID = undefined;

	catEducationManager = ArrayOptFirstElem( XQuery( "for $elem in boss_types where $elem/code = 'education_manager' return $elem/Fields( 'id' )" ) );

	if ( catEducationManager != undefined )
		iManagerTypeID = catEducationManager.id;

	catApplication = ArrayOptFirstElem( XQuery( "for $elem in applications where $elem/code = 'websoft_succession_plan' return $elem/Fields( 'id' )" ) );
	if ( catApplication != undefined )
	{
		docApplication = tools.open_doc( catApplication.id );
		if ( docApplication != undefined )
		{
			fldManagerType = docApplication.TopElem.wvars.GetOptChildByKey( 'manager_type_id' );
			if ( fldManagerType != undefined )
			{
				iManagerTypeID = fldManagerType.value;
			}
		}
	}

	arrSubordinates = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, [ 'func' ], true, '', null, '', true, true, true, [ iManagerTypeID ] ] );

	return ( ArrayOptFind( arrSubordinates, 'This.id == iSuccessorID' ) != undefined );
}

// ==================================================================================================
// ====  Конец блока внутрибиблиотечных служебных функций (должен находиться в конце библиотеки) ====
// ==================================================================================================
