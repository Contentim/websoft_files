/**
 * @typedef {Object} ReturnInitPollPlayer
 * @property {number} error Код ошибки
 * @property {string} errorText Текст ошибки
 * @property {Object} auth Данные авторизации
 * @property {Object} styles Данные стилей
 * @property {Object} data  Данные объекта
 * @property {string} lang Данные локализации
 */
/**
 * @function InitPollPlayer
 * @memberof Websoft.HCM.PollPlayer
 * @description Возвращает данные необходимые для инициализации плеера опросов
 * @param {string} sPollId ID объекта (опроса или процедуры опроса)
 * @param {string} sLaunchId ID запуска
 * @returns {ReturnInitPollPlayer}
 * @author my
 */
function InitPollPlayer(sPollId, sLaunchId) {
  var oRes = tools.get_code_library_result_object();

  try {
    var iPollId = Int(sPollId);
  } catch (error) {
    oRes.error = 2;
    oRes.errorText = "Incorrect poll ID format";
    return oRes;
  }

  var docObject = tools.open_doc(iPollId);
  if (docObject == undefined) {
    oRes.error = 3;
    oRes.errorText = "Object with ID: " + sPollId + " not found";
    return oRes;
  }

  var teObject = docObject.TopElem;

  var sPollType;
  if (teObject.Name == "poll_procedure") sPollType = "poll_procedure";
  if (teObject.Name == "poll") sPollType = "poll";

  if (sPollType == undefined) {
    oRes.error = 4;
    oRes.errorText = "Incorrect object type with ID: " + sPollId;
    return oRes;
  }

  var bSignedIn = false;
  var bHasAccess = false;

  var iUserId = getCurrentUserId(sLaunchId);
  if (iUserId != undefined) {
    bSignedIn = true;
    if ( tools_web.check_access(teObject, iUserId, null, CurRequest.Session ) ) bHasAccess = true;
  }

  try {
    oRes.auth = {};
    oRes.styles = {};
    oRes.data = {};
    oRes.lang = {
      current: getCurUserLanguageShortId(),
      languages: [{ ru: "Русский", en: "English" }],
    };

    oRes.auth.signedIn = bSignedIn;
    oRes.auth.hasAccess = bHasAccess;

    oRes.styles.theme = "light";
    oRes.styles.direction = "ltr";
    oRes.styles.variables = variables(teObject);
    oRes.styles.faviconUrl = getSiteFaviconUrl();

    var oData;
    if (sPollType == "poll_procedure") {
      oData = GetPollProcedureData(iPollId, iUserId);
    } else {
      oData = GetPollData(iPollId, iUserId);
    }

    if (oData.error != 0) {
      oRes.error = 5;
      oRes.errorText = "Get poll data error: " + oData.errorText;
      return oRes;
    }

    if (sPollType == "poll" && oData.data.is_anonymous) {
      oRes.auth.signedIn = true;
      oRes.auth.hasAccess = true;
    }

    oRes.data = oData.data;
  } catch (err_g) {
    oRes.error = 1;
    oRes.errorText = StrReplace(StrReplace(err_g, "\n", " "), "\r", "");
    return oRes;
  }

  return oRes;
}

/**
 * Возвращает ID текущего пользователя. Если пользователь анонимный возвращает undefined
 * @returns {integer}
 * @author my
 */
function getCurrentUserId(sLaunchId) {
  try {
    var iUserId = CurRequest.Session.Env.GetOptProperty("curUserID");
    if (iUserId != undefined && iUserId != null) return iUserId;
    if (sLaunchId != undefined) {
      var oDecrypted = tools_web.decrypt_launch_id(sLaunchId);
      var iResultId = Int(oDecrypted.learning_id);
      var teResult = OpenDoc(UrlFromDocID(iResultId)).TopElem;
      iUserId = teResult.person_id.Value;
      if (iUserId != null) return iUserId;
    }
  } catch (error) {}
  return undefined;
}

/**
  * @description Возвращает текущий код языка (сокращенная форма) пользователя на портале
  * @returns {string}
  * @author my
  */
function getCurUserLanguageShortId() {
  try {
    var resEnv = tools_web.get_host_obj(CurRequest);
    return resEnv.curLng.short_id;
  }
  catch (error) {
    return "ru"
  }
}

/**
  * @description Возвращает URL favicon текущего сайта
  * @returns {string}
  * @author my
  */
function getSiteFaviconUrl() {
  try {
    var resEnv = tools_web.get_host_obj(CurRequest);
    var fldHtmlIconHref = resEnv.GetOptProperty("curSite").html_icon_href;
    if (fldHtmlIconHref.HasValue) {
      return fldHtmlIconHref;
    }
  }
  catch (error) {}
  return "/pics/favicon.ico"
}

/**
 * @typedef {Object} ReturnGetPollData
 * @property {number} error Код ошибки
 * @property {string} errorText Текст ошибки
 * @property {Object} data  Данные опроса
 */
/**
 * @function GetPollData
 * @memberof Websoft.HCM.PollPlayer
 * @description Возвращает данные опроса
 * @param {string} sPollId ID опроса
 * @param {string} sUserId (необязательный) ID пользователя
 * @param {string} sLaunchId ID запуска
 * @returns {ReturnGetPollData}
 * @author my
 */
function GetPollData(sPollId, sUserId, sLaunchId) {
  var oRes = tools.get_code_library_result_object();

  try {
    try {
      var iPollId = Int(sPollId);
    } catch (error) {
      oRes.error = 2;
      oRes.errorText = "Incorrect poll ID format";
      return oRes;
    }

    var docPoll = tools.open_doc(iPollId);
    if (docPoll == undefined) {
      oRes.error = 3;
      oRes.errorText = "Poll with ID: " + iPollId + " not found";
      return oRes;
    }

    var tePoll = docPoll.TopElem;

    var iUserId;

    if (sUserId != undefined) {
      iUserId = Int(sUserId);
    } else {
      iUserId = getCurrentUserId(sLaunchId);
    }

    var oPollData = {};
    oPollData.type = "poll";
    oPollData.id = String(tePoll.id);
    oPollData.name = tePoll.name;
    oPollData.completed = tePoll.completed;
    oPollData.start_date = tePoll.start_date;
    oPollData.end_date = tePoll.end_date;
    oPollData.is_anonymous = tePoll.is_anonymous;
    oPollData.is_one_time = tePoll.is_one_time;
    oPollData.show_comments_in_report = tePoll.show_comments_in_report;
    oPollData.show_report = tePoll.show_report && iUserId;
    oPollData.description = tePoll.desc;
    oPollData.complete_message = tePoll.complete_message;
    oPollData.allow_delete_poll_result = tePoll.allow_delete_poll_result;
    oPollData.date_in_poll_period = true;
    var oCurrentDate = Date();
    if (
      (oPollData.start_date != null && oCurrentDate < oPollData.start_date) ||
      (oPollData.end_date != null && oCurrentDate > oPollData.end_date)
    ) {
      oPollData.date_in_poll_period = false;
    }
    oPollData.preview_image_url = tePoll.resource_id.HasValue
      ? "/download_file.html?file_id=" + tePoll.resource_id
      : undefined;
    oPollData.completed_result_exists = false;
    oPollData.not_completed_result_exists = false;

    if (iUserId != undefined) {
      var catFirstCompletedResult = ArrayOptFirstElem(
        XQuery(
          "for $elem in poll_results where $elem/person_id = " +
            iUserId +
            " and $elem/poll_id = " +
            iPollId +
            " and $elem/status > 1 return $elem/Fields('id')"
        )
      );
      var catFirstNotCompletedResult = ArrayOptFirstElem(
        XQuery(
          "for $elem in poll_results where $elem/person_id = " +
            iUserId +
            " and $elem/poll_id = " +
            iPollId +
            " and $elem/status <= 1 return $elem/Fields('id')"
        )
      );

      if (catFirstCompletedResult != undefined)
        oPollData.completed_result_exists = true;
      if (catFirstNotCompletedResult != undefined)
        oPollData.not_completed_result_exists = true;
    }

    oRes.data = oPollData;

    return oRes;
  } catch (error) {
    return {
      error: 9,
      errorText: error.message,
    };
  }
}

/**
 * @typedef {Object} ReturnGetPollProcedureData
 * @property {number} error Код ошибки
 * @property {string} errorText Текст ошибки
 * @property {Object} data  Данные опроса
 */
/**
 * @function GetPollProcedureData
 * @memberof Websoft.HCM.PollPlayer
 * @description Возвращает данные процедуры опроса
 * @param {string} sPollProcedureId ID процедуры опроса
 * @param {string} sUserId (необязательный) ID пользователя
 * @param {string} sLaunchId ID запуска
 * @returns {ReturnGetPollProcedureData}
 * @author my
 */
function GetPollProcedureData(sPollProcedureId, sUserId, sLaunchId) {
  var oRes = tools.get_code_library_result_object();

  try {
    try {
      var iPollProcedureId = Int(sPollProcedureId);
    } catch (error) {
      oRes.error = 2;
      oRes.errorText = "Incorrect poll procedure ID format";
      return oRes;
    }

    var docPollProcedure = tools.open_doc(iPollProcedureId);
    if (docPollProcedure == undefined) {
      oRes.error = 3;
      oRes.errorText =
        "Poll procedure with ID: " + iPollProcedureId + " not found";
      return oRes;
    }

    var tePollProcedure = docPollProcedure.TopElem;

    var iUserId;

    if (sUserId != undefined) {
      iUserId = Int(sUserId);
    } else {
      iUserId = getCurrentUserId(sLaunchId);
    }

    var oPollProcedureData = {};
    oPollProcedureData.type = "poll_procedure";
    oPollProcedureData.id = String(tePollProcedure.id);
    oPollProcedureData.name = tePollProcedure.name;
    oPollProcedureData.completed = tePollProcedure.status == 1 ? true : false;
    oPollProcedureData.start_date = tePollProcedure.start_date;
    oPollProcedureData.end_date = tePollProcedure.end_date;
    oPollProcedureData.is_model = tePollProcedure.is_model;
    oPollProcedureData.is_open = tePollProcedure.is_open;
    oPollProcedureData.description = tePollProcedure.desc;
    oPollProcedureData.complete_message = tePollProcedure.complete_message;
    oPollProcedureData.is_participant =
      ArrayCount(tePollProcedure.get_person_poll_objs(iUserId)) > 0
        ? true
        : false;
    oPollProcedureData.date_in_poll_period = true;
    var oCurrentDate = Date();
    if (
      (oPollProcedureData.start_date != null &&
        oCurrentDate < oPollProcedureData.start_date) ||
      (oPollProcedureData.end_date != null &&
        oCurrentDate > oPollProcedureData.end_date)
    ) {
      oPollProcedureData.date_in_poll_period = false;
    }
    oPollProcedureData.completed_result_exists = false;
    oPollProcedureData.not_completed_result_exists = false;

    if (iUserId != undefined) {
      var catFirstCompletedResult = ArrayOptFirstElem(
        XQuery(
          "for $elem in poll_results where $elem/person_id = " +
            iUserId +
            " and $elem/poll_procedure_id = " +
            iPollProcedureId +
            " and $elem/status > 1 return $elem/Fields('id')"
        )
      );
      var catFirstNotCompletedResult = ArrayOptFirstElem(
        XQuery(
          "for $elem in poll_results where $elem/person_id = " +
            iUserId +
            " and $elem/poll_procedure_id = " +
            iPollProcedureId +
            " and $elem/status <= 1 return $elem/Fields('id')"
        )
      );

      if (catFirstCompletedResult != undefined)
        oPollProcedureData.completed_result_exists = true;
      if (catFirstNotCompletedResult != undefined)
        oPollProcedureData.not_completed_result_exists = true;
    }

    oRes.data = oPollProcedureData;

    return oRes;
  } catch (error) {
    return {
      error: 9,
      errorText: error.message,
    };
  }
}

/**
 * Возвращает стилевые переменные плеера опросов
   @param {object} teObject TopElem опроса или процедуры опроса
 * @return {array}
 * @author my
 */
function variables(teObject) {
  var arrVariables = [];

  var tePoll
  var sPollType;

  if (teObject.Name == "poll") sPollType = "poll";
  if (teObject.Name == "poll_procedure") sPollType = "poll_procedure";
  
  if (sPollType === "poll") {
    tePoll = teObject
  }

  if (sPollType === "poll_procedure" && ArrayCount(teObject.polls) > 0) {
    var iPollId = ArrayOptFirstElem(teObject.polls).poll_id
    tePoll = tools.open_doc(iPollId).TopElem      
  }

  var oVariables = {}

  try {
    var oCustomWebTemplate = ArrayOptFirstElem(XQuery("for $elem in custom_web_templates where $elem/code='poll_player_css_variables' return $elem"));
    var docTemplate = tools.open_doc(oCustomWebTemplate.id);
    var listWvars = docTemplate.TopElem.wvars;
  } catch(e) {
    throw "В системе отсутствует шаблон с кодом 'poll_player_css_variables'"
  }

  var sType
  var value
  for (oVariable in listWvars) {
    sType = oVariable.type
    value = oVariable.value
    if (sType != "folder") {
      if (sType == "bool") {
        oVariables[oVariable.name] = (value == "1" ? true : false)
      } else {
        oVariables[oVariable.name] = value
      }
    }
  }
  
  
  if (tePoll != undefined) {
    if (ArrayCount(tePoll.view_templates.css.wvars) > 0) {
      listWvars = tePoll.view_templates.css.wvars
    } else {
      if (tePoll.view_templates.css.custom_web_template_id.HasValue) {
        docTemplate = tools.open_doc(tePoll.view_templates.css.custom_web_template_id);
        listWvars = docTemplate.TopElem.wvars;
      }
    }
  }

  for (oVariable in listWvars) {
    sType = oVariable.type
    value = oVariable.value
    if (sType != "folder") {
      if (sType == "bool") {
        oVariables[oVariable.name] = (value == "1" ? true : false)
      } else {
        oVariables[oVariable.name] = value
      }
    }
  }

  for (sName in oVariables) {
    arrVariables.push({
      name:  sName,
      value: oVariables[sName]
    })
  }

  return arrVariables;
}

/**
 * @typedef {Object} ReturnStartPoll
 * @property {number} error Код ошибки
 * @property {string} errorText Текст ошибки
 * @property {string} sessionId ID сессии
 */
/**
 * @function StartPoll
 * @memberof Websoft.HCM.PollPlayer
 * @description Запускает опрос
 * @param {string} sObjectId ID объекта (опроса или процедуры опроса)
 * @param {string} sLaunchId ID запуска
 * @returns {ReturnStartPoll}
 * @author my
 */
function StartPoll(sObjectId, sLaunchId) {
  var oRes = tools.get_code_library_result_object();
  try {
    var iObjectId = Int(sObjectId);

    var docObject = tools.open_doc(iObjectId);
    if (docObject == undefined) {
      oRes.error = 3;
      oRes.errorText = "Object with ID: " + sObjectId + " not found";
      return oRes;
    }

    var teObject = docObject.TopElem;

    var sObjectType;
    if (teObject.Name == "poll_procedure") sObjectType = "poll_procedure";
    if (teObject.Name == "poll") sObjectType = "poll";

    if (sObjectType == undefined) {
      oRes.error = 4;
      oRes.errorText = "Incorrect object type with ID: " + sObjectId;
      return oRes;
    }

    var iUserId = getCurrentUserId(sLaunchId);
    var teUser = null;
    if (iUserId != undefined) {
      teUser = tools.open_doc(iUserId).TopElem;
    }

    var catConnection = undefined;
    var tePoll = null;
    var iResultId = null;
    var teResult = null;

    if (sLaunchId == undefined) {
      var xarrResults = [];

      var iPollId = null;
      var iPollProcedureId = null;
      var catResult = undefined;
      var sUserId = iUserId;
      var oPoll = null;

      if (iUserId == undefined) {
        sUserId = "code_" + tools.random_string(10);
        if (sObjectType == "poll_procedure") {
          iPollProcedureId = iObjectId;
          iPollId = ArrayFirstElem(teObject.polls).PrimaryKey.Value;
          tePoll = OpenDoc(UrlFromDocID(iPollId)).TopElem;
        } else {
          iPollId = iObjectId;
          tePoll = teObject;
        }

        if (!tePoll.is_anonymous) {
          oRes.error = 5;
          oRes.errorText = "The poll cannot be anonymous";
          return oRes;
        }
      } else {
        catConnection = ArrayOptFirstElem(
          XQuery(
            'for $elem in connections where $elem/user_id = "' +
              iUserId +
              '" and $elem/course_id = ' +
              iObjectId +
              ' and $elem/state != "finish" return $elem/Fields("id","part_code")'
          )
        );
        if (catConnection != undefined) {
          iPollId = OptInt(catConnection.part_code, null);
        }

        if (sObjectType == "poll_procedure") {
          iPollProcedureId = iObjectId;

          var arrPollObjs = teObject.get_person_poll_objs(iUserId);

          if (ArrayOptFirstElem(arrPollObjs) == undefined) {
            oRes.error = 6;
            oRes.errorText =
              "The employee is not in the list of participants in the survey procedure";
            return oRes;
          }

          if (iPollId == null) {
            oPoll = ArrayOptFirstElem(arrPollObjs);
          } else {
            oPoll = ArrayOptFindByKey(arrPollObjs, iPollId, "poll_id");
            if (oPoll == undefined) {
              oPoll = ArrayOptFirstElem(arrPollObjs);
            }
          }

          if (oPoll == undefined) {
            oRes.error = 7;
            oRes.errorText = "It is possible to vote only once";
            return oRes;
          }

          iPollId = oPoll.poll_id;
          iResultId = oPoll.poll_result_id;
        } else {
          iPollId = iObjectId;
          tePoll = teObject;
          xarrResults = XQuery(
            "for $elem in poll_results where $elem/person_id = " +
              iUserId +
              " and $elem/poll_id = " +
              iPollId +
              ' return $elem/Fields("id","status")'
          );
        }
      }

      if (tePoll == null) {
        tePoll = OpenDoc(UrlFromDocID(iPollId)).TopElem;
      }

      if (
        iPollProcedureId == null &&
        (tePoll.completed ||
          tePoll.start_date > CurDate ||
          (tePoll.end_date.HasValue && tePoll.end_date < CurDate) ||
          (!tePoll.is_anonymous &&
            tePoll.is_one_time &&
            ArrayOptFind(xarrResults, "This.status>1") != undefined))
      ) {
        oRes.error = 7;
        oRes.errorText = "It is possible to vote only once";
        return oRes;
      }

      if (iResultId == null) {
        if (iPollProcedureId == null) {
          catResult = ArrayOptFindByKey(xarrResults, 0, "status");
          if (catResult != undefined) {
            iResultId = catResult.id.Value;
          }
        }
        if (iResultId == null) {
          docResult = tools.activate_poll_to_person(
            teUser,
            tePoll,
            iPollProcedureId
          );
          teResult = docResult.TopElem;
          if (iUserId == null) {
            docResult.TopElem.code = sUserId;
            docResult.Save();
          }
          iResultId = docResult.DocID;
        }
      }
    } else {
      var oDecrypted = tools_web.decrypt_launch_id(sLaunchId);
      iResultId = Int(oDecrypted.learning_id);
      teResult = OpenDoc(UrlFromDocID(iResultId)).TopElem;
      iPollProcedureId = teResult.poll_procedure_id.Value;
      iPollId = teResult.poll_id.Value;
      iUserId = teResult.person_id.Value;
      sUserId = iUserId == null ? "code_" + tools.random_string(10) : iUserId;
    }

    var docConnection;
    if (catConnection == undefined) {
      docConnection = OpenNewDoc("x-local://wtv/wtv_connection.xmd");
      docConnection.TopElem.active_learning_id = iResultId;
      docConnection.TopElem.course_id = iObjectId;
      docConnection.TopElem.user_id = iUserId == undefined ? null : iUserId;
      docConnection.TopElem.user_code = sUserId;
      docConnection.TopElem.part_code = iPollProcedureId == null ? "" : iPollId;
      docConnection.TopElem.unauthorized = iUserId == null;
      docConnection.BindToDb(DefaultDb);
    } else {
      docConnection = OpenDoc(UrlFromDocID(catConnection.id));
      docConnection.TopElem.active_learning_id = iResultId;
      docConnection.TopElem.part_code = iPollProcedureId == null ? "" : iPollId;
    }
    docConnection.Save();
    iSessionID = docConnection.DocID;

    oRes.sessionId = String(iSessionID);
  } catch (err_g) {
    oRes.error = 1;
    oRes.errorText = StrReplace(StrReplace(err_g, "\n", " "), "\r", "");
    return oRes;
  }

  return oRes;
}

/**
 * @typedef {Object} ReturnHandler
 * @property {number} error Код ошибки
 * @property {string} errorText Текст ошибки
 * @property {string} data ответ в формате json
 */
/**
 * @function Handler
 * @memberof Websoft.HCM.PollPlayer
 * @description Обработчик запросов плеера опросов
 * @returns {ReturnHandler}
 * @author my
 */
function Handler() {
  var oRes = tools.get_code_library_result_object();
  try {
    var iPollID = null;
    var tePoll = null;
    var iLastPollID = null;
    var teForm = OpenNewDoc(
      "x-local://wtv/wtv_form_poll_handler_data.xmd"
    ).TopElem;

    var oFileData = CurRequest.Form.GetOptProperty("file_data");
    var sFileFormat = CurRequest.Form.GetOptProperty("format");

    if (oFileData == undefined) {
      var sBody = tools.object_to_text(DecodeJson(CurRequest.Body), "xml", 5);
	  
	  sBody = StrReplace( sBody, "<br/>", "\n" );

      teForm = OpenDocFromStr(
        sBody,
        "form=x-local://wtv/wtv_form_poll_handler_data.xmd"
      ).TopElem;

      iSessionID = Int(teForm.options.session_id);
      docConnection = OpenDoc(UrlFromDocID(iSessionID));

      if (!StrContains(teForm.options.action, "file")) {
        docPollResult = OpenDoc(
          UrlFromDocID(docConnection.TopElem.active_learning_id)
        );
        iPollID = docPollResult.TopElem.poll_id.Value;
        tePoll = OpenDoc(UrlFromDocID(iPollID)).TopElem;

        iPollProcedureID = docPollResult.TopElem.poll_procedure_id.Value;
        iLastPollID = OptInt(docConnection.TopElem.part_code, null);
      }
    } else {
      iSessionID = Int(CurRequest.Form.session_id);
      docConnection = OpenDoc(UrlFromDocID(iSessionID));

      teForm.options.session_id = iSessionID;
      teForm.options.action = "put_file";
    }

    function fill_questions(fldItemParam) {
      if (fldItemParam == undefined) return;

      if (fldItemParam.question_id.HasValue && fldItemParam.type != "title") {
        teForm.questions
          .ObtainChildByKey(fldItemParam.question_id)
          .AssignElem(fldItemParam.question_id.ForeignElem);
		  teForm.questions.ObtainChildByKey( fldItemParam.question_id ).image_url = tools_web.get_object_source_url( 'resource', fldItemParam.question_id.ForeignElem.image_id );
      } else {
        for (fldRowElem in fldItemParam.rows) {
          if (fldRowElem.question_id.HasValue)
            teForm.questions
              .ObtainChildByKey(fldRowElem.question_id)
              .AssignElem(fldRowElem.question_id.ForeignElem);

          for (fldColumnElem in fldRowElem.columns) {
            if (fldColumnElem.question_id.HasValue)
              teForm.questions
                .ObtainChildByKey(fldColumnElem.question_id)
                .AssignElem(fldColumnElem.question_id.ForeignElem);
          }
        }
      }

      teForm.items
        .ObtainChildByKey(fldItemParam.PrimaryKey)
        .AssignElem(fldItemParam);

      docPollResult.TopElem.last_item_id = fldItemParam.PrimaryKey;
    }

    function fill_items() {
      if (tePoll.adaptive_mode == "") {
        tools.assign_elems(teForm, tePoll, ["questions", "items"]);
        for (fldQuestionElem in tePoll.questions)
          if (fldQuestionElem.image_id.HasValue)
            teForm.questions.ObtainChildByKey(fldQuestionElem.id).image_url =
              tools_web.get_object_source_url(
                "resource",
                fldQuestionElem.image_id
              );
      } else {
        arrItems = get_last_page_items();
        for (fldItemElem in arrItems) fill_questions(fldItemElem);
        docPollResult.Save();
      }
    }

    function check_group_conditions(fldConditionsParam) {
      if (tePoll.adaptive_mode == "adaptive") {
        sLastItemID = docPollResult.TopElem.last_item_id.Value;
        fldItem = tePoll.items.GetOptChildByKey(sLastItemID);
        if (fldItem == undefined) {
          fldItem = ArrayOptFirstElem(tePoll.items);
        }

        fill_questions(fldItem);
        docPollResult.Save();
      } else {
        tools.assign_elems(teForm, tePoll, ["questions", "items"]);
      }
    }

    function get_last_page_items(fldFirstItem) {
      arrItems = [];
      if (fldFirstItem == undefined) {
        sLastItemID = docPollResult.TopElem.last_item_id.Value;
        fldFirstItem = tePoll.items.GetOptChildByKey(sLastItemID);
        if (fldFirstItem == undefined)
          fldFirstItem = ArrayOptFind(
            tePoll.items,
            "This.conditions.ChildNum==0"
          );
      }

      if (tePoll.adaptive_mode == "adaptive") {
        arrItems.push(fldFirstItem);
      } else {
        iStartIndex = fldFirstItem.ChildIndex;
        while (
          iStartIndex < tePoll.items.ChildNum &&
          tePoll.items[iStartIndex].type == "pagebreak"
        )
          iStartIndex++;
        if (iStartIndex >= tePoll.items.ChildNum) return [];

        iFinishIndex = iStartIndex + 1;
        while (iStartIndex >= 0) {
          if (tePoll.items[iStartIndex].type == "pagebreak") {
            iStartIndex++;
            break;
          }
          if (iStartIndex <= 0) break;
          iStartIndex--;
        }
        while (iFinishIndex < tePoll.items.ChildNum) {
          if (tePoll.items[iFinishIndex].type == "pagebreak") {
            iFinishIndex--;
            break;
          }
          iFinishIndex++;
        }
        for (
          i = iStartIndex;
          i <= iFinishIndex && i < tePoll.items.ChildNum;
          i++
        )
          arrItems.push(tePoll.items[i]);
      }
      return arrItems;
    }

    try {
      switch (teForm.options.action) {
        case "get":
          bDone = false;
          if (iPollProcedureID == null) {
            teForm.poll.AssignElem(tePoll, true);
            teForm.poll.adaptive = tePoll.adaptive_mode != "";
            teForm.poll.desc = tools_web.get_web_desc(
              tePoll.desc,
              UrlFromDocID(iPollID),
              "poll.desc"
            );
            bDone = docPollResult.TopElem.is_done;
            if (bDone) {
              teForm.options.status = "c";
              teForm.options.action = "finish";
            }
          } else {
            tePollProcedure = OpenDoc(UrlFromDocID(iPollProcedureID)).TopElem;
            teForm.poll.AssignElem(tePollProcedure, true);
            teForm.poll.desc = tools_web.get_web_desc(
              tePollProcedure.desc,
              UrlFromDocID(iPollProcedureID),
              "poll_procedure.desc"
            );
          }

          if (!bDone) {
            tools.assign_elems(teForm.result, docPollResult.TopElem, [
              "questions",
            ]);
            for (fldQuestionResultElem in teForm.result.questions) {
              iID = fldQuestionResultElem.PrimaryKey.Value;
              fldQuestion = tePoll.questions.GetChildByKey(iID);

              switch (fldQuestion.type) {
                case "file":
                  iResourceID = OptInt(fldQuestionResultElem.value);
                  if (iResourceID != undefined) {
                    try {
                      teResource = OpenDoc(UrlFromDocID(iResourceID)).TopElem;
                      tools.assign_elems(fldQuestionResultElem, teResource, [
                        "name",
                        "file_name",
                        "size",
                        "type",
                      ]);
                      fldQuestionResultElem.download_url =
                        tools_web.get_object_source_url(
                          "resource",
                          iResourceID
                        );
                    } catch (err) {
                      alert(err);
                    }
                  }
                  break;

                case "link_to_database_object":
                  arrValues = fldQuestionResultElem.value.Value.split(";");
                  for (sValueElem in arrValues) {
                    fldObject = fldQuestionResultElem.objects.AddChild();
                    fldObject.id = sValueElem;

                    iID = OptInt(sValueElem);
                    if (iID == undefined) continue;

                    try {
                      teObject = OpenDoc(UrlFromDocID(iID)).TopElem;
                      fldObject.name =
                        tools.get_object_name_field_value(teObject);
                    } catch (err) {
                      fldObject.name = global_settings.object_deleted_str;
                      alert(err);
                    }
                  }
                  break;
              }
            }

            fill_items();
          }
          break;

        case "update":
        case "next":
          for (fldResultQuestionElem in teForm.result.questions) {
            if (
              !fldResultQuestionElem.value.HasValue &&
              !fldResultQuestionElem.comment.HasValue &&
              fldResultQuestionElem.objects.ChildNum == 0
            ) {
              fldResultQuestion =
                docPollResult.TopElem.questions.GetOptChildByKey(
                  fldResultQuestionElem.PrimaryKey
                );
              if (fldResultQuestion != undefined) fldResultQuestion.Delete();
              continue;
            }
            fldResultQuestion =
              docPollResult.TopElem.questions.ObtainChildByKey(
                fldResultQuestionElem.PrimaryKey
              );
            fldResultQuestion.AssignElem(fldResultQuestionElem);
          }
          teForm.result.Clear();

          if (teForm.options.action == "update") {
            docPollResult.Save();
            break;
          }

          bComplete = tePoll.adaptive_mode == "";
          if (tePoll.adaptive_mode == "adaptive") {
            if (docPollResult.TopElem.last_item_id.HasValue)
              fldItem = tePoll.items.GetOptChildByKey(
                docPollResult.TopElem.last_item_id
              );
            else fldItem = ArrayOptFirstElem(tePoll.items);
            if (fldItem == undefined) {
              teForm.error.code = 4;
              teForm.error.message = "Invalid last item id";
              break;
            }

            iItemIndex = fldItem.ChildIndex;
            iItemIndex++;
            if (iItemIndex < tePoll.items.ChildNum) {
              fldItem = tePoll.items[iItemIndex];
              bBreak = false;
              while (
                iItemIndex < tePoll.items.ChildNum &&
                (fldItem.conditions.ChildNum != 0 ||
                  fldItem.type == "pagebreak")
              ) {
                for (fldConditionElem in fldItem.conditions) {
                  fldQuestion = tePoll.questions.GetOptChildByKey(
                    fldConditionElem.question_id
                  );
                  fldResultQuestion =
                    docPollResult.TopElem.questions.GetOptChildByKey(
                      fldConditionElem.question_id
                    );
                  if (
                    fldQuestion != undefined &&
                    fldResultQuestion != undefined &&
                    ArrayOptFind(
                      fldResultQuestion.value.Value.split(";"),
                      "This==" + CodeLiteral(String(fldConditionElem.entry_id))
                    ) != undefined
                  ) {
                    bBreak = true;
                    break;
                  }
                }
                if (bBreak) break;

                iItemIndex++;
                if (iItemIndex >= tePoll.items.ChildNum) break;
                fldItem = tePoll.items[iItemIndex];
              }
              if (
                iItemIndex < tePoll.items.ChildNum &&
                fldItem.type != "pagebreak"
              ) {
                fill_questions(fldItem);
                teForm.options.action = "next";
              } else {
                bComplete = true;
              }
            } else {
              bComplete = true;
            }
          } else if (tePoll.adaptive_mode == "page") {
            arrItems = get_last_page_items();
            fldFinishItem = arrItems[ArrayCount(arrItems) - 1];
            if (fldFinishItem.ChildIndex < tePoll.items.ChildNum - 1) {
              arrItems = get_last_page_items(
                tePoll.items[fldFinishItem.ChildIndex + 1]
              );
              if (ArrayCount(arrItems) == 0) {
                bComplete = true;
              } else {
                for (fldItemElem in arrItems) fill_questions(fldItemElem);
              }
            } else {
              bComplete = true;
            }
          } else {
            if (teForm.options.status == "c") {
              bUseQuestions = tePoll.items.ChildNum == 0;
              for (fldObjectElem in bUseQuestions
                ? tePoll.questions
                : tePoll.items) {
                if (bUseQuestions) {
                  fldQuestionElem = fldObjectElem;
                } else {
                  fldQuestionElem = fldObjectElem.question_id.OptForeignElem;
                  if (fldQuestionElem == undefined) continue;
                }
                fldResultQuestion =
                  docPollResult.TopElem.questions.GetOptChildByKey(
                    fldQuestionElem.PrimaryKey
                  );
                if (
                  fldQuestionElem.required &&
                  (fldResultQuestion == undefined ||
                    !fldResultQuestion.value.HasValue)
                ) {
                  bComplete = false;
                  break;
                }
              }
            }
          }

          if (bComplete) {
            teForm.options.status = "c";
            docPollResult.TopElem.is_done = true;
            docPollResult.TopElem.status = 2;

            if (docPollResult.TopElem.poll_procedure_id.HasValue) {
              var tePollProcedure = OpenDoc(
                UrlFromDocID(docPollResult.TopElem.poll_procedure_id)
              ).TopElem;
              var arrPollObjs = tePollProcedure.get_person_poll_objs(
                docPollResult.TopElem.person_id
              );
              var iLastForPollID = null;
              var sLastForPollGroup = "";
              var sNextForPollGroup = "";
              var xarrPollResults = null;
              var oNextPoll = null;

              var oPullsFirstElem = ArrayOptFirstElem(arrPollObjs);
              if (iLastPollID == null && oPullsFirstElem != undefined) {
                iLastPollID = oPullsFirstElem.poll_id;
              }
              for (oPollElem in arrPollObjs) {
                if (
                  iLastForPollID != null &&
                  (sNextForPollGroup == "" ||
                    sNextForPollGroup != oPollElem.poll_group)
                ) {
                  if (
                    oPollElem.poll_group == "" ||
                    sLastForPollGroup == oPollElem.poll_group
                  ) {
                    oNextPoll = oPollElem;
                    break;
                  } else {
                    fldPollGroup =
                      tePollProcedure.additional.poll_groups.GetChildByKey(
                        oPollElem.poll_group
                      );
                    bBreak = fldPollGroup.conditions.ChildNum == 0;
                    for (fldConditionElem in fldPollGroup.conditions) {
                      tePollGroup = OpenDoc(
                        UrlFromDocID(fldConditionElem.poll_id)
                      ).TopElem;
                      fldQuestion = tePollGroup.questions.GetOptChildByKey(
                        fldConditionElem.question_id
                      );

                      if (xarrPollResults == null) {
                        xarrPollResults = ArraySelectAll(
                          XQuery(
                            "for $elem in poll_results where " +
                              (docConnection.TopElem.unauthorized
                                ? "$elem/code = " +
                                  XQueryLiteral(docPollResult.TopElem.code)
                                : "$elem/person_id = " +
                                  docPollResult.TopElem.person_id) +
                              " and $elem/poll_procedure_id = " +
                              iPollProcedureID +
                              ' return $elem/Fields("id","poll_id")'
                          )
                        );
                      }

                      catResultCondition = ArrayOptFindByKey(
                        xarrPollResults,
                        fldConditionElem.poll_id,
                        "poll_id"
                      );
                      if (catResultCondition == undefined) continue;

                      teResultCondition = OpenDoc(
                        UrlFromDocID(catResultCondition.id)
                      ).TopElem;
                      fldResultQuestion =
                        teResultCondition.questions.GetOptChildByKey(
                          fldConditionElem.question_id
                        );

                      if (
                        fldQuestion != undefined &&
                        fldResultQuestion != undefined &&
                        ArrayOptFind(
                          fldResultQuestion.value.Value.split(";"),
                          "This==" +
                            CodeLiteral(String(fldConditionElem.entry_id))
                        ) != undefined
                      ) {
                        bBreak = true;
                        break;
                      }
                    }
                    if (bBreak) {
                      oNextPoll = oPollElem;
                      break;
                    } else {
                      sNextForPollGroup = oPollElem.poll_group;
                    }
                  }
                }
                if (iLastPollID == oPollElem.poll_id) {
                  iLastForPollID = iLastPollID;
                  sLastForPollGroup = oPollElem.poll_group;
                }
              }

              if (oNextPoll == null) {
                teForm.options.action = "finish";
                docConnection.TopElem.state = "finish";
                docConnection.Save();
              } else {
                iNextPollResultID = oNextPoll.poll_result_id;
                iPollID = oNextPoll.poll_id;
                tePoll = OpenDoc(UrlFromDocID(iPollID)).TopElem;

                if (iNextPollResultID == null) {
                  if (docConnection.TopElem.unauthorized) {
                    docPollResultNext = tools.activate_poll_to_person(
                      null,
                      iPollID,
                      iPollProcedureID
                    );
                    docPollResultNext.TopElem.code = docPollResult.TopElem.code;
                    docPollResultNext.Save();
                  } else {
                    docPollResultNext = tools.activate_poll_to_person(
                      docPollResult.TopElem.person_id,
                      iPollID,
                      iPollProcedureID
                    );
                  }
                  iNextPollResultID = docPollResultNext.DocID;
                }
                docConnection.TopElem.active_learning_id = iNextPollResultID;

                fill_items();

                teForm.options.action = "next";

                docConnection.TopElem.part_code = iPollID;
                docConnection.Save();
              }
            } else {
              teForm.options.action = "finish";
            }

            if (tePoll.processing_code.HasValue) {
              try {
                SafeEval(tePoll.processing_code, [
                  { docPollResult: docPollResult, tePoll: tePoll },
                ]);
              } catch (err) {
                alert(err);
              }
            }
            if (docPollResult.TopElem.education_plan_id.HasValue)
              tools.call_code_library_method(
                "libEducation",
                "update_education_plan",
                [
                  docPollResult.TopElem.education_plan_id,
                  null,
                  docPollResult.TopElem.person_id,
                ]
              );
          }

          docPollResult.Save();
          iPollResultID = docPollResult.DocID;

          if (bComplete) {
            tools_proctor.finish_learning_record_thread(
              iPollResultID,
              docPollResult.DocID,
              docPollResult.TopElem,
              tePoll
            );
          }

          if (bComplete) {
            ms_tools.raise_system_event_env("portal_create_poll_result", {
              iPollID: iPollID,
              tePoll: tePoll,
              curUserID: docPollResult.TopElem.person_id.Value,
              curUser: null,
              iPollResultID: iPollResultID,
              docPollResult: docPollResult,
              tePollResult: docPollResult.TopElem,
            });
          }
          break;

        case "put_file":
          docResource = OpenNewDoc("x-local://wtv/wtv_resource.xmd");
          docResource.BindToDb(DefaultDb);
          if (docConnection.TopElem.unauthorized) {
          } else {
            docResource.TopElem.person_id = docConnection.TopElem.user_id;
            tools.common_filling(
              "collaborator",
              docResource.TopElem,
              docResource.TopElem.person_id
            );
          }

          sQuestionID = CurRequest.Query.GetOptProperty("question_id", "");
          sFileName =
            StrLowerCase(oFileData.FileName) == "blob"
              ? "poll_result_" + iSessionID + "_" + sQuestionID
              : UrlFileName(oFileData.FileName);
          if (sFileFormat != 'undefined') sFileName += sFileFormat;
          docResource.TopElem.put_str(oFileData, sFileName);

          teForm.resource.AssignElem(docResource.TopElem);
          teForm.resource.download_url = tools_web.get_object_source_url(
            "resource",
            docResource.DocID
          );
          break;

        case "delete_file":
          if (docConnection.TopElem.unauthorized) break;

          try {
            teResource = OpenDoc(
              UrlFromDocID(teForm.options.resource_id)
            ).TopElem;
            if (teResource.person_id != Int(docConnection.TopElem.user_id)) {
              //teForm.error.code = 401;
              //teForm.error.message = 'Access denied.';
            } else {
              ms_tools.delete_resource(teResource);
            }
          } catch (err) {
            alert(err);
            teForm.error.code = 404;
            teForm.error.message = "Resource not found";
          }
          break;

        default:
          teForm.error.code = 3;
          teForm.error.message = "Unknown command";
          break;
      }

      for (fldQuestionElem in teForm.questions) {
        for (fldEntrieElem in fldQuestionElem.entries) {
          if (fldEntrieElem.resource_id.HasValue) {
            fldEntrieElem.resource_url = tools_web.get_object_source_url(
              "resource",
              fldEntrieElem.resource_id
            );
          }
        }
      }
    } catch (err2) {
      if (!IsCancelError(err2)) {
        alert(err2);
        teForm.error.code = 500;
        teForm.error.message = err2;
      }
    }
  } catch (err) {
    if (!IsCancelError(err)) {
      alert(err);
      teForm.error.code = 1;
      teForm.error.message = "Invalid session id";
    }
  }

  oRes.error = teForm.error.code;
  oRes.errorText = teForm.error.message;

  oRes.data = DecodeJson(tools.object_to_text(teForm, "json", 5));

  return oRes;
}

/**
 * @typedef {Object} ReturnClearPollResults
 * @property {number} error Код ошибки
 * @property {string} errorText Текст ошибки
 */
/**
 * @function ClearPollResults
 * @memberof Websoft.HCM.PollPlayer
 * @description Удаляет все результаты указанного опроса пользователя
 * @param {string} sPollId ID объекта (опроса)
 * @param {string} sLaunchId ID запуска
 * @returns {ReturnClearPollResults}
 * @author my

 */
function ClearPollResults(sPollId, sLaunchId) {
  var oRes = tools.get_code_library_result_object();

  try {
    var iPollId = Int(sPollId);
  } catch (error) {
    oRes.error = 2;
    oRes.errorText = "Incorrect poll ID format";
    return oRes;
  }

  var iUserId = getCurrentUserId(sLaunchId);

  var xarrPollResults = XQuery(
    "for $elem in poll_results where $elem/person_id = " +
      iUserId +
      " and $elem/poll_id = " +
      iPollId +
      " return $elem/Fields('id')"
  );

  for (oPollResult in xarrPollResults) {
    DeleteDoc(UrlFromDocID(oPollResult.id));
  }

  return oRes;
}

/**
 * @typedef {Object} ReturnGetMyPollResults
 * @property {number} error Код ошибки
 * @property {string} errorText Текст ошибки
 * @property {Object} data  Данные опроса
 */
/**
 * @function GetMyPollResults
 * @memberof Websoft.HCM.PollPlayer
 * @description Возвращает результаты опросов
 * @param {string} sPollId ID опроса
 * @param {string} sLaunchId ID запуска
 * @param {string} sPageNum Номер страницы
 * @param {string} sPageSize Количество элементов на странице
 * @returns {ReturnGetMyPollResults}
 * @author my
 */
function GetMyPollResults(sPollId, sLaunchId, sPageNum, sPageSize) {
  var oRes = tools.get_code_library_result_object();

  try {
    try {
      var iPollId = Int(sPollId);
    } catch (error) {
      oRes.error = 2;
      oRes.errorText = "Incorrect poll ID format";
      return oRes;
    }

    if (sPageNum == undefined || sPageSize == undefined) {
      oRes.error = 6;
      oRes.errorText = "Required function parameters not exists";
      return oRes;
    }

    var docPoll = tools.open_doc(iPollId);
    if (docPoll == undefined) {
      oRes.error = 3;
      oRes.errorText = "Poll with ID: " + iPollId + " not found";
      return oRes;
    }

    var iUserId = getCurrentUserId(sLaunchId);

    if (iUserId != undefined) {
      var docUser = tools.open_doc(iUserId);
      var teUser = docUser.TopElem;
      var sPersonFullname = teUser.fullname;
      var sAvatarUrl = tools_web.get_object_source_url("person", iUserId);
    } else {
      oRes.total = 0;
      oRes.items = [];
      return oRes;
    }

    var xarrPollResults = XQuery(
      "for $elem in poll_results where $elem/poll_id = " +
        sPollId +
        " and $elem/person_id = " +
        iUserId +
        " order by $elem/create_date descending return $elem/Fields('id', 'create_date', 'status')"
    );

    oRes.total = ArrayCount(xarrPollResults);
    oRes.items = [];

    var arrPollResultsRange = ArrayRange(
      xarrPollResults,
      (Int(sPageNum) - 1) * Int(sPageSize),
      Int(sPageSize)
    );

    for (oPollResult in arrPollResultsRange) {
      oRes.items.push({
        id: String(oPollResult.id),
        type: "poll",
        person_fullname: sPersonFullname,
        avatar_url: sAvatarUrl,
        date: StrDate(oPollResult.create_date, true, false),
        status: oPollResult.status,
      });
    }

    return oRes;
  } catch (error) {
    return {
      error: 9,
      errorText: error.message,
    };
  }
}

/**
 * @typedef {Object} ReturnGetPollResult
 * @property {number} error Код ошибки
 * @property {string} errorText Текст ошибки
 * @property {Object} data  Данные опроса
 */
/**
 * @function GetPollResult
 * @memberof Websoft.HCM.PollPlayer
 * @description Возвращает результат опроса
 * @param {string} sPollResultId ID результата опроса
 * @param {string} sLaunchId ID запуска
 * @returns {ReturnGetPollResult}
 * @author my
 */
function GetPollResult(sPollResultId, sLaunchId) {
  var oRes = tools.get_code_library_result_object();

  try {
    try {
      var iPollResultId = Int(sPollResultId);
    } catch (error) {
      oRes.error = 2;
      oRes.errorText = "Incorrect poll result ID format";
      return oRes;
    }

    var docPollResult = tools.open_doc(iPollResultId);

    if (docPollResult == undefined) {
      oRes.error = 3;
      oRes.errorText = "Poll result with ID " + sPollResultId + " not exists";
      return oRes;
    }

    var tePollResult = docPollResult.TopElem;

    var docPoll = tools.open_doc(tePollResult.poll_id.Value);

    if (docPoll == undefined) {
      oRes.error = 8;
      oRes.errorText =
        "Poll with id " + tePollResult.poll_id.Value + " not exists";
      return oRes;
    }

    var tePoll = docPoll.TopElem;

    var iCurrentUserId = getCurrentUserId(sLaunchId);

    if (
      iCurrentUserId == undefined ||
      (iCurrentUserId != undefined &&
        iCurrentUserId != tePollResult.person_id.Value)
    ) {
      oRes.error = 11;
      oRes.errorText = "No access to poll result";
      return oRes;
    }

    var teUser = tePollResult.person_id.OptForeignElem;

    if (teUser == undefined) {
      oRes.person_fullname = "";
      oRes.avatar_url = tools_web.get_object_source_url("person", "");
    } else {
      oRes.person_fullname = teUser.fullname;
      oRes.avatar_url = tools_web.get_object_source_url("person", teUser.id);
    }

    if (tePoll.GetOptProperty("resource_id") != null) {
      oRes.preview_url = "/download_file.html?file_id=" + tePoll.resource_id;
    }

    oRes.name = tePoll.name;
    oRes.status = tePollResult.status;

    if (tePollResult.poll_procedure_id.HasValue) {
      oRes.poll_procedure_name =
        tePollResult.poll_procedure_id.OptForeignElem.name;
    }

    oRes.date = StrDate(tePollResult.create_date, false, false);

    oRes.items = [];

    for (fldQuestionElem in tePollResult.questions) {
      fldPollQuestion = tePoll.questions.GetOptChildByKey(
        fldQuestionElem.PrimaryKey
      );
      sQuestionType = fldPollQuestion.type;
      if (fldPollQuestion == undefined || sQuestionType == "title") continue;

      item = {};
      item.id = fldPollQuestion.id;
      item.title = fldPollQuestion.title;
      item.type = sQuestionType;

      sValue = fldQuestionElem.value.Value;

      if (
        sQuestionType == "bool" ||
        sQuestionType == "number" ||
        sQuestionType == "string" ||
        sQuestionType == "text"
      ) {
        try {
          item.value = sValue;
        } catch (err) {}
      }

      if (sQuestionType == "file") {
        try {
          teResource = OpenDoc(UrlFromDocID(Int(sValue))).TopElem;
          item.value = teResource.name;
          item.url = tools_web.get_object_source_url("resource", teResource.id);
        } catch (err) {}
      }

      if (sQuestionType == "date") {
        try {
          item.value = StrDate(Date(fldQuestionElem.value), false);
        } catch (err) {}
      }

      if (sQuestionType == "link_to_database_object") {
        try {
          arrValue = String(sValue).split(";");
          sValue = [];
          for (sValueElem in arrValue) {
            try {
              teObject = OpenDoc(UrlFromDocID(Int(sValueElem))).TopElem;
              sValue.push(tools.get_disp_name_value(teObject));
            } catch (err) {
              sValue.push("Object with ID: " + sValue + " not exists");
            }
          }
          item.value = sValue;
        } catch (err) {}
      }

      if (sQuestionType == "choice" || sQuestionType == "combo") {
        try {
          if (sValue == "") {
            item.value = sValue;
          } else {
            fldEntry = fldPollQuestion.entries.GetOptChildByKey(OptInt(sValue));

            item.value = fldEntry == undefined ? "" : fldEntry.value;
          }
        } catch (err) {}
      }

      if (sQuestionType == "select" || sQuestionType == "order") {
        try {
          arrValue = String(sValue).split(";");
          sValue = [];
          for (sValueElem in arrValue) {
            fldEntry = fldPollQuestion.entries.GetOptChildByKey(
              OptInt(sValueElem)
            );
            if (fldEntry == undefined) {
              sValue.push("-");
            } else {
              sValue.push(fldEntry.value);
            }
          }
          item.value = sValue;
        } catch (err) {}
      }

      if (fldQuestionElem.comment.HasValue) {
        item.comment = fldQuestionElem.comment;
      }

      oRes.items.push(item);
    }

    return oRes;
  } catch (error) {
    return {
      error: 9,
      errorText: error.message + error,
    };
  }
}
