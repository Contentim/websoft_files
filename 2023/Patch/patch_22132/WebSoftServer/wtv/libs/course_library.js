/**
 * @namespace Websoft.WT.Course
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
 * @property {WTLPEForm} [action_result] – результат УД
 * @property {WTLPEForm|string|number|boolean} [result] – результат
*/


/**
 * @typedef {Object} File
 * @memberof Websoft.WT.Course
 * @property {bigint} id
 * @property {string} name
 * @property {string} type
 * @property {bigint} size
 * @property {string} link
*/
/**
 * @typedef {Object} ReturnCourseFiles
 * @memberof Websoft.WT.Course
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {File[]} array – массив
*/
/**
 * @function GetCourseFiles
 * @memberof Websoft.WT.Course
 * @description Получение списка файлов электронного курса.
 * @param {bigint} iCourseID ID электронного курса.
 * @param {bigint} iCurUserID ID текущего пользователя.
 * @param {boolean} [bCheckAccess=false] Проверять права доступа.
 * @returns {ReturnCourseFiles}
*/

function GetCourseFiles( iCourseID, iCurUserID, bCheckAccess, sSearch )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];

	try
	{
		iCourseID = Int( iCourseID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID электронного курса";
		return oRes;
	}

	try
	{
		iCurUserID = Int( iCurUserID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID текущего пользователя";
		return oRes;
	}

	try
	{
		if ( bCheckAccess == undefined || bCheckAccess == null )
			throw '';

		bCheckAccess = tools_web.is_true( bCheckAccess );
	}
	catch( ex )
	{
		bCheckAccess = false;
	}
	
	try
	{
		if ( sSearch == undefined || sSearch == null )
		{
			sSearch = "";
		}
	}
	catch( ex )
	{
		sSearch = "";
	}
	
	if ( bCheckAccess && ! tools_web.check_access( iCourseID, iCurUserID ) )
	{
		oRes.error = 1;
		oRes.errorText = "Нет прав доступа для выполнения операции";
		return oRes;
	}
	else
	{
		docCourse = tools.open_doc( iCourseID );
		if ( docCourse != undefined )
		{
			_xq = "for $elem in resources where MatchSome( $elem/id,(" + ArrayMerge( docCourse.TopElem.files, "OptInt( This.file_id, 0 )", "," ) + ") )";
			if ( sSearch != "" )
			{
				_xq += " and doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( sSearch ) + " )"
			}
			_xq += " return $elem";
			for ( oFile in XQuery( _xq ) )
			{
				if ( bCheckAccess && ! tools_web.check_access( oFile.id, iCurUserID ) )
				{
					continue;
				}
				else
				{
					obj = new Object();
					obj.id = oFile.id.Value;
					obj.name = oFile.name.Value;
					obj.type = oFile.type.HasValue ? oFile.type.OptForeignElem.name.Value : '';
					obj.size = oFile.size.Value;
					obj.comment = oFile.comment.Value;
					obj.link = tools_web.get_object_source_url( 'resource', oFile.id );

					oRes.array.push( obj );
				}
			}
		}
	}

	return oRes;
}

/**
 * @typedef {Object} CourseObject
 * @property {bigint} id
 * @property {string} name
 * @property {string} type
 * @property {string} link
*/
/**
 * @typedef {Object} ReturnCourseObjects
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {CourseObject[]} array – массив
*/
/**
 * @function GetCourseObjects
 * @memberof Websoft.WT.Course
 * @description Получение списка объектов электронного курса.
 * @param {bigint} iCourseID ID электронного курса.
 * @param {bigint} iCurUserID ID текущего пользователя.
 * @param {boolean} [bSelectObjectsTypes=false] Указать типы объектов, прикрепленных к электронному курсу, которые вернёт выборка.
 * @param {string} sObjectsTypes Список типов объектов.
 * @param {boolean} [bCheckAccess=false] Проверять права доступа.
 * @returns {ReturnCourseObjects}
*/

function GetCourseObjects( iCourseID, iCurUserID, bSelectObjectsTypes, sObjectsTypes, bCheckAccess )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];

	try
	{
		iCourseID = Int( iCourseID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID электронного курса";
		return oRes;
	}

	try
	{
		iCurUserID = Int( iCurUserID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID текущего пользователя";
		return oRes;
	}

	try
	{
		if ( sObjectsTypes == undefined || sObjectsTypes == null || sObjectsTypes == '' )
			throw '';

		sObjectsTypes = Trim( sObjectsTypes );
	}
	catch( ex )
	{
		sObjectsTypes = '';
	}

	try
	{
		if ( bSelectObjectsTypes == undefined || bSelectObjectsTypes == null )
			throw '';

		bSelectObjectsTypes = tools_web.is_true( bSelectObjectsTypes );
	}
	catch( ex )
	{
		bSelectObjectsTypes = false;
	}

	try
	{
		if ( bCheckAccess == undefined || bCheckAccess == null )
			throw '';

		bCheckAccess = tools_web.is_true( bCheckAccess );
	}
	catch( ex )
	{
		bCheckAccess = false;
	}

	arrObjectsTypes = sObjectsTypes.split(';');

	docCourse = tools.open_doc( iCourseID );
	if ( docCourse != undefined )
	{
		for ( oCatalog in docCourse.TopElem.catalogs )
		{
			if ( bSelectObjectsTypes )
			{
				if ( ArrayOptFind( arrObjectsTypes, "This == oCatalog.type.Value") == undefined )
				{
					continue;
				}
			}

			if ( tools_web.is_true( oCatalog.all ) )
			{
				sXQueryConditions = '';
			}
			else
			{
				sCatalogObjectsIDs = ArrayMerge( oCatalog.objects, 'object_id', ',' );

				sXQueryConditions = sCatalogObjectsIDs != '' ? ' where MatchSome( $elem/id, ( ' + sCatalogObjectsIDs + ' ) )' : '';
			}
			
			xarrObjectsByCatalogType = XQuery("for $elem in " + oCatalog.type + "s" + sXQueryConditions + " return $elem");

			for ( oCatalogObject in xarrObjectsByCatalogType )
			{
				if ( bCheckAccess && ! tools_web.check_access( oCatalogObject.id, iCurUserID ) )
				{
					continue;
				}
				else
				{
					obj = new Object();
					obj.id = oCatalogObject.id.Value;
					obj.name = oCatalogObject.ChildExists( 'name' ) ? oCatalogObject.name.Value : oCatalogObject.code.Value;
					obj.type = oCatalog.type.HasValue ? oCatalog.type.OptForeignElem.title.Value : '';
					obj.link = tools.call_code_library_method( "libMain", "get_object_link", [ oCatalog.type, obj.id ] );
					oRes.array.push( obj );
				}
			}
		}
	}

	return oRes;
}

/**
 * @typedef {Object} Response
 * @property {bigint} id
 * @property {bigint} response_type_id
 * @property {string} response_type_name
 * @property {bigint} person_id
 * @property {string} person_fullname
 * @property {string} person_position_name
 * @property {string} person_org_name
 * @property {bigint} course_id
 * @property {string} course_name
 * @property {string} comment
 * @property {string} link
*/
/**
 * @typedef {Object} ReturnCourseResponses
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {Response[]} array – массив
*/
/**
 * @function GetCourseResponses
 * @memberof Websoft.WT.Course
 * @description Получение списка отзывов на электронный курс(ы) по одному или нескольким пользователям.
 * @param {bigint} iCourseID ID электронного курса(ов).
 * @param {bigint[]} arrResponsesTypesIDs ID типов отзывов на электронный курс.
 * @param {bigint} iCurUserID ID текущего пользователя.
 * @param {boolean} [bCheckAccess=false] Проверять права доступа.
 * @param {boolean} [bShowOnlyPublicResponses=false] Показывать только публичные отзывы.
 * @param {bigint} iUserID ID пользователя(ей) по которым смотрятся отзывы.
 * @param {string} sAppCode код/ID приложения.
 * @param {string} sAccessType тип доступа.
 * @returns {ReturnCourseResponses}
*/

function GetCourseResponses( iCourseID, arrResponsesTypesIDs, iCurUserID, bCheckAccess, bShowOnlyPublicResponses, iUserID, sAppCode, sAccessType, PAGING, SORT, sSearch )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];

	var aCourseIds = [];
	var aUserIds = [];

	try
	{
		aCourseIds = ArrayExtract( String( iCourseID ).split( ";" ), "OptInt( This )" );
	}
	catch( ex )
	{
		aCourseIds = [];
	}
	
	try
	{
		aUserIds = ArrayExtract( String( iUserID ).split( ";" ), "OptInt( This )" );
	}
	catch( ex )
	{
		aUserIds = []
	}

	try
	{
		iCurUserID = Int( iCurUserID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID текущего пользователя";
		return oRes;
	}
	
	try
	{
		if ( sSearch == undefined || sSearch == null )
		{
			sSearch = "";
		}
	}
	catch( ex )
	{
		sSearch = "";
	}
	
	if ( ArrayOptFirstElem( aCourseIds ) == undefined && ArrayOptFirstElem ( aUserIds ) == undefined )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID электронного курса и ID пользователя";
		return oRes;
	}
	
	try
	{
		if ( sAccessType == null || sAccessType == "" || sAccessType == undefined )
		{
			sAccessType = "auto";
		}
	}
	catch( ex )
	{
		sAccessType = "auto";
	}
	
	try
	{
		if ( sAppCode == null || sAppCode == undefined )
		{
			sAppCode = "";
		}
	}
	catch( ex )
	{
		sAppCode = "";
	}

	try
	{
		if ( ArrayCount( arrResponsesTypesIDs ) == 0 )
			throw '';
	}
	catch( ex )
	{
		if ( sAppCode == "" )
		{
			arrResponsesTypesIDs = ArrayExtract( XQuery( "for $elem in response_types where $elem/object_type = 'course' return $elem/Fields('id')" ), 'This.id' );
			if ( ArrayCount( arrResponsesTypesIDs ) == 0 )
			{
				oRes.error = 1;
				oRes.errorText = "Не найдены типы отзывов для электронного курса";
				return oRes;
			}
		}
		else
		{
			arrResponsesTypesIDs = [];
		}
	}

	try
	{
		if ( bShowOnlyPublicResponses == undefined || bShowOnlyPublicResponses == null )
			throw '';

		bShowOnlyPublicResponses = tools_web.is_true( bShowOnlyPublicResponses );
	}
	catch( ex )
	{
		bShowOnlyPublicResponses = false;
	}

	try
	{
		if ( bCheckAccess == undefined || bCheckAccess == null )
			throw '';

		bCheckAccess = tools_web.is_true( bCheckAccess );
	}
	catch( ex )
	{
		bCheckAccess = false;
	}

	if ( bCheckAccess )
	{
		for ( _course_id in aCourseIds )
		{
			if ( ! tools_web.check_access( _course_id, iCurUserID ) )
			{
				oRes.error = 1;
				oRes.errorText = "Нет прав доступа для выполнения операции";
				return oRes;
			}
		}
	}
	
	try
	{
		if( ObjectType( PAGING ) != "JsObject" )
			throw "error";
	}
	catch( ex )
	{
		PAGING = {};
	}
	try
	{
		if( ObjectType( SORT ) != "JsObject" )
			throw "error";
	}
	catch( ex )
	{
		SORT = {};
	}
	
	if ( sAccessType != "" && sAppCode != "" )
	{
		if ( sAccessType == "auto" )
		{
			iResAppLevel = tools.call_code_library_method( 'libApplication', 'GetPersonApplicationAccessLevel', [ iCurUserID, sAppCode ] );
			switch ( iResAppLevel )
			{
				case 1:
					sAccessType = "observer";
					break;
				case 3:
					sAccessType = "expert";
					break;
				case 5:
					sAccessType = "manager";
					break;
				case 7:
					sAccessType = "hr";
					break;
				case 10:
					sAccessType = "admin";
					break;
				default:
					oRes.error = 1;
					oRes.errorText = "Нет прав доступа для выполнения операции";
					return oRes;
			}
		}
		switch ( sAccessType )
		{
			case "admin":
			case "hr":
				break;
			case "expert":
				arrExpert = tools.xquery("for $elem in experts where $elem/person_id = " + iCurUserID + " return $elem/Fields('id')");
				if ( ArrayOptFirstElem( arrExpert ) != undefined )
				{
					iExpertID = ArrayOptFirstElem( arrExpert ).id;
					arrCategories = tools.xquery("for $elem in roles where contains ($elem/experts, '" + iExpertID + "') return $elem/Fields('id')");
					sCatExpert = "MatchSome($elem/role_id, (" + ArrayMerge ( arrCategories, 'This.id', ',' ) + "))";
					xarrCourse = XQuery( "for $elem in courses where " + sCatExpert + " return $elem/Fields('id')" );
					if ( ArrayOptFirstElem( aCourseIds ) != undefined )
					{						
						aCourseIds = ArrayIntersect( xarrCourse, aCourseIds, "OptInt( This.id, 0 )", "OptInt( This, 999 )" );
					}
					else
					{
						aCourseIds = ArrayExtract( xarrCourse, "OptInt( This.id, 0 )" );
					}
				}
				if ( ArrayOptFirstElem( aCourseIds ) == undefined )
				{
					oRes.error = 1;
					oRes.errorText = "Нет прав доступа для выполнения операции";
					return oRes;
				}
				break;
			case "manager":
				var arrBossType = [];
				var teApplication = tools_app.get_cur_application(sAppCode);
				if (teApplication != null)
				{
					if ( teApplication.wvars.GetOptChildByKey( 'manager_type_id' ) != undefined )
					{
						manager_type_id = (OptInt( teApplication.wvars.GetOptChildByKey( 'manager_type_id' ).value, 0 ));
						if (manager_type_id > 0)
						{
							arrBossType.push(manager_type_id);
						}
							
					}	
				}

				if(ArrayOptFirstElem(arrBossType) == undefined)
				{
					arrBossType = ArrayExtract(tools.xquery("for $elem in boss_types where $elem/code = 'education_manager' return $elem"), 'id');
				}

				aSubordinates = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, '', null, '', true, true, true, true, arrBossType, true ] );
				if ( ArrayOptFirstElem( aSubordinates ) != undefined )
				{
					if ( ArrayOptFirstElem( aUserIds ) != undefined )
					{						
						aUserIds = ArrayIntersect( aSubordinates, aUserIds, "OptInt( This, 0 )", "OptInt( This, 999 )" );
					}
					else
					{
						aUserIds = ArrayExtract( aSubordinates, "OptInt( This, 0 )" );
					}
				}
				if ( ArrayOptFirstElem( aUserIds ) == undefined )
				{
					oRes.error = 1;
					oRes.errorText = "Нет прав доступа для выполнения операции";
					return oRes;
				}
				break;
			case "observer":
				//aSubordinates = tools.call_code_library_method( 'libMain', 'GetTypicalSubordinates', [ iCurUserID ] );
				aSubordinates = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, '', null, '', true, true, true, true, [], true ] );
				if ( ArrayOptFirstElem( aSubordinates ) != undefined )
				{
					if ( ArrayOptFirstElem( aUserIds ) != undefined )
					{						
						aUserIds = ArrayIntersect( aSubordinates, aUserIds, "OptInt( This, 0 )", "OptInt( This, 999 )" );
					}
					else
					{
						aUserIds = ArrayExtract( aSubordinates, "OptInt( This, 0 )" );
					}
				}
				if ( ArrayOptFirstElem( aUserIds ) == undefined )
				{
					oRes.error = 1;
					oRes.errorText = "Нет прав доступа для выполнения операции";
					return oRes;
				}
				break;
			default:
				oRes.error = 1;
				oRes.errorText = "Нет прав доступа для выполнения операции";
				return oRes;
		}
	}

	_xquery = "for $elem in responses where $elem/type = 'course'";
	if ( ArrayOptFirstElem( aCourseIds ) != undefined )
	{
		_xquery += " and MatchSome( $elem/object_id,(" + ArrayMerge( aCourseIds, "OptInt( This, 0 )", "," ) + ") )"
	}
	if ( ArrayOptFirstElem( aUserIds ) != undefined )
	{
		_xquery += " and MatchSome( $elem/person_id,(" + ArrayMerge( aUserIds, "OptInt( This, 0 )", "," ) + ") )"
	}
	if ( ArrayOptFirstElem( arrResponsesTypesIDs ) != undefined )
	{
		_xquery += " and MatchSome( $elem/response_type_id,(" + ArrayMerge( arrResponsesTypesIDs, "OptInt( This, 0 )", "," ) + ") )"
	}
	if ( bShowOnlyPublicResponses )
	{
		_xquery += " and $elem/is_public = true()"
	}
	if ( sSearch != "" )
	{
		_xquery += " and doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( sSearch ) + " )"
	}
	if ( String(SORT.GetOptProperty( "FIELD", "" )) != "" )
	{
		if ( SORT.GetOptProperty( "FIELD", "" ) != "person_position_name" && SORT.GetOptProperty( "FIELD", "" ) != "person_subdivision_name" )
		{
			_xquery += " order by $elem/" + SORT.GetOptProperty( "FIELD", "" );
			if ( SORT.GetOptProperty( "DIRECTION", "" ) != "" )
			{
				_xquery += ( SORT.GetOptProperty( "DIRECTION", "" ) == "DESC" ? " descending": "" )
			}
			SORT = {};
		}
		else
		{
			PAGING = {};
		}
	}
	
	if ( sAppCode == "" )
	{
		_xquery += " return $elem/Fields('id')"
	}
	else
	{
		_xquery += " return $elem"
	}

	xarrCourseResponses = XQuery( _xquery );

	oPagingResponse = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ xarrCourseResponses, PAGING, SORT ] );
	oRes.total = OptInt( oPagingResponse.oPaging.GetOptProperty( "TOTAL" ), 0 );
	xarrCourseResponses = oPagingResponse.oResult;

	var oBasicFieldValue;
	for ( catResponse in xarrCourseResponses )
	{
		if ( sAppCode == "" )
		{
			docResponse = tools.open_doc( catResponse.id );   
			if( docResponse == undefined )
				continue
			teResponse = docResponse.TopElem;
		}
		else
		{
			teResponse = undefined;
		}

		obj = new Object();

		obj.id 				 	 = catResponse.id.Value;
		obj.response_type_id 	 = teResponse == undefined ? catResponse.response_type_id.Value: teResponse.response_type_id.Value;
		obj.response_type_name 	 = teResponse == undefined ? ( catResponse.response_type_id.HasValue ? catResponse.response_type_id.OptForeignElem.name.Value : '' ): ( teResponse.response_type_id.HasValue ? teResponse.response_type_id.OptForeignElem.name.Value : '' );
		obj.person_id 			 = teResponse == undefined ? catResponse.person_id.Value: teResponse.person_id.Value;
		obj.person_fullname 	 = teResponse == undefined ? catResponse.person_fullname.Value: teResponse.person_fullname.Value;
		obj.person_position_name = teResponse == undefined ? catResponse.person_id.OptForeignElem.position_name.Value: teResponse.person_position_name.Value;
		obj.person_subdivision_name = teResponse == undefined ? catResponse.person_id.OptForeignElem.position_parent_name.Value: teResponse.person_id.OptForeignElem.position_parent_name.Value;
		obj.person_org_name 	 = teResponse == undefined ? catResponse.person_org_name.Value: teResponse.person_org_name.Value;
		obj.course_id 			 = teResponse == undefined ? catResponse.object_id.Value: teResponse.object_id.Value;
		obj.course_name 		 = teResponse == undefined ? catResponse.object_name.Value: teResponse.object_name.Value;
		obj.comment 			 = teResponse == undefined ? "": teResponse.comment.Value;
		obj.link 				 = tools.call_code_library_method( 'libMain', 'get_object_link', [ 'response', obj.id ] );
		
		obj.create_date 	 = teResponse == undefined ? catResponse.create_date.Value: teResponse.create_date.Value;
																		
//		oBasicFieldValue = tools.call_code_library_method( 'libMain', 'get_response_basic_fields', [ teResponse ] );
		obj.basic_desc = teResponse == undefined ? catResponse.basic_desc.Value: teResponse.basic_desc.Value; //oBasicFieldValue.basic_desc;
		obj.basic_score = teResponse == undefined ? catResponse.basic_score.Value: teResponse.basic_score.Value; //oBasicFieldValue.basic_score;

		oRes.array.push( obj );
	}

	return oRes;
}

/**
 * @typedef {Object} CoursesByRoles
 * @property {bigint} id
 * @property {string} name
 * @property {string} image
 * @property {string} desc
 * @property {string} roles_names
 * @property {string} link
*/
/**
 * @typedef {Object} ReturnCoursesByRoles
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oPaging} paging – Пейджинг
 * @property {Object} data
 * @property {CoursesByRoles[]} array – массив
*/
/**
 * @function GetCoursesByRoles
 * @memberof Websoft.WT.Course
 * @description Получение списка электронных курсов по категориям.
 * @author BG
 * @param {string} arrCoursesRoles ID категорий электронных курсов, для которых не будет учтена иерархия.
 * @param {string} arrCoursesHierRoles ID категорий электронных курсов, для которых будет учтена иерархия.
 * @param {bigint} iCurUserID ID текущего пользователя.
 * @param {boolean} [bCheckAccess=false] Проверять права доступа.
 * @param {boolean} [bExcludeArchiveCources=false] Исключить из выборки архивные курсы.
 * @param {boolean} [bExcludeSecretCources=false] Исключить из выборки скрытые курсы.
 * @param {boolean} [bCalculatePersonnelParam=false] Вычислять параметры прохождения курса для текущего сотрудника.
 * @param {string[]} arrDistinct - перечень полей для формирования дополнительных списков для виджета фильтров
 * @param {oSimpleFilterElem[]} arrFilters - набор фильтров
 * @param {oSort} oSort - Информация из рантайма о сортировке
 * @param {oPaging} oPaging - Информация из рантайма о пейджинге
 * @returns {ReturnCoursesByRoles}
*/

function GetCoursesByRoles( arrCoursesRoles, arrCoursesHierRoles, iCurUserID, bCheckAccess, bExcludeArchiveCources, bExcludeSecretCources, bCalculatePersonnelParam, sCurrencyType, arrDistinct, arrFilters, oSort, oPaging )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];
	oRes.data = {};
	oRes.paging = oPaging;

EnableLog('DEVELOPER');
LogEvent('DEVELOPER', alert(tools.object_to_text(oRes,'json')))


	try
	{
		iCurUserID = Int( iCurUserID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID текущего пользователя";
		return oRes;
	}

	arrXQueryConditions = new Array();	
	arrCoursesRolesIDs = new Array();
	arrCoursesHierRolesIDs = new Array();

	if ( arrCoursesRoles == "ignore" )
	{
		arrCoursesRolesIDs = undefined;
	}
	else
	{
		try
		{
			if ( ! IsArray( arrCoursesRoles ) )
			{
				if ( OptInt( arrCoursesRoles, 0 ) != 0  )
					arrCoursesRolesIDs.push( Int( arrCoursesRoles ) );
			}
			else 
			{
				if ( ArrayCount( arrCoursesRoles ) != 0 )
					arrCoursesRolesIDs = ArrayExtract( arrCoursesRoles, "OptInt( This )" );
			}

			if ( ! IsArray( arrCoursesHierRoles ) )
			{
				if ( OptInt( arrCoursesHierRoles, 0 ) != 0 )
					arrCoursesHierRolesIDs.push( Int( arrCoursesHierRoles ) );
			}
			else
			{
				if ( ArrayCount( arrCoursesHierRoles ) != 0 )
					arrCoursesHierRolesIDs = ArrayExtract( arrCoursesHierRoles, "OptInt( This )" );
			}
			/*
			if ( ArrayCount( arrCoursesRolesIDs ) == 0 && ArrayCount( arrCoursesHierRolesIDs ) == 0 )
				throw '';
			*/
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = "Не указана ни одна категория электронных курсов";
			return oRes;
		}
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
	try
	{
		if ( bExcludeArchiveCources == undefined || bExcludeArchiveCources == null )
			throw '';

		bExcludeArchiveCources = tools_web.is_true( bExcludeArchiveCources );

		if ( bExcludeArchiveCources )
			arrXQueryConditions.push( "$elem/status != 'archive'" );

	}
	catch( ex )
	{
		bExcludeArchiveCources = false;
	}
	try
	{
		if ( bExcludeSecretCources == undefined || bExcludeSecretCources == null )
			throw '';

		bExcludeSecretCources = tools_web.is_true( bExcludeSecretCources );

		if ( bExcludeSecretCources )
			arrXQueryConditions.push( "$elem/status != 'secret'" );
	}
	catch( ex )
	{
		bExcludeSecretCources = false;
	}

	bCalculatePersonnelParam = tools_web.is_true( bCalculatePersonnelParam );
	
	try
	{
		if ( sCurrencyType == null || sCurrencyType == undefined )
			throw '';
	} 
	catch( ex )
	{
		sCurrencyType = 'experience';
	}
		
	if ( arrCoursesRolesIDs != undefined )
	{
		if ( ArrayCount( arrCoursesRolesIDs ) == 0 && ArrayCount( arrCoursesHierRolesIDs ) == 0 )
		{
			arrAllRolesIDs = new Array();
		}
		else
		{
			_arrCoursesHierRoles = new Array();
			_arrCoursesHierRolesIDs = new Array();

			for ( iRoleID in arrCoursesHierRolesIDs )
			{
				_arrCoursesHierRoles = ArrayUnion( _arrCoursesHierRoles, tools.xquery( "for $elem in roles where IsHierChild( $elem/id, " + iRoleID + " ) order by $elem/Hier() return $elem/Fields('id')" ) );
			}

			_arrCoursesHierRolesIDs = ArrayExtract( _arrCoursesHierRoles, 'This.id' );

			arrAllRolesIDs = ArraySelectDistinct( ArrayUnion( arrCoursesRolesIDs, arrCoursesHierRolesIDs, _arrCoursesHierRolesIDs ), 'This' );
		}

		arrXQueryConditions.push( "MatchSome( $elem/role_id, ( " + ArrayMerge( arrAllRolesIDs, 'This', ',' ) + " ) )" );
	}

	arrAssignTypeFilters = new Array();
	sFilterStatuses = '';

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
		if ( oFilter.type == 'search' )
		{
			if ( oFilter.value != '' ) arrXQueryConditions.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )" );
		}
		else if ( oFilter.type == 'select' )
		{
			switch ( oFilter.id )
			{
				case 'state_id':
				{
						sFilterStatuses = ArrayMerge( ArraySelect( oFilter.value, "This.value != ''" ), 'This.value', ',' );
						arrFilterActiveLearnings = XQuery( "for $elem in active_learnings where MatchSome( $elem/state_id, ( " + sFilterStatuses + " ) ) and $elem/person_id = " + iCurUserID + " return $elem/Fields( 'course_id' )" );
						arrFilterLearnings = XQuery( "for $elem in learnings where MatchSome( $elem/state_id, ( " + sFilterStatuses + " ) ) and $elem/person_id = " + iCurUserID + " return $elem/Fields( 'course_id' )" );
						sAllFilteredCoursesIDs = ArrayMerge( ArrayUnion( arrFilterActiveLearnings, arrFilterLearnings ), 'This.course_id', ',' );
						arrXQueryConditions.push( "MatchSome( $elem/id, ( " + sAllFilteredCoursesIDs + " ) )" );
					break;
				}
				case 'type_assign':
				{
						arrAssignTypeFilters = ArraySort(ArraySelect( oFilter.value, "This.value != ''" ), "This.value", "+");
					break;
				}
				case "role_id":
				{
					sRoleCond = "";
					if(ArrayOptFind(oFilter.value, "This.value != ''") != undefined)
					{
						sRoleCond =  "MatchSome( $elem/role_id, ( " + ArrayMerge(ArraySelect(oFilter.value, "This.value != ''"), "This.value", ",") + " ) )";
					}
					
					if(ArrayOptFind(oFilter.value, "This.value == ''") != undefined)
					{
						if(sRoleCond == "")
							sRoleCond = "IsEmpty($elem/role_id)=true()";
						else
							sRoleCond = "( " + sRoleCond + " or IsEmpty($elem/role_id)=true() )"
					}

					if(sRoleCond != "")
						arrXQueryConditions.push( sRoleCond );
					break;
				}
			}
		}
	}

	sXQueryConditions = ArrayCount( arrXQueryConditions ) > 0 ? ' where ' + ArrayMerge( arrXQueryConditions, 'This', ' and ' ) : '';
	
	var sCondSort = " order by $elem/creation_date descending";
	if ( ObjectType( oSort ) == 'JsObject' && oSort.FIELD != null && oSort.FIELD != undefined && oSort.FIELD != "" )
	{
		switch ( oSort.FIELD )
		{
			case "name":
				sCondSort = " order by $elem/name" + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "") ;
				break;
			case "comment":
			case "desc":
				break;
			default:
				sCondSort = " order by $elem/" + oSort.FIELD + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "") ;
		}
	}

	var sReqCoursesByRoles = "for $elem in courses " + sXQueryConditions + sCondSort + " return $elem/id,$elem/role_id,$elem/__data";
	var xarrCoursesByRoles = tools.xquery( sReqCoursesByRoles );
	
	if ( ArrayOptFirstElem( arrDistinct ) != undefined )
	{
		oRes.data.SetProperty( "distincts", {} );
		var bCheckAccessRole = global_settings.settings.check_access_on_lists.Value;
		for ( sFieldName in arrDistinct )
		{
			oRes.data.distincts.SetProperty( sFieldName, [] );
			switch( sFieldName )
			{
				case 'state_id':
				{
						oRes.data.distincts.state_id.push( { name: "Назначен", value: "0" } );
						oRes.data.distincts.state_id.push( { name: "В процессе", value: "1" } );
						oRes.data.distincts.state_id.push( { name: "Завершен", value: "2" } );
						oRes.data.distincts.state_id.push( { name: "Не пройден", value: "3" } );
						oRes.data.distincts.state_id.push( { name: "Пройден", value: "4" } );
					break;
				}
				case 'type_assign':
				{
						oRes.data.distincts.type_assign.push( { name: "По собственной инициативе", value: "is_self_enrolled" } );
						oRes.data.distincts.type_assign.push( { name: "Обязательный", value: "is_not_self_enrolled" } );
						oRes.data.distincts.type_assign.push( { name: "Не определён", value: "not_learned" } );
					break;
				}
				case "role_id":
				{
					var strRoles = ArrayMerge(xarrCoursesByRoles, "ArrayMerge(This.role_id, 'This.Value', ',')", ",");
					var arrRoles = ArrayExtract(ArraySelectDistinct(strRoles.split(",")), "OptInt(This,null)");
					var xarrRoles = tools.xquery("for $elem in roles where $elem/catalog_name='course' and MatchSome($elem/id, (" + ArrayMerge(ArraySelect(arrRoles, "This!=null"), "This", ",") + ")) return $elem/Fields('name','id')")
					
					if(ArrayOptFind(arrRoles, "This==null") != undefined)
					{
						oRes.data.distincts.role_id.push({name:"Без категории", value: ""})
					}
					
					for(fldRole in xarrRoles )
					{
						if( bCheckAccessRole && ! tools_web.check_access( fldRole.id, iCurUserID, teCurUser ) )
						{
							continue;
						}
						oRes.data.distincts.role_id.push({name:fldRole.name.Value, value: fldRole.id.Value})
					}
					break;
				}
			}
		}
	}
	
	if ( ObjectType( oPaging ) == 'JsObject' && oPaging.SIZE != null && oPaging.TOTAL != null )
	{
		oPaging.MANUAL = true;
		oPaging.TOTAL = ArrayCount( xarrCoursesByRoles );
		oRes.paging = oPaging;
		xarrCoursesByRoles = ArrayRange( xarrCoursesByRoles, OptInt( oPaging.INDEX, 0 ) * oPaging.SIZE, oPaging.SIZE );
	}

	var arrPersonLearning = bCalculatePersonnelParam ? ArrayDirect(tools.xquery("for $elem in learnings where $elem/person_id=" + iCurUserID + " order by $elem/course_id ascending,  $elem/last_usage_date descending return $elem")) : [];
	var arrPersonActiveLearning = bCalculatePersonnelParam ? ArrayDirect(tools.xquery("for $elem in active_learnings where $elem/person_id=" + iCurUserID + " order by  $elem/course_id ascending, $elem/last_usage_date descending return $elem")) : [];
	
	var docCourse, teCourse;
	var fldCurrentPersonLearning;
	var fldState;
	for ( catCourse in xarrCoursesByRoles )
	{
		if ( bCheckAccess && ! tools_web.check_access( catCourse.id, iCurUserID, teCurUser ) )
			continue;

		docCourse = tools.open_doc( catCourse.id.Value );
		
		if ( docCourse == undefined )
			continue;
		
		teCourse = docCourse.TopElem;
		
		obj = new Object();

		obj.id 	  		= catCourse.id.Value;
		obj.name  		= teCourse.name.Value;
		obj.image 		= tools_web.get_object_source_url( 'resource', teCourse.resource_id.Value );
		obj.desc  		= teCourse.desc.Value;
		obj.comment		= teCourse.comment.Value;
		obj.link  		= tools_web.get_mode_clean_url( null, catCourse.id.Value );
		obj.roles_names = '';

		obj.status_learning = '';
		obj.status = '';
		obj.status_color = '';
		obj.status_code = '';
		obj.type_assign = '';
		obj.sum_points = '';

		if ( bCalculatePersonnelParam )
		{
			obj.type_assign = 'Не определён';
			obj.type_assign_id = 'not_learned';

			fldCurrentPersonLearning = ArrayOptFindBySortedKey(arrPersonActiveLearning, catCourse.id.Value, "course_id");
			if(fldCurrentPersonLearning != undefined)
			{
				obj.status_learning = 'В процессе'
			}
			else
			{
				fldCurrentPersonLearning =  ArrayOptFindBySortedKey(arrPersonLearning, catCourse.id.Value, "course_id");
				if(fldCurrentPersonLearning != undefined)
				{
					obj.status_learning = 'Архив'
				}
			}
			
			if ( fldCurrentPersonLearning != undefined )
			{
				fldState = fldCurrentPersonLearning.state_id.OptForeignElem;
				if ( fldState != undefined )
				{
					if ( sFilterStatuses != '' && ! StrContains( sFilterStatuses, String( fldCurrentPersonLearning.state_id.Value ) ) )
						continue;

						obj.state_id = fldCurrentPersonLearning.state_id.Value;
					obj.status = fldState.name.Value;
					obj.status_color = "rgb(" + fldState.lpe_color.Value + ")";
					obj.status_code = StrReplace( fldState.long_descriptor.Value, " ", "_" );
				}
				obj.type_assign = "Обязательный";
				obj.type_assign_id =  "is_not_self_enrolled";
				if( fldCurrentPersonLearning.ChildExists( 'is_self_enrolled' ) && fldCurrentPersonLearning.is_self_enrolled.Value )
				{
					obj.type_assign = "По собственной инициативе";
					obj.type_assign_id =  "is_self_enrolled";
				}
				
				obj.sum_points = Real(0);
				if ((fldCurrentPersonLearning.state_id.Value == 2 || fldCurrentPersonLearning.state_id.Value == 4) 
					&& teCourse.ChildExists("game_bonuss") && IsArray(teCourse.game_bonuss) && ArrayCount(teCourse.game_bonuss) > 0 
					&& ArrayOptFindByKey(teCourse.game_bonuss, sCurrencyType, 'currency_type_id') != undefined )
				{
					for ( elem in teCourse.game_bonuss )
					{
						if (elem.currency_type_id.Value == sCurrencyType) 
						{
							obj.sum_points += Real(elem.sum.Value);
						}
					}
				}
			}

			if ( ArrayOptFirstElem( arrAssignTypeFilters ) != undefined && ArrayOptFindBySortedKey( arrAssignTypeFilters, obj.type_assign_id, "value" ) == undefined )
				continue;
		}

		arrRolesNames = [];
		for ( fldRole in teCourse.role_id )
		{
			fldRoleFE = fldRole.OptForeignElem;
			if ( fldRoleFE != undefined )
				arrRolesNames.push( fldRoleFE.name.Value );
		}

		obj.roles_names = ArrayMerge( arrRolesNames, 'This', '|||' );

		oRes.array.push( obj );
	}

	return oRes;
}
/**
 * @typedef {Object} oCourseMaterial
 * @property {bigint} id
 * @property {string} name
 * @property {string} type
 * @property {string} link
*/
/**
 * @typedef {Object} WTCourseMaterialResult
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oCourseMaterial[]} array – массив
*/
/**
 * @function GetCourseMaterials
 * @memberof Websoft.WT.Course
 * @description Получения списка материалов по электронному курсу.
 * @param {bigint} iCourseID - ID электронного курса
 * @param {bigint} iPersonID - ID сотрудника
 * @param {string} [sTypeMaterial] - тип материала
 * @param {boolean} [bShowEventResultFiles=false] - отображать файлы результатов мероприятия
 * @returns {WTCourseMaterialResult}
*/
function GetCourseMaterials( iCourseID, iPersonID, sTypeMaterial )
{
	return get_course_materials( iCourseID, null, iPersonID, sTypeMaterial )
}
function get_course_materials( iCourseID, teCourse, iPersonID, sTypeMaterial )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];
	try
	{
		iCourseID = Int( iCourseID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID курса";
		return oRes;
	}
	try
	{
		teCourse.Name;
	}
	catch( ex )
	{
		try
		{
			teCourse = OpenDoc( UrlFromDocID( iCourseID ) ).TopElem;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = "Передан некорректный ID курса";
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
		oRes.errorText = "Передан некорректный ID сотрудника";
		return oRes;
	}

	try
	{
		if( sTypeMaterial == undefined || sTypeMaterial == null || sTypeMaterial == "" )
			throw '';
	}
	catch( ex )
	{
		sTypeMaterial = "all";
	}
	
	switch( sTypeMaterial )
	{
		case "all":
		case "files":
			oRes.array = ArrayUnion( oRes.array, tools.call_code_library_method( 'libMain', 'get_object_files', [ iCourseID ] ).array );
			if( sTypeMaterial == "files" )
			{
				break;
			}
		case "catalogs":
			oRes.array = ArrayUnion( oRes.array, tools.call_code_library_method( 'libMain', 'get_object_catalogs', [ iCourseID, teCourse ] ).array );
			break;
	}
	
	return oRes;
}

/**
 * @typedef {Object} CoursesStatistic
 * @property {number} course_count – Всего курсов.
 * @property {number} active_course – В процессе изучения курсов.
 * @property {number} learning_course – Всего закончено курсов.
 * @property {number} percent_success_course – % успешности курсов.
 * @property {number} assigned - назначено курсов
 * @property {number} avg_resp_score - средняя оценка по отзывам			
 * @property {number} avg_time - средняя продолжительность прохождения
 * @property {number} avg_time_module - средняя длительность прохождения
 * @property {number} avg_score - средний набранный балл
*/
/**
 * @typedef {Object} ReturnCoursesStatistic
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {CoursesStatistic} context – результат
*/
/**
 * @function GetCoursesStatistic
 * @memberof Websoft.WT.Course
 * @author AKh
 * @description Получение показателя по электронным курсам.
 * @param {bigint} iUserID ID сотрудника.
 * @param {string} sAppCode код/ID приложения.
 * @param {string} sAccessType тип доступа.
 * @param {string} arrCategory ID категорий электронных курсов, для которых будет учтена иерархия.
 * @param {string} sResultType тип отбора
 * @param {string} dDateStart начало периода отбора
 * @param {string} dDateEnd окончание периода отбора
 * @param {string} arrCourseIDs ID электронных курсов
 * @param {boolean} bExtendInfo расчет дополнительных показателей
 * @param {boolean} bContextMode контекстный режим показателя
 * @returns {ReturnCoursesStatistic}
*/

function GetCoursesStatistic (iUserID, sAppCode, sAccessType, arrCategory, sResultType, dDateStart, dDateEnd, arrCourseIDs, bExtendInfo, bContextMode)
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = new Object;
	
	try
	{
		iUserID = Int( iUserID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Некорректный ID  сотрудника";
		return oRes;
	}
	
	try
	{
		if (sAppCode == undefined || sAppCode == null)
			throw '';
		
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Некорректный ID/code приложения";
		return oRes;
	}
	
	try
	{
		if (sAccessType == undefined || sAccessType == null)
			throw '';
			
		sAccessType = String(sAccessType);
		
	}
	catch( ex )
	{
		sAccessType = 'auto';
	}
	
	try
	{
		if (ArrayOptFirstElem(arrCategory) == undefined || arrCategory == null)
			throw '';
		
		sCategories = " and MatchSome($elem/role_id, (" + ArrayMerge ( arrCategory, 'This', ',' ) + "))" ;
		
		
	}
	catch( ex )
	{
		arrCategory = [];
		sCategories = "";
	}
	
	try
	{
		if (sResultType == undefined || sResultType == null || sResultType == 'all') 
			throw '';
		
		if (sResultType == 'date')
			sResultTypeQuery = " and $elem/start_learning_date <= date ('" + dDateEnd + "') and $elem/last_usage_date >= date('" + dDateStart + "') "
	}
	catch( ex )
	{
		sResultTypeQuery = '';
	}
	
	try
	{
		if (dDateStart == undefined || dDateStart == null)
			throw '';

	}
	catch( ex )
	{
		sResultTypeQuery = '';
	}
	
	try
	{
		if (dDateEnd == undefined || dDateEnd == null)
			throw '';

	}
	catch( ex )
	{
		sResultTypeQuery = '';
	}
	
	try
	{
		if (tools_web.is_true(bContextMode))
		{
			if (arrCourseIDs == undefined || arrCourseIDs == null)
				throw '';

			sCourseQuery = " and $elem/id = " + ArrayOptFirstElem(arrCourseIDs) + "";
		}
		else
		{
			if (ArrayOptFirstElem(arrCourseIDs) == undefined)
				throw '';
			
			sCourseQuery = " and MatchSome($elem/id, (" + ArrayMerge ( arrCourseIDs, 'This', ',' ) + "))";
		}
	}
	catch( ex )
	{
		if (tools_web.is_true(bContextMode))
		{
			arrCourseIDs = curObjectID;
			sCourseQuery = " and $elem/id = " + arrCourseIDs + "";
		}
		else
		{
			arrCourseIDs = [];
			sCourseQuery = '';
		}
	}

	try
	{
		if (bExtendInfo == undefined || bExtendInfo == null)
			throw '';
	}
	catch( ex )
	{
		bExtendInfo = 'false'
	}
	
	oResAppLevel = tools.call_code_library_method( 'libApplication', 'GetPersonApplicationAccessLevel', [ iUserID, sAppCode ] );

	if (oResAppLevel == 5)
	{
		arrExpert = tools.xquery("for $elem in experts where $elem/person_id = " + iUserID + " return $elem/Fields('id')");

		if (ArrayOptFirstElem(arrExpert) != undefined)
		{
			iExpertID = ArrayOptFirstElem(arrExpert).id;
			arrCategories = tools.xquery("for $elem in roles where contains ($elem/experts, '" + iExpertID + "') return $elem/Fields('id')");
			sCatExpert = " and MatchSome($elem/role_id, (" + ArrayMerge ( arrCategories, 'This.id', ',' ) + "))";
			xarrCourse = XQuery( "for $elem in courses where MatchSome($elem/status, ('publish','secret','archive','project')) " + sCategories + sCatExpert + sCourseQuery + " return $elem/Fields('id', 'status')" );
		}
		else
		{
			oRes.error = 1;
			oRes.errorText = "Вы не являетесь экспертом в категории";
			return oRes;
		}
	}
	else
	{
		xarrCourse = XQuery( "for $elem in courses where MatchSome($elem/status, ('publish','secret','archive','project')) " + sCategories + sCourseQuery + " return $elem/Fields('id','status')" );
	}

	xarrActiveLearnings = XQuery( "for $elem in active_learnings where MatchSome($elem/course_id, (" + ArrayMerge ( xarrCourse, 'This.id', ',' ) + ")) " + sResultTypeQuery + " return $elem" );		
	xarrLearnings = XQuery( "for $elem in learnings where MatchSome($elem/course_id, (" + ArrayMerge ( xarrCourse, 'This.id', ',' ) + ")) " + sResultTypeQuery + " return $elem" );
	xarrCourseSuccess = ArraySelect(xarrLearnings, 'This.state_id == 4');

	if (ArrayOptFirstElem(xarrLearnings) != undefined)
	{
		percentSuccess = Math.round((Real(ArrayCount( xarrCourseSuccess )) / Real(ArrayCount( xarrLearnings ))) * Real(100));
	}
	else
		percentSuccess = 0;
	
	
		if (tools_web.is_true(bContextMode))
		{
			if (tools_web.is_true(bExtendInfo))
			{
				//вычисление дополнительных показателей
				countAssigned = ArrayCount( xarrActiveLearnings ) + ArrayCount( xarrLearnings );
					
				//вычисление средней оценки по отзывам
				if (ArrayOptFirstElem(xarrCourse) != undefined)
				{
					xarrResponses = tools.xquery("for $elem in responses where $elem/type = 'course' and $elem/object_id = " + ArrayOptFirstElem(xarrCourse).id + " return $elem");

					if (ArrayOptFirstElem(xarrResponses) != undefined)
					{
						arrScores = ArrayExtract(xarrResponses, 'basic_score');
						
						if (ArrayOptFirstElem(arrScores) != undefined)
							_avgResponseScore = StrReal( ArraySum(arrScores, 'This') / ArrayCount(arrScores), 2 );
						else
							_avgResponseScore = 0;
					}
					else
						_avgResponseScore = '';
				}
				else
					_avgResponseScore = '';
				

				//вычисление средней продолжительности прохождения
				_time = 0;
				for (_al in xarrActiveLearnings)
				{
					if (_al.last_usage_date == '' || _al.last_usage_date == null)
					{
						continue;
					}
					else
						_time = _time + DateDiff(Date(_al.last_usage_date), Date(_al.start_learning_date))
				}
				if (ArrayOptFirstElem(xarrActiveLearnings) != undefined)
				{
					_avg_time = _time / ArrayCount (xarrActiveLearnings);
					_avg_time_days = _avg_time / 86400;
					_avg_time_hours = (_avg_time - (_avg_time_days * 86400)) / 3600
				}
				else
				{
					_avg_time = 0;
					_avg_time_days = 0;
					_avg_time_hours = 0;
				}
				
				//вычисление средней длительности прохождения
				if (ArrayOptFirstElem(xarrLearnings) != undefined)
				{
					_time_module = 0;
					for (_learning in xarrLearnings)
					{
						if (_learning.time.HasValue)
							_time_module += OptInt(_learning.time, 0);
						else
							continue;
					}

					_avg_time_module = OptInt(_time_module) / ArrayCount (xarrLearnings);
					_avg_time_module_hours = _avg_time_module / 3600;
					_avg_time_module_minutes = (_avg_time_module - (_avg_time_module_hours * 3600)) / 60;
				}
				else
				{
					_avg_time_module = 0;
					_avg_time_module_hours = 0;
					_avg_time_module_minutes = 0;
				}

				//вычисление среднего балла курсов
				if (ArrayOptFirstElem(xarrLearnings) != undefined)
				{
					_avg_percent_course_score = 0;
					_maxScore = 0;
					_score = 0;

					for (_learning in xarrLearnings)
					{
						_maxScore = OptInt(_learning.max_score, 0);
						_score = OptInt(_learning.score, 0);

						if (_maxScore == 0 && _score > _maxScore)
							_avg_percent_course_score += 100;
						else if (_learning.state_id == 4 && (_maxScore == 0 && _score == 0))
							_avg_percent_course_score += 100;
						else if (_maxScore == 0 && _score == 0)
							continue;
						else
							_avg_percent_course_score += (Real(_score) * Real(100)) / Real(_maxScore);
					}

					_avg_score = Math.round(Real(_avg_percent_course_score) / Real(ArrayCount (xarrLearnings)));
				}
				else
					_avg_score = 0.0;
			

				var oContext = {
					active_course: ArrayCount( xarrActiveLearnings ),
					learning_course: ArrayCount( xarrLearnings ),
					success_course: ArrayCount( xarrCourseSuccess ),
					percent_success: percentSuccess,
					assigned: countAssigned,
					responses: ArrayCount( xarrResponses ),
					avg_resp_score: _avgResponseScore,
					percent_response: ( ArrayCount( xarrLearnings ) == 0 ? 0: ( Math.round((Real(ArrayCount( xarrResponses )) / Real(ArrayCount( xarrLearnings ))) * Real(100)) ) ),
					avg_time: _avg_time_days + "дн " + _avg_time_hours + "ч",
					avg_time_module: _avg_time_module_hours + "ч " + _avg_time_module_minutes + "м",
					avg_score: _avg_score
				};
			}
			else
			{
				var oContext = {
					active_course: ArrayCount( xarrActiveLearnings ),
					learning_course: ArrayCount( xarrLearnings ),
					percent_success: percentSuccess,
				};
			}
		}
		else
		{
			var oContext = {
				course_count: ArrayCount(ArraySelectByKey ( xarrCourse, 'publish', 'status' )) + ArrayCount(ArraySelectByKey ( xarrCourse, 'secret', 'status' )),
				active_course: ArrayCount( xarrActiveLearnings ),
				learning_course: ArrayCount( xarrLearnings ),
				percent: percentSuccess,
			};
		}
	
	if (sAccessType == 'auto')
	{
		switch(oResAppLevel)
		{
			case 10: 
			{
				oRes.context = oContext;
				break; 
			}
			case 7: 
			{
				oRes.context = oContext;
				break;  
			}
			case 5: 
			{
				oRes.context = oContext;
				break;
			}
			case 1: 
			{
				oRes.context = oContext;
				break;
			}
			case 0:           
			{
				oRes.error = 1;
				oRes.errorText = "Отсутствует доступ к приложению";
				break;
			}
		}
	}
	else
	{
		switch(sAccessType)
		{
			case "admin": 
			{
				oRes.context = oContext;
				break; 
			}
			case "manager": 
			{
				oRes.context = oContext;
				break;   
			}
			case "expert": 
			{
				oRes.context = oContext;
				break;
			}
			case "observer": 
			{
				oRes.context = oContext;
				break;
			}
		}
	}
	
	return oRes;
	
}

function GetCoursesRating (iUserID, sAppCode, sAccessType, arrCategory, arrCourseIDs, sResultType, bLastUsageDate, dDateStart, dDateEnd, arrStatistics, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = new Object;
	oRes.paging = oCollectionParams.paging;
	
	var arrXQueryConditions = [];
	var sSort_cond = "";
	
	try
	{
		iUserID = Int( iUserID );
	}
	catch( ex )
	{
		oRes.error = 501;
		oRes.errorText = "Некорректный ID сотрудника";
		return oRes;
	}
	
	try
	{
		if (sAppCode == undefined || sAppCode == null)
			throw '';
		
	}
	catch( ex )
	{
		oRes.error = 502;
		oRes.errorText = "Некорректный ID/code приложения";
		return oRes;
	}
	
	try
	{
		if (sAccessType == undefined || sAccessType == null || sAccessType == '')
			throw '';
			
		sAccessType = String(sAccessType);
	}
	catch( ex )
	{
		sAccessType = 'auto';
	}
		
	try
	{
		if (ArrayOptFirstElem(arrCategory) == undefined || arrCategory == null)
			throw '';	
	}
	catch( ex )
	{
		arrCategory = [];
	}
	
	try
	{
		if (ArrayOptFirstElem(arrCourseIDs) == undefined)
			throw '';	
	}
	catch( ex )
	{
		arrCourseIDs = [];
	}
	
	oResAppLevel = tools.call_code_library_method( 'libApplication', 'GetPersonApplicationAccessLevel', [ iUserID, sAppCode ] );
	
	if (sAccessType == 'auto')
	{
		if(oResAppLevel >= 10)
		{
			sAccessType = "admin";
		}
		else if(oResAppLevel >= 7)
		{
			sAccessType = "manager";
		}
		else if(oResAppLevel >= 5)
		{
			sAccessType = "hr";
		}
		else if(oResAppLevel >= 3)
		{
			sAccessType = "expert";
		}
		else if(oResAppLevel >= 1)
		{
			sAccessType = "observer";
		}
		else
		{
			sAccessType = "reject";
		}
	}

	if (ArrayOptFirstElem(arrCategory) != undefined)
	{
		arrXQueryConditions.push( "MatchSome ($elem/role_id, (" + ArrayMerge(arrCategory, "This", ",") + ")) ")
	}

	if (ArrayOptFirstElem(arrCourseIDs) != undefined)
	{
		arrXQueryConditions.push( "MatchSome ($elem/id, (" + ArrayMerge(arrCourseIDs, "This", ",") + ")) ")
		
	}
		
	if (sResultType == 'date')
	{
		if (!tools_web.is_true(bLastUsageDate))
		{
			xarrActiveLearnings = XQuery("for $elem in active_learnings where $elem/last_usage_date > date('" + dDateStart + "') and $elem/last_usage_date < date('" + dDateEnd + "') return $elem/Fields('id', 'course_id')");
			xarrLearnings = XQuery("for $elem in learnings where $elem/last_usage_date > date('" + dDateStart + "') and $elem/last_usage_date < date('" + dDateEnd + "') return $elem/Fields('id', 'course_id')");
			arrCourses = ArrayUnion(ArrayExtract(xarrActiveLearnings, 'course_id'), ArrayExtract(xarrLearnings, 'course_id'));
		}  
		else
		{
			xarrActiveLearnings = XQuery("for $elem in active_learnings where $elem/start_usage_date > date('" + dDateStart + "') and $elem/start_usage_date < date('" + dDateEnd + "') return $elem/Fields('id','course_id')");
			xarrLearnings = XQuery("for $elem in learnings where $elem/start_usage_date > date('" + dDateStart + "') and $elem/start_usage_date < date('" + dDateEnd + "') return $elem/Fields('id', 'course_id')");
			arrCourses = ArrayUnion(ArrayExtract(xarrActiveLearnings, 'course_id'), ArrayExtract(xarrLearnings, 'course_id'));
		}
		
		arrXQueryConditions.push( "MatchSome ($elem/id, (" + ArrayMerge(arrCourses, "This", ",") + ")) ")
	}

	for ( oFilter in oCollectionParams.filters )
	{
		if ( oFilter.type == 'search' )
		{
			if ( oFilter.value != '' ) arrXQueryConditions.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )" );
		}
	}
	
	if (oCollectionParams.sFilterQual != '')
	{
		arrXQueryConditions.push( oCollectionParams.sFilterQual  )
	}
	
	if ( ObjectType( oCollectionParams.sort ) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		if (oCollectionParams.sort.FIELD == "name" )
		{
			_sfield = "name";
			sSort_cond = " order by $elem/" + oCollectionParams.sort.FIELD + ( oCollectionParams.sort.DIRECTION == "DESC" ? " descending": " ascending" );
		}
	}

	if (sAccessType == "expert")
	{
		arrExpert = tools.xquery("for $elem in experts where $elem/type = 'collaborator' and $elem/person_id = " + iUserID + " return $elem/Fields('id')");
		if (ArrayOptFirstElem(arrExpert) != undefined)
		{
			iExpertID = ArrayOptFirstElem(arrExpert).id;
			arrCategories = XQuery("for $elem in roles where $elem/catalog_name = 'course' and contains($elem/experts,'" + OptInt(iExpertID, 0) + "') return $elem");
			
			if(ArrayOptFirstElem(arrCategories) != undefined)
			{
				arrXQueryConditions.push( "MatchSome ($elem/role_id, (" + ArrayMerge(arrCategories, 'This.id', ',') + ")) ")
			}
			else
			{
				oRes.error = 501;
				oRes.errorText = "Пользователь " + iUserID + " не является экспертом ни в одной категории";
				oRes.array = [];
				return oRes;
			}
		}
		else
		{
			oRes.error = 501;
			oRes.errorText = "Пользователь " + iUserID + " не является экспертом";
			oRes.array = [];
			return oRes;
		}
	}

	sXQueryConditions = ArrayCount( arrXQueryConditions ) > 0 ? ' where ' + ArrayMerge( arrXQueryConditions, 'This', ' and ' ) : '';
	
	sQuery = "for $elem in courses " + sXQueryConditions + sSort_cond + " return $elem";
	xarrCourses = tools.xquery(sQuery);
	
	if (oCollectionParams.sort.FIELD == "name")
	{
		if ( ObjectType( oCollectionParams.paging ) == 'JsObject' && oCollectionParams.paging.SIZE != null )
		{
			xarrCourses = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ xarrCourses, oCollectionParams.paging, null] ).oResult;
		}
	}

	arrResult = [];

	sStat = ""
	if (ArrayOptFirstElem(arrStatistics) != undefined)
	{
		sStat = ArrayMerge(arrStatistics, 'This', ';')
	}
	
	for (_course in xarrCourses)
	{		
		arrActiveLearningsCourse = tools.xquery("for $elem in active_learnings where $elem/course_id = " + _course.id + " return $elem")
		arrLearningsCourse = tools.xquery("for $elem in learnings where $elem/course_id = " + _course.id + " return $elem")

		oObject = {};
		oObject.PrimaryKey = _course.id.Value;
		oObject.id = _course.id.Value;
		oObject.name = _course.name.Value;
		
		switch(_course.status.Value)
		{
			case "publish":
				oObject.name_second = "Открытый";
				break;
			case "project":
				oObject.name_second = "Проект";
				break;
			case "secret":
				oObject.name_second = "Скрытый";
				break;
			case "archive":
				oObject.name_second = "Архивный";
				break;
		}
		
		oObject.resource_id = _course.resource_id.Value;
		oObject.image_url = "";
			
		oObject.SetProperty("all_count", "");
		oObject.SetProperty("active_learning_count", "");
		oObject.SetProperty("learning_count", "");
		oObject.SetProperty("active_learning_overdue_count", "");
		oObject.SetProperty("max_last_usage_date", "");
		oObject.SetProperty("max_start_usage_date", "");
		oObject.SetProperty("popular", "");
		oObject.SetProperty("avg_score", "");
		oObject.SetProperty("success", "");
		
		if (sStat != "" )
		{
			_colums = [];
			
			if (StrContains(sStat, 'all_count'))
			{
				_val = 0;
				_val = ArrayCount(arrLearningsCourse);
				_val += ArrayCount(arrActiveLearningsCourse);
				_colums.push({"type":"number", "title": "Всего назначено", "value": _val});
				oObject.SetProperty("all_count", _val);
			}
			if (StrContains(sStat, 'active_learning_count'))
			{
				_val = 0;
				_val = ArrayCount(arrActiveLearningsCourse);
				_colums.push({"type":"number", "title": "Не завершено", "value": _val});
				oObject.SetProperty("active_learning_count", _val);
			}
			if (StrContains(sStat, 'learning_count'))
			{
				_val = 0;
				_val = ArrayCount(arrLearningsCourse);
				_colums.push({"type":"number", "title": "Завершено", "value": _val});
				oObject.SetProperty("learning_count", _val);
			}
			if (StrContains(sStat, 'active_learning_overdue_count'))
			{
				_val = 0;
				_la = tools.xquery("for $elem_qc in active_learnings where $elem_qc/course_id = " + _course.id + " and $elem_qc/max_end_date != null() and $elem_qc/max_end_date < " + XQueryLiteral(Date()) + " return $elem_qc")
				_val = ArrayCount(_la);
				_colums.push({"type":"number", "title": "Просрочено", "value": _val});
				oObject.SetProperty("active_learning_overdue_count", _val);
			}
			if (StrContains(sStat, 'max_last_usage_date'))
			{
				_la = tools.xquery("for $elem_qc in active_learnings where $elem_qc/course_id = " + _course.id + " and $elem_qc/last_usage_date != null() order by $elem_qc/last_usage_date descending return $elem_qc/Fields('id', 'last_usage_date')");
				_lc = tools.xquery("for $elem_qc in learnings where $elem_qc/course_id = " + _course.id + " and $elem_qc/last_usage_date != null() order by $elem_qc/last_usage_date descending return $elem_qc/Fields('id', 'last_usage_date')");
				_val1 = ArrayOptFirstElem(_la);
				_val2 = ArrayOptFirstElem(_lc);
				_val = ( _val1 != undefined ? _val1.last_usage_date.Value : null );
				_val2 = ( _val2 != undefined ? _val2.last_usage_date.Value : null );
				_val = ( _val == null ? _val2 : ( _val2 != null && _val2 > _val ? _val2 : _val ) );
				if ( _val == null || OptDate( _val ) == undefined )
				{
					_val = "";
				}
				else
				{
					_val = StrDate( _val, true, false );
				}

				_colums.push({"type":"date", "title": "Последняя сессия", "value": _val});
				oObject.SetProperty("max_last_usage_date", _val);
			}
			if (StrContains(sStat, 'max_start_usage_date'))
			{
				_la = tools.xquery("for $elem_qc in active_learnings where $elem_qc/course_id = " + _course.id + " and $elem_qc/start_usage_date != null() order by $elem_qc/start_usage_date descending return $elem_qc/Fields('id', 'start_usage_date')");
				_lc = tools.xquery("for $elem_qc in learnings where $elem_qc/course_id = " + _course.id + " and $elem_qc/start_usage_date != null() order by $elem_qc/start_usage_date descending return $elem_qc/Fields('id', 'start_usage_date')");
				_val1 = ArrayOptFirstElem(_la);
				_val2 = ArrayOptFirstElem(_lc);
				_val = ( _val1 != undefined ? _val1.start_usage_date.Value : null );
				_val2 = ( _val2 != undefined ? _val2.start_usage_date.Value : null );
				_val = ( _val == null ? _val2 : ( _val2 != null && _val2 > _val ? _val2 : _val ) );
				if ( _val == null || OptDate( _val ) == undefined )
				{
					_val = "";
				}
				else
				{
					_val = StrDate( _val, true, false );
				}

				_colums.push({"type":"date", "title": "Последнее назначение", "value": _val});
				oObject.SetProperty("max_start_usage_date", _val);
			}
			if (StrContains(sStat, 'popular'))
			{
				_count_alc = ArrayCount(arrActiveLearningsCourse);
				arrActiveLearnings = tools.xquery("for $elem_qc in active_learnings return $elem_qc/Fields('id')")
				_count_al = ArrayCount(arrActiveLearnings);
				
				if ( _count_al > 0)
					_popular = StrReal(Real(_count_alc) / Real(_count_al), 5) ;
				else
					_popular = 0;
				_colums.push({"type":"real", "title": "Популярность", "value": Real(_popular)*100 });
				oObject.SetProperty("popular", Real(_popular)*100 );
			}
			if (StrContains(sStat, 'avg_score'))
			{
				xarrResponses = XQuery("for $elem in responses where MatchSome ($elem/object_id, (" + _course.id + ")) return $elem");
						
				if (ArrayOptFirstElem(xarrResponses) != undefined)
				{
					arrScores = ArrayExtract(xarrResponses, 'This.basic_score');
					_avgScore = ArraySum(arrScores, 'This') / ArrayCount(arrScores);
				}
				else
					_avgScore = 0;
				_colums.push({"type":"String", "title": "Средняя оценка", "value": StrReal(_avgScore, 2)});
				oObject.SetProperty("avg_score", StrReal(_avgScore, 2));
			}
			if (StrContains(sStat, 'success'))
			{
				arrSuccessLC = tools.xquery("for $elem_qc in learnings where $elem_qc/course_id = " + _course.id + " and $elem_qc/state_id = 4 return $elem_qc/Fields('id')");
				_count_lc = ArrayCount (arrSuccessLC);
				
				arrLearnings = tools.xquery("for $elem_qc in learnings return $elem_qc");
				_count_l = ArrayCount(arrLearnings);

				if (_count_l > 0)
					_success = StrReal((Real(_count_lc) / Real(_count_l)) * 100, 2);
				else
					_success = 0;
				_colums.push({"type":"real", "title": "Успешность", "value": Real(_success)});
				oObject.SetProperty("success", Real(_success));
			}
			
			oObject.data = EncodeJson({"rows": [{"columns": _colums}]});
		}
		
		arrResult.push(oObject);
	}

	if (oCollectionParams.sort.FIELD != "name")	
	{
		switch ( oCollectionParams.sort.FIELD )
		{
			case "all_count":
				oCollectionParams.sort.FIELD = "all_count";
				break;
			case "active_learning_count":
				oCollectionParams.sort.FIELD = "active_learning_count";
				break;
			case "learning_count":
				oCollectionParams.sort.FIELD = "learning_count";
				break;
			case "active_learning_overdue_count":
				oCollectionParams.sort.FIELD = "active_learning_overdue_count";
				break;
			case "max_start_usage_date":
				oCollectionParams.sort.FIELD = "max_start_usage_date";
				break;
			case "max_last_usage_date":
				oCollectionParams.sort.FIELD = "max_last_usage_date";
				break;
			case "name_second":
				oCollectionParams.sort.FIELD = "name_second";
				break;
		}
		
		oRes.array = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ arrResult, null, oCollectionParams.sort] ).oResult;
	}
	else
		oRes.array = arrResult;
		return oRes;
}

/**
 * @typedef {Object} CourseModule
*/
/**
 * @typedef {Object} ReturnCourseModules
 * @property {number} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {CourseModule[]} result – массив
*/
/**
 * @function GetCourseModules
 * @memberof Websoft.WT.Course
 * @author Akh
 * @description Получение списка учебных модулей
 * @param {bigint} iCurUserID - ID сотрудника
 * @param {string} sAccessType Тип доступа: "admin"/"manager"/"expert"/"observer"/"auto"
 * @param {string} sApplication код/ID приложения, по которому определяется доступ
 * @param {bigint[]} arrCategories - массив ID категорий
 * @param {bigint[]} arrModules - массив ID учебных модулей
 * @param {oCollectionParam} oCollectionParams - набор интерактивных параметров
 * @returns {ReturnCourseModules}
*/
function GetCourseModules( iCurUserID, sAccessType, sApplication, arrCategories, arrModules, oCollectionParams )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.paging = oCollectionParams.paging;
	oRes.result = [];
	
	var arrXQueryConditions = [];
	var sXQueryConditions = '';

	try
	{
		iCurUserID = Int( iCurUserID );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "RemoteCollection: libCourse: GetCourseModules: Передан некорректный ID сотрудника";
		return oRes;
	}
	
	if (IsEmptyValue(sAccessType))
	{
		sAccessType = 'auto';
	}
	
	if (IsEmptyValue(sApplication))
	{
		sApplication = '';
	}
	
	if (ArrayOptFirstElem(arrCategories) != undefined)
	{
		arrXQueryConditions.push( "MatchSome ($elem/role_id, (" + ArrayMerge(arrCategories, "This", ",") + ")) ")
	}

	if (ArrayOptFirstElem(arrModules) != undefined)
	{
		arrXQueryConditions.push( "MatchSome ($elem/id, (" + ArrayMerge(arrModules, "This", ",") + ")) ")
		
	}
	
	for ( oFilter in oCollectionParams.filters )
	{
		if ( oFilter.type == 'search' )
		{
			if ( oFilter.value != '' ) arrXQueryConditions.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )" );
		}
	}
	
	if (oCollectionParams.sFilterQual != '')
	{
		arrXQueryConditions.push( oCollectionParams.sFilterQual  )
	}

	if (sAccessType == 'auto')
	{
		oResAppLevel = tools.call_code_library_method( 'libApplication', 'GetPersonApplicationAccessLevel', [ iCurUserID, sApplication ] );
		
		if ( oResAppLevel >= 10 )
		{
			sAccessType = 'admin'
		}
		if ( oResAppLevel >= 7 )
		{
			sAccessType = 'manager'
		}
		else if (oResAppLevel >= 5 )
		{
			sAccessType = 'expert'
		}
		else if (oResAppLevel >= 1 )
		{
			sAccessType = 'observer'
		}
		else
		{
			sAccessType = 'reject'
		}
	}
	
	switch(sAccessType)
	{
		case 'admin':
		case 'manager':
			break;
		case 'expert':
			xarrExperts = tools.xquery("for $elem in experts where $elem/person_id = " + iCurUserID + " return $elem/Fields('id')");
			if (ArrayOptFirstElem(xarrExperts) != undefined)
			{
				iExpertID = ArrayOptFirstElem(xarrExperts).id;
				xarrCategories = tools.xquery("for $elem in roles where $elem/catalog_name = 'course' and contains($elem/experts,'" + OptInt(iExpertID, 0) + "') return $elem");
				if(ArrayOptFirstElem(xarrCategories) != undefined)
				{
					arrXQueryConditions.push( "MatchSome ($elem/role_id, (" + ArrayMerge(xarrCategories, 'This.id', ',') + ")) ")
				}
				else
				{
					oRes.error = 501;
					oRes.errorText = "RemoteCollection: libCourse: GetCourseModules: пользователь " + iCurUserID + " не является экспертом ни в одной категории";
					oRes.result = [];
					return oRes;
				}
			}
			else
			{
				oRes.error = 501;
				oRes.errorText = "RemoteCollection: libCourse: GetCourseModules: пользователь " + iCurUserID + " не является экспертом";
				oRes.result = [];
				return oRes;
			}
			break;
		case 'observer':
			break;
		case 'reject': 
			oRes.error = 501;
			oRes.errorText = "RemoteCollection: libCourse: GetCourseModules: доступ отсутствует";
			oRes.result = [];
			return oRes;
			break;
	}
	
	sXQueryConditions = ArrayCount( arrXQueryConditions ) > 0 ? ' where ' + ArrayMerge( arrXQueryConditions, 'This', ' and ' ) : '';
	
	xarrModulesAll = tools.xquery("for $elem in course_modules " + sXQueryConditions + " return $elem");
	
	oRes.result = tools.call_code_library_method( 'libMain', 'select_page_sort_params', [ xarrModulesAll, oCollectionParams.paging, oCollectionParams.sort] ).oResult;
	
	return oRes;
}