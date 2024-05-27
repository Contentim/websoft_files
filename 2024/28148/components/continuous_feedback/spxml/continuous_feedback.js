
function init()
{
	alert( 'Component continuous_feedback initializing...' );

	//tools_component.init_forms();

alert("url = "+continuous_feedback.append_component_relative_url( "/custom" ))
	tools.process_custom_packs( null, continuous_feedback.append_component_relative_url( "/custom" ) );

	alert( 'Component continuous_feedback initialized' );
}




function get_component_base_path()
{
	return "x-local://components/continuous_feedback";
}

function append_component_relative_url( url )
{
	return UrlAppendPath( continuous_feedback.get_component_base_path(), url );
}