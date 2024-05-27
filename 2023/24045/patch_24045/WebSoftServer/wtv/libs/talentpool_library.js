
/**
 * @namespace Websoft.WT.TalentPool
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
 * @typedef {Object} display_form
*/
/**
 * @typedef {Object} select_object
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
 * @typedef {Object} oSimpleFieldElem
 * @memberof Websoft.WT.TalentPool
 * @property {string} name
 * @property {string} type 
 * @property {string} value 
*/



/**
 * @typedef {Object} oSimpleResult
 * @memberof Websoft.WT.TalentPool
 * @property {number} error
 * @property {string} errorText 
*/
/**
 * @typedef {Object} oSimpleResultCount
 * @memberof Websoft.WT.TalentPool
 * @property {number} error
 * @property {string} errorText 
 * @property {number} count 
*/
/**
 * @typedef {Object} oSimpleResultParagraph
 * @memberof Websoft.WT.TalentPool
 * @property {number} error
 * @property {string} errorText 
 * @property {string} paragraph 
*/
/**
 * @typedef {Object} oSimpleRAResult
 * @memberof Websoft.WT.TalentPool
 * @property {number} error
 * @property {string} errorText 
 * @property {Object} result 
*/


/**
 * @function toLog
 * @memberof Websoft.WT.TalentPool
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
		EnableLog('lib_tailent_pool');
		LogEvent('lib_tailent_pool', sText )
	}
}


function GetAccessAction(iCurObjectID, iPersonID)
{
	return ArrayExtract(tools.call_code_library_method( "libMain", "GetActionRules", [ iPersonID, iCurObjectID ] ).result, "This.rule");
}

// ======================================================================================
// ==========+=========== Функции приведения типов (CAST) ===============================
// ======================================================================================

/**
 * @typedef {Object} oReserveTask
 * @memberof Websoft.WT.TalentPool
 * @property {string} id - ID записи
 * @property {bigint} task_id - ID задачи
 * @property {bigint} object_id - ID объекта справочника, в состав которго вxодит задача
 * @property {string} object_catalog - имя справочника, в состав объекта которого вxодит задача
 * @property {string} object_catalog_title - наименование справочника, в состав объекта которого вxодит задача
 * @property {bigint} person_id - ID сотрудника, которому назначенва задача
 * @property {string} person_fullname - ФИО сотрудника, которому назначенва задача
 * @property {bigint} parent_id - ID родительской задачи (этапа программы развития)
 * @property {boolean} has_children - Элемент может иметь дочерние элементы
 * @property {string} name - Наименование задачи
 * @property {string} type - Тип задачи (ID)
 * @property {string} type_desc - Тип задачи (наименование)
 * @property {string} status - Статус задачи (ID)
 * @property {string} status_desc - Статус задачи (наименование)
 * @property {string} start_date_str - Плановая дата начала (строка)
 * @property {date} start_date - Плановая дата начала
 * @property {string} plan_date_str - Плановая дата выполнения (строка)
 * @property {date} plan_date - Плановая дата выполнения
 * @property {integer} score - Оценка
 * @property {bigint} tutor_id - Наставник (ID)
 * @property {string} tutor_fullname - Наставник (ФИО)
 * @property {string} activity_type - Тип (имя каталога) объекта по задаче
 * @property {bigint} desc - Описание задачи
 * @property {string} message - Дополнительная (служебная) информация по задаче
 * @property {bigint} activity_id - ID объекта по задаче
 * @property {string} activity_name - Наименование объекта по задаче
 * @property {string} link - Ссылка на карточку объекта
 * @property {string} link_msg - Сообщение в случае отсутствия ссылки
*/
function cast_oReserveTask(itemTask, iCurUserID, ObjectParam)
{
	var statusDesc = undefined;
	var sStatus = itemTask.status.Value;
	var sStatusName = "";
	var typeDesc = undefined;
	var iTutorID = null;
	var sTutorFullname = "";
	var sImgUrl = "/ico/" + itemTask.object_type.Value + ".ico";
	var sDeadlines = "-"
	
	var teObject, sCatalogName;
	try
	{
		sCatalogName = ObjectParam.Name;
		teObject = ObjectParam;
	}
	catch(e)
	{
		try
		{
			teObject = tools.open_doc(ObjectParam).TopElem;
			sCatalogName = teObject.Name;
		}
		catch(ee)
		{
			try
			{
				teObject = itemTask.Doc.TopElem;
				sCatalogName = teObject.Name;
			}
			catch(err)
			{
				throw StrReplace("Для задачи [{PARAM1}] не получено родительского объекта]:\r\n","{PARAM1}", itemTask.id + "/" +itemTask.name) + err;
			}
		}
	}
	switch(sCatalogName)	
	{
		case "career_reserve":
		{
			var sCatalogTitle =  "Задача";
			if((sStatus == 'plan' || sStatus == 'active') && itemTask.plan_date.HasValue && DateDiff(DateNewTime(itemTask.plan_date.Value, 23, 59, 59), Date()) < 0)
			{
				sStatus = 'overdue';
				sStatusName =  "Просрочен";
			}
			else
			{
				statusDesc = ArrayOptFind(get_statuses_career_reserve(), "This.id == sStatus");
				if(statusDesc != undefined) sStatusName = statusDesc.name
			}
			typeDesc = ArrayOptFind(get_task_type_career_reserve(), "This.id == itemTask.type.Value");
			if(itemTask.tutor_id.HasValue)
			{
				var xTutor = ArrayOptFirstElem(XQuery("for $elem in collaborators where $elem/id=" + itemTask.tutor_id.Value + " return $elem"))
				if(xTutor != undefined)
				{
					sTutorFullname = xTutor.fullname.Value;
					iTutorID = xTutor.id.Value;
				}
			}
			break;
		}
		case "personnel_reserve":
		{
			var sCatalogTitle =  "Испытание";
			if((sStatus == 'plan' || sStatus == 'active') && itemTask.plan_date.HasValue && DateDiff(DateNewTime(itemTask.plan_date.Value, 23, 59, 59), Date()) < 0)
			{
				sStatus = 'overdue';
				sStatusName =  "Просрочен";
			}
			else
			{
				statusDesc = ArrayOptFind(get_statuses_career_reserve(), "This.id == sStatus");
				if(statusDesc != undefined) sStatusName = statusDesc.name
			}
			typeDesc = ArrayOptFind(get_task_type_personnel_reserve(), "This.id == itemTask.type.Value");
			break;
		}
		default:
		{
			throw StrReplace("Переданный объект [{PARAM1}] не является задачей этапа развития карьеры или испытанием кадрового резерва", "{PARAM1}", String(teObject.id) + "_" + itemTask.id.Value + "/" + itemTask.name.Value)
		}
	}
	
	iCurUserID = OptInt(iCurUserID, teObject.person_id.Value);
	
	var Link = "", objName = "", msgLink = "";
	if(itemTask.object_id.HasValue)
	{
		var exch_type = ArrayOptFind(common.exchange_object_types, "This.name.Value == itemTask.object_type.Value");
		if(exch_type != undefined)
		{
			//if(String(exch_type.web_template) != "") Link = exch_type.web_template + "&object_id=" + itemTask.object_id.Value;
			objName = itemTask.object_id.OptForeignElem;
			if(objName != undefined )
			{
				if(objName.OptChild('resource_id') != undefined)
				{
					sImgUrl = tools_web.get_object_source_url( 'resource', objName.ChildValue('resource_id') );
				}
				objName = objName.ChildValue(exch_type.disp_name);
			}
			
			switch(itemTask.type.Value)
			{
				case "learning_task":
				{
					if(itemTask.learning_task_result_id.HasValue)
					{
						Link = tools_web.get_mode_clean_url( null, itemTask.learning_task_result_id.Value )    
					}
					else
					{
						Link = tools_web.get_mode_clean_url( null, itemTask.object_id.Value )    
					}
					break;
				}
				default:
				{
					Link = tools_web.get_mode_clean_url( null, itemTask.object_id.Value )    
				}
			}
			
		}
		else
		{
			msgLink = "Неизвестный тип активности"
		}
	}
	else if(itemTask.type.Value == 'poll_procedure' && itemTask.poll_procedure_id.HasValue)
	{
		Link = tools_web.get_mode_clean_url( null, itemTask.poll_procedure_id.Value )    
		objName = itemTask.poll_procedure_id.OptForeignElem;
		if(objName != undefined ) objName = objName.ChildValue('name');
	}
	else
	{
		msgLink = "У задачи отсутствует активность"
	}

	if(itemTask.ChildExists("start_date") && itemTask.start_date.HasValue && itemTask.plan_date.HasValue)
	{
		sDeadlines = StrDate(itemTask.start_date.Value, false, false) + " - " + StrDate(itemTask.plan_date.Value, false, false);
	}
	else if(itemTask.ChildExists("start_date") && itemTask.start_date.HasValue)
	{
		sDeadlines = "с " + StrDate(itemTask.start_date.Value, false, false);
	}
	else if(itemTask.plan_date.HasValue)
	{
		sDeadlines = "до " + StrDate(itemTask.plan_date.Value, false, false);
	}
	
	var oItem = {
		id: String(teObject.id) + "_" + itemTask.id.Value,
		task_id: itemTask.id.Value,
		object_id:	String(teObject.id),
		object_catalog: sCatalogName,
		object_catalog_title: sCatalogTitle,
		person_id: teObject.person_id.Value,
		person_fullname: teObject.person_id.sd.fullname.Value,
		parent_id: ((itemTask.ChildExists("parent_task_id") && itemTask.parent_task_id.HasValue) ? String(teObject.id) + "_" + itemTask.parent_task_id.Value : ""),
		has_children: (itemTask.type.Value == 'stage'),
		name: itemTask.name.Value,
		type: itemTask.type.Value,
		type_desc: (typeDesc != undefined ? typeDesc.name : ""),
		status: sStatus,
		status_desc: sStatusName,
		start_date: (itemTask.ChildExists("start_date") ? itemTask.start_date.Value : null),
		start_date_str: (itemTask.ChildExists("start_date") ? StrLongDate(itemTask.start_date.Value) : ""),
		plan_date: itemTask.plan_date.Value,
		plan_date_str: StrLongDate(itemTask.plan_date.Value),
		fact_date: itemTask.fact_date.Value,
		fact_date_str: StrLongDate(itemTask.fact_date.Value),
		deadline: sDeadlines,
		score: itemTask.score.Value,
		tutor_id: iTutorID,
		tutor_fullname: sTutorFullname,
		desc: itemTask.desc.Value,
		message: "",
		activity_type: itemTask.object_type.Value,
		activity_id: itemTask.object_id.Value,
		activity_name: objName,
		img_url: sImgUrl,
		link: Link,
		link_msg: msgLink
	};
	
	if (oItem.person_id != iCurUserID)
	{
		oItem.link = (StrReplace(StrReplace(oItem.link,'test_learning_proc','test_learning_stat'),'learning_proc','learning_stat'));
	}	
	
	return oItem;
}

/**
 * @typedef {Object} oCollaborator
 * @memberof Websoft.WT.TalentPool
 * @property {bigint} id
 * @property {string} name - ФИО сотрудника
 * @property {bigint} position_id - Должность (ID)
 * @property {string} position_name - Должность (наименование)
 * @property {bigint} org_id - Организация (ID)
 * @property {string} org_name - Организация (наименование)
 * @property {bigint} subdivision_id - Подразделение (ID)
 * @property {string} subdivision_name - Подразделение (наименование)
 * @property {bigint} boss_type_id - Тип руководителя (ID)
 * @property {string} boss_type_name - Тип руководителя (наименование)
 * @property {string} message - Дополнительная (служебная) информация по сотруднику
 * @property {string} image_url - URL изображения сотрудника
 * @property {string} form_url - Ссылка на карточку сотрудника
*/
function cast_oCollaborator(itemPerson)
{
	if(itemPerson.ChildExists("person_fullname"))
	{
		var oItem = {
			id: itemPerson.person_id.Value,
			name: itemPerson.person_fullname.Value,
			position_id: itemPerson.person_position_id.Value,
			position_name: itemPerson.person_position_name.Value,
			org_id: itemPerson.person_org_id.Value,
			org_name: itemPerson.person_org_name.Value,
			subdivision_id: itemPerson.person_subdivision_id.Value,
			subdivision_name: itemPerson.person_subdivision_name.Value,
			boss_type_id: itemPerson.boss_type_id.Value,
			boss_type_name: itemPerson.boss_type_id.ForeignDispName,
			message: "",
			image_url: tools_web.get_object_source_url( 'person', itemPerson.person_id.Value, '200' ),
			form_url: tools_web.get_mode_clean_url(null, itemPerson.person_id.Value)
		};
	}	
	else if(itemPerson.ChildExists("fullname"))
	{
		var oItem = {
			id: itemPerson.id.Value,
			name: itemPerson.fullname.Value,
			position_id: itemPerson.position_id.Value,
			position_name: itemPerson.position_name.Value,
			org_id: itemPerson.org_id.Value,
			org_name: itemPerson.org_name.Value,
			subdivision_id: itemPerson.position_parent_id.Value,
			subdivision_name: itemPerson.position_parent_name.Value,
			boss_type_id: null,
			boss_type_name: "",
			message: "",
			image_url: tools_web.get_object_source_url( 'person', itemPerson.id.Value, '200' ),
			form_url: tools_web.get_mode_clean_url(null, itemPerson.id.Value)
		};
	}	
	else if(itemPerson.ChildExists("firstname"))
	{
		var oItem = {
			id: itemPerson.id.Value,
			name: itemPerson.lastname.Value + " " + itemPerson.firstname.Value,
			position_id: itemPerson.position_id.Value,
			position_name: itemPerson.position_name.Value,
			org_id: itemPerson.org_id.Value,
			org_name: itemPerson.org_name.Value,
			subdivision_id: itemPerson.position_parent_id.Value,
			subdivision_name: itemPerson.position_parent_name.Value,
			boss_type_id: null,
			boss_type_name: "",
			message: "",
			image_url: tools_web.get_object_source_url( 'person', itemPerson.id.Value, '200' ),
			form_url: tools_web.get_mode_clean_url(null, itemPerson.id.Value)
		};
	}	
	else
		throw StrReplace("Аргумент не является объектом с информацией о сотруднике:\r\n[{PARAM1}]", "{PARAM1}", tools.object_to_text(itemPerson, "json"));
	
	return oItem;
}

/**
 * @typedef {Object} oTailentPool
 * @memberof Websoft.WT.TalentPool
 * @property {bigint} id
 * @property {string} name - Название кадрового резерва
 * @property {bigint} career_reserve_type_id - Тип кадрового резерва (ID)
 * @property {string} career_reserve_type_name - Тип кадрового резерва (наименование)
 * @property {bigint} person_id - Сотрудник (ID)
 * @property {string} person_fullname - ФИО сотрудника
 * @property {string} person_position_name - Должность сотрудника
 * @property {string} person_org_name - Организация сотрудника
 * @property {datetime} start_date - Дата получения статуса "Кандидат"
 * @property {datetime} include_reserve_date - Дата включения в резерв
 * @property {datetime} finish_date - Дата закрытия
 * @property {string} status - Статус кадрового резерва (ID)
 * @property {string} status_desc - Статус кадрового резерва (наименование)
 * @property {string} message - Дополнительная (служебная) информация по кадровому резерву
 * @property {bigint} nomination_id - Способ выдвижения в резерв (ID)
 * @property {string} nomination_name - Способ выдвижения в резерв (наименование)
 * @property {bigint} exclusion_reason_id - Основание для исключения (ID)
 * @property {string} exclusion_reason_name - Основание для исключения (наименование)
 * @property {bigint} development_potential_id - Потенциал развития (ID)
 * @property {string} development_potential_name - Потенциал развития (наименование)
 * @property {bigint} efficiency_estimation_id - Оценка эффективности (ID)
 * @property {string} efficiency_estimation_name - Оценка эффективности (наименование)
 * @property {boolean} is_candidate - Является кандидатом
 * @property {string} career_reserve_title - Заголовок для готовности
 * @property {bigint} career_reserve_id - Связанный этап развития карьеры (ID)
 * @property {integer} career_reserve_readiness_percent - Процент готовности
 * @property {datetime} career_reserve_readiness_date - Дата планируемого окончания (дата готовности)
 * @property {string} image_url - URL аватарки сотрудника
 * @property {string} link - URL карточки кадрового резерва
*/
function cast_oTailentPool(tePersonelReserve)
{
	var statusDesc = ArrayOptFindByKey(get_statuses_personnel_reserve(), tePersonelReserve.status.Value, "id");
	
	var catCareerResreve = ArrayOptFirstElem(XQuery ("for $elem in career_reserves where $elem/person_id=" + XQueryLiteral(tePersonelReserve.person_id.Value) + " and $elem/personnel_reserve_id=" + XQueryLiteral(tePersonelReserve.id.Value) + " and $elem/position_type!='adaptation' order by $elem/start_date descending return $elem"));
	var iCareerReserveID = catCareerResreve != undefined ? catCareerResreve.id.Value: null;
	var rCareerReserveReadinessPercent = catCareerResreve != undefined ? catCareerResreve.readiness_percent.Value: null;
	var dCareerReserveReadinessDate = catCareerResreve != undefined ? catCareerResreve.plan_readiness_date.Value: null;
	
	var fldPersonnelReservePosition = tePersonelReserve.person_id.sd.position_id.OptForeignElem
	var fldPersonnelReservePositionSubdivision = undefined;
	if(fldPersonnelReservePosition != undefined)
		fldPersonnelReservePositionSubdivision = fldPersonnelReservePosition.parent_object_id.OptForeignElem;
	
	var fldPersonnelReserveType = tePersonelReserve.career_reserve_type_id.OptForeignElem;
	var fldPersonnelReserveNomination = tePersonelReserve.nomination_id.OptForeignElem;
	var fldPersonnelReserveExclusionReason = tePersonelReserve.exclusion_reason_id.OptForeignElem;
	var fldPersonnelReserveDevelopmentPotential = tePersonelReserve.development_potential_id.OptForeignElem;
	var fldPersonnelReserveEfficiencyEstimation = tePersonelReserve.efficiency_estimation_id.OptForeignElem;

	var oItem = {
		id: tePersonelReserve.id.Value,
		name: tePersonelReserve.name.Value,
		career_reserve_type_id: tePersonelReserve.career_reserve_type_id.Value,
		career_reserve_type_name: (fldPersonnelReserveType != undefined ? fldPersonnelReserveType.name.Value : ""),
		person_id: tePersonelReserve.person_id.Value,
		person_fullname: tePersonelReserve.person_id.sd.fullname.Value,
		person_position_name: tePersonelReserve.person_id.sd.position_name.Value,
		person_subdivision_name: (fldPersonnelReservePositionSubdivision != undefined ? fldPersonnelReservePositionSubdivision.name.Value : ""),
		person_org_name: tePersonelReserve.person_id.sd.org_name.Value,
		start_date: tePersonelReserve.start_date.Value,
		include_reserve_date: tePersonelReserve.include_reserve_date.Value,
		finish_date: tePersonelReserve.finish_date.Value,
		status: tePersonelReserve.status.Value,
		status_desc: (statusDesc != undefined ? statusDesc.name : ""),
		message: "",
		nomination_id: tePersonelReserve.nomination_id.Value,
		nomination_name: (fldPersonnelReserveNomination != undefined ? fldPersonnelReserveNomination.name.Value : ""),
		exclusion_reason_id: tePersonelReserve.exclusion_reason_id.Value,
		exclusion_reason_name: (fldPersonnelReserveExclusionReason != undefined ? fldPersonnelReserveExclusionReason.name.Value : ""),
		development_potential_id: tePersonelReserve.development_potential_id.Value,
		development_potential_name: (fldPersonnelReserveDevelopmentPotential != undefined ? fldPersonnelReserveDevelopmentPotential.name.Value : ""),
		efficiency_estimation_id: tePersonelReserve.efficiency_estimation_id.Value,
		efficiency_estimation_name: (fldPersonnelReserveEfficiencyEstimation != undefined ? fldPersonnelReserveEfficiencyEstimation.name.Value : ""),
		is_candidate: ( iCareerReserveID == null ),
		career_reserve_title: ( iCareerReserveID != null ? ( "Готовность" + ": " + rCareerReserveReadinessPercent + "%" ) : "Кандидат" ),
		career_reserve_id: iCareerReserveID,
		career_reserve_readiness_percent: rCareerReserveReadinessPercent,
		career_reserve_readiness_date: dCareerReserveReadinessDate,
		image_url: tools_web.get_object_source_url( 'person', tePersonelReserve.person_id.Value, '200' ),
		link: tools_web.get_mode_clean_url( null, tePersonelReserve.id.Value )
	};
	
	oItem.text_html = "<div class=\"text_html personnel_reserve\">\n"
	oItem.text_html += "<p class=\"person_position_name\"><span class=\"title\">Текущая должность:</span><span class=\"text\">" + oItem.person_position_name + "</span></p>\n";
	oItem.text_html += "<p class=\"person_subdivision_name\"><span class=\"title\">Подразделение:</span><span class=\"text\">" + oItem.person_subdivision_name + "</span></p>\n";
	oItem.text_html += "<p class=\"career_reserve_type_name\"><span class=\"title\">Кадровый резерв:</span><span class=\"text\">" + oItem.career_reserve_type_name + "</span></p>\n";
	oItem.text_html += "<p class=\"status_desc\"><span class=\"title\">Статус:</span><span class=\"text\">" + oItem.status_desc  + "</span></p>\n";
	oItem.text_html += "<p class=\"development_potential_name\"><span class=\"title\">Потенциал развития:</span><span class=\"text\">" + oItem.development_potential_name  + "</span></p>\n";
	oItem.text_html += "<p class=\"efficiency_estimation_name\"><span class=\"title\">Оценка эффективности:</span><span class=\"text\">" + oItem.efficiency_estimation_name  + "</span></p>\n";
	oItem.text_html += "<p class=\"exclusion_reason_name\"><span class=\"title\">Основание для исключения:</span><span class=\"text\">" + oItem.exclusion_reason_name  + "</span></p>\n";
	oItem.text_html += "<p class=\"nomination_name\"><span class=\"title\">Способ выдвижения в резерв:</span><span class=\"text\">" + oItem.nomination_name  + "</span></p>\n";
	oItem.text_html += "</div>";
	return oItem;
}

/**
 * @typedef {Object} oCareerPlan
 * @memberof Websoft.WT.TalentPool
 * @property {bigint} id
 * @property {string} name - Название карьерного плана
 * @property {string} object_type - Тип карьерного плана (ID)
 * @property {string} object_type_name - Тип карьерного плана (наименование)
 * @property {datetime} start_date_date - Дата включения
 * @property {string} start_date - Дата включения
 * @property {string} status - Статус карьерного плана (ID)
 * @property {string} status_desc - Статус карьерного плана (наименование)
 * @property {bigint} budget_period_id - Бюджетный период (ID)
 * @property {bigint} budget_period_name - Бюджетный период (наименование)
 * @property {bigint} object_id - Связвнный объект карьерного плана (ID)
 * @property {bigint} object_name - Связвнный объект карьерного плана (наименование)
 * @property {string} done_percent - Процент заверщенности карьерного плана
 * @property {int} career_plan_stage_count - число этапов в маршруте
 * @property {string} last_stage_name - название последнего этапа
 * @property {string} message - Дополнительная (служебная) информация по карьерному плану
*/
function cast_CareerPlan(fldCareerPlan, bGetCalculateField)
{
	bGetCalculateField = tools_web.is_true(bGetCalculateField);
	
	var statusDesc = ArrayOptFindByKey(get_statuses_career_reserve(), fldCareerPlan.status.Value, "id");
	var fldExchangeType = ArrayOptFindByKey(common.exchange_object_types, fldCareerPlan.object_type.Value, "name");

	var sCareerPlanBudgetPeriodName = "";
	if(fldCareerPlan.budget_period_id.HasValue)
	{
		var catCareerPlanBudgetPeriod = ArrayOptFirstElem(XQuery("for $elem in budget_periods where $elem/id=" + fldCareerPlan.budget_period_id.Value + " return $elem"));
		if(catCareerPlanBudgetPeriod != undefined) sCareerPlanBudgetPeriodName = catCareerPlanBudgetPeriod.name.Value;
	}

	var sCareerPlanObjectName = "";
	if(fldExchangeType != undefined && fldCareerPlan.object_id.HasValue)
	{
		var catCareerPlanObject = ArrayOptFirstElem(XQuery("for $elem in " + fldCareerPlan.object_type.Value + "s where $elem/id=" + fldCareerPlan.object_id.Value + " return $elem"));
		if(catCareerPlanObject != undefined) sCareerPlanObjectName = catCareerPlanObject.Child(fldExchangeType.disp_name.Value).Value;
	}

	var oItem = {
		id: fldCareerPlan.id.Value,
		name: fldCareerPlan.name.Value,
		object_type: fldCareerPlan.object_type.Value,
		object_type_name: (fldExchangeType != undefined ? fldExchangeType.title.Value : ""),
		start_date_date: fldCareerPlan.start_date.Value,
		start_date: StrLongDate(fldCareerPlan.start_date.Value),
		status: fldCareerPlan.status.Value,
		status_desc: (statusDesc != undefined ? statusDesc.name : ""),
		budget_period_id: fldCareerPlan.budget_period_id.Value,
		budget_period_name: sCareerPlanBudgetPeriodName,
		object_id: fldCareerPlan.object_id.Value,
		object_name: sCareerPlanObjectName,
		done_percent: "",
		career_plan_stage_count: "",
		last_stage_name: "",
		message: "",
	};
	
	if(bGetCalculateField)
	{
		var docPlan = open_object(fldCareerPlan.id.Value);
		var arrAllTasks = get_task_wo_cancel(docPlan.TopElem.stages);
		var iFullTaskCount = ArrayCount(arrAllTasks);
		if(iFullTaskCount != 0)
		{
			var iActiveTaskCount = ArrayCount(ArraySelect(arrAllTasks, "This.status != 'active' && This.status != 'plan'"));

			oItem.done_percent = Real(iActiveTaskCount)*100.0/Real(iFullTaskCount);
		}
		oItem.career_plan_stage_count = ArrayCount(docPlan.TopElem.stages);

		if (ArrayOptMax(docPlan.TopElem.stages, 'plan_date') != undefined)
		{
			oItem.last_stage_name = ArrayOptMax(docPlan.TopElem.stages, 'plan_date').name
		}
	}
	
	return oItem;
}

/**
 * @typedef {Object} oCareerPlanStage
 * @memberof Websoft.WT.TalentPool
 * @property {bigint} id
 * @property {string} name - Название этапа карьерного плана
 * @property {string} transition_direction - Направление этапа карьерного плана (ID)
 * @property {string} transition_direction_name - Направление этапа карьерного плана (наименование)
 * @property {bigint} position_common_id - Типовая должность (ID)
 * @property {string} position_common_name - Типовая должность (наименование)
 * @property {bigint} position_id - Должность (ID)
 * @property {string} position_name - Должность (наименование)
 * @property {datetime} plan_date_date - Плановая дата начала
 * @property {string} plan_date - Плановая дата начала
 * @property {datetime} fact_date_date - Фактическая дата начала
 * @property {string} fact_date - Фактическая дата начала
 * @property {string} status - Статус карьерного плана (ID)
 * @property {string} status_desc - Статус карьерного плана (наименование)
 * @property {bigint} budget_period_id - Бюджетный период (ID)
 * @property {bigint} budget_period_name - Бюджетный период (наименование)
 * @property {string} stipulation - Дополнительное условие
 * @property {string} comment - Комментарий
 * @property {string} message - Дополнительная (служебная) информация по этапу карьерного плана
*/
function cast_CareerPlanStage(fldCareerPlanStage)
{
	var statusDesc = ArrayOptFindByKey(get_statuses_career_reserve(), fldCareerPlanStage.status.Value, "id");
	var direstionDesc = ArrayOptFindByKey(common.career_transition_direction_types, fldCareerPlanStage.career_transition_direction.Value, "id");

	var sCareerPlanStagePositionCommonName = "";
	if(fldCareerPlanStage.position_common_id.HasValue)
	{
		var catCareerPlanStagePositionCommon = ArrayOptFirstElem(XQuery("for $elem in position_commons where $elem/id=" + fldCareerPlanStage.position_common_id.Value + " return $elem"));
		if(catCareerPlanStagePositionCommon != undefined) sCareerPlanStagePositionCommonName = catCareerPlanStagePositionCommon.name.Value;
	}

	var sCareerPlanStagePositionName = "";
	if(fldCareerPlanStage.position_id.HasValue)
	{
		var catCareerPlanStagePosition = ArrayOptFirstElem(XQuery("for $elem in positions where $elem/id=" + fldCareerPlanStage.position_id.Value + " return $elem"));
		if(catCareerPlanStagePosition != undefined) sCareerPlanStagePositionName = catCareerPlanStagePosition.name.Value;
	}

	var sCareerPlanStageBudgetPeriodName = "";
	if(fldCareerPlanStage.budget_period_id.HasValue)
	{
		var catCareerPlanStageBudgetPeriod = ArrayOptFirstElem(XQuery("for $elem in budget_periods where $elem/id=" + fldCareerPlanStage.budget_period_id.Value + " return $elem"));
		if(catCareerPlanStageBudgetPeriod != undefined) sCareerPlanStageBudgetPeriodName = catCareerPlanStageBudgetPeriod.name.Value;
	}

	var oItem = {
		id: fldCareerPlanStage.id.Value,
		name: fldCareerPlanStage.name.Value,
		transition_direction: fldCareerPlanStage.career_transition_direction.Value,
		transition_direction_name: (direstionDesc != undefined ? direstionDesc.name : ""),
		position_common_id: fldCareerPlanStage.position_common_id.Value,
		position_common_name: sCareerPlanStagePositionCommonName,
		position_id: fldCareerPlanStage.position_id.Value,
		position_name: sCareerPlanStagePositionName,
		plan_date_date: fldCareerPlanStage.plan_date.Value,
		plan_date: StrLongDate(fldCareerPlanStage.plan_date.Value),
		fact_date_date: fldCareerPlanStage.fact_date.Value,
		fact_date: StrLongDate(fldCareerPlanStage.fact_date.Value),
		status: fldCareerPlanStage.status.Value,
		status_desc: (statusDesc != undefined ? statusDesc.name : ""),
		budget_period_id: fldCareerPlanStage.budget_period_id.Value,
		budget_period_name: sCareerPlanStageBudgetPeriodName,
		stipulation: fldCareerPlanStage.stipulation.Value,
		comment: fldCareerPlanStage.comment.Value,
		message: "",
	};
	
	return oItem;
}

/**
 * @typedef {Object} oCareerPlanStageTree
 * @memberof Websoft.WT.TalentPool
 * @property {string} hier_id - ID ветви в дереве
 * @property {bigint} id - ID
 * @property {string} title - Название этапа карьерного плана
 * @property {integer} level - уровень записи
 * @property {string} parent - ID родительской ветви дерева
 * @property {string} text - Текст
 * @property {string} desc - Описание
*/
function cast_CareerPlanStageToTree(fldCareerPlanStage, iLevel, sHierID, sParentID)
{
	var statusDesc = ArrayOptFindByKey(get_statuses_career_reserve(), fldCareerPlanStage.status.Value, "id");
	var direstionDesc = ArrayOptFindByKey(common.career_transition_direction_types, fldCareerPlanStage.career_transition_direction.Value, "id");

	var sCareerPlanStagePositionCommonName = "";
	if(fldCareerPlanStage.position_common_id.HasValue)
	{
		var catCareerPlanStagePositionCommon = ArrayOptFirstElem(XQuery("for $elem in position_commons where $elem/id=" + fldCareerPlanStage.position_common_id.Value + " return $elem"));
		if(catCareerPlanStagePositionCommon != undefined) sCareerPlanStagePositionCommonName = catCareerPlanStagePositionCommon.name.Value;
	}

	var sCareerPlanStagePositionName = "";
	if(fldCareerPlanStage.position_id.HasValue)
	{
		var catCareerPlanStagePosition = ArrayOptFirstElem(XQuery("for $elem in positions where $elem/id=" + fldCareerPlanStage.position_id.Value + " return $elem"));
		if(catCareerPlanStagePosition != undefined) sCareerPlanStagePositionName = catCareerPlanStagePosition.name.Value;
	}

	var sCareerPlanStageBudgetPeriodName = "";
	if(fldCareerPlanStage.budget_period_id.HasValue)
	{
		var catCareerPlanStageBudgetPeriod = ArrayOptFirstElem(XQuery("for $elem in budget_periods where $elem/id=" + fldCareerPlanStage.budget_period_id.Value + " return $elem"));
		if(catCareerPlanStageBudgetPeriod != undefined) sCareerPlanStageBudgetPeriodName = catCareerPlanStageBudgetPeriod.name.Value;
	}

	var aFields = [];
	if(direstionDesc != undefined) aFields.push("Направление: " + direstionDesc.name);
	if(sCareerPlanStagePositionCommonName != "") aFields.push("Типовая должность: " + sCareerPlanStagePositionCommonName);
	if(sCareerPlanStagePositionName != "") aFields.push("Должность: " + sCareerPlanStagePositionName);
	if(fldCareerPlanStage.plan_date.HasValue) aFields.push("Плановая дата начала: " + StrLongDate(fldCareerPlanStage.plan_date.Value));
	if(statusDesc != undefined) aFields.push("Статус: " + statusDesc.name);
	if(sCareerPlanStageBudgetPeriodName != "") aFields.push("Бюджетный период: " + sCareerPlanStageBudgetPeriodName);
	if(fldCareerPlanStage.comment.Value != "")
	{
		aFields.push("");
		aFields.push("Комментарий:<BR/>" + StrReplace(StrReplace(StrReplace(fldCareerPlanStage.comment.Value, "\r\n", "<BR/>"), "\r", "<BR/>"), "\n", "<BR/>"));
	}
	
	var sContent = UrlEncode16(ArrayMerge(aFields, "This", "<BR/>"));

	var oItem = {
		hier_id: sHierID,
		level: iLevel,
		parent: sParentID,
		id: fldCareerPlanStage.id.Value,
		title: fldCareerPlanStage.name.Value,
		text: sContent,
		desc: sContent
	};
		//fact_date = StrLongDate(fldCareerPlanStage.fact_date.Value);
		//stipulation = fldCareerPlanStage.stipulation.Value;
	
	return oItem;
}


/**
 * @typedef {Object} oPersonnelCommitteeMember
 * @property {bigint} id – ID участника .
 * @property {bigint} object_id – ID участника .
 * @property {string} object_name – Наименование участника.
 * @property {string} catalog – каталог участника.
 * @property {string} position_name – должность участника.
 * @property {string} position_parent_name – подразделение участника.
 * @property {string} status – статус участника.
 * @property {string} status_name – наименование статуса участника.
 * @property {string} f_question – Обсуждвемый вопрос
 * @property {string} link – Ссылка на карточку участника.
*/
function cast_PersonnelCommitteeMember(catPersonnelCommitteeItem)
{
	docCR = tools.open_doc(catPersonnelCommitteeItem.id);
	//var sFQuestion = docCR.TopElem.custom_elems.ObtainChildByKey("f_question").value
	var sFQuestion = docCR.TopElem.comment.Value
	
	var catObject = catPersonnelCommitteeItem.object_id.OptForeignElem;
	var catStatus = catPersonnelCommitteeItem.status.OptForeignElem;
	
	var oRet = {
		id: RValue(catPersonnelCommitteeItem.id),
		object_id: RValue(catPersonnelCommitteeItem.object_id),
		object_name: RValue(catPersonnelCommitteeItem.object_name),
		catalog: RValue(catPersonnelCommitteeItem.catalog),
		position_name: (catObject != undefined ? catObject.position_name.Value : ""),
		position_parent_name: (catObject != undefined ? catObject.position_parent_name : ""),
		status: RValue(catPersonnelCommitteeItem.status),
		status_name:(catStatus != undefined ? catStatus.name.Value : ""),
		f_question: Trim(sFQuestion),
		link: tools_web.get_mode_clean_url( null, catPersonnelCommitteeItem.object_id.Value )
	};
	
	return oRet;
}

/**
 * @typedef {Object} oPersonnelCommittee
 * @property {bigint} id – ID участника .
 * @property {bigint} name – ID участника .
 * @property {datetime} committee_date – Наименование участника.
 * @property {string} committee_date_s – каталог участника.
 * @property {datetime} end_date – должность участника.
 * @property {string} end_date_s – подразделение участника.
 * @property {string} status – статус участника.
 * @property {string} status_name – наименование статуса участника.
 * @property {string} link – Ссылка на карточку кадрового комитета.
*/
function cast_PersonnelCommittee(catPersonnelCommittee)
{
	var catStatus = catPersonnelCommittee.status.OptForeignElem;

	var oRet = {
		id: RValue(catPersonnelCommittee.id),
		name: RValue(catPersonnelCommittee.name),
		committee_date: RValue(catPersonnelCommittee.committee_date),
		committee_date_s: (StrDate(catPersonnelCommittee.committee_date, false,false)),
		end_date: RValue(catPersonnelCommittee.end_date),
		end_date_s: (StrDate(catPersonnelCommittee.end_date, false,false)),
		status: RValue(catPersonnelCommittee.status),
		status_name:(catStatus != undefined ? catStatus.name.Value : ""),
		link: tools_web.get_mode_clean_url( null, catPersonnelCommittee.id.Value )
	};
	
	return oRet;
}

// ======================================================================================
// ==================================  Выборки ==========================================
// ======================================================================================

/**
 * @typedef {Object} oLngItem
 * @memberof Websoft.WT.TalentPool
 * @property {string} id
 * @property {string} val - значение константы
 * @property {bool} web 
*/

/**
 * @typedef {Object} oAccess
 * @memberof Websoft.WT.TalentPool
 * @property {bigint} user_id - ID текущего пользователя
 * @property {string} access_type - тип вычисляемого доступа. undefined, пустая строка  или ‘all’ – выдавать всем всё; self – сам пользователь; boss – пользователь является руководителем объекта; self_boss - сам пользователь ИЛИ руководитель объекта
 * @property {oLngItem[]} cur_lng - текущие языковые константы
*/


/**
 * @typedef {Object} oCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @property {bigint} id
 * @property {string} name - ФИО сотрудника
 * @property {string} position - должность сотрудника
 * @property {datetime} start_date_date - дата начала адаптации
 * @property {string} start_date - дата начала адаптации
 * @property {datetime} plan_readiness_date_date - плановая дата окончания адаптации
 * @property {string} plan_readiness_date - плановая дата окончания адаптации
 * @property {string} readiness_percent_string  - процент завершенности (форматированная строка)
 * @property (real) readiness_percent - процент завершенности
 * @property {string} status - Статус адаптации
 * @property {string} boss_type_name - Наименование типа руководителя
 * @property {string} link - Ссылка на карточку адаптации
 * @property {real} done_percent - Процент заверщенности адаптации (форматированная строка)
 * @property {string} done_percent_native - Процент заверщенности адаптации
 * @property {string} process_progress - Ход процесса (возможные значения Без проблем/Требует внимания/Есть проблемы)
 * @property {string} status_id - ID статуса
 * @property {string} text_html - HTML для тайтла
*/
/**
 * @typedef {Object} WTCareerReserveResult
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oCareerReserve[]} result – результат
*/
/**
 * @function GetAdaptation
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка адаптаций по сотруднику.
 * @param {bigint} iPersonIDParam - ID сотрудника по которому осуществляется выборка этапов развития карьеры
 * @param {string} sPersonType - тип выборки (all - любые, person - по сотруднику, чей этап, tutor - этапы, где указанный сотрудник является наставником, boss - этапы
 * @param {string|string[]} Statuses - массив/строка статусов для отбора по статусам.
 * @param {string} sAccessType Тип доступа: "admin"/"manager"/"hr"/"observer"/"auto"
 * @param {string} sApplication код/ID приложения, по которому определяется доступ
 * @param {string} filter строка для XQuery-фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @param {oCalcProblemParams} oCalcProblemParams - Набор параметров для вычисления проблем
 * @returns {WTCareerReserveResult}
*/
function GetAdaptation(iPersonIDParam, sPersonType, Statuses, sAccessType, sApplication, filter, oCollectionParams, oCalcProblemParams)
{
	var oRet = tools.get_code_library_result_object();
	oRet.result = [];
	oRet.data = {};
	oRet.paging = oCollectionParams.paging;
	
	var arrDistinct = (DataType(oCollectionParams) == 'object' && ObjectType(oCollectionParams) == 'JsObject' && IsArray(oCollectionParams.GetOptProperty("distincts", null))) ? oCollectionParams.distincts : [];

	iPersonID = OptInt(iPersonIDParam);
	
	if(iPersonID == undefined)
	{
		oRet.error = 1;
		oRet.errorText = "Некорректный ID сотрудника";
		return oRet;
	}
	
	if ( ! StrContains("auto,admin,manager,hr,observer", sAccessType) )
		sAccessType = "auto";
		
	try
	{
		var arrConds = [];
		var arrProgressConds = [];
		var bPostQueryProcess = false;
		
		if(sApplication != null && sApplication != undefined && sApplication != "")
		{
			if(sAccessType == "auto")
			{
				var iApplLevel = tools.call_code_library_method( "libApplication", "GetPersonApplicationAccessLevel", [ iPersonID, sApplication ] );

				if(iApplLevel >= 10) // Администратор приложения
				{
					sAccessType = "admin";
				}
				else if(iApplLevel >= 7) // администратор процесса
				{
					sAccessType = "manager";
				}
				else if(iApplLevel >= 5) // HR
				{
					sAccessType = "hr";
				}
				else if(iApplLevel >= 3) // методист
				{
					sAccessType = "expert";
				}
				else if(iApplLevel >= 1) // Наблюдатель
				{
					sAccessType = "observer";
				}
				else
				{
					sAccessType = "reject";
				}
			}
			
			sCatalog = "group"
			switch(sAccessType)
			{
				case "hr": // HR
					// адаптации сотрудников, для которых текущий пользователь является функциональным руководителем типа,
					// указанного в параметр boss_types_id приложения. Если параметр пуст, то берем тип руководителя education_manager;
					{
						var iAppHRManagerTypeID = tools.call_code_library_method("libApplication", "GetApplicationHRBossTypeID", [ sApplication, iPersonID ])
						var xqLongListQuery = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iPersonID, ['func'], false, 'career_reserve', ['id'], '', true, true, true, true, (iAppHRManagerTypeID == null ? [] : [iAppHRManagerTypeID]) ], true );
						bPostQueryProcess = true;
						break;
					}
				case "expert":
				case "observer":// наблюдатель
					// адаптации сотрудников, для которых текущий пользователь является функциональным руководителем любого типа.
					{
						var xqLongListQuery = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iPersonID, ['func'], false, 'career_reserve', ['id'], '', true, true, true, true, [], true ] );
						bPostQueryProcess = true;
						break;
					}
				case "reject":
					{
						arrConds.push("1 = 0");;
						break;
					}
			}
		}
		else
		{
			switch(sPersonType)
			{
				case "all":
				{
					break;
				}
				case "person":
				{
					arrConds.push("$elem/person_id=" + XQueryLiteral(iPersonID))
					break;
				}
				case "boss":
				{
					var xarrSubordinate = tools.call_code_library_method( "libMain", "GetTypicalSubordinates", [ iPersonID ] );
					var xqLongListQuery = XQuery( "for $elem_qc in career_reserves where MatchSome($elem_qc/person_id, (" + ArrayMerge(xarrSubordinate, 'This.id.Value', ',') + ")) return $elem_qc/Fields('id')" );
					bPostQueryProcess = true;
					break;
				}
				case "tutor":
				{
					arrConds.push("some $cross_cr in career_reserve_tutors satisfies ($elem/id = $cross_cr/career_reserve_id and $cross_cr/tutor_id=" + iPersonID + " and $cross_cr/tutor_type = 'tutor')")
					break;
				}
				case "colleague":
				{
					var xqLongListQuery = XQuery( "for $elem_qc in career_reserves where MatchSome($elem_qc/person_id, (" + ArrayMerge(get_colleague_by_subdivisions(iPersonID, true, false), 'This.basic_collaborator_id.Value', ',') + ")) return $elem_qc/Fields('id')" );
					bPostQueryProcess = true;
					break;
				}
			}	
		}
		
		// формирование возврата distinct
		if(ArrayOptFirstElem(arrDistinct) != undefined)
		{
			oRet.data.SetProperty("distincts", {});
			var xarrPositions, xarrSubdivision, xarrStatuses;
			for(sFieldName in arrDistinct)
			{
				oRet.data.distincts.SetProperty(sFieldName, []);
				switch(sFieldName)
				{
					case "f_status":
					{
						oRet.data.distincts.f_status = [
							{name:"В работе", value: "active"},
							{name:"Планируется", value: "plan"}
						];
						break;
					}
					case "f_progress":
					{
						oRet.data.distincts.f_progress = [
							{name:"Нет проблем", value: "no"},
							{name:"Требует внимания", value: "warning"},
							{name:"Есть проблемы", value: "yes"},
						];
						break;
					}
				}
			}
		}
		
		/* FILTERS */
		var arrFilters = oCollectionParams.GetOptProperty( "filters", [] );

		for(oFilter in arrFilters)
		{
			if(oFilter.type == 'search')
			{
				if ( oFilter.value != '' )
					arrConds.push("doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )");
			}
			else if (oFilter.type == 'select')
			{
				switch(oFilter.id)
				{
					case "f_status":
					{
						if(ArrayOptFind(oFilter.value, "This.value != ''") != undefined)
						{
							arrConds.push( "MatchSome( $elem/status, ( " + ArrayMerge(ArraySelect(oFilter.value, "This.value != ''"), "XQueryLiteral(This.value)", ",") + " ) )" );
						}
						break;
					}
					case "f_progress":
					{
						if(ArrayOptFind(oFilter.value, "This.value != ''") != undefined)
						{
							arrProgressConds = oFilter.value;
						}
;
						break;
					}
				}
			}
			else if (oFilter.type == 'date')
			{
				paramValueFrom = oFilter.HasProperty("value_from") ? DateNewTime(ParseDate(oFilter.value_from)) : null;
				paramValueTo = oFilter.HasProperty("value_to") ? DateNewTime(ParseDate(oFilter.value_to), 23, 59, 59) : null;
				
				switch(oFilter.id)
				{
					case "f_start_date":
					{
						if(paramValueFrom != null && paramValueTo != null)
						{
							arrConds.push( "$elem/start_date >= " + XQueryLiteral(paramValueFrom) + " and $elem/start_date  <= " + XQueryLiteral(paramValueTo));
						}
						else if(paramValueFrom != null)
						{
							arrConds.push( "$elem/start_date >= " + XQueryLiteral(paramValueFrom));
						}
						else if(paramValueTo != null)
						{
							arrConds.push( "$elem/start_date <= " + XQueryLiteral(paramValueTo));
						}	
						break;
					}
					case "f_plan_readiness_date":
					{
						if(paramValueFrom != null && paramValueTo != null)
						{
							arrConds.push( "$elem/plan_readiness_date >= " + XQueryLiteral(paramValueFrom) + " and $elem/plan_readiness_date  <= " + XQueryLiteral(paramValueTo));
						}
						else if(paramValueFrom != null)
						{
							arrConds.push( "$elem/plan_readiness_date >= " + XQueryLiteral(paramValueFrom));
						}
						else if(paramValueTo != null)
						{
							arrConds.push( "$elem/plan_readiness_date <= " + XQueryLiteral(paramValueTo));
						}	
						break;
					}
					case "f_finish_date":
					{
						if(paramValueFrom != null && paramValueTo != null)
						{
							arrConds.push( "$elem/finish_date >= " + XQueryLiteral(paramValueFrom) + " and $elem/finish_date  <= " + XQueryLiteral(paramValueTo));
						}
						else if(paramValueFrom != null)
						{
							arrConds.push( "$elem/finish_date >= " + XQueryLiteral(paramValueFrom));
						}
						else if(paramValueTo != null)
						{
							arrConds.push( "$elem/finish_date <= " + XQueryLiteral(paramValueTo));
						}	
						break;
					}
				}
				
			}
		}

		if(DataType(Statuses) == 'string')
			Statuses = [Statuses];
		
		if(Statuses == null || Statuses == undefined || Statuses == "" || !IsArray(Statuses) || ArrayOptFirstElem(Statuses) == undefined)
			arrConds.push("MatchSome($elem/status, ('active') )");
		else if(ArrayOptFind(Statuses, "This == 'all'") == undefined)
			arrConds.push("MatchSome($elem/status, (" + ArrayMerge(Statuses, "XQueryLiteral(This)", ",") + "))");
			
		arrConds.push("$elem/position_type = 'adaptation'");
		var sCondSort = " order by $elem/start_date descending";
		if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
		{
			switch(oCollectionParams.sort.FIELD)
			{
				case "name":
					sCondSort = " order by $elem/person_fullname" + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "") ;
					break;
				case "position":
					sCondSort = " order by $elem/position_name" + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "");
					break;
				case "readiness_percent":
					sCondSort = " order by $elem/readiness_percent_native" + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "");
					break;
				case "done_percent_native":
				case "done_percent":
					break;
				default:
					sCondSort = " order by $elem/" + oCollectionParams.sort.FIELD + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "");
			}
		}
		
		if(filter != null && filter != undefined && filter != "")
			arrConds.push("(" + filter + ")");
		
		var sCond = ArrayOptFirstElem(arrConds) != undefined ? " where " + ArrayMerge(arrConds, "This", " and ") : "";
		var strReq = "for $elem in career_reserves" + sCond + sCondSort + " return $elem";

//toLog("GetAdaptation: strReq: " + strReq);
		var arrAdaptation = tools.xquery(strReq);

		if(bPostQueryProcess)
		{
			arrAdaptation =  ArrayIntersect(arrAdaptation, xqLongListQuery, "This.id", "This.id");
		}

		if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
		{
			oCollectionParams.paging.MANUAL = true;
			oCollectionParams.paging.TOTAL = ArrayCount(arrAdaptation);
			oRet.paging = oCollectionParams.paging;
			arrAdaptation = ArrayRange(arrAdaptation, OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE, oCollectionParams.paging.SIZE);
		}
				
		var sReqBossType, fldStatus, fldSubdivision;
		for(itemAdaptation in arrAdaptation)
		{
			sReqBossType = "for $elem in boss_types where some $fm in talent_pool_func_managers satisfies ($elem/id=$fm/boss_type_id and $fm/person_id=" + iPersonID + " and $fm/object_id=" + itemAdaptation.id.Value + " ) return $elem";
			sReqTutorsNumber = "for $elem in talent_pool_func_managers where $elem/catalog = 'career_reserve' and $elem/object_id = " + itemAdaptation.id.Value + " return $elem";
			fldStatus = itemAdaptation.status.OptForeignElem;
			fldSubdivision = itemAdaptation.subdivision_id.OptForeignElem;
			oItem = {
				id: itemAdaptation.id.Value,
				person_id: itemAdaptation.person_id.Value,
				name: itemAdaptation.person_fullname.Value,
				position: itemAdaptation.person_position.Value,
				start_date: itemAdaptation.start_date.Value,
				plan_readiness_date: itemAdaptation.plan_readiness_date.Value,
				finish_date: itemAdaptation.finish_date.Value,
				readiness_percent_string: StrReal(itemAdaptation.readiness_percent.Value, 1),
				readiness_percent: itemAdaptation.readiness_percent.Value,
				status: (fldStatus != undefined ? fldStatus.name.Value : ""),
				subdivision: (fldSubdivision != undefined ? fldSubdivision.name.Value : ""),
				boss_type_name: ArrayOptFirstElem(tools.xquery(sReqBossType), {name: ""} ).name,
				tutors_number: ArrayCount(tools.xquery(sReqTutorsNumber)),
				image_url: tools_web.get_object_source_url( 'person', itemAdaptation.person_id.Value, '200' ),
				link: tools_web.get_mode_clean_url( null, itemAdaptation.id.Value ),
				done_percent_native: "",
				done_percent: "",
				process_progress: "",
				status_id: (fldStatus != undefined ? fldStatus.id.Value : ""),
				text_html: "<p class=\"readiness_percent_string\"><span class=\"title\">Прогресс выполнения: </span><span class=\"text\">" + StrReal(itemAdaptation.readiness_percent.Value, 1) + "%</span></p>\n"
			};

			if ( ObjectType(oCalcProblemParams) == 'JsObject' && oCalcProblemParams.bCalculateProblems)
			{	
				oItem.text_html = "";
				if (fldStatus.id == 'active' || fldStatus.id == 'plan')
				{
					iLimitProblem1 = Real(oCalcProblemParams.sLimitProblem1);
					iLimitProblem2 = Real(oCalcProblemParams.sLimitProblem2);
					
					docAdaptation = tools.open_doc(itemAdaptation.id);
					teAdaptation = docAdaptation.TopElem;
					
					arrActivePlanTasks = ArraySelect(teAdaptation.tasks, 'This.status == "plan" || This.status == "active"');
					iActivePlanTasksCount = ArrayCount(arrActivePlanTasks);
					arrProblemTasks = ArraySelect(arrActivePlanTasks, 'This.plan_date < Date()');
					
					if ( !oCalcProblemParams.bCalculateProblemsAll )
					{
						percentExpiredTasks = iActivePlanTasksCount > 0 ? Real(ArrayCount(arrProblemTasks)) * 100 / Real(iActivePlanTasksCount) : 0.0;
					}
					else
					{
						arrPassedFailedTasks = ArraySelect(teAdaptation.tasks, 'This.status == "passed" || This.status == "failed"');
						arrComplProblemTasks = ArraySelect(arrPassedFailedTasks, 'This.fact_date > This.plan_date');
						arrProblemTasks = ArrayUnion(arrProblemTasks, arrComplProblemTasks);
						iCountAllTasks = iActivePlanTasksCount + ArrayCount(arrPassedFailedTasks);
						percentExpiredTasks = iCountAllTasks > 0 ? Real(ArrayCount(arrProblemTasks)) * 100 / Real(iCountAllTasks): 0.0;
					}

					if ( percentExpiredTasks < iLimitProblem1)
					{
						oItem.text_html +="<p class=\"readiness_percent_string\"><span class=\"title\">Прогресс выполнения: </span><span class=\"text\" style=\"color: rgb(0,255,0)\">" + StrReal(itemAdaptation.readiness_percent.Value, 1) + "%</span></p>\n"
						sText = 'Нет проблем';
						oItem.process_progress = sText;
						oItem.text_html += "<p class=\"process_progress\"><span class=\"title\">Ход процесса: </span><span class=\"text\" style=\"color: rgb(0,255,0)\">" + sText + "</span></p>\n";
					}
					else if ( percentExpiredTasks >= iLimitProblem1 && percentExpiredTasks < iLimitProblem2 )
					{
						oItem.text_html +="<p class=\"readiness_percent_string\"><span class=\"title\">Прогресс выполнения: </span><span class=\"text\" style=\"color: rgb(255,128,0)\">" + StrReal(itemAdaptation.readiness_percent.Value, 1) + "%</span></p>\n"
						sText = 'Требует внимания';
						oItem.process_progress = sText;
						oItem.text_html += "<p class=\"process_progress\"><span class=\"title\">Ход процесса: </span><span class=\"text\" style=\"color: rgb(255,128,0)\">" + sText + "</span></p>\n";
					}
					else if ( percentExpiredTasks >= iLimitProblem2 )
					{
						oItem.text_html +="<p class=\"readiness_percent_string\"><span class=\"title\">Прогресс выполнения: </span><span class=\"text\" style=\"color: rgb(255,0,0)\">" + StrReal(itemAdaptation.readiness_percent.Value, 1) + "%</span></p>\n"
						sText = 'Есть проблемы';
						oItem.process_progress = sText;
						oItem.text_html += "<p class=\"process_progress\"><span class=\"title\">Ход процесса: </span><span class=\"text\" style=\"color: rgb(255,0,0)\">" + sText + "</span></p>\n";
					}
				}
				else if (fldStatus.id == 'passed' || fldStatus.id == 'failed')
				{
					oItem.text_html +="<p class=\"readiness_percent_string\"><span class=\"title\">Прогресс выполнения: </span>" + StrReal(itemAdaptation.readiness_percent.Value, 1) + "%</span></p>\n"
					sText = 'Завершено';
					oItem.process_progress = sText;
					oItem.text_html += "<p class=\"process_progress\"><span class=\"title\">Ход процесса: </span>" + sText + "</span></p>\n";
				}
				else
				{
					oItem.text_html +="<p class=\"readiness_percent_string\"><span class=\"title\">Прогресс выполнения: </span>" + StrReal(itemAdaptation.readiness_percent.Value, 1) + "%</span></p>\n"
					sText = 'Отменено';
					oItem.process_progress = sText;
					oItem.text_html += "<p class=\"process_progress\"><span class=\"title\">Ход процесса: </span>" + sText + "</span></p>\n";
				}
			}

			oRet.result.push(oItem);
		}
		
		if (ArrayOptFirstElem(arrProgressConds) != undefined)
		{
			sCondsProgress = ArrayMerge(ArraySelect(arrProgressConds, "This.name != ''"), "This.name", ",");
			oRet.result = ArraySelect(oRet.result, 'StrContains(sCondsProgress, This.process_progress)')
		}
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = "ERROR: GetAdaptation:\r\n" + err;
	}
	
	return oRet;
}


/**
 * @typedef {Object} oGetTypicalDevelopmentProgramParams
 * @property {bigint} position_common - ID типовой должности
 * @property {bigint} position_family - ID семейства должностей
 * @property {bigint} subdivision_group - ID группы подразделений
 * @property {bigint} adaptation_collaborator - ID сотрудника
 * @property {bigint} external_depth - число календарных дней с момента приема на работу сотрудника, когда ему может быть назначена адаптация
 * @property {bigint} internal_depth - число календарных дней с момента внутреннего перемещения на новую должность, когда ему может быть назначена адаптация
 * @property {string} sXQueryQual - строка для XQuery-фильтра
*/
/**
 * @typedef {Object} oSimpleCatalogElem
 * @memberof Websoft.WT.TalentPool
 * @property {bigint} id
 * @property {string} name
 * @property {string} status
 * @property {bigint} stage_count
 * @property {bigint} task_count
 * @property {bigint} position_common_count
 * @property {bigint} position_family_count
 * @property {bigint} subdivision_group_count
 * @property {string} appointment_type
*/
/**
 * @typedef {Object} WTSimpleCatalogListResult
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oSimpleCatalogElem[]} array – массив с данными типовых программ развития
*/
/**
 * @function GetTypicalDevelopmentProgram
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка типовых программ развития.
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {string} sAccessType - Тип доступа: "admin"/"manager"/"hr"/"expert"/"tutor"/"observer"/"auto"
 * @param {string} sApplication  - код приложения, по которому определяется доступ
 * @param {string} arrStates - массив статусов типовых программ развития для вывода: "plan"(Планируется), "active"(Действует), "archive"(Архив)
 * @param {string} [arrReturnData] - массив полей для вывода: "position_common_count"(Число типовых должностей), "position_family_count"(Число семейств должностей), "subdivision_group_count"(Число групп подразделений)
 * @param {oGetTypicalDevelopmentProgramParams} oParam - Параметры выборки
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {WTSimpleCatalogListResult}
*/
function GetTypicalDevelopmentProgram( iCurUserID, sAccessType, sApplication, arrStates, arrReturnData, oParam, oCollectionParams )
{
	oRes = tools.get_code_library_result_object();
	oRes.array = [];
	var oPaging = oCollectionParams.GetOptProperty("paging");
	oRes.paging = oPaging;
	
	
	var arrConds = [];

	iCurUserID = OptInt(iCurUserID, 0);

	if ( sAccessType == null || sAccessType == undefined)
	{
		sAccessType = "auto";
	}
	if ( sAccessType != "auto" && sAccessType != "admin" && sAccessType != "manager" && sAccessType != "hr" && sAccessType != "expert" && sAccessType != "tutor" && sAccessType != "observer" )
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
		else if(iApplLevel >= 2)
		{
			sAccessType = "tutor"; //Наставник
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
		{
			oExpert = ArrayOptFirstElem(tools.xquery("for $elem in experts where $elem/type = 'collaborator' and $elem/person_id = " + iCurUserID + " return $elem/Fields('id')"));

			arrRoles = [];
			if (oExpert != undefined)
			{
				arrRoles = tools.xquery("for $elem in roles where $elem/catalog_name = 'typical_development_program' and contains($elem/experts," + OptInt(oExpert.id, 0) + ") return $elem/Fields('id')");
			}
			arrConds.push("MatchSome( $elem/role_id, ( " + ArrayMerge( arrRoles, "This.id.Value", "," ) + " ) )");
			break;
		}
	case "tutor":
		{
			oTutor = ArrayOptFirstElem(tools.xquery("for $elem in tutors where $elem/person_id = " + iCurUserID + " return $elem/Fields('id')"));
			if ( oTutor == undefined )
			{
				oRes.error = 1;
				oRes.errorText = 'Наставник не найден'
				return oRes;
			}
			docTutor = tools.open_doc( oTutor.id.Value );
			_cond = "MatchSome($elem/id, ( ))";
			if ( docTutor != undefined)
			{
				_cond = "MatchSome($elem/id, (" + ArrayMerge(docTutor.TopElem.typical_development_programs, "This.typical_development_program_id", "," ) + "))";
			}
			arrConds.push( _cond );
			break;
		}
	case "reject":
		{
			arrConds.push( "MatchSome($elem/id, ( ))" );
		}
	}

	if ( arrStates != null && arrStates != undefined )
	{
		arrStates = tools_web.parse_multiple_parameter(arrStates);
	}
	else
	{
		arrStates = [];
	}
	arrRightStates = [];
	if ( IsArray(arrStates) )
	{
		for ( _sState in arrStates )
		{
			switch( _sState )
			{
				case "plan":
				case "active":
				case "archive":
				{
					arrRightStates.push( _sState );
					break;
				}
			}
		}
	}
	arrConds.push( "MatchSome($elem/status, (" + ArrayMerge(arrRightStates, "XQueryLiteral(This)", "," ) + "))" );
	

	if ( arrReturnData == null || arrReturnData == undefined)
	{
		arrReturnData = [];
	}
	bPosition_common_count = false; //Число типовых должностей
	bPosition_family_count = false; //Число семейств должностей
	bSubdivision_group_count = false; //Число групп подразделений
	if ( ArrayOptFirstElem( arrReturnData ) != undefined )
		{
			for ( itemReturnData in arrReturnData )
			{
				switch ( itemReturnData )
				{
					case "position_common_count": //Число типовых должностей
						bPosition_common_count = true;
						break;
					case "position_family_count": //Число семейств должностей
						bPosition_family_count = true;
						break;
					case "subdivision_group_count": //Число групп подразделений
						bSubdivision_group_count = true;
						break;
				}
			}
		}

	if ( bPosition_common_count || bPosition_family_count || bSubdivision_group_count )
	{
		xarrObjReqs = tools.xquery( "for $elem in object_requirements where MatchSome( $elem/object_type, ( 'position_common', 'position_family', 'subdivision_group' )) and $elem/requirement_object_type = 'typical_development_program' return $elem/Fields('object_type','requirement_object_id')" );
	}

	var iPositionCommonID = OptInt(oParam.GetOptProperty("position_common"), null);
	var iPositionFamilyID = OptInt(oParam.GetOptProperty("position_family"), null);
	var iSubdivisionGroupID = OptInt(oParam.GetOptProperty("subdivision_group"), null);
	if ( iPositionCommonID != null || iPositionFamilyID != null || iSubdivisionGroupID != null )
	{
		var _ObjIDs = [];
		if ( iPositionCommonID != null )
			_ObjIDs.push( iPositionCommonID );
		if ( iPositionFamilyID != null )
			_ObjIDs.push( iPositionFamilyID );
		if ( iSubdivisionGroupID != null )
			_ObjIDs.push( iSubdivisionGroupID );

		xarrObjReqsByObjects = tools.xquery( "for $elem in object_requirements where $elem/requirement_object_type = 'typical_development_program' and MatchSome($elem/object_id, (" + _ObjIDs.join(",") + ")) return $elem" );
		
		_arrTDPIDs = ArrayExtract(xarrObjReqsByObjects, "This.requirement_object_id.Value");
		arrConds.push( "MatchSome($elem/id, (" + ArrayMerge(_arrTDPIDs, "This", "," ) + "))" );
	}


	var iPersonID = OptInt(oParam.GetOptProperty("adaptation_collaborator"), null);
	var iExternalDepth = oParam.GetOptProperty("external_depth", null);
	var iInternalDepth = oParam.GetOptProperty("internal_depth", null); 
	if ( iExternalDepth != null )
		iExternalDepth = iExternalDepth * 86400;
	if ( iInternalDepth != null )
		iInternalDepth = iInternalDepth * 86400;

	docPerson = tools.open_doc(iPersonID);
	if ( docPerson != undefined )
	{
		tePerson = docPerson.TopElem;
		dHireDate = tePerson.hire_date.HasValue ? tePerson.hire_date.Value : null; 

		arrPositions = tools.xquery("for $elem in positions where $elem/basic_collaborator_id = " + iPersonID + " return $elem")
		arrPositionCommons = ArrayExtract(ArraySelect(arrPositions, "OptInt(This.position_common_id) != undefined"), "({ position_id: This.id.Value, position_common_id: This.position_common_id.Value })");
		xarrPositionCommons = tools.xquery("for $elem in position_commons where MatchSome($elem/id, (" + ArrayMerge(arrPositionCommons, "This.position_common_id", ",") + ")) return $elem");
		arrPositionFamilies = [];
		for ( oPositionCommon in xarrPositionCommons )
		{
			for ( _pos_family in tools_web.parse_multiple_parameter(oPositionCommon.position_familys.Value) )
			{
				oElem = {
					position_common_id: oPositionCommon.id.Value,
					position_family_id: _pos_family
				}
				arrPositionFamilies.push( oElem );
			}
		}

		sSubdivisionIDs = ArrayMerge( ArraySelect( arrPositions, "OptInt(This.parent_object_id) != undefined" ), "This.parent_object_id.Value", "," );
		xarrSubGroupsSubs = tools.xquery("for $elem in subdivision_group_subdivisions where MatchSome($elem/subdivision_id, ( " + sSubdivisionIDs + ")) return $elem");
		arrSubdivisionGroups = ArrayExtract( xarrSubGroupsSubs, "({ subdivision_id: This.subdivision_id.Value, subdivision_group_id: This.subdivision_group_id.Value })" );

		arrAllObjectIDs = ArrayUnion( ArrayExtract(arrPositionCommons, "This.position_common_id"), ArrayUnion( ArrayExtract(arrPositionFamilies, "This.position_family_id"), ArrayExtract(arrSubdivisionGroups, "This.subdivision_group_id") ) );
		xarrObjReqsByPerson = tools.xquery("for $elem in object_requirements where $elem/requirement_object_type = 'typical_development_program' and MatchSome( $elem/object_id, (" + ArrayMerge(arrAllObjectIDs, "This", ",") + ")) return $elem/Fields('additional_param','requirement_object_id')");

		arrPersonTDP = [];
		for ( oPosition in arrPositions )
		{
			arrCurPositionCommons = ArrayExtract(ArraySelect(arrPositions, "OptInt(This.position_common_id) != undefined && This.id.Value == oPosition.id.Value "), "This.position_common_id.Value");
			arrCurPositionCommons = ArraySelect( arrPositionCommons, "This.position_id == oPosition.id.Value" );
			arrCurPositionFamilies = ArrayIntersect( arrPositionFamilies, arrCurPositionCommons, "This.position_common_id", "This.position_common_id" );

			_felem = ArrayOptFirstElem(ArraySelect( arrPositions, "OptInt(This.parent_object_id) != undefined && This.id.Value == oPosition.id.Value" ));
			if ( _felem != undefined )
			{
				iSubDivID = _felem.parent_object_id;
			}
			
			arrCurSubdivisionGroups = ArrayIntersect( arrSubdivisionGroups, [ iSubDivID ], "This.subdivision_id", "This" );

			arrCurAllObjectIDs = ArrayUnion( ArrayExtract(arrCurPositionCommons, "This.position_common_id"), ArrayUnion( ArrayExtract(arrCurPositionFamilies, "This.position_family_id"), ArrayExtract(arrCurSubdivisionGroups, "This.subdivision_group_id") ) );

			dPositionDate = tePerson.position_date.HasValue ? tePerson.position_date.Value : null; 
			if(dPositionDate == null)
			{
				xqPosition = tePerson.position_id.OptForeignElem;
				if(xqPosition != undefined && xqPosition.position_date.HasValue)
					dPositionDate = xqPosition.position_date.Value;
			}
			
			if(dHireDate != null && DateDiff(Date(), dHireDate) <= iExternalDepth)
			{ //внешнее перемещение
				xarrObjReqsByPersonSelected = ArraySelect( xarrObjReqsByPerson, "This.additional_param.Value == 'ext' || This.additional_param.Value == 'any'" );
				xarrObjReqsByPersonIntersected = ArrayIntersect( xarrObjReqsByPersonSelected, arrCurAllObjectIDs, "This.object_id.Value", "This" );
				arrPersonTDP = ArrayUnion(arrPersonTDP, ArrayExtract( xarrObjReqsByPersonIntersected, "This.requirement_object_id.Value"));
			}
			else if((dHireDate != null && DateDiff(Date(), dHireDate) > iExternalDepth) && (dPositionDate != null && DateDiff(Date(), dPositionDate) <= iInternalDepth))
			{ //внутреннее перемещение
				xarrObjReqsByPersonSelected = ArraySelect( xarrObjReqsByPerson, "This.additional_param.Value == 'int' || This.additional_param.Value == 'any'" );
				xarrObjReqsByPersonIntersected = ArrayIntersect( xarrObjReqsByPersonSelected, arrCurAllObjectIDs, "This.object_id.Value", "This" );
				arrPersonTDP = ArrayUnion(arrPersonTDP, ArrayExtract( xarrObjReqsByPersonIntersected, "This.requirement_object_id.Value"));
			}
		}
		arrConds.push( "MatchSome($elem/id, (" + ArrayMerge(arrPersonTDP, "This", "," ) + "))" );
	}

//XQuery-фильтр
	sXQueryQual = oParam.GetOptProperty("sXQueryQual", null);
	if ( sXQueryQual != null && sXQueryQual != "" )
	{
		arrConds.push( sXQueryQual );
	}

//полнотекстовый поиск
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
				arrConds.push("doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )");
		}
	}

	var strReq = "for $elem in typical_development_programs " + (ArrayOptFirstElem(arrConds) != undefined ? "where " + ArrayMerge(arrConds, "This", " and ") : "") + " return $elem";
	for( oTypDevProg in tools.xquery(strReq))
	{
		docTypDevProgr = tools.open_doc( oTypDevProg.id.Value );

		_appointment_type = null;
		_xarrObjReqs = [];
		if ( iPersonID != null )
		{
			_xarrObjReqs = xarrObjReqsByPerson;
		}
		if ( iPositionCommonID != null || iPositionFamilyID != null || iSubdivisionGroupID != null )
		{
			_xarrObjReqs = xarrObjReqsByObjects;
		}
		oCurReqObj =  ArrayOptFind(_xarrObjReqs, "This.requirement_object_id.Value == oTypDevProg.id.Value"); 
		if ( oCurReqObj != undefined )
		{
			switch ( oCurReqObj.additional_param.Value )
			{
				case "any":
					{
						_appointment_type = "Любое перемещение";
						break;
					}
				case "ext":
					{
						_appointment_type = "Внешнее перемещение";
						break;
					}
				case "int":
					{
						_appointment_type = "Внутреннее  перемещение";
						break;
					}
			}
		}

		oItem = {
			id: oTypDevProg.id.Value,
			name: oTypDevProg.name.Value,
			status: (oTypDevProg.status.HasValue ? oTypDevProg.status.ForeignElem.name : ''),
			stage_count: (docTypDevProgr != undefined ? ArrayCount( ArraySelect( docTypDevProgr.TopElem.tasks, "This.type.Value == 'stage'" ) ): 0),
			task_count: (docTypDevProgr != undefined ? ArrayCount( ArraySelect( docTypDevProgr.TopElem.tasks, "This.type.Value != 'stage'" ) ): 0),
			position_common_count: null, //Число типовых должностей
			position_family_count: null, //Число семейств должностей
			subdivision_group_count: null, //Число групп подразделений
			appointment_type: _appointment_type
		};
		if ( bPosition_common_count )
		{
			oItem.position_common_count = ArrayCount( ArraySelect( xarrObjReqs, " This.object_type.Value == 'position_common' && This.requirement_object_id.Value == oTypDevProg.id.Value" ) ); //Число типовых должностей
		}
		if ( bPosition_family_count )
		{
			oItem.position_family_count = ArrayCount( ArraySelect( xarrObjReqs, " This.object_type.Value == 'position_family' && This.requirement_object_id.Value == oTypDevProg.id.Value" ) ); //Число семейств должностей
		}
		if ( bSubdivision_group_count )
		{
			oItem.subdivision_group_count = ArrayCount( ArraySelect( xarrObjReqs, " This.object_type.Value == 'subdivision_group' && This.requirement_object_id.Value == oTypDevProg.id.Value" ) ); //Число групп подразделений
		}
		
		oRes.array.push(oItem);
	}
	
	if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		var sFieldName = oCollectionParams.sort.FIELD;
		switch(sFieldName)
		{
			case "name":
			case "status":
			case "appointment_type":
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
 * @function GetPersonnelReserveType
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка типов кадрового резерва.
 * @param {bigint} [iPersonIDParam] - (optional) ID куратора, по которому осуществляется выборка типов кадрового резерва
 * @returns {WTSimpleCatalogListResult}
*/
function GetPersonnelReserveType(iPersonIDParam)
{
	var oRet = {
		error: 0,
		errorText: "",
		result: []
	};
		
	iPersonID = OptInt(iPersonIDParam);
	if(iPersonID == undefined)
	{
		var strReq = "for $elem in career_reserve_types return $elem";
	}
	else
	{
		var strCuratorReq = "for $elem in talent_pool_func_managers where $elem/catalog='career_reserve_type' and $elem/person_id=" + iPersonID + " return $elem/Fields('object_id')";
		var xqCuratorsCareeerReserveType = XQuery(strCuratorReq);
		var strReq = "for $elem in career_reserve_types where MatchSome($elem/id, (" + ArrayMerge(xqCuratorsCareeerReserveType, "This.object_id.Value", ",") + ")) return $elem";
		
	}
	
	for(itemList in XQuery(strReq))
	{
		oItem = {
			id: itemList.id.Value,
			name: itemList.name.Value
		};
		
		oRet.result.push(oItem);
	}
	
	return oRet;
}

/**
 * @function GetTalentPoolNomination
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка способов выдвижения в резерв.
 * @returns {WTSimpleCatalogListResult}
*/
function GetTalentPoolNomination()
{
	var oRet = {
		error: 0,
		result: [],
		errorText: "",
	};
		
	var strReq = "for $elem in talent_pool_nominations return $elem";
	for(itemList in XQuery(strReq))
	{
		oItem = {
			id: itemList.id.Value,
			name: itemList.name.Value
		};
		
		oRet.result.push(oItem);
	}
	
	return oRet;
}

/**
 * @function GetExclusionReason
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка оснований для исключения.
 * @returns {WTSimpleCatalogListResult}
*/
function GetExclusionReason()
{
	var oRet = {
		error: 0,
		result: [],
		errorText: "",
	};
		
	var strReq = "for $elem in exclusion_reasons return $elem";
	for(itemList in XQuery(strReq))
	{
		oItem = {
			id: itemList.id.Value,
			name: itemList.name.Value
		};
		
		oRet.result.push(oItem);
	}
	
	return oRet;
}

/**
 * @function GetDevelopmentPotential
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка потенциалов развития.
 * @returns {WTSimpleCatalogListResult}
*/
function GetDevelopmentPotential()
{
	var oRet = {
		error: 0,
		result: [],
		errorText: "",
	};
		
	var strReq = "for $elem in development_potentials return $elem";
	for(itemList in XQuery(strReq))
	{
		oItem = {
			id: itemList.id.Value,
			name: itemList.name.Value
		};
		
		oRet.result.push(oItem);
	}
	
	return oRet;
}

/**
 * @function GetEfficiencyEstimation
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка потенциалов развития.
 * @returns {WTSimpleCatalogListResult}
*/
function GetEfficiencyEstimation()
{
	var oRet = {
		error: 0,
		result: [],
		errorText: "",
	};
		
	var strReq = "for $elem in efficiency_estimations return $elem";
	for(itemList in XQuery(strReq))
	{
		oItem = {
			id: itemList.id.Value,
			name: itemList.name.Value
		};
		
		oRet.result.push(oItem);
	}
	
	return oRet;
}

/**
 * @typedef {Object} oSimpleListElem
 * @memberof Websoft.WT.TalentPool
 * @property {string} id
 * @property {string} name 
*/
/**
 * @typedef {Object} WTSimpleListResult
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oSimpleListElem[]} result – массив
*/
/**
 * @function GetCareerReserveStatuses
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка статусов этапов развития карьеры.
 * @returns {WTSimpleListResult}
*/
function GetCareerReserveStatuses()
{
	var oRet = {
		error: 0,
		errorText: "",
		result: get_statuses_career_reserve()
	};
		
	return oRet;
}

/**
 * @function GetPersonnelReserveStatuses
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка статусов кадровых резервов.
 * @returns {WTSimpleListResult}
*/
function GetPersonnelReserveStatuses()
{
	var oRet = {
		error: 0,
		errorText: "",
		result: get_statuses_personnel_reserve()
	};
		
	return oRet;
}

/**
 * @typedef {Object} WTReserveTaskResult
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oReserveTask[]} result – результат
*/
/**
 * @function GetCareerReserveTasksByID
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка задач программы развития в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @param {oAccess} oAccessParam - Объект со сведениями для вычислкения доступа
 * @returns {WTReserveTaskResult}
*/
function GetCareerReserveTasksByID(iCareerReserveIDParam, oCollectionParams, oAccessParam)
{
	var oRet = tools.get_code_library_result_object();
	oRet.result = [];
	oRet.data = {};
	oRet.paging = oCollectionParams.paging;
	try
	{
		try
		{
			var docCareerReserve = open_object(iCareerReserveIDParam, "career_reserve", oAccessParam);
			teCareerReserve = docCareerReserve.TopElem;
		}
		catch(err)
		{
			throw (StrBegins(err, "{") ? "" : StrReplace("Не удалось открыть этап развития карьеры с ID [{PARAM1}]:\r\n", "{PARAM1}", iCareerReserveIDParam)) + err;
		}
		var arrTask = get_tasks_career_reserve(teCareerReserve, oCollectionParams.filters);
	}
	catch(err)
	{
		var parseErr = parse_error(err, oAccessParam);
		oRet.error = parseErr.code;
		oRet.errorText = StrReplace(StrReplace("Ошибка при получении списка задач этапа развития карьеры iCareerReserveIDParam:[{PARAM1}], FILTERS: {PARAM2}\r\n", "{PARAM1}", iCareerReserveIDParam), "{PARAM2}", EncodeJson(oCollectionParams.filters)) + parseErr.message
		return oRet;	
	}
	
	// Отбор для наставников по задачам
	var iTaskTutorBossTypeID = ArrayOptFirstElem(tools.xquery("for $elem in boss_types where $elem/code = 'talent_pool_task_tutor' return $elem"), {id: null}).id.Value;
	var iUserID = OptInt(CurRequest.Session.Env.GetOptProperty( "curUserID" ));

	if( ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iUserID && This.boss_type_id.Value == iTaskTutorBossTypeID" ) != undefined )
	{
		arrTask = ArraySelect( arrTask, "This.tutor_id == iUserID" );
	}	
	
	if(ArrayOptFirstElem(oCollectionParams.distincts) != undefined)
	{
		oRet.data.SetProperty("distincts", {});
		var xarrStages, xarrTypes, xarrStatuses;
		for(sFieldName in oCollectionParams.distincts)
		{
			oRet.data.distincts.SetProperty(sFieldName, []);
			switch(sFieldName)
			{
				case "stage_id":
				{
					xarrStages = ArraySort(get_stages(teCareerReserve.tasks), "This.start_date.Value", "+")

					for(fldStage in xarrStages )
					{
						oRet.data.distincts.stage_id.push({name:fldStage.name.Value, value: fldStage.id.Value});
					}
					break;
				}
				case "status_id":
				{
					xarrStatuses = ArrayIntersect(common.career_reserve_status_types, teCareerReserve.tasks, "This.id.Value", "This.status.Value");

					oRet.data.distincts.status_id.push({name:"Просрочен", value: "overdue"});
					for(fldStatus in xarrStatuses )
					{
						oRet.data.distincts.status_id.push({name:fldStatus.name.Value, value: fldStatus.id.Value});
					}
					break;
				}
				case "type_id":
				{
					xarrTypes = ArrayIntersect(ArraySelect(common.career_reserve_tasks_types, "This.id.Value != 'stage'"), teCareerReserve.tasks, "This.id.Value", "This.type.Value");

					for(fldType in xarrTypes )
					{
						oRet.data.distincts.type_id.push({name:fldType.name.Value, value: fldType.id.Value});
					}
					break;
				}
			}
		}
	}
	
	for(itemTask in arrTask)
	{
		try
		{
			oRet.result.push(cast_oReserveTask(itemTask, null, teCareerReserve));
		}
		catch(err)
		{
			throw StrReplace(StrReplace("Ошибка при конвертации задачи \"{PARAM1}\" [{PARAM2}]:\r\n","{PARAM1}", itemTask.name),"{PARAM2}", itemTask.id)  + err;
		}
	}
	return oRet;
}

/**
 * @function GetCareerReserveTasksByPerson
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка задач программы развития в этапе развития карьеры по ID сотрудника.
 * @param {string} sCareerReserveType - тип кадрового резерва
 * @param {bigint} iPersonID - ID сотрудника
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {WTReserveTaskResult}
*/
function GetCareerReserveTasksByPerson(sCareerReserveType, iPersonID, oCollectionParams)
{
	var oRet = tools.get_code_library_result_object();
	oRet.result = [];
	oRet.data = {};
	oRet.paging = oCollectionParams.paging;
	try
	{
		var iCareerReserveID = get_career_reserve_id_by_person(iPersonID, sCareerReserveType);
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = StrReplace("Ошибка при получении ID этапа развития карьеры по ID сотрудника:[{PARAM1}]\r\n", "{PARAM1}", iPersonID) + err
		return oRet;	
	}

	try
	{
		try
		{
			var docCareerReserve = open_object(iCareerReserveID, "career_reserve");
			teCareerReserve = docCareerReserve.TopElem;
		}
		catch(err)
		{
			throw StrReplace("Не удалось открыть этап развития карьеры с ID [{PARAM1}]:\r\n", "{PARAM1}", iCareerReserveID) + err;
		}

		var arrTask = get_tasks_career_reserve(teCareerReserve, oCollectionParams.filters);
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText =  StrReplace(StrReplace("Ошибка при получении списка задач этапа развития карьеры iCareerReserveIDParam:[{PARAM1}], FILTERS: {PARAM2}\r\n", "{PARAM1}", iCareerReserveIDParam), "{PARAM2}", EncodeJson(oCollectionParams.filters)) + parseErr.message
		return oRet;	
	}
	
	// Отбор для наставников по задачам
	var iTaskTutorBossTypeID = ArrayOptFirstElem(tools.xquery("for $elem in boss_types where $elem/code = 'talent_pool_task_tutor' return $elem"), {id: null}).id.Value;
	try
	{
		var iUserID = OptInt(CurRequest.Session.Env.GetOptProperty( "curUserID" ));
	}
	catch(e)
	{
		iUserID = OptInt(oCollectionParams.GetOptProperty( "curUserID" ))
	}
	
	if( ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iUserID && This.boss_type_id.Value == iTaskTutorBossTypeID" ) != undefined )
	{
		arrTask = ArraySelect( arrTask, "This.tutor_id == iUserID" );
	}
	
	if(ArrayOptFirstElem(oCollectionParams.distincts) != undefined)
	{
		oRet.data.SetProperty("distincts", {});
		var xarrStages, xarrTypes, xarrStatuses;
		for(sFieldName in oCollectionParams.distincts)
		{
			oRet.data.distincts.SetProperty(sFieldName, []);
			switch(sFieldName)
			{
				case "stage_id":
				{
					xarrStages = ArraySort(get_stages(teCareerReserve.tasks), "This.start_date.Value", "+")

					for(fldStage in xarrStages )
					{
						oRet.data.distincts.stage_id.push({name:fldStage.name.Value, value: fldStage.id.Value})
					}
					break;
				}
				case "status_id":
				{
					xarrStatuses = ArrayIntersect(common.career_reserve_status_types, teCareerReserve.tasks, "This.id.Value", "This.status.Value");

					oRet.data.distincts.status_id.push({name:"Просрочен", value: "overdue"});
					for(fldStatus in xarrStatuses )
					{
						oRet.data.distincts.status_id.push({name:fldStatus.name.Value, value: fldStatus.id.Value})
					}
					break;
				}
				case "type_id":
				{
					xarrTypes = ArrayIntersect(ArraySelect(common.career_reserve_tasks_types, "This.id.Value != 'stage'"), teCareerReserve.tasks, "This.id.Value", "This.type.Value");

					for(fldType in xarrTypes )
					{
						oRet.data.distincts.type_id.push({name:fldType.name.Value, value: fldType.id.Value})
					}
					break;
				}
			}
		}
	}
	
	for(itemTask in arrTask)
	{
		oRet.result.push(cast_oReserveTask(itemTask, null, teCareerReserve));
	}
	
	return oRet;
}

/**
 * @function GetCareerReserveStageByID
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка этапов программы развития в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @param {oAccess} oAccessParam - Объект со сведениями для вычислкения доступа
 * @returns {WTReserveTaskResult}
*/
function GetCareerReserveStageByID(iCareerReserveIDParam, oCollectionParams, oAccessParam)
{
	var oRet = tools.get_code_library_result_object();
	oRet.result = [];
	oRet.data = {};
	oRet.paging = oCollectionParams.paging;
	try
	{
		try
		{
			var docCareerReserve = open_object(iCareerReserveIDParam, "career_reserve", oAccessParam);
			teCareerReserve = docCareerReserve.TopElem;
		}
		catch(err)
		{
			throw (StrBegins(err, "{") ? "" : StrReplace("Не удалось открыть этап развития карьеры с ID [{PARAM1}]:\r\n", "{PARAM1}", iCareerReserveIDParam)) + err;
		}
		
		var arrAllTasks = get_all_tasks_career_reserve(teCareerReserve);
	}
	catch(err)
	{
		var parseErr = parse_error(err, oAccessParam)
		oRet.error = parseErr.code;
		oRet.errorText = StrReplace("Ошибка при получении списка этапов программы развития iCareerReserveIDParam:[{PARAM1}]\r\n", "{PARAM1}", iCareerReserveIDParam) + parseErr.message
		return oRet;	
	}
	
	
	var arrStages = get_filtered_tasks(get_stages(arrAllTasks), oCollectionParams.filters);
	if(ArrayOptFirstElem(oCollectionParams.distincts) != undefined)
	{
		oRet.data.SetProperty("distincts", {});
		var xarrStages, xarrTypes, xarrStatuses;
		for(sFieldName in oCollectionParams.distincts)
		{
			oRet.data.distincts.SetProperty(sFieldName, []);
			switch(sFieldName)
			{
				case "stage_id":
				{
					xarrStages = ArraySort(get_stages(teCareerReserve.tasks), "This.start_date.Value", "+")

					for(fldStage in xarrStages )
					{
						oRet.data.distincts.stage_id.push({name:fldStage.name.Value, value: fldStage.id.Value});
					}
					break;
				}
				case "status_id":
				{
					xarrStatuses = ArrayIntersect(common.career_reserve_status_types, get_stages(teCareerReserve.tasks), "This.id.Value", "This.status.Value");

					oRet.data.distincts.status_id.push({name:"Просрочен", value: "overdue"});
					for(fldStatus in xarrStatuses )
					{
						oRet.data.distincts.status_id.push({name:fldStatus.name.Value, value: fldStatus.id.Value});
					}
					break;
				}
			}
		}
	}
	
	for(itemTask in arrStages)
	{
		oRet.result.push(cast_oReserveTask(itemTask, null, teCareerReserve));
	}
	
	return oRet;
}

/**
 * @function GetCareerReserveStageByPerson
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка этапов программы развития в этапе развития карьеры по ID сотрудника.
 * @param {string} sCareerReserveType - тип кадрового резерва
 * @param {bigint} iPersonID - ID сотрудника
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {WTReserveTaskResult}
*/
function GetCareerReserveStageByPerson(sCareerReserveType, iPersonID, oCollectionParams)
{
	var oRet = tools.get_code_library_result_object();
	oRet.result = [];
	oRet.data = {};
	oRet.paging = oCollectionParams.paging;
	
	try
	{
		var iCareerReserveID = get_career_reserve_id_by_person(iPersonID, sCareerReserveType);
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = StrReplace( "Ошибка при получении ID этапа развития карьеры по ID сотрудника:[{PARAM1}]\r\n", "{PARAM1}", iPersonID) + err
		return oRet;	
	}
	
	try
	{
		try
		{
			var docCareerReserve = open_object(iCareerReserveID, "career_reserve");
			teCareerReserve = docCareerReserve.TopElem;
		}
		catch(err)
		{
			throw StrReplace("Не удалось открыть этап развития карьеры с ID [{PARAM1}]:\r\n", "{PARAM1}", iCareerReserveID) + err;
		}

		var arrAllTasks = get_all_tasks_career_reserve(teCareerReserve);
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = StrReplace("Ошибка при получении списка этапов программы развития iCareerReserveID:[{PARAM1}]\r\n", "{PARAM1}", iCareerReserveID) + err
		return oRet;	
	}
	
	var arrStages = get_filtered_tasks(get_stages(arrAllTasks), oCollectionParams.filters);
	
	if(ArrayOptFirstElem(oCollectionParams.distincts) != undefined)
	{
		oRet.data.SetProperty("distincts", {});
		var xarrStages, xarrTypes, xarrStatuses;
		for(sFieldName in oCollectionParams.distincts)
		{
			oRet.data.distincts.SetProperty(sFieldName, []);
			switch(sFieldName)
			{
				case "stage_id":
				{
					xarrStages = ArraySort(get_stages(teCareerReserve.tasks), "This.start_date.Value", "+")

					for(fldStage in xarrStages )
					{
						oRet.data.distincts.stage_id.push({name:fldStage.name.Value, value: fldStage.id.Value});
					}
					break;
				}
				case "status_id":
				{
					xarrStatuses = ArrayIntersect(common.career_reserve_status_types, get_stages(teCareerReserve.tasks), "This.id.Value", "This.status.Value");

					oRet.data.distincts.status_id.push({name:"Просрочен", value: "overdue"});
					for(fldStatus in xarrStatuses )
					{
						oRet.data.distincts.status_id.push({name:fldStatus.name.Value, value: fldStatus.id.Value});
					}
					break;
				}
			}
		}
	}
	
	for(itemTask in arrStages)
	{
		oRet.result.push(cast_oReserveTask(itemTask, null, teCareerReserve));
	}
	
	return oRet;
}

/**
 * @function GetCareerReserveHierStageTaskByID
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение иерархического списка этапов и задач программы развития в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @param {oAccess} oAccessParam - Объект со сведениями для вычислкения доступа
 * @returns {WTReserveTaskResult}
*/
function GetCareerReserveHierStageTaskByID(iCareerReserveIDParam, oCollectionParams, oAccessParam)
{
	var oRet = tools.get_code_library_result_object();
	oRet.result = [];
	oRet.data = {};
	oRet.paging = oCollectionParams.paging;

	function fnRecursion(node, array)
	{
		array.push(cast_oReserveTask(node, null, teCareerReserve));
		
		for(itemNodes in ArraySelect(arrAllTasks, "This.parent_task_id.Value == node.id"))
		{
			if(itemNodes.type != 'stage')
				array.push(cast_oReserveTask(itemNodes, null, teCareerReserve));
			else
				fnRecursion(itemNodes, array);
		}
	}
	
	try
	{
		try
		{
			var docCareerReserve = open_object(iCareerReserveIDParam, "career_reserve", oAccessParam);
			teCareerReserve = docCareerReserve.TopElem;
		}
		catch(err)
		{
			throw (StrBegins(err, "{") ? "" : StrReplace("Не удалось открыть этап развития карьеры с ID [{PARAM1}]:\r\n", "{PARAM1}", iCareerReserveIDParam)) + err;
		}

		var arrAllTasks = get_all_tasks_career_reserve(teCareerReserve);
	}
	catch(err)
	{
		var parseErr = parse_error(err, oAccessParam)
		oRet.error = parseErr.code;
		oRet.errorText = StrReplace("Ошибка при получении списка этапов программы развития iCareerReserveIDParam:[{PARAM1}]\r\n", "{PARAM1}", iCareerReserveIDParam) + parseErr.message;
		return oRet;
	}

	if(ArrayOptFirstElem(oCollectionParams.distincts) != undefined)
	{
		oRet.data.SetProperty("distincts", {});
		var xarrStages, xarrTypes, xarrStatuses;
		for(sFieldName in oCollectionParams.distincts)
		{
			oRet.data.distincts.SetProperty(sFieldName, []);
			switch(sFieldName)
			{
				case "stage_id":
				{
					xarrStages = ArraySort(get_stages(arrAllTasks), "This.start_date.Value", "+")

					for(fldStage in xarrStages )
					{
						oRet.data.distincts.stage_id.push({name:fldStage.name.Value, value: fldStage.id.Value});
					}
					break;
				}
				case "status_id":
				{
					xarrStatuses = ArrayIntersect(common.career_reserve_status_types, arrAllTasks, "This.id.Value", "This.status.Value");

					oRet.data.distincts.status_id.push({name:"Просрочен", value: "overdue"});
					for(fldStatus in xarrStatuses )
					{
						oRet.data.distincts.status_id.push({name:fldStatus.name.Value, value: fldStatus.id.Value});
					}
					break;
				}
				case "type_id":
				{
					xarrTypes = ArrayIntersect(common.career_reserve_tasks_types, arrAllTasks, "This.id.Value", "This.type.Value");

					for(fldType in xarrTypes )
					{
						oRet.data.distincts.type_id.push({name:fldType.name.Value, value: fldType.id.Value});
					}
					break;
				}
			}
		}
	}
	
	// Отбор для наставников по задачам
	var iTaskTutorBossTypeID = ArrayOptFirstElem(tools.xquery("for $elem in boss_types where $elem/code = 'talent_pool_task_tutor' return $elem"), {id: null}).id.Value;
	var iUserID = OptInt(CurRequest.Session.Env.GetOptProperty( "curUserID" ));

	if( ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iUserID && This.boss_type_id.Value == iTaskTutorBossTypeID" ) != undefined )
	{
		arrAllTasks = ArraySelect( arrAllTasks, "This.type == 'stage' || This.tutor_id == iUserID" );
		arrAllTasks = ArraySelect( arrAllTasks, "This.type != 'stage' || ArrayOptFind(arrAllTasks, 'This.parent_task_id.Value == ' + CodeLiteral(This.id.Value) ) != undefined" );
	}
	
	
	var arrFullTask = get_filtered_tasks(arrAllTasks, oCollectionParams.filters, true);
	
	for(itemStage in arrFullTask)
	{
		if(itemStage.type == 'stage')
		{
			fnRecursion(itemStage, oRet.result);
		}
		else if(!itemStage.parent_task_id.HasValue)
		{
			oRet.result.push(cast_oReserveTask(itemStage, null, teCareerReserve));
		}
	}
	return oRet;
}

/**
 * @function GetTalentPoolTasksByPerson
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка задач для сотрудника.
 * @param {bigint} iPersonIDParam - ID сотрудника по которому осуществляется выборка этапов развития карьеры
 * @param {string} sPersonType - тип выборки по сотруднику (person - сотруднику, чей этап, tutor - этапы, где указанный сотрудник является наставником, curator - куратор кадровых резервов, boss - этапы подчиненных)
 * @param {string} sSelectType - тип выборки (all - любые, active - актуальные, tutor_heed - требующие внимания наставника, к примеру оценки, expire - просроченные)
 * @param {boolean} bIsAdaptation - выборка адаптаций (перекрывает bShowPersonnelReserveTasks)
 * @param {boolean} bShowPersonnelReserveTasks - выборка также и испытаний в Кадровых резервах 
 * @param {oAccess} oAccessParam - Объект со сведениями для вычисления доступа
 * @returns {WTReserveTaskResult}
*/
function GetTalentPoolTasksByPerson(iPersonIDParam, sPersonType, sSelectType, bIsAdaptation, bShowPersonnelReserveTasks, oAccessParam)
{
	var oRet = {
		error: 0,
		result: [],
		errorText: ""
	};
	iPersonID = OptInt(iPersonIDParam);
	
	if(iPersonID == undefined)
	{
		oRet.error = 1;
		oRet.errorText = StrReplace("Передан некорректный ID [{PARAM1}]", "{PARAM1}", iPersonIDParam);
		return oRet;
	}
	docPerson = tools.open_doc(iPersonID);
	switch(docPerson.TopElem.Name)
	{
		case "collaborator":
		{
			break;
		}
		case "career_reserve":
		case "personnel_reserve":
		{
			iPersonID = OptInt(docPerson.TopElem.person_id.Value);
			if(iPersonID == undefined)
			{
				oRet.error = 1;
				oRet.errorText = "Некорректный ID сотрудника";
				return oRet;
			}
			docPerson = tools.open_doc(iPersonID);
			break;
		}
		default:
		{
			oRet.error = 1;
			oRet.errorText = StrReplace("Переданный ID [{PARAM1}] не являетя ID Сотрудника, Кадрового резерва или Этапа развития карьеры", "{PARAM1}", iPersonIDParam);
			return oRet;
		}
	}
	
	if ( ! tools_web.check_collection_access( oAccessParam.user_id, iPersonID, oAccessParam.access_type ) )
	{
		oRet.error = 403;
		oRet.errorText = tools_web.get_web_const( 'nedostatochnopr', oAccessParam.cur_lng );
		return oRet;
	}
	
	var bAdminAccess = (docPerson.TopElem.access.access_role == "admin");
	var arrTasks = get_all_tasks_talent_pool_by_person(iPersonID, sPersonType, bIsAdaptation, bShowPersonnelReserveTasks, bAdminAccess, "date,status");
	var oRetObj, iExpireTaskCount;
	for(fldTask in arrTasks)
	{
		if(sSelectType == "all")
		{
			oRetObj = cast_oReserveTask(fldTask.task, iPersonID, fldTask.object);
			oRetObj.activity_link = fldTask.activity.url;
			oRetObj.link_msg = fldTask.activity.msg;
			oRet.result.push(oRetObj)
		}
		else if(sSelectType == "active" && fldTask.activity.is_active)
		{
			oRetObj = cast_oReserveTask(fldTask.task, iPersonID, fldTask.object);
			oRetObj.activity_link = fldTask.activity.url;
			oRetObj.link_msg = fldTask.activity.msg;
			oRet.result.push(oRetObj)
		}
		else if(sSelectType == "tutor_heed" && fldTask.activity.is_tutor_heed)
		{
			oRetObj = cast_oReserveTask(fldTask.task, iPersonID, fldTask.object);
			oRetObj.activity_link = fldTask.activity.url;
			oRetObj.link_msg = fldTask.activity.msg;
			oRet.result.push(oRetObj)
		}
		else if(sSelectType == "expire" && fldTask.activity.is_expire)
		{
			oRetObj = cast_oReserveTask(fldTask.task, iPersonID, fldTask.object);
			oRetObj.activity_link = fldTask.activity.url;
			oRetObj.link_msg = fldTask.activity.msg;
			oRet.result.push(oRetObj)
		}
	}
	 
	return oRet;
}

/**
 * @function GetCareerReserveActualActivityByID
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение актуальных на текущий день активностей в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {string} arrActivityTypes - коллекция типов активности (каталоги)
 * @param {string} sActualizeMode - "date,status" способ актуализации активности "date" - по интервалу дат в задаче, "status" - по статусу задачи + наличию назначенной активности
 * @param {boolean} bCheckActualStageParam - true - среди задач текущего этапа
 * @param {oAccess} oAccessParam - Объект со сведениями для вычисления доступа
 * @returns {WTReserveTaskResult}
*/
function GetCareerReserveActualActivityByID(iCareerReserveIDParam, arrActivityTypes, sActualizeMode, bCheckActualStageParam, oAccessParam)
{
	var bCheckActualStage = tools_web.is_true(bCheckActualStageParam);
	
	try
	{
		docCareerReserve = open_object(iCareerReserveIDParam, "career_reserve", oAccessParam);
	}
	catch(err)
	{
		var parseErr = parse_error(err, oAccessParam)
		return {
				error: parseErr.code, 
				result: [], 
				errorText: StrReplace("Не удалось открыть этап развития карьеры с ID [{PARAM1}]:\r\n", "{PARAM1}", iCareerReserveIDParam) + parseErr.message
			};
	}
		
	var teCareerReserve = docCareerReserve.TopElem;
	var arrAllTasks = teCareerReserve.tasks;
	var iPersonID = teCareerReserve.person_id.Value;
	
	var sStageID = null;
	if(bCheckActualStage)
	{
		var xAtualStage = get_actual_stage(get_root_stages(arrAllTasks));
		if(xAtualStage != null) sStageID = xAtualStage.id.Value;
	}
	var arrTasksOnly = 	get_task_wo_stages(arrAllTasks);
	var arrNoCancelTasks = get_task_wo_cancel(arrTasksOnly);
	var arrFilter = [{id: "stage_id", name: "stage_id", type: "select", value: sStageID}];
	var srrTaskInStage = get_filtered_tasks(arrNoCancelTasks, arrFilter)
	//var srrTaskInStage = get_filtered_tasks(arrNoCancelTasks, null, sStageID)
	var arrActualTasks = get_actual_activity(srrTaskInStage, iPersonID, sActualizeMode);
	if(arrActivityTypes == "" || arrActivityTypes == null || arrActivityTypes == undefined || !IsArray(arrActivityTypes) || ArrayOptFirstElem(arrActivityTypes) == undefined)
	{
		var arrResultActualTasks = arrActualTasks;
	}
	else
	{
		var sSelectFilter, arrResultActualTasks = [];
		for(sActivityType in arrActivityTypes)
		{
			sSelectFilter = (sActivityType == "task") ? "This.type == 'task'" : "This.type != 'task' && (This.type == sActivityType || This.activity_type == sActivityType)";
			arrResultActualTasks = ArrayUnion(arrResultActualTasks, ArraySelect(arrActualTasks, sSelectFilter));	
		}
		arrResultActualTasks = ArraySelectDistinct(arrResultActualTasks, "This.id");
	}
	
	return { error: 0, result: arrResultActualTasks, errorText: "" };
}

/**
 * @function GetCareerReserveExpireTasks
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Незавершенные задачи.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {boolean} bCheckActualStage - true - среди задач текущего этапа
 * @param {oAccess} oAccessParam - Объект со сведениями для вычислкения доступа
 * @returns {WTReserveTaskResult}
*/
function GetCareerReserveExpireTasks(iCareerReserveIDParam, bCheckActualStageParam, oAccessParam)
{
	var bCheckActualStage = tools_web.is_true(bCheckActualStageParam);
	
	try
	{
		docCareerReserve = open_object(iCareerReserveIDParam, "career_reserve", oAccessParam);
	}
	catch(err)
	{
		var parseErr = parse_error(err, oAccessParam)
		return {
				error: parseErr.code, 
				result: [], 
				errorText: StrReplace("Не удалось открыть этап развития карьеры с ID [{PARAM1}]:\r\n", "{PARAM1}", iCareerReserveIDParam) + parseErr.message
			};
	}
		
	var teCareerReserve = docCareerReserve.TopElem;
	var arrAllTasks = teCareerReserve.tasks;
	
	var sStateID = null;
	if(bCheckActualStage)
	{
		var xAtualStage = get_actual_stage(get_root_stages(arrAllTasks));
		if(xAtualStage != null) sStateID = xAtualStage.id.Value;
	}
	var arrTasksOnly = 	get_task_wo_stages(arrAllTasks);
	var arrNoCancelTasks = get_task_wo_cancel(arrTasksOnly);
	var arrExpiredTasks = get_expired_task(arrNoCancelTasks, sStateID);

	var oRet = {
		error: 0,
		result: [],
		errorText: ""
	};
	
	var oConvertObject;
	for(itemTask in arrExpiredTasks)
	{
		try
		{
			oConvertObject = cast_oReserveTask(itemTask, null, teCareerReserve);
			oConvertObject.message = "Следовало завершить до " + oConvertObject.plan_date;
			oRet.result.push(oConvertObject);
		}
		catch(err)
		{
			throw StrReplace(StrReplace("Ошибка при конвертации задачи \"{PARAM1}\" [{PARAM2}]:\r\n","{PARAM1}", itemTask.name),"{PARAM2}", itemTask.id) + err;
		}
	}
	
	return oRet;
}
/**
 * @typedef {Object} WTTalentPoolPersonsResult
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oCollaborator[]} result – массив
*/
/**
 * @function GetCareerReserveTutorsByID
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка наставников в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {string} sTutorType - Тип наставника
 * @param {oAccess} oAccessParam - Объект со сведениями для вычислкения доступа
 * @returns {WTTalentPoolPersonsResult}
*/
function GetCareerReserveTutorsByID(iCareerReserveIDParam, sTutorType, oAccessParam)
{
	var oRet = {
		error: 0,
		result: [],
		errorText: ""
	};	
	try
	{
		var arrTutors = get_tutors_career_reserve(iCareerReserveIDParam, null, sTutorType, oAccessParam);
	}
	catch(err)
	{
		var parseErr = parse_error(err, oAccessParam)
		return {
				error: parseErr.code, 
				result: [], 
				errorText: StrReplace("Ошибка при получении списка наставников iCareerReserveIDParam:[{PARAM1}]\r\n", "{PARAM1}", iCareerReserveIDParam) +  parseErr.message
			};
	}
	

	
	for(itemTutor in arrTutors)
	{
		oRet.result.push(cast_oCollaborator(itemTutor));
	}

	return oRet;
}

/**
 * @function GetBossesByPerson
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка непосредственных руководителей сотрудника.
 * @param {bigint} iObjectIDParam - ID объекта, для которого считается коллекция
 * @param {oAccess} oAccessParam - Объект со сведениями для вычисления доступа
 * @returns {WTTalentPoolPersonsResult}
*/
function GetBossesByPerson(iObjectIDParam, oAccessParam)
{
	var iObjectID = OptInt(iObjectIDParam);
	
	if(iObjectID == undefined)
	{
		return {
				error: 1, 
				result: [], 
				errorText: StrReplace("Ошибка при получении ID объекта. iObjectIDParam не является целым числом:[{PARAM1}]", "{PARAM1}", iObjectIDParam)
			};
	}
	
	var docObject = tools.open_doc(iObjectID);
	
	if(docObject == undefined )
	{
		return {
				error: 1, 
				result: [], 
				errorText: StrReplace("Невозможно открыть объект с ID: [{PARAM1}]", "{PARAM1}", iObjectID)
			};
	}

	var teCurObject = docObject.TopElem;
	switch(teCurObject.Name)
	{
		case "collaborator":
		{
			var iPersonID = iObjectID;
			break;
		}
		case "personnel_reserve":
		case "career_reserve":
		{
			var iPersonID = OptInt(teCurObject.person_id.Value, 0);
			break;
		}
	}
	var oRet = {
		error: 0,
		result: [],
		errorText: ""
	};
	
	if ( ! tools_web.check_collection_access( oAccessParam.user_id, iPersonID, oAccessParam.access_type ) )
	{
		oRet.error = 403;
		oRet.errorText = tools_web.get_web_const( 'nedostatochnopr', oAccessParam.cur_lng );
		return oRet;
	}
	
	var arrBosses = tools.get_uni_user_bosses( iPersonID, { return_object_type: 'collaborator', return_object_value: null } ); 
	

	for(itemBoss in arrBosses)
	{
		oRet.result.push(cast_oCollaborator(itemBoss));
	}

	return oRet;
}

/**
 * @function GetTalentPoolPersonWithSelectedTasks
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка сотрудников с задачами разного типа.
 * @param {bigint} iPersonIDParam - ID сотрудника по которому осуществляется выборка этапов развития карьеры
 * @param {string} sPersonType - тип выборки (person - по сотруднику, чей этап, tutor - этапы, где указанный сотрудник является наставником, curator - куратор кадровых резервов, boss - этапы подчиненных)
 * @param {string} sSelectType - тип выборки (all - любые, active - актуальные, tutor_heed - требующие внимания наставника, к примеру оценки, expire - просроченные)
 * @param {boolean} bIsAdaptation - выборка адаптаций (перекрывает bShowPersonnelReserveTasks)
 * @param {boolean} bShowPersonnelReserveTasks - выборка также и испытаний в Кадровых резервах 
 * @returns {WTTalentPoolPersonsResult}
*/

function GetTalentPoolPersonWithSelectedTasks(iPersonIDParam, sPersonType, sSelectType, bIsAdaptation, bShowPersonnelReserveTasks)
{
	var oRet = {
		error: 0,
		result: [],
		errorText: ""
	};
	iPersonID = OptInt(iPersonIDParam);
	
	if(sSelectType == "" || sSelectType == null || sSelectType == undefined)
		sSelectType = "all";
	
	if(iPersonID == undefined)
	{
		oRet.error = 1;
		oRet.errorText = StrReplace("Передан некорректный ID [{PARAM1}]", "{PARAM1}", iPersonIDParam);
		return oRet;
	}
	docPerson = tools.open_doc(iPersonID);
	if(docPerson.TopElem.Name != "collaborator")
	{
		oRet.error = 1;
		oRet.errorText = StrReplace("Переданный ID [{PARAM1}] не являетя ID Сотрудника", "{PARAM1}", iPersonIDParam);
		return oRet;
	}
	var bAdminAccess = (docPerson.TopElem.access.access_role == "admin");
	
	var arrAllTasks = get_all_tasks_talent_pool_by_person(iPersonID, sPersonType, bIsAdaptation, bShowPersonnelReserveTasks, bAdminAccess, "date,status");
	switch(sSelectType)
	{
		case "all":
		{
			var arrTasks = arrAllTasks;
			var sMessageTemplate = "Всего задач: {PARAM1}"
			break;
		}
		case "active":
		{
			var arrTasks = ArraySelect(arrAllTasks, "This.activity.is_active");
			var sMessageTemplate = "Текущих задач: {PARAM1}"
			break;
		}
		case "tutor_heed":
		{
			var arrTasks = ArraySelect(arrAllTasks, "This.activity.is_tutor_heed");
			var sMessageTemplate = "Задач для обработки: {PARAM1}"
			break;
		}
		case "expire":
		{
			var arrTasks = ArraySelect(arrAllTasks, "This.activity.expire");
			var sMessageTemplate = "Просрочено задач: {PARAM1}"
			break;
		}
	}
	var iCurPersonID, docCurPerson, teCurPerson;
	var iSelectTaskCount;
	for(fldTask in ArraySelectDistinct(arrTasks, "This.object.person_id.Value"))
	{
		iCurPersonID = fldTask.object.person_id.Value;
		docCurPerson = tools.open_doc(OptInt(iCurPersonID));
		if(docCurPerson == undefined)
		{
			oRet.error = 1;
			oRet.errorText += StrReplace(StrReplace("Ошибка при открытии карточки сотрудника с ID [{PARAM1}] (ID объекта [{PARAM2}])","{PARAM1}", iCurPersonID),"{PARAM2}", fldTask.object.id.Value) + "\r\n";
			continue;
		}

		teCurPerson = docCurPerson.TopElem;
		oRetObj = cast_oCollaborator(teCurPerson);
		oRetObj.form_url = tools_web.get_mode_clean_url(null, fldTask.object.id.Value);
		
		iSelectTaskCount = ArrayCount(ArraySelect(arrTasks, "This.object.person_id.Value == iCurPersonID"));
		oRetObj.message = iSelectTaskCount == 0 ? "" : StrReplace(sMessageTemplate, "{PARAM1}", iSelectTaskCount);
		oRet.result.push(oRetObj)
		
	}
	return oRet;
}

/**
 * @typedef {Object} WTTalentPoolResult
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oTailentPool[]} result – результат
*/
/**
 * @typedef {Object} FilterElem
 * @memberof Websoft.WT.TalentPool
 * @property {string} field – наименование поля, по которому выполняется отбор
 * @property {string} values – строка с значениями поля. Может быть перечисление через ";" или "," или JSON-строка с массивом
*/
/**
 * @function GetTalentPoolPersonelReservesByPerson
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка кадровых резервов по сотруднику.
 * @param {bigint} iPersonIDParam - ID сотрудника по которому осуществляется выборка этапов развития карьеры
 * @param {string} sPersonType - тип выборки по сотруднику (person - сотруднику, чей этап, tutor - этапы, где указанный сотрудник является наставником, curator - куратор кадровых резервов, boss - этапы подчиненных)
 * @param {string} sTypeCollaborator - Выбор, по кому осуществлять выборку ( subordinates/main_subordinates/func_subordinates/all_subordinates )
 * @param {int[]} arrBossTypesID - массив ID типов руководителя.
 * @param {string[]} arrDistinct - перечень полей для формирования дополнительных списков для виджета фильтров
 * @param {oSimpleFilterElem[]} arrFilters - набор фильтров
 * @param {oSort} oSort - Информация из рантайма о сортировке
 * @param {oPaging} oPaging - Информация из рантайма о пейджинге
 * @returns {WTTalentPoolResult}
*/
function GetTalentPoolPersonelReservesByPerson(iPersonIDParam, sPersonType, sTypeSubordinate, arrBossTypesID, arrDistinct, arrFilters, oSort, oPaging)
{
	var oRet = {
		error: 0,
		result: [],
		errorText: "",
		data: {},
		paging: oPaging
	};
		
	iPersonID = OptInt(iPersonIDParam);
	
	if(iPersonID == undefined)
	{
		oRet.error = 1;
		oRet.errorText = StrReplace("Передан некорректный ID [{PARAM1}]", "{PARAM1}", iPersonIDParam);
		return oRet;
	}
	docPerson = tools.open_doc(iPersonID);
	if(docPerson.TopElem.Name != "collaborator")
	{
		oRet.error = 1;
		oRet.errorText = StrReplace("Переданный ID [{PARAM1}] не являетя ID Сотрудника", "{PARAM1}", iPersonIDParam);
		return oRet;
	}
	var arrCurPersonnelReserves = get_personnel_reserve_collection_by_person(iPersonID, sPersonType, arrFilters, oSort, sTypeSubordinate, arrBossTypesID);
	
	if(ArrayOptFirstElem(arrDistinct) != undefined)
	{
		oRet.data.SetProperty("distincts", {});
		var xarrPositions, xarrSubdivision, xarrStatuses;
		for(sFieldName in arrDistinct)
		{
			oRet.data.distincts.SetProperty(sFieldName, []);
			switch(sFieldName)
			{
				case "subdivision_id":
				{
					xarrPositions = tools.xquery("for $elem_qc in positions where MatchSome($elem_qc/basic_collaborator_id, (" + ArrayMerge(arrCurPersonnelReserves, "This.person_id.Value", ",") + ")) return $elem_qc");
					xarrSubdivision = tools.xquery("for $elem_qc in subdivisions where MatchSome($elem_qc/id, (" + ArrayMerge(xarrPositions, "This.parent_object_id.Value", ",") + ")) return $elem_qc");

					for(fldSubdiv in xarrSubdivision )
					{
						oRet.data.distincts.subdivision_id.push({name:fldSubdiv.name.Value, value: fldSubdiv.id.Value})
					}
					break;
				}
				case "status_id":
				{
					xarrStatuses = ArrayIntersect(common.personnel_reserve_status_types, arrCurPersonnelReserves, "This.id.Value", "This.status.Value");

					for(fldStatus in xarrStatuses )
					{
						oRet.data.distincts.status_id.push({name:fldStatus.name.Value, value: fldStatus.id.Value})
					}
					break;
				}
			}
		}
	}
	
	if(ObjectType(oPaging) == 'JsObject' && oPaging.SIZE != null)
	{
		oPaging.MANUAL = true;
		oPaging.TOTAL = ArrayCount(arrCurPersonnelReserves);
		oRet.paging = oPaging;
		arrCurPersonnelReserves = ArrayRange(arrCurPersonnelReserves, OptInt(oPaging.INDEX, 0) * oPaging.SIZE, oPaging.SIZE);
	}

	for(fldPersonnelReserve in arrCurPersonnelReserves)
	{
		docPersonnelReserve = tools.open_doc(fldPersonnelReserve.id);
		if(docPersonnelReserve == undefined)
		{
			continue;			
		}
		
		oRet.result.push(cast_oTailentPool(docPersonnelReserve.TopElem))
	}

	return oRet;
}

/**
 * @function GetTalentPoolCuratorsByPerson
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка кураторов по сотруднику.
 * @param {bigint} iObjectIDParam - ID сотрудника или карточки кадрового резерва по которому осуществляется отбор кураторов
 * @param {oAccess} oAccessParam - Объект со сведениями для вычисления доступа
 * @returns {WTTalentPoolPersonsResult}
*/
function GetTalentPoolCuratorsByPerson(iObjectIDParam, oAccessParam)
{
	var oRet = {
		error: 0,
		errorText: "",
		result: []
	};
	iPersonID = OptInt(iObjectIDParam);
	
	if(iPersonID == undefined)
	{
		oRet.error = 1;
		oRet.errorText = StrReplace("Передан некорректный ID [{PARAM1}]", "{PARAM1}", iObjectIDParam);
		return oRet;
	}
	docPerson = tools.open_doc(iPersonID);
	switch(docPerson.TopElem.Name)
	{
		case "collaborator":
		{
			break;
		}
		case "career_reserve":
		case "personnel_reserve":
		{
			iPersonID = OptInt(docPerson.TopElem.person_id.Value);
			if(iPersonID == undefined)
			{
				oRet.error = 1;
				oRet.errorText = "Некорректный ID сотрудника";
				return oRet;
			}
			docPerson = tools.open_doc(iPersonID);
			break;
		}
		default:
		{
			oRet.error = 1;
			oRet.errorText = StrReplace("Переданный ID [{PARAM1}] не являетя ID Сотрудника, Кадрового резерва или Этапа развития карьеры", "{PARAM1}", iPersonIDParam);
			return oRet;
		}
	}
	
	if ( ! tools_web.check_collection_access( oAccessParam.user_id, iPersonID, oAccessParam.access_type ) )
	{
		oRet.error = 403;
		oRet.errorText = tools_web.get_web_const( 'nedostatochnopr', oAccessParam.cur_lng );
		return oRet;
	}
	
	var arrCurators = [];
	var strReq = "for $elem in personnel_reserves where $elem/person_id=" + XQueryLiteral(iPersonID) + " return $elem/Fields('id', 'career_reserve_type_id')";
	var xarrPersonnelReserve = tools.xquery(strReq);
	
	var xarrCuratorsPersonnelReserve = tools.xquery("for $elem in talent_pool_func_managers where $elem/catalog='personnel_reserve' and MatchSome($elem/object_id, (" + ArrayMerge(xarrPersonnelReserve, "This.id.Value", ",") + ")) return $elem/Fields('person_id')");

	var xarrCuratorsPersonnelReserveType = tools.xquery("for $elem in talent_pool_func_managers where $elem/catalog='career_reserve_type' and MatchSome($elem/object_id, (" + ArrayMerge(xarrPersonnelReserve, "This.career_reserve_type_id.Value", ",") + ")) return $elem/Fields('person_id')");

	var xarrPersons = tools.xquery("for $elem in collaborators where MatchSome($elem/id, (" + ArrayMerge(ArrayUnion(xarrCuratorsPersonnelReserve, xarrCuratorsPersonnelReserveType), "This.person_id.Value", ",") + ")) return $elem")

	for(itemPerson in xarrPersons)
	{
		oRet.result.push(cast_oCollaborator(itemPerson));
	}

	return oRet;
}

/**
 * @function GetTalentPoolPersonnelReserveTests
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка испытаний в кадровом резерве.
 * @param {bigint} iPersonnelReserveIDParam - ID кадрового резерва
 * @param {oAccess} oAccessParam - Объект со сведениями для вычисления доступа
 * @returns {WTReserveTaskResult}
*/
function GetTalentPoolPersonnelReserveTests(iPersonnelReserveIDParam, oAccessParam)
{
	var oRet = {
		error: 0,
		result: [],
		errorText: ""
	};
	
	try
	{
		var docPersonnelReserve = open_object(iPersonnelReserveIDParam, "personnel_reserve", oAccessParam)
	}
	catch(err)
	{
		var parseErr = parse_error(err, oAccessParam)
		oRet.error = parseErr.code;
		oRet.errorText = parseErr.message;
		return oRet;
	}
	
	if(docPersonnelReserve.TopElem.Name != "personnel_reserve")
	{
		oRet.error = 1;
		oRet.errorText = StrReplace("Переданный ID [{PARAM1}] не являетя ID Кадрового резерва", "{PARAM1}", iPersonnelReserveIDParam);
		return oRet;
	}

	for(itemPersonnelReserveTest in docPersonnelReserve.TopElem.tasks)
	{
		oRet.result.push(cast_oReserveTask(itemPersonnelReserveTest, null, docPersonnelReserve.TopElem));
	}
	
	return oRet;
}

/**
 * @typedef {Object} oCareerReserveTypeTest
 * @memberof Websoft.WT.TalentPool
 * @property {string} id - ID записи
 * @property {bigint} task_id - ID задачи
 * @property {bigint} object_id - ID объекта справочника, в состав которго вxодит задача
 * @property {string} name - Наименование задачи
 * @property {string} type - Тип задачи (ID)
 * @property {string} type_desc - Тип задачи (наименование)
 * @property {integer} due_date - Срок выполнения в днях
 * @property {bigint} desc - Описание задачи
 * @property {string} message - Дополнительная (служебная) информация по задаче
 * @property {string} activity_type - Тип (имя каталога) объекта по задаче
 * @property {bigint} activity_id - ID объекта по задаче
 * @property {string} activity_name - Наименование объекта по задаче
 * @property {string} activity_link - Ссылка на карточку объекта
 * @property {string} link_msg - Сообщение в случае отсутствия ссылки
*/
/**
 * @typedef {Object} WTTemplateReserveTaskResult
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oCareerReserveTypeTest[]} result – результат
*/
/**
 * @function GetTalentPoolCareerReserveTypeTests
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка испытаний в типе кадрового резерва.
 * @param {bigint} iPersonnelReserveTypeIDParam - ID типа кадрового резерва
 * @param {oAccess} oAccessParam - Объект со сведениями для вычисления доступа
 * @returns {WTTemplateReserveTaskResult}
*/
function GetTalentPoolCareerReserveTypeTests(iCareerReserveTypeIDParam, oAccessParam)
{
	var oRet = {
		error: 0,
		result: [],
		errorText: ""
	};
	
	try
	{
		var docObject = open_object(iCareerReserveTypeIDParam, "personnel_reserve", oAccessParam)
	}
	catch(err)
	{
		var parseErr = parse_error(err, oAccessParam)
		oRet.error = parseErr.code;
		oRet.errorText = parseErr.message;
		return oRet;
	}	
	
	switch(docObject.TopElem.Name)
	{
		case "career_reserve_type":
			var docCareerReserveType = docObject;
			break;
		case "personnel_reserve":
			var docCareerReserveType = open_object(docObject.TopElem.career_reserve_type_id.Value)
			break;
		default:
			oRet.error = 1;
			oRet.errorText = StrReplace("Переданный ID [{PARAM1}] не являетя ID Кадрового резерва, Типа кадрового резерва или Сотрудника", "{PARAM1}", iCareerReserveTypeIDParam);
			return oRet;
	}
	
	var oItemTest, exch_type;
	var Link, objName;
	for(itemCareerReserveTypeTest in docCareerReserveType.TopElem.tasks)
	{
		typeDesc = ArrayOptFind(common.career_reserve_type_tasks_types, "This.id.Value == itemCareerReserveTypeTest.type.Value");
		
		Link = "";
		objName = "";
		msgLink = "";
		if(itemCareerReserveTypeTest.type.Value != "other" && itemCareerReserveTypeTest.object_id.HasValue)
		{
			exch_type = ArrayOptFind(common.exchange_object_types, "This.name == itemCareerReserveTypeTest.object_type.Value");
			if(exch_type != undefined)
			{
				Link = tools_web.get_mode_clean_url( null, itemCareerReserveTypeTest.object_id.Value )    
				objName = itemCareerReserveTypeTest.object_id.OptForeignElem;
				if(objName != undefined ) objName = objName.ChildValue(exch_type.disp_name);
			}
			else
				msgLink = "Неизвестный тип активности"
		}
		else
			msgLink = "У испытания отсутствует активность"
		
		oItemTest = {
			id: String(docCareerReserveType.DocID) + "_" + itemCareerReserveTypeTest.id.Value,
			task_id: itemCareerReserveTypeTest.id.Value,
			object_id:	String(docCareerReserveType.DocID),
			name: itemCareerReserveTypeTest.name.Value,
			type: itemCareerReserveTypeTest.type.Value,
			type_desc: (typeDesc != undefined ? typeDesc.name.Value : ""),
			due_date: itemCareerReserveTypeTest.due_date.Value,
			desc: itemCareerReserveTypeTest.desc.Value,
			message: "",
			activity_type: itemCareerReserveTypeTest.object_type.Value,
			activity_id: itemCareerReserveTypeTest.object_id.Value,
			activity_name: objName,
			activity_link: Link,
			link_msg: msgLink
		};
		oRet.result.push(oItemTest);
	}
	
	return oRet;
}

/**
 * @typedef {Object} WTCareerPlansResult
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oCareerPlan[]} result – результат
*/
/**
 * @function GetCareerPlansByObject
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение карьерных планов по связанному объекту.
 * @param {bigint} ObjectParam - ID объекта, по которому отбираются карьерные планы  или наименование каталога (или нескольких через ,)
 * @param {boolean} bAllByType - true - отбор идет по типу объекта; false - отбор по ID объекта
 * @param {boolean} bGetCalculateField - true: вычисление дополнительных вычисляемых полей 
 * @param {string[]} arrStatuses - массив статусов для отбора 
 * @param {string} sXQueryQual - строка для XQuery фильтра
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @param {bigint} iCurUserID - ID пользователя
 * @param {string} sAccessType - тип доступа из приложения
 * @param {string} sApplication - код приложения
 * @param {bigint} iCurApplicationID - ID приложения
 * @returns {WTCareerPlansResult}
*/
function GetCareerPlansByObject(ObjectParam, bAllByType, bGetCalculateField, arrStatuses, sXQueryQual, oCollectionParams, iCurUserID, sAccessType, sApplication, iCurApplicationID)
{
	var oRet = {
		error: 0,
		result: [],
		errorText: "",
		paging: oCollectionParams.paging
	};
	
	arrFilters = oCollectionParams.filters;

	try
	{
		if (OptInt(iCurApplicationID) == undefined)
			var arrCareerPlans = get_career_plans_by_object(ObjectParam, bAllByType);
		else
		{//app mode
	
			var arrCareerPlans = [];
			
			arrSubCollaborators = [];
			arrSubPositions = [];
			arrSubGroups = [];
				
			iCurUserID = OptInt( iCurUserID, 0);
			
			if(sAccessType == "auto")
			{
				iApplicationID = OptInt(sApplication);
				if(iApplicationID != undefined)
				{
					sApplication = ArrayOptFirstElem(tool.xquery("for $elem in applications where $elem/id = " + iApplicationID + " return $elem/Fields('code')"), {code: ""}).code;
				}
				var iApplLevel = tools.call_code_library_method( "libApplication", "GetPersonApplicationAccessLevel", [ iCurUserID, sApplication ] );

				if(iApplLevel >= 7)
				{
					sAccessType = "admin";
				}
				else if(iApplLevel >= 5)
				{
					sAccessType = "hr";
				}
				else if(iApplLevel >= 3)
				{
					sAccessType = "expert";
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
				case "admin":
					{
						arrCareerPlans = get_career_plans_by_object(ObjectParam, true, arrStatuses, sXQueryQual, arrFilters);
						break;
					}
				case "hr":
					{
						arrBossType = [];
						var teApplication = tools_app.get_cur_application(OptInt(iCurApplicationID));
						if (teApplication != null)
						{
							if ( teApplication.wvars.GetOptChildByKey( 'manager_type_id' ) != undefined )
							{
								manager_type_id = (OptInt( teApplication.wvars.GetOptChildByKey( 'manager_type_id' ).value, 0 ));
								if (manager_type_id > 0)
									arrBossType.push(manager_type_id);
							}
						}

						if(ArrayOptFirstElem(arrBossType) == undefined)
						{
							arrBossType = ArrayExtract(tools.xquery("for $elem in boss_types where $elem/code = 'education_manager' return $elem"), 'id');
						}
						
						if (OptInt(ObjectParam) == undefined)
						{
							if ( StrContains(ObjectParam, 'position_common' ))
							{
								arrCareerPlans = ArrayUnion(arrCareerPlans, get_career_plans_by_object('position_common', true, arrStatuses, sXQueryQual, arrFilters, []));
							}
							if ( StrContains(ObjectParam, 'position_family' ))
							{
								arrCareerPlans = ArrayUnion(arrCareerPlans, get_career_plans_by_object('position_family', true, arrStatuses, sXQueryQual, arrFilters, []));
							}
							if ( StrContains(ObjectParam, 'collaborator' ) )
							{
								arrSubCollaborators = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, '', null, '', true, true, true, true, arrBossType, true ] );
								
								if (ArrayOptFirstElem(arrSubCollaborators) != undefined)
									arrCareerPlans = ArrayUnion(arrCareerPlans, get_career_plans_by_object('collaborator', true, arrStatuses, sXQueryQual, arrFilters, arrSubCollaborators));
							}
							if ( StrContains(ObjectParam, 'position' ) )
							{
								arrSubPositions = ArrayUnion(arrSubPositions, tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, 'position', null, '', true, false, false, true, arrBossType, true ] ));
								
								if (ArrayOptFirstElem(arrSubPositions) != undefined)
									arrCareerPlans = ArrayUnion(arrCareerPlans, get_career_plans_by_object('position', true, arrStatuses, sXQueryQual, arrFilters, arrSubPositions));
							}
							if ( StrContains(ObjectParam, 'group' ) )
							{
								arrSubGroups = ArrayExtract(tools.xquery("for $elem in func_managers where $elem/catalog = 'group' and $elem/person_id = " + iCurUserID + " and $elem/boss_type_id = " + ArrayOptFirstElem(arrBossType) + " return $elem" ), 'This.object_id')

								if (ArrayOptFirstElem(arrSubGroups) != undefined)
									arrCareerPlans = ArrayUnion(arrCareerPlans, get_career_plans_by_object('group', true, arrStatuses, sXQueryQual, arrFilters, arrSubGroups));
							}
						}
						else
						{
							docObject = tools.open_doc(OptInt(ObjectParam));
							if (docObject!= undefined && docObject.TopElem.Name == 'collaborator')
							{
								arrSubCollaborators = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, '', null, '', true, true, true, true, arrBossType, true ] );
								if (ArrayOptFind(arrSubCollaborators, 'This == docObject.TopElem.id') != undefined)
								{
									arrCareerPlans = get_career_plans_by_object(ObjectParam, true, arrStatuses, sXQueryQual, arrFilters);
								}
								else
								{
									return oRet;
								}
							}
						}
						break;
					}
				case "expert":
					{
						if (OptInt(ObjectParam) == undefined)
						{
							if ( StrContains(ObjectParam, 'position_common' ) || StrContains(ObjectParam, 'position_family' ))
							{
								iExpertID = ArrayOptFirstElem(tools.xquery("for $elem in experts where $elem/person_id = " + iCurUserID + " return $elem/Fields('id')"), {id: null}).id
								if(iExpertID == null)
								{
									oRes.error = 501;
									oRes.errorText = "Ошибка! Вы не назначены экспертом. Обратитесь к администратору.";
									return oRet;
								}
								
								arrCategories = tools.xquery("for $elem in roles where contains ($elem/experts, '" + iExpertID + "') return $elem/Fields('id')");
								if ( ArrayOptFirstElem( arrCategories ) != undefined )
								{
									sXQueryQual += " MatchSome($elem/role_id, (" + ArrayMerge ( arrCategories, 'This.id', ',' ) + "))"
									arrCareerPlans = get_career_plans_by_object(ObjectParam, true, arrStatuses, sXQueryQual, arrFilters, []);
								}
							}
						}
						break;
					}
				case "observer":
					{
			
						if (OptInt(ObjectParam) == undefined)
						{
							if ( StrContains(ObjectParam, 'position_common' ))
							{
								arrCareerPlans = ArrayUnion(arrCareerPlans, get_career_plans_by_object('position_common', true, arrStatuses, sXQueryQual, arrFilters, []));
							}
							if ( StrContains(ObjectParam, 'position_family' ))
							{
								arrCareerPlans = ArrayUnion(arrCareerPlans, get_career_plans_by_object('position_family', true, arrStatuses, sXQueryQual, arrFilters, []));
							}
							if ( StrContains(ObjectParam, 'collaborator' ) )
							{
								arrSubCollaborators = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['fact','func'], true, '', null, '', true, true, true, true, [], true ] );
								
								if (ArrayOptFirstElem(arrSubCollaborators) != undefined)
									arrCareerPlans = ArrayUnion(arrCareerPlans, get_career_plans_by_object('collaborator', true, arrStatuses, sXQueryQual, arrFilters, arrSubCollaborators));
							}
							if ( StrContains(ObjectParam, 'position' ) )
							{
								arrSubPositions = ArrayUnion(arrSubPositions, tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['fact','func'], true, 'position', null, '', true, false, false, true, [], true ] ));
								
								if (ArrayOptFirstElem(arrSubPositions) != undefined)
									arrCareerPlans = ArrayUnion(arrCareerPlans, get_career_plans_by_object('position', true, arrStatuses, sXQueryQual, arrFilters, arrSubPositions));
							}
							if ( StrContains(ObjectParam, 'group' ) )
							{
								arrSubGroups = ArrayExtract(tools.xquery("for $elem in func_managers where $elem/catalog = 'group' and $elem/person_id = " + iCurUserID + " return $elem" ), 'This.object_id')

								if (ArrayOptFirstElem(arrSubGroups) != undefined)
									arrCareerPlans = ArrayUnion(arrCareerPlans, get_career_plans_by_object('group', true, arrStatuses, sXQueryQual, arrFilters, arrSubGroups));
							}
						}
						else
						{
							docObject = tools.open_doc(OptInt(ObjectParam));
							if (docObject!= undefined && docObject.TopElem.Name == 'collaborator')
							{
								arrSubCollaborators = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['fact','func'], true, '', null, '', true, true, true, true, [], true ] );
								if (ArrayOptFind(arrSubCollaborators, 'This == docObject.TopElem.id') != undefined)
								{
									arrCareerPlans = get_career_plans_by_object(ObjectParam, true, arrStatuses, sXQueryQual, arrFilters);
								}
								else
								{
									return oRet;
								}
							}
						}
						break;
					}
				case "reject":
					{
						oRet.error = 501;
						oRet.errorText = 'Отсутствуют права доступа';
						return oRet;
						break;
					}
			}
		}
			
		for(itemCareerPlan in arrCareerPlans)
		{
			oRet.result.push(cast_CareerPlan(itemCareerPlan, bGetCalculateField))
		}
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = "ERROR: GetCareerPlansByObject:\r\n" + err;
	}
	return oRet
}

/**
 * @function GetCareerPlansByPerson
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение карьерных планов по связанному объекту.
 * @param {bigint} PersonIDParam - ID сотрудника, для которого отбираются карьерные планы
 * @param {string} sCareerPlanTypes - строка с массивом типов планов (типов связанных объектов)
 * @param {boolean} bGetCalculateField - true: вычисление дополнительных вычисляемых полей 
 * @returns {WTCareerPlansResult}
*/
function GetCareerPlansByPerson(PersonIDParam, sCareerPlanTypes, bGetCalculateField)
{
	var oRet = {
		error: 0,
		result: [],
		errorText: ""
	};
	var arrRes = [];

	if(sCareerPlanTypes == "" || sCareerPlanTypes == null || sCareerPlanTypes == undefined)
		sCareerPlanTypes = "position_common";
	
	try
	{
		var arrCareerPlanTypes = tools_web.parse_multiple_parameter(sCareerPlanTypes);
		for(itemCareerPlanType in arrCareerPlanTypes)
		{
		
			var arrObjectIDs = get_object_ids_for_type_career_plan(PersonIDParam, itemCareerPlanType);
			
			for(itemObjectId in arrObjectIDs)
			{
				var arrCareerPlans = get_career_plans_by_object(itemObjectId, false);
				
				for(itemCareerPlan in arrCareerPlans)
				{
					arrRes.push(cast_CareerPlan(itemCareerPlan, bGetCalculateField))
				}
			}
		}
		oRet.result = ArraySort(arrRes, "name", "+") ;
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = "ERROR: GetCareerPlansByPerson:\r\n" + err;
	}
	
	return oRet;
}

/**
 * @typedef {Object} WTCareerPlanStagesResult
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oCareerPlanStage[]|oCareerPlanStageTree[]} result – результат
*/
/**
 * @function GetCareerPlanStages
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка этапов карьерного плана.
 * @param {bigint} iCareerPlanID - ID карьерного плана
 * @param {bool} bIsForTree - Построение коллекции для представления в виде маршрута
 * @param {oAccess} oAccessParam - Объект со сведениями для вычисления доступа
 * @returns {WTCareerPlanStagesResult}
*/
function GetCareerPlanStages(iCareerPlanID, bIsForTree, oAccessParam)
{
	var oRet = {
		error: 0,
		result: [],
		errorText: ""
	};
	
	bIsForTree = tools_web.is_true(bIsForTree);
	
	try
	{
		docCareerPlan = open_object(iCareerPlanID, "career_reserve", oAccessParam);
	}
	catch(err)
	{
		var parseErr = parse_error(err, oAccessParam)
		return {
				error: parseErr.code, 
				result: [], 
				errorText: StrReplace("Не удалось открыть карьерный план с ID [{PARAM1}]:\r\n", "{PARAM1}", iCareerPlanID) + parseErr.message
			};
	}
	
	if(docCareerPlan.TopElem.Name != "career_plan")
		throw StrReplace(StrReplace("Полученный ID [{PARAM1}] не является ID карьерного плана: [{PARAM2}]", "{PARAM1}", iCareerPlanID), "{PARAM2}", docCareerPlan.TopElem.Name);
	
	try
	{
		var arrAllTasks = get_task_wo_cancel(docCareerPlan.TopElem.stages);
		if(bIsForTree)
		{
			var sCurID, sParentID = null, iCountLevel = 0
			for(itemStage in arrAllTasks)
			{
				sCurID = iCountLevel + "_" + itemStage.id.Value;
				oRet.result.push(cast_CareerPlanStageToTree(itemStage, iCountLevel, sCurID, sParentID))
				sParentID = sCurID;
				iCountLevel++;
			}
		}
		else
		{
			for(itemStage in arrAllTasks)
			{
				oRet.result.push(cast_CareerPlanStage(itemStage))
			}
		}
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = "ERROR: GetCareerPlanStages:\r\n" + err;
	}
	return oRet
}


/**
 * @typedef {Object} oRequirement
 * @property {bigint} id – ID требования.
 * @property {string} type – Код типа требования.
 * @property {bigint} type_name – Наименование типа требования.
 * @property {string} name – Наименование требования.
 * @property {integer} checked – Соответствие требованию. 1 - соответствует, 0 - не соответствует
 * @property {string} check_comment – Сообщение о соответствии требованию.
 * @property {string} activity_name – Наименование активности.
 * @property {string} activity_url – Ссылка на прохождение активности.
*/
/**
 * @typedef {Object} ReturnCareerPlanRequirements
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oRequirement[]} array – Массив требований к типовой должности карьерного плана.
*/
/**
 * @function GetCareerPlanRequirements
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Перечень требований к типовой должности в карьерном плане.
 * @param {bigint} iCareerPlanIDParam - ID Карьерного плана
 * @param {bigint} iPersonIDParam - ID сотрудника, для котоого проверяются требования
 * @param {boolean} bStrongObligatory - Проверять только обязательные параметры
 * @returns {ReturnCareerPlanRequirements}
*/
function GetCareerPlanRequirements(iCareerPlanIDParam, iPersonIDParam, bStrongObligatory)
{
    var oRes = tools.get_code_library_result_object();
	oRes.array = []

	var iPersonID = OptInt(iPersonIDParam);
	if(iPersonID == undefined)
		throw StrReplace("Передан некорректный ID сотрудника: [{PARAM!}]", "{PARAM!}", iPersonIDParam);

	var iCareerPlanID = OptInt(iCareerPlanIDParam);
	if(iCareerPlanID == undefined)
		throw StrReplace("Передан некорректный ID карьерного плана: [{PARAM!}]", "{PARAM!}", iCareerPlanIDParam);
	
	var docCareerPlan = tools.open_doc(iCareerPlanID);
	if(docCareerPlan == undefined)
		throw StrReplace("Не найден карьерный план с указанным ID: [{PARAM!}]", "{PARAM!}", iCareerPlanID);
	var teCareerPlanID = docCareerPlan.TopElem;
	var fldFirstActiveStage = ArrayOptFirstElem(ArraySelect(teCareerPlanID.stages, "This.status.Value == 'plan'"))
	
	if(fldFirstActiveStage != undefined)
	{
		var arrRet = tools.call_code_library_method( "libStaff", "GetPositionCommomRequirements", [ fldFirstActiveStage.position_common_id.Value, null, iPersonID, bStrongObligatory ] )
		oRes.array = arrRet.requirements;
	}
	
	return oRes;
}

/**
 * @typedef {Object} oCareerPlanContext
 * @property {int} stages_count – общее количество этапов в маршруте
 * @property {int} active_stages_count – число этапов в маршруте со статусом В работе
 * @property {int} expired_stages_count – число просроченных этапов
 * @property {int} passed_stages_count – число этапов в маршруте со статусом Пройдено успешно
 * @property {int} failed_stages_count – число этапов в маршруте со статусом Пройдено неуспешно
*/
/**
 * @typedef {Object} ReturnCareerPlanContext
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oCareerPlanContext} - контекс по карьерному плану
*/
/**
 * @function GetCareerPlanContext
 * @memberof Websoft.WT.TalentPool
 * @author AKh
 * @description контекстные показатели для карьерного плана
 * @param {bigint} iCareerPlanID - ID Карьерного плана
 * @returns {ReturnCareerPlanContext}
*/
function GetCareerPlanContext(iCareerPlanID)
{
    var oRes = tools.get_code_library_result_object();
	oRes.context = new Object;
	
	try
	{
		iCareerPlanID = Int(iCareerPlanID);
	}
	catch (err)
	{
		oRes.error = 1;
		oRes.errorText = "Некорректный ID карьерного плана";
		return oRes;
	}
	
	docCareerPlan = tools.open_doc(iCareerPlanID);
	
	if(docCareerPlan.TopElem.Name != "career_plan")
		throw StrReplace(StrReplace("Полученный ID [{PARAM1}] не является ID карьерного плана: [{PARAM2}]", "{PARAM1}", iCareerPlanID), "{PARAM2}", docCareerPlan.TopElem.Name);
	
	arrActiveStages = ArraySelect(docCareerPlan.TopElem.stages, "This.status == 'active'");
	arrPlanStages = ArraySelect(docCareerPlan.TopElem.stages, "This.status == 'plan'");
	arrPassedStages = ArraySelect(docCareerPlan.TopElem.stages, "This.status == 'passed'");
	arrFailedStages = ArraySelect(docCareerPlan.TopElem.stages, "This.status == 'failed'");
	
	iExpiredCount = 0;
	arrExpiredPassedStages = ArraySelect(arrPassedStages, "This.fact_date > This.plan_date");
	iExpiredCount += ArrayCount(arrExpiredPassedStages);
	arrExpiredFailedStages = ArraySelect(arrFailedStages, "This.fact_date > This.plan_date");
	iExpiredCount += ArrayCount(arrExpiredFailedStages);
	arrExpiredPlanStages = ArraySelect(arrPlanStages, "Date() > This.plan_date");
	iExpiredCount += ArrayCount(arrExpiredPlanStages);
	arrExpiredActiveStages = ArraySelect(arrActiveStages, "Date() > This.plan_date");
	iExpiredCount += ArrayCount(arrExpiredActiveStages);
	
	var oContext = {
        stages_count: ArrayCount(docCareerPlan.TopElem.stages),
        active_stages_count: ArrayCount(arrActiveStages),
		expired_stages_count: iExpiredCount,
		passed_stages_count: ArrayCount(arrPassedStages),
		failed_stages_count: ArrayCount(arrFailedStages)
    }

	oRes.context = oContext;
	
	return oRes;
}

 /**
 * @typedef {Object} WTCareerPlanDelete
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {string} result – результат
*/
/**
 * @function CareerPlanDelete
 * @memberof Websoft.WT.TalentPool
 * @author AKh
 * @description функция удаления одного или нескольких карьерных планов
 * @param {bigint[]} arrCareerPlans - массив ID карьерных планов
*/
function CareerPlanDelete(arrCareerPlans, bCanDeletePlanCollaborator)
{
	oRes = tools.get_code_library_result_object();
	oRes.result = "";

	try
	{
		if (!IsArray(arrCareerPlans))
			throw ''
		}
	catch( ex )
	{
		oRes.error = 501;
		oRes.errorText = "CareerPlanDelete: аргумент функции не является массивом";
		return oRes;
	}
	
	try
	{
		var catCheckObj = ArrayOptFirstElem(ArraySelect(arrCareerPlans, "OptInt(This) != undefined"))
		var docObj = tools.open_doc(Int(catCheckObj));
		
		if(docObj == undefined || docObj.TopElem.Name != "career_plan")
			throw ''
	}
	catch( ex )
	{
		oRes.error = 502;
		oRes.errorText = "CareerPlanDelete: аргумент не является массивом ID  карьерных планов";
		return oRes;
	}
	
	iCountDelete = 0;
	for (catCareerPlan in arrCareerPlans)
	{
		docCareerPlan = tools.open_doc(catCareerPlan);
		
		if (docCareerPlan.TopElem.object_type != 'collaborator')
		{
			DeleteDoc ( UrlFromDocID ( OptInt( catCareerPlan ) ) );
			iCountDelete++;
		}
		else if (docCareerPlan.TopElem.object_type == 'collaborator' && bCanDeletePlanCollaborator)
		{
			DeleteDoc ( UrlFromDocID ( OptInt( catCareerPlan ) ) );
			iCountDelete++;
		}
	}
	
	iCountCareerPlan  = ArrayCount(arrCareerPlans);
	if (iCountDelete == iCountCareerPlan && iCountCareerPlan > 1)
	oRes.result = 'Карьерные маршруты удалены';
	else if (iCountDelete == iCountCareerPlan && iCountCareerPlan == 1)
	oRes.result = 'Карьерный маршрут удален';
	else if (iCountDelete < iCountCareerPlan)
	oRes.result = 'Удалено карьерных маршрутов: ' + iCountDelete + ' из ' + iCountCareerPlan;
	
	return oRes;
}

/**
 * @typedef {Object} WTCareerPlanChangeState
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {string} count – результат
*/
/**
 * @function CareerPlanChangeState
 * @memberof Websoft.WT.TalentPool
 * @author AKh
 * @description функция изменения статуса одного или нескольких карьерных планов
 * @param {bigint[]} arrCareerPlans - массив ID карьерных планов
 * @param {string} sNewState - устанавливаемый статус
 * @param {bool} bSendMessage - отправка уведомлений сотруднику при изменении плана
 * @param {object} oSendParam - параметры отправки уведомлений
*/
function CareerPlanChangeState(arrCareerPlans, sNewState, bSendMessage, oSendParam)
{
	oRes = tools.get_code_library_result_object();
	oRes.count = 0;
	
	try
	{
		if (!IsArray(arrCareerPlans))
			throw ''
	}
	catch( ex )
	{
		oRes.error = 501;
		oRes.errorText = "CareerPlanChangeState: аргумент функции не является массивом";
		return oRes;
	}
	
	if (sNewState == '' || sNewState == null || sNewState == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "CareerPlanChangeState: не передан новый статус карьерного плана";
		return oRes;
	}
	
	
	for (_career_plan in arrCareerPlans)
	{
		docPlan = tools.open_doc(_career_plan);
		if (docPlan == undefined)
		{
			oRes.error = 503;
			oRes.errorText = "CareerPlanChangeState: объект карьерного плана не найден";
			return oRes;
		}
		if (docPlan.TopElem.object_type != 'collaborator')
			continue;
	
		
		docPlan.TopElem.status = sNewState;
		docPlan.Save();
		oRes.count++;
		if (bSendMessage && docPlan.TopElem.object_id.ForeignElem.email != '')
		{
			switch(oSendParam.send_type)
			{
				case "template":
				{
					docNotification = tools.open_doc(oSendParam.notification_id);
					if (docNotification == undefined)
					{
						oRes.error = 505;
						oRes.errorText = "CareerPlanChangeState: не выбран шаблон уведомлений!";
						return oRes;
					}
					
					bResultSend = tools.create_notification(docNotification.TopElem.code.Value, OptInt(docPlan.TopElem.object_id, 0), oSendParam.custom_text, OptInt(_career_plan, 0));
					break;
				}
				case "custom_message":
				{
					newNotif = OpenNewDoc('x-local://wtv/wtv_dlg_notification_template.xml').TopElem;
					newNotif.recipients.AddChild().recipient_type = 'in_doc';
					newNotif.body_type = oSendParam.body_type;
					
					bResultSend = tools.create_template_notification("0", OptInt(docPlan.TopElem.object_id, 0), oSendParam.subject, oSendParam.body, null, newNotif, OptInt(_career_plan, 0));
					break;
				}
			}
		}
	}
	
	return oRes;
}

/**
 * @typedef {Object} WTCareerPlanAddPersonnelReserve
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {string} count – результат
*/
/**
 * @function CareerPlanAddPersonnelReserve
 * @memberof Websoft.WT.TalentPool
 * @author AKh
 * @description функция создания кадрового резерва для сотрудника в карьерном плане
 * @param {bigint[]} arrCareerPlans - массив ID карьерных планов
 * @param {string} sStatus - статус кадрового резерва
 * @param {int} iReserveType - ID типа кадрового резерва
 * @param {bool} bSendMessage - отправка уведомлений сотруднику при изменении плана
 * @param {object} oSendParam - параметры отправки уведомлений
*/
function CareerPlanAddPersonnelReserve(arrCareerPlans, sStatus, iReserveType, bSendMessage, oSendParam)
{
	oRes = tools.get_code_library_result_object();
	oRes.count = 0;
	
	try
	{
		if (!IsArray(arrCareerPlans))
			throw ''
	}
	catch( ex )
	{
		oRes.error = 501;
		oRes.errorText = "CareerPlanAddPersonnelReserve: аргумент функции не является массивом";
		return oRes;
	}
	
	for (_career_plan in arrCareerPlans)
	{
		docPlan = tools.open_doc(_career_plan);
		if (docPlan == undefined)
		{
			oRes.error = 503;
			oRes.errorText = "CareerPlanAddPersonnelReserve: объект карьерного плана не найден";
			return oRes;
		}
		if (docPlan.TopElem.object_type != 'collaborator')
			continue;

		xarrPersonnelReserves = tools.xquery("for $elem in personnel_reserves where $elem/person_id = " + docPlan.TopElem.object_id + " and ($elem/status = 'in_reserve' or $elem/status = 'candidate') and $elem/career_reserve_type_id = " + iReserveType + " return $elem");
		
		if( ArrayOptFirstElem(xarrPersonnelReserves) != undefined )
			continue;
		
		create_personnel_reserve(docPlan.TopElem.object_id, sStatus, iReserveType);
		oRes.count++;
		
		if (bSendMessage && docPlan.TopElem.object_id.ForeignElem.email != '')
		{
			switch(oSendParam.send_type)
			{
				case "template":
				{
					docNotification = tools.open_doc(oSendParam.notification_id);
					if (docNotification == undefined)
					{
						oRes.error = 505;
						oRes.errorText = "CareerPlanAddPersonnelReserve: не выбран шаблон уведомлений!";
						return oRes;
					}
					
					bResultSend = tools.create_notification(docNotification.TopElem.code.Value, OptInt(_career_plan, 0), oSendParam.custom_text, null);
					break;
				}
				case "custom_message":
				{
					newNotif = OpenNewDoc('x-local://wtv/wtv_dlg_notification_template.xml').TopElem;
					newNotif.recipients.AddChild().recipient_type = 'in_doc';
					newNotif.body_type = oSendParam.body_type;
					
					bResultSend = tools.create_template_notification("0", OptInt(_career_plan, 0), oSendParam.subject, oSendParam.body, null, newNotif, null);
					break;
				}
			}
		}
	}
	
	return oRes;
}

function create_personnel_reserve( iPersonID, sStatus, iPersonnelReserveType )
{
	iPersonID = OptInt(iPersonID, 0);
	iPersonnelReserveType = OptInt(iPersonnelReserveType, 0);
	
	xarrPersonnelReserves = tools.xquery("for $elem in personnel_reserves where $elem/person_id = " + iPersonID + " and ($elem/status = 'in_reserve' or $elem/status = 'candidate') and $elem/career_reserve_type_id = " + iPersonnelReserveType + " return $elem");
	
	if( ArrayOptFirstElem(xarrPersonnelReserves) == undefined )
	{
		newPersonnelReserve = OpenNewDoc ('x-local://wtv/wtv_personnel_reserve.xmd');
		newPersonnelReserve.TopElem.person_id = iPersonID;
		newPersonnelReserve.TopElem.status = sStatus;
		newPersonnelReserve.TopElem.career_reserve_type_id = iPersonnelReserveType;
		
		if (sStatus == 'candidate')
			newPersonnelReserve.TopElem.start_date = Date();
		else
			newPersonnelReserve.TopElem.include_reserve_date = Date();
		
		newPersonnelReserve.BindToDb(DefaultDb);
		newPersonnelReserve.Save();
	}
}

/**
 * @typedef {Object} ReturnPersonnelCommitteeMembers
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPersonnelCommitteeMember[]} array – Массив участников кадрового комитета
*/
/**
 * @function GetPersonnelCommittee
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Участники кадрового комитета.
 * @param {bigint} iPersonnelCommitteeIDParam - ID кадрового комитета
 * @param {string[]} arrTypes - Типы участников кадрового комитета
 * @param {oSort} oSort
 * @returns {ReturnPersonnelCommitteeMembers}
*/
function GetPersonnelCommittee(iPersonnelCommitteeIDParam, arrTypes, oSort)
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = []

	var iPersonnelCommitteeID = OptInt(iPersonnelCommitteeIDParam);
	if(iPersonnelCommitteeID == undefined)
		throw StrReplace("Передан некорректный ID карьерного комитета: [{PARAM!}]", "{PARAM!}", iPersonnelCommitteeIDParam);
	
	var docPersonnelCommittee = tools.open_doc(iPersonnelCommitteeID);
	if(docPersonnelCommittee == undefined)
		throw StrReplace("Не найден карьерный комитет с указанным ID: [{PARAM!}]", "{PARAM!}", iPersonnelCommitteeID);

	if(docPersonnelCommittee.TopElem.Name != "personnel_committee")
		throw StrReplace("Переданный объект не является карьерным комитетом: [{PARAM1}]", "{PARAM1}", docPersonnelCommittee.TopElem.Name);
		
	var sReqColl = "for $elem in committee_members where $elem/personnel_committee_id = " + iPersonnelCommitteeID + " and MatchSome($elem/committee_member_type, (" + ArrayMerge(arrTypes, "XQueryLiteral(This)", ",") + ") ) return $elem";
	var arrColls = ArraySelectAll(tools.xquery(sReqColl));

	for( _res in arrColls )
	{
		oRes.array.push(cast_PersonnelCommitteeMember(_res));
	}
	
	if(ObjectType(oSort) == 'JsObject' && oSort.FIELD != null && oSort.FIELD != undefined && oSort.FIELD != "" )
	{
		oRes.array = ArraySort(oRes.array,oSort.FIELD,((oSort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	return oRes;
}

/**
 * @typedef {Object} ReturnPersonnelCommitteeList
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPersonnelCommittee[]} array – Массив участников кадрового комитета
*/
/**
 * @function GetPersonnelCommitteeList
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Коллекция кадровых комитетов.
 * @param {bigint} iPersonID - ID текущего пользователя
 * @param {string[]} arrStates - Статусы кадровых комитетов
 * @param {oSort} oSort
 * @returns {ReturnPersonnelCommitteeList}
*/
function GetPersonnelCommitteeList(iPersonID, arrStates, oSort)
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = []
	
	if(arrStates != "" && arrStates != null && arrStates != undefined && !IsArray(arrStates))
		arrStates = [];
	
	var arrXqCond = [];

	iPersonID = OptInt(iPersonID);
	if(iPersonID != undefined)
		arrXqCond.push("some $cm in committee_members satisfies ($cm/personnel_committee_id = $elem/id and $cm/catalog = 'collaborator' and $cm/committee_member_type = 'participant' and $cm/object_id = " + iPersonID + ")");
	
	if(ArrayOptFirstElem(arrStates) != undefined)
		arrXqCond.push("MatchSome($elem/status, ( " + ArrayMerge(arrStates, "XQueryLiteral(This)", ",") + " ))");
	
	var xqCond = ArrayOptFirstElem(arrXqCond) != undefined ? " where " + ArrayMerge(arrXqCond, "This", " and ") : "";
	
	var sReqPerCommit = "for $elem in personnel_committees" + xqCond + " order by $elem/committee_date descending return $elem";
	
	var arrPerCommit = tools.xquery(sReqPerCommit);

	for( _res in arrPerCommit )
	{
		oRes.array.push(cast_PersonnelCommittee(_res));
	}
	
	if(ObjectType(oSort) == 'JsObject' && oSort.FIELD != null && oSort.FIELD != undefined && oSort.FIELD != "" )
	{
		oRes.array = ArraySort(oRes.array,oSort.FIELD,((oSort.DIRECTION == "DESC") ? "-" : "+"));
	}
	
	return oRes;
}


/**
 * @typedef {Object} oPCOperation
 * @property {bigint} id
 * @property {string} name - Наименование
 * @property {string} operation - Код
 * @property {bigint} ra_id - ID удаленного действия
 * @property {string} ra_name - Наименование удаленного действия
 * @property {string} ra_params - Параметры удаленного действия
*/
/**
 * @typedef {Object} oPCOperations
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oPCOperation[]} array – Действия кадрового комитета.
*/
/**
 * @function GetPersonnelCommitteeActions 
 * @memberof Websoft.WT.TalentPool
 * @author KK
 * @description Кадровый резерв / Кадровый комитет / Выборка действий
 * @param {bigint} iPersonnelCommitteeIDParam - ID кадрового комитета
 * @param {bigint} iCurUserIDParam - ID сотрудника
 * @returns {oPCOperations} 
*/
function GetPersonnelCommitteeActions( iPersonnelCommitteeIDParam, iCurUserIDParam , sRemoteActionsParam )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];

	try
	{
		iPersonnelCommitteeIDParam = Int( iPersonnelCommitteeIDParam );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID кадрового кабинета";
		return oRes;
	}
	try
	{
		tePersonnelCommittee.Name;
	}
	catch( ex )
	{
		try
		{
			tePersonnelCommittee = OpenDoc( UrlFromDocID( iPersonnelCommitteeIDParam ) ).TopElem;
		}
		catch( ex )
		{
			oRes.error = 1;
			oRes.errorText = "Передан некорректный ID кадрового кабинета";
			return oRes;
		}
	}
	try
	{
		iCurUserIDParam = Int( iCurUserIDParam );
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Передан некорректный ID сотрудника";
		return oRes;
	}
	
	sWhere="$elem/catalog_name='personnel_committee'";
	if(sRemoteActionsParam!="")
	{
		sWhere = " MatchSome( $elem/id,( " + sRemoteActionsParam + " ) )"
	}
	
	try
	{
		xarrRemoteActions = tools.xquery("for $elem in remote_actions where "+sWhere+" return $elem")
		for( catRemoteActions in xarrRemoteActions )
		{
			oRAParams = {};
			sRAName = "";
			
			docRemoteAction = tools.open_doc(catRemoteActions.id.Value);
			curParams = {};
			if(docRemoteAction != undefined)
			{
				sRAName = docRemoteAction.TopElem.name.Value;
				tools_web.set_override_web_params(curParams, docRemoteAction.TopElem);
				for(fldVWarElem in docRemoteAction.TopElem.wvars)
				{
					oRAParams.SetProperty( fldVWarElem.name.Value, {name: fldVWarElem.name.Value, type: fldVWarElem.type.Value, value: curParams.GetOptProperty(fldVWarElem.name.Value)});
				}
				
				if(iPersonnelCommitteeIDParam != undefined)
				{
					oRAParams.SetProperty( "iCurObjectID", {name: "iCurObjectID", type: "foreign_elem", value: iPersonnelCommitteeIDParam});
				}
			}
			
			sName = Trim(catRemoteActions.name.Value);
			sName = StrRightRangePos(sName,(sName.lastIndexOf("/")+1));
			
			oCastOperation = {
				id: Random( 0, 99999999 ),
				name: sName,
				operation: catRemoteActions.code.Value,
				ra_id: catRemoteActions.id.Value,
				ra_name: sRAName,
				ra_params: EncodeJson(oRAParams)
			};
			
			oRes.array.push(oCastOperation);
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
 * @typedef {Object} oTutor
 * @property {bigint} id
 * @property {string} code - Код
 * @property {string} disp_name - Условное название
 * @property {string} name - Официальное название
*/
/**
 * @typedef {Object} ReturnTutors
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oTutor[]} array – Коллекция наставников.
*/

/**
 * @function GetTutors
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение списка наставников.
 * @param {bigint} iCurUserID ID текущего пользователя.
 * @param {string} sAccessType Тип доступа: "admin"/"manager"/"hr"/"observer"/"auto"
 * @param {string} iApplicationID ID приложения, по которому определяется доступ
 * @param {string} sXQueryQual строка для XQuery-фильтра
 * @param {Object} SCOPE_WVARS Объект с wvars
 * @param {oCollectionParam} oCollectionParams - Набор интерактивных параметров (отбор, сортировка, пейджинг)
 * @returns {ReturnTutors}
*/
function GetTutors( iCurUserID, sAccessType, iApplicationID, sXQueryQual, oCollectionParams )
{
	var oRes = tools.get_code_library_result_object();
	oRes.array = [];
	oRes.paging = oCollectionParams.paging;

	var arrConds = [];

	iCurUserID = OptInt( iCurUserID, 0);

	arrFilters = oCollectionParams.filters;

	if ( sXQueryQual != "" && sXQueryQual != null && sXQueryQual != undefined)
		arrConds.push(sXQueryQual);

	if ( sAccessType != "auto" && sAccessType != "admin" && sAccessType != "manager" && sAccessType != "hr" && sAccessType != "observer" )
		sAccessType = "auto";

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
			{
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
		case "reject":
			{
				arrConds.push("1 = 0");;
				break;
			}
	}

//фильтрация
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

	var sCondSort = " order by $elem/person_fullname ascending";
	if(ObjectType(oCollectionParams.sort) == 'JsObject' && oCollectionParams.sort.FIELD != null && oCollectionParams.sort.FIELD != undefined && oCollectionParams.sort.FIELD != "" )
	{
		switch(oCollectionParams.sort.FIELD)
		{
			case "name":
				sCondSort = " order by $elem/person_fullname" + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "") ;
				break;
			case "position_name":
				sCondSort = " order by $elem/person_position_name" + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "");
				break;
			case "subdivision_name":
				sCondSort = " order by $elem/person_subdivision_name" + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "");
				break;
			case "status_name":
				sCondSort = " order by $elem/status" + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "");
				break;
			case "career_reserve_type_name":
				sCondSort = " order by $elem/career_reserve_type_id" + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "");
				break;
			default:
				sCondSort = " order by $elem/" + oCollectionParams.sort.FIELD + (StrUpperCase(oCollectionParams.sort.DIRECTION) == "DESC" ? " descending" : "");
		}
	}
	
	var sConds = (ArrayOptFirstElem(arrConds) != undefined) ? " where " + ArrayMerge(arrConds, "This", " and ") : "";
	var sReqTutors = "for $elem in tutors" + sConds + sCondSort + " return $elem";
	var xarrTutorsAll = tools.xquery(sReqTutors);
	
	if(ObjectType(oCollectionParams.paging) == 'JsObject' && oCollectionParams.paging.SIZE != null)
	{
		oCollectionParams.paging.MANUAL = true;
		oCollectionParams.paging.TOTAL = ArrayCount(xarrTutorsAll);
		oRes.paging = oCollectionParams.paging;
		xarrTutorsAll = ArrayRange(xarrTutorsAll, OptInt(oCollectionParams.paging.INDEX, 0) * oCollectionParams.paging.SIZE, oCollectionParams.paging.SIZE);
	}

	var fStatus, fTalentReserve;
	for ( itemTutor in xarrTutorsAll )
	{
		fStatus = itemTutor.status.OptForeignElem;  
		fTalentReserve = itemTutor.career_reserve_type_id.OptForeignElem;  
		oElem = {
			id: itemTutor.id.Value,
			name: itemTutor.person_fullname.Value,
			status: itemTutor.status.Value,
			status_name: (fStatus != undefined ? fStatus.name.Value : ""),
			career_reserve_type: itemTutor.career_reserve_type_id.Value,
			career_reserve_type_name: (fTalentReserve != undefined ? fTalentReserve.name.Value : ""),
			position_name: itemTutor.person_position_name.Value,
			subdivision_name: itemTutor.person_subdivision_name.Value
		};
		
		oRes.array.push(oElem);
	}

	return oRes;
}


// ======================================================================================
// ==============================  Удаленные действия ===================================
// ======================================================================================



/**
 * @typedef {Object} oSimpleEntrisElem
 * @memberof Websoft.WT.TalentPool
 * @property {string} parent
 * @property {string} value 
*/
/**
 * @typedef {Object} oSimpleElem
 * @memberof Websoft.WT.TalentPool
 * @property {string} name
 * @property {string} value 
*/
/**
 * @typedef {Object} FormField
 * @memberof Websoft.WT.TalentPool
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
 * @memberof Websoft.WT.TalentPool
 * @property {string} name
 * @property {string} label 
 * @property {string} type 
*/
/**
 * @typedef {Object} WTLPEForm
 * @memberof Websoft.WT.TalentPool
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
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {WTLPEForm} result – результат
*/

/**
 * @typedef {Object} WTPersonnelReserveFormResult
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {string} message – Сообщение о выполнении
 * @property {boolean} reload – указание на перезагрузку страницы
*/

/**
 * @function SetPersonnelReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Добавить/Изменить кадровый резерв (резервиста).
 * @author BG
 * @param {?bigint} PersonnelReserveParam - Текущий кадровый резерв (ID или XmElem или Doc)
 * @param {?bigint} iCareerReserveTypeIDParam - ID типа кадрового резерва
 * @param {?string} iPersonIDParam - Сотрудник
 * @property {Object} oFormField - Параметры из формы  
 * @property {?oSimpleElem[]} Params - Дополнительные устанавливаемые атрибуты кадрового резерва  
 * @returns {WTPersonnelReserveFormResult}
*/
function SetPersonnelReserve(PersonnelReserveParam, iCareerReserveTypeIDParam, iPersonIDParam, oFormField, Params)
{
	var oRet = tools.get_code_library_result_object();
	oRet.message = "";
	oRet.reload = false;
	
	var iCurUserID = null;
	var bSendPersonNotificationOnCreate = false;
	var bSendHRNotificationOnChange = false;
	if(Params != undefined && Params != null && Params != "")
	{
		iCurUserID = Params.cur_user_id;
		bSendPersonNotificationOnCreate = Params.send_on_create;
		bSendHRNotificationOnChange = Params.send_on_change;
	}

	var bSendNotifi = false;
	var iPersonID = OptInt(iPersonIDParam)
	if(iPersonID == undefined)
	{
		if(oFormField != undefined && oFormField != null && oFormField != "")
		{
			iPersonID = OptInt(oFormField.GetOptProperty("person_id"));
			bSendNotifi = true;
		}
	}

	var iCareerReserveTypeID = OptInt(iCareerReserveTypeIDParam)
	if(iCareerReserveTypeID == undefined)
	{
		if(oFormField != undefined && oFormField != null && oFormField != "")
		{
			iCareerReserveTypeID = OptInt(oFormField.GetOptProperty("career_reserve_type_id"));
			bSendNotifi = bSendNotifi && true;
		}
	}

	var bDoSave = false;
	var bIsNew = false;
	if(PersonnelReserveParam != undefined && PersonnelReserveParam != null && PersonnelReserveParam != "")
	{
		try
		{
			var oName = PersonnelReserveParam.TopElem.Name;
			var docPersonnelReserve = PersonnelReserveParam;

			var tePersonnelReserve = docPersonnelReserve.TopElem;
			if(oName != 'personnel_reserve')
				throw StrReplace(StrReplace("Полученный ID: [{PARAM1}] не является ID кадрового резерва: [{PARAM2}]", "{PARAM1}", iPersonnelReserveID), "{PARAM2}", tePersonnelReserve.Name);
			
			iPersonID = tePersonnelReserve.person_id.Value
			bSendNotifi = true;
		}
		catch(e)
		{
			try
			{
				oName = PersonnelReserveParam.Name;
				tePersonnelReserve = PersonnelReserveParam;
				if(oName != 'personnel_reserve')
					throw StrReplace(StrReplace("Полученный ID: [{PARAM1}] не является ID кадрового резерва: [{PARAM2}]", "{PARAM1}", iPersonnelReserveID), "{PARAM2}", tePersonnelReserve.Name);
				
				var docPersonnelReserve = tePersonnelReserve.Doc;
				iPersonID = tePersonnelReserve.person_id.Value
				bSendNotifi = true;
			}
			catch(e)
			{
				var iPersonnelReserveID = OptInt(PersonnelReserveParam);
				if(iPersonnelReserveID != undefined)
				{
					var docPersonnelReserve = tools.open_doc(iPersonnelReserveID);
					if(docPersonnelReserve == undefined)
						throw StrReplace("Не удается открыть кадровый резерв с ID: [{PARAM1}]", "{PARAM1}", iPersonnelReserveID);
					
					var tePersonnelReserve = docPersonnelReserve.TopElem;
					if(tePersonnelReserve.Name != 'personnel_reserve')
						throw StrReplace(StrReplace("Полученный ID: [{PARAM1}] не является ID кадрового резерва: [{PARAM2}]", "{PARAM1}", iPersonnelReserveID), "{PARAM2}", tePersonnelReserve.Name);
					iPersonID = tePersonnelReserve.person_id.Value
					bSendNotifi = true;
				}
			}
		}
	}
	else if(iPersonID != undefined && iCareerReserveTypeID != undefined)
	{
		var xqPersonnelReserve = ArrayOptFirstElem(tools.xquery("for $elem in personnel_reserves where $elem/person_id=" + iPersonID + " and $elem/career_reserve_type_id=" + iCareerReserveTypeID + " and ($elem/status='in_reserve' or $elem/status='candidate') order by $elem/start_date descending return $elem/Fields('id')"))
		
		if(xqPersonnelReserve != undefined)
		{
			iPersonnelReserveID = xqPersonnelReserve.id.Value;
			var docPersonnelReserve = tools.open_doc(iPersonnelReserveID);
			var tePersonnelReserve = docPersonnelReserve.TopElem;
		}
		else
		{
			var docPersonnelReserve = tools.new_doc_by_name( "personnel_reserve", false );
			docPersonnelReserve.BindToDb();
			iPersonnelReserveID = docPersonnelReserve.DocID;
			var tePersonnelReserve = docPersonnelReserve.TopElem;
			tePersonnelReserve.career_reserve_type_id = iCareerReserveTypeID;
			tePersonnelReserve.person_id = iPersonID;
			tools.common_filling('collaborator', tePersonnelReserve.person_id.sd, iPersonID);
			tePersonnelReserve.status = 'candidate';
			tePersonnelReserve.start_date = Date();
			bIsNew = true;
			bDoSave = true;
		}
	}
	else
		throw "Не переданы параметры, позволяющие определить обрабатываемый объект";
	
	if(oFormField != undefined && oFormField != null && oFormField != "" && ObjectType(oFormField) == 'JsObject')
	{
		var sParamName, sParamValue, oFile, docResource;
		var iCurFM

		if(oFormField.HasProperty("career_reserve_type_id"))
		{
			var iFFCareerReserveTypeID = OptInt(oFormField.GetOptProperty("career_reserve_type_id"));
			if(iFFCareerReserveTypeID != undefined && iFFCareerReserveTypeID != tePersonnelReserve.career_reserve_type_id)
			{
				tePersonnelReserve.career_reserve_type_id = iFFCareerReserveTypeID;
			}
		}
		
		for(itemParam in oFormField)
		{
			sParamName = itemParam;
			sParamValue = oFormField.GetProperty(itemParam);
			
			switch(sParamName)
			{
				case "nomination_id":
					tePersonnelReserve.nomination_id = sParamValue;
					bDoSave = true;
					break;
				case "exclusion_reason_id":
					tePersonnelReserve.exclusion_reason_id = sParamValue;
					bDoSave = true;
					break;
				case "development_potential_id":
					tePersonnelReserve.development_potential_id = sParamValue;
					bDoSave = true;
					break;
				case "efficiency_estimation_id":
					tePersonnelReserve.efficiency_estimation_id = sParamValue;
					bDoSave = true;
					break;
				case "status":
					if(tePersonnelReserve.status != sParamValue)
					{
						sReqCheckSuccessor = "for $elem in successors where $elem/person_id=" + tePersonnelReserve.person_id + " some $kp in key_positions satisfies ($elem/key_position_id=$kp/id and $kp/career_reserve_type_id=" + tePersonnelReserve.career_reserve_type_id + ") return $elem";
						if(!bIsNew && ArrayOptFirstElem(tools.xquery(sReqCheckSuccessor)) != undefined)
						{
							oRet.error = 1;
							oRet.errorText = "Сотрудник является преемником на ключевую должность, поэтому изменить статус кадрового резерва нельзя";
							return oRet;
						}
						tePersonnelReserve.status = sParamValue;
						bDoSave = true;
					}
					break;
				case "talent_pool_func_managers":
					if(sParamValue != "")
					{
						for(itemFMID in sParamValue.split(";"))
						{
							iCurFM = OptInt(itemFMID);
							xFMItem = tePersonnelReserve.talent_pool_func_managers.ObtainChildByKey(iCurFM);
							tools.common_filling("collaborator", xFMItem, iCurFM);
							xFMItem.boss_type_id =(global_settings.ChildExists('curator_boss_type_id')?global_settings.curator_boss_type_id:null);
						}
						tePersonnelReserve.talent_pool_func_managers.DeleteChildren("ArrayOptFind(sParamValue.split(';'), 'OptInt(This) == ' + This.person_id.Value) == undefined");
						bDoSave = true;
					}
					else if(ArrayOptFirstElem(tePersonnelReserve.talent_pool_func_managers) != undefined)
					{
						tePersonnelReserve.talent_pool_func_managers.Clear();
						bDoSave = true;
					}
					break;
				case "start_date":
					tePersonnelReserve.start_date = sParamValue;
					bDoSave = true;
					break;
				case "include_reserve_date":
					tePersonnelReserve.include_reserve_date = sParamValue;
					bDoSave = true;
					break;
				case "finish_date":
					tePersonnelReserve.finish_date = sParamValue;
					bDoSave = true;
					break;
				case "comment":
					tePersonnelReserve.comment = sParamValue;
					bDoSave = true;
					break;
				case "file":
					if( DataType(sParamValue) == "object" && sParamValue.HasProperty("url") && sParamValue.url != "" )
					{
						docResource = OpenNewDoc( 'x-local://wtv/wtv_resource.xmd' );
						docResource.BindToDb();
						docResource.TopElem.person_id = iCurUserID;
						docResource.TopElem.put_data( sParamValue.url );
						docResource.TopElem.name = sParamValue.value;
						docResource.TopElem.file_name = sParamValue.value;
						docResource.Save();
						tePersonnelReserve.files.ObtainChildByKey(OptInt(docResource.DocID));
						bDoSave = true;
					}
					break;
			}
		}
	}
	
	if(tePersonnelReserve.status.Value == 'in_reserve' && !tePersonnelReserve.include_reserve_date.HasValue)
	{
		tePersonnelReserve.include_reserve_date = Date();
	}
		
	if(bDoSave)
	{
		docPersonnelReserve.Save();
		if(bSendNotifi)
		{
			if(!bIsNew && bSendHRNotificationOnChange)
			{
				var sendCurUser = ArrayOptFirstElem(XQuery("for $elem in collaborators where $elem/id=" + XQueryLiteral(OptInt(iCurUserID)) + " return $elem")) ;
				var oCurHR = tools.call_code_library_method("libSuccession", "get_hr_by_person", [tePersonnelReserve.person_id.Value]);
				
				tools.create_notification("succession_successor_change", oCurHR.id, "", 0, null, {OperatorName: (sendCurUser != undefined ? sendCurUser.fullname.Value: "***"), PersonnelReserveName: tePersonnelReserve.person_id.sd.fullname.Value});
			}
			
			if(bIsNew && bSendPersonNotificationOnCreate)
			{
				tools.create_notification("succession_reservist_inclusion", tePersonnelReserve.id.Value, "", null, tePersonnelReserve);
			}
		}
		
		oRet.message = bIsNew ? "Выбранный сотрудник включен в кадровый резерв" : "Информация о преемнике изменена";
		oRet.reload = true;
		return oRet;
	}
	else
		return oRet;
}

/**
 * @function AddChangePersonnelReserve 
 * @deprecated 2022.2 -- В функции реализована интерфейсная часть УД. Код перенесен в файл УД.
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Добавить/изменить кадровый резерв.
 * @author BG
 * @param {string} sFormCommand - Текущий режим удаленного действия
 * @param {string} sFormFields - JSON-строка с возвратом из формы УД
 * @param {bigint} iPersonnelReserveIDParam - ID кадрового резерва
 * @param {bool} bSendPersonNotificationOnCreate - Отправлять уведомления преемнику при добавлении преемника
 * @param {bool} bSendHRNotificationOnChange - Отправлять уведомления HR'у при изменении преемника
 * @param {bigint} iCurUserID - Текущий пользователь
 * @param {bigint} iCurCareerReserveTypeID - Контекстное значение типа кадрового резерва
 * @returns {WTLPEFormResult}
*/
function AddChangePersonnelReserve(sFormCommand, sFormFields, iPersonnelReserveIDParam, bSendPersonNotificationOnCreate, bSendHRNotificationOnChange, iCurUserID, iCurCareerReserveTypeID)
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
		
		var iPersonnelReserveID = OptInt(iPersonnelReserveIDParam);
		
		if(iPersonnelReserveID == undefined )
		{
			
			iPersonnelReserveID = OptInt(oFormField.GetOptProperty("cur_personnel_reserve_id"));
			
			if(iPersonnelReserveID != undefined )
			{
				arrFormFields.push({
							name: "cur_personnel_reserve_id",
							type: "hidden",
							value: iPersonnelReserveID
						});
			}
		}


		var docPersonnelReserve = null;
		var tePersonnelReserve = null;
		if(iPersonnelReserveID != undefined)
		{
			docPersonnelReserve = tools.open_doc(iPersonnelReserveID);
			
			if(docPersonnelReserve == undefined )
				throw StrReplace("Не найден объект с ID: [{PARAM1}]", "{PARAM1}", iPersonnelReserveID);
			
			tePersonnelReserve = docPersonnelReserve.TopElem;
			if(tePersonnelReserve.Name != 'personnel_reserve')
				throw StrReplace("Объект с ID: [{PARAM1}] не является преемником", "{PARAM1}", iPersonnelReserveID);
		}

		if(ArrayOptFirstElem( XQuery( "for $elem in func_managers where $elem/person_id = " + iCurUserID + " return $elem/Fields('id')" ) ) == undefined)
		{
			oRet.error = 503;
			oRet.errorText = "Не руководителю возможность изменения/добавления преемников недоступна.";
			oRet.result = close_form(oRet.errorText);
			return oRet;
		}
		
		var bCreateReserve = libParam.GetOptProperty("BossRights.bCreateReserve", true);
		if(!bCreateReserve && tePersonnelReserve == null)
		{
			oRet.error = 503;
			oRet.errorText = "Возможность создания преемников отключена в настройках.";
			oRet.result = close_form(oRet.errorText);
			return oRet;
		}
		var sNominationName = "";
		var sExclusionReasonName = "";
		var sDevelopmentPotentialName = "";
		var sEfficiencyEstimationName = "";
		if(tePersonnelReserve != null)
		{
			var Nomination = tePersonnelReserve.nomination_id.OptForeignElem
			sNominationName = Nomination == undefined ? "" : Nomination.name.Value;
 
			var ExclusionReason = tePersonnelReserve.exclusion_reason_id.OptForeignElem
			sExclusionReasonName = ExclusionReason == undefined ? "" : ExclusionReason.name.Value;

 			var DevelopmentPotential = tePersonnelReserve.development_potential_id.OptForeignElem
			sDevelopmentPotentialName = DevelopmentPotential == undefined ? "" : DevelopmentPotential.name.Value;

 			var EfficiencyEstimation = tePersonnelReserve.efficiency_estimation_id.OptForeignElem
			sEfficiencyEstimationName = EfficiencyEstimation == undefined ? "" : EfficiencyEstimation.name.Value;
		}
		
		var bChangeReserve = libParam.GetOptProperty("BossRights.bChangeReserve", true);
		var bIsReadOnly = (!bChangeReserve && tePersonnelReserve != null);

		var bChangeStatusReserve = libParam.GetOptProperty("BossRights.bChangeStatusReserve", true);
		var bChangeCuratorListReserve = libParam.GetOptProperty("BossRights.bChangeCuratorListReserve", true);

		var sNextStep = oFormField.GetOptProperty("step_next", "form");

		if(sFormCommand == "eval" || (sFormCommand == "submit_form" && sNextStep == "form"))
		{
			arrFormFields.push({name: "step_next", type: "hidden", value: "do"});
	
			if(tePersonnelReserve == null && iCurCareerReserveTypeID == undefined)
			{
				arrFormFields.push({name: "career_reserve_type_id", label: "Кадровый резерв", title: "Выберите элемент", type: "foreign_elem", mandatory: true, multiple: false, catalog: "career_reserve_type", column : 2}); 
			}
			else if(iCurCareerReserveTypeID != undefined)
			{
				arrFormFields.push({name: "career_reserve_type_id", type: "hidden", value: iCurCareerReserveTypeID}); 
				var sCareerReserveTypeName = ArrayOptFirstElem(tools.xquery("for $elem in career_reserve_types where $elem/id=" + iCurCareerReserveTypeID + " return $elem/Fields('name')"), {name: ""}).name;
				arrFormFields.push({name: "paragraph_career_reserve_type_id", type: "paragraph", value: "<b>Кадровый резерв:</b>&nbsp;" + sCareerReserveTypeName }); 
			}
			else
			{
				var CareerReserveType = tePersonnelReserve.career_reserve_type_id.OptForeignElem
				var sCareerReserveTypeName = CareerReserveType == undefined ? "" : CareerReserveType.name.Value;
				arrFormFields.push({name: "paragraph_career_reserve_type_id", type: "paragraph", value: "<b>Кадровый резерв:</b>&nbsp;" + sCareerReserveTypeName}); 
			}

			if(tePersonnelReserve == null)
			{
				arrFormFields.push({name: "person_id", label: "Сотрудник", title: "Выберите элемент", type: "foreign_elem", mandatory: true, multiple: false, catalog: "collaborator", column : 2}); 
			}
			else
			{
				arrFormFields.push({name: "paragraph_person_id", type: "paragraph", value: "<b>Сотрудник:</b>&nbsp;" + tePersonnelReserve.person_id.sd.fullname.Value}); 
			}

			if(!bIsReadOnly)
			{
				//arrFormFields.push({name: "nomination_id", label: "Способ выдвижения в резерв", title: "Выберите элемент", type: "foreign_elem", mandatory: false, multiple: false, catalog: "talent_pool_nomination", display_value: sNominationName, value: (tePersonnelReserve != null ? tePersonnelReserve.nomination_id.Value : null), column : 2}); 
				//arrFormFields.push({name: "exclusion_reason_id", label: "Основание для исключения", title: "Выберите элемент", type: "foreign_elem", multiple: false, catalog: "exclusion_reason", display_value: sExclusionReasonName, value: (tePersonnelReserve != null ? tePersonnelReserve.exclusion_reason_id.Value : null), column : 2}); 
				//arrFormFields.push({name: "development_potential_id", label: "Потенциал развития", title: "Выберите элемент", type: "foreign_elem", multiple: false, catalog: "development_potential", display_value: sDevelopmentPotentialName, value: (tePersonnelReserve != null ? tePersonnelReserve.development_potential_id.Value : null), column : 2}); 
				//arrFormFields.push({name: "efficiency_estimation_id", label: "Оценка эффективности", title: "Выберите элемент", type: "foreign_elem", multiple: false, catalog: "efficiency_estimation", display_value: sEfficiencyEstimationName, value: (tePersonnelReserve != null ? tePersonnelReserve.efficiency_estimation_id.Value : null), column : 2
				
				var arrTalentPoolNominationEntrys = ArrayExtract(XQuery("for $elem in talent_pool_nominations order by $elem/name return $elem/Fields('id','name')"), "({name:This.name.Value,value:This.id.Value})")
				arrFormFields.push({name: "nomination_id", label: "Способ выдвижения в резерв", type: "select", entries: arrTalentPoolNominationEntrys, value: (tePersonnelReserve != null ? tePersonnelReserve.nomination_id.Value : null), column : 2}); 
				
				var arrExclusionReasonEntrys = ArrayExtract(XQuery("for $elem in exclusion_reasons order by $elem/name return $elem/Fields('id','name')"), "({name:This.name.Value,value:This.id.Value})")
				arrFormFields.push({name: "exclusion_reason_id", label: "Основание для исключения",type: "select", entries: arrExclusionReasonEntrys, value: (tePersonnelReserve != null ? tePersonnelReserve.exclusion_reason_id.Value : null), column : 2}); 
				
				var arrDevelopmentPotentialEntrys = ArrayExtract(XQuery("for $elem in development_potentials order by $elem/name return $elem/Fields('id','name')"), "({name:This.name.Value,value:This.id.Value})")
				arrFormFields.push({name: "development_potential_id", label: "Потенциал развития", type: "select", entries: arrDevelopmentPotentialEntrys, value: (tePersonnelReserve != null ? tePersonnelReserve.development_potential_id.Value : null), column : 2}); 

				var arrEfficiencyEstimationEntrys = ArrayExtract(XQuery("for $elem in efficiency_estimations order by $elem/name return $elem/Fields('id','name')"), "({name:This.name.Value,value:This.id.Value})")
				arrFormFields.push({name: "efficiency_estimation_id", label: "Оценка эффективности", type: "select", entries: arrEfficiencyEstimationEntrys, value: (tePersonnelReserve != null ? tePersonnelReserve.efficiency_estimation_id.Value : null), column : 2}); 
			}
			else
			{
				arrFormFields.push({name: "paragraph_nomination_id", type: "paragraph", value: "<b>Способ выдвижения в резерв:</b>&nbsp;" + sNominationName }); 

				arrFormFields.push({name: "paragraph_exclusion_reason_id", type: "paragraph", value: "<b>Основание для исключения:</b>&nbsp;" + sExclusionReasonName }); 

				arrFormFields.push({name: "paragraph_development_potential_id", type: "paragraph", value: "<b>Потенциал развития:</b>&nbsp;" + sDevelopmentPotentialName }); 

				arrFormFields.push({name: "paragraph_efficiency_estimation_id", type: "paragraph", value: "<b>Оценка эффективности:</b>&nbsp;" + sEfficiencyEstimationName }); 
			}
			
			if(tePersonnelReserve == null || bChangeStatusReserve)
			{
				var oStatusField = { name: "status", label: "Статус", type: "select", value: (tePersonnelReserve != null ? tePersonnelReserve.status.Value: null), mandatory: false, entries: [], column: 2 };
				for( _status in common.personnel_reserve_status_types )
				{
					oStatusField.entries.push( { name: _status.name.Value, value: _status.id.Value } );
				}
				arrFormFields.push( oStatusField );
			}
			else if(tePersonnelReserve != null)
			{
				var fldSuccessorStatus = tePersonnelReserve.status.OptForeignElem;
				var sFormattedStatus = fldSuccessorStatus.bk_color.Value != "" ? '<span style="padding: 2px 5px; background-color: rgb(' + fldSuccessorStatus.bk_color.Value + ')">' + fldSuccessorStatus.name.Value + "</span>" : fldSuccessorStatus.name.Value;
				arrFormFields.push({name: "paragraph_status", type: "paragraph", value: "<b>Статус:</b>&nbsp;" + sFormattedStatus }); 
			}

			if(tePersonnelReserve == null || bChangeCuratorListReserve)
			{
				arrFormFields.push({name: "talent_pool_func_managers", label: "Кураторы", title: "Выберите элемент", type: "foreign_elem", multiple: true, catalog: "collaborator", display_value: (tePersonnelReserve != null ? ArrayMerge(tePersonnelReserve.talent_pool_func_managers, "This.person_fullname.Value", "|||") : ""), value: (tePersonnelReserve != null ? ArrayMerge(tePersonnelReserve.talent_pool_func_managers, "This.person_id.Value", ";") : "")}); 

			}
			else
			{
				arrFormFields.push({name: "paragraph_talent_pool_func_managers", type: "paragraph", value: (tePersonnelReserve != null ? "<b>Кураторы:</b><br>" + ArrayMerge(tePersonnelReserve.talent_pool_func_managers, "This.person_fullname.Value", "<br>") : "") }); 
			}
			
			if(!bIsReadOnly)
			{
				arrFormFields.push( { name: "start_date", label: "Дата получения статуса Кандидат", type: "date", value: (tePersonnelReserve != null ? tePersonnelReserve.start_date.Value : null), mandatory: false, column: 2 } );				

				arrFormFields.push( { name: "include_reserve_date", label: "Дата включения в резерв", type: "date", value: (tePersonnelReserve != null ? tePersonnelReserve.include_reserve_date.Value : null), mandatory: false, column: 2 } );				

				arrFormFields.push( { name: "finish_date", label: "Дата исключения из резерва", type: "date", value: (tePersonnelReserve != null ? tePersonnelReserve.finish_date.Value : null), mandatory: false, column: 2 } );				
			}
			else
			{
				arrFormFields.push({name: "paragraph_start_date", type: "paragraph", value: "<b>Дата получения статуса Кандидат:</b>&nbsp;" + tePersonnelReserve.start_date.Value}); 

				arrFormFields.push({name: "paragraph_include_reserve_date", type: "paragraph", value: "<b>Дата включения в резерв:</b>&nbsp;" + tePersonnelReserve.include_reserve_date.Value}); 

				arrFormFields.push({name: "paragraph_finish_date", type: "paragraph", value: "<b>Дата исключения из резерва:</b>&nbsp;" + tePersonnelReserve.finish_date.Value}); 
			}
			
			var arrHistoryOfCareerReserve =  (tePersonnelReserve != null && tePersonnelReserve.person_id.HasValue) ? tools.xquery("for $elem in career_reserves where $elem/person_id= " + tePersonnelReserve.person_id + " and $elem/personnel_reserve_id  = " + tePersonnelReserve.id + " and $elem/position_type!='adaptation' order by $elem/start_date return $elem") : [];
			if(ArrayOptFirstElem(arrHistoryOfCareerReserve) != undefined)
				arrFormFields.push({name: "paragraph_finish_date", type: "paragraph", value: "<b>История развития:</b><br>" + ArrayMerge(arrHistoryOfCareerReserve , "This.name.Value", "<br>"), column: 2 }); 

			var arrResume =  (tePersonnelReserve != null && tePersonnelReserve.person_id.HasValue) ? tools.xquery("for $elem in resumes where $elem/person_id=" + tePersonnelReserve.person_id.Value + " return $elem") : [];
			if(ArrayOptFirstElem(arrResume) != undefined)
				arrFormFields.push({name: "paragraph_finish_date", type: "paragraph", value: "<b>Резюме:</b><br>" + ArrayMerge(arrResume , "This.name.Value", "<br>"), column: 2 }); 

			if(tePersonnelReserve != null && ArrayOptFirstElem(tePersonnelReserve.recommendators) != undefined)
				arrFormFields.push({name: "paragraph_finish_date", type: "paragraph", value: "<b>Рекомендован сотрудниками:</b><br>" + ArrayMerge(tePersonnelReserve.recommendators , "This.person_fullname.Value", "<br>"), column: 2 }); 

			
			if(!bIsReadOnly)
			{
				arrFormFields.push( { name: "comment", label: "Комментарий", type: "string", value: (tePersonnelReserve != null ? tePersonnelReserve.comment.Value : null), mandatory: false } );				

				var arrHtmlFiles = [];
				var catFile;
				if(tePersonnelReserve != null)
				{
					for(itemFile in tePersonnelReserve.files)
					{
						catFile = itemFile.file_id.OptForeignElem;
						if(catFile != undefined)
						{
							arrHtmlFiles.push('<a href="/download_file.html?file_id=' + itemFile.file_id.Value + '">' + catFile.name.Value + '</a>');
						}
					}
				}
				
				arrFormFields.push({name: "paragraph_file_names", type: "paragraph", value: (ArrayOptFirstElem(arrHtmlFiles) != undefined ? "<b>Файлы:</b><br>" + ArrayMerge(arrHtmlFiles, "This", "<br>") : "") }); 
				
				arrFormFields.push({name: "file", label: "Добавить файл", title: "Добавить файл", type: "file" }); 
			}
			else
			{
				arrFormFields.push({name: "paragraph_comment", type: "paragraph", value: "<b>Комментарий:</b>&nbsp;" + tePersonnelReserve.comment.Value}); 
			}
			
			var sTitle = tePersonnelReserve != null ? "Редактировать" : "Добавить";
			var arrButtons = [];
			var oForm = {
				command: "display_form",
				title: sTitle,
				form_fields: arrFormFields,
				buttons: [{ name: "submit", label: "Сохранить", type: "submit" },{ name: "cancel", label: "Отменить", type: "cancel"}]
			};
			
			oRet.result = oForm;
		}
		else if(sFormCommand == "submit_form" && sNextStep == "do")
		{
			var oParam = {
				send_on_create: tools_web.is_true(bSendPersonNotificationOnCreate),
				send_on_change: tools_web.is_true(bSendHRNotificationOnChange),
				cur_user_id: iCurUserID
			}
			oRet.result = SetPersonnelReserve(docPersonnelReserve, null, null, oFormField, oParam);
		}
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = "Ошибка вызова удаленного действия \"AddChangePersonnelReserve\"\r\n" + err;
		oRet.result = close_form(oRet.errorText);
		toLog("ERROR: AddChangePersonnelReserve: " + oRet.errorText);
	}
	return oRet;
}

/**
 * @function SetStatusCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG

 * @description Установить статус этапу развития карьеры.
 * @author BG, PL
 * @param {bigint[]} aCareerReserveIDs - массив ID этапа развития карьеры
 * @param {string} sCommand - Текущий режим удаленного действия
 * @param {string} sFormFields - JSON-строка с возвратом из формы УД
 * @param {bigint} iCurUserID - Текущий пользователь
 * @param {Object} oScopeWvars - переменные удаленного действия
 * @param {string} sApplication код/ID приложения, по которому определяется доступ
 * @returns {WTLPEFormResult}
*/
function SetStatusCareerReserve( aCareerReserveIDs, sCommand, sFormFields, iCurUserID, oScopeWvars, sApplication )
{
	var oRet = {
		error: 0,
		result: {},
		errorText: ""
	};
	var arrFormFields = [];
	function merge_form_fields()
	{
		try
		{
			for( _field in oFormField )
			{
				if( ArrayOptFind( arrFormFields, "This.name == _field" ) == undefined )
				{
					arrFormFields.push( { name: _field, type: "hidden", value: oFormField.GetOptProperty( _field ) } );
				}
			}
		}
		catch( err ){}
	}
	try
	{
		if( ObjectType( oScopeWvars ) != "JsObject" )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		oScopeWvars = ({});
	}
	iCurUserID = OptInt(iCurUserID);
	try
	{	
		try
		{
			if( !IsArray( aCareerReserveIDs ) )
			{
				throw "error";
			}
		}
		catch( ex )
		{
			aCareerReserveIDs = new Array();
		}
		var oFormField = form_fields_to_object(sFormFields);
		
		//var iCareerReserveID = OptInt(iCareerReserveIDParam);
		
		if( ArrayOptFirstElem( aCareerReserveIDs ) == undefined )
		{
			iCareerReserveID = OptInt(oFormField.GetOptProperty("cur_career_reserve_id"));
			
			if(iCareerReserveID != undefined )
			{
				arrFormFields.push({
							name: "cur_career_reserve_id",
							type: "hidden",
							value: iCareerReserveID
						});
			}
			else
			{
				throw StrReplace("Некорректный ID объекта: [{PARAM1}]", "{PARAM1}", iCareerReserveIDParam);
			}
			aCareerReserveIDs.push( iCareerReserveID );
		}
		
		var arrDocCareerReserves = new Array();
		for( _id in aCareerReserveIDs )
		{
			docCareerReserve = tools.open_doc( _id );
			if( docCareerReserve != undefined )
			{
				arrDocCareerReserves.push( docCareerReserve );
			}
		}
		if( ArrayOptFirstElem( arrDocCareerReserves ) == undefined )
		{
			throw ( "Не выбрано ни одного объекта" );
		}
		/*var teCareerReserve = docCareerReserve.TopElem;
		if(teCareerReserve.Name != 'career_reserve')
			throw StrReplace("Объект с ID: [{PARAM1}] не является этапом развития карьеры", "{PARAM1}", iCareerReserveID);*/

		/*var arrAccessActionCode = GetAccessAction(iCareerReserveID, iCurUserID);
		var arrAccessActionPersonCode = GetAccessAction(teCareerReserve.person_id, iCurUserID);
		arrAccessActionCode = ArrayUnion(arrAccessActionCode, arrAccessActionPersonCode);
		var bEnableView = (ArrayOptFind(arrAccessActionCode, "This == 'career_reserve_see_status'") != undefined);
		var bEnableEdit = (ArrayOptFind(arrAccessActionCode, "This == 'career_reserve_change_status'") != undefined);
		
		var bIsBoss = tools.is_boss(iCurUserID, teCareerReserve.person_id.Value);
		var bIsTutor = (ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iCurUserID") != undefined);*/
		
		var sNextStep = oFormField.GetOptProperty("step_next", "form");
		
		var sState = oScopeWvars.GetOptProperty( "sState" );
		var sTaskState = oScopeWvars.GetOptProperty( "sTaskState" );
		var sSendNotificationType = oScopeWvars.GetOptProperty( "sSendNotificationType" );
		var sSendNotificationTypeFromForm = oFormField.GetOptProperty("send_notification_type", "");
		if ( sSendNotificationTypeFromForm != "" )
		{
			sSendNotificationType = sSendNotificationTypeFromForm;
		}
		var sSendType = oScopeWvars.GetOptProperty( "sSendType" );
		var sBasicNotificationType = oScopeWvars.GetOptProperty( "sBasicNotificationType" );
		var iCollaboratorNotificationID = OptInt( oScopeWvars.GetOptProperty( "iCollaboratorNotificationID" ) );
		var iTutorNotificationID = OptInt( oScopeWvars.GetOptProperty( "iTutorNotificationID" ) );
		var sCustomOption = oScopeWvars.GetOptProperty( "sCustomOption" );
		var sMessage = ArrayOptFirstElem( arrDocCareerReserves ).TopElem.position_type == "adaptation" ? "Изменение статуса адаптации сотрудника" : "Изменение статуса развития карьеры сотрудника";
		var sParagraph = ArrayCount( arrDocCareerReserves ) <= 2 ? ( ArrayMerge( arrDocCareerReserves, "This.TopElem.person_id.sd.fullname.Value", ", " ) ) : ( ArrayMerge( ArrayRange( arrDocCareerReserves, 0, 2 ), "This.TopElem.person_id.sd.fullname.Value", ", " ) + " и еще " + ( ArrayCount( arrDocCareerReserves ) - 2 ) )
		if(sCommand == "eval" || (sCommand == "submit_form" && sNextStep == "form"))
		{
			
			arrFormFields.push({
						name: "step_next",
						type: "hidden",
						value: "do"
					});
			arrFormFields.push({
						name: "paragraph",
						type: "paragraph",
						value: sParagraph
					});
			if( true )
			{
				switch( sState )
				{
					case "plan":
					case "active":
					case "failed":
					case "passed":
					case "cancel":
					case "auto":
						break;
					default:
					
						var oStatusField = {
							name: "status",
							label: "Выбор статуса",
							type: "select", 
							mandatory: true,
							value: "",
							entries: ArrayExtract(get_statuses_career_reserve(), "({name:This.name,value:This.id})")
							
						};
					
						arrFormFields.push( oStatusField );
						break;
				}
				switch( sTaskState )
				{
					case "current":
					case "failed":
					case "passed":
						break;
					default:
					
						var oTaskStatusField = {
							name: "task_status",
							label: "Статус задач",
							type: "select", 
							value: "current",
							mandatory: true,
							entries: [ { name: "Отметить выполненными", value: "passed" }, { name: "Отметить невыполненными", value: "failed" }, { name: "Оставить без изменений", value: "current" } ]
							
						};
					
						arrFormFields.push( oTaskStatusField );
						break;
				}
				switch( sSendNotificationType )
				{
					case "send":
					case "not_send":
						break;
					default:
					
						var oSendNotificationTypeField = {
							name: "send_notification_type",
							label: "Отправлять уведомления",
							type: "select", 
							value: "send",
							mandatory: true,
							entries: [ { name: "да", value: "send" }, { name: "нет", value: "not_send" } ]
							
						};
					
						arrFormFields.push( oSendNotificationTypeField );
						break;
				}
				switch( sSendNotificationType )
				{
					case "not_send":
						break;
					default:
						
						var oSendTypeField = {
							name: "send_type",
							label: "Адресаты",
							type: "list", 
							mandatory: true,
							value: ( sSendType == "" ? ["collaborator"] : tools_web.parse_multiple_parameter( sSendType ) ),
							entries: [ { name: "Сотрудник", value: "collaborator" }, { name: "Руководитель", value: "boss" }, { name: "Наставник", value: "tutor" } ]
							
						};
						if( sSendNotificationType != "send" )
						{
							oSendTypeField.SetProperty( "visibility", [{ parent: 'send_notification_type', value: 'send' }] )
						}
						arrFormFields.push( oSendTypeField );
						break;
				}
				
				
			}
			/*else if(bEnableView)
			{
				sMessage += 'Статус: "' + teCareerReserve.status.ForeignElem.name.Value + '"'; 
			}
			else 
			{
				sMessage += "Нет доступа к просмотру/изменению параметров этапа развития карьеры"; 
			}*/
		
			var oForm = {
				command: "display_form",
				title: "Сменить статус",
				message: sMessage,
				form_fields: arrFormFields,
				buttons: [{ name: "submit", label: "Выполнить", type: "submit" },{ name: "cancel", label: "Отменить", type: "cancel"}]
			};
			
			oRet.result = oForm;
		}
		else if( sCommand == "submit_form" && ( sNextStep == "do" || sNextStep == "notification" ) )
		{
			if( sNextStep == "do" )
			{
				switch( sSendNotificationType )
				{
					case "not_send":
						break;
					default:
						switch( sBasicNotificationType )
						{
							case "template":
								
								switch( sCustomOption )
								{
									case "with":
										arrFormFields.push({
											name: "paragraph",
											type: "paragraph",
											value: sParagraph
										});
										arrFormFields.push({
											name: "step_next",
											type: "hidden",
											value: "notification"
										});
										var oCustomTextField = {
											name: "custom_text",
											label: "Текст который будет добавлен к уведомлению",
											type: "text", 
											value: ""
										};
									
										arrFormFields.push( oCustomTextField );
										merge_form_fields();
										var oForm = {
											command: "display_form",
											title: "Сменить статус",
											message: sMessage,
											
											form_fields: arrFormFields,
											buttons: [{ name: "submit", label: "Выполнить", type: "submit" },{ name: "cancel", label: "Отменить", type: "cancel"}]
										};
										
										oRet.result = oForm;

										return oRet;
								}
								break;
							default:
								arrFormFields.push({
									name: "paragraph",
									type: "paragraph",
									value: sParagraph
								});
								arrFormFields.push({
											name: "step_next",
											type: "hidden",
											value: "notification"
										});
								arrFormFields.push( { name: "notification_subject", type: "string", label: "Тема уведомления", mandatory: true } );
								arrFormFields.push( { name: "notification_type", type: "combo", value: "plain", entries: [ { name: "Текст", value: "plain" }, { name: "HTML", value: "html" } ], label: "Тип уведомления",  mandatory: true } );
								arrFormFields.push( { name: "notification_body", label: "Сообщение уведомления", type: "text", mandatory: true  } );
								merge_form_fields();
								var oForm = {
									command: "display_form",
									title: "Сменить статус",
									message: sMessage,
									form_fields: arrFormFields,
									buttons: [{ name: "submit", label: "Выполнить", type: "submit" },{ name: "cancel", label: "Отменить", type: "cancel"}]
								};
								
								oRet.result = oForm;
								return oRet;
						}
				}
			}
			function send_notification( iNotificationID, iRecipientID )
			{
				if( sBasicNotificationType == "custom" )
				{
					var newNotif = OpenNewDoc('x-local://wtv/wtv_dlg_notification_template.xml').TopElem;
					newNotif.recipients.AddChild().recipient_type = 'in_doc';
					newNotif.body_type = sNotificationType;

					tools.create_template_notification( "0", iRecipientID, sNotificationSubject, sNotificationBody, null, newNotif, docCareerReserve.DocID );
					return 1;
				}
				else if( iNotificationID != undefined )
				{
					tools.create_notification( iNotificationID, iRecipientID, "", docCareerReserve.DocID, null, teCareerReserve );
					return 1;
				}
				return 0;
			}
			var sNotificationSubject = oFormField.GetOptProperty( "notification_subject" );
			var sNotificationBody = oFormField.GetOptProperty( "notification_body" );
			var sNotificationType = oFormField.GetOptProperty( "notification_type" );
			var iCount = 0;
			for( docCareerReserve in arrDocCareerReserves )
			{
				teCareerReserve = docCareerReserve.TopElem;
				if(sApplication == null || sApplication == undefined || sApplication == "")
				{
					arrAccessActionCode = GetAccessAction( docCareerReserve.DocID, iCurUserID );
					arrAccessActionPersonCode = GetAccessAction(teCareerReserve.person_id, iCurUserID);
					arrAccessActionCode = ArrayUnion(arrAccessActionCode, arrAccessActionPersonCode);
					bEnableView = (ArrayOptFind(arrAccessActionCode, "This == 'career_reserve_see_status'") != undefined);
					bEnableEdit = (ArrayOptFind(arrAccessActionCode, "This == 'career_reserve_change_status'") != undefined);
					
					bIsBoss = tools.is_boss(iCurUserID, teCareerReserve.person_id.Value);
					bIsTutor = (ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iCurUserID") != undefined);
					if( !bEnableEdit && !bIsBoss && !bIsTutor )
					{
						continue;
					}
				}
				switch( sState )
				{
					case "plan":
					case "active":
					case "failed":
					case "passed":
					case "cancel":
						teCareerReserve.status = sState;
						break;
					case "auto":
						teCareerReserve.status = ArrayOptFind( teCareerReserve.tasks, "This.status != 'passed' && This.status != 'cancel'" ) != undefined ? "failed" : "passed";
						break;
					default:
						teCareerReserve.status = oFormField.GetOptProperty( "status", "plan" );
						break;
				}
				switch( sTaskState )
				{
					case "failed":
					case "passed":
						for( _task in teCareerReserve.tasks )
						{
							if( _task.status == "plan" || _task.status == "active" )
							{
								_task.status = sTaskState;
							}
						}
						break;
				}
				bSendNotification = false;
				switch( sSendNotificationType )
				{
					case "send":
						bSendNotification = true;
						break;
				}
				docCareerReserve.Save();
				iCount++;
				if( bSendNotification )
				{
					
					sCustomText = oFormField.GetOptProperty( "custom_text", "" );
					aSendTypes = tools_web.parse_multiple_parameter( sSendType );
					switch( sSendNotificationType )
					{
						case "not_send":
							break;
						default:
							aSendTypes = tools_web.parse_multiple_parameter(oFormField.GetOptProperty( "send_type" ));
							break;
					}
					for( _recipient_type in aSendTypes )
					{
						switch( _recipient_type )
						{
							case "collaborator":
								send_notification( iCollaboratorNotificationID, teCareerReserve.person_id );
								break;
							case "tutor":
								for( _tutor in teCareerReserve.tutors )
								{
									send_notification( iTutorNotificationID, _tutor.PrimaryKey );
								}
								break;
							case "boss":
								for( _boss in tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ teCareerReserve.person_id, ['fact','func'], false, "", null, "", true, true, true, true ] ) )
								{
									send_notification( iTutorNotificationID, _boss.id );
								}
								break;
						}
					}
				}
			}
			oRet.result = close_form( StrReplace( StrReplace( "Выполнено изменений статуса: {PARAM1} из {PARAM2}", "{PARAM1}", iCount ), "{PARAM2}", ArrayCount( arrDocCareerReserves ) ), true );
		}
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = "Ошибка вызова удаленного действия \"SetCareerReserveStatus\"\r\n" + err;
		oRet.result = close_form(oRet.errorText);
		toLog("ERROR: SetStatusCareerReserve: " + oRet.errorText);
	}
	return oRet;
}

/**
 * @function SetStatusCareerReserveTask
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Установить статус задаче плана деятельности в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {string} sTaskID - ID задачи плана деятельности
 * @param {string} sCommand - Текущий режим удаленного действия
 * @param {string} sFormFields - JSON-строка с возвратом из формы УД
 * @param {bigint} iCurUserID - Текущий пользователь
 * @returns {WTLPEFormResult}
*/
function SetStatusCareerReserveTask(iCareerReserveIDParam, sTaskID, sCommand, sFormFields, iCurUserID)
{
	var oRet = {
		error: 0,
		result: {},
		errorText: ""
	};
	
	iCurUserID = OptInt(iCurUserID);
	try
	{	
		var iCareerReserveID = OptInt(iCareerReserveIDParam);
		
		if(iCareerReserveID == undefined )
			throw StrReplace("Некорректный ID объекта: [{PARAM1}]", "{PARAM1}", iCareerReserveIDParam);
		
		var docCareerReserve = tools.open_doc(iCareerReserveID);
		
		if(docCareerReserve == undefined )
			throw StrReplace("Не найден объект с ID: [{PARAM1}]", "{PARAM1}", iCareerReserveID);
		
		var teCareerReserve = docCareerReserve.TopElem;
		if(teCareerReserve.Name != 'career_reserve')
			throw StrReplace("Объект с ID: [{PARAM1}] не является этапом развития карьеры", "{PARAM1}", iCareerReserveID);
		
		sTaskID = Trim(sTaskID);
		
		if(sTaskID == "")
			throw "Не указан ID задачи плана деятельности";
		
		//var arrAllTasks = get_all_tasks_career_reserve(iCareerReserveIDParam);
		var arrAllTasks = teCareerReserve.tasks;
		var oRetTask = ArrayOptFind(arrAllTasks, "This.id == sTaskID");
		var curTask =  oRetTask == undefined ? null : oRetTask;

		if(curTask == null)
			throw StrReplace(StrReplace("В этапе развития карьеры с ID: [{PARAM1}] не найдена задача с ID: [{PARAM2}]", "{PARAM1}", iCareerReserveID), "{PARAM2}", sTaskID);

		var arrAccessActionCode = GetAccessAction(iCareerReserveID, iCurUserID);
		var arrAccessActionPersonCode = GetAccessAction(teCareerReserve.person_id, iCurUserID);
		arrAccessActionCode = ArrayUnion(arrAccessActionCode, arrAccessActionPersonCode);
		var bEnableEdit = (ArrayOptFind(arrAccessActionCode, "This == 'career_reserve_task_edit_status'") != undefined);
		
		var bIsBoss = tools.is_boss(iCurUserID, teCareerReserve.person_id.Value);
		var bIsTutor = (ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iCurUserID") != undefined);
		
		var sMessage = "";
		var arrFormFields = [{
					name: "step_next",
					type: "hidden",
					value: "do"
				}];
		if(bIsBoss || bIsTutor || bEnableEdit)
		{
			var oStausField = {
				name: "status",
				label: "Выбор статуса",
				type: "select", 
				value: curTask.status.Value,
				entries: ArrayExtract(get_statuses_career_reserve(), "({name:This.name,value:This.id})")
				
			};
			
			arrFormFields.push(oStausField);
		}
		else
		{
			sMessage += 'Статус: "' + curTask.status.ForeignElem.name.Value + '"'; 
		}
		
		switch(sCommand)
		{
			case "eval":
			{
				var oForm = {
					command: "display_form",
					title: "Сменить статус",
					message: sMessage,
					form_fields: arrFormFields,
					buttons: [{ name: "submit", label: "Сохранить", type: "submit" },{ name: "cancel", label: "Отменить", type: "cancel"}]
				};
				
				oRet.result = oForm;
				break
			}
			case "submit_form":
			{
				var oFormField = form_fields_to_object(sFormFields)
				curTask.status = oFormField.GetOptProperty("status", "plan");
				docCareerReserve.Save();
				oRet.result = close_form("Статус задачи плана деятельности этапа развития карьеры успешно обновлен", true);
				
				break
			}
		}
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = "Ошибка вызова удаленного действия \"SetCareerReserveStatus\"\r\n" + err;
		oRet.result = close_form(oRet.errorText);
		toLog("ERROR: SetStatusCareerReserve: " + oRet.errorText);
	}
	return oRet;
}

/**
 * @function ChangeCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Изменить этап развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint[]} arrObjectIDs - Массив ID сотрудников, выделенных для назначения общих настроек
 * @param {string} sCommand - Текущий режим удаленного действия
 * @param {string} sFormFields - JSON-строка с возвратом из формы УД
 * @param {bigint} iCurUserID - Текущий пользователь
 * @param {string} sTutorChoice Определяет способ выбора наставников – из общего списка сотрудников или из списка наставников
 * @param {boolean} bTutorHier  Если включен, то наставники отбираются с учетом иерархии подразделений, если выключен – строго по указанным подразделениям
 * @param {number} iHierLevel На сколько уровней вверх по иерархии смотрим
 * @param {string} sApplication код/ID приложения, по которому определяется доступ
 * @returns {WTLPEFormResult}
*/
function ChangeCareerReserve( iCareerReserveIDParam, arrObjectIDs, sCommand, sFormFields, iCurUserID, sTutorChoice, bTutorHier, iHierLevel, sApplication )
{
	var oRet = {
		error: 0,
		result: {},
		errorText: ""
	};
	var arrFormFields = [];
	
	iCurUserID = OptInt(iCurUserID);
	try
	{	
		var oFormField = form_fields_to_object(sFormFields);
		
		var iCareerReserveID = OptInt(iCareerReserveIDParam);
		
		if(iCareerReserveID == undefined )
		{
			iCareerReserveID = OptInt(oFormField.GetOptProperty("cur_career_reserve_id"));
			
			if(iCareerReserveID != undefined )
			{
				arrFormFields.push({
							name: "cur_career_reserve_id",
							type: "hidden",
							value: iCareerReserveID
						});
			}
			else
				throw StrReplace("Некорректный ID объекта: [{PARAM1}]", "{PARAM1}", iCareerReserveIDParam);
		}
		
		var docCareerReserve = tools.open_doc(iCareerReserveID);
		
		if(docCareerReserve == undefined )
			throw StrReplace("Не найден объект с ID: [{PARAM1}]", "{PARAM1}", iCareerReserveID);
		
		var teCareerReserve = docCareerReserve.TopElem;
		if(teCareerReserve.Name != 'career_reserve')
			throw StrReplace("Объект с ID: [{PARAM1}] не является этапом развития карьеры", "{PARAM1}", iCareerReserveID);

		var arrAccessActionCode = GetAccessAction(iCareerReserveID, iCurUserID);
		var arrAccessActionPersonCode = GetAccessAction(teCareerReserve.person_id, iCurUserID);
		arrAccessActionCode = ArrayUnion(arrAccessActionCode, arrAccessActionPersonCode);
		//var bEnableView = (ArrayOptFind(arrAccessActionCode, "This == 'career_reserve_see_status'") != undefined);
		//var bEnableEdit = (ArrayOptFind(arrAccessActionCode, "This == 'career_reserve_change_status'") != undefined);
		
		var bIsSelf = (iCurUserID == teCareerReserve.person_id.Value);
		var bIsBoss = !bIsSelf && tools.is_boss(iCurUserID, teCareerReserve.person_id.Value);
		var bIsTutor = (ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iCurUserID") != undefined);
		iHierLevel = OptInt( iHierLevel, 0 );
		bTutorHier = tools_web.is_true( bTutorHier );

		var teApplication = null;
		try
		{
			teApplication = tools_app.get_cur_application( sApplication );
		}
		catch (err) {}

		if (teApplication == null)
		{ // не приложение
			if(!(bIsTutor || bIsBoss || bIsSelf))
			{
				oRet.result = close_form("У Вас нет прав на изменение текущего этапа развития карьеры");
				return oRet;
			}
		}
		
		var sNextStep = oFormField.GetOptProperty("step_next", "form");
		
		var bInApplication = false;
		try
		{
			if( teApplication != null )
			{
				bInApplication = true;
			}
		}
		catch( ex ){}

		if (teApplication != null)
		{//приложение - делаем все поля доступными
			bIsSelf = true;
			bIsBoss = true;
			bIsTutor = true;
			bInApplication = true;
		}

		
		var xarrBossTypes = tools.xquery("for $elem in boss_types where MatchSome( $elem/code, ( 'talent_pool_tutor', 'talent_pool_task_tutor' ) ) return $elem/Fields('id','code')")
		var iTutorBossTypeID = ArrayOptFind( xarrBossTypes, "This.code == 'talent_pool_tutor'", {id: null} ).id;
		var iTutorTaskBossTypeID = ArrayOptFind( xarrBossTypes, "This.code == 'talent_pool_task_tutor'", {id: null} ).id;
		var arrTempArray;
		var xqLongListQuery = null;
		var sTutorQueryQual = "";
		if(sCommand == "eval" || (sCommand == "submit_form" && sNextStep == "form"))
		{
			switch( sTutorChoice )
			{
				case "tutor":
					var arrSubdivisionIds = new Array();
					feCareerReservePerson = teCareerReserve.person_id.OptForeignElem;
					if( feCareerReservePerson != undefined && feCareerReservePerson.position_parent_id.HasValue )
					{
						arrSubdivisionIds.push( feCareerReservePerson.position_parent_id );
						if( bTutorHier )
						{
							var iCountHierLevel = 0;
							var feSubdivision = feCareerReservePerson.position_parent_id.OptForeignElem;
							while( ( iHierLevel == 0 || iCountHierLevel < iHierLevel ) && feSubdivision != undefined )
							{
								iCountHierLevel++;
								arrSubdivisionIds.push( feSubdivision.id );
								if( feSubdivision.parent_object_id.HasValue )
								{
									feSubdivision = feSubdivision.parent_object_id.OptForeignElem;
								}
								else
								{
									break;
								}
								if( iCountHierLevel > 100 )
								{
									break;
								}
							}
						}
					}
					xqLongListQuery = XQuery( "for $elem in tutors where some $col in collaborators satisfies ( $elem/person_id = $col/id and ( $col/position_parent_id = null() " + ( ArrayOptFirstElem( arrSubdivisionIds ) != undefined ? " or MatchSome( $col/position_parent_id, ( " + ArrayMerge( arrSubdivisionIds, "This", "," ) + " ) )" : "" ) + " ) ) return $elem/Fields('person_id')" );
					sTutorQueryQual = "MatchSome( $elem/id, ( " + ArrayMerge( xqLongListQuery, "This.person_id", "," ) + " ) )";
					break;
				default:
					if( sApplication != null && sApplication != undefined && sApplication != "" )
					{
						if( true )
						{
							var iApplLevel = tools.call_code_library_method( "libApplication", "GetPersonApplicationAccessLevel", [ iPersonID, sApplication ] );

							if(iApplLevel >= 10) // Администратор приложения
							{
								sAccessType = "admin";
							}
							else if(iApplLevel >= 7) // администратор процесса
							{
								sAccessType = "manager";
							}
							else if(iApplLevel >= 5) // HR
							{
								sAccessType = "hr";
							}
							else if(iApplLevel >= 3) // методист
							{
								sAccessType = "expert";
							}
							else if(iApplLevel >= 1) // Наблюдатель
							{
								sAccessType = "observer";
							}
							else
							{
								sAccessType = "reject";
							}
						}
						
						switch( sAccessType )
						{
							case "hr":
							{
								var iAppHRManagerTypeID = tools.call_code_library_method("libApplication", "GetApplicationHRBossTypeID", [ sApplication, iPersonID ])
								xqLongListQuery = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iPersonID, ['func'], false, null, ['id'], '', true, true, true, true, (iAppHRManagerTypeID == null ? [] : [iAppHRManagerTypeID]) ], true );
								sTutorQueryQual = "MatchSome( $elem/id, ( " + ArrayMerge( xqLongListQuery, "This.id", "," ) + " ) )";
								break;
							}

						}
					}
					break;
			}
			
			if(IsArray(arrObjectIDs))
			{
				sTutorQueryQual = "";
				arrCollaboratorIDs = [];
				for(iObjectID in arrObjectIDs)
				{
					arrCollaboratorIDs.push(OptInt(iObjectID));
				}

				var arrCollaboratorExcludeIDs = ArrayExtract( XQuery( "for $elem in career_reserves where MatchSome( $elem/id, ( " + ArrayMerge( arrCollaboratorIDs, "This", "," ) + " ) ) return $elem/Fields('person_id')" ), "This.person_id.Value" );

				for(iCollaboratorExcludeID in arrCollaboratorExcludeIDs)
				{
					sSearchCond = "$elem/id != " + XQueryLiteral(iCollaboratorExcludeID);
					sTutorQueryQual += ( sTutorQueryQual == "" ? sSearchCond : " and "+sSearchCond )
				}
			}

			arrFormFields.push({name: "step_next", type: "hidden", value: "do"});
			if(bIsTutor)
			{
				arrFormFields.push({name: "start_date", label: "Дата включения", type: "date", value: teCareerReserve.start_date.Value});
				arrFormFields.push({name: "plan_readiness_date", label: "Дата планируемой готовности", type: "date", value: teCareerReserve.plan_readiness_date.Value});
				arrFormFields.push({name: "finish_date", label: "Дата фактической готовности", type: "date", value: teCareerReserve.finish_date.Value});
				if( !bInApplication )
				{
					arrFormFields.push({name: "status", label: "Выбор статуса", type: "select", value: teCareerReserve.status.Value, entries: ArrayExtract(get_statuses_career_reserve(), "({name:This.name,value:This.id})")});
				}
				
				if(teApplication == null && ArrayOptFirstElem(arrObjectIDs) != undefined)
				{
					for(iObjectID in arrObjectIDs)
					{
						sSearchCond = "$elem/id != " + XQueryLiteral(iObjectID);
						sTutorQueryQual += ( sTutorQueryQual == "" ? sSearchCond : " and "+sSearchCond )
					}
				}
				
				if( iTutorBossTypeID != null )
				{
					arrTempArray = ArraySelectByKey( teCareerReserve.tutors, iTutorBossTypeID, "boss_type_id" );
					arrFormFields.push({name: "tutors", label: "Ответственные наставники", title: "Выберите элемент", type: "foreign_elem", query_qual: sTutorQueryQual, multiple: true, catalog: "collaborator", display_value: ArrayMerge( arrTempArray, "This.person_fullname", "|||"), value: ArrayMerge( arrTempArray, "This.person_id", ";")}); 
				}
				if( iTutorTaskBossTypeID != null )
				{
					arrTempArray = ArraySelectByKey( teCareerReserve.tutors, iTutorTaskBossTypeID, "boss_type_id" );
					arrFormFields.push({
						name: "task_tutors", 
						label: "Наставники по задачам", 
						title: "Выберите элемент", 
						type: "foreign_elem", 
						catalog: "collaborator", 
						query_qual: sTutorQueryQual, 
						multiple: true, 						
						display_value: ArrayMerge( arrTempArray, "This.person_fullname", "|||"), 
						value: ArrayMerge( arrTempArray, "This.person_id", ";")
					}); 
				}
				arrFormFields.push({name: "forbid_tasks_edit", label: "Запретить изменение списка задач", type: "bool", value: teCareerReserve.forbid_tasks_edit.Value});
			}
			else if(bIsSelf)
			{
				arrFormFields.push({name: "finish_date", label: "Дата фактической готовности", type: "date", value: teCareerReserve.finish_date.Value});
				if( !bInApplication )
				{
					arrFormFields.push({name: "status", label: "Выбор статуса", type: "select", value: teCareerReserve.status.Value, entries: ArrayExtract(get_statuses_career_reserve(), "({name:This.name,value:This.id})")});
				}
			}
			else if(bIsBoss)
			{
				if( iTutorBossTypeID != null )
				{
					arrTempArray = ArraySelectByKey( teCareerReserve.tutors, iTutorBossTypeID, "boss_type_id" );
					arrFormFields.push({name: "tutors", label: "Ответственные наставники", title: "Выберите элемент", type: "foreign_elem", query_qual: sTutorQueryQual, multiple: true, catalog: "collaborator", display_value: ArrayMerge( arrTempArray, "This.person_fullname", "|||"), value: ArrayMerge( arrTempArray, "This.person_id", ";")}); 
				}
				if( iTutorTaskBossTypeID != null )
				{
					arrTempArray = ArraySelectByKey( teCareerReserve.tutors, iTutorTaskBossTypeID, "boss_type_id" );
					arrFormFields.push({name: "task_tutors", label: "Наставники по задачам", title: "Выберите элемент", type: "foreign_elem", query_qual: sTutorQueryQual, multiple: true, catalog: "collaborator", display_value: ArrayMerge( arrTempArray, "This.person_fullname", "|||"), value: ArrayMerge( arrTempArray, "This.person_id", ";")}); 
				}
			}
		
			// var sMessage =  "<>h2" + RValue(teCareerReserve.name) + "</h2>"
			var sMessage =  RValue(teCareerReserve.name)
			//sMessage +=  "<h4>" + curTask.type.ForeignElem.name.Value + "</h4>"
			var oForm = {
				command: "display_form",
				title: "Редактировать",
				height: 700,
				message: sMessage,
				form_fields: arrFormFields,
				buttons: [{ name: "submit", label: "Сохранить", type: "submit" },{ name: "cancel", label: "Отменить", type: "cancel"}]
			};
			
			oRet.result = oForm;
		}
		else if(sCommand == "submit_form" && sNextStep == "do")
		{
			var bDoSave = false
			if(oFormField.HasProperty("start_date"))
			{
				teCareerReserve.start_date = oFormField.GetOptProperty("start_date", Date());
				bDoSave = true;
			}

			if(oFormField.HasProperty("plan_readiness_date"))
			{
				teCareerReserve.plan_readiness_date = oFormField.GetOptProperty("plan_readiness_date", Date());
				bDoSave = true;
			}

			if(oFormField.HasProperty("finish_date"))
			{
				teCareerReserve.finish_date = oFormField.GetOptProperty("finish_date", Date());
				bDoSave = true;
			}

			if(oFormField.HasProperty("status"))
			{
				teCareerReserve.status = oFormField.GetOptProperty("status", "plan");
				bDoSave = true;
			}

			if(oFormField.HasProperty("forbid_tasks_edit"))
			{
				teCareerReserve.forbid_tasks_edit = tools_web.is_true(oFormField.GetOptProperty("forbid_tasks_edit", false));
				bDoSave = true;
			}

			if(oFormField.HasProperty("tutors") && oFormField.GetOptProperty("tutors", "") != "")
			{
				for(itemTutorID in oFormField.tutors.split(";"))
				{
					xTutorItem = teCareerReserve.tutors.ObtainChildByKey(OptInt(itemTutorID));
					tools.common_filling( 'collaborator', xTutorItem, xTutorItem.person_id );
					xTutorItem.boss_type_id = iTutorBossTypeID;
				}
				
				teCareerReserve.tutors.DeleteChildren("ArrayOptFind(oFormField.tutors.split(';'), 'OptInt(This) == ' + This.person_id.Value) == undefined && This.boss_type_id == iTutorBossTypeID" );
				bDoSave = true;
			}
			if(oFormField.HasProperty("task_tutors") && oFormField.GetOptProperty("task_tutors", "") != "")
			{
				for(itemTutorID in oFormField.task_tutors.split(";"))
				{
					xTutorItem = teCareerReserve.tutors.ObtainChildByKey(OptInt(itemTutorID));
					tools.common_filling( 'collaborator', xTutorItem, xTutorItem.person_id );
					xTutorItem.boss_type_id = iTutorTaskBossTypeID;
				}
				
				teCareerReserve.tutors.DeleteChildren("ArrayOptFind(oFormField.task_tutors.split(';'), 'OptInt(This) == ' + This.person_id.Value) == undefined && This.boss_type_id == iTutorTaskBossTypeID" );
				bDoSave = true;
			}

			if(bDoSave)
			{
				docCareerReserve.Save();
				oRet.result = close_form("Этап развития карьеры успешно обновлен", true);
			}
			else
				oRet.result = close_form(null, false);
				
		}
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = "Ошибка вызова удаленного действия \"ChangeCareerReserve\"\r\n" + err;
		oRet.result = close_form(oRet.errorText);
		toLog("ERROR: ChangeCareerReserve: " + oRet.errorText);
	}
	return oRet;
}

/**
 * @function AddDevelopmentProgramsToActionPlanCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Добавление типовых программ развития в план деятельности этапов развития карьеры.
 * @param {bigint[]} arrCareerReserveIDs - массив ID этапов развития карьеры
 * @param {bigint[]} arrTypicalProgramIDs - массив ID типовых программ развития
 * @param {oAddAdaptationParams} oParam - Параметры формирования этапа развития карьеры
 * @returns {WTLPEFormResult}
*/
function AddDevelopmentProgramsToActionPlanCareerReserve( arrCareerReserveIDs, arrTypicalProgramIDs, oParam )
{
//toLog("AddDevelopmentProgramsToActionPlanCareerReserve: oParam: " + EncodeJson(oParam), true)
	var oRes = tools.get_code_library_result_object();
	oRes.count = 0;

	if(!IsArray(arrTypicalProgramIDs) || ArrayOptFirstElem(arrTypicalProgramIDs) == undefined)
			arrTypicalProgramIDs = oParam.GetOptProperty("development_program_ids", null);
		
	try
	{
		if(!IsArray(arrCareerReserveIDs))
			throw "arrCareerReserveIDs не является коллекцией";
		
		iSampeCareerReserveID = OptInt(ArrayOptFirstElem(arrCareerReserveIDs));
		if(iSampeCareerReserveID == undefined)
			throw "arrCareerReserveIDs не содержит ID";
		
		sampleDoc = tools.open_doc(iSampeCareerReserveID);
		if(sampleDoc == undefined || sampleDoc.TopElem.Name != "career_reserve")
			throw "arrCareerReserveIDs не содержит ID этапов развития карьеры";

		var ApplicationParam = oParam.GetOptProperty("APPLICATION", null);
		var sDayType = "calendar"
		var sTDPMergeType = oParam.GetOptProperty("merge_type", "parallel");
		if(ApplicationParam != null)
		{
			var teApplication = tools_app.get_cur_application( ApplicationParam );
			if(teApplication != null)
			{
				if ( teApplication.wvars.GetOptChildByKey('day_type') != undefined && teApplication.wvars.GetOptChildByKey('day_type').value == "working" )
					sDayType = "working";

				if ( sTDPMergeType == 'by_application' )
				{
					if ( teApplication.wvars.GetOptChildByKey('merge_type') != undefined && teApplication.wvars.GetOptChildByKey('merge_type').value == "serial" )
						sTDPMergeType = "serial";
					else if ( teApplication.wvars.GetOptChildByKey('merge_type') != undefined && teApplication.wvars.GetOptChildByKey('merge_type').value == "parallel" )
						sTDPMergeType = "parallel";
				}					
			}
		}
		else
		{
			if(sTDPMergeType == 'by_application')
				sTDPMergeType = "serial";
		}
	
		var docAdaptation, teAdaptation, oRetAssign, catMaxEndDateTask, arrExistsTypicalDevelopmentProgram;
		var arrAllTasks, iFullCount;
		var arrSummaryTutors = [];
		var arrSummaryPerson = [];
		for(itemCareerReserveID in arrCareerReserveIDs)
		{
			docAdaptation = tools.open_doc(itemCareerReserveID);
			teAdaptation = docAdaptation.TopElem;
			
			arrExistsTypicalDevelopmentProgram = ArraySelectDistinct(ArrayExtract(ArraySelect(teAdaptation.tasks, "OptInt(This.typical_development_program_id) != undefined"), "This.typical_development_program_id.Value"));
			
			// Create tasks
			oRetAssign = tools.call_code_library_method( 'libTalentPool', 'AssignTypicalPrograms', [ itemCareerReserveID, teAdaptation, ArrayUnion(arrExistsTypicalDevelopmentProgram, arrTypicalProgramIDs), sTDPMergeType, sDayType, {bClearAllTasks: false, CanAddTasks: true, CanEditTasks: false, CanDeleteTasks: false} ] );
			if(oRetAssign.error != 0)
			{
				toLog("ERROR: call AssignTypicalPrograms in AddDevelopmentProgramsToActionPlanCareerReserve: " + itemPerson.name + "(" + itemPerson.id + "): " + oRetAssign.errorText);
				throw "call AssignTypicalPrograms: " + itemPerson.name + "(" + itemPerson.id + "): " + oRetAssign.errorText;
			}
			 
			if( !teAdaptation.plan_readiness_date.HasValue )
			{
				catMaxEndDateTask = ArrayOptMax( ArraySelect( teAdaptation.tasks, "This.plan_date.HasValue" ), "plan_date" );
				if( catMaxEndDateTask != undefined )
				{
					teAdaptation.plan_readiness_date = catMaxEndDateTask.plan_date;
				}
			}
			
			if(teAdaptation.autocalculate_readiness_percent)
			{
				arrAllTasks = ArraySelect(teAdaptation.tasks, "This.type != 'stage' && This.status != 'cancel'");
				iFullCount = ArrayCount(arrAllTasks);
				if(iFullCount != 0)
				{
					teAdaptation.readiness_percent = (ArrayCount(ArraySelect(arrAllTasks, "This.status != 'active' && This.status != 'plan'"))*100)/iFullCount;
				}
			}
			
			arrSummaryTutors = ArrayUnion(arrSummaryTutors, ArrayExtract(teAdaptation.tutors, "This.person_id.Value"));
			arrSummaryPerson.push(teAdaptation.person_id.Value);

			oRes.count++;
			docAdaptation.Save();
		}
		oParam.adaptation = teAdaptation

		// Send notification
		create_career_reserve_notification(ArraySelectDistinct(arrSummaryPerson), arrSummaryTutors, oParam)

	}
	catch(err)
	{
		oRes.error = 501;
		oRes.errorText = "ERROR: AddDevelopmentProgramsToActionPlanCareerReserve:\r\n" + err;
	}
	return oRes;
}

/**
 * @function ChangeTaskCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG, PL
 * @description Изменить задачу плана деятельности в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {string} sTaskID - ID задачи плана деятельности
 * @param {string} sCommand - Текущий режим удаленного действия
 * @param {string} sFormFields - JSON-строка с возвратом из формы УД
 * @param {bigint} iCurUserID - Текущий пользователь
 * @param {bool} bCheckAccessByTaskTutor - Проверять права доступа по наставнику в задаче, а не по наставникам всего этапа развития карьеры
 * @returns {WTLPEFormResult}
*/
function ChangeTaskCareerReserve(iCareerReserveIDParam, sTaskID, sCommand, sFormFields, iCurUserID, bCheckAccessByTaskTutor, sChangeCareerReserveTask, iNotificationIDTutor, bChangeTaskSendNotificationCollaborator, iNotificationIDCollaborator, bCanChangeAutoTask, oScopeWvars )
{
	var oRet = {
		error: 0,
		result: {},
		errorText: ""
	};

	iCurUserID = OptInt(iCurUserID);
	try
	{	
		try
		{
			if( ObjectType( oScopeWvars ) != "JsObject" )
			{
				throw "error";
			}
		}
		catch( ex )
		{
			oScopeWvars = ({});
		}
		try
		{
			if( sChangeCareerReserveTask == null || sChangeCareerReserveTask == undefined || sChangeCareerReserveTask == "" )
			{
				throw "error";
			}
		}
		catch( ex )
		{
			sChangeCareerReserveTask = "nobody";
		}
		try
		{
			bChangeTaskSendNotificationCollaborator = tools_web.is_true( bChangeTaskSendNotificationCollaborator );
		}
		catch( ex )
		{
			bChangeTaskSendNotificationCollaborator = false;
		}
		try
		{
			bCanChangeAutoTask = tools_web.is_true( bCanChangeAutoTask );
		}
		catch( ex )
		{
			bCanChangeAutoTask = false;
		}
		iNotificationIDCollaborator = OptInt( iNotificationIDCollaborator, "career_reserve_change_task_collaborator" );
		iNotificationIDTutor = OptInt( iNotificationIDTutor, "career_reserve_change_task_tutor" );
		var iCareerReserveID = OptInt(iCareerReserveIDParam);
		
		if(iCareerReserveID == undefined )
			throw StrReplace("Некорректный ID объекта: [{PARAM1}]", "{PARAM1}", iCareerReserveIDParam);
		
		var docCareerReserve = tools.open_doc(iCareerReserveID);
		
		if(docCareerReserve == undefined )
			throw StrReplace("Не найден объект с ID: [{PARAM1}]", "{PARAM1}", iCareerReserveID);
		
		var teCareerReserve = docCareerReserve.TopElem;
		if(teCareerReserve.Name != 'career_reserve')
			throw StrReplace("Объект с ID: [{PARAM1}] не является этапом развития карьеры", "{PARAM1}", iCareerReserveID);
		
		sTaskID = Trim(sTaskID);
		
		if(sTaskID == "")
			throw "Не указан ID задачи плана деятельности";
		
		//var arrAllTasks = get_all_tasks_career_reserve(iCareerReserveIDParam);
		var arrAllTasks = teCareerReserve.tasks;
		var oRetTask = ArrayOptFind(arrAllTasks, "This.id == sTaskID");
		var curTask =  oRetTask == undefined ? null : oRetTask;

		if(curTask == null)
			throw StrReplace(StrReplace("В этапе развития карьеры с ID: [{PARAM1}] не найдена задача с ID: [{PARAM2}]", "{PARAM1}", iCareerReserveID), "{PARAM2}", sTaskID);

		var bIsSelf = (iCurUserID == teCareerReserve.person_id.Value);
		//var bIsBoss = tools.is_boss(iCurUserID, teCareerReserve.person_id.Value);
		var bIsTutorCR = (ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iCurUserID") != undefined);
		if(tools_web.is_true(bCheckAccessByTaskTutor))
		{
			var bIsTutor = (curTask.tutor_id.Value == iCurUserID);
		}
		else
		{
			var bIsTutor = (ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iCurUserID") != undefined);
		}
		var sApplication = oScopeWvars.GetOptProperty( "sAPPLICATION", "" );
		if( sApplication != "" )
		{
			var curApplication = tools_app.get_cur_application( sApplication );
			var sAccessType = "";
			if( curApplication != null )
			{
				var iApplLevel = tools.call_code_library_method( "libApplication", "GetPersonApplicationAccessLevel", [ iCurUserID, curApplication.id ] );

				if(iApplLevel >= 10) // Администратор приложения
					sAccessType = "admin";
				else if(iApplLevel >= 7) // администратор процесса
					sAccessType = "manager";
				else if(iApplLevel >= 5) // HR
					sAccessType = "hr";
				else if(iApplLevel >= 3) // методист
					sAccessType = "expert";
				else if(iApplLevel >= 2) // наставник
					sAccessType = "tutor";
				else if(iApplLevel >= 1) // Наблюдатель
					sAccessType = "observer";
				else
					sAccessType = "reject";
			}
			switch( sAccessType )
			{
				case "admin":
				case "manager":
					break;
				case "hr":
				{
					var iAppHRManagerTypeID = tools.call_code_library_method("libApplication", "GetApplicationHRBossTypeID", [ sApplication, iCurUserID ])
					xqLongListQuery = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], false, null, ['id'], '', true, true, true, true, (iAppHRManagerTypeID == null ? [] : [iAppHRManagerTypeID]) ], true );
					if( ArrayOptFindByKey( sTutorQueryQual, teCareerReserve.person_id, "id" ) == undefined )
					{
						oRet.result = close_form("У Вас нет прав на добавление задач к этому этапу развития карьеры");
						return oRet;
					}
					break;
				}
				case "tutor":
				{
					if(!bIsTutor)
					{
						oRet.result = close_form("У Вас нет прав на добавление задач к этому этапу развития карьеры");
						return oRet;
					}
					break;
				}
				default:
				{
					oRet.result = close_form("У Вас нет прав на добавление задач к этому этапу развития карьеры");
					return oRet;
				}
			}
		}
		else
		{
			if(!bIsTutor && !bIsSelf && !bIsTutorCR)
			{
				oRet.result = close_form("У Вас нет прав на изменение этой задачи");
				return oRet;
			}
		}
		
		
		arrTutorIDs = ArrayExtract(teCareerReserve.tutors, "OptInt(This.person_id)")

		if(tools_web.is_true(curTask.forbid_task_portal_edit.Value))
		{
			oRet.result = close_form("Редактирование этой задачи запрещено в настройках задачи");
			return oRet;
		}

		if(tools_web.is_true(teCareerReserve.forbid_tasks_edit.Value))
		{
			oRet.result = close_form("В данном этапе развития карьеры редактирование задач запрещено настройками");
			return oRet;
		}

		if( bIsSelf && !bCanChangeAutoTask )
		{
			switch( curTask.type )
			{
				case "learning":
				case "task":
				case "education_method":
				case "compound_program":
				case "test_learning":
				case "learning_task":
				case "poll":
					oRet.result = close_form( "Статус этой задачи обновляется автоматически, сообщать о нем не нужно" );
					return oRet;
				case "document_learning":
					if( curTask.type_document == "library_material" )
					{
						oRet.result = close_form( "Статус этой задачи обновляется автоматически, сообщать о нем не нужно" );
						return oRet;
					}
			}
		}

		var arrAccessActionCode = GetAccessAction(iCareerReserveID, iCurUserID);
		var arrAccessActionPersonCode = GetAccessAction(teCareerReserve.person_id, iCurUserID);
		arrAccessActionCode = ArrayUnion(arrAccessActionCode, arrAccessActionPersonCode);
		
		var arrMessage = [];
		var arrNoAccess = [];
		var oFormField = form_fields_to_object(sFormFields);
		if( !oFormField.HasProperty("step_next") )
		{
			sCommand = "eval";
		}
		var arrFormFields = [{name: "step_next", type: "hidden", value: "do"}];
		
		arrFormFields.push({name: "task_id", type: "hidden", value: sTaskID});
		
		// ID наставника - curTask.tutor_id.Value
		sQuery_qual = " MatchSome($elem/person_id, (" + ArrayMerge(arrTutorIDs, "This", ",") + ")) ";
		
		var arrTaskResourceIDs = ArrayExtract(curTask.files, "This.file_id.Value");
		
		var arrResourceIDs = new Array()
		var arrResourceLabels = new Array()
		var arrResourceLinks = new Array()

		for (iResourceID in arrTaskResourceIDs)
		{
			docResource = tools.open_doc( iResourceID );
			docResourceTE = docResource.TopElem

			arrResourceIDs.push(iResourceID)
			arrResourceLabels.push(docResourceTE.name.Value)
			arrResourceLinks.push('<a href="/download_file.html?file_id=' + iResourceID + '" target="_blank">' + docResourceTE.name.Value + '</a>');
		}
		
		// количество ссылок на файлы для текущего наставника
		iFilesCount = ArrayCount(arrResourceLinks)

		if(bIsTutor || sApplication != "")
		{
			arrFormFields.push({name: "start_date", label: "Дата начала", type: "date", value: curTask.start_date.Value, column: ( sApplication == "" ? 2 : 1 )});
			arrFormFields.push({name: "plan_date", label: "Дата выполнения", type: "date", value: curTask.plan_date.Value, column: ( sApplication == "" ? 2 : 1 )});
			arrFormFields.push({name: "fact_date", label: "Фактическая дата выполнения", type: "date", value: curTask.fact_date.Value, column: ( sApplication == "" ? 2 : 1 )});
			//arrFormFields.push({name: "start_edit_date", label: "Дата начала редактирования", type: "date", value: curTask.start_edit_date.Value, column: ( sApplication == "" ? 2 : 1 )});
			arrFormFields.push({name: "status", label: "Статус", type: "select", value: curTask.status.Value, entries: ArrayExtract(get_statuses_career_reserve(), "({name:This.name,value:This.id})"), column: ( sApplication == "" ? 2 : 1 )});
			arrFormFields.push({name: "score", label: "Оценка", type: "real", value: curTask.score.Value, column: ( sApplication == "" ? 2 : 1 )});
			arrTutors = get_tutors_career_reserve_for_select_entryes(iCareerReserveID, docCareerReserve);
			if( ArrayOptFirstElem( arrTutors ) != undefined )
			{
				arrFormFields.push({name: "tutor_id", label: "Наставник по задаче", type: "select", entries: arrTutors, value: curTask.tutor_id.Value, column: ( sApplication == "" ? 2 : 1 )});
			}
			arrFormFields.push({name: "desc", label: "Описание задачи", type: "text", value: curTask.desc.Value});
			arrFormFields.push({name: "tutor_comment", label: "Комментарий наставника", type: "text", value: curTask.tutor_comment.Value});
			
			if( curTask.person_comment.HasValue )
			{
				arrFormFields.push( {name: "person_comment_paragraph", label: "file", type: "paragraph", value: "<b>Комментарий сотрудника:</b><br>\r\n" + curTask.person_comment } );
			}
			
			if(curTask.status.Value != 'active'){
				arrFormFields.push({ 
					name: "resources", 
					label: "Файлы", 
					type: "foreign_elem", 
					catalog: "resource", 
					multiple: true, 
					query_qual: sQuery_qual, 
					value: ArrayMerge(arrResourceIDs, "OptInt(This)", ";"), 
					display_value: ArrayMerge(arrResourceLabels, "This", "|||"), 
					title: "Выберите файл(ы)" 
				});
			}
			
			if(curTask.status.Value == 'active'){
				if(iFilesCount > 0){
					arrFormFields.push({name: "file_title", label: "file", type: "paragraph", value: "<b>Список прикрепленных файлов:</b><br>\r\n", column: ( sApplication == "" ? 2 : 1 )});
					for(link in arrResourceLinks){
						arrFormFields.push({name: "file_title", label: "file", type: "paragraph", value: link, column: ( sApplication == "" ? 2 : 1 )});
					}
				}
			}
			
			if(curTask.status.Value != 'active'){			
				arrFormFields.push({ name: "fld_resource", label: "Загрузить файл", type: "file" })
			}
		}
		else if(bIsTutorCR)
		{
			arrTutors = get_tutors_career_reserve_for_select_entryes(iCareerReserveID, docCareerReserve)
			if( ArrayOptFirstElem( arrTutors ) != undefined )
			{
				arrFormFields.push({name: "tutor_id", label: "Наставник по задаче", type: "select", entries: arrTutors, value: curTask.tutor_id.Value, column: ( sApplication == "" ? 2 : 1 )});
			}
			arrFormFields.push({ name: "fld_resource", label: "Загрузить файл", type: "file" })
		}
		else if(bIsSelf)
		{
			arrFormFields.push({name: "paragraph_desc", type: "paragraph", value: "<b>Описание:</b><br>\r\n" + curTask.desc.Value }); 
			arrFormFields.push({name: "person_comment", label: "Комментарий сотрудника", type: "text", value: curTask.person_comment.Value});
			if( curTask.tutor_comment.HasValue )
			{
				arrFormFields.push( {name: "tutor_comment_paragraph", label: "file", type: "paragraph", value: "<b>Комментарий наставника:</b><br>\r\n" + curTask.tutor_comment } );
			}
			
			if(curTask.status.Value == 'active'){

				if(iFilesCount > 0){
					arrFormFields.push({name: "file_title", label: "file", type: "paragraph", value: "<b>Список прикрепленных файлов:</b><br>\r\n", column: ( sApplication == "" ? 2 : 1 )});
					for(link in arrResourceLinks){
						arrFormFields.push({name: "file_title", label: "file", type: "paragraph", value: link, column: ( sApplication == "" ? 2 : 1 )});
					}
				}
			}
		}

		var sMessage =  curTask.name.Value;
		sMessage +=  " - " + curTask.type.ForeignElem.name.Value
		switch(sCommand)
		{
			
			case "eval":
			{
				var oForm = {
					command: "display_form",
					title: "Изменить задачу",
					message: sMessage,
					height: 500,
					form_fields: arrFormFields,
					buttons: []
				};
				if(ArrayOptFirstElem(arrFormFields) != undefined)
					oForm.buttons.push({ name: "submit", label: "Сохранить", type: "submit" });
				
				oForm.buttons.push({ name: "cancel", label: "Отменить", type: "cancel"});
				
				oRet.result = oForm;
				break
			}
			case "submit_form":
			{
				var bDoSave = false
				if(oFormField.HasProperty("name"))
				{
					curTask.name = oFormField.GetOptProperty("name", "");
					bDoSave = true;
				}
				
				if(oFormField.HasProperty("start_date"))
				{
					curTask.start_date = oFormField.GetOptProperty("start_date", "");
					bDoSave = true;
				}
				
				if(oFormField.HasProperty("plan_date"))
				{
					curTask.plan_date = oFormField.GetOptProperty("plan_date", null);
					bDoSave = true;
				}
				
				if(oFormField.HasProperty("fact_date"))
				{
					curTask.fact_date = oFormField.GetOptProperty("fact_date", null);
					bDoSave = true;
				}
				
				if(oFormField.HasProperty("start_edit_date"))
				{
					curTask.start_edit_date = oFormField.GetOptProperty("start_edit_date", null);
					bDoSave = true;
				}
				
				if(oFormField.HasProperty("score"))
				{
					curTask.score = oFormField.GetOptProperty("score", null);
					bDoSave = true;
				}
				
				if(oFormField.HasProperty("status"))
				{
					var sOldStatus = curTask.status.Value;
					curTask.status = oFormField.GetOptProperty("status", "plan");
					if ( sOldStatus != curTask.status && !IsEmptyValue(RValue(curTask.parent_task_id)))
					{
						oParentTask = ArrayOptFind(teCareerReserve.tasks, "This.id == curTask.parent_task_id");
						arrTasksForParentTask = ArraySelect(teCareerReserve.tasks, "This.parent_task_id == oParentTask.id");
						
						arrFailedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'failed'");
						arrPassedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'passed'");
						
						if (ArrayOptFirstElem(arrFailedTasks) != undefined)
						{
							oParentTask.status = 'failed';
						}
						else if (ArrayCount(arrPassedTasks) == ArrayCount( arrTasksForParentTask ))
						{
							oParentTask.status = 'passed';
						}
						else
						{
							if (Date(oParentTask.start_date) < Date())
								oParentTask.status = 'active';
						}
					}
					bDoSave = true;
				}
				
				if(oFormField.HasProperty("tutor_id"))
				{
					curTask.tutor_id = oFormField.GetOptProperty("tutor_id", null);
					bDoSave = true;
				}
				
				if(oFormField.HasProperty("desc"))
				{
					curTask.desc = oFormField.GetOptProperty("desc", "");
					bDoSave = true;
				}
				
				if(oFormField.HasProperty("person_comment"))
				{
					curTask.person_comment = oFormField.GetOptProperty("person_comment", "");
					bDoSave = true;
				}
				
				if(oFormField.HasProperty("tutor_comment"))
				{
					curTask.tutor_comment = oFormField.GetOptProperty("tutor_comment", "");
					bDoSave = true;
				}
				
				if(oFormField.HasProperty("resources"))
				{
					sResourcesIDs = oFormField.GetOptProperty("resources", "")
					arrResourcesIDs = ArrayExtract(ArraySelect(sResourcesIDs.split(";"), "OptInt(This) != undefined"), "OptInt(This)")

					for (iFileID in arrTaskResourceIDs)
					{
						docFile = tools.open_doc(iFileID)
						if (docFile == undefined)
							throw "Не удалось открыть файл по указанному ID";
							
						oDocFileTE = docFile.TopElem

						// удаление следов в файле
						for (oLink in oDocFileTE.links)
						{
							if(oLink.object_catalog == 'task' && oLink.object_id.Value == iCareerReserveID){
								//Удаляем запись о таске у файла
								oDocFileTE.links.DeleteChildByKey(iCareerReserveID);
								
								// перерасчет количества Ссылок на файл(use_count)
								oDocFileTE.use_count = ArrayCount(oDocFileTE.links)
								docFile.Save();
							}
						}
					}
					
					curTask.files.Clear()
					
					// создаем список файлов 
					for (iResourceID in arrResourcesIDs)
					{
						docResource = tools.open_doc( iResourceID )
						docResourceTE = docResource.TopElem
						
						TaskFiles = curTask.files.AddChild()
						TaskFiles.file_id = iResourceID
						
						links = docResourceTE.links.AddChild()
						links.object_id = iCareerReserveID 
						links.object_catalog = 'task'
						links.object_name = curTask.name
						links.date_modify = Date()
						
						docResource.Save()
					}

					bDoSave = true;
				}
				
				if(oFormField.HasProperty("fld_resource"))
				{
					oResourceData = oFormField.GetOptProperty("fld_resource", "")

					if(oResourceData.value != "" && oResourceData.url != ""){
						oLibRes = tools.call_code_library_method("libPortal", "CreateResource", [ iCurUserID, oResourceData ]);

						docResource = tools.open_doc( oLibRes.fileID )
						docResourceTE = docResource.TopElem
						
						TaskFiles = curTask.files.AddChild()
						TaskFiles.file_id = oLibRes.fileID
						
						links = docResourceTE.links.AddChild()
						links.object_id = iCareerReserveID 
						links.object_catalog = 'task'
						links.object_name = curTask.name
						links.date_modify = Date()
						
						docResource.Save()
					}

					bDoSave = true;
				}

				if(bDoSave)
				{
					docCareerReserve.Save();
					oRet.result = close_form("Задача плана деятельности этапа развития карьеры успешно обновлена", true);
				}
				else
					oRet.result = close_form(null, false);
				
				if( bIsSelf )
				{
					if( oFormField.GetOptProperty("person_comment", "") != "" && iNotificationIDTutor != undefined )
					{
						/* Уведомление наставника об изменении задачи развития карьеры сотрудником - career_reserve_change_task_tutor*/
						switch( sChangeCareerReserveTask )
						{
							case "tutor":
								if( curTask.tutor_id.HasValue )
								{
									//tools.create_notification( iNotificationIDTutor, curTask.tutor_id, "", iCareerReserveID, null, docCareerReserve.TopElem );
									tools.create_notification( iNotificationIDTutor, curTask.tutor_id, "", iCareerReserveID, null, curTask );
								}
								else
								{
									for( _tutor in docCareerReserve.TopElem.tutors )
									{
										if(_tutor.boss_type_id == 5703809445382982252) // наставник
										{
											//tools.create_notification( iNotificationIDTutor, _tutor.PrimaryKey, "", iCareerReserveID, null, docCareerReserve.TopElem );
											tools.create_notification( iNotificationIDTutor, _tutor.PrimaryKey, "", iCareerReserveID, null, curTask );
										}
									}
								}
								break;
							case "task_tutor":
								if( curTask.tutor_id.HasValue )
								{
									//tools.create_notification( iNotificationIDTutor, curTask.tutor_id, "", iCareerReserveID, null, docCareerReserve.TopElem );
									tools.create_notification( iNotificationIDTutor, curTask.tutor_id, "", iCareerReserveID, null, curTask );
								} else {
									for( _tutor in docCareerReserve.TopElem.tutors )
									{
										if(_tutor.boss_type_id == 5703809445382982359) // наставник по задаче
										{
											//tools.create_notification( iNotificationIDTutor, _tutor.PrimaryKey, "", iCareerReserveID, null, docCareerReserve.TopElem );
											tools.create_notification( iNotificationIDTutor, _tutor.PrimaryKey, "", iCareerReserveID, null, curTask );
										}
									}
								}
								break;
							case "all_tutor":
								for( _tutor in docCareerReserve.TopElem.tutors )
								{
									//tools.create_notification( iNotificationIDTutor, _tutor.PrimaryKey, "", iCareerReserveID, null, docCareerReserve.TopElem );
									tools.create_notification( iNotificationIDTutor, _tutor.PrimaryKey, "", iCareerReserveID, null, curTask );
								}
								break;
						}
					}
				}
				else if( bChangeTaskSendNotificationCollaborator )
				{
					/* Уведомление сотрудника об изменении задачи развития карьеры наставником - career_reserve_change_task_collaborator */					
					if( curTask.tutor_id.HasValue )
					{
						tools.create_notification( iNotificationIDCollaborator, docCareerReserve.TopElem.person_id, "", iCareerReserveID, null, curTask );
					}
				}
				break
			}
		}
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = "Ошибка вызова удаленного действия \"ChangeTaskCareerReserve\"\r\n" + err;
		oRet.result = close_form(oRet.errorText);
		toLog("ERROR: ChangeTaskCareerReserve: " + oRet.errorText);
	}
	return oRet;
}

/**
 * @function AddTaskCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Добавить задачу плана деятельности в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {string} sCommand - Текущий режим удаленного действия
 * @param {string} sFormFields - JSON-строка с возвратом из формы УД
 * @param {bigint} iCurUserID - Текущий пользователь
 * @param {Object} oScopeWvars - переменные удаленного действия
 * @returns {WTLPEFormResult}
*/
function AddTaskCareerReserve(iCareerReserveIDParam, sCommand, sFormFields, iCurUserID, oScopeWvars )
{
	var oRet = {
		error: 0,
		result: {},
		errorText: ""
	};
	function merge_form_fields()
	{
		try
		{
			var oResourceData;
			for( _field in oFormField )
			{
				if( ArrayOptFind( arrFormFields, "This.name == _field" ) == undefined )
				{
					if( _field == "fld_resource" )
					{
						oResourceData = oFormField.GetOptProperty( "fld_resource", null );
						if(oResourceData != null && DataType(oFormField.fld_resource) != 'object')
							oResourceData = null
						if(oResourceData != null && oResourceData.GetOptProperty("url", "") != "")
						{
							oLibRes = tools.call_code_library_method("libPortal", "CreateResource", [ iCurUserID, oResourceData ]);
							arrFormFields.push( { name: "fld_resource_id", type: "hidden", value: RValue( oLibRes.fileID ) } );
						}
					}
					else
					{
						arrFormFields.push( { name: _field, type: "hidden", value: oFormField.GetOptProperty( _field ) } );
					}
				}
			}
		}
		catch( err ){}
	}
	iCurUserID = OptInt( iCurUserID );
	try
	{	
		var arrFormFields = [];
		var oFormField = form_fields_to_object(sFormFields)
		
		var iCareerReserveID = OptInt(iCareerReserveIDParam);
		
		if(iCareerReserveID == undefined )
		{
			iCareerReserveID = OptInt(oFormField.GetOptProperty("cur_career_reserve_id"));
			
			if(iCareerReserveID != undefined )
			{
				arrFormFields.push({name: "cur_career_reserve_id", type: "hidden", value: iCareerReserveID});
			}
			else
				throw StrReplace("Некорректный ID объекта: [{PARAM1}]", "{PARAM1}", iCareerReserveIDParam);
		}
		
		var docCareerReserve = tools.open_doc(iCareerReserveID);
		
		if(docCareerReserve == undefined )
			throw StrReplace("Не найден объект с ID: [{PARAM1}]", "{PARAM1}", iCareerReserveID);
		
		var teCareerReserve = docCareerReserve.TopElem;
		if(teCareerReserve.Name != 'career_reserve')
			throw StrReplace("Объект с ID: [{PARAM1}] не является этапом развития карьеры", "{PARAM1}", iCareerReserveID);
		
		//var bIsSelf = (iCurUserID == teCareerReserve.person_id.Value);
		//var bIsBoss = tools.is_boss(iCurUserID, teCareerReserve.person_id.Value);
		catTutorBossType = ArrayOptFirstElem( tools.xquery( "for $elem in boss_types where $elem/code = 'talent_pool_tutor' return $elem" ) );
		var bIsTutor = (ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iCurUserID && ( catTutorBossType != undefined && catTutorBossType.id == This.boss_type_id )") != undefined);

		var sApplication = oScopeWvars.GetOptProperty( "sAPPLICATION", "" );
		if( sApplication != "" )
		{
			var curApplication = tools_app.get_cur_application( sApplication );
			var sAccessType = "";
			if( curApplication != null )
			{
				var iApplLevel = tools.call_code_library_method( "libApplication", "GetPersonApplicationAccessLevel", [ iCurUserID, curApplication.id ] );

				if(iApplLevel >= 10) // Администратор приложения
					sAccessType = "admin";
				else if(iApplLevel >= 7) // администратор процесса
					sAccessType = "manager";
				else if(iApplLevel >= 5) // HR
					sAccessType = "hr";
				else if(iApplLevel >= 3) // методист
					sAccessType = "expert";
				else if(iApplLevel >= 2) // наставник
					sAccessType = "tutor";
				else if(iApplLevel >= 1) // Наблюдатель
					sAccessType = "observer";
				else
					sAccessType = "reject";
			}
			switch( sAccessType )
			{
				case "admin":
				case "manager":
					break;
				case "hr":
				{
					var iAppHRManagerTypeID = tools.call_code_library_method("libApplication", "GetApplicationHRBossTypeID", [ sApplication, iCurUserID ])
					xqLongListQuery = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], false, null, ['id'], '', true, true, true, true, (iAppHRManagerTypeID == null ? [] : [iAppHRManagerTypeID]) ], true );
					if( ArrayOptFindByKey( sTutorQueryQual, teCareerReserve.person_id, "id" ) == undefined )
					{
						oRet.result = close_form("У Вас нет прав на добавление задач к этому этапу развития карьеры");
						return oRet;
					}
					break;
				}
				case "tutor":
				{
					if(!bIsTutor)
					{
						oRet.result = close_form("У Вас нет прав на добавление задач к этому этапу развития карьеры");
						return oRet;
					}
					break;
				}
				default:
				{
					oRet.result = close_form("У Вас нет прав на добавление задач к этому этапу развития карьеры");
					return oRet;
				}
			}
		}
		else
		{
			if(!bIsTutor)
			{
				oRet.result = close_form("У Вас нет прав на добавление задач к этому этапу развития карьеры");
				return oRet;
			}
		}

		if(tools_web.is_true(teCareerReserve.forbid_tasks_edit.Value))
		{
			oRet.result = close_form("В данном этапе развития карьеры изменение набора задач запрещено настройками");
			return oRet;
		}
		
		arrTutorIDs = ArrayExtract(teCareerReserve.tutors, "OptInt(This.person_id)")

		var sParentID = null;
		
		var arrAccessActionCode = GetAccessAction(iCareerReserveID, iCurUserID);
		var arrAccessActionPersonCode = GetAccessAction(teCareerReserve.person_id, iCurUserID);
		arrAccessActionCode = ArrayUnion(arrAccessActionCode, arrAccessActionPersonCode);

		var sSendNotificationType = oScopeWvars.GetOptProperty( "sSendNotificationType" );
		if(oFormField.HasProperty("send_notification_type")) sSendNotificationType = oFormField.GetOptProperty( "send_notification_type" );
		
		var sSendType = oScopeWvars.GetOptProperty( "sSendType" );
		var sBasicNotificationType = oScopeWvars.GetOptProperty( "sBasicNotificationType" );
		var iCollaboratorNotificationID = OptInt( oScopeWvars.GetOptProperty( "iCollaboratorNotificationID" ) );
		var iTutorNotificationID = OptInt( oScopeWvars.GetOptProperty( "iTutorNotificationID" ) );
		var sCustomOption = oScopeWvars.GetOptProperty( "sCustomOption" );
		var aTaskTypes = String( oScopeWvars.GetOptProperty( "sTaskTypes", "task;learning;education_method;compound_program;test_learning;document_learning;learning_task;defence;assessment_appraise;poll;poll_procedure;stage" ) ).split( ";" );
		
		var sNextStep = oFormField.GetOptProperty("step_next", "fodm");
		
		if(sCommand == "eval" || (sCommand == "submit_form" && sNextStep == "form"))
		{
			var arrMessage = [];
			var arrNoAccess = [];
			
			arrFormFields.push({name: "step_next", type: "hidden", value: "do"});
			
			arrFormFields.push({name:"type", page: "type", mandatory: true, validation: "nonempty", label:"Тип задачи", type:"select", entries: ArrayExtract(ArrayIntersect( get_task_type_career_reserve(), aTaskTypes, "This.id", "This" ), "({name:This.name,value:This.id})")});

			arrFormFields.push({name:"parent_task_id", page: "type", mandatory: true, validation: "nonempty", value: "without_stage", label:"Этап", type:"combo", entries: ArrayExtract( ArrayUnion( [ { name: "Без этапа", id: "without_stage" } ], ArraySelect( teCareerReserve.tasks, "!This.parent_task_id.HasValue" ) ), "({name:This.name,value:This.id})")});
			
			sQuery_qual = " MatchSome($elem/person_id, (" + ArrayMerge(arrTutorIDs, "This", ",") + ")) ";
	
			arrFormFields.push({name: "name", page: "type", mandatory: true, validation: "nonempty", label: "Наименование задачи", type: "string"});
			arrFormFields.push({name: "start_date", page: "data", label: "Дата начала", type: "date", column: 2});
			arrFormFields.push({name: "plan_date", page: "data", label: "Дата выполнения", type: "date", column: 2});
			//arrFormFields.push({name: "fact_date", page: "data", label: "Фактическая дата выполнения", type: "date"});
			//arrFormFields.push({name: "start_edit_date", page: "data", label: "Дата начала редактирования", type: "date", column: 2});
			arrFormFields.push({name: "tutor_id", page: "data", label: "Наставник по задаче", type: "select", entries: get_tutors_career_reserve_for_select_entryes(iCareerReserveID, docCareerReserve), value: "" + iCurUserID, column: 2});
			arrFormFields.push({name: "desc", page: "data", label: "Описание задачи", type: "text"});
			arrFormFields.push({name: "tutor_comment", page: "data", label: "Комментарий наставника", type: "text"});
			
			arrFormFields.push({ 
				name: "resources", 
				page: "data",
				label: "Файлы (список файлов отображается при статусе задачи \"В работе\")", 
				type: "foreign_elem", 
				catalog: "resource", 
				multiple: true, 
				query_qual: sQuery_qual, 
				value: "",  
				display_value: "", 
				title: "Выберите файл(ы)" 
			});
			
			arrFormFields.push({ name: "fld_resource", page: "data", label: "Загрузить файл", type: "file" })
			
			switch( sSendNotificationType )
			{
				case "send":
				case "not_send":
					break;
				default:
				
					var oSendNotificationTypeField = {
						name: "send_notification_type",
						label: "Отправлять уведомления",
						page: "type",
						type: "select", 
						value: "send",
						column: 1,
						mandatory: true,
						entries: [ { name: "да", value: "send" }, { name: "нет", value: "not_send" } ]
						
					};
				
					arrFormFields.push( oSendNotificationTypeField );
					break;
			}
			switch( sSendNotificationType )
			{
				case "not_send":
					break;
				default:
					
					var oSendTypeField = {
						name: "send_type",
						label: "Адресаты",
						type: "list", 
						column: 1,
						page: "type",
						mandatory: true,
						value: ( sSendType == "" ? ["collaborator","boss","tutor"] : tools_web.parse_multiple_parameter( sSendType ) ),
						entries: [ { name: "Сотрудник", value: "collaborator" }, { name: "Руководитель", value: "boss" }, { name: "Наставник", value: "tutor" } ]
						
					};
					if( sSendNotificationType != "send" )
					{
						oSendTypeField.SetProperty( "visibility", [{ parent: 'send_notification_type', value: 'send' }] )
					}
					arrFormFields.push( oSendTypeField );
					break;
			}
			
			var oForm = {
				command: "wizard",
				title: "Добавить задачу",
				form_fields: arrFormFields,
				pages: [{name: "type"},{name: "data"}],
				buttons: []
			};
			if(ArrayOptFirstElem(arrFormFields) != undefined)
				oForm.buttons.push({ name: "submit", label: "Сохранить", type: "submit" });
			
			oForm.buttons.push({ name: "cancel", label: "Отменить", type: "cancel"});
			
			oRet.result = oForm;
		}
		else if( sCommand == "submit_form" && ( sNextStep == "do" || sNextStep == "notification" ) )
		{
			var iSelectedTaskObjectID = OptInt( oFormField.GetOptProperty( "selected_task_object_id", null ), null );
			if( iSelectedTaskObjectID == null )
			{
				var sCatalogName = null;
				var sType = oFormField.GetOptProperty( "type", null );
				switch( sType )
				{
					case "task":
						sCatalogName = "task_type";
						break;
					case "learning":
						sCatalogName = "course";
						break;
					case "test_learning":
						sCatalogName = "assessment";
						break;
					case "document_learning":
						sCatalogName = "library_material";
						break;
					case "education_method":
					case "compound_program":
					case "learning_task":
					case "assessment_appraise":
					case "poll":
					case "poll_procedure":
						sCatalogName = sType;
						break;
				}
				if( sCatalogName != null )
				{
					merge_form_fields();
					oRet.result = {
						command: "select_object",
						title: "Выберите объект",
						catalog_name: sCatalogName,
						xquery_qual: "",
						field_name: "selected_task_object_id",
						mandatory: true,
						multi_select: false,
						disp_hier_view: false,
						disp_tree_selector: false,
						form_fields: arrFormFields,
						buttons:
						[
							{ name: "cancel", label: ms_tools.get_const('c_cancel'), type: "cancel", css_class: "btn-cancel-custom" },
							{ name: "submit", label: "Выбрать", type: "submit", css_class: "btn-submit-custom" }
						],
						no_buttons: false
					};
					return oRet;
				}
			}
			if( sNextStep == "do" )
			{
				switch( sSendNotificationType )
				{
					case "not_send":
						break;
					default:
						switch( sBasicNotificationType )
						{
							case "template":
								
								switch( sCustomOption )
								{
									case "with":
										arrFormFields.push({
											name: "step_next",
											type: "hidden",
											value: "notification"
										});
										var oCustomTextField = {
											name: "custom_text",
											label: "Текст который будет добавлен к уведомлению",
											type: "text", 
											value: ""
										};
									
										arrFormFields.push( oCustomTextField );
										merge_form_fields();
										var oForm = {
											command: "display_form",
											title: "Добавить задачу",
											
											form_fields: arrFormFields,
											buttons: [{ name: "submit", label: "Выполнить", type: "submit" },{ name: "cancel", label: "Отменить", type: "cancel"}]
										};
										
										oRet.result = oForm;
										return oRet;
								}
								break;
							default:
								arrFormFields.push({
											name: "step_next",
											type: "hidden",
											value: "notification"
										});
								arrFormFields.push( { name: "notification_subject", type: "string", label: "Тема уведомления", mandatory: true } );
								arrFormFields.push( { name: "notification_type", type: "combo", value: "plain", entries: [ { name: "Текст", value: "plain" }, { name: "HTML", value: "html" } ], label: "Тип уведомления",  mandatory: true } );
								arrFormFields.push( { name: "notification_body", label: "Сообщение уведомления", type: "text", mandatory: true  } );
								merge_form_fields();
								var oForm = {
									command: "display_form",
									title: "Добавить задачу",
									form_fields: arrFormFields,
									buttons: [{ name: "submit", label: "Выполнить", type: "submit" },{ name: "cancel", label: "Отменить", type: "cancel"}]
								};
								
								oRet.result = oForm;
								return oRet;
						}
				}
			}
			function send_notification( iNotificationID, iRecipientID, curTask )
			{
				if( sBasicNotificationType == "custom" )
				{
					var newNotif = OpenNewDoc('x-local://wtv/wtv_dlg_notification_template.xml').TopElem;
					newNotif.recipients.AddChild().recipient_type = 'in_doc';
					newNotif.body_type = sNotificationType;

					tools.create_template_notification( "0", iRecipientID, sNotificationSubject, sNotificationBody, null, newNotif, docCareerReserve.DocID );
					return 1;
				}
				else if( iNotificationID != undefined )
				{
					//tools.create_notification( iNotificationID, iRecipientID, "", docCareerReserve.DocID, null, teCareerReserve );
					// tools.create_notification( iNotificationID, iRecipientID, "", docCareerReserve.DocID, null, curTask );
					tools.create_notification( iNotificationID, iRecipientID, "", 0, null, {id: teCareerReserve.id.Value, type: teCareerReserve.Name, name: teCareerReserve.name, task_name: curTask.name.Value, person_fullname: teCareerReserve.person_id.sd.fullname.Value} );
					return 1;
				}
				return 0;
			}
			var sNotificationSubject = oFormField.GetOptProperty( "notification_subject" );
			var sNotificationBody = oFormField.GetOptProperty( "notification_body" );
			var sNotificationType = oFormField.GetOptProperty( "notification_type" );
			curTask = teCareerReserve.tasks.AddChild();
			
			if(oFormField.HasProperty("parent_task_id"))
				curTask.parent_task_id = oFormField.GetOptProperty("parent_task_id", null);

			if(oFormField.HasProperty("type"))
			{
				curTask.type = oFormField.GetOptProperty("type", null);
			}
			curTask.object_id = iSelectedTaskObjectID;
			switch( curTask.type )
			{
				case "learning":
					curTask.object_type = "course";
					break;
				case "test_learning":
					curTask.object_type = "assessment";
					break;
				case "document_learning":
					curTask.object_type = "library_material";
					break;
				case "education_method":
				case "compound_program":
				case "learning_task":
				case "poll":
					curTask.object_type = curTask.type;
					break;
				case "assessment_appraise":
					curTask.object_type = curTask.type;
					curTask.assessment_appraise_id = iSelectedTaskObjectID;
					break;
				case "poll_procedure":
					curTask.object_type = curTask.type;
					curTask.poll_procedure_id = iSelectedTaskObjectID;
					break;
			}

			var bDoSave = false
			if(oFormField.HasProperty("name"))
			{
				curTask.name = oFormField.GetOptProperty("name", "");
				bDoSave = true;
			}
			
			if(oFormField.HasProperty("start_date"))
			{
				curTask.start_date = oFormField.GetOptProperty("start_date", "");
				bDoSave = true;
			}
			if(oFormField.HasProperty("parent_task_id"))
			{
				if( oFormField.GetOptProperty("parent_task_id", "") != "without_stage" )
				{
					curTask.parent_task_id = oFormField.GetOptProperty("parent_task_id", "");
				}
				else
				{
					curTask.parent_task_id.Clear();
				}
				bDoSave = true;
			}
			
			if(oFormField.HasProperty("plan_date"))
			{
				curTask.plan_date = oFormField.GetOptProperty("plan_date", null);
				bDoSave = true;
			}
			
			if(oFormField.HasProperty("fact_date"))
			{
				curTask.fact_date = oFormField.GetOptProperty("fact_date", null);
				bDoSave = true;
			}
			
			if(oFormField.HasProperty("start_edit_date"))
			{
				curTask.start_edit_date = oFormField.GetOptProperty("start_edit_date", null);
				bDoSave = true;
			}
			
			if(oFormField.HasProperty("score"))
			{
				curTask.score = oFormField.GetOptProperty("score", null);
				bDoSave = true;
			}
			
			if(oFormField.HasProperty("tutor_id"))
			{
				curTask.tutor_id = oFormField.GetOptProperty("tutor_id", null);
				bDoSave = true;
			}
			
			if(oFormField.HasProperty("desc"))
			{
				curTask.desc = oFormField.GetOptProperty("desc", "");
				bDoSave = true;
			}
			
			if(oFormField.HasProperty("person_comment"))
			{
				curTask.person_comment = oFormField.GetOptProperty("person_comment", "");
				bDoSave = true;
			}
			
			if(oFormField.HasProperty("tutor_comment"))
			{
				curTask.tutor_comment = oFormField.GetOptProperty("tutor_comment", "");
				bDoSave = true;
			}
			
			if(oFormField.HasProperty("resources"))
			{
				sResourcesIDs = oFormField.GetOptProperty("resources", "")
				arrResourcesIDs = ArrayExtract(ArraySelect(sResourcesIDs.split(";"), "OptInt(This) != undefined"), "OptInt(This)")
				
				// создаем список файлов 
				for (iResourceID in arrResourcesIDs)
				{
					docResource = tools.open_doc( iResourceID )
					docResourceTE = docResource.TopElem
					
					oTaskFiles = curTask.files.AddChild()
					oTaskFiles.file_id = iResourceID
					
					links = docResourceTE.links.AddChild()
					links.object_id = iCareerReserveID 
					links.object_catalog = 'task'
					links.object_name = curTask.name
					links.date_modify = Date()
					
					docResource.Save()
				}
				bDoSave = true;
			}
			
			if(oFormField.HasProperty("fld_resource_id"))
			{
				iResourcesIDs = OptInt( oFormField.GetOptProperty("fld_resource_id", "") )
				if( iResourcesIDs != undefined )
				{
					docResource = tools.open_doc( iResourceID )
					docResourceTE = docResource.TopElem
					
					oTaskFiles = curTask.files.AddChild()
					oTaskFiles.file_id = iResourceID
					
					links = docResourceTE.links.AddChild()
					links.object_id = iCareerReserveID 
					links.object_catalog = 'task'
					links.object_name = curTask.name
					links.date_modify = Date()
					
					docResource.Save()
				}
				bDoSave = true;
			}
			
			var oResourceData = oFormField.GetOptProperty("fld_resource", null);
			if(oResourceData != null && DataType(oFormField.fld_resource) != 'object')
				oResourceData = null
			if(oResourceData != null && oResourceData.GetOptProperty("url", "") != "")
			{
				oLibRes = tools.call_code_library_method("libPortal", "CreateResource", [ iCurUserID, oResourceData ]);

				docResource = tools.open_doc( oLibRes.fileID )
				docResourceTE = docResource.TopElem
				
				TaskFiles = curTask.files.AddChild()
				TaskFiles.file_id = oLibRes.fileID
				
				links = docResourceTE.links.AddChild()
				links.object_id = iCareerReserveID 
				links.object_catalog = 'task'
				links.object_name = curTask.name
				links.date_modify = Date()
				
				docResource.Save()
				
				bDoSave = true;
			}
			//alert("bDoSave "+bDoSave)
			if(bDoSave)
			{
				docCareerReserve.Save();
				
				bSendNotification = false;
				switch( sSendNotificationType )
				{
					case "send":
						bSendNotification = true;
						break;
				}
				docCareerReserve.Save();
				if( bSendNotification )
				{
					
					sCustomText = oFormField.GetOptProperty( "custom_text", "" );
					aSendTypes = tools_web.parse_multiple_parameter( sSendType );
					switch( sSendNotificationType )
					{
						case "not_send":
							break;
						default:
							aSendTypes = tools_web.parse_multiple_parameter(oFormField.GetOptProperty( "send_type" ));
							break;
					}
					for( _recipient_type in aSendTypes )
					{
						switch( _recipient_type )
						{
							case "collaborator":
								send_notification( iCollaboratorNotificationID, teCareerReserve.person_id, curTask );
								break;
							case "tutor":
								for( _tutor in teCareerReserve.tutors )
								{
									send_notification( iTutorNotificationID, _tutor.PrimaryKey, curTask );
								}
								break;
							case "boss":
								for( _boss in tools.call_code_library_method( 'libMain', 'get_subordinate_records', [ teCareerReserve.person_id, ['fact','func'], false, "", null, "", true, true, true, true ] ) )
								{
									send_notification( iTutorNotificationID, _boss.id, curTask );
								}
								break;
						}
					}
				}
				
				oRet.result = close_form("Задача плана деятельности этапа развития карьеры успешно обновлена", true);
			}
			else
			{
				oRet.result = close_form(null, false);
			}
		}
	}
	catch(err)
	{
		oRet.error = 1;
		oRet.errorText = "Ошибка вызова удаленного действия \"AddTaskCareerReserve\"\r\n" + err;
		oRet.result = close_form(oRet.errorText);
		toLog("ERROR: AddTaskCareerReserve: " + oRet.errorText);
	}
	return oRet;
}

function SetTask(teAdaptationCareerReserve, arrTargetCRTasks, xmSourceTPTask, oParams)
{
	try
	{
		xmChildTask = arrTargetCRTasks.AddChild();
		sChildID = tools.random_string( 6 )
		xmChildTask.AssignElem( xmSourceTPTask );

		var sParentTaskID = Trim(oParams.GetOptProperty("sParentTaskID"));
		if(sParentTaskID == undefined || sParentTaskID == null || sParentTaskID == "")
		{
			xmChildTask.parent_task_id.Clear();
		}
		else
		{
			xmChildTask.parent_task_id = sParentTaskID
		}
		
		xmChildTask.id = xmChildTask.id + sChildID
		
		var iTypicalProgramID = OptInt(oParams.GetOptProperty("iTypicalProgramID"), null);
		if(iTypicalProgramID == null && xmSourceTPTask.Parent.Parent.Name == "typical_development_program")
			iTypicalProgramID = xmSourceTPTask.Parent.Parent.id.Value;
		xmChildTask.typical_development_program_id = iTypicalProgramID;
		
		xmChildTask.typical_development_program_task_id = xmSourceTPTask.id.Value;
		
		//TUTORS
		if ( oParams.iTaskTutorID != null )
			xmChildTask.tutor_id = oParams.iTaskTutorID;
		
		// DATES
		try
		{
			var dProcessBaseDate = Date(oParams.dProcessBaseDate);
		}
		catch(_e)
		{
			try
			{
				dProcessBaseDate = Date(teAdaptationCareerReserve.start_date);
			}
			catch(_ee)
			{
				dProcessBaseDate = Date();
			}
		}
		
		sAdjustDayType = oParams.GetOptProperty("sAdjustDayType");
		if(sAdjustDayType == undefined || sAdjustDayType == null || sAdjustDayType == "")
			sAdjustDayType = "calendar";
		
		if ( xmSourceTPTask.due_date.HasValue && OptInt(xmSourceTPTask.due_date) != undefined)
			xmChildTask.start_date = AdjustDays(sAdjustDayType, dProcessBaseDate, OptInt(xmSourceTPTask.due_date)); //start_date

		if ( xmSourceTPTask.duration_days.HasValue && OptInt(xmSourceTPTask.duration_days) != undefined)
		{
			if (xmChildTask.start_date.HasValue)
			{
				xmChildTask.plan_date = AdjustDays(sAdjustDayType, xmChildTask.start_date, OptInt(xmSourceTPTask.duration_days));
			}
			else
			{
				xmChildTask.plan_date = AdjustDays(sAdjustDayType, dProcessBaseDate, OptInt(xmSourceTPTask.duration_days)); //start_date
			}
		}
		
		if ( xmSourceTPTask.start_edit_days.HasValue && OptInt(xmSourceTPTask.start_edit_days) != undefined)
			xmChildTask.start_edit_date = AdjustDays(sAdjustDayType, dProcessBaseDate, OptInt(xmSourceTPTask.start_edit_days)); //start_date
			
		// ==== AUTO APPOINT ====
		// LEARNING
		if ( xmSourceTPTask.auto_appoint_learning  && xmChildTask.object_id.HasValue)
		{
			if ( xmSourceTPTask.type == 'learning' )
			{
				CourseLearning = tools.activate_course_to_person( //person_id
					teAdaptationCareerReserve.person_id, 
					xmChildTask.object_id, 
					null,
					null,
					null,
					xmSourceTPTask.duration_days,
					xmChildTask.start_date
				);

				xmChildTask.active_learning_id = OptInt(CourseLearning) != undefined ? OptInt(CourseLearning, null) : OptInt(CourseLearning.TopElem.Doc.DocID, null);

			}
			if ( xmSourceTPTask.type == 'test_learning' )
			{
				TestLearning = tools.activate_test_to_person(
					teAdaptationCareerReserve.person_id,                  // ID сотрудника, которому назначается тест.											//person_id
					xmChildTask.object_id,          // ID теста, который необходимо назначить.
					null,                       // ID мероприятия, в рамках которого назначается тест.
					null,                       // TopElem карточки сотрудника, которому назначается тест.
					null,      // TopElem карточки теста.
					null,                       // TopElem карточки мероприятия.
					xmSourceTPTask.duration_days,    // длительность теста в днях. Определяет дату планируемого завершения
					xmChildTask.start_date  // дата начала обучения. Если задана, то обучение невозможно будет начать раньше указанной даты.
				);
				
				xmChildTask.active_test_learning_id = OptInt(TestLearning) != undefined ? OptInt(TestLearning, null) : OptInt(TestLearning.TopElem.Doc.DocID, null);
			}
		}
		
		// TASK
		if ( xmSourceTPTask.auto_appoint_task && xmSourceTPTask.type == 'task' && xmChildTask.object_id.HasValue)
		{
			taskDoc = OpenNewDoc( 'x-local://wtv/wtv_task.xmd' );
			taskDoc.BindToDb( DefaultDb );
			teTask = taskDoc.TopElem;
			teTask.code = tools.random_string(8);
			teTask.date_plan = Date();
			
			teTask.executor_type = 'collaborator';
			teTask.executor_id = teAdaptationCareerReserve.person_id;
			
			teTask.source_object_type = 'career_reserve';
			teTask.source_object_id = teAdaptationCareerReserve.id;
			
			teTask.task_type_id = xmChildTask.object_id;
			try
			{
				tools.common_filling( 'task_type', teTask, xmChildTask.object_id );
			}
			catch(err)
			{
				toLog("ERROR: AssignTypicalPrograms: Ошибка при назначении задачи:\r\n" + err, true);
			}
			
			if(xmSourceTPTask.desc.HasValue)
			{
				teTask.name = xmSourceTPTask.desc.Value + ' / ' + teAdaptationCareerReserve.person_id.sd.fullname + ' (' + teAdaptationCareerReserve.person_id.sd.position_name + ')';
			}
			else
			{
				fldObject = xmSourceTPTask.object_id.OptForeignElem
				teTask.name = (fldObject == undefined ? '' : fldObject.name + ' / ') + teAdaptationCareerReserve.person_id.sd.fullname + ' (' + teAdaptationCareerReserve.person_id.sd.position_name + ')';
			}
			
			xmChildTask.task_id = taskDoc.DocID;
			taskDoc.Save();
		}
	
		return xmChildTask
	}
	catch(err)
	{
		toLog("ERROR: SetTask: " + err, true);
	}

}

function AdjustDays(sAdjustDayType, dDate, iAdjustNum)
{
	switch(sAdjustDayType)
	{
		case "working":
		{
			return tools.call_code_library_method( 'libSchedule', 'get_working_offset', [ dDate, iAdjustNum ] ).end_date;
		}
		default:
		{
			return tools.AdjustDate(dDate, iAdjustNum);
		}
	}
}

/**
 * @typedef {Object} oAssignModificators
 * @property {boolean} bClearAllTasks - Предварительная очистка всего плана деятельности существующего этапа развития карьеры (адаптации)
 * @property {boolean} CanAddTasks - Включает/выключает добавление новых задач из типовой программы в план развития
 * @property {boolean} CanEditTasks - Включает/выключает обновление существующих задач
 * @property {string[]} EditStates - Статусы задач, при которых задача может быть изменена
 * @property {boolean} CanDeleteTasks - Включает/выключает удаление из плана деятельности задач, удаленных из типовой программы
 * @property {string[]} DeleteStates - Статусы задач, при которых задача может быть удалена
 * @property {boolean} CancelInsteadDelete - задачи вместо удаления переводятся в статус Отменена
*/

/**
 * @function AssignTypicalPrograms
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Добавление задач типовой программы развития в адаптацию сотрудника
 * @param {bigint} iAdaptationCareerReserve - ID адаптации сотрудника
 * @param {XmElem} CareerReserveObject - TopElem или документ адаптации сотрудника
 * @param {bigint[]} arrTypicalProgramIDs - массив ID типовых программ развития (в той последовательности, в какой они будут добавляться)
 * @param {string} sMergeType - Тип добавления (parallel/serial))
 * @param {string} sAdjustDayType - Сдвиг вычисляется в календарных или рабочих днях (calendar/working))
 * @param {oAssignModificators} oModificators
 * @returns {WTLPEFormResult}
*/
function AssignTypicalPrograms(iAdaptationCareerReserve, CareerReserveObject, arrTypicalProgramIDs, sMergeType, sAdjustDayType, oModificators)
{
	function get_typical_program_task_tutors(iTDP_ID, iPersonID)
	{
		if(OptInt(iTDP_ID) == undefined)
			return [];
		
		if(OptInt(iPersonID) == undefined)
		{
			var sReq = "for $elem in tutors where $elem/status = 'active' and $elem/typical_development_program_id = " + iTDP_ID + " return $elem"
		}
		else
		{
			var arrPersonPositions = tools.xquery("for $elem in positions where $elem/basic_collaborator_id = " + iPersonID + " return $elem/Fields('parent_object_id')")
			
			var sReq = "for $elem in tutors where $elem/status = 'active' and $elem/typical_development_program_id = " + iTDP_ID + " and ($elem/subdivision_id = null() or MatchSome($elem/subdivision_id, (" + ArrayMerge(arrPersonPositions, "This.parent_object_id", ",") + "))) return $elem"
		}
		
		return ArrayExtract(ArraySelectDistinct(tools.xquery(sReq), "This.person_id"), "This.person_id");
	}
	
	// Формирование целевой структуры плана деятельности по типовым программам
	function addChildren( fldSourceTaskTDP, iCurTypicalProgramTaskTutor, sParentTaskParam )
	{
		var fldChildTask = SetTask(
								teAdaptationCareerReserve, 
								arrTargetTasks, 
								fldSourceTaskTDP, 
								({
									"sAdjustDayType": sAdjustDayType, 
									"dProcessBaseDate": dProcessBaseDate, 
									"iTaskTutorID": iCurTypicalProgramTaskTutor, 
									"iTypicalProgramID": iTypicalProgramID, 
									"sParentTaskID": sParentTaskParam
								}) 
							);
		for ( fldTask in ArraySelectByKey( teTypicalProgram.tasks, fldSourceTaskTDP.PrimaryKey, 'parent_task_id' ) )
			addChildren( fldTask, iCurTypicalProgramTaskTutor, RValue(fldChildTask.id) );
			
		iCount++;
		
		if ( iCount > 50 )
			return;
	}
	
	function addTasksToCareerReserveStage1( fldSourceTask, sParentTaskParam, oModificators )
	{
	
		if(tools_web.is_true( oModificators.bClearAllTasks ))
		{
			var xmAddTask = arrFinalTargetTasks.AddChild();
			xmAddTask.AssignElem( fldSourceTask );

			var arrChildTasks = ArraySelectByKey( arrFullTargetTasks, fldSourceTask.PrimaryKey, 'parent_task_id' );

			for ( fldTask in arrChildTasks )
				addTasksToCareerReserveStage1( fldTask, xmAddTask.id.Value, oModificators );
				
			iCount++;
			
			if ( iCount > 50 )
				return;
		}
		else
		{
/*			var xmCurOldTask = ArrayOptFind(arrFinalTargetTasks, "This.typical_development_program_id.Value == fldSourceTask.typical_development_program_id.Value && This.typical_development_program_task_id.Value == fldSourceTask.typical_development_program_task_id.Value")
			
			if(xmCurOldTask == undefined && tools_web.is_true( oModificators.CanAddTasks ))
			{
				var xmAddTask = arrFinalTargetTasks.AddChild();
				xmAddTask.AssignElem( fldSourceTask );

				var arrChildTasks = ArraySelectByKey( arrFullTargetTasks, fldSourceTask.PrimaryKey, 'parent_task_id' );

				for ( fldTask in arrChildTasks )
					addTasksToCareerReserveStage1( fldTask, xmAddTask.id.Value, oModificators );
					
			}
			else if(xmCurOldTask != undefined && tools_web.is_true( oModificators.CanEditTasks ))
			{
				if(ArrayOptFind(oModificators.EditStates, "This == xmCurOldTask.status.Value") != undefined)
				{
					xmCurOldTask.Clear();
					xmCurOldTask.AssignElem( fldSourceTask );

					var arrChildTasks = ArraySelectByKey( arrFullTargetTasks, fldSourceTask.PrimaryKey, 'parent_task_id' );

					for ( fldTask in arrChildTasks )
						addTasksToCareerReserveStage1( fldTask, xmCurOldTask.id.Value, oModificators );
				}
			}
*/
			var xmTask = ArrayOptFind(arrFinalTargetTasks, "This.typical_development_program_id.Value == fldSourceTask.typical_development_program_id.Value && This.typical_development_program_task_id.Value == fldSourceTask.typical_development_program_task_id.Value")
			
			var arrChildTasks = ArraySelectByKey( arrFullTargetTasks, fldSourceTask.PrimaryKey, 'parent_task_id' );
			if(xmTask == undefined)
			{
				if(tools_web.is_true( oModificators.CanAddTasks ))
				{
					xmTask = arrFinalTargetTasks.AddChild();
					xmTask.AssignElem( fldSourceTask );
				}
			}
			else if(xmTask != undefined)
			{
				if(tools_web.is_true( oModificators.CanEditTasks ) && ArrayOptFind(oModificators.EditStates, "This == xmTask.status.Value") != undefined)
				{
					xmTask.Clear();
					xmTask.AssignElem( fldSourceTask );
				}
				else
				{
					xmTask.id = fldSourceTask.id;
					xmTask.parent_task_id = fldSourceTask.parent_task_id;
				}
			}

			for ( fldTask in arrChildTasks )
				addTasksToCareerReserveStage1( fldTask, xmTask.id.Value, oModificators );

			iCount++;
			if ( iCount > 50 )
				return;
		}
	}
	
	function addTasksToCareerReserveStage2( fldSourceTask, sParentTaskParam )
	{
		var xmAddTask = teAdaptationCareerReserve.tasks.AddChild();
		xmAddTask.AssignElem( fldSourceTask );

		var arrChildTasks = ArraySelectByKey( arrFinalTargetTasks, fldSourceTask.PrimaryKey, 'parent_task_id' );

		for ( fldTask in ArraySort(arrChildTasks, "This.start_date.Value", "+", "This.plan_date.Value", "+") )
			addTasksToCareerReserveStage2( fldTask, xmAddTask.id.Value );
			
		iCount++;
		
		if ( iCount > 50 )
			return;
	}

	var oRes = tools.get_code_library_result_object();
	oRes.result = true;
	
	if(DataType(oModificators) != 'object' || ObjectType(oModificators) != 'JsObject')
	{
		oModificators = {
			bClearAllTasks: true,
			CanAddTasks: true,
			CanEditTasks: true,
			EditStates: ['plan'],
			CanDeleteTasks: true,
			DeleteStates: ['plan'],
			CancelInsteadDelete: false
		};
	}
	else
	{
		if(!oModificators.HasProperty('bClearAllTasks'))
			oModificators.SetProperty('bClearAllTasks', false);

		if(!oModificators.HasProperty('CanAddTasks'))
			oModificators.SetProperty('CanAddTasks', false);

		if(!oModificators.HasProperty('CanEditTasks'))
			oModificators.SetProperty('CanEditTasks', false);

		if(!oModificators.HasProperty('CanDeleteTasks'))
			oModificators.SetProperty('CanDeleteTasks', false);

		if(!oModificators.HasProperty('CancelInsteadDelete'))
			oModificators.SetProperty('CancelInsteadDelete', false);

		if(!oModificators.HasProperty('EditStates'))
			oModificators.SetProperty('EditStates', []);

		if(!oModificators.HasProperty('DeleteStates'))
			oModificators.SetProperty('DeleteStates', []);
	}

	try
	{
		var sURLTasksForm = RegisterSubForm( 'x-local://wtv/wtv_career_reserve.xmd', 'career_reserve.tasks' );
		
		var sCatalogName = "";
		try
		{
			sCatalogName = CareerReserveObject.Name;
			teAdaptationCareerReserve = CareerReserveObject;
			docAdaptationCareerReserve = CareerReserveObject.Doc;
			iAdaptationCareerReserve = docAdaptationCareerReserve.DocID;
		}
		catch(e)
		{
			try
			{
				teAdaptationCareerReserve = CareerReserveObject.TopElem;
				docAdaptationCareerReserve = CareerReserveObject;
				iAdaptationCareerReserve = CareerReserveObject.DocID;
				sCatalogName = teAdaptationCareerReserve.Name;
			}
			catch(ee)
			{
				try
				{
					docAdaptationCareerReserve = tools.open_doc( iAdaptationCareerReserve );
					teAdaptationCareerReserve = docAdaptationCareerReserve.TopElem;
					sCatalogName = teAdaptationCareerReserve.Name;
				}		
				catch(err)
				{
					throw "Передана некорректная адаптация сотрудника";	
				}
			}
		}
		
		//if ( (sCatalogName != "career_reserve") || (teAdaptationCareerReserve.position_type != 'adaptation') )
		if ( sCatalogName != "career_reserve" )
		{
			throw "Передана некорректная адаптация сотрудника";	
		}

		if(!IsArray(arrTypicalProgramIDs))
		{
			arrTypicalProgramIDs = [];
		}
		
		if (!tools_web.is_true( oModificators.bClearAllTasks ))
		{
			arrTypicalProgramIDs = ArraySelectDistinct(ArrayUnion(ArrayExtract(teAdaptationCareerReserve.tasks, "This.typical_development_program_id.Value"), arrTypicalProgramIDs));
		}
		
		var iTaskTutorBossTypeID = ArrayOptFirstElem(tools.xquery("for $elem in boss_types where $elem/code = 'talent_pool_task_tutor' return $elem"), {id: null}).id.Value;

		var dProcessBaseDate = teAdaptationCareerReserve.start_date;
		var iTPCount = ArrayCount(arrTypicalProgramIDs);
		
		var iTypicalProgramID, iCount, docTypicalProgram, teTypicalProgram, arrTopTPTasks;
		var arrTargetTasks, arrFullTargetTasks = [];
		var iFakeStageNum, bIsIncrementFakeStageNum;
		var xmCurFakeStage, sCurFakeStageID;
		var xmAddTutor
		var arrTypicalProgramTaskTutors, iCurTypicalProgramTaskTutor;
		if(iTPCount > 0)
		{
			var arrProcessTypicalProgram = [];
			var dMinDate = null, dMaxDate = null;
			// Формирование целевой структуры плана деятельности по типовым программам
			for(itemTypicalProgramID in arrTypicalProgramIDs)
			{
				iTypicalProgramID = OptInt(itemTypicalProgramID, null);
				iCount = 0;
				if (iTypicalProgramID != null)
				{
					arrTargetTasks = OpenNewDoc(sURLTasksForm).TopElem;

					docTypicalProgram = tools.open_doc( iTypicalProgramID );
					teTypicalProgram = docTypicalProgram.TopElem;
					
					arrTypicalProgramTaskTutors = get_typical_program_task_tutors(iTypicalProgramID, teAdaptationCareerReserve.person_id);
					iCurTypicalProgramTaskTutor = ArrayOptFirstElem(arrTypicalProgramTaskTutors);
					if(iCurTypicalProgramTaskTutor == undefined) 
						iCurTypicalProgramTaskTutor = null;

					for(itemTDPTaskTutor in arrTypicalProgramTaskTutors)
					{
						if(teAdaptationCareerReserve.person_id.Value == itemTDPTaskTutor)
							continue;
						
						xmAddTutor = teAdaptationCareerReserve.tutors.ObtainChildByKey(itemTDPTaskTutor);
						tools.common_filling( 'collaborator', xmAddTutor, itemTDPTaskTutor );
						xmAddTutor.boss_type_id = iTaskTutorBossTypeID;
					}
					
					arrTopTPTasks = ArraySelect( teTypicalProgram.tasks, '!This.parent_task_id.HasValue' );
					
					iFakeStageNum = 0;
					bIsIncrementFakeStageNum = false;
					for ( fldTPTask in arrTopTPTasks )
					{
//toLog("AssignTypicalPrograms: fldTPTask name: " + fldTPTask.name, true)
						if(iTPCount > 1)
						{
							if(fldTPTask.type.Value == 'stage')
							{
								addChildren(fldTPTask, iCurTypicalProgramTaskTutor, null );
								if(iFakeStageNum > 0 && bIsIncrementFakeStageNum)
								{
									arrFakeStageChilds = ArraySelect(arrTargetTasks, "This.parent_task_id == " + CodeLiteral(sCurFakeStageID))
									if(ArrayOptFirstElem(arrTargetTasks) != undefined)
									{
										xmCurFakeStage.start_date = ArrayMin(arrFakeStageChilds, "This.start_date.Value").start_date.Value;
										xmCurFakeStage.plan_date = ArrayMax(arrFakeStageChilds, "This.plan_date.Value").plan_date.Value;
									}
								}
								bIsIncrementFakeStageNum = false;
							}
							else
							{
								if(!bIsIncrementFakeStageNum)
								{
									iFakeStageNum++;
									bIsIncrementFakeStageNum = true;
									xmCurFakeStage = arrTargetTasks.AddChild();
									xmCurFakeStage.type = 'stage';
									sCurFakeStageID = tools.random_string( 6 ) + "_fake_" + iFakeStageNum;
									xmCurFakeStage.id = sCurFakeStageID;
									
									xmCurFakeStage.name = teTypicalProgram.name;
									if(ArrayOptFind(teTypicalProgram.tasks, "This.type.Value == 'stage'") != undefined)
										xmCurFakeStage.name += ", этап " + iFakeStageNum;
									
									xmCurFakeStage.typical_development_program_id = Int(iTypicalProgramID);
									xmCurFakeStage.typical_development_program_task_id = Int(iTypicalProgramID);
									
									for(itemExistsTask in ArraySelect(teAdaptationCareerReserve.tasks, "!This.parent_task_id.HasValue && This.type.Value != 'stage' && This.typical_development_program_id == " + CodeLiteral(Int(iTypicalProgramID))))
									{
										itemExistsTask.parent_task_id = sCurFakeStageID;
									}
								}
								SetTask(
										teAdaptationCareerReserve, 
										arrTargetTasks, 
										fldTPTask, 
										({
											"sAdjustDayType": sAdjustDayType, 
											"dProcessBaseDate": dProcessBaseDate, 
											"iTaskTutorID": iCurTypicalProgramTaskTutor, 
											"iTypicalProgramID": iTypicalProgramID, 
											"sParentTaskID": sCurFakeStageID
										}) 
									);								
							}
						}
						else
						{
							addChildren( fldTPTask, iCurTypicalProgramTaskTutor, null );
						}
					}
					
					if(iFakeStageNum > 0 && bIsIncrementFakeStageNum)
					{
						arrFakeStageChilds = ArraySelect(arrTargetTasks, "This.parent_task_id == " + CodeLiteral(sCurFakeStageID))
						if(ArrayOptFirstElem(arrTargetTasks) != undefined)
						{
							xmCurFakeStage.start_date = ArrayMin(arrFakeStageChilds, "This.start_date.Value").start_date.Value;
							xmCurFakeStage.plan_date = ArrayMax(arrFakeStageChilds, "This.plan_date.Value").plan_date.Value;
						}
					}
					
					if(ArrayOptFirstElem(arrTargetTasks) != undefined)
					{
						dMaxDate = ArrayMax(arrTargetTasks, "This.plan_date.Value").plan_date.Value;
					}
					
					
					if(sMergeType == 'serial')
					{
						dProcessBaseDate = dMaxDate != null ? AdjustDays(sAdjustDayType, dMaxDate, 1) : teAdaptationCareerReserve.start_date;
					}
					
					arrFullTargetTasks = ArrayUnion(arrFullTargetTasks, arrTargetTasks);
				}
			}

			var arrFinalTargetTasks = OpenNewDoc(sURLTasksForm).TopElem;
			if (!tools_web.is_true( oModificators.bClearAllTasks ))
			{
				arrFinalTargetTasks.AssignElem( teAdaptationCareerReserve.tasks );
			}

			teAdaptationCareerReserve.tasks.Clear();
			docAdaptationCareerReserve.Save();
			
			var arrTopFinalTasks = ArraySelect( arrFullTargetTasks, '!This.parent_task_id.HasValue' );
			// Добавление и изменение задач существующего плана деятельности
			for ( fldCRTask in arrTopFinalTasks )
			{
				addTasksToCareerReserveStage1( fldCRTask, null, oModificators )
			}
			var arrIDsHash = ArrayExtract(arrFullTargetTasks, "Md5Hex(This.typical_development_program_id.Value + '/' + This.typical_development_program_task_id.Value)");

			// удаление задач из плана деятельности
			if (!tools_web.is_true( oModificators.bClearAllTasks ) && tools_web.is_true( oModificators.CanDeleteTasks ))
			{
				var arrCurMissingTasks = ArraySelect(arrFinalTargetTasks, "ArrayOptFind(arrIDsHash, 'This == ' + CodeLiteral(Md5Hex(This.typical_development_program_id.Value + '/' + This.typical_development_program_task_id.Value))) == undefined");
				var arrCurDeleteTasks = ArraySelect(arrCurMissingTasks, "ArrayOptFind(oModificators.DeleteStates, 'This == ' + CodeLiteral(This.status.Value)) != undefined");
				
				var bCancelInsteadDelete = tools_web.is_true( oModificators.CancelInsteadDelete );
				var xmDeletedTask
				for(delItem in arrCurDeleteTasks)
				{
					if(bCancelInsteadDelete)
					{
						delItem.status = 'cancel';
						//xmDeletedTask = arrFinalTargetTasks.GetOptChildByKey(delItem.id.Value);
					}
					else
					{
						arrFinalTargetTasks.DeleteChildByKey(delItem.id.Value);
					}
				}
			}
			
			// сортировка и заполнение плана деятельности непосредственно в развитии карьеры
			var arrTopCRTasks = ArraySort(ArraySelect( arrFinalTargetTasks, '!This.parent_task_id.HasValue' ), "This.start_date.Value", "+", "This.plan_date.Value", "+");
			for ( fldCRTask in arrTopCRTasks )
			{
				addTasksToCareerReserveStage2( fldCRTask, null )
			}

			docAdaptationCareerReserve.Save();
			
			arrFinalTargetTasks = undefined;
			arrFullTargetTasks = undefined;
		}
	}
	catch(err)
	{
		oRes.error = 1;
		oRes.errorText = "ERROR: AssignTypicalPrograms:\r\n" + err;
		oRes.result = close_form(oRes.errorText);
		toLog("ERROR: AssignTypicalPrograms: " + oRes.errorText, true);
	}

	return oRes;
}

/**
 * @function AddAdaptation
 * @memberof Websoft.WT.TalentPool
 * @deprecated 2022.2 -- Замена: CreateAdaptations
 * @author BG
 * @description Добавление адаптации для сотрудника.
 * @param {bigint} iPersonID - ID сотрудника, которому добавляется адаптация
 * @param {date} dStartDate - Дата начала 
 * @param {date} dPlanReadinessDate - Дата планируемой готовности 
 * @param {bigint[]} arrTutorIDs - перечень наставников
 * @returns {bigint} 
*/
function AddAdaptation(iPersonID, dStartDate, dPlanReadinessDate, arrTutorIDs)
{
	var iNewAdaptationID = add_career_reserve(iPersonID, "adaptation", null, null, dStartDate, dPlanReadinessDate, arrTutorIDs);
	return iNewAdaptationID;
}

/**
 * @typedef {Object} oAddAdaptationParams
 * @property {string} state - Статус при создании
 * @property {string} start_date_mode - Способ определения даты начала адаптации (today/tomorrow/optionally)
 * @property {date} start_date - Выбранная дата начала
 * @property {string[]} program_choise - Способ отбора типовых программ развития (subdivision_group/position_family/position_common/optionally)
 * @property {number[]} development_program_ids - Выбранные типовые программы развития
 * @property {string} merge_type - Способ объединения типовых программ при назначении адаптации (serial/parallel/by_application)
 * @property {number} external_depth - Период назначения адаптации от даты приема на работу, дней
 * @property {number} internal_depth - Период назначения адаптации от даты изменения должности, дней
 * @property {string[]} tutors_mode - Способ отбора наставников (fact/func/optionally)
 * @property {number[]} tutor_person_ids - Выбранные наставники
 * @property {number} tutor_boss_type_id - Тип руководителя для отбора наставников по функциональным руководителям
 * @property {string} tutor_source - Наставники отбираются из наставников или сотрудников (tutor/person)
 * @property {string} tutor_hierarchy - Наставники отбираются с учетом иерархии подразделений
 * @property {number} hierarchy_level - Количество уровней отбора вверх по иерархии
 * @property {boolean} send_notification - Вкл/выкл отправки уведомлений (true/false)
 * @property {string[]} send_target - Кому будут отправляться уведомления (person/boss/tutor)
 * @property {string} type_create_notification - Способ формирования уведомлений (template/blank)
 * @property {number} collaborator_notification_id - Тип для генерации уведомлений сотруднику
 * @property {number} boss_notification_id - Тип для генерации уведомлений наставнику и руководителю
 * @property {string} custom_option - Добавляется ли текст в уведомления (wo_add_text/with_add_text)
 * @property {string} message_subject - Тема сообщения без шаблона
 * @property {string} message_format - Формат сообщения без шаблона (plane/html)
 * @property {string} message_body - Тело сообщения без шаблона
 * @property {string} add_text - Дополнительный текст в уведомлениях
 * @property {string} APPLICATION - ID приложения если функция вызывается из приложения
*/

/**
 * @function CreateAdaptations
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Создание адаптации для сотрудников.
 * @param {bigint[]} arrPersonIDs - ID сотрудников, которым добавляются адаптации
 * @param {oAddAdaptationParams} oParam - Параметры формирования адаптации
 * @returns {number} 
*/
function CreateAdaptations(arrPersonIDs, oParam)
{
	var oRes = tools.get_code_library_result_object();
	oRes.count = 0;

	var oRetAssign = tools.get_code_library_result_object();
	
	try
	{
		if(!IsArray(arrPersonIDs))
			throw "arrPersonIDs не является коллекцией";
		
		iSampePersonID = OptInt(ArrayOptFirstElem(arrPersonIDs));
		if(iSampePersonID == undefined)
			throw "arrPersonIDs не содержит ID";
		
		sampleDoc = tools.open_doc(iSampePersonID);
		if(sampleDoc == undefined || sampleDoc.TopElem.Name != "collaborator")
			throw "arrPersonIDs не содержит ID сотрудников";
		
// toLog("CreateAdaptations: oParam:\r\n" + EncodeJson(oParam))
		var ApplicationParam = oParam.GetOptProperty("APPLICATION", null);
		var iExternalDepthDay = OptInt( oParam.GetOptProperty("external_depth", null), 30 );
		var iInternalDepthDay = OptInt( oParam.GetOptProperty("internal_depth", null), 30 );
		//var sDepthChoise = oParam.GetOptProperty("depth_choise", "skip");
		var sState = oParam.GetOptProperty("state", "plan");
		var sDayType = "calendar"
		var sTDPMergeType = oParam.GetOptProperty("merge_type", "parallel");
		if(ApplicationParam != null)
		{
			var teApplication = tools_app.get_cur_application( ApplicationParam );
			if(teApplication != null)
			{
				iExternalDepthDayV = teApplication.wvars.GetOptChildByKey('external_depth');
				if ( iExternalDepthDayV != undefined )
				{
					iExternalDepthDay = OptInt( iExternalDepthDayV.value, iExternalDepthDay );
				}
				iInternalDepthDayV = teApplication.wvars.GetOptChildByKey('internal_depth');
				if ( iInternalDepthDayV != undefined )
				{
					iInternalDepthDay = OptInt( iInternalDepthDayV.value, iInternalDepthDay );
				}
				sStateV = teApplication.wvars.GetOptChildByKey('state');
				if ( sStateV != undefined && sStateV.value != "" )
				{
					sState = sStateV.value;
					switch( sState )
					{
						case "work":
							sState = "active";
							break;
					}
				}

				if ( teApplication.wvars.GetOptChildByKey('day_type') != undefined && teApplication.wvars.GetOptChildByKey('day_type').value == "working" )
					sDayType = "working";

				if ( sTDPMergeType == 'by_application' )
				{
					if ( teApplication.wvars.GetOptChildByKey('merge_type') != undefined && teApplication.wvars.GetOptChildByKey('merge_type').value == "serial" )
						sTDPMergeType = "serial";
					else if ( teApplication.wvars.GetOptChildByKey('merge_type') != undefined && teApplication.wvars.GetOptChildByKey('merge_type').value == "parallel" )
						sTDPMergeType = "parallel";
				}					
			}
		}
		else
		{
			if(sTDPMergeType == 'by_application')
				sTDPMergeType = "parallel";
		}
		var iExternalDepth = iExternalDepthDay * 86400;
		var iInternalDepth = iInternalDepthDay * 86400; 
		
		var arrEnrolledPersonIDs = [];
		
		var tePerson, dHireDate, dPositionDate, xqPosition;
		var arrCurPositions, arrPositionCommons, arrPositionFamilies;
		var oEnrolledPerson;
// toLog("CreateAdaptations: arrPersonIDs:\r\n" + EncodeJson(arrPersonIDs))

		var xarrAdaptations = XQuery( "for $elem in career_reserves where MatchSome( $elem/person_id, ( " + ArrayMerge( arrPersonIDs, "This", "," ) + " ) ) and $elem/position_type = 'adaptation' and MatchSome( $elem/status, ( 'plan', 'active' ) ) return $elem/Fields( 'person_id' )" );
		for(itemPersonID in arrPersonIDs)
		{
			itemPersonID = OptInt(itemPersonID);
			if( ArrayOptFindByKey( xarrAdaptations, itemPersonID, "person_id" ) != undefined )
			{
				continue;
			}
			tePerson = tools.open_doc(itemPersonID).TopElem;
			dHireDate = tePerson.hire_date.HasValue ? tePerson.hire_date.Value : null; 
			dPositionDate = tePerson.position_date.HasValue ? tePerson.position_date.Value : null; 
			if(dPositionDate == null)
			{
				xqPosition = tePerson.position_id.OptForeignElem;
				if(xqPosition != undefined && xqPosition.position_date.HasValue)
					dPositionDate = xqPosition.position_date.Value;
			}
			
			arrCurPositions = tools.xquery("for $elem in positions where $elem/basic_collaborator_id = " + itemPersonID + " return $elem")
			arrPositionCommons = ArrayExtract(ArraySelect(arrCurPositions, "OptInt(This.position_common_id) != undefined"), "This.position_common_id.Value");
			arrPositionFamilies = ArraySelectDistinct(tools_web.parse_multiple_parameter(ArrayMerge(tools.xquery("for $elem in position_commons where MatchSome($elem/id, (" + ArrayMerge(arrPositionCommons, "This", ",") + ")) return $elem"), "This.position_familys", ";")), "This");

			// if(sDepthChoise == 'assign' || (dHireDate != null && DateDiff(Date(), dHireDate) < iExternalDepth))
			if(dHireDate != null && DateDiff(Date(), dHireDate) <= iExternalDepth)
			{
				oEnrolledPerson = {
					id: itemPersonID,
					transfer_mode: "external",
					name: tePerson.fullname,
					position_common_ids: arrPositionCommons,
					position_families_ids: arrPositionFamilies,
					subdivision_id: tePerson.position_parent_id
				};
				arrEnrolledPersonIDs.push(oEnrolledPerson);
			}
			else if((dHireDate != null && DateDiff(Date(), dHireDate) > iExternalDepth) && (dPositionDate != null && DateDiff(Date(), dPositionDate) <= iInternalDepth))
			{
				oEnrolledPerson = {
					id: itemPersonID,
					transfer_mode: "internal",
					name: tePerson.fullname,
					position_common_ids: arrPositionCommons,
					position_families_ids: arrPositionFamilies,
					subdivision_id: tePerson.position_parent_id
				};
				arrEnrolledPersonIDs.push(oEnrolledPerson);
			}
		}
// toLog("CreateAdaptations: arrEnrolledPersonIDs:\r\n" + EncodeJson(arrEnrolledPersonIDs), true)
		
		if(ArrayOptFirstElem(arrEnrolledPersonIDs) == undefined)
			return oRes;
		
		var oProgramChoises = {
			subdivision_group: false,
			position_family: false,
			position_common: false,
			optionally: false
		};
		for(itemProgramChoise in oParam.GetOptProperty("program_choise", []))
		{
			oProgramChoises.SetProperty(itemProgramChoise, true);
		}

		var oTutorsMode = {
			func: false,
			fact: false,
			optionally: false
		};
		for(itemTutorsMode in oParam.GetOptProperty("tutors_mode", []))
		{
			oTutorsMode.SetProperty(itemTutorsMode, true);
		}
		
		var iChoiseTutorBossTypeID = OptInt(oParam.GetOptProperty("tutor_boss_type_id"), null);
		var iAdaptationTutorBossTypeID = RValue(ArrayOptFirstElem(tools.xquery("for $elem in boss_types where $elem/code = 'talent_pool_tutor' return $elem"), {id: null}).id);
		
		var arrSummaryTutors = [];
		
		var docAdaptation, teAdaptation, iAdaptationID;
		var docTDPContainer, arrPersonTDP, arrCurTDP;
		var arrChoiseTDPIDs, oSubdivision, iParenID;
		var arrCurFuncManagers, arrAdaptationTutors, arrChoiseTutorIDs;
		
		for(itemPerson in arrEnrolledPersonIDs)
		{
			// Create adaptation
			docAdaptation = tools.new_doc_by_name("career_reserve");
			docAdaptation.BindToDb(DefaultDb);
			iAdaptationID = docAdaptation.DocID;
			teAdaptation = docAdaptation.TopElem;
			teAdaptation.position_type = 'adaptation';
			teAdaptation.person_id = itemPerson.id
			tools.common_filling('collaborator', teAdaptation.person_id.sd, itemPerson.id);
			
			//teAdaptation.name = itemPerson.name
			switch(oParam.GetOptProperty("start_date_mode", "today"))
			{
				case "today":
					teAdaptation.start_date = DateNewTime(Date());
					break;
				case "tomorrow":
					teAdaptation.start_date = DateNewTime(DateOffset(Date(), 86400));
					break;
				case "optionally":
					teAdaptation.start_date = DateNewTime(OptDate(oParam.GetOptProperty("start_date", Date()), Date()));
					break;
			}
			teAdaptation.readiness_percent = 0;
			teAdaptation.autocalculate_readiness_percent = true;
			teAdaptation.subdivision_id = itemPerson.subdivision_id;
			teAdaptation.status = sState;
			
			// Choise Development programm
			arrPersonTDP = [];
			if(oProgramChoises.subdivision_group)
			{
				for(itemSubdivGroup in ArraySelectDistinct(tools.xquery("for $elem in subdivision_group_subdivisions where $elem/subdivision_id = " + itemPerson.subdivision_id + " return $elem"), "This.subdivision_group_id"))
				{
					docTDPContainer = tools.open_doc(itemSubdivGroup.subdivision_group_id);
					if(docTDPContainer == undefined)
						continue;
					
					arrCurTDP = [];
					if(itemPerson.transfer_mode == 'external')
					{
						arrCurTDP = ArraySelect(docTDPContainer.TopElem.typical_development_programs, "This.job_transfer_type_id == 'ext' || This.job_transfer_type_id == 'any'")
					}
					else if(itemPerson.transfer_mode == 'internal')
					{
						arrCurTDP = ArraySelect(docTDPContainer.TopElem.typical_development_programs, "This.job_transfer_type_id == 'int' || This.job_transfer_type_id == 'any'")
					}
					
					arrPersonTDP = ArrayUnion(arrPersonTDP, ArrayExtract(arrCurTDP, "This.typical_development_program_id.Value"))
				}
			}
			
			if(oProgramChoises.position_family)
			{
				for(itemPositionFamilieID in itemPerson.position_families_ids)
				{
					docTDPContainer = tools.open_doc(itemPositionFamilieID);
					if(docTDPContainer == undefined)
						continue;
					
					arrCurTDP = [];
					if(itemPerson.transfer_mode == 'external')
					{
						arrCurTDP = ArraySelect(docTDPContainer.TopElem.typical_development_programs, "This.job_transfer_type_id == 'ext' || This.job_transfer_type_id == 'any'")
					}
					else if(itemPerson.transfer_mode == 'internal')
					{
						arrCurTDP = ArraySelect(docTDPContainer.TopElem.typical_development_programs, "This.job_transfer_type_id == 'int' || This.job_transfer_type_id == 'any'")
					}
					
					arrPersonTDP = ArrayUnion(arrPersonTDP, ArrayExtract(arrCurTDP, "This.typical_development_program_id.Value"))
				}
			}

			if(oProgramChoises.position_common)
			{
				for(itemPositionCommonID in itemPerson.position_common_ids)
				{
					docTDPContainer = tools.open_doc(itemPositionCommonID);
					if(docTDPContainer == undefined)
						continue;
					
					arrCurTDP = [];
					if(itemPerson.transfer_mode == 'external')
					{
						arrCurTDP = ArraySelect(docTDPContainer.TopElem.typical_development_programs, "This.job_transfer_type_id == 'ext' || This.job_transfer_type_id == 'any'")
					}
					else if(itemPerson.transfer_mode == 'internal')
					{
						arrCurTDP = ArraySelect(docTDPContainer.TopElem.typical_development_programs, "This.job_transfer_type_id == 'int' || This.job_transfer_type_id == 'any'")
					}
					
					arrPersonTDP = ArrayUnion(arrPersonTDP, ArrayExtract(arrCurTDP, "This.typical_development_program_id.Value"))
				}
			}

			if(oProgramChoises.optionally )
			{
				arrChoiseTDPIDs = oParam.GetOptProperty("development_program_ids", null)
				if(arrChoiseTDPIDs != null && ArrayOptFirstElem(arrChoiseTDPIDs) != undefined)
					arrPersonTDP = ArrayUnion(arrPersonTDP, arrChoiseTDPIDs);
			}
			
			arrPersonTDP = ArraySelectDistinct(arrPersonTDP, "This");

			// Create tasks
			oRetAssign = tools.call_code_library_method( 'libTalentPool', 'AssignTypicalPrograms', [ iAdaptationID, teAdaptation, arrPersonTDP, sTDPMergeType, sDayType, {bClearAllTasks: true, CanAddTasks: true} ] );
			if(oRetAssign.error != 0)
			{
				toLog("ERROR: call AssignTypicalPrograms in AddAdaptation: " + itemPerson.name + "(" + itemPerson.id + "): " + oRetAssign.errorText);
				throw "call AssignTypicalPrograms: " + itemPerson.name + "(" + itemPerson.id + "): " + oRetAssign.errorText;
			}
			 
			if( !teAdaptation.plan_readiness_date.HasValue )
			{
				catMaxEndDateTask = ArrayOptMax( ArraySelect( teAdaptation.tasks, "This.plan_date.HasValue" ), "plan_date" );
				if( catMaxEndDateTask != undefined )
				{
					teAdaptation.plan_readiness_date = catMaxEndDateTask.plan_date;
				}
			}
			 
			//Add adaptation tutors
			arrAdaptationTutors = [];
			if(oTutorsMode.fact && itemPerson.subdivision_id.Value != null)
			{
				oSubdivision = ArrayOptFirstElem(tools.xquery("for $elem in subs where $elem/type = 'subdivision' and $elem/id = " + itemPerson.subdivision_id + " return $elem"))
				iParenID = RValue(oSubdivision.parent_id);
				while(true)
				{
					
					arrCurFuncManagers = tools.xquery("for $elem in func_managers where $elem/is_native = true() and ((MatchSome($elem/catalog, ('subdivision','org')) and $elem/object_id = " + RValue(oSubdivision.id) + ") or ($elem/catalog = 'position' and $elem/parent_id = " + RValue(oSubdivision.id) + ")) return $elem");
					if(ArrayOptFirstElem(arrCurFuncManagers) != undefined)
					{
						for(itemFM in arrCurFuncManagers)
						{
							arrAdaptationTutors.push(itemFM.person_id.Value)
						}
						
						break;
					}

					if(!oSubdivision.parent_id.HasValue)
						break;
					
					oSubdivision = ArrayOptFirstElem(tools.xquery("for $elem in subs where MatchSome($elem/type, ('subdivision','org')) and $elem/id = " + iParenID + " return $elem"))
					iParenID = RValue(oSubdivision.parent_id)
				}
			}
			
			if(oTutorsMode.func && iChoiseTutorBossTypeID != null && itemPerson.subdivision_id.Value != null)
			{
				oSubdivision = ArrayOptFirstElem(tools.xquery("for $elem in subs where $elem/type = 'subdivision' and $elem/id = " + itemPerson.subdivision_id + " return $elem"))
				iParenID = RValue(oSubdivision.parent_id);
				while(true)
				{
					
					arrCurFuncManagers = tools.xquery("for $elem in func_managers where $elem/is_native = false() and $elem/boss_type_id = " + iChoiseTutorBossTypeID + " and MatchSome($elem/catalog, ('subdivision','org')) and $elem/object_id = " + RValue(oSubdivision.id) + " return $elem");
					if(ArrayOptFirstElem(arrCurFuncManagers) != undefined)
					{
						for(itemFM in arrCurFuncManagers)
						{
							arrAdaptationTutors.push(itemFM.person_id.Value)
						}
						
						break;
					}

					if(!oSubdivision.parent_id.HasValue)
						break;
					
					oSubdivision = ArrayOptFirstElem(tools.xquery("for $elem in subs where MatchSome($elem/type, ('subdivision','org')) and $elem/id = " + iParenID + " return $elem"))
					iParenID = RValue(oSubdivision.parent_id)
				}
			}
			
			if(oTutorsMode.optionally)
			{
				arrChoiseTutorIDs = oParam.GetOptProperty("tutor_person_ids", null)
				if(arrChoiseTutorIDs != null && ArrayOptFirstElem(arrChoiseTutorIDs) != undefined)
				{
					for(itemFM in arrChoiseTutorIDs)
					{
						arrAdaptationTutors.push(itemFM)
					}
				}
			}
			
			for(itemAdaptationTutorID in ArraySelectDistinct(arrAdaptationTutors, "This"))
			{
				if(teAdaptation.person_id.Value == itemAdaptationTutorID)
					continue;
						
				xmAddTutor = teAdaptation.tutors.ObtainChildByKey(itemAdaptationTutorID);
				tools.common_filling( 'collaborator', xmAddTutor, itemAdaptationTutorID );
				xmAddTutor.boss_type_id = iAdaptationTutorBossTypeID;
			}
			
			arrSummaryTutors = ArrayUnion(arrSummaryTutors, ArrayExtract(teAdaptation.tutors, "This.person_id.Value"))
			
			oRes.count++;
			docAdaptation.Save();
		}
		
		oParam.adaptation = teAdaptation
		
		// Send notification
		create_career_reserve_notification(ArrayExtract(arrEnrolledPersonIDs, "This.id"), arrSummaryTutors, oParam)
	}
	catch(err)
	{
		oRes.error = 501;
		oRes.errorText = "ERROR: CreateAdaptations:\r\n" + err;
	}
	
	return oRes;
}

function create_career_reserve_notification(arrPersonIDs, arrTutorPersonID, oParam)
{
	var bSendNotification = tools_web.is_true(oParam.GetOptProperty("send_notification"));

	if(bSendNotification)
	{
		var oSendTarget = {
			person: false,
			boss: false,
			tutor: false
		};
		for(itemSendTarget in oParam.GetOptProperty("send_target", []))
		{
			oSendTarget.SetProperty(itemSendTarget, true);
		}
		
		var iCollaboratorNotificationID = OptInt(oParam.GetOptProperty("collaborator_notification_id"), null);
		var iBossNotificationID = OptInt(oParam.GetOptProperty("boss_notification_id"), null);

		var sAddText = (oParam.GetOptProperty("custom_option") == 'with_add_text') ? "\r\n" + oParam.GetOptProperty("add_text") : "";
		
		var sTypeCreateNotification = oParam.GetOptProperty("type_create_notification");
		if(sTypeCreateNotification == 'blank')
		{
			var teActiveNotification = OpenNewDoc( 'x-local://wtv/wtv_dlg_notification_template.xml' ).TopElem;
			teActiveNotification.subject = oParam.GetOptProperty("message_subject");
			teActiveNotification.body = oParam.GetOptProperty("message_body");
			teActiveNotification.body_type = oParam.GetOptProperty("message_format", "plane") + sAddText;
			
			teActiveNotification.recipients.ObtainChildByKey( 'in_doc' );
		}
		var arrBosses;
		
		var docDevelopmentProgramTE = null;
		if(oParam.development_program_ids != undefined)
		{
			var iDevelopmentProgramID = IsArray(oParam.development_program_ids) ? ArrayOptFirstElem(oParam.development_program_ids) : OptInt(oParam.development_program_ids, null);
			var docDevelopmentProgram = tools.open_doc(iDevelopmentProgramID);
			
			if(docDevelopmentProgram != undefined)
			{
				docDevelopmentProgramTE = docDevelopmentProgram.TopElem
			}
		}
		
		for(itemPerson in arrPersonIDs)
		{
			arrBosses = tools.call_code_library_method("libMain", "GetUserBosses", [ itemPerson ]).array;

			switch(sTypeCreateNotification)
			{
				case "template":
				{
					if(oSendTarget.person && iCollaboratorNotificationID != null)
					{
						//tools.create_notification(iCollaboratorNotificationID, OptInt(itemPerson)/* ID person*/, sAddText, 0/* ID user*/, null/*objDoc*/, docDevelopmentProgramTE/*objDocSec*/);
						tools.create_notification(iCollaboratorNotificationID, OptInt(itemPerson)/* ID person*/, sAddText, 0/* ID user*/, null/*objDoc*/, oParam.adaptation/*objDocSec*/);

					}
					
					if(oSendTarget.boss && iBossNotificationID != null)
					{
						for(itemBoss in arrBosses)
						{
							tools.create_notification(iBossNotificationID, OptInt(itemBoss.id.Value)/* ID boss*/, sAddText, itemPerson/* ID user*/, null, docDevelopmentProgramTE/*objDocSec*/);
						}
					}
					
					break;
				}
				case "blank":
				{
					if(oSendTarget.person)
					{
						tools.create_notification( 0, itemPerson, '', null, null, null, teActiveNotification );
					}
					
					if(oSendTarget.boss)
					{
						for(itemBoss in arrBosses)
						{
							tools.create_notification( 0, itemBoss.id, '', null, null, null, teActiveNotification );
						}
					}
					
					break;
				}
			}
		}
		
		if(oSendTarget.tutor)
		{
			for(itemTutorID in ArraySelectDistinct(arrTutorPersonID))
			{
				switch(sTypeCreateNotification)
				{
					case "template":
					{
						//tools.create_notification(iBossNotificationID, itemTutorID, sAddText);
						for(itemPerson in arrPersonIDs)
						{
							tools.create_notification(iBossNotificationID, itemTutorID, sAddText, itemPerson, null, oParam.adaptation);
						}
						break;
					}
					case "blank":
					{
						tools.create_notification( 0, itemTutorID, '', null, null, null, teActiveNotification );
						break;
					}
				}
			}
		}
	} 
}

/**
 * @typedef {Object} RedirectParam
 * @memberof Websoft.WT.TalentPool
 * @property {string} type – тип задачи 
 * @property {string} activity_link – Ссылка на активность
 * @property {string} link_msg – Комментарий к ссылке
*/
/**
 * @function RedirectToUrlTalentPool
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Обработка ссылки в LPE.
 * @param {RedirectParam} Param - Параметры
 * @returns {oSimpleRAResult} 
*/
function RedirectToUrlTalentPool(Param)
{
	var oRet = {
		error: 0,
		result: {},
		errorText: ""
	};
	var sType = Param.GetOptProperty("type", null);
	var sMsg = Param.GetOptProperty("link_msg", null);
	
	var sUrl = Param.GetOptProperty("activity_link", null)
	if(sUrl == null) sUrl = Param.GetOptProperty("link", null)

	if(sMsg == "")
		sMsg = "Ссылка отсутствует";
	
	if(sUrl == null)
	{
		oRet.error = 1;
		oRet.errorText = sMsg;
		oRet.result = set_message_action(sMsg, false)
		return oRet;
	}
	
	oRet.result = {
		command: "redirect",
		redirect_url: sUrl
	};
	
	if(sType != null)
	{
		switch(sType)
		{
			case "assessment_appraise":
			case "document_learning":
			case "learning":
			case "test_learning":
			{
				oRet.result = {
					command: "new_window",
                    url: sUrl
				};
				break;
			}
		}
	}

	return oRet;
}

/**
 * @function AddPersonnelCommittee 
 * @memberof Websoft.WT.TalentPool
 * @author KK
 * @description Создание/редактирование кадрового комитета
 * @param {bigint} iPersonnelCommitteeIDParam - ID кадрового комитета
 * @param {oSimpleFieldElem[]} arrFormFields - поля формы
 * @returns {display_form} 
*/
function AddPersonnelCommittee(iPersonnelCommitteeIDParam, arrFormFieldsParam, curUserID)
{
	var oRes = tools.get_code_library_result_object();
	oRes.result = {};
	oRes.id = iPersonnelCommitteeIDParam;

	var bIsNew = false;
	var docPersonnelCommittee = tools.open_doc(iPersonnelCommitteeIDParam);
	if( docPersonnelCommittee == undefined )
	{
		docPersonnelCommittee = tools.new_doc_by_name('personnel_committee');
		docPersonnelCommittee.BindToDb( DefaultDb );
		bIsNew = true;
		oRes.id = docPersonnelCommittee.DocID;
	}
	
	
	for(oFormField in arrFormFieldsParam)
	{
		switch(oFormField.name)
		{
			case "name":
				docPersonnelCommittee.TopElem.name = Trim(oFormField.value);
				break;
			case "committee_date":
				docPersonnelCommittee.TopElem.committee_date = ParseDate(oFormField.value);
				break;
			case "end_date":
				docPersonnelCommittee.TopElem.end_date = ParseDate(oFormField.value);
				break;
			case "status":
				docPersonnelCommittee.TopElem.status = Trim(oFormField.value);
				break;
			case "desc":
				docPersonnelCommittee.TopElem.desc = Trim(oFormField.value);
				break;
		}
	}
	
	docPersonnelCommittee.Save();
	
	if(bIsNew)
	{
		var docCommitteeMember = tools.new_doc_by_name('committee_member');
		docCommitteeMember.BindToDb( DefaultDb );
		
		docCommitteeMember.TopElem.catalog = 'collaborator';
		docCommitteeMember.TopElem.object_id = curUserID;
		docCommitteeMember.TopElem.committee_member_type = 'participant';
		docCommitteeMember.TopElem.status = 'confirmed';
		docCommitteeMember.TopElem.personnel_committee_id = docPersonnelCommittee.DocID;
		
		var sCurUserName = ArrayOptFirstElem(tools.xquery("for $elem in collaborators where $elem/id = " + curUserID + " return $elem"),{fullname: null}).fullname;
		docCommitteeMember.TopElem.object_name = sCurUserName;
		
		docCommitteeMember.Save();
	}
	
	return oRes;
}

/**
 * @function AddPersonnelCommitteeCandidate 
 * @memberof Websoft.WT.TalentPool
 * @author KK
 * @description Кадровый резерв / Кадровый комитет / Добавить в состав комитета
 * @param {bigint} iPersonnelCommitteeIDParam - ID кадрового комитета
 * @param {oSimpleFieldElem[]} arrFormFields - поля формы
 * @returns {select_object} 
*/
function AddPersonnelCommitteeCandidate(iPersonnelCommitteeIDParam, arrFormFieldsParam)
{
	var oRes = tools.get_code_library_result_object();
	oRes.result = {};
	
	var docPersonnelCommittee = tools.open_doc(iPersonnelCommitteeIDParam);
	
	if(!StrContains("plan,project",Trim(docPersonnelCommittee.TopElem.status)))
	{
		oRes.result =
			{
				command: "close_form",
				msg: "Изменить состав можно, если статус карточки равен: Проект, Формируется."
			}
	}
	else if(  ArrayCount(arrFormFieldsParam)>0 )
	{
		sSelectedObjectIDs="";
		for(oFormField in arrFormFieldsParam)
		{
			switch(oFormField.name)
			{
				case "selected_object_ids":
					sSelectedObjectIDs = Trim(oFormField.value);
			}
		}
		
		var sReqCollaborators = "for $elem in collaborators where MatchSome($elem/id,(" + StrReplace(sSelectedObjectIDs,";",",") + ")) return $elem";
		var arrCollaborators = tools.xquery(sReqCollaborators)
		var sReqCandidate = "for $elem in committee_members where $elem/personnel_committee_id="+iPersonnelCommitteeIDParam+" and $elem/committee_member_type='candidate' return $elem";
		var arrCandidate = tools.xquery(sReqCandidate)
		
		for(_coll in arrCollaborators)
		{
			if(ArrayOptFirstElem(tools.xquery("for $elem in committee_members where $elem/personnel_committee_id="+iPersonnelCommitteeIDParam+" and $elem/object_id="+_coll.id+" and $elem/committee_member_type='candidate' return $elem"))!=undefined)
				continue;
			
			docCommitteeMember = tools.new_doc_by_name('committee_member');
			docCommitteeMember.BindToDb( DefaultDb );
			docCommitteeMember.TopElem.catalog="collaborator";
			docCommitteeMember.TopElem.object_id=_coll.id;
			docCommitteeMember.TopElem.object_name=_coll.fullname;
			docCommitteeMember.TopElem.committee_member_type="candidate";
			docCommitteeMember.TopElem.status="confirmed";
			docCommitteeMember.TopElem.personnel_committee_id=iPersonnelCommitteeIDParam;
			docCommitteeMember.Save();
		}
		
		for(_res in arrCandidate)
		{
			if(!StrContains(sSelectedObjectIDs,_res.object_id))
				DeleteDoc(UrlFromDocID(_res.id));
		}
		
		oRes.result = {
				command: "refresh",
				hex_widget_id:"0x6202CC9B2D1B681D"
			};
	}
	else
	{
		var sReqCandidate = "for $elem in committee_members where $elem/personnel_committee_id="+iPersonnelCommitteeIDParam+" and $elem/committee_member_type='candidate' return $elem";
		arrCandidate = tools.xquery(sReqCandidate)
		oRes.result = {
			command: "select_object",
			catalog_name: "collaborator",
			doc_id: "",
			xquery_qual: "",
			multi_select: true,
			title: "Выберите сотрудников",
			selected_object_ids: (""+ArrayMerge(arrCandidate,"This.object_id",";"))
		}
	}
	
	return oRes;
}

/**
 * @function AddPersonnelCommitteeParticipant 
 * @memberof Websoft.WT.TalentPool
 * @author KK
 * @description Кадровый резерв / Кадровый комитет / Добавить в состав рассматриваемых
 * @param {bigint} iPersonnelCommitteeIDParam - ID кадрового комитета
 * @param {oSimpleFieldElem[]} arrFormFields - поля формы
 * @returns {select_object} 
*/
function AddPersonnelCommitteeParticipant(iPersonnelCommitteeIDParam, arrFormFieldsParam)
{
	var oRes = tools.get_code_library_result_object();
	oRes.result = {};
	
	var docPersonnelCommittee = tools.open_doc(iPersonnelCommitteeIDParam);
	
	if(!StrContains("plan,project",Trim(docPersonnelCommittee.TopElem.status)))
	{
		oRes.result =
			{
				command: "close_form",
				msg: "Изменить состав можно, если статус карточки равен: Проект, Формируется."
			}
	}
	else if(  ArrayCount(arrFormFieldsParam)>0 )
	{
		sSelectedObjectIDs="";
		for(oFormField in arrFormFieldsParam)
		{
			switch(oFormField.name)
			{
				case "selected_object_ids":
					sSelectedObjectIDs = Trim(oFormField.value);
			}
		}
		
		var sReqCollaborators = "for $elem in collaborators where MatchSome($elem/id,(" + StrReplace(sSelectedObjectIDs,";",",") + ")) return $elem";
		var arrCollaborators = tools.xquery(sReqCollaborators)
		var sReqCandidate = "for $elem in committee_members where $elem/personnel_committee_id="+iPersonnelCommitteeIDParam+" and $elem/committee_member_type='participant' return $elem";
		var arrCandidate = tools.xquery(sReqCandidate)

		for(_coll in arrCollaborators)
		{
			if(ArrayOptFirstElem(tools.xquery("for $elem in committee_members where $elem/personnel_committee_id="+iPersonnelCommitteeIDParam+" and $elem/object_id="+_coll.id+" and $elem/committee_member_type='participant' return $elem"))!=undefined)
				continue;
			
			docCommitteeMember = tools.new_doc_by_name('committee_member');
			docCommitteeMember.BindToDb( DefaultDb );
			docCommitteeMember.TopElem.catalog="collaborator";
			docCommitteeMember.TopElem.object_id=_coll.id;
			docCommitteeMember.TopElem.object_name=_coll.fullname;
			docCommitteeMember.TopElem.committee_member_type="participant";
			docCommitteeMember.TopElem.status="not_confirmed";
			docCommitteeMember.TopElem.personnel_committee_id=iPersonnelCommitteeIDParam;
			docCommitteeMember.Save();
		}
		
		for(_res in arrCandidate)
		{
			if(!StrContains(sSelectedObjectIDs,_res.object_id))
				DeleteDoc(UrlFromDocID(_res.id));
		}
		
		oRes.result = {
				command: "refresh",
				hex_widget_id:"0x6202CC9B2D1B681E"
			};
	}
	else
	{
		var sReqCandidate = "for $elem in committee_members where $elem/personnel_committee_id="+iPersonnelCommitteeIDParam+" and $elem/committee_member_type='participant' return $elem";
		arrCandidate = tools.xquery(sReqCandidate)
		oRes.result = {
			command: "select_object",
			catalog_name: "collaborator",
			doc_id: "",
			xquery_qual: "",
			multi_select: true,
			title: "Выберите сотрудников",
			selected_object_ids: (""+ArrayMerge(arrCandidate,"This.object_id",";"))
		}
	}
	
	return oRes;
}

/**
 * @function AddPersonnelCommitteeParticipantForRequest 
 * @memberof Websoft.WT.TalentPool
 * @author KK
 * @description Кадровый резерв / Кадровый комитет / Добавить в состав рассматриваемых по заявкам
 * @param {bigint} iPersonnelCommitteeIDParam - ID кадрового комитета
 * @param {oSimpleFieldElem[]} arrFormFields - поля формы
 * @returns {select_object} 
*/
function AddPersonnelCommitteeParticipantForRequest(iPersonnelCommitteeIDParam, arrFormFieldsParam)
{
	var oRes = tools.get_code_library_result_object();
	oRes.result = {};
	
	var docPersonnelCommittee = tools.open_doc(iPersonnelCommitteeIDParam);
	
	if(!StrContains("plan,project",Trim(docPersonnelCommittee.TopElem.status)))
	{
		oRes.result =
			{
				command: "close_form",
				msg: "Изменить состав можно, если статус карточки равен: Проект, Формируется."
			}
	}
	else if( ArrayCount(arrFormFieldsParam)>0 )
	{
		sSelectedObjectIDs="";
		for(oFormField in arrFormFieldsParam)
		{
			switch(oFormField.name)
			{
				case "selected_object_ids":
					sSelectedObjectIDs = Trim(oFormField.value);
			}
		}
		
		arrRequests = tools.xquery("for $elem in requests where MatchSome($elem/id,(" + StrReplace(sSelectedObjectIDs,";",",") + ")) return $elem");
		arrCandidate = tools.xquery("for $elem in committee_members where $elem/personnel_committee_id="+iPersonnelCommitteeIDParam+" and $elem/committee_member_type='participant' return $elem");
		
		for(_req in arrRequests)
		{
			if(ArrayOptFirstElem(tools.xquery("for $elem in committee_members where $elem/personnel_committee_id="+iPersonnelCommitteeIDParam+" and $elem/object_id="+_req.person_id+" and $elem/committee_member_type='participant' return $elem"))!=undefined)
				continue;
			
			docCommitteeMember = tools.new_doc_by_name('committee_member');
			docCommitteeMember.BindToDb( DefaultDb );
			docCommitteeMember.TopElem.catalog="collaborator";
			docCommitteeMember.TopElem.object_id=_req.person_id;
			docCommitteeMember.TopElem.object_name=_req.person_fullname;
			docCommitteeMember.TopElem.committee_member_type="participant";
			docCommitteeMember.TopElem.status="not_confirmed";
			docCommitteeMember.TopElem.personnel_committee_id=iPersonnelCommitteeIDParam;
			docCommitteeMember.Save();
		}
		
		oRes.result = 
		{
			command: "refresh",
			hex_widget_id:"0x6202CC9B2D1B681D"
		};
	}
	else
	{
		fldRequestTypes = ArrayOptFirstElem(tools.xquery("for $elem in request_types where $elem/code='request_personnel_committee' return $elem"));
		arrCandidate = tools.xquery("for $elem in committee_members where $elem/personnel_committee_id="+iPersonnelCommitteeIDParam+" and $elem/committee_member_type='participant' return $elem");
		oRes.result =
		{
			command: "select_object",
			catalog_name: "request",
			doc_id: "",
			xquery_qual: "($elem/request_type_id="+(fldRequestTypes!=undefined ? fldRequestTypes.id : "")+")",
			multi_select: true,
			title: "Выберите заявки",
			selected_object_ids: "" //(""+ArrayMerge(arrCandidate,"This.object_id",";"))
		}
	}
	
	return oRes;
}

/**
 * @function DeletePersonnelCommittee 
 * @memberof Websoft.WT.TalentPool
 * @author KK IG
 * @description Кадровый резерв / Кадровый комитет / Удаление кадрового комитета
 * @param {bigint} arrPersonnelCommitteeIDs - Массив ID кадровых комитетов, подлежащих удалению
 * @returns {select_object} 
*/
function DeletePersonnelCommittee(arrPersonnelCommitteeIDs)
{
	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	var countHasObject = 0

	if(!IsArray(arrPersonnelCommitteeIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}
	
	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrPersonnelCommitteeIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "personnel_committee")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID кадровых комитетов или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iPersonnelCommitteeID in arrPersonnelCommitteeIDs)
	{
		try
		{
			iPersonnelCommitteeID = OptInt(iPersonnelCommitteeID);

			/*
				Для каждого кадрового комитета проверяется, есть или нет в нем хотя бы один участник с любым типом (Участник или Кандидат).  
				Если есть, то кадровый комитет пропускается. Если нет, то он удаляется.
			*/
			sSQL = "for $elem in committee_members where contains( $elem/personnel_committee_id, ('" + XQueryLiteral(iPersonnelCommitteeID) + "') ) return $elem/Fields('id')"
			sPersonnelCommitteeObjectID = ArrayOptFirstElem(tools.xquery(sSQL));

			if (sPersonnelCommitteeObjectID != undefined){
				continue;
			}

			sSQL = "for $elem in personnel_committees where contains( $elem/id, ('" + XQueryLiteral(iPersonnelCommitteeID) + "') ) return $elem/Fields('id')"

			sPersonnelCommitteeObjectID = ArrayOptFirstElem(tools.xquery(sSQL));

			if (sPersonnelCommitteeObjectID == undefined){
				continue;
			}
			
			DeleteDoc( UrlFromDocID( iPersonnelCommitteeID ), false);
			oRes.count++;
		}
		catch(err)
		{
			toLog("ERROR: DeleteTutors: " + ("[" + iPersonnelCommitteeID + "]\r\n") + err, true);
		}
	}

	return oRes;
}

/**
 * @function ConfirmedCommitteeMember 
 * @memberof Websoft.WT.TalentPool
 * @author KK
 * @description Участник кадрового комитета - подтверждение
 * @param {bigint} iCommitteeMemberIDParam - ID кадрового комитета
 * @returns {select_object} 
*/
function ConfirmedCommitteeMember(iCommitteeMemberIDParam)
{
	var oRes = tools.get_code_library_result_object();
	oRes.result = {};
	
	var docCommitteeMember = tools.open_doc(iCommitteeMemberIDParam);
	docCommitteeMember.TopElem.status="confirmed";
	docCommitteeMember.Save();

	oRes.result = {
			command: "refresh",
			source_widget: true
			//hex_widget_id: "0x6202CC9B2D1B681D"
		};
	
	return oRes;
}

/**
 * @function RejectedCommitteeMember 
 * @memberof Websoft.WT.TalentPool
 * @author KK
 * @description Участник кадрового комитета - отклонение
 * @param {bigint} iCommitteeMemberIDParam - ID кадрового комитета
 * @returns {select_object} 
*/
function RejectedCommitteeMember(iCommitteeMemberIDParam)
{
	var oRes = tools.get_code_library_result_object();
	oRes.result = {};
	
	var docCommitteeMember = tools.open_doc(iCommitteeMemberIDParam);
	docCommitteeMember.TopElem.status="rejected";
	docCommitteeMember.Save();

	oRes.result = {
			command: "refresh",
			source_widget: true
			//hex_widget_id: "0x6202CC9B2D1B681D"
		};
	
	return oRes;
}

// ======================================================================================
// ============================  Обработчики системных событий ==========================
// ======================================================================================


/**
 * @function HandleEventFinishPool
 * @author BG
 * @memberof Websoft.WT.TalentPool
 * @param {number} iPersonID - ID сотрудника.
 * @param {number} iPollID - ID опроса.
 * @param {number} iPollResultID - ID результата опроса.
 * @description Событие "Завершение результата опроса" - изменение статусов задач в плане деятельности.
*/
function HandleEventFinishPool(iPersonID, iPollID, iPollResultID)
{
	iPersonID = OptInt(iPersonID);
	iPollID = OptInt(iPollID);
	iPollResultID = OptInt(iPollResultID);

	if (iPersonID != undefined)
	{
		if (iPollID == undefined)
		{
			toLog("ERROR: HandleEventFinishPool: отсутствует id опроса", true);
			return;
		}

		var dPoll = tools.open_doc(iPollID);
		if (dPoll != undefined)
		{
			var sReqCareerReserves = "for $elem in career_reserves where MatchSome($elem/status, ('plan','active')) and $elem/person_id = " + iPersonID + " return $elem/Fields('id')";
			var arrCareerReserves = tools.xquery(sReqCareerReserves);
			var docCareerReserve, arrTasks, sTasksCond, arrPollTasks, arrPollSiblingTasks, curStage, bDoSave;
			for(itemCR in arrCareerReserves)
			{
				docCareerReserve = tools.open_doc(itemCR.id);
				bDoSave = false;
				arrTasks = docCareerReserve.TopElem.tasks;
				sTasksCond = "(This.status == 'plan' || This.status == 'active') && (This.type == 'poll' || This.type == 'poll_procedure') && " + (iPollResultID == undefined ? "This.object_id == " + iPollID : "(This.object_id == " + iPollID + " || This.poll_result_id == " + iPollResultID + ")");
				arrPollTasks = ArraySelect(arrTasks, sTasksCond);
				for(itemTask in arrPollTasks)
				{
					itemTask.status = 'passed';
					bDoSave = true;
					if(itemTask.parent_task_id.HasValue)
					{
						curStage = ArrayFind(arrTasks, "This.id == " + CodeLiteral(itemTask.parent_task_id.Value));
						if(curStage != undefined)
						{
							arrPollSiblingTasks = ArraySelect(arrTasks, "This.parent_task_id == " + CodeLiteral(itemTask.parent_task_id.Value) + " && This.status != 'cancel'");
							if(ArrayOptFind(arrPollSiblingTasks, "This.status != 'passed'") == undefined) // нет ничего кроме завершенных успешно
							{
								curStage.status = 'passed';
							}
							else if(ArrayOptFind(arrPollSiblingTasks, "This.status == 'failed'") != undefined && ArrayOptFind(arrPollSiblingTasks, "This.status != 'failed' || This.status != 'passed'") == undefined) // есть завершенные неуспешно и нет незавершенных
							{
								curStage.status = 'failed';
							}
							else if(curStage.status == 'plan' && DateNewTime(Date(curStage.start_date)) < Date()) //наступила плановая дата начала этапа
							{
								curStage.status = 'active';
							}
						}
					}
				}
				docCareerReserve.Save();
			}
		}
		else
		{
			toLog("ERROR: HandleEventFinishPool: не удалось открыть карточку опроса", true);
			return;
		}
	}
}

/**
 * @function HandleEventFinishCourseTest
 * @author AKH
 * @memberof Websoft.WT.TalentPool
 * @param {object} objectDoc - TopElem курса/теста.
 * @param {object} learningDoc - TopElem законченного электронного курса/теста.
 * @description Событие "Завершение электронного курса/теста" - изменение статусов задач в плане деятельности.
*/
function HandleEventFinishCourseTest(objectDoc, learningDoc, oParams)
{
	try 
	{
		if ( objectDoc == null || objectDoc == undefined || objectDoc == "" )
			throw '';
	}
	catch(e) 
	{
		objectDoc = null;
	}

	try 
	{
		if ( learningDoc == null || learningDoc == undefined || learningDoc == "" ) 
			throw '';
	} 
	catch(e) 
	{
		learningDoc = null;
	}
	
	try
	{
		if ( DataType( oParams ) != "object" || ObjectType( oParams ) != "JsObject" )
			throw "";
	}
	catch( e )
	{
		oParams = {};
	}
	
	var iObjectID = undefined;
	var objName = "";
	var obj_type = "";
	var iObjState = 1;
	var oActiveTest = undefined;

	if (objectDoc != null && learningDoc != null) 
	{
		var iPersonID = learningDoc.person_id.HasValue ? OptInt(learningDoc.person_id.Value) : undefined;
		
		if (objectDoc.Name == 'course')
		{
			objName = 'курс';
			obj_type = 'course';
			iObjectID = learningDoc.course_id.HasValue ? OptInt(learningDoc.course_id.Value) : undefined;
			iObjState = learningDoc.state_id;
		}
		else
		{
			objName = 'тест';
			obj_type = 'assessment';
			iObjectID = learningDoc.assessment_id.HasValue ? OptInt(learningDoc.assessment_id.Value) : undefined;
			if ( learningDoc.Name == 'test_learning' && learningDoc.active_test_learning_id.HasValue )
			{
				oActiveTest = tools.open_doc( learningDoc.active_test_learning_id );
				if ( oActiveTest != undefined )
				{
					oActiveTest = oActiveTest.TopElem;
				}
			}
			else
			{
				oActiveTest = learningDoc;
			}
			
			if ( oActiveTest == undefined )
			{
				iObjState = learningDoc.state_id;
			}
			else if ( !tools_web.is_true( oParams.GetOptProperty( "bNoFullAttempts", true ) ) || !tools_web.is_true( oParams.GetOptProperty( "flagCreateLearning", true ) ) && !tools_web.is_true( oParams.GetOptProperty( "bExpertEval", false ) ) )
			{
				iObjState = learningDoc.state_id;
			}
		}
		
		if (iPersonID == undefined) {
			toLog("ERROR: HandleEventFinishCourseTest: отсутствует id сотрудника", true);
			return;
		}

		if (iObjectID == undefined) {
			toLog("ERROR: HandleEventFinishCourseTest: отсутствует id " + objName + "а", true);
			return;
		}
		
		xarrCareerReserve = tools.xquery("for $elem in career_reserves where $elem/person_id = " + CodeLiteral(iPersonID) + " and MatchSome($elem/status, ('active', 'plan')) return $elem");
		
		if (ArrayOptFirstElem(xarrCareerReserve) != undefined)
		{
			for (catCareerReserve in xarrCareerReserve)
			{
				docCareerReserve = tools.open_doc(catCareerReserve.id);
				teCareerReserve = docCareerReserve.TopElem;
				
				taskCourse = ArrayOptFind(teCareerReserve.tasks, "This.object_type == " + CodeLiteral(obj_type) + " && This.object_id == " + CodeLiteral(iObjectID));
				
				if ( taskCourse != undefined)
				{
					if (iObjState == 4)
						taskCourse.status = 'passed'
					else if (iObjState == 3)
						taskCourse.status = 'failed';
					
					if ( taskCourse.parent_task_id.HasValue )
					{
						oParentTask = ArrayOptFind(teCareerReserve.tasks, "This.id == " + CodeLiteral(taskCourse.parent_task_id.Value));
						
						if ( oParentTask != undefined )
						{
							arrTasksForParentTask = ArraySelect(teCareerReserve.tasks, "This.parent_task_id == " + CodeLiteral(oParentTask.id.Value));
						
							arrFailedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'failed'");
							arrPassedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'passed'");
							
							if (ArrayOptFirstElem(arrFailedTasks) != undefined)
							{
								oParentTask.status = 'failed';
							}
							else if (ArrayCount(arrPassedTasks) == ArrayCount( arrTasksForParentTask ))
							{
								oParentTask.status = 'passed';
							}
							else 
							{
								if ( !oParentTask.start_date.HasValue || OptDate( oParentTask.start_date ) == undefined || Date( oParentTask.start_date ) < Date() )
								{
									oParentTask.status = 'active';
								}
							}
						}
					}
					docCareerReserve.Save();
				}
			}
		}
	}
}

/**
 * @function HandleEventChangeStatusEvent
 * @author AKH
 * @memberof Websoft.WT.TalentPool
 * @param {object} docEvent - TopElem мероприятия.
 * @param {string} sNewStatus - статус мероприятия после изменения.
 * @description Событие "Изменение статуса мероприятия" - изменение статусов задач в плане деятельности.
*/
function HandleEventChangeStatusEvent(docEvent, sNewStatus)
{
	try 
	{
		if (docEvent == undefined || docEvent == null || docEvent == '') 
			throw '';
	}
	catch(e) 
	{
		docEvent = null;
	}

	try 
	{
		if (sNewStatus == undefined || sNewStatus == null || sNewStatus == '') 
			throw '';
		
		sNewStatus = String(sNewStatus);
	} 
	catch(e) 
	{
		sNewStatus = null;
	}
	
	if (docEvent != null && sNewStatus != null) 
	{
		if (docEvent.type_id == 'education_method' && sNewStatus == 'active')
		{
			xarrCareerReserve = tools.xquery("for $elem in career_reserves where MatchSome($elem/person_id, (" + ArrayMerge(docEvent.collaborators, 'This.collaborator_id', ',') + ")) and MatchSome($elem/status, ('active', 'plan')) return $elem/Fields('id')");
			
			if (ArrayOptFirstElem(xarrCareerReserve) != undefined)
			{
				for (catCareerReserve in xarrCareerReserve)
				{
					docCareerReserve = tools.open_doc(catCareerReserve.id);
					teCareerReserve = docCareerReserve.TopElem;
					
					task = ArrayOptFind(teCareerReserve.tasks, "This.object_type == 'education_method' && This.object_id == docEvent.education_method_id");
					
					if (task != undefined)
					{
						task.status = 'active';
						docCareerReserve.Save();
					}
				}
			}
		}
	}
}

/**
 * @function HandleEventChangeStatusTask
 * @author AKH
 * @memberof Websoft.WT.TalentPool
 * @param {object} docTask - TopElem задачи.
 * @description Событие "Изменение статуса задачи" - изменение статусов задач в плане деятельности.
*/
function HandleEventChangeStatusTask(docTask)
{
	try 
	{
		if (docTask == undefined || docTask == null || docTask == '') 
			throw '';
	}
	catch(e) 
	{
		docTask = null;
	}
	
	if (docTask != null) 
	{
		var iPersonID = docTask.executor_id.HasValue ? OptInt(docTask.executor_id.Value) : undefined;
		if (iPersonID == undefined) {
			toLog("ERROR: HandleEventChangeStatusTask: отсутствует id сотрудника", true);
			return;
		}
		
		var iTaskTypeID = docTask.task_type_id.HasValue ? OptInt(docTask.task_type_id.Value) : undefined;
		if (iTaskTypeID == undefined) {
			toLog("ERROR: HandleEventChangeStatusTask: не указан тип задачи", true);
			return;
		}
		
		xarrCareerReserve = tools.xquery("for $elem in career_reserves where $elem/person_id = " + iPersonID + " and MatchSome($elem/status, ('active', 'plan')) return $elem/Fields('id')");
		if (ArrayOptFirstElem(xarrCareerReserve) != undefined)
		{
			for (catCareerReserve in xarrCareerReserve)
			{
				docCareerReserve = tools.open_doc(catCareerReserve.id);
				teCareerReserve = docCareerReserve.TopElem;
				
				task = ArrayOptFind(teCareerReserve.tasks, "This.type == 'task' && This.object_id == " + CodeLiteral(docTask.task_type_id.Value));
				
				if (task != undefined)
				{
					if (docTask.status == '0')
						task.status = 'active';
					if (docTask.status == '1')
					{
						task.status = 'passed';
						if ( task.parent_task_id.HasValue )
						{
							oParentTask = ArrayOptFind(teCareerReserve.tasks, "This.id == " + CodeLiteral(task.parent_task_id.Value));
							if ( oParentTask != undefined )	
							{
								
								arrTasksForParentTask = ArraySelect(teCareerReserve.tasks, "This.parent_task_id == " + CodeLiteral(oParentTask.id.Value));
							
								arrFailedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'failed'");
								arrPassedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'passed'");
								
								if (ArrayOptFirstElem(arrFailedTasks) != undefined)
								{
									oParentTask.status = 'failed';
								}
								else if (ArrayCount(arrPassedTasks) == ArrayCount( arrTasksForParentTask ))
								{
									oParentTask.status = 'passed';
								}
								else if ( !oParentTask.start_date.HasValue || OptDate( oParentTask.start_date ) == undefined || Date( oParentTask.start_date ) < Date() )
								{
									oParentTask.status = 'active';
								}
							}
						}
					}
					docCareerReserve.Save();
				}
			}
		}
	}
}

/**
 * @function HandleEventFinishEvent
 * @author AKH
 * @memberof Websoft.WT.TalentPool
 * @param {object} docEvent - TopElem мероприятия.
 * @description Событие "Завершение проведения мероприятия" - изменение статусов задач в плане деятельности.
*/
function HandleEventFinishEvent(docEvent)
{
	try 
	{
		if (docEvent == undefined || docEvent == null || docEvent == '') 
			throw '';
	}
	catch(e) 
	{
		docEvent = null;
	}
	
	if (docEvent != null) 
	{
		xarrCareerReserve = tools.xquery("for $elem in career_reserves where MatchSome($elem/person_id, (" + ArrayMerge(docEvent.collaborators, 'This.collaborator_id', ',') + ")) and MatchSome($elem/status, ('active', 'plan')) return $elem/Fields('id')");
			
		if (ArrayOptFirstElem(xarrCareerReserve) != undefined)
		{
			for (catCareerReserve in xarrCareerReserve)
			{
				docCareerReserve = tools.open_doc(catCareerReserve.id);
				teCareerReserve = docCareerReserve.TopElem;
				
				task = ArrayOptFind(teCareerReserve.tasks, "This.type == 'education_method' && This.object_id == " + CodeLiteral(docEvent.education_method_id.Value));
				
				if (task != undefined)
				{
					xarrEventResult = tools.xquery("for $elem in event_results where $elem/event_id = " + XQueryLiteral(docEvent.id) + " and $elem/person_id = " + XQueryLiteral(teCareerReserve.person_id) + " return $elem");
					oEventResult = ArrayOptFirstElem(xarrEventResult);
					if (oEventResult != undefined)
					{
						if (oEventResult.is_assist == true)
							task.status = 'passed';
						else
							task.status = 'failed';
						
						if ( task.parent_task_id.HasValue )
						{
							oParentTask = ArrayOptFind(teCareerReserve.tasks, "This.id == " + CodeLiteral(task.parent_task_id.Value));
							if ( oParentTask != undefined )
							{
								arrTasksForParentTask = ArraySelect(teCareerReserve.tasks, "This.parent_task_id == " + CodeLiteral(oParentTask.id.Value));
								
								arrFailedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'failed'");
								arrPassedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'passed'");
								
								if (ArrayOptFirstElem(arrFailedTasks) != undefined)
								{
									oParentTask.status = 'failed';
								}
								else if (ArrayCount(arrPassedTasks) == ArrayCount( arrTasksForParentTask ))
								{
									oParentTask.status = 'passed';
								}
								else if ( !oParentTask.start_date.HasValue || OptDate( oParentTask.start_date ) == undefined || Date( oParentTask.start_date ) < Date() )
								{
									oParentTask.status = 'active';
								}
							}
						}
					}
					
					docCareerReserve.Save();
				}
			}
		}
	}
}

/**
 * @function HandleEventChangeStatusLearningTaskResult
 * @author AKH
 * @memberof Websoft.WT.TalentPool
 * @param {object} docLearningTaskResult - TopElem выполнения задания.
 * @description Событие "Изменения статуса выполнения задания" - изменение статусов задач в плане деятельности.
*/
function HandleEventChangeStatusLearningTaskResult(docLearningTaskResult)
{
	try 
	{
		if (docLearningTaskResult == undefined || docLearningTaskResult == null || docLearningTaskResult == '') 
			throw '';
	}
	catch(e) 
	{
		docLearningTaskResult = null;
	}
	
	if (docLearningTaskResult != null) 
	{
		xarrCareerReserve = tools.xquery("for $elem in career_reserves where $elem/person_id = " + XqueryLiteral(docLearningTaskResult.person_id) + " and MatchSome($elem/status, ('active', 'plan')) return $elem/Fields('id')");
			
		if (ArrayOptFirstElem(xarrCareerReserve) != undefined)
		{
			for (catCareerReserve in xarrCareerReserve)
			{
				docCareerReserve = tools.open_doc(catCareerReserve.id);
				teCareerReserve = docCareerReserve.TopElem;
				
				task = ArrayOptFind(teCareerReserve.tasks, "This.type == 'learning_task' && This.object_id == " + CodeLiteral(docLearningTaskResult.learning_task_id.Value));
				
				if (task != undefined)
				{
					if (docLearningTaskResult.status_id == 'process')
						task.status = 'active';
					else if (docLearningTaskResult.status_id == 'success')
						task.status = 'passed';
					else if (docLearningTaskResult.status_id == 'failed')
						task.status = 'failed';
					
					if (docLearningTaskResult.status_id == 'success' || docLearningTaskResult.status_id == 'failed' || docLearningTaskResult.status_id == 'cancel')
					{
						if ( task.parent_task_id.HasValue )
						{
							oParentTask = ArrayOptFind(teCareerReserve.tasks, "This.id == " + CodeLiteral(task.parent_task_id.Value));
							if ( oParentTask != undefined )
							{
								arrTasksForParentTask = ArraySelect(teCareerReserve.tasks, "This.parent_task_id == " + CodeLiteral(oParentTask.id.Value));
								
								arrFailedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'failed'");
								arrPassedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'passed'");
								
								if (ArrayOptFirstElem(arrFailedTasks) != undefined)
								{
									oParentTask.status = 'failed';
								}
								else if (ArrayCount(arrPassedTasks) == ArrayCount( arrTasksForParentTask ))
								{
									oParentTask.status = 'passed';
								}
								else if ( !oParentTask.start_date.HasValue || OptDate( oParentTask.start_date ) == undefined || Date( oParentTask.start_date ) < Date() )
								{
									oParentTask.status = 'active';
								}
							}
						}
					}
					docCareerReserve.Save();
				}
			}
		}
	}
}


/**
 * @function HandleEventFinishEducationPlan
 * @author AKH
 * @memberof Websoft.WT.TalentPool
 * @param {object} teEducationPlan - TopElem плана обучения.
 * @description Событие "Завершение плана обучения" - изменение статусов задач в плане деятельности.
*/
function HandleEventFinishEducationPlan(teEducationPlan)
{
	try 
	{
		if (teEducationPlan == undefined || teEducationPlan == null || teEducationPlan == '') 
			throw '';
	}
	catch(e) 
	{
		teEducationPlan = null;
	}
	
	if (teEducationPlan != null)
	{
		iPersonID = teEducationPlan.person_id.HasValue ? OptInt(teEducationPlan.person_id.Value) : undefined;
		if (iPersonID == undefined)
		{
			toLog("ERROR: HandleEventFinishEducationPlan: отсутствует id сотрудника", true);
			return;
		}
		
		xarrCareerReserve = tools.xquery("for $elem in career_reserves where $elem/person_id = " + XQueryLiteral(iPersonID) + " and MatchSome($elem/status, ('active', 'plan')) return $elem/Fields('id')");
		
		if (ArrayOptFirstElem(xarrCareerReserve) != undefined)
		{
			for (catCareerReserve in xarrCareerReserve)
			{
				docCareerReserve = tools.open_doc(catCareerReserve.id);
				teCareerReserve = docCareerReserve.TopElem;
				
				task = ArrayOptFind(teCareerReserve.tasks, "This.type == 'compound_program' && This.object_id == " + CodeLiteral(teEducationPlan.compound_program_id.Value));
				
				if (task != undefined)
				{
					if (teEducationPlan.state_id == 4)
						task.status = 'passed';
					else if (teEducationPlan.state_id == 3)
						task.status = 'failed';
					
					if ( task.parent_task_id.HasValue )
					{
						oParentTask = ArrayOptFind(teCareerReserve.tasks, "This.id == " + CodeLiteral(task.parent_task_id.Value));
						if ( oParentTask != undefined )
						{
							arrTasksForParentTask = ArraySelect(teCareerReserve.tasks, "This.parent_task_id == " + CodeLiteral(oParentTask.id.Value));
							
							arrFailedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'failed'");
							arrPassedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'passed'");
							
							if (ArrayOptFirstElem(arrFailedTasks) != undefined)
							{
								oParentTask.status = 'failed';
							}
							else if (ArrayCount(arrPassedTasks) == ArrayCount( arrTasksForParentTask ))
							{
								oParentTask.status = 'passed';
							}
							else if ( !oParentTask.start_date.HasValue || OptDate( oParentTask.start_date ) == undefined || Date( oParentTask.start_date ) < Date() )
							{
								oParentTask.status = 'active';
							}
						}
					}
					docCareerReserve.Save();
				}
			}
		}
	}
}

/**
 * @function HandleEventFinishLibraryMaterialViewing
 * @author AKH
 * @memberof Websoft.WT.TalentPool
 * @param {object} teLibraryMaterialViewing - TopElem просмотра материала библиотеки.
 * @description Событие "Завершение просмотра материала библиотеки" - изменение статусов задач в плане деятельности.
*/
function HandleEventFinishLibraryMaterialViewing(teLibraryMaterialViewing)
{
	try 
	{
		if (teLibraryMaterialViewing == undefined || teLibraryMaterialViewing == null || teLibraryMaterialViewing == '') 
			throw '';
	}
	catch(e) 
	{
		teLibraryMaterialViewing = null;
	}
	
	if (teLibraryMaterialViewing != null)
	{
		iPersonID = teLibraryMaterialViewing.person_id.HasValue ? OptInt(teLibraryMaterialViewing.person_id.Value) : undefined;
		if (iPersonID == undefined)
		{
			toLog("ERROR: HandleEventFinishLibraryMaterialViewing: отсутствует id сотрудника", true);
			return;
		}
		
		xarrCareerReserve = tools.xquery("for $elem in career_reserves where $elem/person_id = " + XQueryLiteral(iPersonID) + " and MatchSome($elem/status, ('active', 'plan')) return $elem/Fields('id')");
		
		if (ArrayOptFirstElem(xarrCareerReserve) != undefined)
		{
			for (catCareerReserve in xarrCareerReserve)
			{
				docCareerReserve = tools.open_doc(catCareerReserve.id);
				teCareerReserve = docCareerReserve.TopElem;
				
				task = ArrayOptFind(teCareerReserve.tasks, "This.type == 'document_learning' && This.object_id == " + CodeLiteral(teLibraryMaterialViewing.material_id.Value));
				
				if (task != undefined)
				{
					task.status = 'passed';

					if ( task.parent_task_id.HasValue )
					{
						oParentTask = ArrayOptFind(teCareerReserve.tasks, "This.id == " + CodeLiteral(task.parent_task_id.Value));
						if ( oParentTask != undefined )
						{
							arrTasksForParentTask = ArraySelect(teCareerReserve.tasks, "This.parent_task_id == " + CodeLiteral(oParentTask.id.Value));
							
							arrFailedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'failed'");
							arrPassedTasks = ArraySelect(arrTasksForParentTask, "This.status == 'passed'");
							
							if (ArrayOptFirstElem(arrFailedTasks) != undefined)
							{
								oParentTask.status = 'failed';
							}
							else if (ArrayCount(arrPassedTasks) == ArrayCount( arrTasksForParentTask ))
							{
								oParentTask.status = 'passed';
							}
							else if ( !oParentTask.start_date.HasValue || OptDate( oParentTask.start_date ) == undefined || Date( oParentTask.start_date ) < Date() )
							{
									oParentTask.status = 'active';
							}
						}
					}
					docCareerReserve.Save();
				}
			}
		}
	}
}

// ======================================================================================
// ============================  Скалярные показатели ===================================
// ======================================================================================

/**
 * @function GetAdaptationIDByPerson
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение ID адаптации указанного сотрудника.
 * @param {bigint} iObjectIDParam - ID этапа развития карьеры / сотрудника
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @returns {bigint} 
*/
function GetAdaptationIDByPerson(iObjectIDParam, iPersonID)
{
	var iObjectID = OptInt(iObjectIDParam);
	if(iObjectID == undefined)
	{
		try
		{
			iObjectID = get_career_reserve_id_by_person(iPersonID, "adaptation", true);
		}
		catch(err)
		{
			toLog("ERROR: GetAdaptationIDByPerson:\r\n" + err)
			return null;
		}
	}
	else
	{
		var docObject = OpenDoc(UrlFromDocID(iObjectID), "wtv_form_collaborator_access.xmd");
		var sObjectName = docObject.TopElem.Name;
		if(sObjectName == "collaborator")
		{
			try
			{
				iObjectID = get_career_reserve_id_by_person(iObjectID, "adaptation", true);
			}
			catch(err)
			{
				toLog("ERROR: GetAdaptationIDByPerson:\r\n" + err)
				return null;
			}
		}
		else if(sObjectName != "career_reserve")
		{
			iObjectID = null;
		}
	}
	
	return iObjectID;
}

/**
 * @function HasActiveCareerReserveRecord
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Наличие у указанного сотрудника активных адаптаций.
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @returns {boolean} 
*/
function HasActiveCareerReserveRecord(iPersonID, sCareerReserveType)
{
	var arrPersonCareerResreve = get_career_reserve_collection_by_person(iPersonID, sCareerReserveType, ['all'], "person");
		
	return (ArrayOptFind(arrPersonCareerResreve, "This.status == 'active' || This.status == 'plan'") != undefined);
}

/**
 * @function GetDaysBeforeEndCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество дней до окончания этапа развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {integer} 
*/
function GetDaysBeforeEndCareerReserve(iCareerReserveIDParam, iPersonID, sCareerReserveType)
{
	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	var iRet = 0;
	var dFinishDate = OptDate(docAdaptation.TopElem.plan_readiness_date.Value);
	if(dFinishDate != undefined)
	{
		iRet = get_days_between_date(Date(), dFinishDate);  
	}
	
	return iRet;
}

/**
 * @function GetDaysFromStartCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество дней с начала этапа развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {integer} 
*/
function GetDaysFromStartCareerReserve(iCareerReserveIDParam, iPersonID, sCareerReserveType)
{
	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	var iRet = 0;
	var dStartDate = OptDate(docAdaptation.TopElem.start_date.Value);
	if(dStartDate != undefined)
	{
		iRet = get_days_between_date(dStartDate, Date());  
	}
	
	return iRet;
}

/**
 * @function GetDaysInCareerReservePlan
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Плановая длительность программы этапа развития карьеры в днях.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {integer} 
*/
function GetDaysInCareerReservePlan(iCareerReserveIDParam, iPersonID, sCareerReserveType)
{
	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	var iRet = 0;
	var dStartDate = OptDate(docAdaptation.TopElem.start_date.Value);
	var dFinishDate = OptDate(docAdaptation.TopElem.plan_readiness_date.Value);
	if(dStartDate != undefined)
	{
		iRet = get_days_between_date(dStartDate, dFinishDate);  
	}
	
	return iRet;
}

/**
 * @function GetCountStagesCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество корневых этапов в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {integer} 
*/
function GetCountStagesCareerReserve(iCareerReserveIDParam, iPersonID, sCareerReserveType)
{
	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	var arrStages = get_root_stages(get_task_wo_cancel(docAdaptation.TopElem.tasks));
	
	return ArrayCount(arrStages);
}

/**
 * @function GetCountDoneStagesCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество пройденных корневых этапов в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {integer} 
*/
function GetCountDoneStagesCareerReserve(iCareerReserveIDParam, iPersonID, sCareerReserveType)
{
	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	var arrStages = get_root_stages(get_task_wo_cancel(docAdaptation.TopElem.tasks));
	
	return ArrayCount(ArraySelect(arrStages, "This.status != 'active' && This.status != 'plan'"));
}

/**
 * @function GetPercentDoneTasksCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Процент пройденных задач в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {real} 
*/
function GetPercentDoneTasksCareerReserve(iCareerReserveIDParam, iPersonID, sCareerReserveType)
{
	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	if(docAdaptation.TopElem.readiness_percent.HasValue)
		return OptReal(docAdaptation.TopElem.readiness_percent.Value);
	
	var arrAllTasks = get_task_wo_stages(get_task_wo_cancel(docAdaptation.TopElem.tasks));
	var iFullCount = ArrayCount(arrAllTasks);
	
	var rPercent = iFullCount > 0 ? Real(ArrayCount(ArraySelect(arrAllTasks, "This.status != 'active' && This.status != 'plan'")))/Real(iFullCount) : 0.0;
	
	return rPercent*100.0;
}

/**
 * @function GetNameActualStageCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Наименование актуального этапа плана деятельности в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {string} 
*/
function GetNameActualStageCareerReserve(iCareerReserveIDParam, iPersonID, sCareerReserveType)
{
	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	var xAtualStage = get_actual_stage(get_root_stages(docAdaptation.TopElem.tasks))
	
	return xAtualStage != null ? xAtualStage.name.Value : "";
}

/**
 * @function GetDaysBeforeEndActualStageCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество дней до окончания текущего этапа плана деятельности в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {integer} 
*/
function GetDaysBeforeEndActualStageCareerReserve(iCareerReserveIDParam, iPersonID, sCareerReserveType)
{
	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	var xAtualStage = get_actual_stage(get_root_stages(docAdaptation.TopElem.tasks))
	var iRet = 0;
	if(xAtualStage != null)
	{
		var dFinishDate = OptDate(xAtualStage.plan_date.Value);
		if(dFinishDate != undefined)
		{
			iRet = get_days_between_date(Date(), dFinishDate);  
		}
	}
	
	return iRet;
}

/**
 * @function GetCountTasksInCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество задач в текущем этапе или всем плане деятельности в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {boolean} bCheckActualStageParam - true - среди задач текущего этапа
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {integer} 
*/
function GetCountTasksInCareerReserve(iCareerReserveIDParam, iPersonID, bCheckActualStageParam, sCareerReserveType)
{
	var bCheckActualStage = tools_web.is_true(bCheckActualStageParam);

	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	var iRet = 0;
	if(bCheckActualStage)
	{
		var xAtualStage = get_actual_stage(get_root_stages(docAdaptation.TopElem.tasks))
		if(xAtualStage != null)
		{
			var arrTaskInActualStage = ArraySelect(get_task_wo_cancel(docAdaptation.TopElem.tasks), "This.parent_task_id == xAtualStage.id");
			iRet = ArrayCount(arrTaskInActualStage);  
		}		
	}
	else
	{
			iRet = ArrayCount(get_task_wo_cancel(get_task_wo_stages(docAdaptation.TopElem.tasks)));  
	}

	
	return iRet;
}

/**
 * @function GetCountPassedTasksInCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество успешно завершенных задач в текущем этапе или всем плане деятельности в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {boolean} bCheckActualStageParam - true - среди задач текущего этапа
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {integer} 
*/
function GetCountPassedTasksInCareerReserve(iCareerReserveIDParam, iPersonID, bCheckActualStageParam, sCareerReserveType)
{
	var bCheckActualStage = tools_web.is_true(bCheckActualStageParam);

	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	var iRet = 0;
	if(bCheckActualStage)
	{
		var xAtualStage = get_actual_stage(get_root_stages(docAdaptation.TopElem.tasks))
		if(xAtualStage != null)
		{
			var arrTaskInActualStage = ArraySelect(get_task_wo_cancel(docAdaptation.TopElem.tasks), "This.parent_task_id == xAtualStage.id");
			var arrPassedTaskInActualStage = ArraySelect(arrTaskInActualStage, "This.status == 'passed'");
			
			iRet = ArrayCount(arrPassedTaskInActualStage);  
		}
	}
	else
	{
			iRet = ArrayCount(ArraySelect(get_task_wo_cancel(get_task_wo_stages(docAdaptation.TopElem.tasks)), "This.status == 'passed'"));  
	}
	return iRet;
}

/**
 * @function GetPercentPassedTasksCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Процент успешно завершенных задач в текущем этапе.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {boolean} bCheckActualStageParam - true - среди задач текущего этапа
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {real} 
*/
function GetPercentPassedTasksCareerReserve(iCareerReserveIDParam, iPersonID, bCheckActualStageParam, sCareerReserveType)
{
	var bCheckActualStage = tools_web.is_true(bCheckActualStageParam);

	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	var rPercent = 0.0;
	if(bCheckActualStage)
	{
		var xAtualStage = get_actual_stage(get_root_stages(docAdaptation.TopElem.tasks))
		if(xAtualStage != null)
		{
			var arrTaskInActualStage = ArraySelect(get_task_wo_cancel(docAdaptation.TopElem.tasks), "This.parent_task_id == xAtualStage.id");
			var iFullCount = ArrayCount(arrTaskInActualStage);
			
			var arrPassedTaskInActualStage = ArraySelect(arrTaskInActualStage, "This.status == 'passed'");
			if(iFullCount > 0)
				rPercent =  Real(ArrayCount(arrPassedTaskInActualStage))/Real(iFullCount);
		}
	}
	else
	{
			var arrTasks = get_task_wo_cancel(get_task_wo_stages(docAdaptation.TopElem.tasks));
			var iFullCount = ArrayCount(arrTasks);
			
			var arrPassedTaskInActualStage = ArraySelect(arrTasks, "This.status == 'passed'");
			if(iFullCount > 0)
				rPercent =  Real(ArrayCount(arrPassedTaskInActualStage))/Real(iFullCount);
		
	}
	
	return rPercent*100.0;
}

/**
 * @function GetCountActualActivityCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество актуальных (текущих) активностей указанного типа в текущем этапе или всем плане деятельности в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sActivityType - тип активности (каталог)
 * @param {string} sActualizeMode - "date,status" способ актуализации активности "date" - по интервалу дат в задаче, "status" - по статусу задачи + наличию назначенной активности
 * @param {boolean} bCheckActualStageParam - true - среди задач текущего этапа
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {integer} 
*/
function GetCountActualActivityCareerReserve(iCareerReserveIDParam, iPersonID, sActivityType, sActualizeMode, bCheckActualStageParam, sCareerReserveType)
{
	var bCheckActualStage = tools_web.is_true(bCheckActualStageParam);
	
	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docCareerReserve = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docCareerReserve = open_object(iCareerReserveID, "career_reserve");
		iPersonID = docCareerReserve.TopElem.person_id.Value;
	}
		
	var arrAllTasks = docCareerReserve.TopElem.tasks;
	
	var sStageID = null;
	if(bCheckActualStage)
	{
		var xAtualStage = get_actual_stage(get_root_stages(arrAllTasks));
		if(xAtualStage != undefined) sStageID = xAtualStage.id.Value;
	}
	var arrTasksOnly = 	get_task_wo_stages(arrAllTasks);
	var arrNoCancelTasks = get_task_wo_cancel(arrTasksOnly);
	var arrFilter = [{id: "stage_id", name: "stage_id", type: "select", value: sStageID}];
	var srrTaskInStage = get_filtered_tasks(arrNoCancelTasks, arrFilter)
	//var srrTaskInStage = get_filtered_tasks(arrNoCancelTasks, null, sStageID)
	var arrActualTasks = get_actual_activity(arrTaskInStage, iPersonID, sActualizeMode);
	if(sActivityType == "" || sActivityType == null || sActivityType ==undefined)
	{
		var arrResultActualTasks = arrActualTasks;
	}
	else
	{
		var sSelectFilter = (sActivityType == "task") ? "This.type == 'task'" : "This.type != 'task' && (This.type == sActivityType || This.activity_type == sActivityType)";
		var arrResultActualTasks = ArraySelect(arrActualTasks, sSelectFilter);	
	}
	
	return ArrayCount(arrResultActualTasks);
}

/**
 * @function HasExpireTasksInActualStageCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Есть незавершенные задачи в текущем этапе плана деятельности этапа развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {boolean} 
*/
function HasExpireTasksInActualStageCareerReserve(iCareerReserveIDParam, iPersonID, sCareerReserveType)
{
	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	var xAtualStage = get_actual_stage(get_root_stages(docAdaptation.TopElem.tasks))
	
	var arrExpiredTasks = get_expired_task(get_task_wo_stages(get_task_wo_cancel(docAdaptation.TopElem.tasks)), (xAtualStage != null ? xAtualStage.id : null));
	
	return (ArrayOptFirstElem(arrExpiredTasks) != undefined);
}

/**
 * @function GetCountExpireTasksInCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество незавершенных задач в этапе развития карьеры.
 * @param {bigint} iCareerReserveIDParam - ID этапа развития карьеры
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {integer} 
*/
function GetCountExpireTasksInCareerReserve(iCareerReserveIDParam, iPersonID, sCareerReserveType)
{
	iCareerReserveID = OptInt(iCareerReserveIDParam);
	if(iCareerReserveID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docAdaptation = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
	}
	else
	{
		var docAdaptation = open_object(iCareerReserveID, "career_reserve");
	}
	
	var arrExpiredTasks = get_expired_task(get_task_wo_stages(get_task_wo_cancel(docAdaptation.TopElem.tasks)), null);
	
	return ArrayCount(arrExpiredTasks);
}


/**
 * @function GetCountCareerReserveSubordinates
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество этапов развития карьеры подчиненных у руководителя.
 * @param {bigint} iPersonID - ID руководителя
 * @param {boolean} bIsAdaptation - выборка только адаптаций 
 * @param {boolean} bIsActiveOnly - выборка только активных этапов развития карьеры 
 * @param {boolean} bIsCountTrainees - Подсчет сотрудников (true - считать подчиненных, false - считать этапы развития карьеры подчиненных)) 
 * @returns {integer} 
*/

function GetCountCareerReserveSubordinates(iPersonID, bIsAdaptation, bIsActiveOnly, bIsCountTrainees)
{
	bIsAdaptation = tools_web.is_true(bIsAdaptation);
	bIsActiveOnly = tools_web.is_true(bIsActiveOnly);
	bIsCountTrainees = tools_web.is_true(bIsCountTrainees);

	var arrSubordinateIDs = [];
	var type_selector = bIsAdaptation ? " and $elem/position_type='adaptation'" : ""; 
	var active_selector = bIsAdaptation ? " and $elem/status='active'" : ""; 
	var xarrSubordinates = tools.call_code_library_method( "libMain", "GetTypicalSubordinates", [ iPersonID ] );
	var xarrCurCareerReserve = tools.xquery("for $elem in career_reserves where 1=1" + active_selector + type_selector + " return $elem")
	var arrResultSubordinate = ArrayIntersect(xarrSubordinates, xarrCurCareerReserve, "This.id.Value", "This.person_id.Value");
	return ArrayCount(bIsCountTrainees ? arrResultSubordinate : xarrSubordinates);
}

/**
 * @function GetCountCareerReserveTrainee
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество этапов развития карьеры подопечных у наставника.
 * @param {bigint} iPersonID - ID наставника
 * @param {boolean} bIsAdaptation - выборка только адаптаций 
 * @param {boolean} bIsActiveOnly - выборка только активных этапов развития карьеры 
 * @param {boolean} bIsCountTrainees - Подсчет сотрудников (true - считать подопечных, false - считать этапы развития карьеры подопечных)) 
 * @returns {integer} 
*/
function GetCountCareerReserveTrainee(iPersonID, bIsAdaptation, bIsActiveOnly, bIsCountTrainees)
{
	bIsAdaptation = tools_web.is_true(bIsAdaptation);
	bIsActiveOnly = tools_web.is_true(bIsActiveOnly);
	bIsCountTrainees = tools_web.is_true(bIsCountTrainees);
	
	var arrCareerReserves = get_career_reserve_collection_by_person(iPersonID, bIsAdaptation, ['all'], "tutor")
	
	var arrTrainees = [];
	var arrCountCareerReserves = bIsActiveOnly ? ArraySelect(arrCareerReserves, "This.status.Value == 'active'") : arrCareerReserves;
	for(itemCareerReserve in arrCountCareerReserves)
	{
		teCareerReserve = tools.open_doc(itemCareerReserve.id.Value).TopElem;
		for(tasks in teCareerReserve.tasks)
		{
			if(OptInt(tasks.tutor_id.Value) != undefined && Int(tasks.tutor_id.Value) == Int(iPersonID))
			{
				 arrTrainees.push(itemCareerReserve);
				 break;
			}
		}
	}
	
	return ArrayCount(bIsCountTrainees ? ArraySelectDistinct(arrTrainees, "This.person_id.Value") : arrTrainees);
}

/**
 * @function GetCountToHeedTasksByPerson
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество актуальных или просроченных задач в активных этапах развития карьеры подчиненных или подопечных.
 * @param {bigint} iPersonIDParam - ID сотрудника по которому осуществляется выборка этапов развития карьеры
 * @param {string} sPersonType - Отбор по сотруднику (tutor - этапы, где указанный сотрудник является наставником, boss - этапы подчиненных)
 * @param {string} sSelectType - Отбор по типу задач (active - актуальные, expire - просроченные)
 * @param {boolean} bIsAdaptation - выборка только из адаптаций 
 * @returns {integer} 
*/
function GetCountToHeedTasksByPerson(iPersonIDParam, sPersonType, sSelectType, bIsAdaptation, bInActiveCareerResreve)
{
	bIsAdaptation = tools_web.is_true(bIsAdaptation);
	bInActiveCareerResreve = tools_web.is_true(bInActiveCareerResreve);
	var iPersonID = OptInt(iPersonIDParam);
	
	if(iPersonID == undefined)
		throw StrReplace("Передан некорректный ID [{PARAM1}]", "{PARAM1}", iPersonIDParam);
	
	var arrAllTasks = get_all_tasks_talent_pool_by_person(iPersonID, sPersonType, bIsAdaptation, false, false, "date,status");
	var arrRes = [];
	for(fldTask in arrAllTasks)
	{
		if(!bInActiveCareerResreve || fldTask.object.status.Value == "active")
		{
			if(sSelectType == "all")
			{
				arrRes.push(fldTask)
			}
			if(sSelectType == "active" && fldTask.activity.is_active)
			{
				arrRes.push(fldTask)
			}
			else if(sSelectType == "expire" && fldTask.activity.is_expire)
			{
				arrRes.push(fldTask)
			}
		}
	}
	return ArrayCount(arrRes);
}

/**
 * @function GetPercentDoneAdaptationInSubdivision
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Интегральный процент завершенности адаптаций в подразделениях сотрудника.
 * @param {bigint} iPersonIDParam - ID сотрудника подразделения
 * @returns {real} 
*/
function GetPercentDoneAdaptationInSubdivision(iPersonIDParam)
{
	iPersonID = OptInt(iPersonIDParam);
	if(iPersonID == undefined)
		throw StrReplace("Передан некорректный ID сотрудника [{PARAM1}]", "{PARAM1}", iPersonIDParam);

	var arrCareerReserveBySubordinate = tools.xquery("for $elem_qc in career_reserves where MatchSome($elem_qc/person_id, (" + ArrayMerge(get_colleague_by_subdivisions(iPersonID, true, false), "This.basic_collaborator_id.Value", ",") + ")) return $elem_qc");
	var arrAdaptationBySubordinate = ArraySelect(arrCareerReserveBySubordinate, "This.position_type.Value == 'adaptation'");
	var iFullCount = ArrayCount(arrAdaptationBySubordinate);
	if(iFullCount == 0)
		return 0;
	
	var iSumReadinessPercent = ArraySum(arrAdaptationBySubordinate, "This.readiness_percent.Value");

	return iSumReadinessPercent/iFullCount;
}

/**
 * @function GetCountSubordinates
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Количество подчиненных у руководителя.
 * @param {bigint} iPersonID - ID руководителя
 * @returns {integer} 
*/
function GetCountSubordinates(iPersonID)
{
	return ArrayCount(tools.call_code_library_method( "libMain", "GetTypicalSubordinates", [ iPersonID ] ));
}


// ======================================================================================
// ============================  Объектные показатели ===================================
// ======================================================================================

/**
 * @typedef {Object} oMetricCareerReserve
 * @memberof Websoft.WT.TalentPool
 * @property {bigint} id – ID текущего этапа развития карьеры 
 * @property {bigint} PersonId – ID сотрудника в этапе развития карьеры
 * @property {string} PersonFullName – ФИО сотрудника в этапе развития карьеры 
 * @property {string} PersonImgUrl – Ссылка на фото сотрудника 
 * @property {string} PersonPositionName – Наименование должности сотрудника в этапе развития карьеры 
 * @property {string} PersonSubdivisionName – Наименование подразделения сотрудника в этапе развития карьеры  
 * @property {boolean} CurUserIsBoss – Текущий пользователь (curUser) является руководителем сотрудника в этапе развития карьеры  
 * @property {boolean} CurUserIsTutor – Текущий пользователь (curUser) входит в число наставников этапа развития карьеры  
 * @property {boolean} CurUserIsTaskTutor – Текущий пользователь (curUser) входит в число наставников по задачам этапа развития карьеры  
 * @property {boolean} ForbidTasksEdit – Признак запрещенности изменения задач в этапе развития карьеры  
 * @property {date} StartDateCareerReserve – Дата начала этапа развития карьеры 
 * @property {date} FinishDateCareerReserve – Дата окончания этапа развития карьеры 
 * @property {integer} DaysFromStartCareerReserve – Количество дней с начала этапа развития карьеры
 * @property {integer} DaysBeforeEndCareerReserve – Количество дней до окончания этапа развития карьеры 
 * @property {integer} DaysInCareerReserve – Плановая длительность программы этапа развития карьеры в днях
 * @property {integer} CountStagesCareerReserve – Количество корневых этапов этапа развития карьеры
 * @property {integer} CountDoneStagesCareerReserve – Количество пройденных корневых этапов этапа развития карьеры
 * @property {integer} CountFailStagesCareerReserve – Количество не пройденных корневых этапов этапа развития карьеры
 * @property {integer} CountTasksCareerReserve – Количество не отмененных задач в этапе развития карьеры (без этапов плана деятельности)
 * @property {integer} CountPassedTasksCareerReserve – Количество успешно завершенных задач в этапе развития карьеры (без этапов плана деятельности)
 * @property {integer} CountFailedTasksCareerReserve – Количество неуспешно завершенных задач в этапе развития карьеры (без этапов плана деятельности)
 * @property {string} PercentDoneTasksCareerReserve – Процент пройденных задач в этапе развития карьеры (без этапов плана деятельности)
 * @property {string} PercentPassedTasksCareerReserve – Процент успешно завершенных задач в этапе развития карьеры (без этапов плана деятельности)
 * @property {boolean} HasExpireTasksCareerReserve – Есть незавершенные задачи во всем этапе развития карьеры (без этапов плана деятельности)
 * @property {integer} CountExpireTasksCareerReserve – Количество незавершенных задач в этапе развития карьеры (без этапов плана деятельности)
 * @property {string} NameActualStageCareerReserve – Наименование актуального этапа плана деятельности в этапе развития карьеры
 * @property {integer} DaysBeforeEndActualStageCareerReserve – Количество дней до окончания текущего этапа плана деятельности этапа развития карьеры
 * @property {integer} CountTasksActualStageCareerReserve – Количество задач в текущем этапе плана деятельности этапа развития карьеры
 * @property {integer} CountPassedTasksActualStageCareerReserve – Количество успешно завершенных задач в текущем этапе плана деятельности этапа развития карьеры
 * @property {string} PercentPassedTasksActualStageCareerReserve – Процент успешно завершенных задач текущего этапа плана деятельности этапа развития карьеры
 * @property {boolean} HasExpireTasksActualStageCareerReserve – Есть незавершенные (просроченные) задачи в текущем этапе плана деятельности этапа развития карьеры 
 * @property {integer} CountExpireTasksActualStageCareerReserve – Количество незавершенных (просроченных) задач в текущем этапе плана деятельности этапа развития карьеры
 * @property {integer} CountMentorsCareerReserve – Количество наставников этапа развития карьеры
 * @property {boolean} bCanCreateTask – Есть права на создание задачи
 * @property {boolean} bCanEditCareerReserve – Есть права на права на редактирование этапа развития карьеры
*/
/**
 * @function GetObjectMetricCareerReserveByPersonOrID
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Рассчет объектной метрики этапа развития карьеры по сотруднику или ID этапа.
 * @param {bigint} iObjectIDParam - ID текущего объекта (этапа развития карьеры или сотрудника)
 * @param {bigint} iPersonID - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры (default - adaptation)
 * @returns {oMetricCareerReserve}
*/
function GetObjectMetricCareerReserveByPersonOrID(iObjectIDParam, iPersonIDParam, sCareerReserveType)
{
	var iObjectID = OptInt(iObjectIDParam);
	var iPersonID = OptInt(iPersonIDParam);
	if(iObjectID == undefined && iPersonID == undefined)
		throw StrReplace(StrReplace("Не указаны ни корректный ID текущего объекта (PARAM1}), ни ID текущего сотрудника ({PARAM2})", "{PARAM1}", iObjectIDParam), "{PARAM2}", iPersonIDParam);
	
	if(iObjectID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docCareerReserve = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
		var teCareerReserve = docCareerReserve.TopElem;
	}
	else
	{
		var docCareerReserve = open_object(iObjectID, "career_reserve");
		var teCareerReserve = docCareerReserve.TopElem;
		if(iPersonID == undefined)
			iPersonID = teCareerReserve.person_id.Value;
	}
	
	var dFinishDate = OptDate(teCareerReserve.plan_readiness_date.Value, null);
	var dStartDate = OptDate(teCareerReserve.start_date.Value, null);
	
	var bIsSelf = (iPersonIDParam == teCareerReserve.person_id.Value);
	var bIsBoss = !bIsSelf && tools.is_boss(iPersonIDParam, teCareerReserve.person_id.Value);
	var bIsTutor = (ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iPersonIDParam") != undefined);
	
	catTutorBossType = ArrayOptFirstElem( tools.xquery( "for $elem in boss_types where $elem/code = 'talent_pool_tutor' return $elem" ) );
	var bIsTaskCreateTutor = (ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iPersonIDParam && ( catTutorBossType != undefined && catTutorBossType.id == This.boss_type_id )") != undefined);

	var arrNoCancelTasks = get_task_wo_cancel(teCareerReserve.tasks);

	var arrStages = get_root_stages(arrNoCancelTasks);
	var iFullCountStages = ArrayCount(arrStages);
	var iFullCountDoneStages = ArrayCount(ArraySelect(arrStages, "This.status != 'active' && This.status != 'plan'"));
	var iFullCountFailStages = ArrayCount(ArraySelect(arrStages, "This.status == 'failed'"));
	
	var iMentorsCount = ArrayCount(teCareerReserve.tutors);

	var arrAllTasks = get_task_wo_stages(arrNoCancelTasks);
	var arrPassedTasks = ArraySelect(arrAllTasks, "This.status == 'passed'");
	var iCountPassedTasks = ArrayCount(arrPassedTasks);
	var arrFailedTasks = ArraySelect(arrAllTasks, "This.status == 'failed'");
	var iCountFailedTasks = ArrayCount(arrFailedTasks);
	
	var iFullCountTasks = ArrayCount(arrAllTasks);
	var iFullCountDoneTasks = ArrayCount(ArraySelect(arrAllTasks, "This.status != 'active' && This.status != 'plan'"));
	var rPercentDoneTasks = (iFullCountTasks > 0 ? Real(iFullCountDoneTasks)*100.0/Real(iFullCountTasks) : 0.0);
	var rPercentPassedTasks = (iFullCountTasks > 0 ? Real(iCountPassedTasks)*100.0/Real(iFullCountTasks) : 0.0);

	var arrExpiredTasks = get_expired_task(arrAllTasks, null);
	var iCountExpiredTasks = ArrayCount(arrExpiredTasks);

	//var xAtualStage = get_actual_stage(get_root_stages(teCareerReserve.tasks));
	var xAtualStage = get_actual_stage(arrStages);

	var dAtualStageFinishDate = null;
	var arrTaskActualStage = [];
	var arrPassedTaskActualStage = [];
	var arrExpiredTasksActualStage = []; 
	var iCountTasksActualStage = 0;
	var iCountPassedTasksActualStage = 0;
	var iCountExpiredTasksActualStage = 0
	var rPercentPassedTasksActualStage = 0.0;
	var sStateID = null;
	if(xAtualStage != null)
	{
		dAtualStageFinishDate = OptDate(xAtualStage.plan_date.Value, null);
		
		sStateID = xAtualStage.id.Value
		
		arrTaskActualStage = ArraySelect(arrAllTasks, "This.parent_task_id == sStateID");
		iCountTasksActualStage = ArrayCount(arrTaskActualStage);
		
		arrPassedTaskActualStage = ArraySelect(arrTaskActualStage, "This.status == 'passed'");
		iCountPassedTasksActualStage = ArrayCount(arrPassedTaskActualStage);
		rPercentPassedTasksActualStage = (iCountTasksActualStage > 0 ? Real(iCountPassedTasksActualStage)*100.0/Real(iCountTasksActualStage) : 0.0);
		arrExpiredTasksActualStage = get_expired_task(arrAllTasks, sStateID);
		iCountExpiredTasksActualStage = ArrayCount(arrExpiredTasks);
	}

	var bCurUserIsTutor = false;
	xqTutorBossType = ArrayOptFirstElem(tools.xquery("for $elem in boss_types where $elem/code = 'talent_pool_tutor' return $elem"));
	if(xqTutorBossType != undefined)
	{
		var iTutorBossTypeID = xqTutorBossType.id.Value;
		bCurUserIsTutor = (ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iPersonID && This.boss_type_id.Value == iTutorBossTypeID") != undefined)
	}
		
	var bCurUserIsTaskTutor = false;
	xqTaskTutorBossType = ArrayOptFirstElem(tools.xquery("for $elem in boss_types where $elem/code = 'talent_pool_task_tutor' return $elem"));
	if(xqTaskTutorBossType != undefined)
	{
		var iTaskTutorBossTypeID = xqTaskTutorBossType.id.Value;
		bCurUserIsTaskTutor = (ArrayOptFind(teCareerReserve.tutors, "This.person_id.Value == iPersonID && This.boss_type_id.Value == iTaskTutorBossTypeID") != undefined)
	}
		
	var oRet = {
		id: teCareerReserve.id.Value,
		PersonId: teCareerReserve.person_id.Value,
		PersonFullName: teCareerReserve.person_id.sd.fullname.Value,
		PersonImgUrl: teCareerReserve.person_id.ForeignElem.pict_url.Value,
		PersonPositionName: teCareerReserve.person_id.sd.position_name.Value,
		PersonSubdivisionName: teCareerReserve.person_id.ForeignElem.position_parent_name.Value,
		CurUserIsBoss: tools.is_boss(iPersonID, teCareerReserve.person_id.Value),
		CurUserIsTutor: bCurUserIsTutor,
		CurUserIsTaskTutor: bCurUserIsTaskTutor,
		ForbidTasksEdit: tools_web.is_true(teCareerReserve.forbid_tasks_edit.Value),
		StartDateCareerReserve: (dStartDate != undefined ? dStartDate : null ),
		FinishDateCareerReserve: (dFinishDate != undefined ? dFinishDate : null ),
		DaysFromStartCareerReserve: StrSignedInt(dStartDate != undefined ? get_days_between_date(dStartDate, Date()) : 0 ),
		DaysBeforeEndCareerReserve: StrSignedInt(dFinishDate != undefined ? get_days_between_date(Date(), dFinishDate) : 0 ),
		DaysInCareerReserve: StrSignedInt(dStartDate != undefined && dFinishDate != undefined ? get_days_between_date(dStartDate, dFinishDate) : 0 ),
		CountStagesCareerReserve: iFullCountStages,
		CountDoneStagesCareerReserve: iFullCountDoneStages,
		CountFailStagesCareerReserve: iFullCountFailStages,
		CountTasksCareerReserve: iFullCountTasks,
		CountPassedTasksCareerReserve: iCountPassedTasks,
		CountFailedTasksCareerReserve: iCountFailedTasks,
		PercentDoneTasksCareerReserve: StrReal(rPercentDoneTasks, 1) + "%",
		PercentPassedTasksCareerReserve: StrReal(rPercentPassedTasks, 1) + "%",
		HasExpireTasksCareerReserve: (iCountExpiredTasks > 0),
		CountExpireTasksCareerReserve: iCountExpiredTasks,
		NameActualStageCareerReserve: (xAtualStage != null ? xAtualStage.name.Value : ""),
		DaysBeforeEndActualStageCareerReserve: StrSignedInt(dAtualStageFinishDate != null ? get_days_between_date(Date(), dAtualStageFinishDate) : 0),
		CountTasksActualStageCareerReserve: iCountTasksActualStage,
		CountPassedTasksActualStageCareerReserve: iCountPassedTasksActualStage,
		PercentPassedTasksActualStageCareerReserve: StrReal(rPercentPassedTasksActualStage, 1) + "%",
		HasExpireTasksActualStageCareerReserve: (iCountExpiredTasksActualStage > 0),
		CountExpireTasksActualStageCareerReserve: iCountExpiredTasksActualStage,
		CountMentorsCareerReserve: iMentorsCount,
		bCanCreateTask: bIsTaskCreateTutor,
		bCanEditCareerReserve: ( bIsSelf || bIsBoss || bIsTutor ),
	};
	
	return oRet;
}

/**
* @typedef {Object} oMetricActivityTuple
 * @memberof Websoft.WT.TalentPool
* @property {integer} CountActiveCourse – Количество активных курсов в этапе развития карьеры 
* @property {integer} CountActiveDocumentLearning – Количество активных ознакомлений с материалом в этапе развития карьеры 
* @property {integer} CountActiveTest – Количество активных тестов в этапе развития карьеры 
* @property {integer} CountActiveEducationMethod – Количество активных учебных программ в этапе развития карьеры 
* @property {integer} CountActiveTasks – Количество активных задач в этапе развития карьеры 
*/
/**
 * @function GetObjectMetricCareerReserveActivity
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Объектная метрика по активностям этапа развития карьеры.
 * @param {bigint} iObjectIDParam - ID текущено объекта
 * @param {bigint} iPersonIDParam - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @param {string} sActualizeMode - "date,status" способ актуализации активности "date" - по интервалу дат в задаче, "status" - по статусу задачи + наличию назначенной активности
 * @param {boolean} bCheckActualStageParam - true - среди задач текущего этапа
 * @param {string} sCareerReserveType - Тип цели этапа развития карьеры
 * @returns {oMetricActivityTuple} 
*/
function GetObjectMetricCareerReserveActivity(iObjectIDParam, iPersonIDParam, sActualizeMode, bCheckActualStageParam, sCareerReserveType)
{
	var arrConfActivityParamNames = [
		{type: "course", name: "CountActiveCourse"},
		{type: "document_learning", name: "CountActiveDocumentLearning"},
		{type: "assessment", name: "CountActiveTest"},
		{type: "education_method", name: "CountActiveEducationMethod"},
		{type: "task", name: "CountActiveTasks"}
	];
	
	var bCheckActualStage = tools_web.is_true(bCheckActualStageParam);
	
	var iObjectID = OptInt(iObjectIDParam);
	var iPersonID = OptInt(iPersonIDParam);
	if(iObjectID == undefined && iPersonID == undefined)
		throw StrReplace(StrReplace("Не указаны ни корректный ID текущего объекта (PARAM1}), ни ID текущего сотрудника ({PARAM2})", "{PARAM1}", iObjectIDParam), "{PARAM2}", iPersonIDParam);
	
	if(iObjectID == undefined)
	{
		if(sCareerReserveType == "" || sCareerReserveType == null || sCareerReserveType == undefined)
			sCareerReserveType = "adaptation";
		
		var docCareerReserve = get_career_reserve_doc_by_person(iPersonID, sCareerReserveType);
		var teCareerReserve = docCareerReserve.TopElem;
	}
	else
	{
		var docCareerReserve = open_object(iObjectID, "career_reserve");
		var teCareerReserve = docCareerReserve.TopElem;
		if(iPersonID == undefined)
			iPersonID = teCareerReserve.person_id.Value;
	}

	var arrAllTasks = teCareerReserve.tasks;
	
	var sStageID = null;
	if(bCheckActualStage)
	{
		var xAtualStage = get_actual_stage(get_root_stages(arrAllTasks));
		if(xAtualStage != null) sStageID = xAtualStage.id.Value;
	}
	var arrNoCancelTasks = get_task_wo_cancel(arrAllTasks);
	var arrTasksOnly = 	get_task_wo_stages(arrNoCancelTasks);
	var arrFilter = [{id: "stage_id", name: "stage_id", type: "select", value: sStageID}];
	var srrTaskInStage = get_filtered_tasks(arrNoCancelTasks, arrFilter)
	//var srrTaskInStage = get_filtered_tasks(arrNoCancelTasks, null, sStageID)
	var arrActualTasks = get_actual_activity(arrTaskInStage, iPersonID, sActualizeMode);

	var oRet = {};
	var sSelectFilter, arrResultActualTasks, sType;
	for(itemActivityType in arrConfActivityParamNames)
	{
		sType = itemActivityType.type;
		
		sSelectFilter = (sType == "task") ? "This.type == 'task'" : "This.type != 'task' && (This.type == sType || This.activity_type == sType)";
		arrResultActualTasks = ArraySelect(arrActualTasks, sSelectFilter);
		oRet.SetProperty(itemActivityType.name, ArrayCount(arrResultActualTasks));
	}
	
	return oRet;
}

/**
* @typedef {Object} oMetricCareerPlan
 * @memberof Websoft.WT.TalentPool
 * @property {real} PercentActiveTasks – Процент пройденных задач в карьерном плане 
 * @property {boolean} bHasRequirements - Набор требований не пуст
 * @property {real} bRequirementsIsChecked – Сотрудник соответствует всем требованиям карьерного плана 
*/
/**
 * @function GetObjectMetricCareerPlan
 * @memberof Websoft.WT.TalentPool
 * @description Рассчет объектной метрики карьерного плана по ID.
 * @param {bigint} iCareerPlanIDParam - ID карьерного плана
 * @param {bigint} iPersonIDParam - ID сотрудника, для котоого проверяются требования
 * @param {string[]} arrCaclulateParam - перечень атрибутов, которые будут вычисляться
 * @param {boolean} bStrongObligatory - Проверять только обязательные параметры
 * @returns {oMetricCareerPlan} 
*/

function GetObjectMetricCareerPlan(iCareerPlanIDParam, iPersonIDParam, arrCaclulateParam, bStrongObligatory)
{
    var oRet = tools.get_code_library_result_object();
	oRet.result = {}

	var iPersonID = OptInt(iPersonIDParam);
	if(iPersonID == undefined)
		throw StrReplace("Передан некорректный ID сотрудника: [{PARAM!}]", "{PARAM!}", iPersonIDParam);

	var iCareerPlanID = OptInt(iCareerPlanIDParam);
	if(iCareerPlanID == undefined)
		throw StrReplace("Передан некорректный ID карьерного плана: [{PARAM!}]", "{PARAM!}", iCareerPlanIDParam);
	
	var docCareerPlan = tools.open_doc(iCareerPlanID);
	if(docCareerPlan == undefined)
		throw StrReplace("Не найден карьерный план с указанным ID: [{PARAM!}]", "{PARAM!}", iCareerPlanID);
	var teCareerPlan = docCareerPlan.TopElem;
	if(teCareerPlan.Name != "career_plan")
		throw StrReplace(StrReplace("Переданный ID ({PARAM1}) не является ID крьерного плана: [{PARAM2}]", "{PARAM1}", iCareerPlanIDParam), "{PARAM2}", teCareerPlan.Name);
	
	if(ArrayOptFind(arrCaclulateParam, "This == 'percent_active_tasks'") != undefined)
	{
		var arrAllTasks = get_task_wo_cancel(teCareerPlan.stages);
		var iFullTaskCount = ArrayCount(arrAllTasks);
		var arrActiveTasks = ArraySelect(arrAllTasks, "This.status != 'active' && This.status != 'plan'");
		var iActiveTaskCount = ArrayCount(arrActiveTasks);
		oRet.result.SetProperty("PercentActiveTasks", (StrReal((iFullTaskCount > 0 ? Real(iActiveTaskCount)*100.0/Real(iFullTaskCount) : 0.0),1) + "%") );
	}
	
	if(ArrayOptFind(arrCaclulateParam, "This == 'checked_requirements'") != undefined)
	{
		var bCarrerPlanIsTypical = (teCareerPlan.object_type != 'collaborator' && teCareerPlan.object_type != 'position' );
		var fldFirstActiveStage = ArrayOptFirstElem(ArraySelect(teCareerPlan.stages, "This.status.Value == 'plan'"));
		oRet.result.SetProperty("bRequirementsIsChecked", false);
		
		if(fldFirstActiveStage != undefined)
		{
			var arrRet = tools.call_code_library_method( "libStaff", "GetPositionCommomRequirements", [ fldFirstActiveStage.position_common_id.Value, null, iPersonID, bStrongObligatory ] )
			oRet.result.SetProperty("bHasRequirements", ( ArrayOptFirstElem(arrRet.requirements) != undefined ) );
			oRet.result.SetProperty("bRequirementsIsChecked", ( bCarrerPlanIsTypical && arrRet.done_checked ) );
		}
	}
	return oRet;
}

/**
 * @typedef {Object} oSubordinateTalentPoolMetric
 * @memberof Websoft.WT.TalentPool
 * @property {integer} iKeyPositionNum – Количество ключевых должностей – общее число ключевых должностей;
 * @property {integer} iKeyPositionWOSuccessorNum – Количество ключевых должностей без преемников – число ключевых должностей, для которых нет ни одного Преемника со статусом Согласован;
 * @property {integer} iSuccessionActiveNum – Количество несогласованных преемников – общее число преемников со статусом На согласовании
 * @property {integer} iSuccessionApproveNum – Количество согласованных преемников – общее число преемников со статусом Согласован
 * @property {integer} iPersonnelReserveInReserveNum – Количество резервистов – общее количество резервистов со статусом Состоит в кадровом резерве;
 * @property {integer} iPersonnelReserveCandidateNum – Количество кандидатов в резерв – общее количество резервистов со статусом Кандидат;
 * @property {integer} iPersonnelReserveLeftNum – Количество исключенных из резерва – общее количество резервистов со статусом Исключен из резерва.
 * @property {boolean} bCreateKeyPosition – Руководителю разрешено создание ключевых должностей
 * @property {boolean} bCreateSuccessor – Руководителю разрешено создание преемников
 * @property {boolean} bRequestSuccessor - возможность подачи заявок на преемников на портале
 * @property {integer} iRequestTypeSuccessor - ID типа заявок для подачи заявок на добавление преемников
 * @property {boolean} bCreateReserve – Руководителю разрешено создание резервистов
 * @property {boolean} bRequestAddSuccessor – Руководителю разрешена подача заявок на добавление преемников
 * @property {boolean} bRequestSuccessorStatusChange – Руководителю разрешена подача заявок на на смену статусов преемников
 * @property {boolean} bRequestAddPersonalReserve – Руководителям разрешена подача заявок на включение в кадровый резерв подчиненного
 * @property {boolean} bRequestSelfPersonalReserve – Сотрудникам разрешена подача заявок на включение себя в кадровый резерв
 * @property {boolean} bRequestPersonalReserveStatusChange – Руководителю разрешена подача заявок на на смену статусов кадрового резерва (резервиста)
 * @property {boolean} bAddSuccessorWOPersonalReserve – Можно выбирать преемников из подчиненных, не состоящих в кадровом резерве.
*/
/**
 * @typedef {Object} SubordinateTalentPoolContext
 * @memberof Websoft.WT.TalentPool
 * @property {integer} error – код ошибки
 * @property {string} errorText – текст ошибки
 * @property {oSubordinateTalentPoolMetric} context – результат
*/
/**
 * @function GetSubordinateTalentPoolContext
 * @memberof Websoft.WT.TalentPool
 * @author BG AKh
 * @description Рассчет объектной метрики (контекста) преемников и резервистов по подчтненным сотрудникам.
 * @param {bigint} PersonIDParam - ID текущего или указанного сотрудника, для которого определяются метрики 
 * @returns {SubordinateTalentPoolContext}
*/
function GetSubordinateTalentPoolContext(PersonIDParam)
{
	var oRes = tools.get_code_library_result_object();
	oRes.context = {};
	
	try
	{
		var libSuccessionParam = tools.get_params_code_library('libSuccession');
		var libMainParam = tools.get_params_code_library('libMain');
		var sTypeCollaborator = libMainParam.GetOptProperty("DefaultSubordinateType", "all_subordinates"); //by default: Непосредственные и функциональные подчиненные с иерархией
		var arrBossTypesID = [];
		switch(sTypeCollaborator)
		{
			case "func_subordinates":
			case "all_subordinates":
			{
				arrBossTypesID = tools_web.parse_multiple_parameter(libMainParam.GetOptProperty("iBossTypeIDs", "[]"));
				if( ArrayOptFirstElem(arrBossTypesID) == undefined)
				{
					sBossTypeCodes = Trim(libMainParam.GetOptProperty("sBossTypeCodes", ""));
					if(sBossTypeCodes != "")
					{
						var arrBossTypeCodes = tools_web.parse_multiple_parameter(sBossTypeCodes);
						arrBossTypesID = ArrayExtract(tools.xquery("for $elem in boss_types where MatchSome($elem/code, (" + ArrayMerge(arrBossTypeCodes, "XQueryLiteral(This)", ",") + ")) return $elem/Fields('id')"), "This.id.Value");
					}
				}
				break;
			}
		}

		var iPersonID = OptInt(PersonIDParam);
		if(iPersonID == undefined)
			throw StrReplace("Передан некорректный ID [{PARAM1}]", "{PARAM1}", PersonIDParam);

		var arrPersons = tools.call_code_library_method( "libMain", "GetTypicalSubordinates", [ iPersonID, libMainParam.GetOptProperty("DefaultSubordinateType"), libMainParam.GetOptProperty("iBossTypeIDs"), false, (!tools_web.is_true(libMainParam.GetOptProperty("bRetunDismissedPerson", false)) ? "$elem/is_dismiss != true()" : "") ] );
		
		var sReqLongListKeyPosition = "for $elem_qc in key_positions where MatchSome( $elem_qc/position_id,(" + ArrayMerge(arrPersons, 'This.position_id.Value', ',') + " ) ) return $elem_qc ";
		var xarrKeyPositions = tools.xquery(sReqLongListKeyPosition);	

		oRes.context.SetProperty("iKeyPositionNum", ArrayCount(xarrKeyPositions));
		
		var sReqLongListSuccessors = "for $elem_qc in successors where MatchSome( $elem_qc/key_position_id,(" + ArrayMerge(xarrKeyPositions, 'This.id.Value', ',') + " ) ) return $elem_qc ";
		var xarrSuccessors = tools.xquery(sReqLongListSuccessors);

		oRes.context.SetProperty("iKeyPositionWOSuccessorNum", ArrayCount(ArraySelect(xarrKeyPositions, "ArrayOptFind(xarrSuccessors, 'This.key_position_id.Value == ' + This.id.Value) == undefined")));
		oRes.context.SetProperty("iSuccessionActiveNum", ArrayCount(ArraySelect(xarrSuccessors, "This.status.Value == 'active'")));
		oRes.context.SetProperty("iSuccessionApproveNum", ArrayCount(ArraySelect(xarrSuccessors, "This.status.Value == 'approved'")));
		
		var sReqLongListPersonalReserve = "for $elem_qc in personnel_reserves where MatchSome( $elem_qc/person_id,(" + ArrayMerge(arrPersons, 'This.id.Value', ',') + " ) ) return $elem_qc" 
		var xarrPersonalReserves = tools.xquery(sReqLongListPersonalReserve);

		oRes.context.SetProperty("iPersonnelReserveInReserveNum", ArrayCount(ArraySelect(xarrPersonalReserves, "This.status.Value == 'in_reserve'")));
		oRes.context.SetProperty("iPersonnelReserveCandidateNum", ArrayCount(ArraySelect(xarrPersonalReserves, "This.status.Value == 'candidate'")));
		oRes.context.SetProperty("iPersonnelReserveLeftNum", ArrayCount(ArraySelect(xarrPersonalReserves, "This.status.Value == 'left_reserve'")));
		
		var sApplicationCode = libSuccessionParam.GetOptProperty("BossRights.sApplicationCode", "websoft_succession_plan");
		if( sApplicationCode == '' )
			sApplicationCode = "websoft_succession_plan";
		
		bCreateKeyPosition = false;
		var sCreateKeyPosition = libSuccessionParam.GetOptProperty("BossRights.sCreateKeyPosition");
		if (sCreateKeyPosition == "app")
		{
			bCreateKeyPosition = tools_web.is_true(tools_app.get_settings( "can_create_key_position", 'app', '', sApplicationCode ));
		}
		else
		{
			bCreateKeyPosition = tools_web.is_true(sCreateKeyPosition);
		}
		oRes.context.SetProperty("bCreateKeyPosition", bCreateKeyPosition);
		
		var bCreateSuccessor = false;
		var bRequestSuccessor = false;
		var sCreateSuccessor = libSuccessionParam.GetOptProperty("BossRights.sCreateSuccessor");
		if (sCreateSuccessor == "app")
		{
			sCreateSuccessor = tools_app.get_settings( "can_create_successor", 'app', '', sApplicationCode );
			
			if (sCreateSuccessor == 'create')
			{
				bCreateSuccessor = true;
			}
			else if (sCreateSuccessor == 'request')
			{
				bRequestSuccessor = true;
			}
		}
		else if (sCreateSuccessor == 'create')
		{
			bCreateSuccessor = true;
		}
		else if (sCreateSuccessor == 'request')
		{
			bRequestSuccessor = true;
		}
		oRes.context.SetProperty("bCreateSuccessor", bCreateSuccessor);
		oRes.context.SetProperty("bRequestSuccessor", bRequestSuccessor);
		
		var iRequestTypeSuccessor = OptInt(libSuccessionParam.GetOptProperty("BossRights.iRequestTypeSuccessor"), null);
		if ( iRequestTypeSuccessor == null )
		{
			iRequestTypeSuccessor = tools_app.get_settings( "request_type", 'app', '', sApplicationCode );
		}
		oRes.context.SetProperty("iRequestTypeSuccessor", iRequestTypeSuccessor);
		
		//oRes.context.SetProperty("bCreateKeyPosition", libSuccessionParam.GetOptProperty("BossRights.bCreateKeyPosition", true));
		//oRes.context.SetProperty("bCreateSuccessor", libSuccessionParam.GetOptProperty("BossRights.bCreateSuccessor", true));
		oRes.context.SetProperty("bCreateReserve", libSuccessionParam.GetOptProperty("BossRights.bCreateReserve", true));
		
		oRes.context.SetProperty("bRequestKeyPositionCreate", libSuccessionParam.GetOptProperty("BossRequestRights.bRequestKeyPositionCreate", true));
		oRes.context.SetProperty("bRequestAddSuccessor", libSuccessionParam.GetOptProperty("BossRequestRights.bRequestAddSuccessor", true));
		oRes.context.SetProperty("bRequestSuccessorStatusChange", libSuccessionParam.GetOptProperty("BossRequestRights.bRequestSuccessorStatusChange", true));
		oRes.context.SetProperty("bRequestAddPersonalReserve", libSuccessionParam.GetOptProperty("BossRequestRights.bRequestAddPersonalReserve", true));
		oRes.context.SetProperty("bRequestPersonalReserveStatusChange", libSuccessionParam.GetOptProperty("BossRequestRights.bRequestPersonalReserveStatusChange", true));
		oRes.context.SetProperty("bRequestSelfPersonalReserve", libSuccessionParam.GetOptProperty("bRequestSelfPersonalReserve", true));
		oRes.context.SetProperty("bAddSuccessorWOPersonalReserve", libSuccessionParam.GetOptProperty("bAddSuccessorWOPersonalReserve", true));

		return oRes;
	}
	catch ( err )
	{
		oRes.error = 501;
		oRes.errorText = err;
		return oRes;
	}

}
// ======================================================================================
// ============================  Public-функции ===================================
// ======================================================================================

/**
 * @typedef {Object} oArgParamAdaptationID
 * @memberof Websoft.WT.TalentPool
 * @property {bigint} object_id  - ID этапа развития карьеры
 * @property {bigint} person_id - ID сотрудника, по которому ищется запись этапа развития карьеры
 * @property {string} url - Исходная ссылка
*/
/**
 * @function GetAdaptationURLByPerson
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Получение URL карточки адаптации указанного сотрудника.
 * @param {oArgParamAdaptationID} Param - Объект с аргументами функции
 * @returns {string} 
*/
function GetAdaptationURLByPerson(Param)
{
	iAdaptationID = GetAdaptationIDByPerson(Param.object_id, Param.person_id)
	
	if(iAdaptationID == null)
	{
		var sUrl = "";
	}
	else if(Param.url != "")
	{
		var sUrl = StrEnds(Param.url, "/") ? Param.url + iAdaptationID : Param.url + "/" + iAdaptationID;
	}
	else 
	{
		var sUrl = "/_wt/" + iAdaptationID;
	}
	
	return sUrl;
}

/**
 * @function CreateAgreedCareerPlan
 * @memberof Websoft.WT.TalentPool
 * @author BG
 * @description Создание согласованного карьерного плана.
 * @param {bigint} iCareerPlanIDParam - ID типового карьерного плана (для типовой должности, группы или семейства должностей)
 * @param {bigint} iPersonIDParam - ID сотрудника, которому согласован план
 * @param {string} sStatus - статус карьерного плана
 * @returns {bigint} 
*/
function CreateAgreedCareerPlan(iCareerPlanIDParam, iPersonIDParam, sStatus)
{
	var iPersonID = OptInt(iPersonIDParam);
	if(iPersonID == undefined)
		throw StrReplace("Передан некорректный ID сотрудника: [{PARAM}]", "{PARAM}", iPersonIDParam);
	var docPerson = tools.open_doc(iPersonID);
	var sPersonName = docPerson.TopElem.fullname;

	var iCareerPlanID = OptInt(iCareerPlanIDParam);
	if(iCareerPlanID == undefined)
		throw StrReplace("Передан некорректный ID карьерного плана: [{PARAM}]", "{PARAM}", iCareerPlanIDParam);

	var docTypicalCareerPlan = tools.open_doc(iCareerPlanID);
	if(docTypicalCareerPlan == undefined)
		throw StrReplace("Не найден карьерный план с ID: [{PARAM}]", "{PARAM}", iCareerPlanID);
	var teTypicalCareerPlan = docTypicalCareerPlan.TopElem;
	
	if(teTypicalCareerPlan.object_type.Value == 'collaborator' || teTypicalCareerPlan.object_type.Value == 'position' ) 
		throw StrReplace("Переданный ID не является ID типового карьерного плана: [{PARAM}]", "{PARAM}", iCareerPlanID);
	
	if (sStatus == null || sStatus == undefined || sStatus == '')
	{
		sStatus = 'plan';
	}

	var docNewCareerPlan = tools.new_doc_by_name('career_plan');
	teNewCareerPlan = docNewCareerPlan.TopElem;
	teNewCareerPlan.AssignElem(teTypicalCareerPlan);
	teNewCareerPlan.object_type = 'collaborator';
	teNewCareerPlan.object_id = iPersonID;
	teNewCareerPlan.status = sStatus;
	teNewCareerPlan.start_date = Date();
	teNewCareerPlan.name = teTypicalCareerPlan.name + " (" + sPersonName + ")";
	
	docNewCareerPlan.BindToDb(DefaultDb);
	docNewCareerPlan.Save();
	
	return docNewCareerPlan.DocID;
}


/**
 * @function CreateTypicalDevelopment
 * @memberof Websoft.WT.TalentPool
 * @author IG 
 * @description Изменение статусов типовых программ развития
 * @param {string} sTypicalDevelopmentName - Название типовой программы развития
 * @param {string} iRoleID - ID категории, от которой строится набор (root id).
 * @returns {oSimpleResult}
*/
function CreateTypicalDevelopment( sTypicalDevelopmentName, iRoleID )
{
	var oRes = tools.get_code_library_result_object();

	if( sTypicalDevelopmentName == undefined || sTypicalDevelopmentName == null || sTypicalDevelopmentName == "" )
	{
		oRes.error = 501;
		oRes.errorText = "Не передано название типовой должности";
		return oRes;
	}

	iRoleID = OptInt( iRoleID );
	if ( iRoleID != undefined && iRoleID != null )
	{
		docCategory = tools.open_doc( iRoleID );
		if( docCategory == undefined || docCategory.TopElem.Name != "role" )
		{
			oRes.error = 502;
			oRes.errorText = "Переданный ID: " + iRoleID + " не является ID категории типовой должности";
			return oRes;
		}
	}

	try
	{
		docTypicalDevelopment = tools.new_doc_by_name("typical_development_program", false);
		docTypicalDevelopment.BindToDb();
		docTypicalDevelopment.TopElem.name = sTypicalDevelopmentName;

		if ( iRoleID != undefined && iRoleID != null )
		{
			docTypicalDevelopment.TopElem.role_id.ObtainByValue( iRoleID );
		}
		docTypicalDevelopment.Save();
	}		
	catch( err )
	{
		oRes.error = 503;
		oRes.errorText = err;
	}

	return oRes;
}



/**
 * @function DetectTypicalDevelopmentProgramState
 * @memberof Websoft.WT.TalentPool
 * @author IG
 * @description Формирование строки вида "Программа 1, Программа 2 и еще N"
 * @param {bigint[]} arrTypicalDevelopmentProgramIDs - Массив ID программ развития
 * @returns {oSimpleResultParagraph}
*/
function DetectTypicalDevelopmentProgramState( arrTypicalDevelopmentProgramIDs ){
	var oRes = tools.get_code_library_result_object();
		oRes.paragraph = ""
	
	if(!IsArray(arrTypicalDevelopmentProgramIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Переданные ID программ развития не является массивом";
		return oRes;
	}

	if(ArrayOptFirstElem(arrTypicalDevelopmentProgramIDs) == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "Массив ID программ развития пуст";
		return oRes;
	}
	
	sSQL = "for $elem in typical_development_programs where MatchSome( $elem/id, (" + ArrayMerge(arrTypicalDevelopmentProgramIDs, 'This', ',') + ") ) return $elem/Fields('name')"
	arrTypicalDevelopmentProgramNames = ArrayExtract(tools.xquery(sSQL), "This.name.Value");
	
	sParagraph = []
	count = 0
	for (sTypicalDevelopmentProgramName in arrTypicalDevelopmentProgramNames)
	{
		count++
		
		if(count > 2)
		{
			sParagraph.push("и еще " + (ArrayCount(arrTypicalDevelopmentProgramNames)-2));
			break
		}
		else
		{
			sParagraph.push(sTypicalDevelopmentProgramName)
		}
	}
	
	oRes.paragraph = ArrayMerge(sParagraph, "This", ", ")

	return oRes;
}

/**
 * @function ChangeTypicalDevelopmentProgramState
 * @memberof Websoft.WT.TalentPool
 * @author IG 
 * @description Изменение статусов типовых программ развития
 * @param {bigint[]} arrTypicalDevelopmentProgramIDs - Массив ID типовых программ развития
 * @param {string} sState - статус (active, archive, plan)
 * @returns {oSimpleResultCount}
*/
function ChangeTypicalDevelopmentProgramState( arrTypicalDevelopmentProgramIDs, sState ){
	var oRes = tools.get_code_library_result_object();
		oRes.count = 0
	
	if(!IsArray(arrTypicalDevelopmentProgramIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}
	
	if(sState == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "Не передан новый статус для типовых программ развития";
		return oRes;
	}
	
	for (iTypicalDevelopmentProgramID in arrTypicalDevelopmentProgramIDs)
	{
		docTypicalDevelopmentProgram = tools.open_doc(iTypicalDevelopmentProgramID)
		docTypicalDevelopmentProgramTE = docTypicalDevelopmentProgram.TopElem
		
		if(docTypicalDevelopmentProgramTE.status.Value != sState){
			docTypicalDevelopmentProgramTE.status.Value = sState
			docTypicalDevelopmentProgram.Save()
			oRes.count++
		}
	}
	
	return oRes;
}

/**
 * @function AddTypicalDevelopmentProgramToObject
 * @memberof Websoft.WT.TalentPool
 * @author IG 
 * @description Добавлние типовой программы развития в объект
 * @param {bigint[]} arrObjectIDs - Массив ID типовых программ развития
 * @param {bigint[]} arrResObjectIDs - Массив ID типовых должностей, семейств должностей или группы подразделений
 * @param {string} sTypeAdd - способ назначения (any - любое, int - внутреннее, ext - внешнее)
 * @param {string} sComment - комментарий
 * @returns {oSimpleResultCount}
*/
function AddTypicalDevelopmentProgramToObject( arrObjectIDs, arrResObjectIDs, sTypeAdd, sComment )
{
	var oRes = tools.get_code_library_result_object();
		oRes.result = ""
		oRes.count = 0

	if(!IsArray(arrObjectIDs) || !IsArray(arrResObjectIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}
	
	if(ArrayCount(arrResObjectIDs) == 0 || ArrayCount(arrObjectIDs) == 0)
	{
		oRes.error = 501;
		oRes.errorText = "Один из переданных массивов пустой";
		return oRes;
	}
	
	if(sTypeAdd == '')
	{
		oRes.error = 501;
		oRes.errorText = "Не передан способ назначения для программ развития";
		return oRes;
	}
	
	var docName = ""

	try
	{
		for (iObjectID in arrObjectIDs)
		{
			for (iResObjectID in arrResObjectIDs)
			{
				docResource = tools.open_doc(OptInt(iResObjectID))

				if( docResource == undefined )
				{
					continue;
				}

				docResourceTE = docResource.TopElem
				fldNextSubdivision =  ArrayOptFind(docResourceTE.typical_development_programs, "This.typical_development_program_id == " + iObjectID)
				
				docName = docResourceTE.Name
				
				if(fldNextSubdivision == undefined){

					oTypicalDevelopmentPrograms = docResourceTE.typical_development_programs.AddChild()
					oTypicalDevelopmentPrograms.typical_development_program_id = OptInt(iObjectID)
					
					oTypicalDevelopmentPrograms.job_transfer_type_id = sTypeAdd
					
					if(sComment != ''){
						oTypicalDevelopmentPrograms.comment = sComment
					}
					
					docResource.Save();
					oRes.count++
				}
			}
		}
	} catch ( err )
	{
		oRes.error = 1;
		oRes.errorText = "ERROR: " + err;
	}
	
	var docType = ""
	switch(docName){
		case 'position_common':
			docType = "типовые должности"
			break;
		case 'position_family':
			docType = "семейства должностей"
			break;
		case 'subdivision_group':
			docType = "группы подразделений"
			break;
	}
	
	oRes.result = "Программы развития были добавлены в " + docType

	return oRes;
}

// ======================================================================================
// =================  Внутрибиблиотечные (private) функции (notfordoc) ==================
// ======================================================================================



function get_personnel_reserve_collection_by_person(person_id, request_type, array_filters, obj_sort, subordinate_type, boss_type_array)
{
	var arrCondFilters = [];
	var bPostQueryProcess = false;
	switch(request_type)
	{
		case "all":
		{
			break;
		}
		case "person":
		{
			arrCondFilters.push("$elem/person_id=" + XQueryLiteral(person_id));
			break;
		}
		case "boss":
		{

			if(subordinate_type == "" || subordinate_type == null || subordinate_type == undefined)
			{
				libParam = tools.get_params_code_library('libMain');
				var subordinate_type = libParam.GetOptProperty("DefaultSubordinateType", "all_subordinates"); //by default: Непосредственные и функциональные подчиненные с иерархией
			}
			if(boss_type_array == "" || boss_type_array == null || boss_type_array == undefined)
				boss_type_array = [];
			
			var xqSubordinates = tools.call_code_library_method( "libMain", "get_user_collaborators", [ person_id, subordinate_type, null, null, null, boss_type_array ] );
			
			var xqLongListQuery = XQuery( "for $elem_qc in personnel_reserves where MatchSome( $elem_qc/person_id,(" + ArrayMerge(xqSubordinates, 'This.id.Value', ',') + " ) ) return $elem_qc/Fields('id')" );
			bPostQueryProcess = (ArrayOptFirstElem(xqLongListQuery)!=undefined)
			
			break;
		}
		case "curator":
		{
			//selector = " and MatchSome($elem/id,(" + ArrayMerge(XQuery("for $elem in talent_pool_func_managers where $elem/person_id=" + person_id + " and $elem/catalog='personnel_reserve' return $elem"), "This.object_id", ",") + "))";
			arrCondFilters.push("some $fm in talent_pool_func_managers satisfies ($elem/id=$fm/object_id and $fm/catalog=\'personnel_reserve\' and $fm/person_id=" + person_id + ")");
			break;
		}
	}
	
	if(array_filters != undefined && IsArray(array_filters) && ArrayOptFirstElem(array_filters) != undefined)
	{
		for(oFilter in array_filters)
		{
			if(oFilter.type == 'search')
			{
				if(oFilter.value != "") arrCondFilters.push( "doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )" );
			}
			else if(oFilter.type == 'select')
			{
				switch(oFilter.id)
				{
					case "status_id":
					{
						arrCondFilters.push( "MatchSome( $elem/status, ( " + ArrayMerge(oFilter.value, "XQueryLiteral(This.value)", ",") + " ) )" );
						break;
					}
					case "subdivision_id":
					{
												
						arrCondFilters.push( "some $pos in positions satisfies ($elem/person_id=$pos/basic_collaborator_id and MatchSome( $pos/parent_object_id, (" + ArrayMerge(oFilter.value, "XQueryLiteral(This.value)", ",") + ")))" );
						break;
					}
				}
			}
			else
			{
				/*switch(oFilter.id)
				{
					case "status":
					{

						break;
					}
				}*/
				
			}
		}
	}
	
	var sCondSort = " order by $elem/name";
	if(ObjectType(obj_sort) == 'JsObject' && obj_sort.FIELD != null && obj_sort.FIELD != undefined && obj_sort.FIELD != "" )
	{
		switch(obj_sort.FIELD)
		{
			case "name":
				sCondSort = " order by $elem/name" + (obj_sort.DIRECTION == "DESC") ? " descending" : "" ;
				break;
			case "comment":
			case "desc":
				break;
			default:
				sCondSort = " order by $elem/" + obj_sort.FIELD + (obj_sort.DIRECTION == "DESC") ? " descending" : "" ;
		}
	}
	var sReqFilters = ArrayCount( arrCondFilters ) > 0 ? ' where ' + ArrayMerge( arrCondFilters, 'This', ' and ' ) : '';
	
	var strReq = "for $elem in personnel_reserves " + sReqFilters + sCondSort + " return $elem/Fields('id','person_id','status')";
		
	if(bPostQueryProcess)
	{
		return ArrayIntersect(tools.xquery(strReq), xqLongListQuery, "This.id", "This.id");
	}
	else
	{
		return tools.xquery(strReq);
	}
}

function get_career_reserve_collection_by_person(person_id, career_reserve_types, arr_statuses, sRequestType, oSort)
{
	var selector = "";
	var bPostQueryProcess = false;
	switch(sRequestType)
	{
		case "all":
		{
			break;
		}
		case "person":
		{
			selector = " and $elem/person_id=" + XQueryLiteral(person_id);
			break;
		}
		case "boss":
		{
			//selector = " and MatchSome($elem/person_id, (" + ArrayMerge(tools.call_code_library_method( "libMain", "GetTypicalSubordinates", [ person_id ] );, "This.id.Value", ",") + "))";
			var xarrSubordinate = tools.call_code_library_method( "libMain", "GetTypicalSubordinates", [ person_id ] );
			var xqLongListQuery = XQuery( "for $elem_qc in career_reserves where MatchSome($elem_qc/person_id, (" + ArrayMerge(xarrSubordinate, 'This.id.Value', ',') + ")) return $elem_qc/Fields('id')" );
			bPostQueryProcess = true;
			break;
		}
		case "tutor":
		{
			//selector = " and MatchSome($elem/id,(" + ArrayMerge(XQuery("for $elem in career_reserve_tutors where $elem/tutor_id=" + person_id + " return $elem"), "This.career_reserve_id", ",") + "))";
			selector = " and some $cross_cr in career_reserve_tutors satisfies ($elem/id = $cross_cr/career_reserve_id and $cross_cr/tutor_id=" + person_id + " and $cross_cr/tutor_type = 'tutor')";
			break;
		}
		case "colleague":
		{
			//selector = " and MatchSome($elem/person_id, (" + ArrayMerge(get_colleague_by_subdivisions(person_id, true, false), "This.basic_collaborator_id.Value", ",") + "))";
			var xqLongListQuery = XQuery( "for $elem_qc in career_reserves where MatchSome($elem_qc/person_id, (" + ArrayMerge(get_colleague_by_subdivisions(person_id, true, false), 'This.basic_collaborator_id.Value', ',') + ")) return $elem_qc/Fields('id')" );
			bPostQueryProcess = true;
			break;
		}
	}
	
	var active_selector = "";
	if(arr_statuses == null || arr_statuses == undefined || arr_statuses == "" || !IsArray(arr_statuses) || ArrayOptFirstElem(arr_statuses) == undefined)
		active_selector = " and MatchSome($elem/status, ('active') )";
	else if(ArrayOptFind(arr_statuses, "This == 'all'") != undefined)
		active_selector = "";
	else
		active_selector = " and MatchSome($elem/status, (" + ArrayMerge(arr_statuses, "XQueryLiteral(This)", ",") + ") )";
		
	var type_selector = "";
	if(career_reserve_types != "" && career_reserve_types != null && career_reserve_types != undefined)
	{
		arrCareerReseveTypes = tools_web.parse_multiple_parameter( career_reserve_types );
		
		if(ArrayCount(arrCareerReseveTypes) == 1)
			type_selector = " and $elem/position_type=" + XQueryLiteral(arrCareerReseveTypes[0]);
		else if(ArrayCount(arrCareerReseveTypes) > 1)
			type_selector = " and MatchSome( $elem/position_type, (" + ArrayMerge(arrCareerReseveTypes, "XQueryLiteral(This)", ",") + "))";
	}
	
	var sCondSort = " order by $elem/start_date descending";
	if(ObjectType(oSort) == 'JsObject' && oSort.FIELD != null && oSort.FIELD != undefined && oSort.FIELD != "" )
	{
		switch(oSort.FIELD)
		{
			case "name":
				sCondSort = " order by $elem/person_fullname" + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "") ;
				break;
			case "position":
				sCondSort = " order by $elem/position_name" + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "");
				break;
			case "readiness_percent":
				sCondSort = " order by $elem/readiness_percent_native" + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "");
				break;
			case "done_percent_native":
			case "done_percent":
				break;
			default:
				sCondSort = " order by $elem/" + oSort.FIELD + (StrUpperCase(oSort.DIRECTION) == "DESC" ? " descending" : "");
		}
	}
	
	var strReq = "for $elem in career_reserves where 1=1" + type_selector + selector + active_selector + sCondSort + " return $elem";
		
	if(bPostQueryProcess)
	{
		return ArrayIntersect(tools.xquery(strReq), xqLongListQuery, "This.id", "This.id");
	}
	else
	{
		return tools.xquery(strReq);
	}
}

function get_adaptation_collection(request_type, statuses, person_id, oSort)
{
	return get_career_reserve_collection_by_person(person_id, ["adaptation"], statuses, request_type, oSort);
}

function get_career_reserve_id_by_person(person_id, career_reserve_types, is_active_only)
{
	var iPersonID = OptInt(person_id);
	if(iPersonID == undefined)
		throw StrReplace("Аргумент не является ID: [{PARAM1}]", "{PARAM1}", person_id);
	var arrStatuses = tools_web.is_true(is_active_only) ? ['active', 'plan'] : ['all'];
	var CR = ArrayOptFirstElem(get_career_reserve_collection_by_person(person_id, career_reserve_types, arrStatuses, "person"));
	if(CR == undefined)
		throw StrReplace("Не найден этап развития карьеры для сотрудника с ID: [{PARAM1}]", "{PARAM1}", iPersonID);
	
	return CR.id;
}

function get_career_reserve_doc_by_person(person_id, career_reserve_types)
{
	var iCareerReserveID = get_career_reserve_id_by_person(person_id, career_reserve_types);
	
	return open_object(iCareerReserveID);
}

function open_object(ID, catalog_name, oAccessParam)
{
	if(oAccessParam == undefined || (oAccessParam != undefined && ObjectType(oAccessParam) != "JsObject"))
		oAccessParam = null;
	
	if(catalog_name == "" || catalog_name == null || catalog_name == undefined)
		 catalog_name = "career_reserve";
	
	var iObjectID = OptInt(ID);
	
	if(iObjectID == undefined )
		throw StrReplace("Некорректный ID объекта: [{PARAM1}]", "{PARAM1}", ID);
	
	var docObject = tools.open_doc(iObjectID);
	
	if(docObject == undefined )
		throw StrReplace("Не найден объект с ID: [{PARAM1}]", "{PARAM1}", iObjectID);
	
	switch(docObject.TopElem.Name)
	{
		case "collaborator":
		{
			if(catalog_name != "career_reserve" && catalog_name != "personnel_reserve")
				throw StrReplace("В качестве ID для открытия передан ID сотрудника. Определение объекта типа: [{PARAM1}] по ID сотрудника невозможно", "{PARAM1}", catalog_name);
			
			if (oAccessParam != null && ! tools_web.check_collection_access( oAccessParam.user_id, iObjectID, oAccessParam.access_type ) )
				throw "{error_code: 403, error_message: '', error_message_const: 'nedostatochnopr'}"
			
			var object = ArrayOptFirstElem(XQuery("for $elem in " + catalog_name + "s where $elem/person_id=" + XQueryLiteral(docObject.DocID) + " order by $elem/start_date descending return $elem"));
			
			if(object == undefined )
				throw StrReplace(StrReplace("Не найдено объекта типа {PARAM1} по сотруднику с ID [{PARAM2}]", "{PARAM1}", catalog_name), "{PARAM2}", ID);
			
			docObject = tools.open_doc(object.id);
			break;
		}
		case "personnel_reserve":
		case "career_reserve":
		{
			if (oAccessParam != null && ! tools_web.check_collection_access( oAccessParam.user_id, docObject.TopElem.person_id.Value, oAccessParam.access_type ) )
				throw "{error_code: 403, error_message: '', error_message_const: 'nedostatochnopr'}"
			break;
		}
		case "career_plan":
		case "personnel_committee":
		case "committee_member":
		case "typical_development_program":
		case "career_reserve_type":
		case "exclusion_reason":
		case "talent_pool_nomination":
			break;
		default:
			throw StrReplace("Объект с ID: [{PARAM1}] не является объектом модуля \"Развитие карьеры\" или сотрудником", "{PARAM1}", iObjectID);
	}
	
	return docObject;
}

function get_statuses_career_reserve()
{
	return ArrayExtract(common.career_reserve_status_types, "({id:This.id.Value,name:This.name.Value})");
}

function get_task_statuses_personnel_reserve()
{
	return ArrayExtract(common.personnel_reserve_task_status_types, "({id:This.id.Value,name:This.name.Value})");
}

function get_statuses_personnel_reserve()
{
	return ArrayExtract(common.personnel_reserve_status_types, "({id:This.id.Value,name:This.name.Value})");
}

function get_task_type_career_reserve()
{
	return ArrayExtract(common.career_reserve_tasks_types, "({id:This.id.Value,name:This.name.Value})");
}

function get_task_type_personnel_reserve()
{
	return ArrayExtract(common.career_reserve_type_tasks_types, "({id:This.id.Value,name:This.name.Value})");
}

function get_tutors_career_reserve_for_select_entryes(iCareerReserveIDParam, docCareerReserve)
{

	return ArrayExtract(get_tutors_career_reserve(iCareerReserveIDParam, docCareerReserve), "({'name':This.person_fullname.Value, 'value':''+String(This.person_id.Value)})");
}

function get_tutors_career_reserve(iCareerReserveIDParam, docCareerReserve, sTutorType, oAccessParam)
{
	if(sTutorType == null || sTutorType == undefined || sTutorType == "")
		sTutorType = "all";
	
	try
	{
		var teCareerReserve = docCareerReserve.TopElem;
	}
	catch(e)
	{
		try
		{
			docCareerReserve = open_object(iCareerReserveIDParam, "career_reserve", oAccessParam);
		}
		catch(err)
			{throw (StrBegins(err, "{") ? "" : StrReplace("Не удалось открыть этап развития карьеры с ID [{PARAM1}]:\r\n", "{PARAM1}", iCareerReserveIDParam)) + err;}
			
		teCareerReserve = docCareerReserve.TopElem;
	}
	var iTutorBossTypeID = ArrayOptFirstElem(tools.xquery("for $elem in boss_types where $elem/code = 'talent_pool_tutor' return $elem/Fields('id')"), {id: null}).id.Value;
	var iTaskTutorBossTypeID = ArrayOptFirstElem(tools.xquery("for $elem in boss_types where $elem/code = 'talent_pool_task_tutor' return $elem/Fields('id')"), {id: null}).id.Value;
	
	switch(sTutorType)
	{
		case "tutor":
		{
			return ArraySelect(teCareerReserve.tutors, "This.boss_type_id.HasValue && This.boss_type_id == iTutorBossTypeID");
		}
		case "task_tutor":
		{
			return ArraySelect(teCareerReserve.tutors, "This.boss_type_id.HasValue && This.boss_type_id == iTaskTutorBossTypeID");
		}
		case "other_tutor":
		{
			return ArraySelect(teCareerReserve.tutors, "This.boss_type_id.HasValue && This.boss_type_id != iTutorBossTypeID && This.boss_type_id != iTaskTutorBossTypeID");
		}
		case "without":
		{
			return ArraySelect(teCareerReserve.tutors, "!This.boss_type_id.HasValue");
		}
		case "all":
		default:
		{
			return teCareerReserve.tutors;
		}
	}
}

function get_all_tasks_career_reserve(CareerReserveParam)
{
	try
	{
		CareerReserveParam.Name;
		teCareerReserve = CareerReserveParam;
	}
	catch(e)
	{
		if(OptInt(CareerReserveParam) == undefined)
		{
			throw "Аргумент не является ни элементом справочника, ни целым числом" + "\r\n" + DataType(CareerReserveParam) + "(" + ObjectType(CareerReserveParam) + ") --> " + tools.object_to_text(CareerReserveParam, "json") + "\r\n" + err;
		}
		
		try
		{
			var docCareerReserve = open_object(CareerReserveParam, "career_reserve");
			teCareerReserve = docCareerReserve.TopElem;
		}
		catch(err)
		{
			throw StrReplace("Не удалось открыть этап развития карьеры с ID [{PARAM1}]:\r\n", "{PARAM1}", CareerReserveParam) + err;
		}
	}
	return teCareerReserve.tasks;
}

function get_all_tasks_pesonnel_reserve(iPersonnelReserveIDParam)
{
	try
	{
		var docPersonnelReserve = open_object(iPersonnelReserveIDParam, "personnel_reserve");
	}
	catch(err)
	{
		throw StrReplace("Не удалось открыть кадровый резерв с ID [{PARAM1}]:\r\n", "{PARAM1}", iPersonnelReserveIDParam) + err;
	}

	return docPersonnelReserve.TopElem.tasks;
}

function get_all_tasks_talent_pool_by_person(iPersonID, sPersonType, bIsAdaptation, bShowPersonnelReserveTasks, bAdminAccess, sTaskActivityMode)
{
	bShowPersonnelReserveTasks = tools_web.is_true(bShowPersonnelReserveTasks);
	bAdminAccess = tools_web.is_true(bAdminAccess);
	if(sPersonType == "" || sPersonType == null || sPersonType == undefined)
		sPersonType = "person";
	
	bShowPersonnelReserveTasks = !bIsAdaptation && (tools_web.is_true(bShowPersonnelReserveTasks) || (sPersonType == "curator"));
	
	if(bIsAdaptation == null || bIsAdaptation == undefined)
		arrCareerReserveTypes = ["adaptation", "position", "position_common", "staff_position", "name"];
	else if(tools_web.is_true(bIsAdaptation))
		arrCareerReserveTypes = ["adaptation"];
	else
		arrCareerReserveTypes = ["position", "position_common", "staff_position", "name"];
	
	var arrCurCareerReserves = get_career_reserve_collection_by_person(iPersonID, arrCareerReserveTypes, ['all'], "person");
	var arrCurPersonnelReserves = bShowPersonnelReserveTasks ? get_personnel_reserve_collection_by_person(iPersonID, "person", []) : [];
	
	switch(sPersonType)
	{
		case "person":
		{
			var arrCareerReserves = arrCurCareerReserves;
			var arrPersonnelReserves = arrCurPersonnelReserves;
			break;
		}
		case "tutor":
		{
			var arrCareerReserves = ArrayUnion(arrCurCareerReserves, get_career_reserve_collection_by_person(iPersonID, arrCareerReserveTypes, ['all'], "tutor"));
			var arrPersonnelReserves = [];
			break;
		}
		case "curator":
		{
			var arrCareerReserves = [];
			var arrPersonnelReserves = ArrayUnion(arrCurPersonnelReserves, get_personnel_reserve_collection_by_person(iPersonID, "curator", []));
			break;
		}
		case "boss":
		{
			var arrCareerReserves = ArrayUnion(arrCurCareerReserves, get_career_reserve_collection_by_person(iPersonID, arrCareerReserveTypes, ['all'], "boss"));
			var arrPersonnelReserves = ArrayUnion(arrCurPersonnelReserves, get_personnel_reserve_collection_by_person(iPersonID, "boss", []));
			break;
		}
	}
	
	var arrItemTasks
	var arrTasks = [];
	
	var fldPerson, docCareerReserve, teCareerReserve, bSelfTask;
	for (fldCareerReserve in arrCareerReserves)
	{
		docCareerReserve = tools.open_doc(fldCareerReserve.id);
		if(docCareerReserve == undefined)
		{
			continue;			
		}
		
		teCareerReserve = docCareerReserve.TopElem;

		fldPerson=teCareerReserve.person_id.OptForeignElem;
		if (fldPerson==undefined)
		{
			continue			
		}

		bSelfTask = (fldPerson.id == iPersonID);
		arrItemTasks = ArraySelect(get_task_wo_stages(get_task_wo_cancel(teCareerReserve.tasks)), "bSelfTask || This.tutor_id == iPersonID || ArrayOptFind(This.commission_persons,'person_id==' + iPersonID) != undefined");
		for(fldTask in arrItemTasks)
		{
			arrTasks.push({task: fldTask, object: teCareerReserve, activity: get_activity_url(fldTask, iPersonID, sTaskActivityMode)});
		}
	}
	
	if (bShowPersonnelReserveTasks)
	{
		var docPersonnelReserve, tePersonnelReserv, bCanSeeAll;
		for (fldPersonnelReserve in arrPersonnelReserves)
		{
			docPersonnelReserve = tools.open_doc(fldPersonnelReserve.id);
			if(docPersonnelReserve == undefined)
			{
				continue;			
			}

			tePersonnelReserve = docPersonnelReserve.TopElem;
			
			fldPerson = tePersonnelReserve.person_id.OptForeignElem;
			if (fldPerson==undefined)
			{
				continue			
			}

			if(!bAdminAccess && ArrayOptFind(GetAccessAction(fldPersonnelReserve.id, iPersonID), "This == 'personnel_reserve_see_all_tasks'") == undefined)
			{
				continue
			}

			arrItemTasks = get_task_wo_cancel(tePersonnelReserve.tasks);
			
			for(fldTask in arrItemTasks)
			{
				arrTasks.push({task: fldTask, object: tePersonnelReserve, activity: get_activity_url(fldTask, iPersonID, sTaskActivityMode)});
			}
		}
	}
	
	return arrTasks;
}

function get_root_stages(arrAllTasks)
{
	return ArraySelect(arrAllTasks, "This.type == 'stage' && !This.parent_task_id.HasValue")
}

function get_stages(arrAllTasks)
{
	return ArraySelect(arrAllTasks, "This.type == 'stage'")
}

function get_actual_stage(arrRootStages)
{
	var arrPreviousStages = ArraySelect(arrRootStages, "OptDate(This.start_date) != undefined && DateDiff(Date(This.start_date), Date()) < 0");
	if(ArrayOptFirstElem(arrPreviousStages) == undefined)
		return null;
	
	var oRet = ArrayMax(arrPreviousStages, "This.start_date");
	
	return oRet == undefined ? null : oRet;
}

function get_task_wo_cancel(arrAllTasks)
{
	return ArraySelect(arrAllTasks, "This.status != 'cancel'");
}

function get_task_wo_stages(arrAllTasks)
{
//	return ArraySelect(arrAllTasks, "This.type != 'stage' || This.parent_task_id.HasValue");
	return ArraySelect(arrAllTasks, "This.type != 'stage'");
}

function get_expired_task(arrAllTasks, sStageID)
{
	sAddFilter = "";
	if(sStageID != "" && sStageID != null && sStageID != undefined)
		sAddFilter += " && This.parent_task_id == sStageID";
	
	return ArraySelect(arrAllTasks, "(OptDate(This.plan_date) != undefined && (This.status == 'plan' || This.status == 'active') && DateDiff(DateNewTime(This.plan_date, 23, 59, 59), Date()) < 0)" + sAddFilter );
	//return ArraySelect(arrAllTasks, "(This.status == 'active' && OptDate(This.plan_date) != undefined && DateDiff(Date(This.plan_date), Date()) < 0)" + sAddFilter );
}

function get_tasks_career_reserve(CareerReserveParam, arrFilters)
{
	try
	{
		try
		{
			CareerReserveParam.Name;
			teCareerReserve = CareerReserveParam;
		}
		catch(e)
		{
			if(OptInt(CareerReserveParam) == undefined)
			{
				throw "Аргумент не является ни элементом справочника, ни целым числом" + "\r\n" + DataType(CareerReserveParam) + "(" + ObjectType(CareerReserveParam) + ") --> " + tools.object_to_text(CareerReserveParam, "json") + "\r\n" + err;
			}
			
			try
			{
				var docCareerReserve = open_object(CareerReserveParam, "career_reserve");
				teCareerReserve = docCareerReserve.TopElem;
			}
			catch(err)
			{
				throw StrReplace("Не удалось открыть этап развития карьеры с ID [{PARAM1}]:\r\n", "{PARAM1}", iCareerReserveIDParam) + err;
			}
		}
		var arrAllTasks = get_all_tasks_career_reserve(teCareerReserve);
	}
	catch(err)
	{
		throw StrReplace("Не удалось получить спиское задач этапа развития карьеры с ID [{PARAM1}]:\r\n", "{PARAM1}", iCareerReserveIDParam) + err; 
	}

	return get_task_wo_stages(get_filtered_tasks(arrAllTasks, arrFilters));
}

function get_filtered_tasks(arrAllTasks, arrFilters, bWithFullStages)
{
	function fnRecursion(stage_id, array)
	{
		array.push(stage_id);
		
		for(itemNodes in ArraySelect(arrAllTasks, "This.parent_task_id.Value == stage_id"))
		{
			if(itemNodes.type == 'stage')
				fnRecursion(itemNodes.id.Value, array);
		}
	}
	
	bWithFullStages = tools_web.is_true(bWithFullStages);
	
	var arrSearchCond = [];
	var arrCondFilters = [];
	var arrStages = [];
	var paramValueFrom, paramValueTo;
	var arrSelectTempConds;
	for(oFilter in arrFilters)
	{
		if(oFilter.type == 'search')
		{
			if ( IsArray(oFilter.id) && oFilter.value != '' )
			{
				arrSearchCond = [];
				for(itemName in oFilter.id)
				{
					arrSearchCond.push("StrContains(This." + itemName + ".Value, " + CodeLiteral(oFilter.value) + ")")
				}
				arrCondFilters.push( "(" + ArrayMerge(arrSearchCond, "This", " || ") + ")" );
			}
		}
		else if(oFilter.type == 'select')
		{
			switch(oFilter.id)
			{
				case "status_id":
				{
					arrSelectTempConds = [];
					for(itemFilterValue in oFilter.value)
					{
						if(itemFilterValue.value != "")
						{
							switch(itemFilterValue.value)
							{
								case "overdue":
								{
									if(bWithFullStages)
										arrSelectTempConds.push( "( ( ( This.status.Value == 'plan' || This.status.Value == 'active') && This.plan_date.HasValue && This.plan_date.Value < Date() ) || This.type.Value == 'stage' )" );
									else	
										arrSelectTempConds.push( "( ( This.status.Value == 'plan' || This.status.Value == 'active') && This.plan_date.HasValue && This.plan_date.Value < Date() )" );
									break;
								}
								case "plan":
								case "active":
								{
									if(bWithFullStages)
										arrSelectTempConds.push( "( ( This.status.Value == " + CodeLiteral(itemFilterValue.value) + " && ( !This.plan_date.HasValue || This.plan_date.Value >= Date() ) ) || This.type.Value == 'stage' )");
									else	
										arrSelectTempConds.push( "This.status.Value == " + CodeLiteral(itemFilterValue.value) + " && ( !This.plan_date.HasValue || This.plan_date.Value >= Date() )");
									
									break;
								}
								default:
								{
									if(bWithFullStages)
										arrSelectTempConds.push( "( This.status.Value == " + CodeLiteral(itemFilterValue.value) + " || This.type.Value == 'stage' )");
									else	
										arrSelectTempConds.push( "This.status.Value == " + CodeLiteral(itemFilterValue.value));
								}
							}
						}
					}
					arrCondFilters.push( "( " + ArrayMerge(arrSelectTempConds, "This", " || ") + " )" )

					break;
				}
				case "stage_id":
				{
					arrSelectTempConds = [];
					for(itemFilterValue in oFilter.value)
					{
						if(itemFilterValue.value != "")
						{
							arrStages = [];
							fnRecursion(itemFilterValue.value, arrStages);
							
							if(bWithFullStages)
								arrSelectTempConds.push( "( StrContains(" + CodeLiteral(ArrayMerge(arrStages, "This", ";")) + ", This.parent_task_id.Value) || This.type.Value == 'stage' }" )
							else	
								arrSelectTempConds.push( "StrContains(" + CodeLiteral(ArrayMerge(arrStages, "This", ";")) + ", This.parent_task_id.Value)" )
						}
					}
					arrCondFilters.push( "( " + ArrayMerge(arrSelectTempConds, "This", " || ") + " )" )

					break;
				}
				case "type_id":
				{
					arrSelectTempConds = [];
					for(itemFilterValue in oFilter.value)
					{
						if(itemFilterValue.value != "")
						{
							if(bWithFullStages)
								arrSelectTempConds.push( "( This.type.Value == " + CodeLiteral(itemFilterValue.value) + " || This.type.Value == 'stage' )");
							else	
								arrSelectTempConds.push( "This.type.Value == " + CodeLiteral(itemFilterValue.value));
						}
					}
					arrCondFilters.push( "( " + ArrayMerge(arrSelectTempConds, "This", " || ") + " )" )

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
				case "execution_period":
				{
					if(paramValueFrom != null && paramValueTo != null)
					{
						arrCondFilters.push( "( !( ( This.start_date.HasValue && This.start_date.Value > " + CodeLiteral(paramValueTo) + " ) || ( This.plan_date.HasValue && This.plan_date.Value < " + CodeLiteral(paramValueFrom) + " ) ) )");
					}
					else if(paramValueFrom != null)
					{
						arrCondFilters.push( "( !This.plan_date.HasValue || This.plan_date.Value >= " + CodeLiteral(paramValueFrom) + " )");
					}
					else if(paramValueTo != null)
					{
						arrCondFilters.push( "( !This.start_date.HasValue || This.start_date.Value < " + CodeLiteral(paramValueTo) + " )");
					}
					break;
				}
			}
		}

	}

	var arrTasks = arrAllTasks;
	if(ArrayOptFirstElem(arrCondFilters) != undefined)
	{
		var sCondFilters = ArrayMerge(arrCondFilters, "This", " && ");
//toLog("sCondFilters: " + sCondFilters, true)
		arrTasks = ArraySelect(arrTasks, sCondFilters);
	}

	return arrTasks;
}

function set_message_action(sMsg, bDoReload)
{
	var oRet = {command: "alert", msg: sMsg};
	if(tools_web.is_true(bDoReload))
			oRet.confirm_result = {command: "reload_page"};
		
	return sMsg != "" ? oRet : {};
}

function close_form(sMsg, bDoReload)
{
	var oRet = {command: "close_form"};
	if(sMsg != null)
		oRet.msg = sMsg;
	
	if(tools_web.is_true(bDoReload))
			oRet.confirm_result = {command: "reload_page"};
		
	return sMsg != "" ? oRet : {};
}

function reload_page()
{
	return {command: "reload_page"};
}

function add_career_reserve(iPersonIDParam, sCareerReserveType, CareerReserveTypeParam, iPersonnelReserveID, dStartDate, dPlanReadinessDate, arrTutorIDs)
{
	function filling_person_sd(xPerson)
	{
		qPerson = ArrayOptFirstElem(XQuery("for $elem in collaborators where $elem/id=" + XQueryLiteral(Int(xPerson.Value)) + " return $elem")) ;
		if(qPerson != undefined )
		{
			xPerson.sd.fullname = qPerson.fullname;
			xPerson.sd.position_name = qPerson.position_name;
			xPerson.sd.position_id = qPerson.position_id;
			xPerson.sd.org_name = qPerson.org_name;
		}
	}
	
	iPersonID = OptInt(iPersonIDParam);
	if(iPersonID == undefined)
		throw StrReplace( "Полученный ID сотрудника не является числом: [{PARAM1}]", "{PARAM1}", iPersonIDParam);

	strHasCareerReserveReq = "for $elem in career_reserves where $elem/position_type=" + XQueryLiteral(sCareerReserveType) + " and MatchSome($elem/status, ('plan','active')) and $elem/person_id=" + XQueryLiteral(iPersonID) + " return $elem";
	
	if(ArrayOptFirstElem(XQuery(strHasCareerReserveReq)) != undefined)
		throw StrReplace( StrReplace( "Сотрудник с ID: [{PARAM1}] уже имеет незавершенный этап развития карьеры типа \"{PARAM2}\"", "{PARAM1}", iPersonID), "{PARAM2}", sCareerReserveType);
	
	var docNewCareerReserve = tools.new_doc_by_name( "career_reserve", false );
	docNewCareerReserve.BindToDb();
	var iNewCareerReserveID = docNewCareerReserve.DocID;
	var teNewCareerReserve = docNewCareerReserve.TopElem;
	
	teNewCareerReserve.position_type = sCareerReserveType;
	switch(sCareerReserveType)
	{
		case "adaptation":
			break;
		case "position":
		{
			teNewCareerReserve.personnel_reserve_id = OptInt(iPersonnelReserveID, null);
			teNewCareerReserve.position_id = OptInt(CareerReserveTypeParam, null);
			xPosition = teNewCareerReserve.position_id.OptForegnElem;
			if(xPosition != undefined)
			{
				teNewCareerReserve.position_id.sd.name = xPosition.name;
				teNewCareerReserve.position_id.sd.basic_collaborator_id = xPosition.basic_collaborator_id;
				teNewCareerReserve.position_id.sd.basic_collaborator_fullname = xPosition.basic_collaborator_fullname;
			}
			break;
		}
		case "name":
		{
			teNewCareerReserve.personnel_reserve_id = OptInt(iPersonnelReserveID, null);
			teNewCareerReserve.position_name = (CareerReserveTypeParam == "") ? "Не указано" : CareerReserveTypeParam ;
			break;
		}
		case "position_common":
		{
			teNewCareerReserve.personnel_reserve_id = OptInt(iPersonnelReserveID, null);
			teNewCareerReserve.position_common_id = OptInt(CareerReserveTypeParam, null);
			xPositionCommon = teNewCareerReserve.position_common_id.OptForegnElem;
			if(xPositionCommon != undefined)
			{
				teNewCareerReserve.position_common_id.sd.name = xPositionCommon.name;
			}
			break;
		}
	}

	teNewCareerReserve.status = "active";
	
	teNewCareerReserve.person_id = iPersonID;
	filling_person_sd(teNewCareerReserve.person_id);
	
	dStartDate = OptDate(dStartDate);
	teNewCareerReserve.start_date = dStartDate != undefined ? dStartDate : Date();
	
	dPlanReadinessDate = OptDate(dPlanReadinessDate);
	if(dPlanReadinessDate != undefined)
		teNewCareerReserve.plan_readiness_date = dPlanReadinessDate;
	
	if(IsArray(arrTutorIDs))
	{
		for(iTutorID in arrTutorIDs)
		{
			iTutorID = OptInt(iTutorID);
			if(iTutorID != undefined)
			{
				newTutor = teNewCareerReserve.tutors.AddChild();
				newTutor.person_id = iTutorID;
				tools.common_filling("collaborator", newTutor, iTutorID);
			}
		}
	}
	
	docNewCareerReserve.Save();
	
	return iNewCareerReserveID;
}

function uni_filling_task(xTargetTask, oSourceTask)
{
	if(ObjectType( oSourceTask ) == "XmElem")
	{
		xTargetTask.AssignElem( oSourceTask );
	}
	else if (ObjectType( oSourceTask ) == "JsObject")
	{
		var curValue;
		for(itemAtribute in oSourceTask)
		{
			if(xTargetTask.ChildExists(itemAtribute))
			{
				curValue = oSourceTask.GetProperty(itemAtribute);
				if(xTargetTask.Child(itemAtribute).Type == "date")
				{
					curValue = OptDate(curValue);
					if(curValue != undefined)
						xTargetTask.Child(itemAtribute).Value = DateNewTime(UtcToLocalDate(curValue));
				}
				else
				{
					xTargetTask.Child(itemAtribute).Value  = curValue;
				}
			}
		}
	}
	else
		throw "Тип объекта источника не является ни XmlElem, ни JSObject";
	
	switch ( xTargetTask.type )
	{
		case 'task':
			break;
		case 'learning':
			xTargetTask.object_type = 'course';
			break;
		case 'test_learning':
			xTargetTask.object_type = 'assessment';
			break;
		case 'document_learning':
			xTargetTask.object_type = 'document';
			break;
		default:
			xTargetTask.object_type = xTargetTask.type;
			break;
	}
	if(!xTargetTask.id.HasValue)
		xTargetTask.id.Value = tools.random_string( 12 );
	
	if(!xTargetTask.status.HasValue)
		xTargetTask.status.Value = "active";
	
	if(!xTargetTask.start_date.HasValue)
		xTargetTask.start_date.Value = Date();
	
	return xTargetTask;
}

function get_days_between_date(dDateStartParam, dDateEndParam)
{
	var dDateStart = OptDate(dDateStartParam);
	var dDateEnd = OptDate(dDateEndParam);
	
	if(dDateStart == undefined || dDateEnd == undefined)
		return null;
	
	return Int(DateDiff(DateNewTime(dDateEnd), DateNewTime(dDateStart))/86400);
}

function get_actual_activity(arrAllTasks, iPersonID, mode)
{
	var arrActualActivity = [];
	var oActualActivity = {};
	var oActivityUrl;
	
	for(itemTask in arrAllTasks)
	{
		oActivityUrl = get_activity_url(itemTask, iPersonID, mode);
		
		if(oActivityUrl.is_active)
		{
			try
			{
				oActualActivity = cast_oReserveTask(itemTask);
			}
			catch(err)
			{
				throw StrReplace(StrReplace("Ошибка при конвертации задачи \"{PARAM1}\" [{PARAM2}]:\r\n", "{PARAM1}", itemTask.name), "{PARAM2}", itemTask.id)  + err;
			}			
			oActualActivity.object_link = oActivityUrl.url;
			arrActualActivity.push(oActualActivity);
		}
	}
	return arrActualActivity;
}

function get_activity_url(xTask, iPersonID, mode)
{
	if(mode == "" || mode == null || mode == undefined)
		mode = xTask.ChildExists("start_date") ? "date" : "status";
	// условие истинно если 
	// 1. не указано, что актуальность определяется по дате
	// 2. или у задачи нет параметра даты старта задачи	
	// 3. или параметр даты старта задачи задан и меньше текущей даты и параметр плановойй даты окончания больше текущей даты или не задан
	var bActiveByTime = !StrContains(mode, "date", true) || !xTask.ChildExists("start_date") || ( xTask.start_date.HasValue && DateDiff(Date(), DateNewTime(OptDate(xTask.start_date.Value))) >= 0 && ( !xTask.plan_date.HasValue || DateDiff(Date(), DateNewTime(OptDate(xTask.plan_date.Value), 23 ,59 ,59)) <= 0 ) );
	var bActiveByStatus = !StrContains(mode, "status", true);
	var bNoticeForTutor = false;
	var bExpire = (OptDate(xTask.plan_date) != undefined && (xTask.status == 'plan' || xTask.status == 'active') && DateDiff(Date(xTask.plan_date), Date()) < 0);
	
	var oRet = {
		is_active: false,
		url: tools_web.get_mode_clean_url( null, xTask.object_id.Value ),
		msg: ""
		}
		
	switch(xTask.type.Value)
	{
		case "task":
		{
			
			bActiveByStatus = bActiveByStatus || xTask.status.Value == "active";
			oRet.url = "";
			bNoticeForTutor = ( xTask.plan_date.HasValue && DateDiff(Date(), DateNewTime(OptDate(xTask.plan_date.Value), 23 ,59 ,59)) > 0 && !xTask.score.HasValue)
			break;
		}
		case "learning":
		{
			if(xTask.active_learning_id.HasValue)
			{
				var docActivity = tools.open_doc(xTask.active_learning_id.Value);
				if(docActivity != undefined && docActivity.TopElem.person_id.Value == iPersonID)
				{
					oRet.url = tools_web.get_mode_clean_url(null, OptInt(xTask.active_learning_id.Value));
					bActiveByStatus = bActiveByStatus || (xTask.status.Value == "active");
				}
			}				
			
			break;
		}
		case "education_method":
		{
			if(xTask.event_id.HasValue)
			{
					oRet.url = tools_web.get_mode_clean_url(null, OptInt(xTask.event_id.Value));
					bActiveByStatus = bActiveByStatus || (xTask.status.Value == "active");
			}				
			
			break;
		}
		case "test_learning":
		{
			if(xTask.active_test_learning_id.HasValue)
			{
				var docActivity = tools.open_doc(xTask.active_test_learning_id.Value);
				if(docActivity != undefined && docActivity.TopElem.person_id.Value == iPersonID)
				{
					oRet.url = tools_web.get_mode_clean_url(null, OptInt(xTask.active_test_learning_id.Value));
					bActiveByStatus = bActiveByStatus || (xTask.status.Value == "active");
				}
			}				
			
			break;
		}
		case "document_learning":
		{
			if(xTask.object_type.Value == "absolute_doc")
				oRet.url = String(xTask.link_document.Value);
			
			bActiveByStatus = bActiveByStatus || (xTask.status.Value == "active" && oRet.url != "");
			
			if(oRet.url == "") oRet.msg = "Ссылка на документ отсутствует"
			
			break;
		}
		case "assessment_appraise":
		{
			
			var iObjectID = xTask.assessment_appraise_id.HasValue ? xTask.assessment_appraise_id.Value : xTask.object_id.Value;
			bIsPlayer = tools_web.is_true(ArrayOptFirstElem(XQuery("for $elem in assessment_appraises where $elem/id=" + iObjectID + " return $elem"), {player: 0}).player);
			
			oRet.url = bIsPlayer ? "/appr_player.html?assessment_appraise_id=" + OptInt(iObjectID) : tools_web.get_mode_clean_url("assessment_appraise", null, {assessment_appraise_id: OptInt(iObjectID)});
			bActiveByStatus = bActiveByStatus || (xTask.status.Value == "active");
			break;
		}
		case "poll_procedure":
		{
			if(xTask.poll_procedure_id.HasValue)
			{
				oRet.url =  tools_web.get_mode_clean_url( null, xTask.poll_procedure_id.Value );
				if(xTask.poll_result_id.HasValue)
				{
					var xPollResult = xTask.poll_result_id.OptForeignElem;
					if(xPollResult != undefined)
					{
						oRet.url = "/poll_launch.html?object_id=" + StrInt(xPollResult.poll_id.Value)
						bActiveByStatus = bActiveByStatus || (xTask.status.Value == "active");
					}
				}
				else
				{
					var docActivity = tools.open_doc(xTask.poll_procedure_id.Value);
					if(docActivity != undefined && ArrayOptFind(docActivity.TopElem.auditorys, "This.person_id.Value == iPersonID") != undefined)
					{
						var xPoll = ArrayOptFirstElem(docActivity.TopElem.polls);
						if(xPoll != undefined)
						{
							oRet.url = tools_web.get_mode_clean_url( null, xPoll.poll_id.Value );
							bActiveByStatus = bActiveByStatus || (xTask.status.Value == "active");
						}
					}
				}
			}				

			break;
		}
		default:
		{
			bActiveByStatus = false;
			oRet.url = "";
			oRet.msg = "Задача не имеет ссылки на активность";
			bNoticeForTutor = ( xTask.plan_date.HasValue && DateDiff(Date(), DateNewTime(OptDate(xTask.plan_date.Value), 23 ,59 ,59)) > 0 && !xTask.score.HasValue)
			break;
		}
	}
	oRet.is_active = bActiveByStatus && bActiveByTime;
	oRet.is_tutor_heed = bNoticeForTutor;
	oRet.is_expire = bExpire;
	
	return oRet;
}

function get_colleague_by_subdivisions( person_id, only_direct_subdivisions, include_orgs_where_user_is_boss )
{
	sPersonSubdivisionsIDs = get_subdivisions_ids_where_person_is_boss( person_id, only_direct_subdivisions, include_orgs_where_user_is_boss );

	var sPositionReq = "for $elem in positions where MatchSome( $elem/parent_object_id, ( " + sPersonSubdivisionsIDs + " ) ) order by $elem/parent_object_id return $elem/Fields('basic_collaborator_id','basic_collaborator_fullname','name','id')";

	//var arrColleague = ArrayExtract( tools.xquery( sPositionReq ), '({person_id: This.basic_collaborator_id.Value, person_name: This.basic_collaborator_fullname.Value, position_id: This.id.Value, position_name: This.name.Value})' );
	var arrColleague = ArraySelect(tools.xquery( sPositionReq ), "OptInt(This.basic_collaborator_id.Value) != undefined");
	
	return arrColleague;
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

	sSubsWherePersonIsBoss = "for $elem in positions where $elem/basic_collaborator_id = " + iPersonID + " and $elem/is_boss = true() and $elem/parent_object_id != null() order by $elem/parent_object_id return $elem/Fields('parent_object_id')";
	sSubsWherePersonIsFuncManager = "for $elem in func_managers where $elem/catalog = 'subdivision' and $elem/person_id = " + iPersonID + " order by $elem/object_id return $elem/Fields('object_id')";

	arrSubsIDsWherePersonIsBoss = ArraySelectDistinct( ArrayExtractKeys( tools.xquery( sSubsWherePersonIsBoss ), 'parent_object_id' ), 'This' ); 
	arrSubsIDsWherePersonIsFuncManager = ArraySelectDistinct( ArrayExtractKeys( tools.xquery( sSubsWherePersonIsFuncManager ), 'object_id' ), 'This' );

	arrAllSubsIDsWhereUserIsBoss = ArrayUnion( arrSubsIDsWherePersonIsBoss, arrSubsIDsWherePersonIsFuncManager );

	arrOrgsIDsWherePersonIsBoss = new Array();

	if ( bIncludeOrgsWhereUserIsBoss )
	{
		arrOrgsIDsWherePersonIsBoss = get_orgs_ids_where_person_is_boss( iPersonID );
	}

	arrAllSubsIDsWhereUserIsBoss = ArrayUnion( arrAllSubsIDsWhereUserIsBoss, arrOrgsIDsWherePersonIsBoss );
	
	if ( ! bOnlyDirectSubdivisions )
	{
		arrAllHierSubs = new Array();

		for ( id in arrAllSubsIDsWhereUserIsBoss )
		{
			arrCurHierSubs = ArrayExtractKeys( tools.xquery( 'for $elem in subs where IsHierChild( $elem/id, ' + id + ' ) and $elem/type = \'subdivision\' order by $elem/Hier() return $elem/id' ), 'id' );
			arrAllHierSubs = ArrayUnion( arrAllHierSubs, arrCurHierSubs );
		}

		arrAllHierSubs = ArraySelectDistinct( arrAllHierSubs, 'This' );
		arrAllSubsIDsWhereUserIsBoss = ArrayUnion( arrAllSubsIDsWhereUserIsBoss, arrAllHierSubs );
	}

	sPersonSubdivisionsIDs = ArrayMerge( arrAllSubsIDsWhereUserIsBoss, 'This', ',' );

	return sPersonSubdivisionsIDs;

}

function get_career_plans_by_object(ObjectParam, bAllByType, arrStatuses, sXQueryQual, arrFilters, arrSubordinates)
{
	bAllByType = tools_web.is_true(bAllByType);
	var sCarrierPlanType = null;
	var sFilterQual = "";
	
	if (arrStatuses == null || arrStatuses == undefined || !IsArray(arrStatuses))
		arrStatuses = [];
	
	if (sXQueryQual == null || sXQueryQual == undefined)
		sXQueryQual = "";
	
	if (arrSubordinates == null || arrSubordinates == undefined || !IsArray(arrSubordinates))
		arrSubordinates = [];
	
	if (ArrayOptFirstElem(arrStatuses) != undefined)
	{
		sFilterQual += " and MatchSome($elem/status, ('" + ArrayMerge(arrStatuses, "This", "','") + "'))";
	}
	
	if (sXQueryQual != "")
	{
		sFilterQual += " and" + sXQueryQual;
	}
	
	if ( arrFilters != undefined && arrFilters != null && IsArray(arrFilters) )
	{
		for ( oFilter in arrFilters )
		{
			if ( oFilter.type == 'search' )
			{
				if ( oFilter.value != '' )
				{
					sFilterQual += " and doc-contains( $elem/id, '" + DefaultDb + "'," + XQueryLiteral( oFilter.value ) + " )"
				}
			}
		}
	}
	
	if (ArrayOptFirstElem(arrSubordinates) != undefined)
	{
		sFilterQual += " and MatchSome($elem/object_id, (" + ArrayMerge(arrSubordinates, "This", ",") + "))";
	}
	
	iObjectID = OptInt(ObjectParam);
	if(iObjectID == undefined )
	{
		if(DataType(ObjectParam) != 'string')
		{
			throw StrReplace("Некорректный ID объекта: [{PARAM1}]", "{PARAM1}", ObjectParam);
		}
		else
		{
			sCarrierPlanType = ObjectParam;
			bAllByType = true;
		}
	}
	if(sCarrierPlanType == null)
	{
		var docObject = tools.open_doc(iObjectID);
		
		if(docObject == undefined )
			throw StrReplace("Не найден объект с ID: [{PARAM1}]", "{PARAM1}", iObjectID);
		
		sCarrierPlanType = docObject.TopElem.Name;
		
		if(ArrayOptFind(['collaborator', 'position_common', 'group', 'position', 'position_family'],  "This == sCarrierPlanType") == undefined)
			throw StrReplace("Объект с ID: [{PARAM1}] не является сотрудником. группой, должностью, типовой должностью или семейством должностей", "{PARAM1}", iObjectID);
	}
	
	if(bAllByType)
	{
		arrCarrierPlanType = sCarrierPlanType.split(',');
	
		for (_carrier_plan_type in arrCarrierPlanType)
		{
			if(ArrayOptFind(['collaborator', 'position_common', 'group', 'position', 'position_family'],  "This == _carrier_plan_type") == undefined)
				throw "Объект с типом: " + _carrier_plan_type + " не является сотрудником. группой, должностью, типовой должностью или семейством должностей";
		}
		
		var strReq = "for $elem in career_plans where MatchSome($elem/object_type, ('" + ArrayMerge(arrCarrierPlanType, "This", "','") + "'))" + sFilterQual + " return $elem"
	}
	else
	{
		var strReq = "for $elem in career_plans where $elem/object_id=" + XQueryLiteral(iObjectID) + sFilterQual + " return $elem"
	}

	return ArraySelectAll(tools.xquery(strReq))
}

function get_object_ids_for_type_career_plan(PersonIDParam, sCareerPlanType)
{
	var iPersonID = OptInt(PersonIDParam);
	
	if(iPersonID == undefined)
		throw StrReplace("Передан некорректный ID сотрудника: [{PARAM1}]", "{PARAM1}", PersonIDParam);
	switch(sCareerPlanType)
	{
		case "collaborator":
		{
			return [iPersonID];
		}
		case "position":
		{
			var sPositionReq = "for $elem in positions where $elem/basic_collaborator_id=" + iPersonID + " return $elem/Fields('id')";
			return ArrayExtract(tools.xquery(sPositionReq), "This.id.Value");
		}
		case "position_common":
		{
			var sCommonPositionReq = "for $elem in positions where $elem/position_common_id!=null() and $elem/basic_collaborator_id=" + iPersonID + " return $elem/Fields('position_common_id')";
			var arrRet = ArraySelectDistinct(tools.xquery(sCommonPositionReq), "This.position_common_id");
			return ArrayExtract(arrRet, "This.position_common_id.Value");
		}
		case "position_family":
		{
			return [];
		}
		case "group":
		{
			return [];
		}
		default:
		{
			throw StrReplace( "Передан недопустимый тип объекта привязки карьерного плана: [{PARAM1}]", "{PARAM1}", sCareerPlanType)
		}
	}

}

function parse_error(sError, oAccessParam)
{
	var oErr = {code: 1, message: ""};
	if(StrBegins(sError, '{'))
	{
		try
		{
			var subError = ParseJson(sError);
		}
		catch(err)
		{
			oErr.message  = sError + "\r\n" + err;
			return oErr;
		}
		oErr.code = subError.error_code;
		if(subError.error_message != "")
		{
			oErr.message = subError.error_message;
		}
		else if(subError.error_message_const != "")
		{
			oErr.message = tools_web.get_web_const( subError.error_message_const, oAccessParam.cur_lng );
		}
	}
	else
	{
		oErr.code = 1;
		oErr.message = sError;
	}
	return oErr
}

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

function form_fields_to_object(sFormFields)
{
	var oFormField = {};
	for(ffItem in parse_form_fields(sFormFields))
	{
		if(ffItem.GetOptProperty( "type" ) == "file")
			oFormField.SetProperty(ffItem.name, ({value:ffItem.value, url: (ffItem.HasProperty("url") ? ffItem.url : "")}));
		else
			oFormField.SetProperty(ffItem.name, ffItem.value);
	}
	
	return oFormField;
}

//========================================================================================================
//========================================================================================================


function update_career_reserve( iCareerReserveID, docCareerReserve, arrTaskTypes )
{
	function set_error( iError, sErrorText, bResult )
	{
		oRes.error = iError;
		oRes.errorText = sErrorText;
		oRes.result = bResult;
	}
	var oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	
	try
	{
		iCareerReserveID = Int( iCareerReserveID );
	}
	catch( ex )
	{
		set_error( 1, "Передан некорректный ID кадрового резерва", false );
		return oRes;
	}
	try
	{
		docCareerReserve.TopElem;
	}
	catch( ex )
	{
		try
		{
			docCareerReserve = tools.open_doc( iCareerReserveID );
			if( docCareerReserve == undefined )
			{
				throw "error";
			}
		}
		catch( ex )
		{
			set_error( 1, "Передан некорректный ID кадрового резерва", false );
			return oRes;
		}
	}
	try
	{
		if( !IsArray( arrTaskTypes ) )
		{
			throw "error";
		}
	}
	catch( ex )
	{
		arrTaskTypes = null;
	}
	
	var tePerson = null;
	var teCareerReserve = docCareerReserve.TopElem;
	var iPersonID = teCareerReserve.person_id.Value;

	function check_task_type( _task )
	{
		if( arrTaskTypes != null && ArrayOptFind( arrTaskTypes, "This == _task.type" ) == undefined )
		{
			return false;
		}
		return true;
	}
	function get_person()
	{
		if( tePerson == null )
		{
			tePerson = OpenDoc( UrlFromDocID( iPersonID ) ).TopElem;
		}
		return tePerson;
	}
	
	function check_is_assist_event( catEventCollaborator )
	{
		catEventResult = ArrayOptFindByKey( get_learning_objects( "event_results" ), catEventCollaborator.event_id, "event_id" );
		if( catEventResult != undefined )
		{
			return catEventResult.is_assist ? "passed" : "failed";
		}
		return "failed";
	}
	
	function check_active_learning( _object_id, _cat_task, sType )
	{
		if( !_object_id.HasValue )
		{
			return _cat_task.status.Value;
		}
		var sFieldName = sType == "learnings" ? "course_id" : "assessment_id";
		var sFinishFieldName = sType == "learnings" ? "active_learning_id" : "active_test_learning_id";
		var oFieldValue = sType == "learnings" ? _cat_task.active_learning_id : _cat_task.active_test_learning_id;
		var oFinishLearning, oLearning;
		if( oFieldValue.HasValue )
		{
			oFinishLearning = ArrayOptFind( get_learning_objects( sType ), "This." + sFinishFieldName + " == oFieldValue" );
			if( oFinishLearning != undefined )
			{
				return ( oFinishLearning.state_id == 4 ? "passed" : "failed" );
			}
			oLearning = ArrayOptFind( get_learning_objects( "active_" + sType ), "This.id == oFieldValue" );
			if( oLearning != undefined )
			{
				return "active";
			}
		}
		else
		{
			oFinishLearning = ArrayOptFind( get_learning_objects( sType ), "This." + sFieldName + " == _cat_task.object_id" );
			if( oFinishLearning != undefined )
			{
				_cat_task.Child( sFinishFieldName ).Value = oFinishLearning.Child( sFinishFieldName ).Value;
				bNeedSave = true;
				return ( oFinishLearning.state_id == 4 ? "passed" : "failed" );
			}
			oLearning = ArrayOptFind( get_learning_objects( "active_" + sType ), "This.id == _cat_task.object_id" );
			if( oLearning != undefined )
			{
				_cat_task.Child( sFinishFieldName ).Value = oLearning.id.Value;
				bNeedSave = true;
				return "active";
			}
		}
		return "plan";
	}
	
	function get_status( task_id )
	{
		var _task = teCareerReserve.tasks.GetOptChildByKey( task_id );
		var oLearning;
		if( _task != undefined )
		{
			switch( _task.type )
			{
				case "stage":
					var arrChildPrograms = ArraySelectByKey( teCareerReserve.tasks, task_id, "parent_task_id" );
					if( ArrayOptFirstElem( arrChildPrograms ) != undefined )
					{
						if( ArrayOptFind( arrChildPrograms, "This.status != 'passed'" ) == undefined )
						{
							return "passed";
						}
						if( ArrayOptFind( arrChildPrograms, "This.status != 'passed' && This.status != 'failed'" ) == undefined )
						{
							return "failed";
						}
						if( ArrayOptFind( arrChildPrograms, "This.status != 'plan'" ) == undefined )
						{
							return "plan";
						}
						if( ArrayOptFind( arrChildPrograms, "This.status != 'passed' && This.status != 'active' && This.status != 'failed' && This.status != 'plan'" ) == undefined )
						{
							return "active";
						}
					}
					break;
				case "learning":
					return check_active_learning( _task.object_id, _task, "learnings" );
				case "test_learning":
					return check_active_learning( _task.object_id, _task, "test_learnings" );
				case "learning_task":
					if( !_task.object_id.HasValue )
					{
						return _task.status.Value;
					}
					if( _task.learning_task_result_id.HasValue )
					{
						oLearning = ArrayOptFind( get_learning_objects( "learning_task_results" ), "This.id == _task.learning_task_result_id" );
						if( oLearning != undefined )
						{
							return ( oLearning.status_id == "success" ? "passed" : ( oLearning.status_id == "failed" ? "failed" : "active" ) );
						}
						return _task.status.Value;
					}
					oLearning = ArrayOptFind( get_learning_objects( "learning_task_results" ), "This.learning_task_id == _task.object_id" );
					if( oLearning != undefined )
					{
						return ( oLearning.status_id == "success" ? "passed" : ( oLearning.status_id == "failed" ? "failed" : "active" ) );
					}
					return "plan";
				case "education_program":
					if( !_task.object_id.HasValue )
					{
						return _task.status.Value;
					}
					oLearning = ArrayOptFind( get_learning_objects( "event_collaborators" ), "This.education_program_id == _task.object_id" );
					if( oLearning != undefined )
					{
						return oLearning.status_id == "close" ? check_is_assist_event( oLearning ) : oLearning.status_id == "cancel" ? "failed" : "active";
					}
					return "plan";
				case "compound_program":
					if( !_task.object_id.HasValue || !_task.event_id.HasValue )
					{
						return _task.status.Value;
					}
					oLearning = ArrayOptFind( get_learning_objects( "events" ), "_task.event_id.HasValue ? This.id == _task.event_id : This.compound_program_id == _task.object_id" );
					if( oLearning != undefined )
					{
						return oLearning.status_id == "close" ? check_is_assist_event( oLearning ) : oLearning.status_id == "cancel" ? "failed" : "active";
					}
					return "plan";
				case "education_method":
					if( !_task.object_id.HasValue || !_task.event_id.HasValue )
					{
						return _task.status.Value;
					}
					var feEducationMethod = _task.object_id.OptForeignElem;
					if( feEducationMethod == undefined )
					{
						return _task.status.Value;
					}
					oLearning = ArrayOptFind( get_learning_objects( "event_collaborators" ), "_task.event_id.HasValue ? This.event_id == _task.event_id : This.education_method_id == _task.object_id" );
					if( oLearning != undefined )
					{
						return oLearning.status_id == "close" ? check_is_assist_event( oLearning ) : oLearning.status_id == "cancel" ? "failed" : "active";
					}
					return "plan";
				case "poll":
					if( !_task.object_id.HasValue )
					{
						return _task.status.Value;
					}
					oLearning = ArrayOptFind( get_learning_objects( "poll_results" ), "_task.poll_result_id.HasValue ? This.id == _task.poll_result_id : This.poll_id == _task.object_id" );
					if( oLearning != undefined )
					{
						if( _task.poll_result_id != oLearning.id )
						{
							_task.poll_result_id = oLearning.id;
							bNeedSave = true;
						}
						
						return oLearning.is_done ? "passed" : "active";
					}
					return "plan";
				case "task":
					if( !_task.object_id.HasValue )
					{
						return _task.status.Value;
					}
					oLearning = ArrayOptFind( get_learning_objects( "tasks" ), "This.task_type_id == _task.object_id" );
					if( oLearning != undefined )
					{
						return oLearning.status == "1" ? "passed" : "active";
					}
					return "plan";
				case "poll_procedure":
					if( !_task.poll_procedure_id.HasValue )
					{
						return _task.status.Value;
					}
					oLearning = ArrayOptFind( get_learning_objects( "poll_results" ), "_task.poll_result_id.HasValue ? This.id == _task.poll_result_id : This.poll_procedure_id == _task.poll_procedure_id" );
					if( oLearning != undefined )
					{
						if( _task.poll_result_id != oLearning.id )
						{
							_task.poll_result_id = oLearning.id;
							bNeedSave = true;
						}
						return oLearning.is_done ? "passed" : "active";
					}
					return "plan";
				case "document_learning":
					if( !_task.object_id.HasValue )
					{
						return _task.status.Value;
					}
					oLearning = ArrayOptFind( get_learning_objects( "library_material_viewings" ), "This.material_id == _task.object_id" );
					if( oLearning != undefined )
					{
						return oLearning.state_id == "finished" ? "passed" : "active";
					}
					return "plan";
				case "assessment_appraise":
					if( !_task.object_id.HasValue )
					{
						return _task.status.Value;
					}
					oLearning = ArrayOptFind( get_learning_objects( "assessment_appraises" ), "_task.assessment_appraise_result_id.HasValue ? This.id == _task.assessment_appraise_result_id : This.id == _task.assessment_appraise_id" );
					if( oLearning != undefined && _task.status == "plan" )
					{
						return "active";
					}
					return _task.status.Value;
					
			}
			return _task.status.Value;
		}
		return "plan";
		
	}
	function activate_course( _task, _course_id )
	{
		_result = tools.activate_course_to_person( iPersonID, _course_id, null, get_person() );
		try
		{
			_task.active_learning_id = _result.DocID;
			_task.status = "plan";
		}
		catch ( sdf )
		{
			_task.active_learning_id = _result;
			_task.status = "active";
		}
		return _result;
	}
	function create_event( _task, feObject )
	{
		var docEvent = OpenNewDoc( 'x-local://wtv/wtv_event.xmd' );
		var sType = "";
		if( _task.type == "education_method" )
		{
			if( feObject.event_type_id.HasValue )
			{
				docEvent.TopElem.event_type_id = feObject.event_type_id;
				catEventType = ArrayOptFirstElem( XQuery( "for $elem in event_types where $elem/id = " + feObject.event_type_id + " return $elem" ) );
				if ( catEventType != undefined )
				{
					docEvent.TopElem.type_id = catEventType.code;
				}
			}
			else
			{
				sType = "education_method";
			}
		}
		else
		{
			sType = "compound_program";
		}
		
		if( sType != "" )
		{
			docEvent.TopElem.type_id = sType;
			catEventType = ArrayOptFirstElem( XQuery( "for $elem in event_types where $elem/code = " + XQueryLiteral( sType ) + " return $elem" ) );
			if ( catEventType != undefined )
				docEvent.TopElem.event_type_id = catEventType.id;
		}
		
		if( _task.type == "education_method" )
		{
			docEvent.TopElem.education_method_id = _task.object_id;
			docEvent.TopElem.program_id = _task.object_id;
			tools.common_filling( 'education_method', docEvent.TopElem, _task.object_id, null, false );
			docEvent.TopElem.event_form = feObject.event_form;
		}
		else
		{
			docEvent.TopElem.create_compound_program_id = teCareerReserve.object_id;
			docEvent.TopElem.compound_program_id = teCareerReserve.object_id;
		}

		docEvent.TopElem.name = _task.name;
		
		if( _task.tutor_id.HasValue )
		{
			var _tutor = docEvent.TopElem.tutors.ObtainChildByKey( _task.tutor_id );
			tools.common_filling( "collaborator", _tutor, _task.tutor_id );
		}

		docEvent.BindToDb( DefaultDb );
		return docEvent;
	}
	function activate_program( _task )
	{

		if( _task != undefined )
		{
			switch( _task.type )
			{
				case "course":
					if( !_task.object_id.HasValue )
					{
						return false;
					}
					_result = activate_course( _task, _task.object_id );
					try
					{
						_task.active_learning_id = _result.DocID;
						_task.status = "active";
					}
					catch ( sdf )
					{
						_task.active_learning_id = _result;
						_task.status = "active";
					}
					break;
				
				case "assessment":
					if( !_task.object_id.HasValue )
						return false;
					_result = tools.activate_test_to_person( iPersonID, _task.object_id, null, get_person() );
					try
					{
						_task.active_test_learning_id = _result.DocID;
						_task.status = "active";
					}
					catch ( sdf )
					{
						_task.active_test_learning_id = _result;
						_task.status = "active";
					}
					break;
				case "learning_task":
					if( !_task.object_id.HasValue )
						return false;
					catLearningTasResult = ArrayOptFirstElem( XQuery( 'for $i in learning_task_results where $i/person_id = ' + iPersonID + ' and $i/learning_task_id = ' + _task.object_id + ' return $i' ) );
					if( catLearningTasResult != undefined )
					{
						_result = catLearningTasResult.id;
					}
					else
					{
						docLearningTaskResult = tools_knlg.activate_learning_task( { 	person_id: iPersonID,
							tePerson: get_person(),
							learning_task_id: _task.object_id,
							plan_start_date: _task.plan_date,
							expert_id: _task.tutor_id,
							start_date: _task.start_date,
						} ).doc_learning_task_result;

						_result = docLearningTaskResult;
					}
					try
					{
						_task.learning_task_result_id = _result.DocID;
						_task.status = "active";
					}
					catch ( sdf )
					{
						_task.learning_task_result_id = _result;
						_task.status = "active";
					}
					break;
				case "education_method":
				case "compound_program":
					if( !_task.object_id.HasValue )
					{
						return false;
					}
					var feObject = _task.object_id.OptForeignElem;
					if( feObject == undefined )
					{
						return false;
					}
					if( _task.event_id.HasValue )
					{
						docEvent = null;
						iEventID = _task.event_id;
					}
					else
					{
						docEvent = create_event( _task, feObject );
						iEventID = docEvent.DocID;
						_task.event_id = iEventID;
					}
					
					tools.add_person_to_event( iPersonID, iEventID, get_person(), docEvent );
					_task.status = "active";
					return true;
				case "document_learning":
					if( !_task.object_id.HasValue )
					{
						return false;
					}
					_result = tools.recommend_library_material_to_person( iPersonID, _task.object_id, get_person(), null, false  );
					_task.status = "active";
					break;
				case "poll":
					if( !_task.object_id.HasValue )
					{
						return false;
					}
					if( _task.poll_result_id.HasValue )
					{
						return false;
					}
					oLearning = ArrayOptFind( get_learning_objects( "poll_results" ), "_task.poll_result_id.HasValue ? This.id == _task.poll_result_id : This.poll_id == _task.object_id" );
					if( oLearning != undefined )
					{
						_task.poll_result_id = oLearning.id;
					}
					else
					{
						_result = tools.activate_poll_to_person( get_person(), _task.object_id, null );
					
						try
						{
							_task.poll_result_id = _result.DocID;
						}
						catch ( sdf )
						{
							_task.poll_result_id = _result;
						}
					}
					_task.status = "active";
					return true;
				case "poll_procedure":
					if( !_task.poll_procedure_id.HasValue )
					{
						return false;
					}
					if( _task.poll_result_id.HasValue )
					{
						return false;
					}
					oLearning = ArrayOptFind( get_learning_objects( "poll_results" ), "_task.poll_result_id.HasValue ? This.id == _task.poll_result_id : This.poll_procedure_id == _task.poll_procedure_id" );
					if( oLearning != undefined )
					{
						if( _task.poll_result_id != oLearning.id )
						{
							_task.poll_result_id = oLearning.id;
						}
						_task.status = "active";
						return true;
					}
					else
					{
						try
						{
							var docProc = tools.open_doc( _task.poll_procedure_id );
							if( docProc != undefined )
							{
								if ( ArrayOptFind( docProc.TopElem.auditorys, "This.person_id == iPersonID" ) == undefined )
								{	
									var fldAuditory = docProc.TopElem.auditorys.ObtainChildByKey( iPersonID );
									fldAuditory.person_name = teCareerReserve.person_id.sd.fullname;
									fldAuditory.position_name = teCareerReserve.person_id.sd.position_name;
									docProc.Save();
									
									var arrSelectionPolls = ArraySelect( docProc.TopElem.polls, 'poll_id.HasValue' );
									var arrPolls = Array();
									for ( fldPoll in arrSelectionPolls )
									{
										_pollSet = ArrayOptFind(arrPolls, 'This.id == ' + fldPoll.PrimaryKey);
										if ( _pollSet != undefined )
										{
											continue;
										}
										else
										{
											try
											{
												_pollDoc = OpenDoc( UrlFromDocID( fldPoll.PrimaryKey ) ).TopElem;
												_pollSet = new Object;
												_pollSet.id = fldPoll.PrimaryKey;
												_pollSet.TopElem = _pollDoc;
												arrPolls.push( _pollSet );
											}
											catch(_bg_)
											{
												continue;
											}
										}
										tools_ass.generate_poll_procedure_result_card( _task.poll_procedure_id, docProc, fldAuditory.PrimaryKey, _pollSet.id, _pollSet.TopElem );
									}
								}	
							}
							_task.status = "active";
						}
						catch(ex)
						{
							return false;
						}
					}
					return true;
				
				case "task":
					if( !_task.object_id.HasValue )
					{
						return false;
					}
					if ( !_task.task_id.HasValue )
					{
						fldObject = ArrayOptFirstElem( tools.xquery( "for $elem in task_types where $elem/id = " + _task.object_id.Value + " return $elem" ) );
						if( fldObject == undefined )
						{
							return false;
						}
						taskDoc = OpenNewDoc( 'x-local://wtv/wtv_task.xmd' );
						taskDoc.BindToDb( DefaultDb );
						teTask = taskDoc.TopElem;
						teTask.code = tools.random_string(8);
						teTask.date_plan = Date();
						
						teTask.executor_type = 'collaborator';
						teTask.executor_id = iPersonID;
																			
						teTask.source_object_type = 'career_reserve';
						teTask.source_object_id = iCareerReserveID;
						
						teTask.task_type_id = _task.object_id;
						tools.common_filling( 'task_type', teTask, _task.object_id );
						
						teTask.name = (fldObject == undefined ? '' : fldObject.name + ' / ') + teCareerReserve.person_id.sd.fullname + ' (' + teCareerReserve.person_id.sd.position_name + ')';
						
						_task.task_id = taskDoc.DocID;
						_task.status = "active";
						taskDoc.Save();
					}
					return true
				default:
					return false;	
				
					
			}
		}
		return false;
		
	}
	function get_task( task_id )
	{
		var catTask = ArrayOptFind( arrTasks, "This.id == task_id" );
		if( catTask == undefined )
		{
			catTask = new Object();
			catTask.id = task_id;
			catTask.state_id = get_status( task_id );
			arrTasks.push( catTask );
		}
		return catTask;
	}
	function get_learning_objects( _type )
	{
		
		var _learning_objects = oLearningObject.GetProperty( _type );
		if( _learning_objects == null )
		{
			var sOrder = "";
			switch( _type )
			{
				case "active_learnings":
				case "active_test_learnings":
				case "learnings":
				case "test_learnings":
					sOrder = " order by $elem/score descending ";
					break
			}
			var conds = new Array();
			if( _type == "assessment_appraises" )
			{
				var xarrPas = ArrayUnion( XQuery("for $elem in pas where $elem/person_id = " + iPersonID + " return $elem"), XQuery("for $elem in development_plans where $elem/person_id = " + iPersonID + " return $elem" ), XQuery("for $elem in assessment_plans where $elem/person_id = " + iPersonID + " return $elem" ) );
	
				if( ArrayOptFirstElem( xarrPas ) == undefined )
				{
					oLearningObject.SetProperty( _type, [] );
					return [];
				}
				conds.push( "MatchSome( $elem/id, ( " + ArrayMerge( xarrPas, "This.assessment_appraise_id", "," ) + " ) )" );
			}
			else if( _type == "events" )
			{
				var arrECs = get_learning_objects( "event_collaborators" );
				if( ArrayOptFirstElem( arrECs ) == undefined )
				{
					oLearningObject.SetProperty( _type, [] );
					return [];
				}
				conds.push( "MatchSome( $elem/id, ( " + ArrayMerge( arrECs, "This.event_id", "," ) + " ) )" );
			}
			else if( _type == "event_collaborators" )
			{
				conds.push( "$elem/collaborator_id = " + iPersonID );
			}
			else if( _type == "tasks" )
			{
				conds.push( "$elem/executor_id = " + iPersonID );
			}
			else
			{
				conds.push( "$elem/person_id = " + iPersonID );
			}
			switch( _type )
			{
				case "learnings":
				case "test_learnings":
					conds.push( "$elem/last_usage_date >= " + XQueryLiteral( teCareerReserve.start_date ) );
					break;
				case "learning_task_results":
					conds.push( "( $elem/finish_date = null() or $elem/finish_date >= " + XQueryLiteral( teCareerReserve.start_date ) + " )" );
					break;
				case "event_collaborators":
					conds.push( "$elem/finish_date >= " + XQueryLiteral( teCareerReserve.start_date ) );
					break;
				case "event_results":
					var arrECs = get_learning_objects( "event_collaborators" );
					if( ArrayOptFirstElem( arrECs ) == undefined )
					{
						oLearningObject.SetProperty( _type, [] );
						return [];
					}
					conds.push( "MatchSome( $elem/event_id, ( " + ArrayMerge( arrECs, "This.event_id", "," ) + " ) )" );
					break;
				case "poll_results":
					conds.push( "$elem/create_date >= " + XQueryLiteral( teCareerReserve.start_date ) );
					break;
				case "tasks":
					conds.push( "( $elem/date_fact = null() or $elem/date_fact >= " + XQueryLiteral( teCareerReserve.start_date ) + " )" );
					break;
				case "library_material_viewings":
					conds.push( "( $elem/finish_viewing_date = null() or $elem/finish_viewing_date >= " + XQueryLiteral( teCareerReserve.start_date ) + " )" );
					break;
			}
			_learning_objects = ArraySelectAll( XQuery( "for $elem in " + _type + " where " + ArrayMerge( conds, "This", " and " ) + sOrder + " return $elem" ) );
			oLearningObject.SetProperty( _type, _learning_objects );
		}
		return _learning_objects;
	}
	
	function need_activate_program( catTask )
	{
		if( catTask.plan_date.HasValue )
		{
			if( catTask.plan_date > Date() )
			{
				return false;
			}
		}

		return true;
	}
	
	var oLearningObject = {
		'learnings': null,
		'active_learnings': null,
		'test_learnings': null,
		'active_test_learnings': null,
		'poll_results': null,
		'learning_task_results': null,
		'library_material_viewings': null,
		'event_collaborators': null,
		'events': null,
		'poll_procedures': null,
		'assessment_appraises': null,
		'tasks': null
	}
	
	var curDate = Date();
	var bNeedSave = false;
	var arrTasks = new Array();
	for( _task in teCareerReserve.tasks )
	{
		if( !check_task_type( _task ) )
		{
			continue;
		}
		oProgram = get_task( _task.id.Value );
		if( _task.status != oProgram.state_id )
		{
			_task.status = oProgram.state_id;
			bNeedSave = true;
		}
	}

	for( _task in teCareerReserve.tasks )
		try
		{
			if( !check_task_type( _task ) )
			{
				continue;
			}
			//alert(_task.id + ' ' +need_activate_program( _task ))
			oProgram = get_task( _task.id.Value );
			if( oProgram.state_id == "plan" && need_activate_program( _task ) )
			{
				
				if( activate_program( _task ) )
				{
					if( _task.status == "plan" )
					{
						_task.status = "active";
					}
					bNeedSave = true;
				}
			}
			if ( _task.status != "plan" )
			{
				_parent_task = teCareerReserve.tasks.GetOptChildByKey( _task.parent_task_id );
				if ( _parent_task != undefined && _parent_task.type == "stage" && _parent_task.status == "plan" )
				{
					_parent_task.status = "active";
					bNeedSave = true;
				}
			}
		}
		catch( ex )
		{
			alert('ERROR: libTalentPool: update_career_reserve: ' + ex)
		}
	if( bNeedSave )
	{
		docCareerReserve.Save();
	}
	oRes.doc_career_reserve = docCareerReserve;
	return oRes;
}

/**
 * @function OpenCareerReserveTask
 * @memberof Websoft.WT.Staff
 * @author AZ
 * @description Создание отклика в резерв
 * @param {bigint} iCurUserID - ID текущего пользователя.
 * @param {bigint} iCareerReserveActID - ID этапа развития карьеры.
 * @param {string} sTaskID - ID задачи плана деятельности.
 * @param {string} sLink - Ссылка на объект, получаемая из результатов выборки.
 * @param {boolean} [bNewWindow] - Включает/выключает открытие задачи в новом окне браузера. Игнорируется для мобильных устройств.
 * @param {boolean} [bCanChangeTask] - Разрешает/запрещает назначение активностей и смену статусов задач.
 * @param {boolean} [bNewWindow] - Разрешает/запрещает назначение активностей и смену статусов задач до наступления плановой даты.
 * @returns {WTLPEFormResult}
*/

function OpenCareerReserveTask( iCurUserID, iCareerReserveActID, sTaskID, bNewWindow, bCanChangeTask, bCanChangeBeforeDate, sLink, sCommand, SCOPE_WVARS, curLngWeb )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = true;
	oRes.action_result = ({});

	var Env = CurRequest.Session.GetOptProperty( "Env", ({}) );
	var curDevice = Env.GetOptProperty( "curDevice" );
	var teCareerReserve = undefined;
	
	try
	{
		iCurUserID = Int( iCurUserID );

		curUser = OpenDoc( UrlFromDocID( iCurUserID ) ).TopElem;
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Некорректный ID текущего пользователя";
		return oRes;
	}
	
	try
	{
		iCareerReserveActID = Int( iCareerReserveActID );

		docCareerReserve = tools.open_doc( iCareerReserveActID );
		if ( docCareerReserve != undefined )
		{
			teCareerReserve = docCareerReserve.TopElem;
		}
		if(teCareerReserve == undefined) throw "no adapt"
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Некорректный ID этапа развития карьеры";
		toLog("ERROR: libTalentPool: OpenCareerReserveTask:\r\n" + oRes.errorText, true);
		return oRes;
	}
	
	try
	{
		sTaskID = Trim( String( sTaskID ) );

		if ( sTaskID == '' )
			throw '';
	}
	catch( ex )
	{
		oRes.error = 1;
		oRes.errorText = "Некорректный ID задачи плана деятельности";
		return oRes;
	}
	
	try
	{
		sLink = Trim( String( sLink ) );

		if ( sLink == '' )
			throw '';
	}
	catch( ex )
	{
		sLink == '';
	}

	try
	{
		if ( bNewWindow == null || bNewWindow == undefined )
			throw '';
		else
			bNewWindow = tools_web.is_true( bNewWindow );
	}
	catch( ex )
	{
		bNewWindow = false
	}

	try
	{
		if ( bCanChangeTask == null || bCanChangeTask == undefined )
			throw '';
		else
			bCanChangeTask = tools_web.is_true( bCanChangeTask );
	}
	catch( ex )
	{
		bCanChangeTask = false
	}

	try
	{
		if ( bCanChangeBeforeDate == null || bCanChangeBeforeDate == undefined )
			throw '';
		else
			bCanChangeBeforeDate = tools_web.is_true( bCanChangeBeforeDate );
	}
	catch( ex )
	{
		bCanChangeBeforeDate = false
	}

	try
	{
		if ( ObjectType( SCOPE_WVARS ) != "JsObject" )
			throw "";
	}
	catch( ex )
	{
		 SCOPE_WVARS = ({});
	}

	function get_form_field( field_name )
	{
		catElem = ArrayOptFind( oFormFields, "This.name == field_name" );
		return catElem == undefined ? "" : catElem.value
	}

	switch( sCommand )
	{
		case "eval":

			fldTask = ArrayOptFind( teCareerReserve.tasks, 'This.id == sTaskID' );
			if ( fldTask == undefined )
			{
				oRes.error = 1;
				oRes.errorText = "Задача с указанным ID не найдена в плане деятельности";
				return oRes;
			}
	
			if ( ! bCanChangeTask )
			{
				if ( fldTask.status == 'cancel' )
				{
					oRes.action_result = { command: "alert", msg: "Задача отменена" };
					return oRes;
				}
				else
				{
					if ( sLink == '' )
					{
						oRes.action_result = { command: "alert", msg: "Задача не сформирована" };
						return oRes;
					}

					if ( ! bNewWindow || curDevice.disp_type == "mobile" )
					{
						oRes.action_result = {
							command: "redirect",
							redirect_url: sLink
						};
					}
					else
					{
						oRes.action_result = {
							command: "new_window",
							url: sLink
						};
					}
				}
			}
			else
			{
				if ( fldTask.status == 'cancel' )
				{
					oRes.action_result = { command: "alert", msg: "Задача отменена" };
					return oRes;
				}
				else if ( fldTask.status == 'passed' || fldTask.status == 'failed' )
				{
					oRes.action_result = {
						command: "display_form",
						title: "Оставить комментарий",
						header: "Заполните поля",
						form_fields: [
							{ name: "plan_id", type: "hidden", value: iCareerReserveActID },
							{ name: "task_id", type: "hidden", value: fldTask.id },
							{ name: "comment", label: "Комментарий", type: "text", mandatory : true, validation: "nonempty" }
						],
						buttons:
						[
							{ name: "cancel", label: "Отмена", type: "cancel" },
							{ name: "submit", label: "Отправить", type: "submit" }
						]
					};
				}
				
				else if ( fldTask.status == 'plan' || fldTask.status == 'active' )
				{
					var bNeedSaveDocument = true;
					if ( ! bCanChangeBeforeDate && fldTask.start_date.HasValue && DateDiff( Date(), Date( fldTask.start_date.Value ) ) < 0 )
					{
						oRes.action_result = { command: "alert", msg: "Срок выполнения задачи еще не наступил!" };
						return oRes;
					}
					else if( fldTask.status == 'plan' )
					{
						fldTask.status = 'active';
						if ( fldTask.parent_task_id.HasValue )
						{
							fldStage = ArrayOptFind( teCareerReserve.tasks, 'This.id == fldTask.parent_task_id' )
							if (fldStage.status == 'plan')
							{
								fldStage.status = 'active';
							}
						}	
					}
					
					sTaskObjectLink = '';
					
					switch ( fldTask.type )
					{
						case 'task':
					
							if ( fldTask.object_id.HasValue )
							{
								if ( ! fldTask.task_id.HasValue )
								{
									fldObject = ArrayOptFirstElem( tools.xquery( 'for $elem in task_types where $elem/id = ' + fldTask.object_id +' return $elem' ) );

									docTask = OpenNewDoc( 'x-local://wtv/wtv_task.xmd' );
									docTask.BindToDb( DefaultDb );
									teTask = docTask.TopElem;
									teTask.code = tools.random_string(8);
									teTask.date_plan = Date();

									teTask.executor_type = 'collaborator';
									teTask.executor_id = iCurUserID;

									teTask.source_object_type = 'career_reserve';
									teTask.source_object_id = teCareerReserve.id;
									
									teTask.task_type_id = fldTask.object_id;
									tools.common_filling( 'task_type', teTask, fldTask.object_id );
									
									teTask.name = ( fldObject == undefined ? '' : fldObject.name + ' / ') + teCareerReserve.person_id.sd.fullname + ' (' + teCareerReserve.person_id.sd.position_name + ')';

									teTask.files.AssignElem( fldTask.files );
									teTask.desc = fldTask.desc;
									
									fldTask.task_id = docTask.DocID;
									docTask.Save();

									docCareerReserve.Save();

									bNeedSaveDocument = false;
								
								}

								sTaskObjectLink = tools_web.get_mode_clean_url( null, fldTask.task_id.Value );
							}
							
							break;
					
						case 'defence':
							break;
					
						case 'assessment_appraise':

							if ( fldTask.assessment_appraise_id.HasValue )
							{
								if( !fldTask.assessment_appraise_result_id.HasValue )
								{
									if ( ArrayOptFirstElem( XQuery( "for $elem in pas where $elem/person_id = " + iCurUserID + " and $elem/assessment_appraise_id = " + fldTask.assessment_appraise_id + " return $elem/Fields( 'id' )" ) ) == undefined )
									{
										var bAdded = false;

										try
										{
											tools_ass.generate_assessment_plan( fldTask.assessment_appraise_id, false, false, false, 0, 0, null, iCurUserID )
											bAdded = true;
										}
										catch( ex )
										{
											alert( ex );
										}
			
										if ( bAdded )
										{
											fldTask.assessment_appraise_result_id = fldTask.assessment_appraise_id;
											docCareerReserve.Save();
											bNeedSaveDocument = false;
											sTaskObjectLink = "/appr_player.html?assessment_appraise_id=" + OptInt( fldTask.assessment_appraise_id );
										}
									}
								}
								else
								{
									sTaskObjectLink = "/appr_player.html?assessment_appraise_id=" + OptInt( fldTask.assessment_appraise_id );
								}
							}

							break;

						case 'poll_procedure':
					
							if ( fldTask.poll_procedure_id.HasValue )
							{
								if ( !fldTask.poll_result_id.HasValue && ArrayOptFirstElem( XQuery( "for $elem in poll_results where $elem/person_id = " + iCurUserID + " and $elem/poll_procedure_id = " + fldTask.poll_procedure_id + " and $elem/is_done = false() return $elem/Fields( 'id' )" ) ) == undefined )
								{
									try
									{
										docPollProcedure = OpenDoc( UrlFromDocID( fldTask.poll_procedure_id ) );
										
										if ( ArrayOptFind( docPollProcedure.TopElem.auditorys, 'person_id == ' + iCurUserID ) == undefined )
										{	
												fldAuditory = docPollProcedure.TopElem.auditorys.ObtainChildByKey( iCurUserID );
												fldAuditory.person_name = teCareerReserve.person_id.sd.fullname;
												fldAuditory.position_name = teCareerReserve.person_id.sd.position_name;
												
												docPollProcedure.Save();
												
												arrSelectionPolls = ArraySelect( docPollProcedure.TopElem.polls, 'poll_id.HasValue' );
												arrPolls = Array();
												
												for ( fldPoll in arrSelectionPolls )
												{
													_pollSet = ArrayOptFind( arrPolls, 'This == ' + fldPoll.PrimaryKey );
													if ( _pollSet != undefined )
														_pollDoc = _pollSet.TopElem;
													else
													{
														try
														{
															_pollDoc = OpenDoc( UrlFromDocID( fldPoll.PrimaryKey ) ).TopElem;
															_pollSet = new Object;
															_pollSet.id = fldPoll.PrimaryKey;
															_pollSet.TopElem = _pollDoc;
															arrPolls[ ArrayCount( arrPolls ) ] = _pollSet;
														}
														catch( ex )
														{
															continue;
														}
													}
		
													tools_ass.generate_poll_procedure_result_card( fldTask.poll_procedure_id, docPollProcedure, fldAuditory.PrimaryKey, _pollSet.id, _pollSet.TopElem );
												}
										}	
	
										fldSetPoll = ArrayOptFirstElem( XQuery( 'for $elem in poll_results where $elem/person_id = ' + iCurUserID + ' and $elem/poll_procedure_id = ' + fldTask.poll_procedure_id +' return $elem' ) );
										if ( fldSetPoll != undefined )
										{
											fldTask.poll_result_id = fldSetPoll.id;
											docCareerReserve.Save();
											bNeedSaveDocument = false;
										}
									}
									catch( ex )
									{
										alert( ex );
									}
								}
								
								sTaskObjectLink = tools_web.get_mode_clean_url( null, fldTask.poll_procedure_id.Value );
							}
					
							break;
					
						case 'learning':
					
							if ( fldTask.object_id.HasValue )
							{
								if ( ! fldTask.active_learning_id.HasValue )
								{
									fldLearning = tools.activate_course_to_person( docCareerReserve.TopElem.person_id, fldTask.object_id );
									fldTask.active_learning_id = fldLearning.TopElem.Doc.DocID;
									
									docCareerReserve.Save();
									bNeedSaveDocument = false;
								}

								sTaskObjectLink = tools_web.get_mode_clean_url( null, fldTask.object_id.Value );
							}
					
							break;
					
						case 'test_learning':
							
							if ( fldTask.object_id.HasValue )
							{
								if ( ! fldTask.active_test_learning_id.HasValue )
								{
									fldTestLearning = tools.activate_test_to_person( docCareerReserve.TopElem.person_id, fldTask.object_id );
									fldTask.active_test_learning_id = fldTestLearning.TopElem.Doc.DocID;
									
									docCareerReserve.Save();
									bNeedSaveDocument = false;
								}

								sTaskObjectLink = tools_web.get_mode_clean_url( null, fldTask.object_id.Value );
							}
					
							break;
					
						case 'poll':
					
							if ( fldTask.object_id.HasValue )
							{
								sTaskObjectLink = tools_web.get_mode_clean_url( null, fldTask.object_id.Value );
							}
					
							break;
					
						case 'education_method':
							
							if ( fldTask.object_id.HasValue && fldTask.event_id.HasValue )
							{
								if ( ArrayOptFirstElem( XQuery( "for $elem in event_collaborators where $elem/event_id = " + fldTask.event_id + " and $elem/collaborator_id = " + iCurUserID + " return $elem/Fields( 'id' )" ) ) != undefined )
								{
									sTaskObjectLink = tools_web.get_mode_clean_url( null, fldTask.event_id.Value );
								}
								else
								{
									sTaskObjectLink = tools_web.get_mode_clean_url( null, fldTask.object_id.Value );
								}
							}
					
							break;
					
						case 'compound_program':
					
							if ( fldTask.object_id.HasValue )
							{
								if ( ! fldTask.education_plan_id.HasValue )
								{
									teCompoundProgram = OpenDoc( UrlFromDocID( Int( fldTask.object_id ) ) ).TopElem;

									try
									{
										docEducationPlan = OpenNewDoc( "x-local://wtv/wtv_education_plan.xmd" );
										docEducationPlan.BindToDb( DefaultDb );
										teEducationPlan = docEducationPlan.TopElem;
										teEducationPlan.programs.AssignElem( teCompoundProgram.programs );
										teEducationPlan.compound_program_id = teCompoundProgram.id.Value;
										teEducationPlan.person_id = iCurUserID;
										teEducationPlan.name = teCompoundProgram.name;
										tools.common_filling( 'collaborator', teEducationPlan, iCurUserID );

										for ( fldProgram in teEducationPlan.programs )
										{
											try
											{
												iDuration = OptInt( fldProgram.days, 0 );
												if ( iDuration == 0 && fldProgram.parent_progpam_id.HasValue )
												{
													fldParentProgram = ArrayOptFind( teEducationPlan.programs,'This.id == ' + fldProgram.parent_progpam_id );
													if ( fldParentProgram != undefined )
													{
														iDuration = OptInt( fldParentProgram.days, 0 );
													}
												}
												if ( ! fldProgram.education_method_id.HasValue )
												{
													if ( fldProgram.type == 'course' )
													{
														docResult = tools.activate_course_to_person( teEducationPlan.person_id, fldProgram.object_id, null, curUser, teEducationPlan.Doc.DocID , iDuration );
														try
														{
															fldProgram.active_learning_id = docResult.DocID;
															fldProgram.result_object_id = docResult.DocID;
															fldProgram.result_type = 'active_learning';
															fldProgram.state_id = 0;
														}
														catch ( ex )
														{
															fldProgram.active_learning_id = docResult;
															fldProgram.result_object_id = docResult;
															fldProgram.result_type = 'active_learning';
															fldProgram.state_id = 1;
														}
													}
													else if ( fldProgram.type == 'assessment' )
													{
														docResult = tools.activate_test_to_person( teEducationPlan.person_id, fldProgram.object_id, null, curUser, null, null, iDuration, null, '', null, teEducationPlan.Doc.DocID );
														try
														{
															fldProgram.result_object_id = docResult.DocID;
															fldProgram.result_type = 'active_test_learning';
															fldProgram.state_id = 0;
														}
														catch ( sdf )
														{
															fldProgram.result_object_id = docResult;
															fldProgram.result_type = 'active_test_learning';
															fldProgram.state_id = 1;
														}
													}
													continue;
												}

												try
												{
													teEducationMethod = OpenDoc( UrlFromDocID( fldProgram.education_method_id ) ).TopElem;
												}
												catch ( ex )
												{
													throw ms_tools.get_const('xnfhlky5de') + '\n\n' + ex;
												}
												switch ( teEducationMethod.type )
												{
													case 'course':
														if ( teEducationMethod.course_id != null )
														{
															fldProgram.type = 'course';
															fldProgram.object_id = teEducationMethod.course_id;

															docResult = tools.activate_course_to_person( teEducationPlan.person_id, teEducationMethod.course_id, null, curUser, teEducationPlan.Doc.DocID, iDuration );
															try
															{
																fldProgram.active_learning_id = docResult.DocID;
																fldProgram.result_object_id = docResult.DocID;
																fldProgram.result_type = 'active_learning';
																fldProgram.state_id = 0;
															}
															catch ( ex )
															{
																fldProgram.active_learning_id = docResult;
																fldProgram.result_object_id = docResult;
																fldProgram.result_type = 'active_learning';
																fldProgram.state_id = 1;
															}
														}
														break;
												}
											}
											catch ( ex )
											{
												alert( ex )
											}
										}

										docEducationPlan.Save();
										
										fldTask.education_plan_id = docEducationPlan.DocID;
										docCareerReserve.Save();
										bNeedSaveDocument = false;
									}
									catch( ex )
									{
										alert( ex );
									}
								}

								sTaskObjectLink = tools_web.get_mode_clean_url( null, fldTask.education_plan_id.Value );
							}
					
							break;
					
						case 'document_learning':
					
								switch ( fldTask.type_document )
								{
									case 'portal_doc':
									case 'blog':
									case 'forum':
									case 'resource':
									case 'library_material':
									case 'wiki_article':
					
										if ( fldTask.object_id.HasValue )
											sTaskObjectLink = tools_web.get_mode_clean_url( null, fldTask.object_id.Value );

										break;
					
									case 'absolute_doc':
					
										if ( fldTask.link_document.HasValue )
											sTaskObjectLink = fldTask.link_document.Value;
					
										break;
								}
					
							break;
							
						case 'learning_task':
							if ( fldTask.object_id.HasValue )
								sTaskObjectLink = tools_web.get_mode_clean_url( null, fldTask.object_id.Value );
							break;
					}
					
					if ( bNeedSaveDocument )
						docCareerReserve.Save();

					if ( sTaskObjectLink != '' )
					{
						if ( ! bNewWindow || curDevice.disp_type == "mobile" )
						{
							oRes.action_result = {
								command: "redirect",
								redirect_url: sTaskObjectLink
							};
						}
						else
						{
							oRes.action_result = {
								command: "new_window",
								url: sTaskObjectLink
							};
						}
					}
				}
			}

			break;

		case "submit_form":

			oFormFields = parse_form_fields( SCOPE_WVARS.GetOptProperty( "form_fields" ) );

			sComment = get_form_field( "comment", "" );
			sTaskID = get_form_field( "task_id", "" );

			if ( sTaskID != '' )
			{
				fldTask = ArrayOptFind( teCareerReserve.tasks, 'This.id == sTaskID' );
				if ( fldTask != undefined )
				{
					fldTask.person_comment = sComment;
					docCareerReserve.Save();
					oRes.action_result = { command: "close_form", msg: tools_web.get_web_const( 'kommentariysoh', curLngWeb ) };
				}
			}
			else
			{
				oRes.action_result = { command: "alert", msg: "Некорректный ID задачи" };
			}

			break;
		default:
			oRes.action_result = { command: "alert", msg: "Неизвестная команда" };
			break;
	}
	return oRes;
}

 /**
 * @function CareerPlanCreatePostAction
 * @memberof Websoft.WT.TalentPool
 * @description отправка уведомлений пользователю при изменении карьерного плана. Эта функция - post_action, вызываемая при сохранении карточки карьерного плана
 * @author AKh
 * @param {bigint} iCareerPlanID - ID карьерного плана
 * @param {boolean} bEdit - состояние параметра is_edit объекта-команды вызова карточки (command: "open_doc"...)
 * @param {bigint} iApplicationID - id текущего приложения
 * @param {object} teRemoteAction - TopElem удаленного действия
 */
function CareerPlanCreatePostAction( iCareerPlanID, bEdit, iApplicationID, teRemoteAction )
{
	sSendNotification = teRemoteAction.wvars.ObtainChildByKey( 'send_notification' ).value;
	iNotificationID = teRemoteAction.wvars.ObtainChildByKey( 'notificationID' ).value;

	docNotification = tools.open_doc(OptInt(iNotificationID));

	if (sSendNotification == 'send' && docNotification != undefined)
	{
		docCareerPlan = tools.open_doc(iCareerPlanID);
		
		if (docCareerPlan != undefined && docCareerPlan.TopElem.object_type == 'collaborator')
		{
			iPersonID = docCareerPlan.TopElem.object_id;
			tools.create_notification( docNotification.TopElem.code.Value, iPersonID, '', iCareerPlanID );
		}
	}
}

/**
 * @function GetCareerPlansReport
 * @memberof Websoft.WT.TalentPool
 * @description отчет по карьерным маршрутам
 * @author AKh
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {bigint} iApplicationID - ID приложения
 * @param {object} oFilters - объект с фильтрами (параметрами) отчета
*/
function GetCareerPlansReport( iCurUserID, iApplicationID, oFilters )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.array = [];
	
	try
	{
		iCurUserID = Int(iCurUserID);
	}
	catch( ex )
	{
		oRes.error = 501;
		oRes.errorText = "Передан некорректный ID сотрудника";
		return oRes
	}
	
	try
	{
		iApplicationID = Int(iApplicationID);
	}
	catch( ex )
	{
		oRes.error = 501;
		oRes.errorText = "Передан некорректный ID приложения";
		return oRes
	}
	
	try
	{
		if ( ObjectType( oFilters ) != "JsObject" )
			throw "";
	}
	catch( ex )
	{
		oFilters = new Object();
	}
	
	sXQueryQual = "";
	
	var iOrgID = oFilters.GetOptProperty('org_id');
	if (iOrgID != undefined)
	{
		xarrCollaborators = tools.xquery("for $elem in collaborators where $elem/org_id = " + OptInt(iOrgID, 0) + " return $elem/Fields('id')");
		sXQueryQual += " and MatchSome($elem/object_id, (" + ArrayMerge(xarrCollaborators, "This.id", ",") + "))";
	}
	
	var bHierSubSelect = tools_web.is_true(oFilters.GetOptProperty('hier_sub_select'));

	var iSubdivisionID = oFilters.GetOptProperty('subdivision_id');
	if (iSubdivisionID != undefined && !bHierSubSelect)
	{
		xarrCollaborators = tools.xquery("for $elem in collaborators where $elem/position_parent_id = " + OptInt(iSubdivisionID, 0) + " return $elem/Fields('id')");
		sXQueryQual += " and MatchSome($elem/object_id, (" + ArrayMerge(xarrCollaborators, "This.id", ",") + "))";
	}

	if (iSubdivisionID != undefined && bHierSubSelect)
	{
		arrSubDivisions = tools.xquery('for $elem in subdivisions where IsHierChildOrSelf( $elem/id, ' + XQueryLiteral(iSubdivisionID) + ' ) order by $elem/Hier() return $elem')
		xarrCollaborators = tools.xquery("for $elem in collaborators where MatchSome($elem/position_parent_id, (" + ArrayMerge( arrSubDivisions, 'This.id', ',' ) + ")) return $elem/Fields('id')");
		sXQueryQual += " and MatchSome($elem/object_id, (" + ArrayMerge(xarrCollaborators, "This.id", ",") + "))";
	}
	
	var iGroupID = oFilters.GetOptProperty('group_id');
	if (iGroupID != undefined)
	{
		xarrCollaborators = tools.xquery("for $elem in group_collaborators where $elem/group_id = " + OptInt(iGroupID, 0) + " return $elem/Fields('collaborator_id')");
		sXQueryQual += " and MatchSome($elem/object_id, (" + ArrayMerge(xarrCollaborators, "This.collaborator_id", ",") + "))";
	}
	
	var arrStatuses = oFilters.GetOptProperty('career_reserve_status_type_id');
	if (arrStatuses != undefined)
		sXQueryQual += " and MatchSome($elem/status, ('" + ArrayMerge(arrStatuses, "This", "','") + "'))";
	
	var dStartDate = oFilters.GetOptProperty('date_start');
	if (dStartDate != undefined)
		sXQueryQual += " and $elem/start_date >= date('" + dStartDate + "')";
	
	var dEndDate = oFilters.GetOptProperty('date_end');
	if (dEndDate != undefined)
		sXQueryQual += " and $elem/start_date <= date('" + dEndDate + "')";

	xarrCareerPlans = tools.xquery("for $elem in career_plans where $elem/object_type = 'collaborator' " + sXQueryQual + " return $elem");
	
	var sAccessType = "";
	var iApplLevel = tools.call_code_library_method( "libApplication", "GetPersonApplicationAccessLevel", [ iCurUserID, iApplicationID ] );

	if(iApplLevel >= 7)
	{
		sAccessType = "admin";
	}
	else if(iApplLevel >= 5)
	{
		sAccessType = "hr";
	}
	else if(iApplLevel >= 3)
	{
		sAccessType = "expert";
	}
	else if(iApplLevel >= 1)
	{
		sAccessType = "observer";
	}
	else
	{
		sAccessType = "reject";
	}
	
	var arrSubordinates = [];
	
	switch(sAccessType)
	{
		case "hr":
		{
			var iAppHRManagerTypeID = tools.call_code_library_method("libApplication", "GetApplicationHRBossTypeID", [ iApplicationID, iCurUserID ])

			arrSubordinates = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, '', null, '', true, true, true, true, [iAppHRManagerTypeID], true ] );

			if (ArrayOptFirstElem(arrSubordinates) == undefined)
				return oRes
			break;
		}
		case "expert":
		case "reject":
			return oRes
		case "observer":
		{
			arrSubordinates = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['fact','func'], true, '', null, '', true, true, true, true, [], true ] );
			
			if (ArrayOptFirstElem(arrSubordinates) == undefined)
				return oRes
			break;
		}
	}

	if (ArrayOptFirstElem(arrSubordinates) != undefined)
	{
		arrCareerPlans = ArrayIntersect(xarrCareerPlans, arrSubordinates, 'This.object_id', 'This')
	}
	else
	{
		arrCareerPlans = ArraySelectAll(xarrCareerPlans);
	}
	
	for (_elem in arrCareerPlans)
	{
		docPlan = tools.open_doc(_elem.id);
		_feElem = _elem.object_id.OptForeignElem;
		if ( _feElem == undefined )
		{
			_fullname = "";
		}
		else
		{
			_fullname = _feElem.fullname;
		}
		
		obj =  {
			"code": _elem.code.Value,
			"name": _elem.name.Value,
			"person_id": _elem.object_id,
			"person_fullname": _fullname,
			"target": '',
			"status": _elem.status,
			"start_date": _elem.start_date
		}
		
		if (ArrayOptFirstElem(docPlan.TopElem.stages) != undefined)
		{
			obj.target = ArrayOptMax(docPlan.TopElem.stages, 'plan_date').name
		}
		
		oRes.array.push(obj);
	}
	return oRes;
}

/**
 * @function GetCareerPlansStatReport
 * @memberof Websoft.WT.TalentPool
 * @description статистика по карьерным маршрутам
 * @author AKh
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {bigint} iApplicationID - ID приложения
 * @param {object} oFilters - объект с фильтрами (параметрами) отчета
*/
function GetCareerPlansStatReport( iCurUserID, iApplicationID, oFilters )
{
	oRes = new Object();
	oRes.error = 0;
	oRes.errorText = "";
	oRes.result = {};
	
	try
	{
		iCurUserID = Int(iCurUserID);
	}
	catch( ex )
	{
		oRes.error = 501;
		oRes.errorText = "Передан некорректный ID сотрудника";
		return oRes
	}
	
	try
	{
		iApplicationID = Int(iApplicationID);
	}
	catch( ex )
	{
		oRes.error = 501;
		oRes.errorText = "Передан некорректный ID приложения";
		return oRes
	}
	
	try
	{
		if ( ObjectType( oFilters ) != "JsObject" )
			throw "";
	}
	catch( ex )
	{
		oFilters = new Object();
	}
	
	sXQueryQual = "";
	
	var iOrgID = oFilters.GetOptProperty('org_id');
	if (iOrgID != undefined)
	{
		xarrCollaborators = tools.xquery("for $elem in collaborators where $elem/org_id = " + OptInt(iOrgID, 0) + " return $elem/Fields('id')");
		sXQueryQual += " and MatchSome($elem/object_id, (" + ArrayMerge(xarrCollaborators, "This.id", ",") + "))";
	}
	
	var bHierSubSelect = tools_web.is_true(oFilters.GetOptProperty('hier_sub_select'));

	var iSubdivisionID = oFilters.GetOptProperty('subdivision_id');
	if (iSubdivisionID != undefined && !bHierSubSelect)
	{
		xarrCollaborators = tools.xquery("for $elem in collaborators where $elem/position_parent_id = " + OptInt(iSubdivisionID, 0) + " return $elem/Fields('id')");
		sXQueryQual += " and MatchSome($elem/object_id, (" + ArrayMerge(xarrCollaborators, "This.id", ",") + "))";
	}

	if (iSubdivisionID != undefined && bHierSubSelect)
	{
		arrSubDivisions = tools.xquery('for $elem in subdivisions where IsHierChildOrSelf( $elem/id, ' + XQueryLiteral(iSubdivisionID) + ' ) order by $elem/Hier() return $elem')
		xarrCollaborators = tools.xquery("for $elem in collaborators where MatchSome($elem/position_parent_id, (" + ArrayMerge( arrSubDivisions, 'This.id', ',' ) + ")) return $elem/Fields('id')");
		sXQueryQual += " and MatchSome($elem/object_id, (" + ArrayMerge(xarrCollaborators, "This.id", ",") + "))";
	}
	
	var iGroupID = oFilters.GetOptProperty('group_id');
	if (iGroupID != undefined)
	{
		xarrCollaborators = tools.xquery("for $elem in group_collaborators where $elem/group_id = " + OptInt(iGroupID, 0) + " return $elem/Fields('collaborator_id')");
		sXQueryQual += " and MatchSome($elem/object_id, (" + ArrayMerge(xarrCollaborators, "This.collaborator_id", ",") + "))";
	}
	
	var dStartDate = oFilters.GetOptProperty('date_start');
	if (dStartDate != undefined)
		sXQueryQual += " and $elem/start_date >= date('" + dStartDate + "')";
	
	var dEndDate = oFilters.GetOptProperty('date_end');
	if (dEndDate != undefined)
		sXQueryQual += " and $elem/start_date <= date('" + dEndDate + "')";

	xarrCareerPlans = tools.xquery("for $elem in career_plans where $elem/object_type = 'collaborator' " + sXQueryQual + " return $elem");
	
	var sAccessType = "";
	var iApplLevel = tools.call_code_library_method( "libApplication", "GetPersonApplicationAccessLevel", [ iCurUserID, iApplicationID ] );

	if(iApplLevel >= 7)
	{
		sAccessType = "admin";
	}
	else if(iApplLevel >= 5)
	{
		sAccessType = "hr";
	}
	else if(iApplLevel >= 3)
	{
		sAccessType = "expert";
	}
	else if(iApplLevel >= 1)
	{
		sAccessType = "observer";
	}
	else
	{
		sAccessType = "reject";
	}
	
	var arrSubordinates = [];
	
	switch(sAccessType)
	{
		case "hr":
		{
			var iAppHRManagerTypeID = tools.call_code_library_method("libApplication", "GetApplicationHRBossTypeID", [ iApplicationID, iCurUserID ])

			arrSubordinates = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['func'], true, '', null, '', true, true, true, true, [iAppHRManagerTypeID], true ] );

			if (ArrayOptFirstElem(arrSubordinates) == undefined)
				return oRes
			break;
		}
		case "expert":
		case "reject":
			return oRes
		case "observer":
		{
			arrSubordinates = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['fact','func'], true, '', null, '', true, true, true, true, [], true ] );
			
			if (ArrayOptFirstElem(arrSubordinates) == undefined)
				return oRes
			break;
		}
	}

	if (ArrayOptFirstElem(arrSubordinates) != undefined)
	{
		arrCareerPlans = ArrayIntersect(xarrCareerPlans, arrSubordinates, 'This.object_id', 'This')
	}
	else
	{
		arrCareerPlans = ArraySelectAll(xarrCareerPlans);
	}
	
	arrPlannedCareerPlans = ArraySelect(arrCareerPlans, "This.status == 'plan'");
	arrActiveCareerPlans = ArraySelect(arrCareerPlans, "This.status == 'active'");
	arrPassedCareerPlans = ArraySelect(arrCareerPlans, "This.status == 'passed'");
	arrFailedCareerPlans = ArraySelect(arrCareerPlans, "This.status == 'failed'");
	arrCancelCareerPlans = ArraySelect(arrCareerPlans, "This.status == 'cancel'");
	
	oRes.result =  {
			"routes_count": ArrayCount(arrCareerPlans),
			"plan_count": ArrayCount(arrPlannedCareerPlans),
			"active_count": ArrayCount(arrActiveCareerPlans),
			"passed_count": ArrayCount(arrPassedCareerPlans),
			"failed_count": ArrayCount(arrFailedCareerPlans),
			"cancel_count": ArrayCount(arrCancelCareerPlans),
		}
	
	return oRes;
}

/**
 * @function DeletePersonnelMember
 * @memberof Websoft.WT.TalentPool
 * @author IG
 * @description Удаление участника(ов) кадрового комитета
 * @param {bigint[]} arrPersonnelMemberIDs - Массив ID участников кадрового комитета, подлежащих удалению
 * @returns {oSimpleResultCount}
*/
function DeletePersonnelMember( arrPersonnelMemberIDs ){

	var oRes = tools.get_code_library_result_object();
		oRes.count = 0;
	var countHasObject = 0

	if(!IsArray(arrPersonnelMemberIDs))
	{
		oRes.error = 501;
		oRes.errorText = "Аргумент функции не является массивом";
		return oRes;
	}

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrPersonnelMemberIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 502;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}
	
	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "committee_member")
	{
		oRes.error = 503;
		oRes.errorText = "Данные не являются массивом ID участников кадрового комитета или неверно определен тип документа для обработки";
		return oRes;
	}

	for(iPersonnelMemberID in arrPersonnelMemberIDs)
	{
		try
		{
			sSQL = "for $elem in committee_members where contains( $elem/id, ('" + XQueryLiteral(iPersonnelMemberID) + "') ) return $elem"
			sPersonnelMemberObjectID = ArrayOptFirstElem(tools.xquery(sSQL));

			if(sPersonnelMemberObjectID == undefined){
				continue;
			}
			
			DeleteDoc( UrlFromDocID( iPersonnelMemberID ), false);
			oRes.count++;
		}
		catch(err)
		{
			toLog("ERROR: DeletePersonnelMember: " + ("[" + iPersonnelMemberID + "]\r\n") + err, true);
		}
	}

	return oRes;
}