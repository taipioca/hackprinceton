import sightlab_utils.sightlab as sl
from sightlab_utils.settings import *

#Setup SightLab Options
sightlab = sl.SightLab(gui = False)

#Setup Environment
env = vizfx.addChild('sightlab_resources/environments/dojo2.osgb')
sightlab.setEnvironment(env)

#set number of trials
sightlab.setTrialCount(3)

#add objects of interest
basketball = env.getChild('basketball')
sightlab.addSceneObject('basketball',basketball,gaze = True, grab = True)

def sightLabExperiment():
	while True:
		yield viztask.waitKeyDown(' ')
		yield sightlab.startTrial()

		yield viztask.waitKeyDown(' ')
		yield sightlab.endTrial()

viztask.schedule(sightlab.runExperiment)
viztask.schedule(sightLabExperiment)
viz.callback(viz.getEventID('ResetPosition'), sightlab.resetViewPoint)