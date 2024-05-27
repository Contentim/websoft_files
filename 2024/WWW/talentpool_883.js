/**
 * @function GetPersonnelReservesReport
 * @memberof Websoft.WT.TalentPool
 * @author AKh
 * @description отчет по резервистам
 * @param {bigint} iCurUserID - ID текущего пользователя
 * @param {bigint} iApplicationID - ID приложения
 * @param {object} oFilters - объект с фильтрами (параметрами) отчета
*/
function GetPersonnelReservesReport( iCurUserID, iApplicationID, oFilters )
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
		oRes.errorText = i18n.t( 'peredannekorre_1' );
		return oRes
	}

	try
	{
		iApplicationID = Int(iApplicationID);
	}
	catch( ex )
	{
		oRes.error = 502;
		oRes.errorText = i18n.t( 'peredannekorre_2' );
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

	arrConds = [];

	var iCareerReserveTypeID = oFilters.GetOptProperty('career_reserve_type_id');
	if (iCareerReserveTypeID != undefined)
	{
		oCareerReserveType = ArrayOptFirstElem(tools.xquery("for $elem in career_reserve_types where $elem/id = " + OptInt(iCareerReserveTypeID, 0) + " return $elem/Fields('id')"));
		if (oCareerReserveType != undefined)
			arrConds.push("$elem/career_reserve_type_id = " + oCareerReserveType.id)
	}

	var iOrgID = oFilters.GetOptProperty('org_id');
	if (iOrgID != undefined)
	{
		xarrCollaborators = tools.xquery("for $elem in collaborators where $elem/org_id = " + OptInt(iOrgID, 0) + " return $elem/Fields('id')");
		arrConds.push("MatchSome($elem/person_id, (" + ArrayMerge(xarrCollaborators, "This.id", ",") + "))")
	}

	var iSubdivisionID = oFilters.GetOptProperty('subdivision_id');
	if (iSubdivisionID != undefined)
	{
		arrSubDivisions = tools.xquery('for $elem in subdivisions where IsHierChildOrSelf( $elem/id, ' + XQueryLiteral(iSubdivisionID) + ' ) order by $elem/Hier() return $elem')
		xarrCollaborators = tools.xquery("for $elem in collaborators where MatchSome($elem/position_parent_id, (" + ArrayMerge( arrSubDivisions, 'This.id', ',' ) + ")) return $elem/Fields('id')");
		arrConds.push("MatchSome($elem/person_id, (" + ArrayMerge(xarrCollaborators, "This.id", ",") + "))");
	}

	var arrStatuses = oFilters.GetOptProperty('status_types');
	if (arrStatuses != undefined && ArrayOptFirstElem(arrStatuses) != undefined)
	{
		arrConds.push("MatchSome($elem/status, (" + ArrayMerge(arrStatuses, "XQueryLiteral(This)", ",") + "))");
	}

	var dStartDate = oFilters.GetOptProperty('date_start');
	var dEndDate = oFilters.GetOptProperty('date_end');

	if (dStartDate != undefined && dEndDate != undefined)
	{
		arrConds.push("($elem/finish_date <= date('" + dEndDate + "') and $elem/finish_date >= date('" + dStartDate + "')) or ($elem/start_date >= date('" + dStartDate + "') and $elem/start_date <= date('" + dEndDate + "'))");
	}
	else if (dStartDate != undefined)
		arrConds.push("$elem/start_date >= date('" + dStartDate + "') or $elem/finish_date >= date('" + dStartDate + "')");
	else if (dEndDate != undefined)
		arrConds.push("$elem/finish_date <= date('" + dEndDate + "') or $elem/start_date <= date('" + dEndDate + "')");

	var arrCompareParams = oFilters.GetOptProperty('compare_params');

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
	else if(iApplLevel >= 2)
	{
		sAccessType = "curator";
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
				arrConds.push("MatchSome($elem/id, (0))");
			else
			{
				arrConds.push("MatchSome($elem/person_id, (" + ArrayMerge(arrSubordinates, "This", ",") + "))")
			}
			break;
		}
		case "curator":
		{
			aTPFManagers = tools.xquery("for $elem in talent_pool_func_managers where $elem/catalog = 'personnel_reserve' and $elem/person_id = " + iCurUserID + " return $elem/Fields('id','object_id')");
			if (ArrayOptFirstElem(aTPFManagers) != undefined)
				arrConds.push("MatchSome($elem/id, (" + ArrayMerge(aTPFManagers, "This.object_id", ",") + "))");
			else
				arrConds.push("MatchSome($elem/id, (0))")
			break;
		}
		case "reject":
			return oRes
			break;
		case "observer":
		{
			arrSubordinates = tools.call_code_library_method( "libMain", "get_subordinate_records", [ iCurUserID, ['fact','func'], true, '', null, '', true, true, true, true, [], true ] );

			if (ArrayOptFirstElem(arrSubordinates) == undefined)
				arrConds.push("MatchSome($elem/id, (0))")
			else
			{
				arrConds.push("MatchSome($elem/person_id, (" + ArrayMerge(arrSubordinates, "This", ",") + "))")
			}
			break;
		}
	}
	var sXQueryQual = ArrayOptFirstElem( arrConds ) != undefined ? ' where ' + ArrayMerge( arrConds, 'This', ' and ' ) : '';
	xarrPersonnelReserves = tools.xquery("for $elem in personnel_reserves " + sXQueryQual + " return $elem");

	for (catPersonnelReserve in xarrPersonnelReserves)
	{
		obj = {
			career_reserve_type_name: (catPersonnelReserve.career_reserve_type_id.HasValue ? catPersonnelReserve.career_reserve_type_id.ForeignElem.name.Value : ""),
			person_id: catPersonnelReserve.person_id.Value,
			person_fullname: catPersonnelReserve.person_id.ForeignElem.fullname.Value,
			person_position_name: catPersonnelReserve.person_id.ForeignElem.position_name.Value,
			person_subdivision: catPersonnelReserve.person_id.ForeignElem.position_parent_name.Value,
			person_org: catPersonnelReserve.person_id.ForeignElem.org_name.Value,
			status: catPersonnelReserve.status.OptForeignElem.name.Value,
			start_date: StrDate(catPersonnelReserve.start_date.Value, false),
			include_reserve_date: StrDate(catPersonnelReserve.include_reserve_date.Value, false),
			finish_date: StrDate(catPersonnelReserve.finish_date.Value, false)
		}

		xarrCareerPlans = tools.xquery("for $elem in career_reserves where $elem/personnel_reserve_id = " + catPersonnelReserve.id + " return $elem");
		obj.SetProperty("career_reserve_count", ArrayCount(xarrCareerPlans));

		if (arrCompareParams != undefined && ArrayOptFirstElem(arrCompareParams) != undefined)
		{
			for (param in arrCompareParams)
			{
				switch(param)
				{
					case "sex":
						_sex = catPersonnelReserve.person_id.ForeignElem.sex;
						if (_sex == "m")
							obj.SetProperty("sex", i18n.t( 'muzhskoy' ));
						else
							obj.SetProperty("sex", i18n.t( 'zhenskiy' ));
						break;
					case "age":
						_birth_date = catPersonnelReserve.person_id.ForeignElem.birth_date;
						if (_birth_date.HasValue)
						{
							_age = tools.call_code_library_method ("libAnalytics", "GetAge", [_birth_date]);
							obj.SetProperty("age", _age);
						}
						break;
					case "exp_years_company":
						_hire_date = catPersonnelReserve.person_id.ForeignElem.hire_date;
						if (_hire_date.HasValue)
						{
							sExpYearsComp = "";
							_exp_years_company = tools.call_code_library_method ("libAnalytics", "GetAge", [_hire_date]);
							if(_exp_years_company < 1)
								sExpYearsComp = i18n.t( 'dogoda' );
							else if (_exp_years_company >= 1 && _exp_years_company < 2)
								sExpYearsComp = i18n.t( 'goda' );
							else
							{
								_exp_years_company = _exp_years_company + 1;
								sText = "";
								count = _exp_years_company % 100;
								if (count >= 5 && count <= 20)
								{
									sText = i18n.t( 'let' );
								}
								else
								{
									count = count % 10;
									if (count == 1)
									{
										sText = i18n.t( 'god' );
									}
									else if (count >= 2 && count <= 4)
									{
										sText = i18n.t( 'goda_1' );
									}
									else
									{
										sText = i18n.t( 'let' );
									}
								}

								sExpYearsComp = _exp_years_company + sText;
							}

							obj.SetProperty("exp_years_company", sExpYearsComp);
						}
						break;
					case "exp_years_position":
						_pos_date = catPersonnelReserve.person_id.ForeignElem.position_date;
						if (_pos_date.HasValue)
						{
							sExpYearsPos = "";
							_exp_years_position = tools.call_code_library_method ("libAnalytics", "GetAge", [_pos_date]);
							if(_exp_years_position < 1)
								sExpYearsPos = i18n.t( 'dogoda' );
							else if (_exp_years_position >= 1 && _exp_years_position < 2)
								sExpYearsPos = i18n.t( 'goda' );
							else
							{
								_exp_years_position = _exp_years_position + 1;
								sText = "";
								count = _exp_years_position % 100;
								if (count >= 5 && count <= 20)
								{
									sText = i18n.t( 'let' );
								}
								else
								{
									count = count % 10;
									if (count == 1)
									{
										sText = i18n.t( 'god' );
									}
									else if (count >= 2 && count <= 4)
									{
										sText = i18n.t( 'goda_1' );
									}
									else
									{
										sText = i18n.t( 'let' );
									}
								}

								sExpYearsPos = _exp_years_position + sText;
							}

							obj.SetProperty("exp_years_position", sExpYearsPos);
						}
						break;
					case "in_reserve_month":
						if (catPersonnelReserve.status == "in_reserve" && catPersonnelReserve.include_reserve_date.HasValue)
						{
							sMonth = "";

							_in_reserve_month = get_days_between_date(catPersonnelReserve.include_reserve_date, Date()) / 30;
							if(_in_reserve_month < 1)
								sMonth = i18n.t( 'domes' );
							else if (_in_reserve_month >= 1 && _in_reserve_month < 2)
								sMonth = i18n.t( 'mes' );
							else
							{
								sMonth = _in_reserve_month + i18n.t( 'mes_1' )
							}

							obj.SetProperty("in_reserve_month", sMonth);
						}
						break;
					case "efficiency":
						tePersonnelReserve = tools.open_doc(catPersonnelReserve.id).TopElem;
						oItem = cast_oTailentPool(tePersonnelReserve);
							obj.SetProperty("efficiency", oItem.career_reserve_readiness_percent);
						break;
					case "ipr":
						oMark = 0.0;
						xqPas = tools.xquery("for $elem_qc in pas where $elem_qc/person_id = " + catPersonnelReserve.person_id + " and some $as in assessment_appraises satisfies ( $elem_qc/assessment_appraise_id = $as/id and ( $as/status = '1' or $as/status = '0' ) ) and ( $elem_qc/assessment_appraise_type = 'development_plan' ) and $elem_qc/is_done = true() return $elem_qc/Fields('id','person_id')");
						sQuery = "for $elem_qc in pas where MatchSome($elem_qc/id,(" + ArrayMerge(xqPas, "This.id", ",") + ")) return $elem_qc/id";
						xq = ArrayExtract(tools.xquery(sQuery), "OpenDoc(UrlFromDocID(This.PrimaryKey)).TopElem");
						for (tePA in xq)
						{
							if ( tePA.overall.HasValue && OptReal( tePA.overall, 0.0 ) > 0 )
							{
								oMark = OptReal( tePA.overall, 0.0 );
							}
							else
							{
								b = 0;
								oMark = 0.0;
								_tasks = ArraySelectAll( tools.xquery("for $elem in tasks where MatchSome($elem/id, (" +ArrayMerge(tePA.tasks, "XQueryLiteral(This.task_id)", ",")+ ")) return $elem/Fields('id','value','readiness_percent')") );
								for ( _t in ArraySelect( tePA.tasks, "OptInt( This.parent_task_id, 0 ) == 0" ) )
								{
									_tt = ArrayOptFind( _tasks, "This.id == _t.task_id" );
									if ( _tt != undefined )
									{
										_mark = OptReal( _tt.value.Value, 0.0 );
										if ( _mark == 0 )
										{
											_mark = OptReal( _tt.readiness_percent.Value, 0.0 );
										}
										if ( _mark > 0 )
										{
											oMark += _mark;
											b++;
										}
										else
										{
											_t1 = ArraySelect( tePA.tasks, "This.parent_task_id == _t.task_id" );
											if ( ArrayCount( _t1 ) == 0 )
											{
												b++;
											}
											else
											{
												for ( _t2 in _t1 )
												{
													_tt = ArrayOptFind( _tasks, "This.id == _t2.task_id" );
													if ( _tt != undefined )
													{
														_mark = OptReal( _tt.value.Value, 0.0 );
														if ( _mark == 0 )
														{
															_mark = OptReal( _tt.readiness_percent.Value, 0.0 );
														}
														if ( _mark > 0 )
														{
															oMark += _mark;
															b++;
														}
														else
														{
															_t3 = ArraySelect( tePA.tasks, "This.parent_task_id == _t2.task_id" );
															if ( ArrayCount( _t3 ) == 0 )
															{
																b++;
															}
															else
															{
																for ( _t4 in _t3 )
																{
																	_tt = ArrayOptFind( _tasks, "This.id == _t4.task_id" );
																	if ( _tt != undefined )
																	{
																		_mark = OptReal( _tt.value.Value, 0.0 );
																		if ( _mark == 0 )
																		{
																			_mark = OptReal( _tt.readiness_percent.Value, 0.0 );
																		}
																		b++;
																		if ( _mark > 0 )
																		{
																			oMark += _mark;
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
								if ( b > 0 )
								{
									oMark = oMark / Real( b );
								}
							}
						}
						obj.SetProperty("ipr", StrReal( oMark, 1 ));
						break;
					case "efficiency_estimation":
						if (catPersonnelReserve.efficiency_estimation_id.HasValue)
							obj.SetProperty("efficiency_estimation", catPersonnelReserve.efficiency_estimation_id.ForeignElem.name);
						break;
					case "development_potential":
						if (catPersonnelReserve.development_potential_id.HasValue)
							obj.SetProperty("development_potential", catPersonnelReserve.development_potential_id.ForeignElem.name);
						break;
					case "region":
						if (catPersonnelReserve.person_id.ForeignElem.region_id.HasValue)
							obj.SetProperty("region", catPersonnelReserve.person_id.ForeignElem.region_id.ForeignElem.name);
						break;

				}

			}
		}
		oRes.array.push(obj)
	}

	return oRes;
}