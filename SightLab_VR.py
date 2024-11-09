import sightlab_utils.sightlab as sl
from sightlab_utils.settings import *

sightlab = sl.SightLab()

def sightLabExperiment(): 
	yield viztask.waitEvent(EXPERIMENT_START)
	viz.callback(viz.getEventID('ResetPosition'), sightlab.resetViewPoint)
	
	for trial in range(sightlab.getTrialCount()):
		yield viztask.waitEvent(TRIAL_START)
		
		yield viztask.waitEvent(TRIAL_END)

viztask.schedule(sightlab.runExperiment)
viztask.schedule(sightLabExperiment)