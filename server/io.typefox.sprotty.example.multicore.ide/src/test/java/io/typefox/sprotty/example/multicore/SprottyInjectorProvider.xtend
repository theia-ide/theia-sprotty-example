package io.typefox.sprotty.example.multicore

import com.google.inject.Injector
import io.typefox.sprotty.example.multicore.ide.MulticoreAllocationIdeSetup
import org.eclipse.xtext.testing.IInjectorProvider

class SprottyInjectorProvider implements IInjectorProvider {
	
	Injector injector
	
	override getInjector() {
		if (injector === null) {
			injector = new MulticoreAllocationIdeSetup().createInjectorAndDoEMFRegistration() }
		return injector
	}
	
}