
function RepositoriumDeleteCurrent(iPersonID, iRepositoriumID, sParams){
	
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
		alert(err)
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: 'Invalid param iPersonID.', param_name: 'iPersonID' }";
		return oRes;
	}
	
	try
	{
		iRepositoriumID = Int( iRepositoriumID );
	}
	catch( err )
	{
		alert(err)
		oRes.error = 501; // Invalid param
		oRes.errorText = "{ text: 'Invalid param iRepositoriumID.', param_name: 'iRepositoriumID' }";
		return oRes;
	}
	
	docRepositorium = tools.open_doc(iRepositoriumID)
	if(docRepositorium == undefined)
		throw "�� ������ ����������� �� ���������� ID";
	
	oDocRepositoriumTE = docRepositorium.TopElem
	
	var oAuthors = ArrayOptFind( oDocRepositoriumTE.authors, 'This.person_id == ' + iPersonID );
	
	if ( oAuthors == undefined )
		throw "�� �� ��������� ������� �������� �����������, ������� �������� �� �������� �� ����� ���� ����������.";
	
	if(sParams == 'repo' || sParams == 'repo_files'){
		var oFilesID = ArraySelect(ArrayExtract(oDocRepositoriumTE.files, "OptInt(This.file_id)"), "This != undefined")
	}
	
	try
	{
		DeleteDoc( UrlFromDocID( OptInt( iRepositoriumID )), false); // ������� �����������
	}
	catch ( err )
	{
		alert( err );
	}
	
	if(sParams == undefined){
		oRes.result = '����������� ������� ������'
	} else if(sParams == 'repo'){ // ������� ���������� �� ������ � �����������

		for(iFileID in oFilesID){
			docFile = tools.open_doc(iFileID)
			oDocFileTE = docFile.TopElem
			
			oDocFileTE.links.DeleteChildByKey(iRepositoriumID);
			docFile.Save();
		}
		
		oRes.result = '����������� ������� ������'
	} else if(sParams == 'repo_files'){ // ������� �����

		for(iFileID in oFilesID){
			try
			{
				docFile = tools.open_doc(iFileID)
				oDocFileTE = docFile.TopElem
				
				if(oDocFileTE.person_id == iPersonID){
					DeleteDoc( UrlFromDocID( OptInt( iFileID )), false);
				} else {
					oDocFileTE.links.DeleteChildByKey(iRepositoriumID);
					docFile.Save();
				}
			}
			catch ( err )
			{
				alert( err );
			}
		}
		
		oRes.result = '����������� � ��������� � ��� ����� ������� �������'
	}
	
	return oRes
}