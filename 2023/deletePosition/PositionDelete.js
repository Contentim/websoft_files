
/**
 * @function deletePosition
 * @author IG BG
 * @description Удаление должности
 * @param {integer} sObjectIDs - список ID должностей
 * @param {integer} sCommand - события формы
 * @returns {###}
*/
function deletePosition( sObjectIDs )
{
	var oRes = tools.get_code_library_result_object();
	oRes.action_result = {};
	
	iCount = 0;
	iCountObjectIDs = ArrayCount( sObjectIDs.split(";") ); 
	
	try
	{
		if(iCountObjectIDs == 0)
			throw "Передаваемые данные не являются массивом ID должностей или массив пустой"

	}
	catch (err)
	{
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: '" + err + "', param_name: 'sObjectIDs' }";
		return oRes;
	}

	function getFormMessage(_sMessage)
	{
		var oForm;
		oForm = {
			command: "alert",
			msg: _sMessage,
			confirm_result: {
				command: "reload_page"
			}
		}
	
		return oForm;
	}
	
	try
	{
		if (sObjectIDs != "")
		{
			if(iCountObjectIDs == 1)
			{
				xarrPosition = tools.xquery("for $elem in positions where MatchSome($elem/id, (" + StrReplace(sObjectIDs, ";", ",") + ")) return $elem/Field('name')");
				_oPosition = ArrayOptFirstElem(xarrPosition);
				sPositionName = _oPosition.name.Value
			}

			for (sPositionID in sObjectIDs.split(";"))
			{
				sPositionID = OptInt( sPositionID );
				if ( sPositionID != undefined )
				{
					
					xarrCollaborator = tools.xquery("for $elem in positions where MatchSome($elem/id, (" + XQueryLiteral(sPositionID) + ")) return $elem/Fields('basic_collaborator_id')");
					oCollaborator = ArrayOptFirstElem(xarrCollaborator);
					iCollaboratorID = oCollaborator.basic_collaborator_id.Value
					
					curObjectDoc = tools.open_doc(iCollaboratorID)
					curObjectDocTE = curObjectDoc.TopElem
					
					if(curObjectDoc != undefined && curObjectDocTE.position_id == sPositionID){ // удалить записи о должности в карточке сотрудника
					
						curObjectDocTE.position_id.Clear();
						curObjectDocTE.position_name.Clear();
						curObjectDocTE.position_parent_id.Clear();
						curObjectDocTE.position_parent_name.Clear();
						
						curObjectDocTE.org_id.Clear();
						curObjectDocTE.org_name.Clear();
						
						curObjectDoc.Save();
						
						DeleteDoc( UrlFromDocID( OptInt( sPositionID )), false); // удаляем должность
						
						iCount++;
					}
				}
			}

			if ( oRes.error != 0 )
			{
				oRes.action_result = getFormMessage(oRes.errorText);
			}
			else
			{
				if ( iCountObjectIDs == 1)
				{
					oRes.action_result = getFormMessage("Должность \"" + sPositionName + "\" удалена");
				}
				else
				{
					oRes.action_result = getFormMessage("Удалено должностей: " + iCount + " из " + iCountObjectIDs + ".");
				}
			}
		}
	}
	catch ( err )
	{
		oRes.error = 1;
		oRes.errorText = "ERROR: " + err;
	}
	
	return oRes;
}
