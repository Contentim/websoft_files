/**
 * @namespace Websoft.WT.Component.TaskAssessment
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
 * @typedef {Object} oSimpleResult
 * @property {number} error
 * @property {string} errorText 
*/

function InitObject(docAssessmentAppraise)
{
	var teAssessmentAppraise = docAssessmentAppraise.TopElem;
	
	teAssessmentAppraise.status = 0;
	teAssessmentAppraise.web_display = 1;
	teAssessmentAppraise.flag_use_plan = 1;
	teAssessmentAppraise.is_model = 0;
	teAssessmentAppraise.assessment_object_type = "collaborator";
	teAssessmentAppraise.ignore_presence = 0;
	teAssessmentAppraise.include_fired = 0;
	teAssessmentAppraise.always_check_custom_experts = 0;
	teAssessmentAppraise.is_basic_comment = 0;
	teAssessmentAppraise.is_comment_required = 0;
	teAssessmentAppraise.player = 1;
    teAssessmentAppraise.is_visible_auditorys = 0;
    teAssessmentAppraise.is_visible_evaluatings = 0;
	teAssessmentAppraise.is_visible_experts = 0;

    oParticipant = teAssessmentAppraise.participants.AddChild();
    oParticipant.participant_id = "self";
    oType = oParticipant.assessment_appraise_types.AddChild();
	oType.assessment_appraise_type_id = "result";
    oType.flag_01 = 0;
    oType.flag_02 = "basic";
    oType.flag_06 = 0;
    oType.is_formuled_result = 0;
    oType.is_formuled_result_readonly = 0;
    oType.incrementation = 0;
    oType.index = 5;    

    docAssessmentAppraise.Save();
}

function SaveAction( iAssessmentAppraiseID, isEdit, AppID, TE  )
{
	var docAssessmentAppraise = tools.open_doc(iAssessmentAppraiseID);
	var teAssessmentAppraise = docAssessmentAppraise.TopElem;

	isNew = tools_web.is_true(teAssessmentAppraise.custom_elems.ObtainChildByKey('isNew').value);
	if(isNew)
	{
		InitObject(docAssessmentAppraise);
	}

	var bCreatePlan = tools_web.is_true(teAssessmentAppraise.custom_elems.ObtainChildByKey('bCreatePlan').value);
	if(bCreatePlan)
	{
		FillObject(docAssessmentAppraise);
	}
}

function FillObject(docAssessmentAppraise)
{

    var teAssessmentAppraise = docAssessmentAppraise.TopElem;
    var iApplicationInstanceIDParam = tools_app.get_cur_application_instance( tools_app.get_application('websoft_task_assessment'), null, teAssessmentAppraise.id.Value, teAssessmentAppraise).id;
	var _doc_instance = tools.open_doc( iApplicationInstanceIDParam );
	var _instance = _doc_instance.TopElem;
    teAssessmentAppraise.doc_info.creation.app_instance_id = tools_app.get_str_app_instance_id( iApplicationInstanceIDParam );

	_instance.name = teAssessmentAppraise.name;
	_instance.code = teAssessmentAppraise.code;
    _instance.wvars.ObtainChildByKey('users_type').value = teAssessmentAppraise.custom_elems.ObtainChildByKey('users_type').value

	_doc_instance.Save();

    var sStartNotify = tools_app.get_cur_settings("sStartNotify", "app", null, null, null, teAssessmentAppraise.id.Value);
    var iStartNotifyMember = OptInt(tools_app.get_cur_settings("iStartNotifyMember", "app", null, null, null, teAssessmentAppraise.id.Value), null);
    var iStartNotifyBoss = OptInt(tools_app.get_cur_settings("iStartNotifyBoss", "app", null, null, null, teAssessmentAppraise.id.Value), null);

    var arrAuditorys = ArrayExtract(docAssessmentAppraise.TopElem.auditorys,"This.PrimaryKey");
	var sAuditorys = "";
	docAssessmentAppraise.TopElem.auditorys.Clear();
	docAssessmentAppraise.Save();
	var sFillAuditorysType = teAssessmentAppraise.custom_elems.ObtainChildByKey('users_type').value;

	switch(sFillAuditorysType)
	{
		case 'all':
			arrAuditorys = ArrayExtract( ArraySelectAll( tools.xquery("for $elem in collaborators where $elem/is_dismiss!=true() return $elem/Fields('id')") ), "This.id.Value" );
			break;
		case 'group':
			arrAuditorys = ArrayExtract( ArraySelectAll( tools.xquery( "for $elem in group_collaborators where $elem/group_id=" + OptInt(teAssessmentAppraise.custom_elems.ObtainChildByKey('users_group_id').value,0) + " return $elem/Fields('collaborator_id')" ) ), "This.collaborator_id.Value" );
			break;
	}

    if ( (sStartNotify == "all" || sStartNotify == "boss") && iStartNotifyBoss != null )
    {
        var sBpName = "";
        var iBP = OptInt(teAssessmentAppraise.custom_elems.ObtainChildByKey( 'bp_assessment' ).value, 0);
        var oBP = ArrayOptFirstElem(tools.xquery("for $elem in budget_periods where $elem/id = " + iBP + " return $elem/Fields('id','name')"));
        sBpName = (oBP != undefined ? oBP.name : "");

        oText = {
            bp_name: sBpName,
            app_id: OptInt(_doc_instance.TopElem.application_id, null)
        }

        tools.create_notification( iStartNotifyBoss, teAssessmentAppraise.person_id, oText,  docAssessmentAppraise.DocID);
    }

    if( ArrayOptFirstElem(arrAuditorys) != undefined )
	{
        sAuditorys = ArrayMerge(arrAuditorys, "This", ",")
		tools_ass.generate_assessment_plan(docAssessmentAppraise.DocID, false, true, false, null, null, null, sAuditorys);

        if ( (sStartNotify == "all" || sStartNotify == "members") && iStartNotifyMember != null)
        {
            var xarrPlans = tools.xquery("for $elem in assessment_plans where $elem/assessment_appraise_id = " + docAssessmentAppraise.DocID + " return $elem");
            for (itemPlan in xarrPlans)
            {
                tools.create_notification( iStartNotifyMember, itemPlan.person_id);
            }
        }
	}

}

/**
 * @function getTasksReport
 * @memberof Websoft.WT.Component.TaskAssessment
 * @author IG
 * @description Получение отчета по задачам
 * @param {Object} oReportTasks - Объект отчета по задачам
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {bigint[]} sApplicationID - ID приложения
 * @returns {oSimpleResult}
 */
function getTasksReport(oReportTasks, curUserID, sApplicationID){
	
	oResult = new Object();
	oResult.error = 0;
	oResult.tasks = [];

	var arrXQueryConditions = [];
	var sXQueryQual = '';
	var sQueryString = 'where $elem/executor_type = \'collaborator\' ';
	
	if( sApplicationID != undefined || sApplicationID != null )
	{
		oModelRoles = CallServerMethod( 'tools_report', 'model_roles', [ curUserID, sApplicationID ] );
	
		arrSubordinateIDs = [];

		if(oModelRoles.type != '')
		{
			switch( oModelRoles.type )
			{
				case 'hr':
				{
					arrSubordinateIDs = oModelRoles.subordinate_ids.hr;
					break;
				}
				case 'observer':
				{
					arrSubordinateIDs = oModelRoles.subordinate_ids.observer;
					break;
				}
			}
			
			if(ArrayCount(arrSubordinateIDs) > 0){
				sXQueryQual = 'MatchSome($elem/person_id, (' + ArrayMerge(arrSubordinateIDs, 'This', ',') + '))';
			}
		}
	}

	if ( oReportTasks.assessment_appraise_id.HasValue )
	{
		arrXQueryConditions.push('$elem/source_object_type = \'assessment_appraise\' and MatchSome($elem/source_object_id, ('+ oReportTasks.assessment_appraise_id +'))');
	}

	if ( oReportTasks.parent_object_id != null )
	{
		catSub = ArrayOptFirstElem( XQuery('for $elem in subdivisions where $elem/id = ' + oReportTasks.parent_object_id + ' return $elem') );

		arrPersonsIDs = ArrayExtract( tools.xquery( 'for $elem in person_hierarchys where MatchSome( $elem/subdivision_id, ( ' + ( catSub != undefined ? catSub.id : null ) + ' ) ) return $elem/Fields( \'collaborator_id\')' ), 'This.collaborator_id' );

		if ( oReportTasks.hier_sub_select )
		{
			arrXQueryConditions.push( 'MatchSome( $elem/executor_id, ( ' + ArrayMerge( arrPersonsIDs, 'This.PrimaryKey', ',' ) + ' ) ) ' );
		}
		else
		{
			arrXQueryConditions.push( 'some $person in collaborators satisfies ( $elem/executor_id = $person/id and $person/position_parent_id = ' + oReportTasks.parent_object_id + ' )' );
		}
	}

	if ( oReportTasks.org_id != null && oReportTasks.parent_object_id == null )
	{
		if ( oReportTasks.hier_sub_select )
		{
			arrXQueryConditions.push( 'some $person in collaborators satisfies ( $elem/executor_id = $person/id and $person/org_id = ' + oReportTasks.org_id + ' )' );
		}
		else
		{
			arrXQueryConditions.push( 'some $person in collaborators satisfies ( $elem/executor_id = $person/id and $person/org_id = ' + oReportTasks.org_id + ' and $person/position_parent_id = null() )' );
		}
	}

	if ( oReportTasks.person_id.HasValue )
	{
		arrXQueryConditions.push('MatchSome($elem/executor_id, ('+ oReportTasks.person_id +'))');
	}

	if ( oReportTasks.task_type_id.HasValue )
	{
		arrXQueryConditions.push('MatchSome($elem/task_type_id, ('+ oReportTasks.task_type_id +'))');
	}

	if(sXQueryQual != '')
	{
		arrXQueryConditions.push( sXQueryQual );
	}

	var sXQueryConditions = ArrayCount( arrXQueryConditions ) > 0 ? ' ' + ArrayMerge( arrXQueryConditions, 'This', ' and ' ) : '';

	if(sXQueryConditions != '')
	{
		sXQueryConditions = ' and ' + sXQueryConditions;
	}
	
	sQuery = 'for $elem in tasks ' + sQueryString + sXQueryConditions + ' return $elem';

	_tasks_array = tools.xquery( sQuery );

	for ( _task in _tasks_array )
	{
		_child = {
			id: _task.id.Value,
			name: _task.name.Value, 					// «Задача» - название задачи
			end_date_plan: _task.end_date_plan.Value, 	// «Дата завершения план.» - дата планового завершения задачи;
			date_fact: _task.date_fact.Value, 			// Дата завершения факт.
			value: _task.value.Value, 					// «Оценка» - оценка задачи (из поля Оценка документооборота);
			status: '', 								// «Статус» - текущий статус задачи
			task_type: '', 								// «Тип задачи» - название типа задачи;
			comment: _task.comment.Value,				// Комментарий

			person_id: null,
			person_fullname: '',
			person_position_name: '',
			person_subdivision_name: '',
			person_org_name: ''
		};

		//
		// ** «Сотрудник» **
		//
		if(_task.executor_id.Value != undefined)
		{
			_coll_array = ArrayOptFirstElem(tools.xquery( 'for $elem in collaborators where MatchSome( $elem/id, ( ' + _task.executor_id.Value + ' ) ) return $elem' ));
		
			if(_coll_array != undefined)
			{
				_child.person_id = _coll_array.id.Value;
				_child.person_fullname = _coll_array.fullname.Value;
				_child.person_position_name = _coll_array.position_name.Value;
				_child.person_subdivision_name = _coll_array.position_parent_name.Value;
				_child.person_org_name = _coll_array.org_name.Value;
			}
		}

		//
		// ** «Тип задачи» **
		//
		if(_task.task_type_id.Value != undefined)
		{
			_task_type_array = ArrayOptFirstElem(tools.xquery( 'for $elem in task_types where MatchSome( $elem/id, ( ' + _task.task_type_id.Value + ' ) ) return $elem' ));

			if(_task_type_array != undefined)
			{
				_child.task_type = _task_type_array.name.Value;
			}
		}

		//
		// ** «Статус» **
		//
		if (_task.status != undefined || _task.status != null)
		{
			_child.status = common.task_statuses.GetChildByKey(_task.status ).name.Value;
		}

		oResult.tasks.push(_child);
	}

	return oResult
}

/**
 * @function TaskAssessmentAppraiseChangeState
 * @memberof Websoft.WT.Component.TaskAssessment
 * @author EO
 * @description Изменить статус процедуры проектной оценки
 * @param {bigint[]} arrAssessmentAppraiseIDs - массив ID процедур оценки
 * @param {string} sState - статус процедуры оценки
 * @returns {oSimpleResult}
 */
function TaskAssessmentAppraiseChangeState(arrAssessmentAppraiseIDs, sState)
{
	var oRes = tools.get_code_library_result_object();

	var catCheckObject = ArrayOptFirstElem(ArraySelect(arrAssessmentAppraiseIDs, "OptInt(This) != undefined"))
	if(catCheckObject == undefined)
	{
		oRes.error = 501;
		oRes.errorText = "В массиве нет ни одного целочисленного ID";
		return oRes;
	}

	var docObj = tools.open_doc(Int(catCheckObject));
	if(docObj == undefined || docObj.TopElem.Name != "assessment_appraise")
	{
		oRes.error = 502;
		oRes.errorText = "Массив не является массивом ID  процедур оценки";
		return oRes;
	}

	if (ArrayOptFind(common.assessment_appraise_statuses, "This.id == sState") == undefined)
	{
		oRes.error = 503;
		oRes.errorText = "Неверно передан статус процедуры оценки";
		return oRes;
	}

	for ( itemAssessmentAppraiseID in arrAssessmentAppraiseIDs )
	{
		try
		{
			iAssessmentAppraiseID = OptInt(itemAssessmentAppraiseID);
			if(iAssessmentAppraiseID == undefined)
			{
				throw "Элемент массива не является целым числом";
			}

			if (sState != "1")
			{
				docAssessmentAppraise = tools.open_doc(iAssessmentAppraiseID);
				if (docAssessmentAppraise != undefined)
				{
					docAssessmentAppraise.TopElem.status = sState;
					docAssessmentAppraise.Save();
				}
			}
			else
			{
				sXQuery = "for $elem in assessment_plans where $elem/assessment_appraise_id = " + iAssessmentAppraiseID + " return $elem/Fields('id','person_id')";
				xarrAssessmentPlans = tools.xquery(sXQuery);

				iAssessmentLibrary = tools_app.get_cur_settings("iAssessmentLibrary", "instance", null, null, null, iAssessmentAppraiseID);
				sAssessmentFormula = tools_app.get_cur_settings("sAssessmentFormula", "instance", null, null, null, iAssessmentAppraiseID);
				bCreateEfficiencyGrade = tools_web.is_true(tools_app.get_cur_settings("bCreateEfficiencyGrade", "instance", null, null, null, iAssessmentAppraiseID));
				sEfficiencyGradeFormula = tools_app.get_cur_settings("sEfficiencyGradeFormula", "instance", null, null, null, iAssessmentAppraiseID)+"";
				iAssessmentLibrary = OptInt(iAssessmentLibrary);
				sAssessmentFormula = Trim(String(sAssessmentFormula)+"");

				for ( catAssessmentPlan  in xarrAssessmentPlans)
				{
					if (iAssessmentLibrary != undefined && sAssessmentFormula != "")
					{
						docAssessmentPlan = tools.open_doc(catAssessmentPlan.id.Value);
						if (docAssessmentPlan != undefined)
						{
							rIntegralMark = tools.call_code_library_method(iAssessmentLibrary, sAssessmentFormula, []); //!!! parameters ???
							docAssessmentPlan.TopElem.integral_mark = rIntegralMark;
							docAssessmentPlan.Save();
						}

					}
				}
				
				if (bCreateEfficiencyGrade)
				{
					oRes = tools.call_code_library_method( "libMain", "GetHighEffectivenessPas", [ ArrayExtract(xarrAssessmentPlans, 'This.person_id.Value'), [iAssessmentAppraiseID], true ] );
					
					if (oRes.error > 0)
					{
						throw oRes.errorText;
					}
					else
					{
						aObjects = ArraySelect(oRes.array, "OptInt(This.pa_id, null) != null");
						for (_obj in aObjects)
						{
							docPA = tools.open_doc(_obj.pa_id);
							if (docPA == undefined)
								continue;
							
							if(sEfficiencyGradeFormula != '')
							{
								overallPA = docPA.TopElem.overall;
								sEfficiencyEstimationCode = eval(sEfficiencyGradeFormula);
								
								oEfficiencyEstimation = ArrayOptFirstElem(tools.xquery("for $elem in efficiency_estimations where $elem/code = " + XQueryLiteral(sEfficiencyEstimationCode) + " return $elem"));
								if (oEfficiencyEstimation != undefined)
								{
									docCollaborator = tools.open_doc(_obj.person_id);
									docCollaborator.TopElem.efficiency_estimation_id = oEfficiencyEstimation.id;
									docCollaborator.Save();
									
									docEfficiencyGrade = OpenNewDoc( 'x-local://wtv/wtv_efficiency_grade.xmd' );
									docEfficiencyGrade.BindToDb();
									teEfficiencyGrade = docEfficiencyGrade.TopElem;
									teEfficiencyGrade.efficiency_estimation_id = oEfficiencyEstimation.id;
									teEfficiencyGrade.assessment_source = 'assessment_appraise';
									teEfficiencyGrade.person_id = docCollaborator.DocID;
									teEfficiencyGrade.assessment_date = Date();
									teEfficiencyGrade.assessment_appraise_id = docPA.TopElem.assessment_appraise_id;
									teEfficiencyGrade.budget_period_id = docPA.TopElem.budget_period_id;
									docEfficiencyGrade.Save();
								}
							}
						}
					}
				}

				sFinishNotify = tools_app.get_cur_settings("sFinishNotify", "app", null, null, null, iAssessmentAppraiseID);
				iStartFinishMember = OptInt(tools_app.get_cur_settings("iStartFinishMember", "app", null, null, null, iAssessmentAppraiseID), null);
				iStartFinishBoss = OptInt(tools_app.get_cur_settings("iStartFinishBoss", "app", null, null, null, iAssessmentAppraiseID), null);

				xarrPlans = tools.xquery("for $elem in assessment_plans where $elem/assessment_appraise_id = " + iAssessmentAppraiseID + " return $elem/Fields('id','person_id','integral_mark')");
				for (itemPlan in xarrPlans)
				{
					if ( (sFinishNotify == "all" || sFinishNotify == "members") && iStartFinishMember != null)
					{
						oText = {
							integral_mark: itemPlan.integral_mark.Value
						}
						tools.create_notification( iStartFinishMember, itemPlan.person_id, oText);
					}

					docAssessmentPlan = tools.open_doc(itemPlan.id.Value);
					if (docAssessmentPlan != undefined)
					{
						docAssessmentPlan.TopElem.is_done = true;
						docAssessmentPlan.Save();
					}
				}

				docAssessmentAppraise = tools.open_doc(iAssessmentAppraiseID);
				if (docAssessmentAppraise != undefined)
				{
					teAssessmentAppraise = docAssessmentAppraise.TopElem;

					if ( (sFinishNotify == "all" || sFinishNotify == "boss") && iStartFinishBoss != null )
					{
						iApplicationInstanceIDParam = tools_app.get_cur_application_instance( tools_app.get_application('websoft_task_assessment'), null, teAssessmentAppraise.id.Value, teAssessmentAppraise).id;
						_doc_instance = tools.open_doc( iApplicationInstanceIDParam );
						sBpName = "";
						iBP = OptInt(teAssessmentAppraise.custom_elems.ObtainChildByKey( 'bp_assessment' ).value, 0);
						oBP = ArrayOptFirstElem(tools.xquery("for $elem in budget_periods where $elem/id = " + iBP + " return $elem/Fields('id','name')"));
						sBpName = (oBP != undefined ? oBP.name : "");
				
						oText = {
							bp_name: sBpName,
							app_id: OptInt(_doc_instance.TopElem.application_id, null)
						}
				
						tools.create_notification( iStartFinishBoss, teAssessmentAppraise.person_id, oText,  docAssessmentAppraise.DocID);
					}

					teAssessmentAppraise.status = "1";
					docAssessmentAppraise.Save();
				}
			}
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
 * @function getAssessmentPlansReport
 * @memberof Websoft.WT.Component.TaskAssessment
 * @author IG
 * @description Получение отчета по результатам оценки
 * @param {Object} oReportAssessmentPlan - Объект отчета
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {bigint} sApplicationID - ID приложения
 * @returns {oSimpleResult}
 */
function getAssessmentPlansReport(oReportAssessmentPlan, curUserID, sApplicationID){
	
	oResult = new Object();
	oResult.error = 0;
	oResult.data_assessment_plans = [];

	var arrXQueryConditions = [];
	var sXQueryQual = '';
	var sQueryString = '';

	if( sApplicationID != undefined || sApplicationID != null )
	{
		oModelRoles = CallServerMethod( 'tools_report', 'model_roles', [ curUserID, sApplicationID ] );
	
		arrSubordinateIDs = [];
		
		if(oModelRoles.type != '')
		{
			switch( oModelRoles.type )
			{
				case 'hr':
				{
					arrSubordinateIDs = oModelRoles.subordinate_ids.hr;
					break;
				}
				case 'observer':
				{
					arrSubordinateIDs = oModelRoles.subordinate_ids.observer;
					break;
				}
			}
			
			if(ArrayCount(arrSubordinateIDs) > 0){
				sXQueryQual = 'MatchSome($elem/person_id, (' + ArrayMerge(arrSubordinateIDs, 'This', ',') + '))';
			}
		}
	}

	if ( oReportAssessmentPlan.assessment_appraise_id.HasValue )
	{
		arrXQueryConditions.push('MatchSome($elem/assessment_appraise_id, ('+ oReportAssessmentPlan.assessment_appraise_id +'))');
	}

	if ( oReportAssessmentPlan.parent_object_id != null )
	{
		catSub = ArrayOptFirstElem( XQuery('for $elem in subdivisions where $elem/id = ' + oReportAssessmentPlan.parent_object_id + ' return $elem') );

		arrPersonsIDs = ArrayExtract( tools.xquery( 'for $elem in person_hierarchys where MatchSome( $elem/subdivision_id, ( ' + ( catSub != undefined ? catSub.id : null ) + ' ) ) return $elem/Fields( \'collaborator_id\')' ), 'This.collaborator_id' );

		if ( oReportAssessmentPlan.hier_sub_select )
		{
			arrXQueryConditions.push( 'MatchSome( $elem/person_id, ( ' + ArrayMerge( arrPersonsIDs, 'This.PrimaryKey', ',' ) + ' ) ) ' );
		}
		else
		{
			arrXQueryConditions.push( 'some $person in collaborators satisfies ( $elem/person_id = $person/id and $person/position_parent_id = ' + oReportAssessmentPlan.parent_object_id + ' )' );
		}
	}

	if ( oReportAssessmentPlan.org_id != null && oReportAssessmentPlan.parent_object_id == null )
	{
		if ( oReportAssessmentPlan.hier_sub_select )
		{
			arrXQueryConditions.push( 'some $person in collaborators satisfies ( $elem/person_id = $person/id and $person/org_id = ' + oReportAssessmentPlan.org_id + ' )' );
		}
		else
		{
			arrXQueryConditions.push( 'some $person in collaborators satisfies ( $elem/person_id = $person/id and $person/org_id = ' + oReportAssessmentPlan.org_id + ' and $person/position_parent_id = null() )' );
		}
	}

	if ( oReportAssessmentPlan.person_id.HasValue )
	{
		arrXQueryConditions.push('MatchSome($elem/person_id, ('+ oReportAssessmentPlan.person_id +'))');
	}

	if(sXQueryQual != '')
	{
		arrXQueryConditions.push( sXQueryQual );
	}

	var sXQueryConditions = ArrayCount( arrXQueryConditions ) > 0 ? ' where ' + ArrayMerge( arrXQueryConditions, 'This', ' and ' ) : '';

	sQuery = 'for $elem in assessment_plans ' + sQueryString + sXQueryConditions + ' return $elem';

	_assessment_plans_array = tools.xquery( sQuery );

	for(_assessment_plan in _assessment_plans_array){
		
		_child = {
			id: _assessment_plan.id.Value,
			person_id: null,
			person_fullname: '',
			person_position_name: '',
			person_subdivision_name: '',
			person_org_name: '',

			task_count: 0,
			assessment_count: 0
		};

		//
		// ** «Сотрудник» **
		//
		if(_assessment_plan.person_id.Value != undefined)
		{
			_coll_array = ArrayOptFirstElem(tools.xquery( 'for $elem in collaborators where MatchSome( $elem/id, ( ' + _assessment_plan.person_id.Value + ' ) ) return $elem' ));
		
			if(_coll_array != undefined)
			{
				_child.person_id = _coll_array.id.Value;
				_child.person_fullname = _coll_array.fullname.Value;
				_child.person_position_name = _coll_array.position_name.Value;
				_child.person_subdivision_name = _coll_array.position_parent_name.Value;
				_child.person_org_name = _coll_array.org_name.Value;
			}
		}

		//
		// ** «Задачи» **
		//
		sQueryTasks = 'for $elem in tasks where $elem/source_object_type = \'assessment_appraise\' and MatchSome($elem/source_object_id, (' + _assessment_plan.assessment_appraise_id.Value + ')) and MatchSome($elem/executor_id, (' + _assessment_plan.person_id.Value + ')) return $elem';
		if(ArrayCount(tools.xquery(sQueryTasks)) > 0)
			_child.task_count = ArrayCount(tools.xquery(sQueryTasks));

		//
		// ** «Оценка» **
		//
		if(_assessment_plan.integral_mark.HasValue != undefined && _assessment_plan.integral_mark > 0)
			_child.assessment_count = _assessment_plan.integral_mark.Value;

		oResult.data_assessment_plans.push(_child);

	}

	return oResult;
}

/**
 * @typedef {Object} oAssessmentProgressReportPerson
 * @property {bigint} id - ID сотрудника
 * @property {string} person_fullname - ФИО сотрудника
 * @property {string} person_position_name - наименование должности сотрудника
 * @property {string} person_subdivision_name - наименование подразделения, к которому относится должность
 * @property {string} person_org_name - наименование организации, к которой относится подразделение
 * @property {integer} eval_task_count - общее число оцененных задач
 * @property {real} current_mark - текущая оценка, подсчитанная по оцененным задачам
*/
/**
 * @typedef {Object} oAssessmentProgressReportResult
 * @property {number} error – Код ошибки.
 * @property {string} errorText – Текст ошибки.
 * @property {oAssessmentProgressReportPerson[]} array – Массив типов заявок.
*/
/**
 * @function getAssessmentProgressReport
 * @memberof Websoft.WT.Component.TaskAssessment
 * @author EO
 * @description Получение данных для отчета "Ход оценки"
 * @param {Object} oReportAssessmentProgress - Объект отчета
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {bigint} sApplicationID - ID приложения
 * @returns {oAssessmentProgressReportResult}
 */
function getAssessmentProgressReport(oReportAssessmentProgress, curUserID, sApplicationID)
{

	oResult = new Object();
	oResult.error = 0;
	oResult.persons = [];

	var arrAssessmentPlansXQueryConds = [];

	if( sApplicationID != undefined || sApplicationID != null )
	{
		oModelRoles = CallServerMethod( 'tools_report', 'model_roles', [ curUserID, sApplicationID ] );
	
		arrSubordinateIDs = [];
		
		if(oModelRoles.type != '')
		{
			switch( oModelRoles.type )
			{
				case 'hr':
				{
					arrSubordinateIDs = oModelRoles.subordinate_ids.hr;
					break;
				}
				case 'observer':
				{
					arrSubordinateIDs = oModelRoles.subordinate_ids.observer;
					break;
				}
			}

			if (ArrayOptFirstElem(arrSubordinateIDs) != undefined)
			{
				arrAssessmentPlansXQueryConds.push("MatchSome($elem/person_id, (" + ArrayMerge(arrSubordinateIDs, "This", ",") + ") )");
			}
		}
	}

	if ( oReportAssessmentProgress.assessment_appraise_id.HasValue )
	{
		arrAssessmentPlansXQueryConds.push("$elem/assessment_appraise_id = " + oReportAssessmentProgress.assessment_appraise_id);
	}

	if ( oReportAssessmentProgress.parent_object_id != null )
	{
		catSub = ArrayOptFirstElem( XQuery('for $elem in subdivisions where $elem/id = ' + oReportAssessmentProgress.parent_object_id + ' return $elem') );

		arrPersonsIDs = ArrayExtract( tools.xquery( 'for $elem in person_hierarchys where MatchSome( $elem/subdivision_id, ( ' + ( catSub != undefined ? catSub.id : null ) + ' ) ) return $elem/Fields( \'collaborator_id\')' ), 'This.collaborator_id' );

		if ( oReportAssessmentProgress.hier_sub_select )
		{
			arrAssessmentPlansXQueryConds.push( 'MatchSome( $elem/person_id, ( ' + ArrayMerge( arrPersonsIDs, 'This.PrimaryKey', ',' ) + ' ) ) ' );
		}
		else
		{
			arrAssessmentPlansXQueryConds.push( 'some $person in collaborators satisfies ( $elem/person_id = $person/id and $person/position_parent_id = ' + oReportAssessmentProgress.parent_object_id + ' )' );
		}
	}

	if ( oReportAssessmentProgress.org_id != null && oReportAssessmentProgress.parent_object_id == null )
	{
		if ( oReportAssessmentProgress.hier_sub_select )
		{
			arrAssessmentPlansXQueryConds.push( 'some $person in collaborators satisfies ( $elem/person_id = $person/id and $person/org_id = ' + oReportAssessmentProgress.org_id + ' )' );
		}
		else
		{
			arrAssessmentPlansXQueryConds.push( 'some $person in collaborators satisfies ( $elem/person_id = $person/id and $person/org_id = ' + oReportAssessmentProgress.org_id + ' and $person/position_parent_id = null() )' );
		}
	}

	var sAssessmentPlansXQueryConds = ArrayOptFirstElem(arrAssessmentPlansXQueryConds) != undefined ? " where " + ArrayMerge( arrAssessmentPlansXQueryConds, "This", " and " ) : "";

	var sXQuery = "for $elem in assessment_plans" + sAssessmentPlansXQueryConds + " return $elem/Fields('person_id','person_fullname','person_position_name')";
	xarrAssessmentPlans = ArrayDirect(tools.xquery(sXQuery));

	sXQuery = "for $elem in subs where MatchSome($elem/basic_collaborator_id, (" + ArrayMerge(xarrAssessmentPlans, "This.person_id.Value", ",") + ") ) order by $elem/basic_collaborator_id return $elem/Fields('org_id','basic_collaborator_id','parent_id')";
	xarrSubs = ArrayDirect(tools.xquery(sXQuery));

	sXQuery = "for $elem in subdivisions where MatchSome($elem/id, (" + ArrayMerge(xarrSubs, "This.parent_id.Value", ",") + ") ) order by $elem/id return $elem/Fields('id','name')";
	xarrSubdivs = ArrayDirect(tools.xquery(sXQuery));

	sXQuery = "for $elem in orgs where MatchSome($elem/id, (" + ArrayMerge(xarrSubs, "This.org_id.Value", ",") + ") ) order by $elem/id return $elem/Fields('id','disp_name')"
	xarrOrgs = ArrayDirect(tools.xquery(sXQuery));

	arrTasksTypeIDs = tools_web.parse_multiple_parameter(tools_app.get_cur_settings("sAssessmentTypeTasks", "instance", null, null, null, oReportAssessmentProgress.assessment_appraise_id));
	if (ArrayOptFirstElem(arrTasksTypeIDs) != undefined)
	{
		sXQuery = "for $elem in tasks where $elem/source_object_type = 'assessment_appraise' and $elem/source_object_id = " + oReportAssessmentProgress.assessment_appraise_id + " and $elem/executor_type = 'collaborator' and MatchSome($elem/executor_id, (" + ArrayMerge(xarrAssessmentPlans, "This.person_id.Value", ",") + ") ) and $elem/value != null() and MatchSome($elem/task_type_id, (" + ArrayMerge(arrTasksTypeIDs, "This", ",") + ") ) order by $elem/executor_id return $elem/Fields('id','executor_id')";
		xarrEvalTasks = ArrayDirect(tools.xquery(sXQuery));
	}
	else
	{
		return oResult;
	}

	iAssessmentLibrary = tools_app.get_cur_settings("iAssessmentLibrary", "instance", null, null, null, oReportAssessmentProgress.assessment_appraise_id);
	iAssessmentLibrary = OptInt(iAssessmentLibrary);
	sAssessmentFormula = tools_app.get_cur_settings("sAssessmentFormula", "instance", null, null, null, oReportAssessmentProgress.assessment_appraise_id);
	sAssessmentFormula = Trim(String(sAssessmentFormula)+"")

	for (catAssessmentPlan in xarrAssessmentPlans)
	{
		arrEvalTasksIDs = ArraySelectBySortedKey(xarrEvalTasks, catAssessmentPlan.person_id.Value, "executor_id");
		rIntegralMark = 0.0;
		if (iAssessmentLibrary != undefined && sAssessmentFormula != "")
		{
			rIntegralMark = tools.call_code_library_method(iAssessmentLibrary, sAssessmentFormula, [ArrayExtract(arrEvalTasksIDs, "This.id.Value")]);
		}

		catOrg = undefined;
		catSubdiv = undefined;
		catSub = ArrayOptFindBySortedKey(xarrSubs, catAssessmentPlan.person_id.Value, "basic_collaborator_id");
		if (catSub != undefined)
		{
			catOrg = ArrayOptFindBySortedKey(xarrOrgs, catSub.org_id.Value, "id");
			catSubdiv = ArrayOptFindBySortedKey(xarrSubdivs, catSub.parent_id.Value, "id");
		}

		oPerson = {
			id: catAssessmentPlan.person_id.Value, 
			person_fullname: catAssessmentPlan.person_fullname.Value,
			person_position_name: catAssessmentPlan.person_position_name.Value,
			person_subdivision_name: (catSubdiv != undefined ? catSubdiv.name.Value : ""),
			person_org_name: (catOrg != undefined ? catOrg.disp_name.Value : ""),
			eval_task_count: ArrayCount(arrEvalTasksIDs),
			current_mark: rIntegralMark
		}
		oResult.persons.push(oPerson);
	}

	return oResult;
}