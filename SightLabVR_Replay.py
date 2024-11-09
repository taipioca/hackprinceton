import viz
import vizfx
from sightlab_utils import replay as Replay
from sightlab_utils.replay_settings import *

if Replay.VIZCONNECT_CONFIG == 'Desktop':
	replay = Replay.SightLabReplay()
else:
	replay = Replay.SightLabReplay(noiseFilter = True)