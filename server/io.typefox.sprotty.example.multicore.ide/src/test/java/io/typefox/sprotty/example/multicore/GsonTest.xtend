package io.typefox.sprotty.example.multicore

import org.junit.Test
import org.junit.runner.RunWith
import org.eclipse.xtext.testing.XtextRunner
import org.eclipse.xtext.testing.InjectWith
import io.typefox.sprotty.server.json.ActionTypeAdapter
import io.typefox.sprotty.api.ActionMessage

@RunWith(XtextRunner)
@InjectWith(SprottyInjectorProvider)
class GsonTest {

	@Test
	def void testActionMessgage() {
		val message = '''
			"{\"clientId\":\"widget-1\",\"action\":{\"modelType\":\"flow\",\"options\":{\"resourceID\":\"file:///Users/koehnlein/mycode/example01.multicore\"},\"kind\":\"requestModel\"}}"
		'''
		val gson = ActionTypeAdapter.createDefaultGson
		val unescaped = gson.fromJson(message, String)
		val am = gson.fromJson(unescaped, ActionMessage)
		println(am)
	}	
}