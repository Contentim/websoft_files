
// удаление файла и связанных записей
function ResourceDeleteCurrent(iPersonID, iFileID){
	
	var oRes = tools.get_code_library_result_object();
		oRes.error = 0;
		oRes.errorText = "";
		oRes.result = "";
	
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
	
	try
	{
		iFileID = Int( iFileID );
	}
	catch( err )
	{
		alert(err)
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: 'Invalid param iFileID.', param_name: 'iFileID' }";
		return oRes;
	}

	docFile = tools.open_doc(iFileID)
	if(docFile == undefined)
		throw "Не найден файл по указанному ID";
	
	oDocFileTE = docFile.TopElem
	
	if(oDocFileTE.person_id != iPersonID)
		throw "Этот файл может удалить лишь его владелец"
	
	var resources = oDocFileTE.links

	for(resource in resources){
		
		iResID = resource.object_id
			
		curResObjectDoc = tools.open_doc(iResID)
		if(curResObjectDoc != undefined){
			iResID = resource.object_id
			
			curResObjectDoc = tools.open_doc(iResID)
			
			if(curResObjectDoc != undefined){
				oResObjectDocTE = curResObjectDoc.TopElem
				
				oFile = ArrayOptFind( oResObjectDocTE.files, 'This.file_id == ' + iFileID );
				
				if(oFile != undefined)
					oResObjectDocTE.files.DeleteChildByKey(iFileID);
				
				curResObjectDoc.Save();
			}
		}
	}

	DeleteDoc( UrlFromDocID( OptInt( iFileID )), false);

	oRes.action_result = "Файл успешно удален"
	
	return oRes;
}


// изменение владельца файла
function ResourceChangeAuthor(iPersonID, iFileID){
	
	var oRes = tools.get_code_library_result_object();
		oRes.error = 0;
		oRes.errorText = "";
		oRes.result = "";
	
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
	
	try
	{
		iFileID = Int( iFileID );
	}
	catch( err )
	{
		alert(err)
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: 'Invalid param iFileID.', param_name: 'iFileID' }";
		return oRes;
	}
	
	xarrPerson = tools.xquery("for $elem in collaborators where MatchSome($elem/id, (" + XQueryLiteral(iPersonID) + ")) return $elem/Field('fullname')");
	oPersonal = ArrayOptFirstElem(xarrPerson);
	
	if(oPersonal == undefined)
		throw "Возникла ошибка при получении данных о сотруднике из каталога системы"
	
	sPersonalFullname = oPersonal.fullname.Value

	var docFile = tools.open_doc(iFileID)
	
	if(docFile == undefined)
		throw "Не удалось открыть файл с ID: " + iFileID
		
	var docFileTE = docFile.TopElem

	docFileTE.person_id = iPersonID
	docFileTE.person_fullname = sPersonalFullname
	docFile.Save();
	
	oRes.action_result = "Владелец файла успешно изменен"
	
	return oRes;
	
}