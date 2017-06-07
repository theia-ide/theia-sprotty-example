package io.typefox.sprotty.example.multicore

import com.google.gson.GsonBuilder
import io.typefox.sprotty.api.ActionMessage
import io.typefox.sprotty.server.json.ActionTypeAdapter
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.XtextRunner
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(XtextRunner)
@InjectWith(SprottyInjectorProvider)
class GsonTest {

	@Test
	def void testActionMessgage() {
		val message = '''
			"{\"clientId\":\"widget-1\",\"action\":{\"modelType\":\"flow\",\"options\":{\"resourceID\":\"file:///Users/koehnlein/mycode/example01.multicore\"},\"kind\":\"requestModel\"}}"
		'''
		val gsonBuilder = new GsonBuilder
		ActionTypeAdapter.configureGson(gsonBuilder)
		val gson = gsonBuilder.create()
		val unescaped = gson.fromJson(message, String)
		val am = gson.fromJson(unescaped, ActionMessage)
		println(am)
	}	
}