import * as React from 'react';
import { Text, View, ScrollView, Button, TextInput, Picker, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import fetchMovies from './api'

let params={},data={},numberOfResults=0

function HomeScreen({ navigation }) {
  const [ curParams, upd ] = React.useState({})
  const [ error, changeError ] = React.useState(0);
  const [ more, changeMore ] = React.useState(0);
  return (
    <View style={styles.view}>
      <Text>{error
      ? 'Please enter a valid movie title'
      : 'Enter a movie title to search for'}</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => upd({...curParams, title: text})}
        value={curParams.title}
      />
      <Button
        title="Search"
        onPress={() => {
          if (curParams.title) {
            data = {}
            params = curParams
            numberOfResults = 0
            navigation.push('Results', {page: 1});
            changeError(0)
          }
          else {
            changeError(1)
          }
        }}
      />
      <Button
        title="More options"
        onPress={() => {
          changeMore(!more)
        }}
      />
      {!!more && [
      <Text>{'Year'}</Text>,
      <TextInput
        style={styles.input}
        onChangeText={text => upd({...curParams, year: text})}
        value={curParams.year}
      />,
      <Text>{'Type'}</Text>,
      <Picker
        selectedValue={curParams.type}
        style={[
          styles.picker,
        ]}
        onValueChange={(itemValue, itemIndex) => 
          upd({...curParams, type: itemValue})
        }>
        <Picker.Item label="All" value="" />
        <Picker.Item label="Movie" value="movie" />
        <Picker.Item label="Series" value="series" />
        <Picker.Item label="Episode" value="episode" />
      </Picker>,
      ]}
    </View>
  );
}

function generateResult(navigation, page) {
  return (title) => {
    return [
      <Image style={styles.poster}
        source={{uri: (data[page][title].Poster === "N/A" ? "https://www.freeiconspng.com/uploads/no-image-icon-15.png" : data[page][title].Poster)}}
      />,
      <Text>{title}</Text>,
      <Text>{"Year: " + data[page][title].Year}</Text>,
      <Text>{"Type: " + ((str) => str.charAt(0).toUpperCase() + str.slice(1))(data[page][title].Type)}</Text>,
      <Text>{"IMDB ID: " + data[page][title].imdbID}</Text>
    ]
  }
}

function ResultsScreen({ route, navigation }) {
  const { page } = route.params
  const [ error, changeError ] = React.useState(0);
  const [ loaded, load ] = React.useState(!!data[page]);
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: (() => (
        <Button onPress={()=>navigation.goBack()} title="Back"/>
      )),
      headerRight: loaded && !error && page*10 < numberOfResults && (() => (
        <Button onPress={() => {
          navigation.push('Results', {page: page + 1})
        }} title="Next"/>
      )),
      headerTitle: numberOfResults ? <Text>{`Page ${page} of ${Math.ceil(numberOfResults / 10)}`}</Text> : ''
    }, [navigation, page]);
  });
  if (!data[page]) {
    (async () => {
      const res = await fetchMovies(params, page)
      if (res.hasOwnProperty('error')) {
        changeError(res.error)
      }
      else {
        data[page] = res.results
        numberOfResults = res.number
      }
      load(1)
    })()
  }
  if (loaded) {
    if (!error) {
      return (
        <ScrollView>
          {Object.keys(data[page]).map(generateResult(navigation, page))}
        </ScrollView>
      );
    }
    else {
      return (
        <View style={styles.view}>
          <Text>{"Error: " + error}</Text>
        </View>
      )
    }
  }
  else {
    return (
      <View style={styles.view}>
        <Text>Loading...</Text>
      </View>
    )
  }
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Results" component={ResultsScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  picker: {
    height: 50,
    width: 200
  },
  input: { 
    height: 40, 
    width: 200,
    borderColor: 'gray', 
    borderWidth: 1 
  },
  view: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  poster: {
    width: 100,
    height: 100,
  },
});