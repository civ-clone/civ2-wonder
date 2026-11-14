import { instance as availableCityBuildItemsRegistryInstance } from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import { wonderTypes } from './lib/wonderTable';

availableCityBuildItemsRegistryInstance.register(...wonderTypes);
